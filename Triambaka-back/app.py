from flask import Flask
from routes.watermark import watermark_bp
from routes.blockchain import blockchain_bp
from database import init_db

app = Flask(__name__)
app.config.from_object("config.Config")

# Initialize database
init_db(app)

# Register blueprints (API routes)
app.register_blueprint(watermark_bp, url_prefix="/api/watermark")
app.register_blueprint(blockchain_bp, url_prefix="/api/blockchain")

if __name__ == "__main__":
    app.run(debug=True)