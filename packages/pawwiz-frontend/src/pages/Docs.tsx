import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { TEST_FILES } from './docsTestFiles';
import { useBodyScrollLock } from '../hooks/ui/useBodyScrollLock';

/**
 * PawWiz — Judge-facing documentation page (/docs).
 *
 * Neo-Brutalism design system:
 *  - White cards with 2px slate-900 borders + hard offset shadows
 *  - Teal accent (#2ec4b6), uppercase black headings, tight tracking
 *
 * Sections:
 *  1. Hero "Documentation" — palette, UI designs, typography
 *  2. Environment variables
 *  3. Security (with sample code)
 *  4. Testing of API endpoints + test documentation
 *  5. Interactive diagrams / request simulation
 */

const TEAL = '#2ec4b6';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'environment', label: 'Environment' },
  { id: 'security', label: 'Security' },
  { id: 'testing', label: 'Testing' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'database', label: 'Database' },
];

/** Neo-brutalist section wrapper with a hard-shadow card. */
function SectionCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="relative p-6 md:p-10 bg-white border-2 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]" style={{ color: TEAL }}>
          {eyebrow}
        </span>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 mt-1 mb-6">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Small brutalist button that copies the given text to the clipboard. */
function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? `Copy ${label}` : `Copy ${value}`}
      title={copied ? 'Copied!' : 'Copy'}
      className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 border-2 border-slate-900 rounded-md text-[10px] font-black uppercase tracking-wider bg-white hover:bg-slate-100 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
      style={copied ? { backgroundColor: TEAL, color: '#fff' } : undefined}
    >
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  );
}

/** Monospace code block with brutalist framing. */
function Code({ code, lang = 'ts' }: { code: string; lang?: string }) {
  return (
    <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{lang}</span>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAL }} />
        </div>
      </div>
      <pre className="bg-slate-950 text-slate-100 text-[11px] md:text-xs leading-relaxed p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

const PALETTE = [
  { name: 'Teal Accent', hex: '#2ec4b6', text: 'text-white' },
  { name: 'Ink / Border', hex: '#0f172a', text: 'text-white' },
  { name: 'Slate Surface', hex: '#e2e8f0', text: 'text-slate-900' },
  { name: 'Teal Wash', hex: '#EEF9F8', text: 'text-teal-900' },
  { name: 'Sand CTA', hex: '#e9c46a', text: 'text-slate-900' },
  { name: 'Paper', hex: '#ffffff', text: 'text-slate-900' },
];

const ENV_VARS = [
  { key: 'DATABASE_URL', scope: 'Backend', required: 'Required', note: 'PostgreSQL connection string (Supabase pooler). Used by Prisma ORM.' },
  { key: 'DIRECT_URL', scope: 'Backend', required: 'Required', note: 'Direct (non-pooled) PostgreSQL URL for Prisma migrations.' },
  { key: 'SHADOW_DATABASE_URL', scope: 'Backend', required: 'Optional', note: 'Shadow database for Prisma diff-based migrations (Neon).' },
  { key: 'GEMINI_API_KEY', scope: 'Backend', required: 'Optional', note: 'Google Gemini 2.5 Flash — plant vision & diet enrichment. Gracefully mocks when absent.' },
  { key: 'GROQ_API_KEY', scope: 'Backend', required: 'Optional', note: 'Groq LLM API — behavior decoder chat completions.' },
  { key: 'PLANTNET_API_KEY', scope: 'Backend', required: 'Optional', note: 'Pl@ntNet image recognition API for plant identification.' },
  { key: 'PERENUAL_API_KEY', scope: 'Backend', required: 'Optional', note: 'Perenual plant database API — supplementary plant data.' },
  { key: 'SUPABASE_JWT_SECRET', scope: 'Backend', required: 'Required', note: 'Verifies Supabase-issued JWTs in the auth middleware.' },
  { key: 'SUPABASE_URL', scope: 'Backend', required: 'Required', note: 'Supabase project URL for server-side SDK calls.' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', scope: 'Backend', required: 'Required', note: 'Service-role key for admin Supabase operations (e.g. OTP).' },
  { key: 'GMAIL_USER', scope: 'Backend', required: 'Required', note: 'Gmail address for transactional email (OTP delivery).' },
  { key: 'GMAIL_APP_PASSWORD', scope: 'Backend', required: 'Required', note: 'Gmail App Password for SMTP authentication.' },
  { key: 'NODE_ENV', scope: 'Backend', required: 'Optional', note: 'Runtime environment flag (development | production).' },
  { key: 'VITE_SUPABASE_URL', scope: 'Frontend', required: 'Required', note: 'Supabase project URL (client-side auth & realtime).' },
  { key: 'VITE_SUPABASE_ANON_KEY', scope: 'Frontend', required: 'Required', note: 'Supabase publishable/anon key for frontend SDK.' },
];

type AuthLevel = 'public' | 'jwt' | 'optional';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth: AuthLevel;
  desc: string;
}

