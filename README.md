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

### Step 2: Configure Environment Variables

1. Navigate to the backend directory:
   ```bash
   cd packages/pawwiz-backend
   ```
2. Create a `.env` file:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > [!NOTE]
   > You can obtain an API key from the [Google AI Studio](https://aistudio.google.com/).
   > If no `GEMINI_API_KEY` is provided, the backend will automatically enter **Mock Fallback Mode**, allowing you to test the complete user experience with simulated responses.

---

### Step 3: Run the Development Servers

To run both the backend Express server and the frontend Vite server concurrently, run the following command in the **root** folder:
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
