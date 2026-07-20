import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services import rag_image

image_blueprint = Blueprint("image_api", __name__)

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def is_allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

@image_blueprint.route("/image-analysis", methods=["POST"])
def image_analysis():
    """
    POST /api/image-analysis
    Expects form fields:
      - 'question': The prompt or question about the image (text)
      - 'file' or 'image': The uploaded image file
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
            "message": "Missing image upload. Please upload an image under the key 'file' or 'image'."
        }), 400

    if not is_allowed_image(file.filename):
        return jsonify({
            "status": "error",
            "message": f"Unsupported image file type. Supported types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        }), 400

    try:
        # Save image file with unique prefix to uploads folder
        filename = secure_filename(file.filename)
        unique_prefix = str(uuid.uuid4())
        filename = f"{unique_prefix}_{filename}"
        file_path = os.path.join(Config.UPLOADS_FOLDER, filename)
        file.save(file_path)
        
        # Analyze image using OCR + Gemini
        answer = rag_image.analyze_image(file_path, question)
        
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
            "message": f"Image analysis failed: {str(e)}"
        }), 500
