import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Base paths
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # API Keys & Credentials
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-flask-secret-key-change-in-production")
    
    # Folder Configurations
    UPLOADS_FOLDER = os.getenv("UPLOADS_FOLDER", os.path.join(BASE_DIR, "uploads"))
    VECTORDB_DIR = os.getenv("VECTORDB_DIR", os.path.join(BASE_DIR, "vectordb", "chroma_db"))
    
    # Model Configurations
    TEXT_LLM_MODEL = os.getenv("TEXT_LLM_MODEL", "llama-3.3-70b-versatile")
    IMAGE_LLM_MODEL = os.getenv("IMAGE_LLM_MODEL", "gemini-2.5-flash")
    CIRCUIT_LLM_MODEL = os.getenv("CIRCUIT_LLM_MODEL", "Qwen/Qwen2.5-VL-3B-Instruct")
    EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    
    # Flask settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))  # Default 16 MB limit
    
    @classmethod
    def init_app(cls):
        """Create necessary directories if they do not exist."""
        os.makedirs(cls.UPLOADS_FOLDER, exist_ok=True)
        os.makedirs(os.path.dirname(cls.VECTORDB_DIR), exist_ok=True)

