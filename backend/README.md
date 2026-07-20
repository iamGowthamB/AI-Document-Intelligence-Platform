# AeroRAG Backend — Spring Boot REST API & Governance Engine

The **AeroRAG Backend** is an enterprise-grade RESTful API built on **Spring Boot 3.2**, **Spring Security**, **JWT**, **Spring Data JPA**, and **MySQL 8.0**. It serves as the primary business logic engine, managing authentication, multi-tenant department access control, document versioning, security audit logging, and proxy delegation to the Python AI Engine.

---

## 🏗 Architecture & Core Principles

* **Stateless Security**: Spring Security with custom `JwtAuthenticationFilter` validating Bearer JWTs on every incoming request.
* **Role-Based Access Control (RBAC)**: Fine-grained authority checks (`@PreAuthorize("hasRole('ADMIN')")`) securing system management endpoints.
* **Department Isolation**: Multi-user permissions ensuring managers oversee document approval workflows for their specific department.
* **Automatic Database Seeding**: `DatabaseSeeder` populates system departments, default admin users, managers, and employees on initial database creation.
* **AI Delegation**: `AiService` acts as an HTTP client communicating with the Flask AI engine (`AI_ENGINE_URL`) for RAG queries, summarization, and computer vision operations.

---

## 📁 Package Structure

```
backend/
├── src/main/java/com/enterprise/document/
│   ├── config/                 # Security, JWT, CORS, DatabaseSeeder, RestTemplate configurations
│   ├── controller/             # REST API Controllers (Auth, User, Dept, Document, AI, AuditLog)
│   ├── dto/                    # Data Transfer Objects & request/response payloads
│   ├── entity/                 # JPA Entities (User, Role, Department, Document, AuditLog)
│   ├── exception/              # Global exception handlers & custom exceptions
│   ├── repository/             # Spring Data JPA Repositories
│   ├── service/                # Business logic services (AuthService, UserService, DocumentService, etc.)
│   └── DocumentManagementApplication.java # Spring Boot entrypoint
├── src/main/resources/
│   ├── application.yml         # Application configuration & environment placeholders
│   └── schema.sql              # Database DDL initialization script
├── Dockerfile                  # Multi-stage JDK 17 production container definition
├── pom.xml                     # Maven dependencies & build configuration
├── .env.example                # Environment variable template
└── README.md                   # Backend documentation (This file)
```

---

## 🔐 Authentication & Security Flow

1. **Client Authentication**: User posts credentials to `/api/auth/login`.
2. **Credential Validation**: `AuthService` verifies credentials via `AuthenticationManager` against BCrypt password hashes in MySQL.
3. **JWT Generation**: On success, `JwtService` builds a signed HMAC-SHA256 JWT containing username, role, and expiration timestamp.
4. **Token Verification**: Subsequent requests include header `Authorization: Bearer <token>`. `JwtAuthenticationFilter` extracts the token, verifies the signature, loads `UserDetails`, and sets `SecurityContextHolder.getContext().setAuthentication(authToken)`.

---

## 🔑 Environment Variables

The backend uses environment property expansion configured in `application.yml`:

| Property / Env Variable | Default Fallback | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/rag_db...` | MySQL JDBC Connection URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | MySQL Database User |
| `SPRING_DATASOURCE_PASSWORD` | `rootpassword` | MySQL Database Password |
| `JWT_SECRET` | *(64-char secret)* | Secret key used for signing JWT tokens |
| `AI_ENGINE_URL` | `http://localhost:5000` | Base URL of the Flask AI Engine |

---

## 🛠 Running Backend Locally

### Prerequisites
* **JDK**: 17 or higher
* **Maven**: Maven 3.8+ (or use bundled `mvnw`)
* **MySQL**: Running locally on port 3306

### Steps
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Configure environment file:
   ```bash
   cp .env.example .env
   ```
3. Run Spring Boot application:
   ```bash
   # Linux / macOS:
   ./mvnw spring-boot:run

   # Windows PowerShell:
   .\mvnw.cmd spring-boot:run
   ```
4. Verification:
   The backend starts on **`http://localhost:8080`**. Spring Boot automatically creates database tables (`rag_db`) and seeds default admin and demo user accounts.

---

## 🐳 Docker Deployment

The backend uses a multi-stage Docker build:
1. **Stage 1**: Compiles Java source code using `maven:3.9-eclipse-temurin-17`.
2. **Stage 2**: Runs packaged JAR inside light `eclipse-temurin:17-jre-alpine` container on port 8080.

```bash
docker build -t aerorag-backend .
docker run -d -p 8080:8080 --name aerorag-backend-container aerorag-backend
```
