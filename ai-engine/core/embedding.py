import threading
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import Config

_embedding_instance = None
_embedding_lock = threading.Lock()

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    Returns a shared, lazily initialized instance of HuggingFaceEmbeddings.
    Thread-safe implementation ensuring the model is loaded into memory only once.
    """
    global _embedding_instance
    if _embedding_instance is None:
        with _embedding_lock:
            if _embedding_instance is None:
                print(f"Loading embedding model: {Config.EMBEDDING_MODEL_NAME}...")
                _embedding_instance = HuggingFaceEmbeddings(
                    model_name=Config.EMBEDDING_MODEL_NAME
                )
                print("Embedding model loaded successfully.")
    return _embedding_instance
