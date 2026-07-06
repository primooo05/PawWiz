import { Fragment, useState } from 'react';
import { SectionCard, Code } from './shared';
import { TEST_FILES } from '../docsTestFiles';

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

const TEAL = '#2ec4b6';

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
        <span className="text-[10px] open-arrow">{open ? '▼' : '▶'}</span>
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

export function TestingSection() {
  return (
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
  );
}
