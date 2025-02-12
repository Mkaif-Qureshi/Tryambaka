import cv2
import numpy as np
from scipy.fftpack import dct, idct

def qim_embed(coefficient, bit, delta):
    if bit == 0:
        return np.round(coefficient / delta) * delta
    else:
        return np.round((coefficient - delta/2) / delta) * delta + delta/2

def qim_extract(coefficient, delta):
    q0 = np.round(coefficient / delta) * delta
    q1 = q0 + delta/2
    return 0 if abs(coefficient - q0) < abs(coefficient - q1) else 1

def process_frame(frame, key, delta, mode='embed'):
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    h, w = y.shape
    num_blocks_h = h // 8
    num_blocks_w = w // 8
    
    np.random.seed(key)
    watermark = np.random.randint(0, 2, (num_blocks_h, num_blocks_w))
    extracted_watermark = np.zeros_like(watermark)
    
    embed_positions = [(2, 3), (3, 2), (3, 3)]
    
    for i in range(num_blocks_h):
        for j in range(num_blocks_w):
            block = y[i*8:(i+1)*8, j*8:(j+1)*8].astype(float)
            dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
            
            if mode == 'embed':
                bit = watermark[i, j]
                for pos in embed_positions:
                    dct_block[pos] = qim_embed(dct_block[pos], bit, delta)
            elif mode == 'extract':
                bits = [qim_extract(dct_block[pos], delta) for pos in embed_positions]
                extracted_bit = int(round(np.mean(bits)))
                extracted_watermark[i, j] = extracted_bit
            
            idct_block = idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
            y[i*8:(i+1)*8, j*8:(j+1)*8] = np.clip(idct_block, 0, 255)
    
    y_processed = y.astype(np.uint8)
    merged = cv2.merge([y_processed, cr, cb])
    final_frame = cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)
    
    return final_frame, watermark, extracted_watermark

def find_best_delta(input_path, key):
    img = cv2.imread(input_path)
    delta = 2.0
    best_delta = None
    min_error = float('inf')
    
    while delta <= 10.0:
        watermarked_img, _, _ = process_frame(img, key, delta, mode='embed')
        _, watermark, extracted_wm = process_frame(watermarked_img, key, delta, mode='extract')
        ber = np.mean(watermark != extracted_wm)
        print(f'Delta: {delta:.2f}, Bit Error Rate: {ber:.4f}')
        
        if ber < min_error:
            min_error = ber
            best_delta = delta
        
        delta += 0.25
    
    print(f'Optimal Delta: {best_delta:.2f} with Bit Error Rate: {min_error:.4f}')

if __name__ == "__main__":
    input_image = 'input.png'
    key = 12345
    find_best_delta(input_image, key)
