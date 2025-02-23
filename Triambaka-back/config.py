import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Blockchain Configuration
    BLOCKCHAIN_URL = os.getenv("BLOCKCHAIN_URL", "http://127.0.0.1:7545")  # Default to Ganache
    CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
    CONTRACT_ABI_PATH = os.getenv("CONTRACT_ABI_PATH", "./routes/ContentRegistry_abi.json")

    # IPFS / Pinata Configuration
    PINATA_API_KEY = os.getenv("PINATA_API_KEY")
    PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")
    PINATA_BASE_URL = os.getenv("PINATA_BASE_URL", "https://api.pinata.cloud/pinning/pinFileToIPFS")

    # Upload Folder
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
