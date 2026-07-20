# Python 3.10 Slim Base Image
FROM python:3.10-slim

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (Tesseract OCR, OpenCV graphics libs, GCC compiler)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt-get/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create runtime directories for uploads and ChromaDB persistence
RUN mkdir -p /app/uploads /app/vectordb/chroma_db

# Copy Python application code
COPY app.py config.py ./
COPY api/ ./api/
COPY core/ ./core/
COPY services/ ./services/

EXPOSE 5000

# Health check to ensure service is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

CMD ["python", "app.py"]
