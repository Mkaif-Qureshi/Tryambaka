from flask import Blueprint, request, jsonify

blockchain_bp = Blueprint("blockchain", __name__)

@blockchain_bp.route("/store", methods=["POST"])
def store():
    data = request.json
    return jsonify({"transaction": "HI"}), 200

@blockchain_bp.route("/verify", methods=["POST"])
def verify():
    data = request.json
    return jsonify(data), 200
