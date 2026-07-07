import { Code, SectionCard, TEAL } from './shared';

const AIKIDO_FINDINGS = [
  {
    num: '01',
    category: 'Exposure of Sensitive Information',
    detail:
      'OTP hashes, bearer tokens, supabaseUserId, and full request bodies were exposed via API responses and server logs across 8 files (19 instances).',
    fixedIn: 'Vulnerabilities 7 & 9',
    commits: ['666d220', 'b1890f5'],
  },
  {
    num: '02',
    category: 'Insecure Direct Object Reference (IDOR)',
    detail:
      'POST /api/timeline/:catId/insights/refresh used the victim cat\'s stored owner ID for the ownership check, making it tautological — any authenticated user could trigger AI processing of another user\'s cat data.',
    fixedIn: 'Vulnerability 8',
    commits: ['6e8635b'],
  },
  {
    num: '03',
    category: 'Server-Side Request Forgery (SSRF)',
    detail:
      'cat.photoUrl was fetched server-side during PDF export with no destination allowlist, enabling SSRF to internal services (AWS metadata, loopback, VPC).',
    fixedIn: 'Vulnerability 6',
    commits: ['2aa6496'],
  },
];

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

const HARDENING = [
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

export function SecuritySection() {
  return (
    <SectionCard id="security" eyebrow="Section 03" title="Security">
      <p className="text-sm text-slate-600 font-medium mb-8">
        Defense-in-depth across the auth surface, hardened against the OWASP Top 10
        (A01 · A04 · A07): Supabase JWT verification with issuer + audience validation,
        Zod input gating, HTML sanitization, IP-based rate limiting behind a trusted proxy,
        Helmet headers, honeypot bot traps, and OTP email verification with per-session
        brute-force lockout and enumeration-safe responses.
      </p>

      {/* ── Aikido Audit Findings ─────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Aikido AI Code Audit — Resolved Findings
          </h3>
          <span
            className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
          >
            ✓ 3 / 3 Resolved
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {AIKIDO_FINDINGS.map((f) => (
            <div
              key={f.num}
              className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0_0_rgba(15,23,42,1)] flex flex-col gap-2"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TEAL, color: '#fff' }}
                >
                  #{f.num}
                </span>
                <span
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                >
                  ✓ Fixed
                </span>
              </div>

              {/* Category */}
              <p className="font-black text-sm text-slate-900 leading-snug">{f.category}</p>

              {/* Description */}
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex-1">{f.detail}</p>

              {/* Footer — fix reference */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400">{f.fixedIn}</span>
                {f.commits.map((c) => (
                  <code
                    key={c}
                    className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    {c}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Code snippets ─────────────────────────────────────────────── */}
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

      {/* ── OWASP hardening ───────────────────────────────────────────── */}
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
  );
}
