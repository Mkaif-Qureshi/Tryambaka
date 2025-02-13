
from flask import Blueprint, Flask, request, jsonify
import cv2
import numpy as np
from scipy.fftpack import dct, idct
import base64
import io
from PIL import Image

watermark_bp = Blueprint("watermark", __name__)

def scramble_watermark(watermark, perm_key):
    """
    Scrambles a 2D watermark using a permutation generated with perm_key.
    Returns the scrambled watermark and the permutation vector.
    """
    flat = watermark.flatten()
    np.random.seed(perm_key)
    perm = np.random.permutation(len(flat))
    scrambled_flat = flat[perm]
    scrambled = scrambled_flat.reshape(watermark.shape)
    return scrambled, perm

def generate_scrambled_watermark(shape, key, perm_offset=54321):
    """
    Generate an unsolved watermark using key, then scramble it using a permutation key derived from key.
    """
    np.random.seed(key)
    watermark = np.random.randint(0, 2, shape)
    perm_key = key + perm_offset  # Use a different seed for permutation
    scrambled, perm = scramble_watermark(watermark, perm_key)
    return watermark, scrambled, perm

def get_embed_positions(i, j, pos_key, num_positions=3):
    """
    For a given block (i, j), return a list of num_positions pseudorandom positions
    from an 8x8 block (excluding the DC coefficient at (0,0)).
    """
    # Create a candidate list of all indices except (0,0)
    candidates = [(a, b) for a in range(8) for b in range(8) if not (a == 0 and b == 0)]
    # Use a seed that depends on pos_key and the block indices for reproducibility.
    np.random.seed(pos_key + i * 1000 + j)
    chosen_indices = np.random.choice(len(candidates), num_positions, replace=False)
    positions = [candidates[k] for k in chosen_indices]
    return positions

# --- QIM embedding/extraction functions ---

def adaptive_delta(y_channel, factor=10, min_delta=2.0):
    contrast = np.std(y_channel)
    return max(contrast / factor, min_delta)

def qim_embed(coefficient, bit, delta):
    if bit == 0:
        return np.round(coefficient / delta) * delta
    else:
        return np.round((coefficient - delta/2) / delta) * delta + delta/2

def qim_extract(coefficient, delta):
    q0 = np.round(coefficient / delta) * delta
    q1 = q0 + delta/2
    return 0 if abs(coefficient - q0) < abs(coefficient - q1) else 1

# --- Main processing function ---

