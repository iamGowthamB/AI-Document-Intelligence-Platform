import threading
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document as LangChainDocument
from core.embedding import get_embedding_model
from config import Config

_vectorstore_instance = None
_vectorstore_lock = threading.Lock()

def get_vector_store() -> Chroma:
    """
    Returns a shared, lazily initialized Chroma vector store instance.
    """
    global _vectorstore_instance
    if _vectorstore_instance is None:
        with _vectorstore_lock:
            if _vectorstore_instance is None:
                embeddings = get_embedding_model()
                print(f"Initializing Chroma vector store at {Config.VECTORDB_DIR}...")
                _vectorstore_instance = Chroma(
                    persist_directory=Config.VECTORDB_DIR,
                    embedding_function=embeddings
                )
    return _vectorstore_instance

def add_documents_to_store(docs: List[LangChainDocument]):
    """
    Adds LangChain documents to the Chroma vector store and persists changes.
    """
    db = get_vector_store()
    db.add_documents(docs)
    # Chroma handles persistence automatically in newer versions, but we call persist() if available
    if hasattr(db, "persist"):
        db.persist()
    print(f"Successfully added and persisted {len(docs)} document chunks to the vector store.")

def get_retriever(k: int = 4, filter: dict = None):
    """
    Returns a retriever interface from the Chroma vector store, optionally filtered by metadata.
    """
    db = get_vector_store()
    search_kwargs = {"k": k}
    if filter:
        search_kwargs["filter"] = filter
    return db.as_retriever(search_kwargs=search_kwargs)
