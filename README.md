# PawWiz

AI-powered cat health assistant. Covers plant toxicity verification, personalized diet planning, behavior decoding, pregnancy tracking, and a unified health timeline — all in a single mobile-first web app.
---

## Features

| Feature | What it does |
|---|---|
| **Plant Toxicity Scanner** | Text search or photo upload → PlantNet identification → ASPCA ground-truth verdict. Unknown plants are enriched from Perenual + Wikipedia and cached. AI results are never trusted for the final safe/toxic decision — the local ASPCA dataset is authoritative. |
| **Diet Optimizer** | Personalized nutrition plans via veterinary RER formulas + AI enrichment (Gemini). Tracks daily meals (Breakfast / Lunch / Dinner), water intake, success streaks, and per-cat avatar photos. Supports multiple cats per account. |
| **Behavior Chat ("Wiz")** | Conversational AI companion (Groq Llama 3.3 70B → Gemini fallback → heuristic) that interprets vocalizations and body language. Conversations are persisted as sessions; behaviors are automatically extracted and logged. |
| **Behavior Dashboard** | Weekly summaries, recurring pattern analysis, daily timelines, and AI-generated insight cards (concern flags, positive indicators, recommendations) aggregated from logged behaviors. |
| **Health Timeline** | Unified per-cat event timeline with AI-generated health insights and PDF export. Events are sourced from diet logs, behavior logs, and pregnancy records. |
| **Pregnancy Tracker** | 9-week gestation tracker with per-week action checklists, Flo-style daily symptom/mood logging, and AI insight cards. Supports multiple sessions per cat. |
| **Settings** | Profile management, cat management, avatar upload to Supabase Storage. |

---

## Architecture

```
pawwiz-monorepo/                  ← npm workspaces root
├── packages/
│   ├── pawwiz-frontend/          ← React 19 + Vite 8 + Tailwind CSS 4
│   └── pawwiz-backend/           ← Express 5 + Prisma 7 + PostgreSQL
└── nginx.conf                    ← Reverse proxy (TLS + API routing)
```

**Frontend** — React 19 (functional components), React Router v7, Supabase JS SDK for auth, Zod 4 for validation, `motion/react` for animations. Route-level and component-level code splitting with `React.lazy` + `Suspense`; initial JS payload is ~167 kB gzip.

**Backend** — Node.js ES modules, Express 5, TypeScript 6 (strict, NodeNext). MRSC layering: Middleware → Routes → Services → Controllers, with Repositories as the sole Prisma-access layer.

**AI pipeline** — Groq (Llama 3.3 70B) primary for behavior decoding and chat; Google Gemini 2.5 Flash for multimodal/text fallback, plant vision, and diet enrichment. Every AI path has a deterministic heuristic fallback so the app works without API keys.

**Auth** — Supabase Auth (`signInWithPassword`). JWT verified on the backend via ES256 JWKS with an HS256 fallback. Password recovery uses the Supabase Admin API to generate recovery links, delivered by Nodemailer over Gmail.

**Bot protection** — Honeypot fields, rate limiting (`express-rate-limit`), and OTP email verification on onboarding. No Cloudflare Turnstile.

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- A PostgreSQL database (Supabase project or any Postgres instance)

---

### 1. Install dependencies
Installs all workspace packages in one shot.
```bash
npm install
```
Or install each package individually:
```bash
# Backend
cd packages/pawwiz-backend
npm install

# Frontend
cd packages/pawwiz-frontend
npm install
```
---

### 2. Configure environment variables

Copy the template and fill in the values:

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows cmd
```

A single `.env` at the repo root serves both packages. The backend resolves it by walking up from its working directory; Vite reads it via `envDir` pointing at the repo root (only `VITE_`-prefixed variables reach the browser).

**Required:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection (runtime queries) |
| `DIRECT_URL` | Direct Postgres connection (migrations — pooler lacks prepared-statement support) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_JWT_SECRET` | HS256 JWT fallback secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API + Storage uploads |
| `VITE_SUPABASE_URL` | Supabase URL exposed to the browser |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key exposed to the browser |

**Optional** (app falls back to mocks/heuristics when absent):

`GEMINI_API_KEY`, `GROQ_API_KEY`, `PLANTNET_API_KEY`, `PERENUAL_API_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`,`NODE_ENV`,`SHADOW_DATABASE_URL`

Alternatively, use **Infisical** for centrally managed secrets — prefix any command with `infisical run --` and injected variables take precedence over `.env`.

---

### 3. Run database migrations

Migrations connect directly to Postgres (`DIRECT_URL`) — the Supabase pooler does not support prepared statements.

```bash
# Apply all pending migrations
npm run prisma:deploy -w packages/pawwiz-backend

# Create + apply a new migration (dev only)
npm run prisma:migrate -w packages/pawwiz-backend

# Windows helper — wraps Infisical + forces DIRECT_URL
migrate.bat <migration_name>

# Generate prisma client on the root folder
npm run prisma:generate -w packages/pawwiz-backend
```

---

### 4. Start development servers

```bash
# Using a local .env file
npm run dev:local

# Injecting secrets via Infisical
npm run dev
```

| Server | URL |
|---|---|
| Backend API | `http://localhost:3001` |
| Frontend | `http://localhost:5173` |

---

### 5. Build for production
Run this on root folder:
```bash
npm run build
```

- Backend → `packages/pawwiz-backend/dist/`
- Frontend → `packages/pawwiz-frontend/dist/`

---

## Testing

```bash
# Backend — Vitest + fast-check (property-based) + Supertest
npm run test -w packages/pawwiz-backend

# Frontend — Vitest + Testing Library + fast-check
npm run test -w packages/pawwiz-frontend
```

---

## Reverse Proxy (nginx)

`nginx.conf` at the root handles production routing:

- `/api/*` → Express backend (`localhost:3001`)
- `/` → Vite static assets (or dev server on `localhost:5173`)
- TLS termination, gzip compression, and `X-Real-IP` / `X-Forwarded-For` headers are all configured here. Backend runs with `trust proxy = 1`.

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Sign in + password recovery |
| `/onboarding` | Multi-step registration with OTP email verification |
| `/reset-password` | Password reset (Supabase recovery flow) |
| `/dashboard` | Main user dashboard |
| `/diet-recommender` | Diet profiles + meal + water logging |
| `/behavior-chat` | Wiz behavior chat |
| `/behavior-dashboard` | Behavior analytics |
| `/health-timeline/:catId` | Per-cat health timeline + PDF export |
| `/pregnancy-tracker` | Pregnancy session + daily logs + insights |
| `/heat-tracker` | Heat cycle tracking |
| `/settings` | Profile + cat management |
| `/docs` | Engineering documentation |
