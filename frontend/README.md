# AeroRAG Frontend — React + Vite Client Application

The **AeroRAG Frontend** is a modern Single Page Application (SPA) built with **React 18**, **Vite**, **Material UI (MUI v5)**, **React Query**, and **Axios**. It provides an intuitive, high-performance console for document management, RAG chat, contract deadline analysis, image inspection, and enterprise system administration.

---

## 🏗 Architecture & Overview

* **Framework**: React 18 using Vite for fast HMR (Hot Module Replacement) and optimized production builds.
* **Component System**: Custom components wrapped in Material UI (`@mui/material`), styled with custom themes, glassmorphism cards, and Framer Motion micro-animations.
* **State & Data Fetching**: `@tanstack/react-query` for query caching, background polling, mutation handling, and automatic invalidation.
* **Authentication**: Token-based security managed via `AuthContext`, automatically appending Bearer JWTs to outgoing requests via Axios interceptors.
* **Routing**: React Router v6 with `ProtectedRoute` wrappers enforcing role-based view access (`ADMIN`, `MANAGER`, `EMPLOYEE`).

---

## 📁 Folder Structure

```
frontend/
├── public/                     # Static public assets & favicon
├── src/
│   ├── assets/                 # SVGs, images, and graphics
│   ├── components/             # Reusable UI elements (Navbar, Sidebar, Layout, ProtectedRoute)
│   ├── context/                # React Context providers (AuthContext, ThemeContext)
│   ├── services/               # API service layer (api.js Axios instance & interceptors)
│   ├── theme.js                # Material UI design system, color palettes, typography tokens
│   ├── views/                  # Primary Application Screens
│   │   ├── AI/                 # AI views (ChatWithDocs, Summarizer, SemanticSearch, Deadlines, ImageAnalyzer, CircuitAnalyzer)
│   │   ├── Auth/               # Auth views (LandingPage, Login, ForgotPassword, ResetPassword)
│   │   ├── Dashboard/          # Role-based dynamic dashboards (Admin, Manager, Employee)
│   │   ├── Departments/        # Department Management
│   │   ├── Documents/          # Document Repository & upload workflow
│   │   ├── Logs/               # Security Audit Logs viewer
│   │   ├── Settings/           # User profile & password settings
│   │   └── Users/              # User Management & access control
│   ├── App.jsx                 # Application routes & layout router
│   ├── main.jsx                # DOM root entrypoint
│   └── index.css               # Global CSS utilities & custom scrollbar styles
├── Dockerfile                  # Multi-stage production container build (Node -> Nginx)
├── nginx.conf                  # Nginx production reverse proxy & static server config
├── package.json                # Project dependencies & scripts
├── vite.config.js              # Vite server & proxy configurations
└── README.md                   # Frontend documentation (This file)
```

---

## 🔑 Environment Variables

The frontend relies on `import.meta.env` variables defined in `.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL pointing to the Spring Boot REST API |

> **Example `.env` file (`frontend/.env`):**
> ```ini
> VITE_API_BASE_URL=http://localhost:8080
> ```

---

## 🚀 Development & Setup Commands

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```
The dev server starts on **`http://localhost:5173`**.

### Step 3: Build for Production
```bash
npm run build
```
Generates optimized static bundle in `frontend/dist/`.

### Step 4: Preview Production Build
```bash
npm run preview
```

---

## 🐳 Docker Deployment

The frontend uses a multi-stage Docker build:
1. **Stage 1 (Build)**: Compiles React app using `node:18-alpine`.
2. **Stage 2 (Serve)**: Copies compiled static assets into `nginx:alpine` and listens on port 80 (or mapped to 5173).

```bash
docker build -t aerorag-frontend .
docker run -d -p 5173:80 --name aerorag-frontend-container aerorag-frontend
```
