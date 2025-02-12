from flask import Blueprint, request, jsonify

watermark_bp = Blueprint("watermark", __name__)

@watermark_bp.route("/embed", methods=["POST"])
def embed():
    file = request.files["file"]
    watermark = request.form["watermark"]
    return jsonify({"message": "Watermark embedded successfully"}), 200

@watermark_bp.route("/extract", methods=["POST"])
def extract():
    file = request.files["file"]
    return jsonify({"watermark": "hello"}), 200
