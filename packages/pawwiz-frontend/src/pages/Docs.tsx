import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEST_FILES } from './docsTestFiles';

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
      { method: 'POST', path: '/api/auth/recover', auth: 'public', desc: 'Password reset email. Rate-limited 3/15min; identical response regardless of email existence.' },
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
      { method: 'POST', path: '/api/onboarding/start', auth: 'public', desc: 'Start an onboarding session.' },
      { method: 'GET', path: '/api/onboarding/session/:id', auth: 'public', desc: 'Fetch onboarding session state.' },
      { method: 'POST', path: '/api/onboarding/session/:id/update', auth: 'public', desc: 'Persist a step of the onboarding wizard.' },
      { method: 'POST', path: '/api/onboarding/session/:id/send-otp', auth: 'public', desc: 'Send an email OTP challenge.' },
      { method: 'POST', path: '/api/onboarding/session/:id/verify-otp', auth: 'public', desc: 'Verify the submitted OTP code.' },
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
  { name: 'Unit + Property', tool: 'Vitest + fast-check', target: 'Services, guards, validators', note: 'Property-based invariants over generated inputs.' },
  { name: 'Middleware', tool: 'Vitest', target: 'auth, honeypot, turnstile, sanitizer', note: 'Isolated req/res behavior + 403 traps.' },
  { name: 'HTTP / API', tool: 'Supertest', target: 'Route handlers end-to-end', note: 'Status codes, payload shapes, error paths.' },
  { name: 'Frontend', tool: 'Testing Library + fast-check', target: 'Hooks, forms, screens', note: 'Zod validation + accessible error states.' },
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
            { name: 'diet.service.test.ts', path: 'services/__tests__/diet.service.test.ts', code: '' },
            { name: 'onboarding.otp.service.test.ts', path: 'services/__tests__/onboarding.otp.service.test.ts', code: '' },
            { name: 'onboarding.service.test.ts', path: 'services/__tests__/onboarding.service.test.ts', code: '' },
            { name: 'otp.service.test.ts', path: 'services/__tests__/otp.service.test.ts', code: '' },
            { name: 'profile.service.test.ts', path: 'services/__tests__/profile.service.test.ts', code: '' },
            { name: 'toxicity_cache.service.test.ts', path: 'services/__tests__/toxicity_cache.service.test.ts', code: '' },
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
            { name: 'keyword-extractor.test.ts', path: 'utils/__tests__/keyword-extractor.test.ts', code: '' },
          ],
        },
      ],
    },
    {
      name: 'pawwiz-frontend/src/__tests__/',
      files: [
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
            PawWiz Test Explorer
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

const AUTH_SNIPPET = `// middleware/auth.ts — Supabase JWT verification
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}`;

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

export default function Docs() {
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
            Injected at dev time via Infisical (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">infisical run --</code>).
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
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.key}</td>
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
              code={`# 1. install deps (npm workspaces)\nnpm install\n\n# 2. run migrations (Infisical injects DATABASE_URL)\ninfisical run -- npx prisma migrate deploy -w packages/pawwiz-backend\n\n# 3. start both apps (env via Infisical)\nnpm run dev\n# frontend → localhost:5173   backend → localhost:3001`}
            />
          </div>
        </SectionCard>

        {/* SECTION 3 — SECURITY */}
        <SectionCard id="security" eyebrow="Section 03" title="Security">
          <p className="text-sm text-slate-600 font-medium mb-6">
            Defense-in-depth on the auth surface: JWT verification, Zod input gating, HTML
            sanitization, rate limiting, Helmet headers, plus a honeypot + Cloudflare Turnstile combo.
          </p>
          <div className="grid gap-5 md:grid-cols-2 mb-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">JWT Verification</h3>
              <Code code={AUTH_SNIPPET} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Honeypot Trap</h3>
              <Code code={HONEYPOT_SNIPPET} />
            </div>
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Zod Validation Gate</h3>
          <Code code={VALIDATE_SNIPPET} />
        </SectionCard>

        {/* SECTION 4 — TESTING */}
        <SectionCard id="testing" eyebrow="Section 04" title="Testing & API">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Test Strategy</h3>
          <div className="grid gap-3 sm:grid-cols-2 mb-8">
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
