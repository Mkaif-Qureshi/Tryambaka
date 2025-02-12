import cv2
import numpy as np
from scipy.fftpack import dct, idct

def adaptive_delta(y_channel, factor=10, min_delta=2.0):
    """
    Calculate an adaptive delta based on the contrast of the Y-channel.
    A higher contrast yields a larger delta. A minimum threshold is enforced.
    """
    contrast = np.std(y_channel)
    return max(contrast / factor, min_delta)

def qim_embed(coefficient, bit, delta):
    """
    QIM embedding:
      - If bit == 0, quantize the coefficient to the nearest multiple of delta.
      - If bit == 1, quantize with an offset (delta/2) so that the coefficient
        is closer to multiples of (delta + delta/2).
    """
    if bit == 0:
        return np.round(coefficient / delta) * delta
    else:
        return np.round((coefficient - delta/2) / delta) * delta + delta/2

def qim_extract(coefficient, delta):
    """
    QIM extraction:
      Compare the distance of the coefficient to the two quantization candidates.
      Return 0 if it is closer to a multiple of delta; otherwise return 1.
    """
    q0 = np.round(coefficient / delta) * delta
    # Candidate with offset delta/2
    q1 = q0 + delta/2
    # Choose the bit corresponding to the candidate that is closer
    return 0 if abs(coefficient - q0) < abs(coefficient - q1) else 1

def process_frame(frame, key, delta=None, mode='embed'):
    """
    Process a single frame (or image) for watermark embedding or extraction.
    
    Steps:
      1. Convert the frame to YCrCb color space (watermarking is done on the Y-channel).
      2. Pad the Y-channel so its dimensions are divisible by 8.
      3. Divide the image into 8x8 blocks.
      4. For each block, apply DCT.
         - For embedding: embed the watermark bit into several mid-frequency coefficients.
         - For extraction: extract bits from these coefficients and decide via majority vote.
      5. Apply the inverse DCT to reconstruct the block.
      6. Remove any padding and convert back to BGR.
    
    Parameters:
      frame : Input image (BGR).
      key   : An integer seed to generate a pseudo-random watermark.
      delta : Quantization step. If None, it is computed adaptively.
      mode  : 'embed' or 'extract'
    
    Returns:
      final_frame         : The processed frame (watermarked or used for extraction).
      watermark           : The originally generated watermark (per-block bits).
      extracted_watermark : The watermark extracted from the frame.
    """
    # Convert to YCrCb color space
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    
    # If no fixed delta is provided, compute an adaptive delta
    if delta is None:
        delta = adaptive_delta(y)
    
    h, w = y.shape
    # Pad Y-channel so that height and width are divisible by 8
    pad_h = (8 - h % 8) % 8
    pad_w = (8 - w % 8) % 8
    y_padded = cv2.copyMakeBorder(y, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    
    num_blocks_h = y_padded.shape[0] // 8
    num_blocks_w = y_padded.shape[1] // 8
    
    # Generate a binary watermark using a pseudo-random key
    np.random.seed(key)
    watermark = np.random.randint(0, 2, (num_blocks_h, num_blocks_w))
    
    # Prepare an array to store the extracted watermark (if extracting)
    extracted_watermark = np.zeros_like(watermark)
    
    # Define the positions in each 8x8 block (mid-frequency region) for watermark embedding
    embed_positions = [(2, 3), (3, 2), (3, 3)]
    
    # Process each 8x8 block
    for i in range(num_blocks_h):
        for j in range(num_blocks_w):
            # Extract the current block and convert to float
            block = y_padded[i*8:(i+1)*8, j*8:(j+1)*8].astype(float)
            # Apply 2D DCT (using orthogonal normalization)
            dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
            
            if mode == 'embed':
                bit = watermark[i, j]
                # Embed the watermark bit into multiple coefficients for redundancy
                for pos in embed_positions:
                    dct_block[pos] = qim_embed(dct_block[pos], bit, delta)
            elif mode == 'extract':
                # Extract bits from all designated positions and decide by majority vote
                bits = [qim_extract(dct_block[pos], delta) for pos in embed_positions]
                extracted_bit = int(round(np.mean(bits)))  # Majority vote
                extracted_watermark[i, j] = extracted_bit
            
            # Apply inverse 2D DCT to reconstruct the block
            idct_block = idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
            y_padded[i*8:(i+1)*8, j*8:(j+1)*8] = np.clip(idct_block, 0, 255)
    
    # Remove the padding
    y_processed = y_padded[:h, :w].astype(np.uint8)
    # Merge back with the chroma channels and convert to BGR color space
    merged = cv2.merge([y_processed, cr, cb])
    final_frame = cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)
    
    return final_frame, watermark, extracted_watermark

