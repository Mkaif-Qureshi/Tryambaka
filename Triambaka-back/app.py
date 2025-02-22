from flask import Flask
from flask_cors import CORS
from routes.watermark import watermark_bp
from routes.verify import verify_bp
from routes.ipfs_routes import ipfs_bp
from routes.blockchain_routes import blockchain_bp

app = Flask(__name__)
app.config.from_object("config.Config")

# Enable CORS
CORS(app)

# Register blueprints (API routes)
app.register_blueprint(watermark_bp, url_prefix="/api/watermark")
app.register_blueprint(verify_bp, url_prefix="/api/watermark")
app.register_blueprint(ipfs_bp, url_prefix="/api/ipfs")
app.register_blueprint(blockchain_bp, url_prefix="/api/blockchain")


if __name__ == "__main__":
    app.run(debug=True)