const API_GROUPS: { group: string; endpoints: Endpoint[] }[] = [
  {
    group: 'Auth',
    endpoints: [
      { method: 'POST', path: '/api/auth/recover', auth: 'public', desc: 'Password reset email. Rate-limited 3/15min; identical, constant-time response regardless of email existence.' },
    ],
  },
  {
    group: 'Profile',
    endpoints: [
      { method: 'POST', path: '/api/profile', auth: 'jwt', desc: 'Create profile after Supabase signup (honeypot + rate-limited).' },
      { method: 'GET', path: '/api/profile', auth: 'jwt', desc: 'Fetch the authenticated user profile.' },
      { method: 'PATCH', path: '/api/profile', auth: 'jwt', desc: 'Update profile fields.' },
      { method: 'DELETE', path: '/api/profile', auth: 'jwt', desc: 'Delete the user profile.' },
    ],
  },
  {
    group: 'ASPCA Plants',
    endpoints: [
      { method: 'GET', path: '/api/aspca/lookup', auth: 'public', desc: 'Query-string plant toxicity lookup.' },
      { method: 'POST', path: '/api/aspca/lookup', auth: 'public', desc: 'Validated body plant toxicity lookup.' },
      { method: 'GET', path: '/api/aspca/plants', auth: 'public', desc: 'List the ASPCA plant catalogue.' },
    ],
  },
  {
    group: 'Toxicity (cached)',
    endpoints: [
      { method: 'POST', path: '/api/toxicity/search', auth: 'optional', desc: 'Text search → cached toxicity resolution (Content-Type gated).' },
      { method: 'POST', path: '/api/toxicity/scan', auth: 'optional', desc: 'Image upload (multipart) → plant ID + toxicity.' },
    ],
  },
  {
    group: 'Gemini AI',
    endpoints: [
      { method: 'POST', path: '/api/gemini/diet/optimize', auth: 'jwt', desc: 'Personalized feline nutrition plan (RER formula).' },
      { method: 'POST', path: '/api/gemini/diet/advice', auth: 'jwt', desc: 'Conversational advisor grounded in the cat diet profile.' },
      { method: 'POST', path: '/api/gemini/behavior/decode', auth: 'jwt', desc: 'Decode vocalization / body-language cues.' },
    ],
  },
  {
    group: 'Diet Profiles',
    endpoints: [
      { method: 'GET', path: '/api/diet/profiles', auth: 'jwt', desc: 'List the user cat diet profiles.' },
      { method: 'POST', path: '/api/diet/profiles', auth: 'jwt', desc: 'Create a diet profile.' },
      { method: 'PUT', path: '/api/diet/profiles/:id', auth: 'jwt', desc: 'Update a diet profile.' },
      { method: 'DELETE', path: '/api/diet/profiles/:id', auth: 'jwt', desc: 'Delete a diet profile.' },
      { method: 'PUT', path: '/api/diet/profiles/:id/meals/:mealId', auth: 'jwt', desc: 'Log / update a meal entry.' },
      { method: 'PUT', path: '/api/diet/profiles/:id/water', auth: 'jwt', desc: 'Update daily water intake.' },
      { method: 'PATCH', path: '/api/diet/profiles/:id/avatar', auth: 'jwt', desc: 'Set cat avatar by reference.' },
      { method: 'POST', path: '/api/diet/profiles/:id/avatar/upload', auth: 'jwt', desc: 'Upload cat avatar image (multer, ≤5MB JPEG/PNG).' },
    ],
  },
  {
    group: 'Onboarding',
    endpoints: [
      { method: 'POST', path: '/api/onboarding/check-email', auth: 'public', desc: 'Check email availability (rate-limited).' },
      { method: 'POST', path: '/api/onboarding/start', auth: 'public', desc: 'Start an onboarding session (rate-limited 3/hr per IP).' },
      { method: 'GET', path: '/api/onboarding/session/:id', auth: 'public', desc: 'Fetch onboarding session state (OTP secrets stripped from the response).' },
      { method: 'POST', path: '/api/onboarding/session/:id/update', auth: 'public', desc: 'Persist a step of the onboarding wizard.' },
      { method: 'POST', path: '/api/onboarding/session/:id/send-otp', auth: 'public', desc: 'Send an email OTP challenge (enumeration-safe; 60s cooldown).' },
      { method: 'POST', path: '/api/onboarding/session/:id/verify-otp', auth: 'public', desc: 'Verify the OTP code (rate-limited 5/15min; 3-attempt per-code lockout).' },
    ],
  },
  {
    group: 'Behavior Chat & Dashboard',
    endpoints: [
      { method: 'GET', path: '/api/behavior/chats', auth: 'jwt', desc: 'List behavior chat sessions.' },
      { method: 'GET', path: '/api/behavior/chats/:id', auth: 'jwt', desc: 'Fetch a single chat with messages.' },
      { method: 'POST', path: '/api/behavior/chats', auth: 'jwt', desc: 'Create a new chat session.' },
      { method: 'PATCH', path: '/api/behavior/chats/:id', auth: 'jwt', desc: 'Rename / update a chat.' },
      { method: 'DELETE', path: '/api/behavior/chats/:id', auth: 'jwt', desc: 'Delete a chat session.' },
      { method: 'POST', path: '/api/behavior/chats/:id/messages', auth: 'jwt', desc: 'Add a message + get decoded reply.' },
      { method: 'GET', path: '/api/behavior/dashboard/week', auth: 'jwt', desc: 'Weekly behavior summary.' },
      { method: 'GET', path: '/api/behavior/dashboard/patterns', auth: 'jwt', desc: 'Recurring behavior patterns.' },
      { method: 'GET', path: '/api/behavior/dashboard/timeline', auth: 'jwt', desc: 'Daily behavior timeline.' },
      { method: 'GET', path: '/api/behavior/dashboard/insights', auth: 'jwt', desc: 'Aggregated behavior insights.' },
    ],
  },
  {
    group: 'Quick Log',
    endpoints: [
      { method: 'POST', path: '/api/quick-log/behavior', auth: 'jwt', desc: 'One-tap behavior log entry (rate-limited 60/5min per user).' },
    ],
  },
  {
    group: 'Health Timeline',
    endpoints: [
      { method: 'GET', path: '/api/timeline/:catId', auth: 'jwt', desc: 'Paginated timeline events for a cat (Zod-validated query).' },
      { method: 'GET', path: '/api/timeline/:catId/insights', auth: 'jwt', desc: 'AI-generated health insights for a cat.' },
      { method: 'POST', path: '/api/timeline/:catId/insights/refresh', auth: 'jwt', desc: 'Trigger on-demand insights regeneration.' },
      { method: 'POST', path: '/api/timeline/:catId/export/pdf', auth: 'jwt', desc: 'Generate and stream a PDF health summary (rate-limited 5/min per user).' },
    ],
  },
  {
    group: 'Pregnancy Tracker',
    endpoints: [
      { method: 'POST', path: '/api/pregnancy/session/start', auth: 'jwt', desc: 'Start a new pregnancy tracking session for a cat.' },
      { method: 'GET', path: '/api/pregnancy/session/active/:catId', auth: 'jwt', desc: 'Fetch the active pregnancy session for a cat.' },
      { method: 'PATCH', path: '/api/pregnancy/session/:sessionId/complete', auth: 'jwt', desc: 'Mark a pregnancy session as completed (birth).' },
      { method: 'POST', path: '/api/pregnancy/log', auth: 'jwt', desc: 'Upsert a Flo-style daily symptom/mood log (rate-limited 60/5min per user).' },
      { method: 'GET', path: '/api/pregnancy/log/history/:sessionId', auth: 'jwt', desc: 'Fetch all daily logs for a pregnancy session.' },
      { method: 'GET', path: '/api/pregnancy/insights/:sessionId', auth: 'jwt', desc: 'AI-generated pregnancy insight cards.' },
      { method: 'PATCH', path: '/api/pregnancy/insights/:insightId/read', auth: 'jwt', desc: 'Mark a pregnancy insight as read.' },
    ],
  },
];

const METHOD_COLORS: Record<Endpoint['method'], string> = {
  GET: '#0f172a',
  POST: '#2ec4b6',
  PUT: '#0ea5e9',
  PATCH: '#f59e0b',
  DELETE: '#ef4444',
};

const AUTH_BADGE: Record<AuthLevel, React.CSSProperties> = {
  jwt: { backgroundColor: '#2ec4b6', color: '#fff' },
  optional: { backgroundColor: '#fde68a', color: '#92400e' },
  public: { backgroundColor: '#e2e8f0', color: '#475569' },
};

const TEST_LAYERS = [
  { name: 'Unit + Property', tool: 'Vitest + fast-check', target: 'Services, guards, validators, extractors', note: 'Property-based invariants over generated inputs. 200+ runs per property.' },
  { name: 'Middleware', tool: 'Vitest', target: 'auth, honeypot, rate-limiter, sanitizer, validate', note: 'Isolated req/res behavior + 403/401/415 traps.' },
  { name: 'HTTP / API', tool: 'Supertest', target: 'Route handlers end-to-end', note: 'Status codes, payload shapes, error paths.' },
  { name: 'AI Failover', tool: 'Vitest (mock)', target: 'diet-optimization, behavior-decoder, vision', note: '3-tier Groq→Gemini→heuristic failover chains. Intentional dependency breakage.' },
  { name: 'Timeline & PDF', tool: 'Vitest', target: 'timeline.service, insight.service, pdf.service', note: 'Event aggregation, insight generation, and serialization integrity.' },
  { name: 'Pregnancy', tool: 'Vitest', target: 'pregnancy-session, pregnancy-log, pregnancy-insight', note: 'Flo-style logging lifecycle: upserts, gestation math, insight triggers.' },
  { name: 'Frontend', tool: 'Testing Library + fast-check', target: 'Hooks, forms, screens, pure calculations', note: 'Zod validation + accessible error states + diet math properties.' },
];

// ---------------------------------------------------------------------------
// Interactive request simulation (Section 5)
// ---------------------------------------------------------------------------

const PIPELINE = [
  { stage: 'Client', detail: 'React hook (useDietPlanner) → fetch /api/diet/profiles' },
  { stage: 'nginx', detail: 'Reverse proxy: TLS termination + routes /api/* to the backend (same-origin, no CORS in prod)' },
  { stage: 'Middleware', detail: 'CORS → Helmet → RateLimiter → Honeypot → Auth (JWT) → Zod validate' },
  { stage: 'Route', detail: 'diet.routes.ts maps the verb/path to the controller' },
  { stage: 'Controller', detail: 'diet.controller.ts unwraps request, calls the service (withErrorHandling)' },
  { stage: 'Service', detail: 'diet.service.ts runs RER math + Gemini enrichment' },
  { stage: 'Repository', detail: 'Prisma reads/writes Profile + Cat records' },
  { stage: 'Response', detail: 'Typed payload flows back through nginx to the client' },
];

