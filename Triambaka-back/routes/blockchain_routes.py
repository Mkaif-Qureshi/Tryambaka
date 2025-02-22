import os
import json
from flask import Blueprint, request, jsonify
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

blockchain_bp = Blueprint('blockchain', __name__)

# Load environment variables
GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Connect to Blockchain
web3 = Web3(Web3.HTTPProvider(GANACHE_URL))

# Load ABI
with open("./routes/ContentRegistry_abi.json", 'r') as abi_file:
    abi = json.load(abi_file)

contract_address = Web3.to_checksum_address(CONTRACT_ADDRESS)
contract = web3.eth.contract(address=contract_address, abi=abi)

@blockchain_bp.route('/check_image_hash', methods=['GET'])
def check_image_hash():
    """Check if an image hash exists on the blockchain."""
    image_hash = request.args.get('image_hash')
    
    if not image_hash:
        return jsonify({"error": "Image hash required"}), 400

    try:
        exists = contract.functions.checkImageExists(image_hash).call()
        return jsonify({"exists": exists}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @blockchain_bp.route("/store_metadata", methods=["POST"])
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

@blockchain_bp.route("/store_metadata", methods=["POST"]) 
def store_file_metadata():
    """Receives a signed transaction from the frontend and sends it to the blockchain."""
    try:
        data = request.get_json()
        signed_tx = data.get("signed_tx")
        print("TX:", signed_tx)

        if not signed_tx:
            return jsonify({"error": "Signed transaction required"}), 400

        # Ensure signed_tx is a valid hex string
        if not signed_tx.startswith("0x"):
            return jsonify({"error": "Invalid signed transaction format"}), 400

        # Convert signed transaction to raw bytes correctly
        tx_hash = web3.eth.send_raw_transaction(bytes.fromhex(signed_tx[2:]))  # Strip "0x" before conversion
        
        return jsonify({"transaction_hash": tx_hash.hex()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route('/get_content', methods=['GET'])
def get_content():
    """Retrieve content metadata by content ID."""
    content_id = request.args.get('content_id')
    
    if not content_id:
        return jsonify({"error": "Content ID required"}), 400
    
    try:
        content_id = int(content_id)
        content = contract.functions.getContent(content_id).call()
        
        return jsonify({
            "owner": content[0],
            "ipfs_hash": content[1],
            "sha256_hash": content[2],
            "timestamp": content[3],
            "delta": content[4]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@blockchain_bp.route('/get_user_content', methods=['GET'])
def get_user_content():
    """Retrieve all content IDs registered by a specific user."""
    user_address = Web3.to_checksum_address(request.args.get('user_address'))

    if not user_address:
        return jsonify({"error": "User address required"}), 400

    try:
        content_ids = contract.functions.getUserContents(user_address).call()
        return jsonify({"content_ids": content_ids}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
