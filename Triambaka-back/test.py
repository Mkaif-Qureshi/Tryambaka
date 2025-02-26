# backup file

# @watermark_bp.route('/embed', methods=['POST'])
# def embed():
#     try:
#         if 'image' not in request.files:
#             return jsonify({"error": "No image file provided"}), 400
        
#         file = request.files['image']
#         if file.filename == '':
#             return jsonify({"error": "No selected image file"}), 400
        
#         # Hardcoded key and initial delta
#         key = 12345
#         delta = 7.25
        
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_input:
#             input_path = temp_input.name
#             file.save(input_path)

#         # Calculate hash of the original image
#         image_hash = calculate_image_hash(input_path)

#         # Step 1: Check if the image hash is already in the blockchain
#         blockchain_url = "http://127.0.0.1:5000/api/blockchain/check_image_hash"  # Adjust URL if needed
#         response = requests.get(blockchain_url, params={"image_hash": image_hash})

#         try:
#             response_data = response.json()
#         except requests.exceptions.JSONDecodeError:
#             os.remove(input_path)
#             return jsonify({"error": "Invalid response from blockchain API"}), 500

#         if response.status_code == 200 and response_data.get("exists", False):
#             os.remove(input_path)
#             return jsonify({"error": "Image hash already exists in blockchain"}), 400
        
#         elif response.status_code != 200:
#             os.remove(input_path)
#             return jsonify({"error": f"Blockchain lookup failed: {response_data}"}), 500

#         # Step 2: Check if the image is already watermarked
#         ber = extract_watermark(input_path, key, delta)
#         threshold = 0.3  # Adjust threshold based on testing
#         if ber < threshold:
#             os.remove(input_path)
#             return jsonify({"error": "Image is already watermarked"}), 400
        
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_output:
#             output_path = temp_output.name
        
#         # Step 3: Adjust delta until BER is below threshold
#         while ber >= threshold:
#             embed_watermark(input_path, output_path, key, delta)
#             new_ber = extract_watermark(output_path, key, delta)
#             if new_ber < threshold:
#                 break
#             delta += 0.25  # Increment delta for better embedding

#         # Calculate hash of the watermarked image
#         watermarked_hash = calculate_image_hash(output_path)
        
#         response = send_file(output_path, mimetype='image/png', as_attachment=True, download_name='watermarked.png')
#         response.headers['X-BER'] = str(new_ber)
#         response.headers['X-Image-Hash'] = watermarked_hash
#         response.headers['X-Delta'] = str(delta)
#         response.headers['Access-Control-Expose-Headers'] = 'X-BER, X-Image-Hash, X-Delta'

#         print(f"Final Delta: {delta}")
#         print(f"BER: {new_ber}")
#         print(f"Image Hash: {watermarked_hash}")
#         print(response.headers)

#         @after_this_request
#         def cleanup(response):
#             os.remove(input_path)
#             return response
        
#         return response
#     except Exception as e:
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# @watermark_bp.route('/check_image', methods=['POST'])
# def check_image():
#     try:
#         if 'image' not in request.files:
#             return jsonify({"error": "No image file provided"}), 400

#         file = request.files['image']
#         if file.filename == '':
#             return jsonify({"error": "No selected image file"}), 400

#         # key = os.getenv("WATERMARK_KEY")
#         key = 12345
#         delta = 7.25
#         threshold = 0.3

#         with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_input:
#             input_path = temp_input.name
#             file.save(input_path)

#         # Calculate hash of the input image
#         image_hash = calculate_image_hash(input_path)

#         # Step 1: Check if the image hash exists in the blockchain
#         blockchain_url = "http://127.0.0.1:5000/api/blockchain/check_image_hash"
#         response = requests.get(blockchain_url, params={"image_hash": image_hash})

#         try:
#             response_data = response.json()
#         except requests.exceptions.JSONDecodeError:
#             os.remove(input_path)
#             return jsonify({"error": "Invalid response from blockchain API"}), 500

#         hash_exists = response.status_code == 200 and response_data.get("exists", False)

#         # Step 2: Extract BER from the image
#         ber = extract_watermark(input_path, key, delta)
#         os.remove(input_path)  # Cleanup temporary file

#         # Determine result: true if image exists in blockchain and BER is below threshold
#         is_valid = hash_exists and ber < threshold

#         return jsonify({"valid": is_valid, "ber": ber, "hash_exists": hash_exists})
#     except Exception as e:
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# blockchain route file# @blockchain_bp.route("/store_metadata", methods=["POST"])
# def store_file_metadata():
#     """Receives a signed transaction from the frontend and sends it to the blockchain."""
#     try:
#         data = request.get_json()
#         signed_tx = data.get("signed_tx")
#         print("TX:", signed_tx)

#         if not signed_tx:
#             return jsonify({"error": "Signed transaction required"}), 400

#         # Ensure signed_tx is a valid hex string
#         if not signed_tx.startswith("0x"):
#             return jsonify({"error": "Invalid signed transaction format"}), 400

#         # Convert signed transaction to raw bytes correctly
#         tx_hash = web3.eth.send_raw_transaction(web3.to_bytes(hexstr=signed_tx))
        
#         return jsonify({"transaction_hash": tx_hash.hex()}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500