def process_frame(frame, key, delta=None, mode='embed'):
    """
    Processes an image frame to either embed or extract a watermark.
    The watermark bits are first scrambled using a secret permutation.
    For each 8x8 block, pseudorandom embedding positions (key-dependent) are chosen.
    """
    # Convert image to YCrCb color space and split channels
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    
    if delta is None:
        delta = adaptive_delta(y)
    
    h, w = y.shape
    pad_h = (8 - h % 8) % 8
    pad_w = (8 - w % 8) % 8
    y_padded = cv2.copyMakeBorder(y, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    
    num_blocks_h = y_padded.shape[0] // 8
    num_blocks_w = y_padded.shape[1] // 8

    # --- Generate (and scramble) watermark ---
    # Generate the original (unscrambled) watermark using key
    watermark_shape = (num_blocks_h, num_blocks_w)
    orig_watermark, scrambled_watermark, perm = generate_scrambled_watermark(watermark_shape, key, perm_offset=54321)
    # For embedding, we will embed the scrambled watermark bits.
    # In extraction, we will generate the expected scrambled watermark in the same way.
    expected_watermark = scrambled_watermark.copy()  # This is the secret watermark to be embedded/extracted
    
    # For additional key-based randomness in block positions:
    pos_key = key + 98765  # derived key for embedding positions

    # Prepare an empty array to hold the extracted scrambled watermark bits.
    extracted_scrambled_watermark = np.zeros_like(expected_watermark)
    
    # Process each 8x8 block.
    for i in range(num_blocks_h):
        for j in range(num_blocks_w):
            block = y_padded[i*8:(i+1)*8, j*8:(j+1)*8].astype(float)
            # Apply 2D DCT to block
            dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
            
            # Generate pseudorandom embedding positions for this block (same for embed/extract)
            embed_positions = get_embed_positions(i, j, pos_key, num_positions=3)
            
            if mode == 'embed':
                # Use the corresponding bit from the scrambled watermark.
                bit = expected_watermark[i, j]
                for pos in embed_positions:
                    dct_block[pos] = qim_embed(dct_block[pos], bit, delta)
            elif mode == 'extract':
                # Extract the bits from the selected positions.
                bits = [qim_extract(dct_block[pos], delta) for pos in embed_positions]
                # Use majority voting
                extracted_bit = int(round(np.mean(bits)))
                extracted_scrambled_watermark[i, j] = extracted_bit
            
            # Inverse 2D DCT to reconstruct the block
            idct_block = idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
            y_padded[i*8:(i+1)*8, j*8:(j+1)*8] = np.clip(idct_block, 0, 255)
    
    # Reconstruct the Y channel and convert back to BGR color space.
    y_processed = y_padded[:h, :w].astype(np.uint8)
    merged = cv2.merge([y_processed, cr, cb])
    final_frame = cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)
    
    # For extraction mode, we return the expected scrambled watermark (which you can compare with)
    if mode == 'embed':
        return final_frame, expected_watermark, None  # (None for extraction watermark)
    elif mode == 'extract':
        return final_frame, expected_watermark, extracted_scrambled_watermark

# --- High-level functions ---

def embed_watermark(input_path, output_path, key, delta=None):
    img = cv2.imread(input_path)
    watermarked_img, expected_wm, _ = process_frame(img, key, delta, mode='embed')
    cv2.imwrite(output_path, watermarked_img)
    # For debugging or record-keeping, you might want to store expected_wm securely.
    return expected_wm

def extract_watermark(input_path, key, delta=None):
    img = cv2.imread(input_path)
    _, expected_wm, extracted_wm = process_frame(img, key, delta, mode='extract')
    # Calculate BER between expected scrambled watermark and extracted scrambled watermark.
    ber = np.mean(expected_wm != extracted_wm)
    
    print("Expected (Scrambled) Watermark:")
    print(expected_wm)
    print("Extracted (Scrambled) Watermark:")
    print(extracted_wm)
    print(f"Bit Error Rate (BER): {ber:.4f}")
    
    return expected_wm, extracted_wm, ber

@watermark_bp.route('/embed', methods=['POST'])
def embed():
    data = request.json
    image_base64 = data['image']
    key = int(data['key'])  # Convert key to integer
    delta = float(data['delta'])  # Convert delta to float

    # Convert base64 image to OpenCV format
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data))
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Step 1: Check if the image is already watermarked
    _, expected_wm_extracted, extracted_wm = process_frame(frame, key, delta, mode='extract')
    ber = np.mean(expected_wm_extracted != extracted_wm)

    # Define a threshold for watermark detection
    watermark_threshold = 0.3  # Adjust this value based on your requirements

    if ber < watermark_threshold:
        # The image is already watermarked
        return jsonify({
            "error": "The image is already watermarked.",
            "BER": ber,
            "watermarked_image": None,
            "expected_watermark": None
        }), 400  # Return a 400 Bad Request status code

    # Step 2: If the image is not watermarked, proceed with embedding
    watermarked_img, expected_wm, _ = process_frame(frame, key, delta, mode='embed')

    # Convert the watermarked image to base64
    _, buffer = cv2.imencode('.jpg', watermarked_img)
    watermarked_image_base64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        "watermarked_image": watermarked_image_base64,
        "expected_watermark": expected_wm.tolist(),
        "BER": ber  # BER from the extraction check
    })