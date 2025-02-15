from flask import Flask
from flask_cors import CORS
from routes.watermark import watermark_bp
from routes.blockchain import blockchain_bp
from routes.verify import verify_bp

app = Flask(__name__)
app.config.from_object("config.Config")

# Enable CORS
CORS(app)

# Register blueprints (API routes)
app.register_blueprint(watermark_bp, url_prefix="/api/watermark")
app.register_blueprint(verify_bp, url_prefix="/api/watermark")
app.register_blueprint(blockchain_bp, url_prefix="/api/blockchain")


if __name__ == "__main__":
    app.run(debug=True)
