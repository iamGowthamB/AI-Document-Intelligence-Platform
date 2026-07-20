# Technical Audit: Production Issues & Flaws

This document summarizes the remaining production-level issues, architectural flaws, security risks, and performance concerns identified in the Flask AI Engine, ignoring document retention.

---

## 1. Cross-User Data Leakage (Severe Security Flaw)

* **Location**: `services/rag_text.py` (`query_documents` & `ingest_document`) and `core/vector_store.py`
* **Vulnerability**: Chroma DB uses a single shared collection. There is no session or user-level segmentation. If User A uploads `confidential_salary.docx` and User B calls `POST /api/chat` asking *"What is the salary structure?"*, the retriever will query the shared vector store and return User A's text chunks to User B.
* **Recommended Fix**: Add a `user_id` or `session_id` to document chunk metadata during ingestion, and pass a metadata filter (e.g., `filter={"user_id": user_id}`) to the retriever during Q&A:
  ```python
  # In core/vector_store.py
  def get_retriever(user_id: str, k: int = 4):
      return db.as_retriever(search_kwargs={"k": k, "filter": {"user_id": user_id}})
  ```

---

## 2. Filename Collision and Race Overwrites (Security & Consistency Risk)

* **Location**: All files in the `api/` directory (`chat_api.py`, `summary_api.py`, etc.)
* **Vulnerability**: Uploads are saved using `secure_filename(file.filename)` directly inside the shared `uploads/` folder. If two users concurrently upload a file with the same name (e.g., `report.pdf`), one will silently overwrite the other. A user querying the system shortly after will get answers based on another user's uploaded file.
* **Recommended Fix**: Generate a unique directory or filename prefix (using `uuid.uuid4()`) for every incoming request:
  ```python
  import uuid
  unique_prefix = str(uuid.uuid4())
  filename = f"{unique_prefix}_{secure_filename(file.filename)}"
  ```

---

## 3. Save-Before-Validate Extension Vulnerability (Security Risk)

* **Location**: All files in the `api/` directory
* **Vulnerability**: Endpoints save uploaded files to the filesystem *before* validating if the file extension or MIME-type is supported. If an attacker uploads a large malicious script or binary, it is written to disk immediately. Only after writing to disk does `document_loader.py` raise a `ValueError` and trigger request termination.
* **Recommended Fix**: Implement a pre-save check using an allowed extensions helper:
  ```python
  ALLOWED_EXTENSIONS = {'pdf', 'docx', 'csv', 'xlsx', 'xls', 'txt', 'png', 'jpg', 'jpeg'}
  def is_allowed_file(filename):
      return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
  ```
  Check `is_allowed_file(file.filename)` and return `400` *before* calling `file.save()`.

---

## 4. Non-Thread-Safe Singletons (Concurrency Risk)

* **Location**: `core/vector_store.py` (`get_vector_store`), `core/embedding.py` (`get_embedding_model`), and `core/llm.py` (`get_qwen_model_and_processor`)
* **Vulnerability**: Flask is multi-threaded by default in production. The singleton getters lazily instantiate heavy components using `if _instance is None:` checks without thread locking. If multiple requests hit the server concurrently on startup, they will execute the initialization block simultaneously. This will cause SQLite database locks, double-loading of models in RAM, or thread blockages.
* **Recommended Fix**: Use python's `threading.Lock` to guarantee safe initialization:
  ```python
  import threading
  _db_lock = threading.Lock()
  
  def get_vector_store():
      global _vectorstore_instance
      with _db_lock:
          if _vectorstore_instance is None:
              # Initialize safely
  ```

---

## 5. Concurrent GPU VRAM Contention and Out-Of-Memory Crash (Performance Risk)

* **Location**: `core/llm.py` (`ask_qwen_local` & `get_qwen_model_and_processor`)
* **Vulnerability**: The local multimodal Qwen model requires significant VRAM (6-8 GB). If two users upload circuit diagrams simultaneously, both threads will attempt to run inferences (`model.generate`) on the same GPU concurrently. This will exceed VRAM boundaries and cause the server process to crash with a CUDA Out-Of-Memory (OOM) error.
* **Recommended Fix**: Serialize all GPU inferences by wrapping local model calls in a mutex lock:
  ```python
  _gpu_lock = threading.Lock()
  
  def ask_qwen_local(question: str, image: Image.Image) -> str:
      with _gpu_lock:
          # Run model inference sequentially
  ```
