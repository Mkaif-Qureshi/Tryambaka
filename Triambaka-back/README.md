# Triambaka Backend

Triambaka is a blockchain-powered watermarking system for digital content protection. This repository contains the backend implementation using Flask/FastAPI, integrating blind watermarking (DCT + QIM), cryptographic hashing (SHA-256), digital signatures (RSA/ECDSA), and blockchain (Ethereum/Polygon) for content authentication and ownership verification.

## Features

- **Watermark Embedding & Extraction**: Implements QIM in the DCT domain with scrambling and adaptive delta calculation.
- **Content Authentication**: Uses SHA-256 hashing and RSA/ECDSA signatures for verification.
- **Blockchain Integration**: Stores metadata and verification proofs on Ethereum/Polygon.
- **Decentralized Storage**: Utilizes IPFS for secure and tamper-proof storage.
- **BER Analysis**: Measures Bit Error Rate (BER) to assess watermark robustness.

## Tech Stack

- **Backend**: Flask
- **Database**: MongoDB
- **Blockchain**: Ethereum / Polygon
- **Storage**: IPFS
- **Security**: SHA-256

## Installation

### Prerequisites

- Python 3.9+
- MongoDB
- MetaMask (for blockchain transactions)
- IPFS daemon

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Mkaif-Qureshi/Tryambaka.git
   cd triambaka-back
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Create a `.env` file with:
   ```ini
   DATABASE_URL=your_database_url
   BLOCKCHAIN_RPC_URL=your_rpc_url
   PRIVATE_KEY=your_private_key
   IPFS_GATEWAY_URL=your_ipfs_gateway
   ```
5. Run the application:
   ```bash
   flask run   # If using Flask
   ```
