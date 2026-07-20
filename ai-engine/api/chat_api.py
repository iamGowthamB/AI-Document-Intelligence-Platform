import os
import uuid
import json
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from config import Config
from services import rag_text

chat_blueprint = Blueprint("chat_api", __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'csv', 'xlsx', 'xls', 'txt'}

def is_allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@chat_blueprint.route("/ingest", methods=["POST"])
def ingest():
    """
    POST /api/ingest
    Expects multipart form-data:
      - 'file': The file to index
      - 'document_id': (optional)
      - 'department_id': (optional)
      - 'owner_id': (optional)
    """
    if "file" not in request.files:
        return jsonify({
            "status": "error",
            "message": "Missing file upload under the key 'file'."
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

    document_id = request.form.get("document_id")
    department_id = request.form.get("department_id")
    owner_id = request.form.get("owner_id")

    try:
        filename = secure_filename(file.filename)
        unique_prefix = str(uuid.uuid4())
        filename = f"{unique_prefix}_{filename}"
        file_path = os.path.join(Config.UPLOADS_FOLDER, filename)
        file.save(file_path)
        
        metadata = {}
        if document_id:
            metadata["document_id"] = document_id
        if department_id:
            metadata["department_id"] = department_id
        if owner_id:
            metadata["owner_id"] = owner_id
            
        # Ingest the file
        rag_text.ingest_document(file_path, filename, metadata=metadata)
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "message": "Document successfully ingested and indexed."
        }), 200
        
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to ingest document: {str(e)}"
        }), 500

@chat_blueprint.route("/chat", methods=["POST"])
def chat():
    """
    POST /api/chat
    Request types:
      - JSON: {"question": "...", "filter": {...}}
      - Multipart Form: Form fields 'question' (text), optional 'file' (file upload), and optional 'filter'.
    """
    question = None
    file_uploaded = False
    filter_dict = None
    
    # 1. Parse question, filter, and file based on Request type
    if request.is_json:
        data = request.get_json()
        question = data.get("question")
        filter_dict = data.get("filter")
    else:
        question = request.form.get("question")
        raw_filter = request.form.get("filter")
        if raw_filter:
            try:
                filter_dict = json.loads(raw_filter)
            except Exception:
                filter_dict = None
                
        # Fallback to individual form parameters if filter JSON is not present
        if not filter_dict:
            dept_id = request.form.get("department_id")
            doc_id = request.form.get("document_id")
            filter_dict = {}
            if dept_id:
                filter_dict["department_id"] = dept_id
            if doc_id:
                filter_dict["document_id"] = doc_id
            if not filter_dict:
                filter_dict = None
        
        # Check if a file is included in the multipart request
        if "file" in request.files:
            file = request.files["file"]
            if file and file.filename != "":
                if not is_allowed_file(file.filename):
                    return jsonify({
                        "status": "error",
                        "message": f"Unsupported file type. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"
                    }), 400
                    
                filename = secure_filename(file.filename)
                unique_prefix = str(uuid.uuid4())
                filename = f"{unique_prefix}_{filename}"
                file_path = os.path.join(Config.UPLOADS_FOLDER, filename)
                file.save(file_path)
                file_uploaded = True
                
                # Ingest the file dynamically
                dept_id = request.form.get("department_id")
                doc_id = request.form.get("document_id")
                owner_id = request.form.get("owner_id")
                
                metadata = {}
                if dept_id:
                    metadata["department_id"] = dept_id
                if doc_id:
                    metadata["document_id"] = doc_id
                if owner_id:
                    metadata["owner_id"] = owner_id
                    
                try:
                    rag_text.ingest_document(file_path, filename, metadata=metadata)
                except ValueError as e:
                    return jsonify({
                        "status": "error",
                        "message": str(e)
                    }), 400
                except Exception as e:
                    return jsonify({
                        "status": "error",
                        "message": f"Failed to ingest document: {str(e)}"
                    }), 500

    if not question:
        return jsonify({
            "status": "error",
            "message": "Missing required parameter: 'question'"
        }), 400

    # 2. Query documents and return answer
    try:
        answer = rag_text.query_documents(question, filter_dict=filter_dict)
        return jsonify({
            "status": "success",
            "answer": answer,
            "file_indexed": file_uploaded
        }), 200
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Query execution failed: {str(e)}"
        }), 500

@chat_blueprint.route("/search", methods=["POST"])
def search():
    """
    POST /api/search
    JSON: {"query": "...", "filter": {...}}
    """
    data = request.get_json() if request.is_json else {}
    query = data.get("query") or request.form.get("query")
    filter_dict = data.get("filter")
    
    if not filter_dict:
        dept_id = request.form.get("department_id")
        doc_id = request.form.get("document_id")
        filter_dict = {}
        if dept_id:
            filter_dict["department_id"] = dept_id
        if doc_id:
            filter_dict["document_id"] = doc_id
        if not filter_dict:
            filter_dict = None

    if not query:
        return jsonify({
            "status": "error",
            "message": "Missing required parameter: 'query'"
        }), 400

    try:
        results = rag_text.semantic_search(query, filter_dict=filter_dict)
        return jsonify({
            "status": "success",
            "results": results
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Semantic search failed: {str(e)}"
        }), 500
