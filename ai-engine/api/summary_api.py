import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services import rag_summary

summary_blueprint = Blueprint("summary_api", __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'csv', 'xlsx', 'xls', 'txt'}

def is_allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@summary_blueprint.route("/summarize", methods=["POST"])
def summarize():
    """
    POST /api/summarize
    Expects a multipart form-data upload containing a 'file'.
    """
    if "file" not in request.files:
        return jsonify({
            "status": "error",
            "message": "Missing file upload. Please provide a file under the key 'file'."
        }), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({
            "status": "error",
            "message": "Empty file uploaded."
        }), 400

    if not is_allowed_file(file.filename):
        return jsonify({
            "status": "error",
            "message": f"Unsupported file type. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        # Save file with unique prefix to uploads folder
        filename = secure_filename(file.filename)
        unique_prefix = str(uuid.uuid4())
        filename = f"{unique_prefix}_{filename}"
        file_path = os.path.join(Config.UPLOADS_FOLDER, filename)
        file.save(file_path)
        
        # Generate summary
        summary = rag_summary.summarize_document(file_path)
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "summary": summary
        }), 200
        
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Summarization failed: {str(e)}"
        }), 500