function RequestSimulator() {
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < PIPELINE.length;

  function play() {
    setStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i >= PIPELINE.length) {
        clearInterval(timer);
      }
      setStep(i);
    }, 650);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={play}
          className="px-5 py-3 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-teal-600 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          ▶ Trace a request
        </button>
        <button
          type="button"
          onClick={() => setStep(-1)}
          className="px-5 py-3 bg-white text-slate-700 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          Reset
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {running ? `Stage ${step + 1} / ${PIPELINE.length}` : step >= PIPELINE.length ? 'Complete' : 'Idle'}
        </span>
      </div>

      <ol className="space-y-3">
        {PIPELINE.map((p, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={p.stage}
              className={`flex items-start gap-4 p-4 border-2 rounded-2xl transition-all ${
                active
                  ? 'border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] -translate-y-0.5'
                  : 'border-slate-200'
              }`}
              style={active ? { backgroundColor: '#EEF9F8' } : done ? { backgroundColor: '#f8fafc' } : undefined}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-black"
                style={{ backgroundColor: active || done ? TEAL : '#fff', color: active || done ? '#fff' : '#0f172a' }}
              >
                {done ? '✓' : i + 1}
              </span>
              <div>
                <p className="font-black uppercase text-sm tracking-tight text-slate-900">{p.stage}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{p.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interactive Test IDE — file tree + code viewer (Section 4)
// ---------------------------------------------------------------------------

interface IDEFile {
  name: string;
  path: string;
  code: string;
}

interface IDEFolder {
  name: string;
  files: (IDEFile | IDEFolder)[];
}

const IDE_TREE: IDEFolder = {
  name: 'packages/',
  files: [
    {
      name: 'pawwiz-backend/src/',
      files: [
        {
          name: 'middleware/__tests__/',
          files: [
            { name: 'auth.test.ts', path: 'middleware/__tests__/auth.test.ts', code: '' },
            { name: 'contentType.test.ts', path: 'middleware/__tests__/contentType.test.ts', code: '' },
            { name: 'cors.test.ts', path: 'middleware/__tests__/cors.test.ts', code: '' },
            {
              name: 'honeypot.test.ts',
              path: 'middleware/__tests__/honeypot.test.ts',
              code: `import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { honeypotMiddleware } from '../honeypot.js';
import type { Request, Response, NextFunction } from 'express';

describe('Honeypot Middleware', () => {
  it('should reject requests with 403 when honeypot field is non-empty', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (honeypotValue) => {
        const mockReq = { body: { website: honeypotValue } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        honeypotMiddleware(mockReq as Request, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden' });
        expect(mockNext).not.toHaveBeenCalled();
      })
    );
  });

  it('should allow requests when honeypot field is missing or empty', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(undefined, ''), async (honeypotValue) => {
        const mockReq = { body: { website: honeypotValue } } as Partial<Request>;
        const mockRes = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        } as unknown as Response;
        const mockNext = vi.fn();

        honeypotMiddleware(mockReq as Request, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      })
    );
  });
});`,
            },
            { name: 'rateLimiter.test.ts', path: 'middleware/__tests__/rateLimiter.test.ts', code: '' },
            { name: 'sanitizer.test.ts', path: 'middleware/__tests__/sanitizer.test.ts', code: '' },
            { name: 'validate.test.ts', path: 'middleware/__tests__/validate.test.ts', code: '' },
          ],
        },
        {
          name: 'services/__tests__/',
          files: [
            { name: 'aspca.service.test.ts', path: 'services/__tests__/aspca.service.test.ts', code: '' },
            { name: 'behavior-chat.service.test.ts', path: 'services/__tests__/behavior-chat.service.test.ts', code: '' },
            { name: 'behavior-dashboard.service.test.ts', path: 'services/__tests__/behavior-dashboard.service.test.ts', code: '' },
            { name: 'behavior-decoder.service.test.ts', path: 'services/__tests__/behavior-decoder.service.test.ts', code: '' },
            { name: 'diet.service.test.ts', path: 'services/__tests__/diet.service.test.ts', code: '' },
            { name: 'diet-optimization.service.test.ts', path: 'services/__tests__/diet-optimization.service.test.ts', code: '' },
            { name: 'mailer.service.test.ts', path: 'services/__tests__/mailer.service.test.ts', code: '' },
            { name: 'onboarding.otp.service.test.ts', path: 'services/__tests__/onboarding.otp.service.test.ts', code: '' },
            { name: 'onboarding.service.test.ts', path: 'services/__tests__/onboarding.service.test.ts', code: '' },
            { name: 'otp.service.test.ts', path: 'services/__tests__/otp.service.test.ts', code: '' },
            { name: 'plantnet.service.test.ts', path: 'services/__tests__/plantnet.service.test.ts', code: '' },
            { name: 'profile.service.test.ts', path: 'services/__tests__/profile.service.test.ts', code: '' },
            { name: 'toxicity_cache.service.test.ts', path: 'services/__tests__/toxicity_cache.service.test.ts', code: '' },
            { name: 'vision.service.test.ts', path: 'services/__tests__/vision.service.test.ts', code: '' },
            { name: 'timeline.service.test.ts', path: 'services/__tests__/timeline.service.test.ts', code: '' },
          ],
        },
        {
          name: 'routes/__tests__/',
          files: [
            { name: 'onboarding.integration.test.ts', path: 'routes/__tests__/onboarding.integration.test.ts', code: '' },
            { name: 'profile.integration.test.ts', path: 'routes/__tests__/profile.integration.test.ts', code: '' },
            { name: 'toxicity.image-validation.test.ts', path: 'routes/__tests__/toxicity.image-validation.test.ts', code: '' },
          ],
        },
        {
          name: 'repositories/__tests__/',
          files: [
            { name: 'aspca.repository.test.ts', path: 'repositories/__tests__/aspca.repository.test.ts', code: '' },
          ],
        },
        {
          name: 'schemas/__tests__/',
          files: [
            { name: 'onboarding.schemas.test.ts', path: 'schemas/__tests__/onboarding.schemas.test.ts', code: '' },
          ],
        },
        {
          name: 'utils/__tests__/',
          files: [
            { name: 'behavior-extractor.test.ts', path: 'utils/__tests__/behavior-extractor.test.ts', code: '' },
            { name: 'guards.test.ts', path: 'utils/__tests__/guards.test.ts', code: '' },
            { name: 'keyword-extractor.test.ts', path: 'utils/__tests__/keyword-extractor.test.ts', code: '' },
            { name: 'prompt-validator.test.ts', path: 'utils/__tests__/prompt-validator.test.ts', code: '' },
          ],
        },
      ],
    },
    {
      name: 'pawwiz-frontend/src/__tests__/',
      files: [
        { name: 'diet-pure-logic.test.ts', path: 'frontend/__tests__/diet-pure-logic.test.ts', code: '' },
        { name: 'mobile-menu.property.test.ts', path: 'frontend/__tests__/mobile-menu.property.test.ts', code: '' },
        { name: 'not-found.test.tsx', path: 'frontend/__tests__/not-found.test.tsx', code: '' },
        { name: 'onboarding.test.tsx', path: 'frontend/__tests__/onboarding.test.tsx', code: '' },
        {
          name: 'otp.validation.test.ts',
          path: 'frontend/__tests__/otp.validation.test.ts',
          code: `import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateStep3Otp } from '../hooks/onboarding/useOnboardingValidation.js';

describe('validateStep3Otp', () => {
  it('accepts any exactly-6-digit numeric string', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        (code) => {
          const result = validateStep3Otp(code);
          expect(result.isValid).toBe(true);
          expect(result.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('rejects empty string', () => {
    const result = validateStep3Otp('');
    expect(result.isValid).toBe(false);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it('rejects codes shorter than 6 digits', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99999 }).map(String),
        (short) => {
          if (short.length < 6) {
            expect(validateStep3Otp(short).isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: arbitrary strings that are not /^\\\\d{6}$/ are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/^\\d{6}$/.test(s)),
        (invalid) => {
          expect(validateStep3Otp(invalid).isValid).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('rejects SQL injection attempts', () => {
    expect(validateStep3Otp("1' OR '1'='1").isValid).toBe(false);
  });
});`,
        },
        { name: 'otp.screen.test.tsx', path: 'frontend/__tests__/otp.screen.test.tsx', code: '' },
        { name: 'useProfilePanel.test.ts', path: 'frontend/__tests__/useProfilePanel.test.ts', code: '' },
        { name: 'validation.test.tsx', path: 'frontend/__tests__/validation.test.tsx', code: '' },
        { name: 'timeline-serialization.test.ts', path: 'frontend/__tests__/timeline-serialization.test.ts', code: '' },
      ],
    },
  ],
};

function isFolder(item: IDEFile | IDEFolder): item is IDEFolder {
  return 'files' in item;
}

function flatFiles(folder: IDEFolder): IDEFile[] {
  const out: IDEFile[] = [];
  for (const item of folder.files) {
    if (isFolder(item)) out.push(...flatFiles(item));
    else out.push(item);
  }
  return out;
}

function FolderNode({
  folder,
  depth,
  selectedPath,
  onSelect,
}: {
  folder: IDEFolder;
  depth: number;
  selectedPath: string;
  onSelect: (f: IDEFile) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left px-2 py-1 hover:bg-slate-700/50 rounded transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
        <span className="text-[11px] font-bold text-yellow-300 truncate">📁 {folder.name}</span>
      </button>
      {open && (
        <div>
          {folder.files.map((item) =>
            isFolder(item) ? (
              <FolderNode
                key={item.name}
                folder={item}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ) : (
              <button
                key={item.path}
                type="button"
                onClick={() => onSelect(item)}
                className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded transition-colors cursor-pointer truncate ${
                  selectedPath === item.path ? 'bg-teal-600/30 text-teal-200' : 'hover:bg-slate-700/50 text-slate-300'
                }`}
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <span className="text-[10px]">📄</span>
                <span className="text-[11px] font-medium truncate">{item.name}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function TestIDE() {
  const allFiles = flatFiles(IDE_TREE);
  const [selected, setSelected] = useState<IDEFile>(allFiles[0]);
  const code = TEST_FILES[selected.name] ?? '';
  const lineCount = code ? code.split('\n').length : 0;

  return (
    <div className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAL }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            PawWiz Test Explorer — 621 tests
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500">{allFiles.length} test files</span>
      </div>

      <div className="flex flex-col md:flex-row min-h-[420px] max-h-[640px]">
        {/* Sidebar — file tree */}
        <div className="md:w-72 w-full bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 overflow-y-auto max-h-[220px] md:max-h-[640px] py-2">
          <FolderNode folder={IDE_TREE} depth={0} selectedPath={selected.path} onSelect={setSelected} />
        </div>

        {/* Code panel */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Active-file tab */}
          <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 border-b border-slate-700">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-700 text-teal-300 text-[10px] font-bold">
              <span>📄</span>
              <span className="truncate max-w-[240px]">{selected.name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{lineCount} lines</span>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-auto p-4">
            {code ? (
              <pre className="text-[11px] md:text-xs leading-relaxed text-slate-100 font-mono whitespace-pre">
                <code>{code}</code>
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <p className="text-lg mb-1">📄</p>
                  <p className="text-xs font-bold uppercase tracking-wider">{selected.name}</p>
                  <p className="text-[10px] text-slate-600 mt-1">Source not captured for this file</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code samples (verbatim-style snippets illustrating the implementation)
// ---------------------------------------------------------------------------

const AUTH_SNIPPET = `// middleware/auth.ts — Supabase JWT verification (ES256 JWKS + HS256 fallback)
import jwt from 'jsonwebtoken';

// Tokens must be issued by *our* Supabase project and minted for the
// 'authenticated' audience — this blocks cross-project / wrong-aud replay.
const verifyOptions = (algorithms) => ({
  algorithms,
  audience: 'authenticated',
  issuer: \`\${process.env.SUPABASE_URL}/auth/v1\`,
});

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { alg } = jwt.decode(token, { complete: true }).header;
    const decoded = alg === 'ES256'
      ? jwt.verify(token, await jwksKey(token), verifyOptions(['ES256']))
      : jwt.verify(token, hs256Secret(), verifyOptions(['HS256']));
    req.user = { sub: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}`;

// OWASP hardening delivered in the security & performance refactor.
const HARDENING: { tag: string; title: string; detail: string }[] = [
  {
    tag: 'A07',
    title: 'OTP brute-force lockout',
    detail:
      'Onboarding OTP is capped at 3 attempts per issued code; the hash is invalidated on lockout and cleared on success. verify-otp is rate-limited 5 / 15 min per IP.',
  },
  {
    tag: 'A01',
    title: 'Enumeration-safe auth',
    detail:
      'Password recovery and OTP send return identical responses whether or not the account exists, with a constant-time floor on the recovery path.',
  },
  {
    tag: 'A07',
    title: 'No OTP secret leakage',
    detail:
      'GET /onboarding/session/:id returns a sanitized projection — otpHash, expiry, and attempt counters are never sent to the client.',
  },
  {
    tag: 'A04',
    title: 'Spoof-resistant rate limiting',
    detail:
      'Limiters key on req.ip behind a single trusted proxy (trust proxy = 1) instead of the client-settable X-Real-IP header.',
  },
  {
    tag: 'A04',
    title: 'JWT issuer + audience checks',
    detail:
      'Tokens are verified against the Supabase issuer and the "authenticated" audience across both ES256 (JWKS) and HS256 paths.',
  },
  {
    tag: 'A04',
    title: 'No route auth drift',
    detail:
      'Removed unauthenticated inline /api/diet & /api/behavior endpoints; AI routes now sit behind authMiddleware in the router layer.',
  },
  {
    tag: 'A04',
    title: 'User-keyed tracking limiter',
    detail:
      'Quick-log and pregnancy writes are rate-limited at 60/5min keyed on the JWT sub claim — blocks scripted spam without punishing users behind shared NATs.',
  },
  {
    tag: 'A04',
    title: 'PDF export throttle',
    detail:
      'Timeline PDF generation is capped at 5/min per authenticated user — prevents resource exhaustion on the compute-heavy export path.',
  },
  {
    tag: 'A07',
    title: 'Session-spam protection',
    detail:
      'Onboarding session creation limited to 3/hr per IP — neutralizes mass session creation and email-bombing vectors.',
  },
];

const HONEYPOT_SNIPPET = `// middleware/honeypot.ts — silent bot trap
export function honeypot(req, res, next) {
  // Hidden field no human ever fills in
  if (req.body?.website) return res.sendStatus(403);
  next();
}`;

const VALIDATE_SNIPPET = `// middleware/validate.ts — Zod schema gate
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.body = result.data; // narrowed + sanitized
  next();
};`;

// ---------------------------------------------------------------------------
// Database schema visualization (Section 6) — derived from prisma/schema.prisma
// ---------------------------------------------------------------------------

type FieldFlag = 'PK' | 'FK' | 'UNIQUE' | 'IDX';

interface DbField {
  name: string;
  type: string;
  flag?: FieldFlag;
}

interface DbRelation {
  to: string;
  cardinality: '1:1' | '1:N' | 'N:1';
  label: string;
}

interface DbModel {
  name: string;
  table: string;
  fields: DbField[];
  relations: DbRelation[];
}

interface DbGroup {
  group: string;
  color: string;
  models: DbModel[];
}

const FLAG_STYLE: Record<FieldFlag, { icon: string; bg: string; fg: string }> = {
  PK: { icon: '🔑', bg: '#e9c46a', fg: '#0f172a' },
  FK: { icon: '🔗', bg: '#2ec4b6', fg: '#ffffff' },
  UNIQUE: { icon: '◆', bg: '#0f172a', fg: '#ffffff' },
  IDX: { icon: '⚡', bg: '#e2e8f0', fg: '#0f172a' },
};

const DB_GROUPS: DbGroup[] = [
  {
    group: 'Core / Identity',
    color: '#2ec4b6',
    models: [
      {
        name: 'Profile',
        table: 'profiles',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'supabaseUserId', type: 'String', flag: 'UNIQUE' },
          { name: 'displayName', type: 'String' },
          { name: 'catName', type: 'String' },
          { name: 'catBreed', type: 'String?' },
          { name: 'catMarking', type: 'String?' },
          { name: 'catSex', type: 'String' },
          { name: 'catLifeStage', type: 'String' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [
          { to: 'DietProfile', cardinality: '1:N', label: 'dietProfiles' },
          { to: 'Cat', cardinality: '1:N', label: 'cats' },
        ],
      },
      {
        name: 'OnboardingSession',
        table: 'onboarding_sessions',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'step', type: 'Int' },
          { name: 'ownerName', type: 'String?' },
          { name: 'ownerEmail', type: 'String?', flag: 'IDX' },
          { name: 'otpHash', type: 'String?' },
          { name: 'otpExpiresAt', type: 'DateTime?' },
          { name: 'otpVerified', type: 'Boolean' },
          { name: 'otpAttempts', type: 'Int' },
          { name: 'catName / catBreed / …', type: 'String?' },
          { name: 'consumedAt', type: 'DateTime?' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [{ to: 'Cat', cardinality: '1:N', label: 'cats' }],
      },
      {
        name: 'Cat',
        table: 'cats',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'profileId', type: 'String?', flag: 'FK' },
          { name: 'onboardingSessionId', type: 'String?', flag: 'FK' },
          { name: 'name', type: 'String' },
          { name: 'breed', type: 'String?' },
          { name: 'marking', type: 'String?' },
          { name: 'sex', type: 'String' },
          { name: 'lifeStage', type: 'String' },
          { name: 'age', type: 'Int?' },
          { name: 'photoUrl', type: 'String?' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [
          { to: 'Profile', cardinality: 'N:1', label: 'profile' },
          { to: 'OnboardingSession', cardinality: 'N:1', label: 'onboardingSession' },
          { to: 'DietProfile', cardinality: '1:N', label: 'dietProfiles' },
          { to: 'BehaviorChat', cardinality: '1:N', label: 'behaviorChats' },
          { to: 'HealthTimelineInsight', cardinality: '1:N', label: 'healthTimelineInsights' },
          { to: 'PregnancySession', cardinality: '1:N', label: 'pregnancySessions' },
        ],
      },
    ],
  },
  {
    group: 'Diet Tracking',
    color: '#e9c46a',
    models: [
      {
        name: 'DietProfile',
        table: 'diet_profiles',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'profileId', type: 'String', flag: 'FK' },
          { name: 'catId', type: 'String?', flag: 'FK' },
          { name: 'weight', type: 'Float' },
          { name: 'isKg', type: 'Boolean' },
          { name: 'foodPreference', type: 'String' },
          { name: 'isSpayedNeutered', type: 'Boolean' },
          { name: 'isTracking', type: 'Boolean' },
          { name: 'waterIntake', type: 'Int' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [
          { to: 'Profile', cardinality: 'N:1', label: 'profile' },
          { to: 'Cat', cardinality: 'N:1', label: 'cat' },
          { to: 'DietMealLog', cardinality: '1:N', label: 'mealLogs' },
        ],
      },
      {
        name: 'DietMealLog',
        table: 'diet_meal_logs',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'dietProfileId', type: 'String', flag: 'FK' },
          { name: 'mealName', type: 'String' },
          { name: 'foodType', type: 'String?' },
          { name: 'amount', type: 'Float?' },
          { name: 'unit', type: 'String?' },
          { name: 'kcal', type: 'Float?' },
          { name: 'status', type: 'String' },
          { name: 'timestamp', type: 'String?' },
          { name: 'createdAt', type: 'DateTime', flag: 'IDX' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [{ to: 'DietProfile', cardinality: 'N:1', label: 'dietProfile' }],
      },
    ],
  },
  {
    group: 'Behavior Decoder',
    color: '#0f172a',
    models: [
      {
        name: 'BehaviorChat',
        table: 'behavior_chats',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'supabaseUserId', type: 'String', flag: 'IDX' },
          { name: 'catId', type: 'String?', flag: 'FK' },
          { name: 'title', type: 'String' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [
          { to: 'Cat', cardinality: 'N:1', label: 'cat' },
          { to: 'BehaviorMessage', cardinality: '1:N', label: 'messages' },
          { to: 'BehaviorLog', cardinality: '1:N', label: 'behaviorLogs' },
        ],
      },
      {
        name: 'BehaviorMessage',
        table: 'behavior_messages',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'chatId', type: 'String', flag: 'FK' },
          { name: 'speaker', type: "'wiz' | 'user'" },
          { name: 'text', type: 'String' },
          { name: 'analysis', type: 'Json?' },
          { name: 'createdAt', type: 'DateTime' },
        ],
        relations: [{ to: 'BehaviorChat', cardinality: 'N:1', label: 'chat' }],
      },
      {
        name: 'BehaviorLog',
        table: 'behavior_logs',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'chatId', type: 'String', flag: 'FK' },
          { name: 'supabaseUserId', type: 'String', flag: 'IDX' },
          { name: 'catId', type: 'String?', flag: 'IDX' },
          { name: 'behaviorType', type: 'String', flag: 'IDX' },
          { name: 'intensity', type: 'String' },
          { name: 'description', type: 'String' },
          { name: 'confidence', type: 'Float' },
          { name: 'createdAt', type: 'DateTime', flag: 'IDX' },
        ],
        relations: [{ to: 'BehaviorChat', cardinality: 'N:1', label: 'chat' }],
      },
    ],
  },
  {
    group: 'Health Timeline',
    color: '#2ec4b6',
    models: [
      {
        name: 'HealthTimelineInsight',
        table: 'health_timeline_insights',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'catId', type: 'String', flag: 'FK' },
          { name: 'type', type: 'String' },
          { name: 'summary', type: 'String' },
          { name: 'detail', type: 'String' },
          { name: 'severity', type: 'InsightSeverity' },
          { name: 'eventIds', type: 'Json' },
          { name: 'source', type: 'String' },
          { name: 'generatedAt', type: 'DateTime', flag: 'IDX' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [{ to: 'Cat', cardinality: 'N:1', label: 'cat' }],
      },
    ],
  },
  {
    group: 'Pregnancy Tracker',
    color: '#e9c46a',
    models: [
      {
        name: 'PregnancySession',
        table: 'pregnancy_sessions',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'catId', type: 'String', flag: 'FK' },
          { name: 'matingDate', type: 'DateTime' },
          { name: 'status', type: "'active' | 'completed'" },
          { name: 'expectedDeliveryDate', type: 'DateTime' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [
          { to: 'Cat', cardinality: 'N:1', label: 'cat' },
          { to: 'PregnancyLog', cardinality: '1:N', label: 'pregnancyLogs' },
          { to: 'PregnancyInsight', cardinality: '1:N', label: 'pregnancyInsights' },
        ],
      },
      {
        name: 'PregnancyLog',
        table: 'pregnancy_logs',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'pregnancySessionId', type: 'String', flag: 'FK' },
          { name: 'symptoms', type: 'String[]' },
          { name: 'moodBehavior', type: 'String[]' },
          { name: 'appetiteLevel', type: 'String?' },
          { name: 'energyLevel', type: 'String?' },
          { name: 'nestingObserved', type: 'Boolean' },
          { name: 'weight / temp', type: 'Float?' },
          { name: 'gestationWeek', type: 'Int', flag: 'IDX' },
          { name: 'notes', type: 'String?' },
          { name: 'logDate', type: 'DateTime' },
        ],
        relations: [{ to: 'PregnancySession', cardinality: 'N:1', label: 'pregnancySession' }],
      },
      {
        name: 'PregnancyInsight',
        table: 'pregnancy_insights',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'pregnancySessionId', type: 'String', flag: 'FK' },
          { name: 'insightType', type: 'String' },
          { name: 'title', type: 'String' },
          { name: 'body', type: 'String' },
          { name: 'gestationWeek', type: 'Int' },
          { name: 'isRead', type: 'Boolean', flag: 'IDX' },
          { name: 'createdAt', type: 'DateTime' },
        ],
        relations: [{ to: 'PregnancySession', cardinality: 'N:1', label: 'pregnancySession' }],
      },
    ],
  },
  {
    group: 'Content Lookup',
    color: '#0f172a',
    models: [
      {
        name: 'Plant',
        table: 'plants',
        fields: [
          { name: 'id', type: 'String', flag: 'PK' },
          { name: 'commonName', type: 'String', flag: 'IDX' },
          { name: 'scientificName', type: 'String', flag: 'UNIQUE' },
          { name: 'toxicityStatus', type: "'toxic'|'caution'|'safe'" },
          { name: 'severity', type: 'String?' },
          { name: 'clinicalSigns', type: 'String[]' },
          { name: 'source', type: "'aspca'|'perenual_cache'" },
          { name: 'lastVerifiedAt', type: 'DateTime' },
          { name: 'createdAt', type: 'DateTime' },
          { name: 'updatedAt', type: 'DateTime' },
        ],
        relations: [],
      },
    ],
  },
];

// ─── Relationship connector overlay ──────────────────────────────────────
// Draws SVG lines between related table cards, computed from their live
// DOM positions so it stays correct across the responsive grid + wrapping.

interface SchemaEdge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

/**
 * Orthogonal "elbow" connector — straight horizontal/vertical segments only,
 * bending at the midpoint. Reads far cleaner than a bezier curve once the
 * diagram has many overlapping relationships.
 */
function edgePath(e: SchemaEdge): string {
  const dx = e.x2 - e.x1;
  const dy = e.y2 - e.y1;
  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal cubic bezier curve
    const controlOffset = dx / 2;
    return `M ${e.x1} ${e.y1} C ${e.x1 + controlOffset} ${e.y1}, ${e.x2 - controlOffset} ${e.y2}, ${e.x2} ${e.y2}`;
  } else {
    // Vertical cubic bezier curve
    const controlOffset = dy / 2;
    return `M ${e.x1} ${e.y1} C ${e.x1} ${e.y1 + controlOffset}, ${e.x2} ${e.y2 - controlOffset}, ${e.x2} ${e.y2}`;
  }
}

/** By schema convention every FK field is named `${relationLabel}Id`. */
function fkFieldNameFor(label: string): string {
  return `${label}Id`;
}

/**
 * Watches the registered table-card DOM nodes (and their individual field
 * rows) and recomputes the edge coordinates (relative to `containerRef`)
 * whenever the layout changes. Lines anchor to the specific FK field row on
 * the source table and the PK ("id") row on the target table — like a
 * classic ER-diagram tool — falling back to the card's center if a field
 * row ref isn't available.
 */
function useSchemaConnectors(
  containerRef: React.RefObject<HTMLDivElement | null>,
  cardRefs: React.RefObject<Map<string, HTMLDivElement>>,
  fieldRefs: React.RefObject<Map<string, HTMLDivElement>>,
  positions: Record<string, { x: number; y: number }>,
  sizes: Record<string, { w: number; h: number }>,
  zoom: number,
) {
  const [edges, setEdges] = useState<SchemaEdge[]>([]);

  useEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const colorByModel = new Map<string, string>();
      DB_GROUPS.forEach((g) => g.models.forEach((m) => colorByModel.set(m.name, g.color)));

      const next: SchemaEdge[] = [];
      DB_GROUPS.forEach((g) => {
        g.models.forEach((m) => {
          m.relations.forEach((r) => {
            if (r.cardinality !== 'N:1') return; // one edge per relationship pair
            const fromCardEl = cardRefs.current.get(m.name);
            const toCardEl = cardRefs.current.get(r.to);
            if (!fromCardEl || !toCardEl) return;

            const fromCardRect = fromCardEl.getBoundingClientRect();
            const toCardRect = toCardEl.getBoundingClientRect();
            const fromCx = (fromCardRect.left + fromCardRect.width / 2 - containerRect.left) / zoom;
            const fromCy = (fromCardRect.top + fromCardRect.height / 2 - containerRect.top) / zoom;
            const toCx = (toCardRect.left + toCardRect.width / 2 - containerRect.left) / zoom;
            const toCy = (toCardRect.top + toCardRect.height / 2 - containerRect.top) / zoom;

            const goRight = toCx > fromCx;
            const goDown = toCy > fromCy;
            const horizontal = Math.abs(toCx - fromCx) > Math.abs(toCy - fromCy);

            // Prefer anchoring to the actual FK / PK field row so the line
            // visibly terminates "inside" each table rather than at its
            // midpoint or edge.
            const fromFieldEl = fieldRefs.current.get(`${m.name}::${fkFieldNameFor(r.label)}`);
            const toFieldEl = fieldRefs.current.get(`${r.to}::id`);

            let x1: number, y1: number, x2: number, y2: number;

            // Offset the target position by 7px back to accommodate the arrowhead marker cleanly
            const markerOffset = 7;

            if (horizontal) {
              x1 = ((goRight ? fromCardRect.right : fromCardRect.left) - containerRect.left) / zoom;
              y1 = fromFieldEl
                ? (fromFieldEl.getBoundingClientRect().top + fromFieldEl.getBoundingClientRect().height / 2 - containerRect.top) / zoom
                : fromCy;

              const targetXRaw = (goRight ? toCardRect.left : toCardRect.right) - containerRect.left;
              x2 = (targetXRaw / zoom) + (goRight ? -markerOffset : markerOffset);
              y2 = toFieldEl
                ? (toFieldEl.getBoundingClientRect().top + toFieldEl.getBoundingClientRect().height / 2 - containerRect.top) / zoom
                : toCy;
            } else {
              x1 = fromFieldEl
                ? (fromFieldEl.getBoundingClientRect().left + fromFieldEl.getBoundingClientRect().width / 2 - containerRect.left) / zoom
                : fromCx;
              y1 = ((goDown ? fromCardRect.bottom : fromCardRect.top) - containerRect.top) / zoom;

              x2 = toFieldEl
                ? (toFieldEl.getBoundingClientRect().left + toFieldEl.getBoundingClientRect().width / 2 - containerRect.left) / zoom
                : toCx;
              
              const targetYRaw = (goDown ? toCardRect.top : toCardRect.bottom) - containerRect.top;
              y2 = (targetYRaw / zoom) + (goDown ? -markerOffset : markerOffset);
            }

            next.push({ key: `${m.name}->${r.to}`, x1, y1, x2, y2, color: colorByModel.get(m.name) || TEAL });
          });
        });
      });

      setEdges(next);
    }

    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, sizes, zoom]);

  return edges;
}

function SchemaConnectorOverlay({ edges }: { edges: SchemaEdge[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      <defs>
        {edges.map((e) => (
          <marker
            key={`arrow-${e.key}`}
            id={`arrow-${e.key}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth={8}
            markerHeight={8}
            orient="auto-start-reverse"
          >
            {/* Bold, sharp arrowhead path pointing right */}
            <path d="M 0 1.5 L 10 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
          </marker>
        ))}
      </defs>
      {edges.map((e) => (
        <g key={e.key}>
          {/* Dark outline stroke gives the line contrast against any background */}
          <path d={edgePath(e)} fill="none" stroke="#0f172a" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
          {/* Colored fill stroke on top, thick enough to read at a glance even in a dense diagram */}
          <path
            d={edgePath(e)}
            fill="none"
            stroke={e.color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={`url(#arrow-${e.key})`}
          />
          <circle cx={e.x1} cy={e.y1} r={6.5} fill={e.color} stroke="#0f172a" strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
}

/** Neo-brutalist "table" card mimicking a database schema diagram node. */
function DbTableCard({
  model,
  accent,
  onRef,
  onFieldRef,
  highlightFields,
  style,
  onHeaderMouseDown,
  onResizeMouseDown,
}: {
  model: DbModel;
  accent: string;
  onRef?: (el: HTMLDivElement | null) => void;
  onFieldRef?: (fieldName: string, el: HTMLDivElement | null) => void;
  /** Field names that are the endpoint of a drawn connector — gets a subtle highlight. */
  highlightFields?: Set<string>;
  style?: React.CSSProperties;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
  onResizeMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      ref={onRef}
      style={style}
      className="absolute border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[5px_5px_0_0_rgba(15,23,42,1)] bg-white flex flex-col select-none"
    >
      {/* Table header */}
      <div
        onMouseDown={onHeaderMouseDown}
        className="px-4 py-2.5 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
        style={{ backgroundColor: '#0f172a' }}
      >
        <span className="font-mono font-black text-xs md:text-sm text-white truncate">{model.name}</span>
        <span
          className="flex-shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: accent, color: accent === '#0f172a' ? '#fff' : '#0f172a' }}
        >
          {model.table}
        </span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
        {model.fields.map((f) => {
          const isConnectorEndpoint = highlightFields?.has(f.name);
          return (
            <div
              key={f.name}
              ref={(el) => onFieldRef?.(f.name, el)}
              className="flex items-center gap-2 px-4 py-1.5 transition-colors"
              style={isConnectorEndpoint ? { backgroundColor: '#EEF9F8' } : undefined}
            >
              {f.flag ? (
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] border border-slate-900"
                  style={{ backgroundColor: FLAG_STYLE[f.flag].bg, color: FLAG_STYLE[f.flag].fg }}
                  title={f.flag}
                >
                  {FLAG_STYLE[f.flag].icon}
                </span>
              ) : (
                <span className="flex-shrink-0 w-5 h-5" />
              )}
              <span className="font-mono text-[11px] font-bold text-slate-900 truncate">{f.name}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-400 truncate">{f.type}</span>
            </div>
          );
        })}
      </div>

      {/* Relations */}
      {model.relations.length > 0 && (
        <div className="border-t-2 border-slate-900 px-4 py-2 flex flex-wrap gap-1.5 flex-shrink-0" style={{ backgroundColor: '#EEF9F8' }}>
          {model.relations.map((r) => (
            <span
              key={r.to + r.label}
              className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-900 bg-white text-slate-700"
              title={r.label}
            >
              {r.cardinality === 'N:1' ? '→' : '⇉'} {r.to}
              <span className="text-slate-400 font-bold">{r.cardinality}</span>
            </span>
          ))}
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center z-20 select-none bg-slate-900 rounded-tl-md border-l border-t border-slate-900"
        title="Drag to resize"
      >
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="text-white opacity-70">
          <path d="M6 0L0 6M6 3L3 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** Renders every DB_GROUPS model as a draggable and resizable card layout with relationship lines. */
function DbSchemaDiagram({ zoom = 1 }: { zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [containerWidth, setContainerWidth] = useState(800);

  // Observe container width dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute visible models based on filter selection
  const visibleModels = useMemo(() => {
    const models = new Set<string>();
    DB_GROUPS.forEach((g) => {
      if (activeGroup === 'all' || g.group === activeGroup) {
        g.models.forEach((m) => models.add(m.name));
      }
    });
    return models;
  }, [activeGroup]);

  // Set default coordinates to group related tables together and reduce line lengths
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({
    // Core / Identity
    Profile: { x: 20, y: 20 },
    OnboardingSession: { x: 20, y: 320 },
    Cat: { x: 20, y: 620 },

    // Diet Tracking
    DietProfile: { x: 300, y: 20 },
    DietMealLog: { x: 300, y: 320 },

    // Behavior Decoder
    BehaviorChat: { x: 300, y: 620 },
    BehaviorMessage: { x: 300, y: 920 },
    BehaviorLog: { x: 300, y: 1220 },

    // Health Timeline
    HealthTimelineInsight: { x: 580, y: 20 },

    // Pregnancy Tracker
    PregnancySession: { x: 580, y: 320 },
    PregnancyLog: { x: 580, y: 620 },
    PregnancyInsight: { x: 580, y: 920 },

    // Content Lookup
    Plant: { x: 580, y: 1220 },
  });

  // Re-center tables when filtered category is selected
  useEffect(() => {
    const cardWidth = 220;
    const xCenter = (containerWidth / zoom - cardWidth) / 2;

    if (activeGroup === 'all') {
      setPositions({
        Profile: { x: 20, y: 20 },
        OnboardingSession: { x: 20, y: 320 },
        Cat: { x: 20, y: 620 },
        DietProfile: { x: 300, y: 20 },
        DietMealLog: { x: 300, y: 320 },
        BehaviorChat: { x: 300, y: 620 },
        BehaviorMessage: { x: 300, y: 920 },
        BehaviorLog: { x: 300, y: 1220 },
        HealthTimelineInsight: { x: 580, y: 20 },
        PregnancySession: { x: 580, y: 320 },
        PregnancyLog: { x: 580, y: 620 },
        PregnancyInsight: { x: 580, y: 920 },
        Plant: { x: 580, y: 1220 },
      });
    } else {
      const group = DB_GROUPS.find((g) => g.group === activeGroup);
      if (group) {
        const nextPos: Record<string, { x: number; y: number }> = {};
        group.models.forEach((m, idx) => {
          nextPos[m.name] = {
            x: xCenter,
            y: idx * 300 + 20,
          };
        });
        setPositions(nextPos);
      }
    }
  }, [activeGroup, containerWidth, zoom]);

  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>(() => {
    const sz: Record<string, { w: number; h: number }> = {};
    DB_GROUPS.forEach((g) => {
      g.models.forEach((m) => {
        // Smaller default size (220 width, 240 height)
        sz[m.name] = { w: 220, h: 240 };
      });
    });
    return sz;
  });

  const edges = useSchemaConnectors(containerRef, cardRefs, fieldRefs, positions, sizes, zoom);

  // Filter edges to only connect visible models
  const visibleEdges = useMemo(() => {
    return edges.filter((e) => {
      const [from, to] = e.key.split('->');
      return visibleModels.has(from) && visibleModels.has(to);
    });
  }, [edges, visibleModels]);

  const handleHeaderMouseDown = (modelName: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = positions[modelName] || { x: 0, y: 0 };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setPositions((prev) => ({
        ...prev,
        [modelName]: {
          x: Math.max(0, startPos.x + dx),
          y: Math.max(0, startPos.y + dy),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (modelName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = sizes[modelName] || { w: 220, h: 240 };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setSizes((prev) => ({
        ...prev,
        [modelName]: {
          w: Math.max(160, startSize.w + dx),
          h: Math.max(120, startSize.h + dy),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Field names that are a drawn connector's endpoint, keyed by model
  const highlightsByModel = new Map<string, Set<string>>();
  DB_GROUPS.forEach((g) =>
    g.models.forEach((m) => {
      m.relations.forEach((r) => {
        if (r.cardinality !== 'N:1') return;
        if (!highlightsByModel.has(m.name)) highlightsByModel.set(m.name, new Set());
        highlightsByModel.get(m.name)!.add(fkFieldNameFor(r.label));
        if (!highlightsByModel.has(r.to)) highlightsByModel.set(r.to, new Set());
        highlightsByModel.get(r.to)!.add('id');
      });
    }),
  );

  // Compute total height dynamically so container wraps all visible elements
  const visiblePositions = Object.entries(positions).filter(([name]) => visibleModels.has(name));
  const containerHeight = visiblePositions.length > 0
    ? Math.max(...visiblePositions.map(([_, p]) => p.y + 300), 500)
    : 500;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Category filter bar */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 border-2 border-slate-900 rounded-2xl select-none z-20">
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeGroup === 'all'
              ? 'bg-slate-900 text-white shadow-[2px_2px_0_0_rgba(46,196,182,1)]'
              : 'bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {DB_GROUPS.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setActiveGroup(g.group)}
            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === g.group
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
            style={activeGroup === g.group ? { boxShadow: `2px 2px 0 0 ${g.color}` } : undefined}
          >
            {g.group}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full border-2 border-dashed border-slate-300 rounded-[2rem] bg-slate-50/50 transition-[height] duration-300"
        style={{ height: containerHeight }}
      >
        <SchemaConnectorOverlay edges={visibleEdges} />
        {DB_GROUPS.map((g) => {
          if (activeGroup !== 'all' && g.group !== activeGroup) return null;
          return g.models.map((m) => {
            const pos = positions[m.name] || { x: 0, y: 0 };
            const size = sizes[m.name] || { w: 220, h: 240 };
            return (
              <DbTableCard
                key={m.name}
                model={m}
                accent={g.color}
                highlightFields={highlightsByModel.get(m.name)}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${size.w}px`,
                  height: `${size.h}px`,
                }}
                onRef={(el) => {
                  if (el) cardRefs.current.set(m.name, el);
                  else cardRefs.current.delete(m.name);
                }}
                onFieldRef={(fieldName, el) => {
                  const key = `${m.name}::${fieldName}`;
                  if (el) fieldRefs.current.set(key, el);
                  else fieldRefs.current.delete(key);
                }}
                onHeaderMouseDown={(e) => handleHeaderMouseDown(m.name, e)}
                onResizeMouseDown={(e) => handleResizeMouseDown(m.name, e)}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

/**
 * Collapsed, non-interactive preview of the full schema diagram. Scaled down
 * and height-clamped with a fade-out mask, topped with a "click to expand"
 * overlay button — avoids dumping the (very tall) full diagram straight into
 * the document flow.
 */
function SchemaThumbnail({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[5px_5px_0_0_rgba(15,23,42,1)] bg-white">
      <div className="h-[380px] md:h-[440px] overflow-hidden relative select-none" style={{ backgroundColor: '#EEF9F8' }}>
        <div
          className="pointer-events-none p-6 origin-top-left"
          style={{ transform: 'scale(0.4)' }}
          aria-hidden="true"
        >
          <DbSchemaDiagram zoom={0.4} />
        </div>
        {/* Fade-out mask so the truncation reads intentionally, not "cut off" */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/85 to-transparent" />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
      >
        <span
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:shadow-none"
          style={{ backgroundColor: '#0f172a', color: '#fff' }}
        >
          <Search className="w-4 h-4" style={{ color: TEAL }} />
          Click to view full schema
        </span>
      </button>
    </div>
  );
}

/**
 * Full-schema modal — scrollable + zoomable, since the diagram is much
 * taller than any single viewport.
 */
function SchemaFullViewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: 'spring', duration: 0.35 }}
              role="dialog"
              aria-modal="true"
              aria-label="Full database schema diagram"
              className="bg-white border-2 border-slate-900 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-6xl h-[92vh] md:h-[88vh] shadow-[8px_8px_0_0_rgba(15,23,42,1)] pointer-events-auto flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-slate-900 flex-shrink-0"
                style={{ backgroundColor: '#0f172a' }}
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: TEAL }}>
                    Full Schema
                  </span>
                  <h3 className="text-base md:text-xl font-black uppercase tracking-tight text-white truncate">
                    Database Schema Diagram
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 border-2 border-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black text-white w-10 text-center tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 border-2 border-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center border-2 border-slate-900 rounded-xl transition-all cursor-pointer active:scale-95 ml-1"
                    style={{ backgroundColor: TEAL, color: '#fff' }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable + zoomable body */}
              <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#EEF9F8' }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                  <DbSchemaDiagram zoom={zoom} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t-2 border-slate-900 bg-white flex-shrink-0 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                  Scroll to explore · use +/− to zoom · Esc to close
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-slate-900 rounded-full text-xs font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Docs() {
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-200 pb-24">
      {/* Sticky in-page nav */}
      <nav className="sticky top-0 z-30 bg-slate-200/90 backdrop-blur-sm border-b-2 border-slate-900">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <Link
            to="/"
            className="flex-shrink-0 font-black uppercase tracking-tight text-slate-900 text-sm mr-2"
          >
            🐾 PawWiz
          </Link>
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="flex-shrink-0 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 border-2 border-transparent hover:border-slate-900 rounded-full transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-10 space-y-10">
        {/* SECTION 1 — HERO */}
        <SectionCard id="overview" eyebrow="PawWiz Engineering" title="Documentation">
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mb-8">
            A judge-ready reference for the PawWiz AI cat-health assistant: the visual system,
            architecture, security posture, test strategy, and everything needed to stand the
            project up locally.
          </p>

          {/* Palette */}
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Palette</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            {PALETTE.map((c) => (
              <div key={c.hex} className="border-2 border-slate-900 rounded-2xl overflow-hidden">
                <div className={`h-16 flex items-end p-2 ${c.text}`} style={{ backgroundColor: c.hex }}>
                  <span className="text-[10px] font-black uppercase tracking-wider">{c.hex}</span>
                </div>
                <div className="px-2 py-1.5 bg-white text-[10px] font-black uppercase tracking-wide text-slate-700">
                  {c.name}
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Typography</h3>
          <div className="grid gap-3 md:grid-cols-2 mb-10">
            <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white">
              <p className="text-3xl font-black uppercase tracking-tight text-slate-900">Heading</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                font-black · uppercase · tracking-tight
              </p>
            </div>
            <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white">
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: TEAL }}>
                Eyebrow Label
              </p>
              <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                Body copy uses medium slate for readable rhythm across cards.
              </p>
            </div>
          </div>

          {/* UI design tokens */}
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">UI Design Language</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
              <p className="text-xs font-black uppercase text-slate-900">Card</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">border-2 · hard shadow · rounded-[2.5rem]</p>
            </div>
            <button className="p-4 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0_0_rgba(15,23,42,1)] font-black uppercase text-xs cursor-default">
              Primary Button
            </button>
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl">
              <p className="text-xs font-black uppercase text-slate-400">Dashed Slot</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">optional / add states</p>
            </div>
          </div>
        </SectionCard>

        {/* SECTION 2 — ENVIRONMENT */}
        <SectionCard id="environment" eyebrow="Section 02" title="Environment Variables">
          <p className="text-sm text-slate-600 font-medium mb-6">
            Load them either from a single root <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env</code> file
            (copy <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env.example</code> at the repo root) or inject
            at dev time via Infisical (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">infisical run --</code>).
            The backend degrades gracefully to mocks when optional AI keys are absent.
          </p>
          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-black">Variable</th>
                  <th className="px-4 py-3 font-black">Scope</th>
                  <th className="px-4 py-3 font-black">Required</th>
                  <th className="px-4 py-3 font-black">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 bg-white">
                {ENV_VARS.map((v) => (
                  <tr key={v.key}>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-bold text-slate-900">{v.key}</span>
                        <CopyButton value={v.key} label={v.key} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-600">{v.scope}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        style={
                          v.required === 'Required'
                            ? { backgroundColor: TEAL, color: '#fff' }
                            : { backgroundColor: '#e2e8f0', color: '#475569' }
                        }
                      >
                        {v.required}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">{v.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Code
              lang="bash"
              code={`# 1. install deps (npm workspaces)\nnpm install\n\n# 2. set up env — copy the single root template, then fill in values\ncp .env.example .env\n\n# 3a. run migrations + start (LOCAL root .env, no Infisical)\nnpm run prisma:deploy -w packages/pawwiz-backend\nnpm run dev:local\n\n# 3b. or, using Infisical for secret injection\ninfisical run -- npx prisma migrate deploy -w packages/pawwiz-backend\nnpm run dev\n\n# frontend → localhost:5173   backend → localhost:3001`}
            />
          </div>
        </SectionCard>

        {/* SECTION 3 — SECURITY */}
        <SectionCard id="security" eyebrow="Section 03" title="Security">
          <p className="text-sm text-slate-600 font-medium mb-6">
            Defense-in-depth across the auth surface, hardened against the OWASP Top 10
            (A01 · A04 · A07): Supabase JWT verification with issuer + audience validation,
            Zod input gating, HTML sanitization, IP-based rate limiting behind a trusted proxy,
            Helmet headers, honeypot bot traps, and OTP email verification with per-session
            brute-force lockout and enumeration-safe responses.
          </p>
          <div className="grid gap-5 md:grid-cols-2 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">JWT Verification</h3>
              <Code code={AUTH_SNIPPET} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Honeypot Trap</h3>
              <Code code={HONEYPOT_SNIPPET} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-5 mb-2">Zod Validation Gate</h3>
              <Code code={VALIDATE_SNIPPET} />
            </div>
          </div>

          {/* OWASP hardening delivered in the security & performance refactor */}
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-8 mb-3">
            OWASP Hardening
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {HARDENING.map((h) => (
              <div key={h.title} className="p-4 bg-white border-2 border-slate-900 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black uppercase text-sm text-slate-900">{h.title}</p>
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: TEAL, color: '#fff' }}
                  >
                    {h.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{h.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* SECTION 4 — TESTING */}
        <SectionCard id="testing" eyebrow="Section 04" title="Testing & API">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Test Strategy</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {TEST_LAYERS.map((t) => (
              <div key={t.name} className="p-4 bg-white border-2 border-slate-900 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black uppercase text-sm text-slate-900">{t.name}</p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9F8', color: '#115e59' }}>
                    {t.tool}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600">{t.target}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{t.note}</p>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
            API Endpoints
            <span className="ml-2 text-slate-300">{API_GROUPS.reduce((n, g) => n + g.endpoints.length, 0)} routes</span>
          </h3>
          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden overflow-x-auto mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-black">Method</th>
                  <th className="px-4 py-3 font-black">Path</th>
                  <th className="px-4 py-3 font-black">Auth</th>
                  <th className="px-4 py-3 font-black">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {API_GROUPS.map((g) => (
                  <Fragment key={g.group}>
                    <tr style={{ backgroundColor: '#EEF9F8' }}>
                      <td colSpan={4} className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-teal-800">
                        {g.group}
                      </td>
                    </tr>
                    {g.endpoints.map((e) => (
                      <tr key={e.method + e.path} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <span
                            className="font-mono font-black text-[10px] px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: METHOD_COLORS[e.method] }}
                          >
                            {e.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{e.path}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                            style={AUTH_BADGE[e.auth]}
                          >
                            {e.auth === 'jwt' ? '🔒 JWT' : e.auth === 'optional' ? '◐ Optional' : 'Public'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">{e.desc}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Run the Suites</h3>
          <Code
            lang="bash"
            code={`# backend — vitest + fast-check + supertest\nnpm run test -w packages/pawwiz-backend\n\n# frontend — vitest + testing-library\nnpm run test -w packages/pawwiz-frontend`}
          />

          {/* Interactive IDE */}
          <div className="mt-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Interactive Test Explorer</h3>
            <TestIDE />
          </div>
        </SectionCard>

        {/* SECTION 5 — INTERACTIVE DIAGRAMS */}
        <SectionCard id="diagrams" eyebrow="Section 05" title="Interactive Diagrams">
          <p className="text-sm text-slate-600 font-medium mb-6">
            Trace a request from the browser, through the nginx reverse proxy, into the MRSC layering
            (Middleware → Routes → Services → Controllers, with Repositories for data access). Press
            play to watch a diet request move through the stack.
          </p>
          <RequestSimulator />
        </SectionCard>

        {/* SECTION 6 — DATABASE SCHEMA */}
        <SectionCard id="database" eyebrow="Section 06" title="Database Schema">
          <p className="text-sm text-slate-600 font-medium mb-6">
            13 Prisma models on PostgreSQL, grouped by feature domain. User credentials live in
            Supabase Auth — every table here only stores app-specific data, joined back to the
            account via <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">supabaseUserId</code>.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-8 p-3 border-2 border-slate-900 rounded-2xl bg-white">
            {(Object.entries(FLAG_STYLE) as [FieldFlag, typeof FLAG_STYLE[FieldFlag]][]).map(([flag, s]) => (
              <span key={flag} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] border border-slate-900"
                  style={{ backgroundColor: s.bg, color: s.fg }}
                >
                  {s.icon}
                </span>
                {flag === 'PK' ? 'Primary Key' : flag === 'FK' ? 'Foreign Key' : flag === 'UNIQUE' ? 'Unique' : 'Indexed'}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 ml-auto">
              <span className="text-teal-600">→</span> N:1 <span className="text-teal-600 ml-2">⇉</span> 1:N
            </span>
          </div>

          {/* Model groups (with SVG relationship connectors overlay) — collapsed preview, click to expand */}
          <SchemaThumbnail onOpen={() => setSchemaModalOpen(true)} />
          <SchemaFullViewModal isOpen={schemaModalOpen} onClose={() => setSchemaModalOpen(false)} />

          {/* Migration commands */}
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-10 mb-3">Prisma Commands</h3>
          <Code
            lang="bash"
            code={`# generate the client from schema.prisma\nnpx prisma generate -w packages/pawwiz-backend\n\n# create + apply a new migration (dev)\nnpx prisma migrate dev -w packages/pawwiz-backend\n\n# apply committed migrations (prod / CI)\nnpm run prisma:deploy -w packages/pawwiz-backend\n\n# open Prisma Studio to browse data\nnpx prisma studio -w packages/pawwiz-backend`}
          />
        </SectionCard>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
