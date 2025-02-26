from flask import Blueprint, request, jsonify, send_file, after_this_request
import cv2
import numpy as np
from scipy.fftpack import dct, idct
import os
import tempfile
import logging
import hashlib
import requests

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


watermark_bp = Blueprint("watermark", __name__)

# Create a 'temp' directory in your project folder
temp_dir = os.path.join(os.getcwd(), 'temp')
os.makedirs(temp_dir, exist_ok=True)


def calculate_image_hash(image_path):
    """
    Calculates the SHA-256 hash of an image file.
    """
    hasher = hashlib.sha256()
    with open(image_path, 'rb') as img_file:
        while chunk := img_file.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


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
    pad_h, pad_w = (8 - h % 8) % 8, (8 - w % 8) % 8
    y_padded = cv2.copyMakeBorder(y, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)
    num_blocks_h, num_blocks_w = y_padded.shape[0] // 8, y_padded.shape[1] // 8
    
    # --- Generate (and scramble) watermark ---
    # Generate the original (unscrambled) watermark using key
    watermark_shape = (num_blocks_h, num_blocks_w)
    orig_watermark, scrambled_watermark, perm = generate_scrambled_watermark(watermark_shape, key)
    # For embedding, we will embed the scrambled watermark bits.
    # In extraction, we will generate the expected scrambled watermark in the same way.
    expected_watermark = scrambled_watermark.copy() # This is the secret watermark to be embedded/extracted
    
    # For additional key-based randomness in block positions:
    pos_key = key + 98765

    # Prepare an empty array to hold the extracted scrambled watermark bits.
    extracted_scrambled_watermark = np.zeros_like(expected_watermark)
    
    # Process each 8x8 block.
    for i in range(num_blocks_h):
        for j in range(num_blocks_w):
            block = y_padded[i*8:(i+1)*8, j*8:(j+1)*8].astype(float)
            # Apply 2D DCT to block
            dct_block = dct(dct(block.T, norm='ortho').T, norm='ortho')

            # Generate pseudorandom embedding positions for this block (same for embed/extract)
            embed_positions = [(a, b) for a in range(8) for b in range(8) if not (a == 0 and b == 0)]
            np.random.seed(pos_key + i * 1000 + j)
            chosen_indices = np.random.choice(len(embed_positions), 3, replace=False)
            positions = [embed_positions[k] for k in chosen_indices]
            
            if mode == 'embed':
                # Use the corresponding bit from the scrambled watermark.
                bit = expected_watermark[i, j]
                for pos in positions:
                    dct_block[pos] = qim_embed(dct_block[pos], bit, delta)
            elif mode == 'extract':
                # Extract the bits from the selected positions.
                bits = [qim_extract(dct_block[pos], delta) for pos in positions]
                # Use majority voting
                extracted_scrambled_watermark[i, j] = int(round(np.mean(bits)))
            
            # Inverse 2D DCT to reconstruct the block
            idct_block = idct(idct(dct_block.T, norm='ortho').T, norm='ortho')
            y_padded[i*8:(i+1)*8, j*8:(j+1)*8] = np.clip(idct_block, 0, 255)
    
    # Reconstruct the Y channel and convert back to BGR color space.
    y_processed = y_padded[:h, :w].astype(np.uint8)
    final_frame = cv2.cvtColor(cv2.merge([y_processed, cr, cb]), cv2.COLOR_YCrCb2BGR)
    
    # For extraction mode, we return the expected scrambled watermark (which you can compare with)
    return (final_frame, expected_watermark, None) if mode == 'embed' else (final_frame, expected_watermark, extracted_scrambled_watermark)

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
    return np.mean(expected_wm != extracted_wm)

