# Enterprise Production Deployment Guide — AeroRAG

This document provides complete instructions for deploying the **AeroRAG Intelligent Document Management and Knowledge Retrieval System** in production environments using **Docker** and **Docker Compose**.

---

## 🏛 Architecture Overview

The production deployment consists of four containerized services orchestrated within an isolated bridge network (`rag-network`):

```
+-----------------------------------------------------------------------------+
|                                Docker Host                                  |
|                                                                             |
|  +-------------------+      +-------------------+     +------------------+  |
|  |     Frontend      |      |      Backend      |     |    AI Engine     |  |
|  |   (Nginx Alpine)  | <--> |  (OpenJDK 17 JRE) | <-> |  (Python 3.10)   |  |
|  |   Port 5173/80    |      |     Port 8080     |     |    Port 5000     |  |
|  +-------------------+      +-------------------+     +------------------+  |
|                                       |                        |            |
|                                       v                        v            |
|                             +-------------------+     +------------------+  |
|                             |  MySQL 8.0 Server |     | ChromaDB Vector  |  |
|                             |     Port 3306     |     |   Volume Storage |  |
|                             +-------------------+     +------------------+  |
+-----------------------------------------------------------------------------+
```

---

## 📋 System Requirements

### Hardware Requirements
* **CPU**: 4 vCPUs or higher (8 vCPUs recommended for concurrent AI processing)
* **RAM**: 8 GB minimum (16 GB recommended)
* **Disk Storage**: 50 GB SSD storage minimum (for document files and vector database)

### Software Requirements
* **OS**: Ubuntu 22.04 LTS / Debian 12 / RHEL 9 / Windows Server 2022
* **Docker Engine**: v24.0+ installed
* **Docker Compose**: v2.20+ installed

---

## ⚙️ Environment Configuration

Before launching the containerized stack, create the root `.env` file from `.env.example`:

```bash
cd RAG
cp .env.example .env
```

### Production `.env` Specification

```ini
# MySQL Configuration
SPRING_DATASOURCE_PASSWORD=your_secure_production_db_password

# AI Engine Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Security Configuration
JWT_SECRET=your_secure_base64_encoded_jwt_secret_here
```

> ⚠️ **CRITICAL SECURITY NOTE**: Never commit `.env` files to Git repositories. Always store production keys securely in secret managers (e.g. AWS Secrets Manager, HashiCorp Vault, or GitHub Secrets).

---

## 🚀 Step-by-Step Deployment

### 1. Build and Start Services
Execute Docker Compose from the project root:

```bash
docker compose up --build -d
```

### 2. Verify Container Health
Check container status:

```bash
docker compose ps
```

All 4 services should report status `Up (healthy)`:

```text
NAME                     IMAGE                  COMMAND                  SERVICE      STATUS              PORTS
rag-db                   mysql:8.0              "docker-entrypoint.s…"   mysql        running (healthy)   0.0.0.0:3306->3306/tcp
rag-ai-engine            rag-ai-engine          "python app.py"          ai-engine    running (healthy)   0.0.0.0:5000->5000/tcp
rag-backend              rag-backend            "java -jar app.jar"      backend      running (healthy)   0.0.0.0:8080->8080/tcp
rag-frontend             rag-frontend           "/docker-entrypoint.…"   frontend     running (healthy)   0.0.0.0:5173->80/tcp
```

### 3. Service Access Endpoints

| Service | Protocol / Access | Host Port | Description |
| :--- | :--- | :--- | :--- |
| **Web Console** | `http://<HOST_IP>:5173` | `5173` | React Application Interface |
| **REST API** | `http://<HOST_IP>:8080` | `8080` | Spring Boot API & Swagger |
| **AI Microservice** | `http://<HOST_IP>:5000` | `5000` | Flask AI & RAG Engine |
| **Database** | `jdbc:mysql://<HOST_IP>:3306` | `3306` | MySQL Server |

---

## 💾 Docker Volumes & Persistence

The deployment defines four persistent Docker volumes to preserve database records, vector indexes, and uploaded files across container restarts:

```yaml
volumes:
  mysql_data:      # Preserves MySQL relational database records
  chroma_data:     # Preserves ChromaDB vector database index files
  ai_uploads:      # Preserves temporary files during AI extraction
  backend_uploads: # Preserves uploaded document binary files
```

---

## 🔧 Maintenance & Operational Commands

### View Logs
```bash
# View all logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f ai-engine
```

### Restart Services
```bash
docker compose restart backend
```

### Stop Services
```bash
# Stop containers without destroying persistent volumes
docker compose stop

# Stop containers and remove network
docker compose down
```

---

## 🔍 Troubleshooting & Common Errors

### 1. MySQL Connection Failure (`Access denied for user 'root'`)
* **Symptom**: Spring Boot container logs show `java.sql.SQLException: Access denied`.
* **Solution**: Ensure `SPRING_DATASOURCE_PASSWORD` in `.env` matches the `MYSQL_ROOT_PASSWORD` defined in `docker-compose.yml`.

### 2. AI Engine Missing API Key (`GEMINI_API_KEY`)
* **Symptom**: AI Chat or summarization endpoints return HTTP 500 error.
* **Solution**: Ensure `GEMINI_API_KEY` is set in `.env` and restart the AI container (`docker compose restart ai-engine`).

### 3. Port Conflicts
* **Symptom**: `Error starting userland proxy: listen tcp 0.0.0.0:8080: bind: address already in use`.
* **Solution**: Stop local services occupying ports `8080`, `5173`, `5000`, or `3306` before executing `docker compose up`.

---

## 🛡 Production Hardening Checklist

- [x] Externalized secrets into environment variables.
- [x] Configured healthchecks for all container services.
- [x] Set up persistent named volumes for MySQL and ChromaDB.
- [x] Configured thread safety in Flask embedding singleton.
- [x] Verified zero unhandled console or runtime JavaScript errors.
