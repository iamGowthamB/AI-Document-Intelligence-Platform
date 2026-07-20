from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

def create_app():
    # Initialize config and directories
    Config.init_app()
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS to allow communication from Spring Boot (or other clients)
    CORS(app)
    
    # Register API Blueprints under the '/api' prefix
    from api.chat_api import chat_blueprint
    from api.summary_api import summary_blueprint
    from api.deadline_api import deadline_blueprint
    from api.image_api import image_blueprint
    from api.circuit_api import circuit_blueprint
    
    app.register_blueprint(chat_blueprint, url_prefix="/api")
    app.register_blueprint(summary_blueprint, url_prefix="/api")
    app.register_blueprint(deadline_blueprint, url_prefix="/api")
    app.register_blueprint(image_blueprint, url_prefix="/api")
    app.register_blueprint(circuit_blueprint, url_prefix="/api")
    
    # Root Health Check / API Index
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "name": "AI-Powered Document Management & Knowledge Retrieval Engine (AI Engine)",
            "version": "1.0.0",
            "status": "running",
            "endpoints": [
                {"method": "POST", "path": "/api/chat", "desc": "Context-aware Document Q&A (RAG)"},
                {"method": "POST", "path": "/api/summarize", "desc": "Document Summarization"},
                {"method": "POST", "path": "/api/deadlines", "desc": "Deadline extraction and consolidation"},
                {"method": "POST", "path": "/api/image-analysis", "desc": "Standard image Q&A with OCR fallback"},
                {"method": "POST", "path": "/api/circuit-analysis", "desc": "Local circuit diagram explanation"}
            ]
        }), 200

    # Custom JSON error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "status": "error",
            "message": "Bad Request: " + str(error.description)
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Resource Not Found: " + str(error.description)
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "status": "error",
            "message": "Method Not Allowed: " + str(error.description)
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal Server Error. Please check server logs."
        }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    # Run server using configuration from environment
    app.run(host=Config.HOST, port=Config.PORT, debug=False, use_reloader=False)