def embed_watermark(input_path, output_path, key, delta=None):
    """
    Embed a watermark into an image or video.
    
    Parameters:
      input_path  : Path to the input image/video.
      output_path : Path to save the watermarked output.
      key         : An integer seed used for generating the watermark.
      delta       : Quantization step for QIM. If None, adaptive delta is used.
    """
    # Check if the input is an image based on its file extension
    if input_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
        img = cv2.imread(input_path)
        watermarked_img, _, _ = process_frame(img, key, delta, mode='embed')
        cv2.imwrite(output_path, watermarked_img)
    else:
        # Assume input is a video file
        cap = cv2.VideoCapture(input_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            watermarked_frame, _, _ = process_frame(frame, key, delta, mode='embed')
            out.write(watermarked_frame)
        
        cap.release()
        out.release()

def extract_watermark(input_path, key, delta=None):
    """
    Extract the watermark from an image or video and compute the Bit Error Rate (BER).
    
    For images, the BER is computed by comparing the original and extracted watermark bits.
    For videos, the average BER over all frames is reported.
    
    Parameters:
      input_path : Path to the watermarked image/video.
      key        : The same integer seed used during embedding.
      delta      : The quantization step used during embedding.
    
    Returns:
      For images: (original_watermark, extracted_watermark, BER)
      For videos: Average BER (float)
    """
    if input_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
        img = cv2.imread(input_path)
        _, watermark, extracted_watermark = process_frame(img, key, delta, mode='extract')
        ber = np.mean(watermark != extracted_watermark)
        print(f'Image Bit Error Rate: {ber:.4f}')
        return watermark, extracted_watermark, ber
    else:
        cap = cv2.VideoCapture(input_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        ber_sum = 0
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            _, watermark, extracted_watermark = process_frame(frame, key, delta, mode='extract')
            ber = np.mean(watermark != extracted_watermark)
            ber_sum += ber
            frame_count += 1
        cap.release()
        
        avg_ber = ber_sum / frame_count if frame_count > 0 else 0
        print(f'Average Video Bit Error Rate: {avg_ber:.4f}')
        return avg_ber

import matplotlib.pyplot as plt

if __name__ == "__main__":
    # Example usage:
    input_image = 'input.png'         # Path to your input image
    watermarked_image = 'watermarked.png'  # Path where the watermarked image will be saved
    key = 12345                       # Pseudo-random key for watermark generation
    delta_value = 7.75                # Fixed quantization step (or set to None for adaptive delta)
    
    # Embed watermark into the image (or video)
    embed_watermark(input_image, watermarked_image, key, delta=delta_value)
    
    # Extract watermark and compute Bit Error Rate (BER)
    watermark, extracted_wm, ber = extract_watermark(watermarked_image, key, delta=delta_value)
    
    # Display the embedded watermark, extracted watermark, and error
    print("\nEmbedded Watermark:")
    print(watermark)
    
    print("\nExtracted Watermark:")
    print(extracted_wm)
    
    print(f"\nError (BER): {ber:.4f}")
    
    # Visualize the watermarks
    plt.figure(figsize=(10, 5))
    
    plt.subplot(1, 2, 1)
    plt.imshow(watermark, cmap='gray')
    plt.title("Embedded Watermark")
    
    plt.subplot(1, 2, 2)
    plt.imshow(extracted_wm, cmap='gray')
    plt.title("Extracted Watermark")
    
    plt.show()