# AeroRAG AI Engine — Python Flask, RAG & Vision Analysis Pipeline

The **AeroRAG AI Engine** is a high-performance Python microservice built with **Flask**, **LangChain**, **ChromaDB**, **OpenCV**, and the **Google Gemini Pro API**. It executes Retrieval-Augmented Generation (RAG), vector similarity search, document summarization, contract deadline extraction, multi-modal image inspection, and electrical circuit blueprint analysis.

---

## 🏗 Architecture & Modules

* **RAG Retrieval Engine**: Chunks uploaded documents into text blocks, generates high-dimensional embeddings, stores them in persistent **ChromaDB** vector collections, and executes similarity search.
* **Concurrency Protection**: Embeddings initialization and vector collection access are guarded by Python `threading.Lock()` to prevent race conditions in multi-threaded Flask execution environments.
* **Computer Vision Pipeline**: OpenCV and image processing tools inspect uploaded blueprint diagrams, identifying electrical components, Op-Amps, signal terminals, VCC (+5V), and GND paths.
* **Contract OCR & Deadline Extractor**: Parses agreement text and scanned contract blocks to extract milestone deadlines, expiration dates, and actionable task items into structured JSON lists.

---

## 📁 Subsystem Folder Structure

```
ai-engine/
├── api/                        # Flask Blueprint Controllers
│   ├── chat.py                 # RAG document chat endpoints
│   ├── circuit.py              # Electrical circuit diagram analysis endpoint
│   ├── deadlines.py            # Contract deadline extraction endpoint
│   ├── image.py                # Multi-modal image analysis endpoint
│   ├── search.py               # Vector semantic search endpoint
│   └── summary.py              # AI text summarization endpoint
├── core/                       # AI Infrastructure & RAG Pipeline
│   ├── embedding.py            # Thread-safe ChromaDB embedding singleton & store
│   ├── model.py                # LLM model wrapper (Gemini Pro / LangChain)
│   └── rag.py                  # Core RAG retrieval logic & prompt templates
├── services/                   # Business Services
│   ├── circuit_service.py      # Vision processing for circuit blueprints
│   ├── deadline_service.py     # Regex & OCR contract date extraction logic
│   ├── document_service.py     # PDF text extraction & chunk parsing
│   └── vision_service.py       # Image inspection service
├── uploads/                    # Temporary local storage for image/PDF processing
├── vectordb/                   # Persistent ChromaDB vector database directory
├── app.py                      # Flask application entrypoint & Blueprint registration
├── config.py                   # Centralized Python environment configuration
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Python 3.10 multi-stage production container build
├── .env.example                # Environment variable template
└── README.md                   # AI Engine documentation (This file)
```

---

## 🔑 Environment Variables

The AI Engine requires environment variables configured in `ai-engine/.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `FLASK_HOST` | `0.0.0.0` | Host interface address |
| `FLASK_PORT` | `5000` | Port for Flask service |
| `GEMINI_API_KEY` | *(Required)* | Google Gemini Pro API Key for LLM reasoning & multi-modal analysis |
| `VECTOR_DB_PATH` | `./vectordb` | Directory for persistent ChromaDB store |
| `UPLOAD_FOLDER` | `./uploads` | Temporary upload folder for file processing |

---

## 🛰 REST API Endpoints Overview

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | RAG Contextual Q&A | `{ "query": "string", "doc_id": "string" }` |
| `POST` | `/api/ai/summarize` | AI Document Summarizer | `{ "text": "string", "file_path": "string" }` |
| `POST` | `/api/ai/search` | Vector Semantic Search | `{ "query": "string", "top_k": 5 }` |
| `POST` | `/api/ai/deadlines` | Extract Contract Deadlines | `{ "file_path": "string" }` |
| `POST` | `/api/ai/analyze-image` | Multi-Modal Image Analysis | `multipart/form-data` (`file`) |
| `POST` | `/api/ai/analyze-circuit` | Circuit Schematic Analysis | `multipart/form-data` (`file`) |

---

## 🛠 Local Execution Instructions

### Prerequisites
* **Python**: Python 3.10 or higher
* **pip**: Python package installer

### Steps
1. Navigate to `ai-engine` directory:
   ```bash
   cd ai-engine
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Linux / macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set environment file:
   ```bash
   cp .env.example .env
   # Edit .env and insert your GEMINI_API_KEY
   ```
5. Run Flask AI Engine:
   ```bash
   python app.py
   ```
*AI Engine starts on `http://localhost:5000`.*

---

## 🐳 Docker Deployment

Multi-stage containerization using `python:3.10-slim`:

```bash
docker build -t aerorag-ai-engine .
docker run -d -p 5000:5000 -e GEMINI_API_KEY="your_api_key" --name aerorag-ai-engine-container aerorag-ai-engine
```
