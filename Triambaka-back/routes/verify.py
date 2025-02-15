from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import hashlib
import os
import tempfile
from .watermark import extract_watermark

verify_bp = Blueprint("verify", __name__)

def calculate_hash(image_path):
    """
    Calculate the SHA-256 hash of an image file.
    """
    hasher = hashlib.sha256()
    with open(image_path, 'rb') as f:
        hasher.update(f.read())
    return hasher.hexdigest()

@verify_bp.route('/verify', methods=['POST'])
def verify():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected image file"}), 400
        
        data = request.get_json(silent=True) or {}
        key = request.form.get('key') or data.get('key')
        delta = request.form.get('delta') or data.get('delta')
        
        if key is None or delta is None:
            return jsonify({"error": "Both 'key' and 'delta' are required"}), 400
        
        key, delta = int(key), float(delta)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_input:
            input_path = temp_input.name
            file.save(input_path)
        
        # Extract watermark and calculate BER
        ber = extract_watermark(input_path, key, delta)
        
        # Calculate hash of the image
        image_hash = calculate_hash(input_path)
        
        os.remove(input_path)  # Cleanup temporary file
        
        return jsonify({
            "ber": ber,
            "image_hash": image_hash
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
