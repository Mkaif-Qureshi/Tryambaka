import os
import requests
from flask import Blueprint, request, jsonify
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# IPFS Routes
ipfs_bp = Blueprint('ipfs', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")
PINATA_BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

def upload_to_pinata(file_path):
    headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET
    }
    
    with open(file_path, 'rb') as file:
        response = requests.post(PINATA_BASE_URL, headers=headers, files={'file': file})

    if response.status_code == 200:
        return response.json().get('IpfsHash')
    else:
        raise Exception(f"Failed to upload to Pinata: {response.text}")

@ipfs_bp.route('/upload_ipfs', methods=['POST'])
def upload_file_ipfs():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        ipfs_hash = upload_to_pinata(file_path)
        return jsonify({"ipfs_hash": ipfs_hash})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
