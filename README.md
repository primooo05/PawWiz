# PawWiz Monorepo 

High-precision, mobile-first feline utility platform for plant toxicity verification, diet optimization, and behavioral decoding.

---

## Architecture Overview

PawWiz is architected as a decoupled monorepo managed via native **npm workspaces** using **TypeScript** across the full network boundary:

- **Frontend (`packages/pawwiz-frontend`)**: React + Vite + Tailwind CSS v4.
- **Backend (`packages/pawwiz-backend`)**: Node.js (Express) + TypeScript + Gemini 3.5 Pipeline (`@google/genai`).
- **ASPCA Verification Loop**: Deterministic database interceptor to eliminate AI hallucinations on plant toxicity scanning.

---

## Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

---

### Step 1: Install Dependencies

From the root directory of the monorepo, run:
```bash
npm install
```
This automatically links the workspaces and installs all dependencies for both the frontend and backend packages.

---

### Step 2: Configure Environment Variables & Secrets

This project uses **Infisical** for secret management. Secrets are injected at runtime; **do not** use local `.env` files.

1. Ensure the Infisical CLI is installed.
2. Initialize and authenticate with your project context.
3. Secrets (like `DATABASE_URL`, `DIRECT_URL`, and `GEMINI_API_KEY`) will automatically inject during runtime commands.

---

### Step 3: Run Database Migrations

For schema migrations, PgBouncer (port `6543`) in transaction mode cannot be used. We must connect directly to port `5432`. A utility script is provided at the root:

```cmd
migrate.bat <migration_name>
```

---

### Step 4: Run the Development Servers

To run both the backend Express server and the frontend Vite server concurrently with Infisical secrets, run in the **root** folder:
```bash
npm run dev
```

This launches:
- **Backend API**: `http://localhost:3001`
- **Frontend App**: `http://localhost:5173`

---

### Step 4: Build for Production

To compile both packages for production:
```bash
npm run build
```
- The backend compiles into JavaScript in `packages/pawwiz-backend/dist/`.
- The frontend compiles static assets in `packages/pawwiz-frontend/dist/`.

---

## Reverse Proxy (Nginx) Gateway

For production routing and to eliminate CORS pre-flight requests, Nginx can be configured using the [nginx.conf](file:///c:/Users/User/IdeaProjects/HackTheKitty_PawWiz/nginx.conf) at the root:

- Requests to `/api/*` are reverse proxied to the Express backend (`http://localhost:3001/api/`).
- Requests to `/` serve the static assets or proxy to the Vite server (`http://localhost:5173`).
- Gzip compression is enabled for performance, and TLS/SSL termination resides on Nginx.
