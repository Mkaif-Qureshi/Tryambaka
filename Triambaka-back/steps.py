import cv2
import numpy as np
from scipy.fftpack import dct, idct
import matplotlib.pyplot as plt

# Helper functions (copied from your original code)
def scramble_watermark(watermark, perm_key):
    flat = watermark.flatten()
    np.random.seed(perm_key)
    perm = np.random.permutation(len(flat))
    scrambled_flat = flat[perm]
    scrambled = scrambled_flat.reshape(watermark.shape)
    return scrambled, perm

def generate_scrambled_watermark(shape, key, perm_offset=54321):
    np.random.seed(key)
    watermark = np.random.randint(0, 2, shape)
    perm_key = key + perm_offset
    scrambled, perm = scramble_watermark(watermark, perm_key)
    return watermark, scrambled, perm

def adaptive_delta(y_channel, factor=10, min_delta=2.0):
    contrast = np.std(y_channel)
    return max(contrast / factor, min_delta)

def qim_embed(coefficient, bit, delta):
    return np.round(coefficient / delta) * delta if bit == 0 else np.round((coefficient - delta/2) / delta) * delta + delta/2

def qim_extract(coefficient, delta):
    q0 = np.round(coefficient / delta) * delta
    q1 = q0 + delta/2
    return 0 if abs(coefficient - q0) < abs(coefficient - q1) else 1

# Load an image
input_path = "input_image.png"  # Replace with your image path
img = cv2.imread(input_path)
key = 12345  # Example key
delta = 5.0  # Example delta

# Step 1: Original Image
plt.figure(figsize=(6, 6))
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.title("1. Original Image")
plt.axis("off")
plt.show()

# Step 2: Convert to YCrCb Color Space
ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
plt.figure(figsize=(6, 6))
plt.imshow(cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB))
plt.title("2. YCrCb Color Space Image")
plt.axis("off")
plt.show()

# Step 3: Split Y, Cr, and Cb Channels
y, cr, cb = cv2.split(ycrcb)
plt.figure(figsize=(15, 5))
plt.subplot(1, 3, 1)
plt.imshow(y, cmap="gray")
plt.title("Y Channel")
plt.axis("off")
plt.subplot(1, 3, 2)
plt.imshow(cr, cmap="gray")
plt.title("Cr Channel")
plt.axis("off")
plt.subplot(1, 3, 3)
plt.imshow(cb, cmap="gray")
plt.title("Cb Channel")
plt.axis("off")
plt.show()

# Step 4: Padding of Y Channel to Make It Divisible by 8x8 Blocks
h, w = y.shape
pad_h, pad_w = (8 - h % 8) % 8, (8 - w % 8) % 8
y_padded = cv2.copyMakeBorder(y, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)

# Draw grid lines for 8x8 blocks
y_padded_with_grid = y_padded.copy()
for i in range(0, y_padded_with_grid.shape[0], 8):
    cv2.line(y_padded_with_grid, (0, i), (y_padded_with_grid.shape[1], i), (255, 0, 0), 1)
for j in range(0, y_padded_with_grid.shape[1], 8):
    cv2.line(y_padded_with_grid, (j, 0), (j, y_padded_with_grid.shape[0]), (255, 0, 0), 1)

plt.figure(figsize=(6, 6))
plt.imshow(y_padded_with_grid, cmap="gray")
plt.title("4. Y Channel with Padding and 8x8 Blocks")
plt.axis("off")
plt.show()

# Step 5: Generate a Scrambled Watermark
watermark_shape = (y_padded.shape[0] // 8, y_padded.shape[1] // 8)
orig_watermark, scrambled_watermark, _ = generate_scrambled_watermark(watermark_shape, key)
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.imshow(orig_watermark, cmap="gray")
plt.title("Original Watermark")
plt.axis("off")
plt.subplot(1, 2, 2)
plt.imshow(scrambled_watermark, cmap="gray")
plt.title("Scrambled Watermark")
plt.axis("off")
plt.show()

# Step 6: Apply 2D DCT to Each 8x8 Block
block = y_padded[0:8, 0:8].astype(float)
dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.imshow(block, cmap="gray")
plt.title("Original 8x8 Block")
plt.axis("off")
plt.subplot(1, 2, 2)
plt.imshow(np.log(abs(dct_block) + 1e-10), cmap="gray")  # Log scale for better visualization
plt.title("2D DCT of 8x8 Block")
plt.axis("off")
plt.show()

# Step 7: Embed Watermark Bits into Selected DCT Coefficients Using QIM
bit = scrambled_watermark[0, 0]  # Example bit
for pos in [(1, 1), (2, 2), (3, 3)]:  # Example positions
    dct_block[pos] = qim_embed(dct_block[pos], bit, delta)
plt.figure(figsize=(6, 6))
plt.imshow(np.log(abs(dct_block) + 1e-10), cmap="gray")
plt.title("7. DCT Block After Embedding Watermark")
plt.axis("off")
plt.show()

# Step 8: Apply Inverse 2D DCT to Reconstruct the Y Channel
idct_block = idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
plt.figure(figsize=(6, 6))
plt.imshow(idct_block, cmap="gray")
plt.title("8. Reconstructed 8x8 Block (Inverse DCT)")
plt.axis("off")
plt.show()

# Step 9: Merge Y, Cr, and Cb Channels and Convert Back to BGR
y_processed = y_padded[:h, :w].astype(np.uint8)
final_frame = cv2.cvtColor(cv2.merge([y_processed, cr, cb]), cv2.COLOR_YCrCb2BGR)
plt.figure(figsize=(6, 6))
plt.imshow(cv2.cvtColor(final_frame, cv2.COLOR_BGR2RGB))
plt.title("9. Merged YCrCb and Converted to BGR")
plt.axis("off")
plt.show()

# Step 10: Watermarked Image
plt.figure(figsize=(6, 6))
plt.imshow(cv2.cvtColor(final_frame, cv2.COLOR_BGR2RGB))
plt.title("10. Watermarked Image")
plt.axis("off")
plt.show()