@watermark_bp.route('/check_image', methods=['POST'])
def check_image():
    temp_input = None
    temp_output = None
    try:
        # Validate file input
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected image file"}), 400

        # Save the uploaded image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_input = temp_file.name
            file.save(temp_input)

        # Define constants
        key = 12345               # Must match the embedding key
        initial_delta = 7.25      # Starting delta value
        threshold = 0.3           # BER threshold for a valid watermark

        # --- Dynamic Delta Selection on Uploaded Image ---
        # This checks if the image is already watermarked.
        best_delta = initial_delta
        best_ber = extract_watermark(temp_input, key, initial_delta)
        max_iterations = 10  # Try up to 10 steps
        for i in range(max_iterations):
            candidate_delta = initial_delta + 0.25 * (i + 1)
            candidate_ber = extract_watermark(temp_input, key, candidate_delta)
            if candidate_ber < best_ber:
                best_ber = candidate_ber
                best_delta = candidate_delta

        # --- Determine if Image is Watermarked or Original ---
        if best_ber < threshold:
            # The image appears watermarked.
            # Compute the hash directly on the uploaded file.
            watermarked_hash = calculate_image_hash(temp_input)
            used_delta = best_delta
            final_ber = best_ber
        else:
            # The image is original.
            # Embed the watermark first, then compute the hash.
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_out:
                temp_output = temp_out.name

            delta = initial_delta
            ber = extract_watermark(temp_input, key, delta)
            # Adjust delta until the watermark BER falls below threshold.
            while ber >= threshold:
                embed_watermark(temp_input, temp_output, key, delta)
                new_ber = extract_watermark(temp_output, key, delta)
                if new_ber < threshold:
                    break
                delta += 0.25  # Increment delta for better embedding
                # Optionally, you might re-run embed_watermark here if needed.
                # For simplicity, we assume the first successful attempt is acceptable.
                ber = new_ber

            watermarked_hash = calculate_image_hash(temp_output)
            used_delta = delta
            final_ber = new_ber

        # --- Query the Blockchain using the Watermarked Image Hash ---
        blockchain_url = "http://127.0.0.1:5000/api/blockchain/check_image_hash"
        bc_response = requests.get(blockchain_url, params={"image_hash": watermarked_hash})
        try:
            bc_json = bc_response.json()
        except requests.exceptions.JSONDecodeError:
            return jsonify({"error": "Invalid response from blockchain API"}), 500

        if bc_response.status_code == 200 and bc_json.get("exists", False):
            blockchain_data = bc_json
        elif bc_response.status_code != 200:
            return jsonify({"error": f"Blockchain lookup failed: {bc_json}"}), 500
        else:
            blockchain_data = None

        is_watermarked = final_ber < threshold

        response_data = {
            "image_hash": watermarked_hash,
            "ber": float(final_ber),
            "delta": float(used_delta),
            "is_watermarked": bool(is_watermarked),
            "blockchain_data": blockchain_data,
            "message": "Image is Watermarked" if is_watermarked else "Original Image"
        }
        return jsonify(response_data), 200

    except Exception as e:
        logger.exception("Error in /check_image route")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        # Cleanup temporary files
        if temp_input and os.path.exists(temp_input):
            os.remove(temp_input)
        if temp_output and os.path.exists(temp_output):
            os.remove(temp_output)


@watermark_bp.route('/embed', methods=['POST'])
def embed():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected image file"}), 400
        
        # Hardcoded key and initial delta
        key = 12345
        delta = 7.25
        
        # Save the uploaded image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_input:
            input_path = temp_input.name
            file.save(input_path)

        # No blockchain or watermark-presence check; we simply proceed to embed.
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_output:
            output_path = temp_output.name
        
        # Set threshold for watermark BER
        threshold = 0.3
        
        # Step 1: Embed watermark using the initial delta
        embed_watermark(input_path, output_path, key, delta)
        new_ber = extract_watermark(output_path, key, delta)
        
        # Step 2: Adjust delta until BER is below threshold (or until max iterations)
        max_iterations = 10
        iterations = 0
        while new_ber >= threshold and iterations < max_iterations:
            delta += 0.25  # Increment delta for better embedding
            embed_watermark(input_path, output_path, key, delta)
            new_ber = extract_watermark(output_path, key, delta)
            iterations += 1

        # Calculate the hash of the watermarked image
        watermarked_hash = calculate_image_hash(output_path)
        
        response = send_file(
            output_path,
            mimetype='image/png',
            as_attachment=True,
            download_name='watermarked.png'
        )
        response.headers['X-BER'] = str(new_ber)
        response.headers['X-Image-Hash'] = watermarked_hash
        response.headers['X-Delta'] = str(delta)
        response.headers['Access-Control-Expose-Headers'] = 'X-BER, X-Image-Hash, X-Delta'

        print(f"Final Delta: {delta}")
        print(f"BER: {new_ber}")
        print(f"Image Hash: {watermarked_hash}")
        print(response.headers)

        @after_this_request
        def cleanup(response):
            if os.path.exists(input_path):
                os.remove(input_path)
            # if os.path.exists(output_path):
                # os.remove(output_path)
            return response
        
        return response
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
