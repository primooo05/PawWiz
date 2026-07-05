# PawWiz Monorepo 

High-precision, mobile-first feline utility platform for plant toxicity verification, diet optimization, pregnancy tracking, and behavioral decoding.

---

## Architecture Overview

PawWiz is architected as a decoupled monorepo managed via native **npm workspaces** using **TypeScript** across the full network boundary:

- **Frontend (`packages/pawwiz-frontend`)**: React 19 + Vite + Tailwind CSS v4, Supabase Auth client.
- **Backend (`packages/pawwiz-backend`)**: Node.js (Express 5) + TypeScript + Prisma 7 (PostgreSQL).
- **AI pipeline**: Groq (Llama 3.3 70B) as the primary model for behavior decoding and conversational text, with Google **Gemini 2.5 Flash** (`@google/genai`) as the multimodal/text fallback and for plant vision + diet enrichment. A deterministic heuristic fallback keeps every feature working when AI keys are absent.
- **ASPCA Verification Loop**: Deterministic database interceptor that treats the local ASPCA dataset as ground truth to eliminate AI hallucinations on plant toxicity scanning.

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

You can supply secrets in **either** of two ways. A local `.env` file is the simplest for local development; **Infisical** is optional and mainly used for shared/hosted environments.

#### Option A — Local `.env` file (recommended for local dev)

A single `.env` at the repo root serves **both** packages:
- The backend loads the nearest `.env` walking up from its working directory (`src/lib/env.ts`), and Prisma tooling does the same (`prisma.config.ts`).
- The frontend reads the same root `.env` via Vite (`envDir` points at the repo root); only `VITE_`-prefixed variables are exposed to the browser.

```bash
# Copy the template and fill in the values
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows cmd
```

Optional AI/integration keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `PLANTNET_API_KEY`, `PERENUAL_API_KEY`, Gmail) can be left blank — the app falls back to mocks/heuristics when they are absent.

#### Option B — Infisical (optional)

If you prefer centrally managed secrets:
1. Install the Infisical CLI and authenticate with your project context.
2. Run commands under `infisical run --` (see the Infisical-prefixed scripts below). Injected variables take precedence over any `.env` file.

---

### Step 3: Run Database Migrations

For schema migrations, PgBouncer (port `6543`) in transaction mode cannot be used, so we connect directly to port `5432` (`DIRECT_URL`).

```bash
# Local .env — no Infisical
npm run prisma:deploy -w packages/pawwiz-backend   # apply existing migrations
npm run prisma:migrate -w packages/pawwiz-backend  # create + apply a new migration

# Or, with Infisical (Windows helper that forces DIRECT_URL)
migrate.bat <migration_name>
```

---

### Step 4: Run the Development Servers

To run the backend Express server and the frontend Vite server concurrently, from the **root** folder:

```bash
# Local .env — no Infisical
npm run dev:local

# Or, injecting secrets via Infisical
npm run dev
```

This launches:
- **Backend API**: `http://localhost:3001`
- **Frontend App**: `http://localhost:5173`

---

### Step 5: Build for Production

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
