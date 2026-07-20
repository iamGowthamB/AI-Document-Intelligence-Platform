import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services import rag_circuit

circuit_blueprint = Blueprint("circuit_api", __name__)

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def is_allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@circuit_blueprint.route("/circuit-analysis", methods=["POST"])
def circuit_analysis():
    """
    POST /api/circuit-analysis
    Expects form fields:
      - 'question': The prompt or question about the circuit (text)
      - 'file' or 'image': The uploaded circuit diagram image file
    """
    # 1. Parse and validate question
    question = request.form.get("question")
    if not question:
        return jsonify({
            "status": "error",
            "message": "Missing required field: 'question'"
        }), 400
        
    # 2. Check for uploaded file
    file = None
    if "file" in request.files:
        file = request.files["file"]
    elif "image" in request.files:
        file = request.files["image"]
        
    if not file or file.filename == "":
        return jsonify({
            "status": "error",
            "message": "Missing image upload. Please upload a circuit image under the key 'file' or 'image'."
        }), 400

    if not is_allowed_image(file.filename):
        return jsonify({
            "status": "error",
            "message": f"Unsupported image file type. Supported types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        }), 400

    try:
        # Save circuit image with unique prefix to uploads folder
        filename = secure_filename(file.filename)
        unique_prefix = str(uuid.uuid4())
        filename = f"{unique_prefix}_{filename}"
        file_path = os.path.join(Config.UPLOADS_FOLDER, filename)
        file.save(file_path)
        
        # Analyze circuit diagram using local Qwen model
        answer = rag_circuit.analyze_circuit(file_path, question)
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "answer": answer
        }), 200
        
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Circuit analysis failed: {str(e)}"
        }), 500
