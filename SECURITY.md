# Security Policy

## Vulnerability Disclosure

We take security seriously and appreciate responsible disclosure. If you discover a security vulnerability in PawWiz, please report it privately to **security.pawwiz@gmail.com** with:

1. A clear description of the vulnerability
2. Steps to reproduce (if applicable)
3. Potential impact
4. Your suggested fix (optional)

**Please do not open public GitHub issues for security vulnerabilities.** We will acknowledge receipt within 48 hours and provide a timeline for remediation.

### Disclosure Timeline

- **Initial Report**: We acknowledge within 48 hours
- **Triage & Fix**: We aim to deliver a fix within 14 days for critical issues
- **Embargo**: We request a 30-day embargo before public disclosure to allow our users time to update
- **Credit**: We will publicly credit the researcher (unless they prefer anonymity)

---

## How PawWiz Implements Security

### Authentication

All protected API routes verify a Supabase-issued JWT on every request. The backend supports two verification paths:

- **Primary**: ES256 signature verification via Supabase's JWKS endpoint (`jsonwebtoken` + `jwks-rsa`)
- **Fallback**: HS256 symmetric verification using `SUPABASE_JWT_SECRET` for legacy token compatibility

Both paths extract `sub` (the Supabase user ID) and `email` claims, which are used for all downstream authorization decisions. Tokens are never cached server-side — each request is independently verified.

### Authorization

Every endpoint that accesses user-owned data performs an explicit ownership check before returning or modifying anything:

- **Profile, diet, and cat data**: queries are scoped to `supabaseUserId` at the Prisma level, so a user cannot retrieve or mutate another user's records even if they supply a valid resource ID
- **Multi-resource operations** (e.g., insight refresh, PDF export): `timelineService.verifyOwnership(catId, callerUserId)` is called with the *caller's* JWT sub — not values extracted from the target resource — preventing tautological checks
- **Behavior chats and messages**: `belongsToUser(chatId, supabaseUserId)` is called before any read or write on chat data

### Input Validation

All user-supplied data is validated using Zod schemas before it reaches service logic:

- Request bodies and query strings pass through the `validate` middleware, which parses with Zod and replaces `req.body` with the cleaned, type-safe result
- File uploads are validated by multer: JPEG/PNG/WebP/GIF only, 5MB maximum, MIME type enforced server-side
- URL fields (e.g., `photoUrl`) are validated against the Supabase Storage origin at schema level, so arbitrary external URLs are rejected before reaching the database

### Security Headers

Helmet middleware is mounted as the first layer in the Express pipeline, enabling all 14 of its default protections:

- `Strict-Transport-Security` (HSTS) — enforces HTTPS
- `Content-Security-Policy` — restricts script, style, and frame sources
- `X-Frame-Options: DENY` — blocks clickjacking via iframe embedding
- `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing
- `Referrer-Policy` — controls referrer header exposure
- `X-DNS-Prefetch-Control`, `X-XSS-Protection`, and others

### Bot Protection

Three layers work together to prevent automated abuse:

1. **Honeypot fields** — invisible form fields on sensitive endpoints. Any request that fills them is silently rejected with a 403 before any business logic runs.
2. **Rate limiting** (`express-rate-limit`) — separate limiters for login, registration, OTP send/verify, email check, search, and scan endpoints, enforced by `X-Real-IP` (set by nginx upstream).
3. **OTP email verification** — onboarding completion is gated behind a 6-digit code sent to the user's email, binding the registration to mailbox possession.

### SSRF Prevention

Two independent guards prevent server-side request forgery:

1. **Schema-level allowlist**: The `updateAvatarSchema` Zod schema validates that `photoUrl` matches the application's own Supabase Storage hostname (derived from `SUPABASE_URL` at runtime). Any URL pointing to a different origin is rejected at validation before reaching the database.
2. **Fetch-time DNS + IP guard** (`assertSafeFetchUrl()` in `pdf.service.ts`): Before any outbound `fetch()` call during PDF export, the hostname is resolved via DNS and each resolved address is checked against blocked ranges:
   - Loopback: `127.0.0.0/8`, `::1`
   - RFC1918 private: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-local / metadata endpoint: `169.254.0.0/16`, `fe80::/10`
   - CGNAT: `100.64.0.0/10`
   - ULA: `fc00::/7`, `fd00::/7`
   - IPv4-mapped IPv6: `::ffff:/96`
   - Only `https:` scheme is permitted — `http:`, `file:`, `data:` are all rejected

### Sensitive Data in Logs and Responses

Winston (console + file transport) is used for all server-side logging. Logging rules enforced in the codebase:

- **No PII in logs**: `supabaseUserId`, email addresses, and owner names are never logged at `info` level or above
- **No credentials in logs**: OTP codes, password-reset links (which contain bearer tokens), and API keys are never written to any transport
- **No raw request bodies in logs**: The validation middleware logs only field *names* on failure, never field *values*
- **No SDK internals in HTTP responses**: Storage SDK error messages are logged internally at `error` level but the client receives only a generic message

API response bodies are explicitly shaped — raw Prisma ORM objects are never returned. Fields like `supabaseUserId`, `otpHash`, `otpExpiresAt`, and `sessionToken` are excluded from all client-facing responses via Prisma `select` projections.

### OTP Security

The onboarding email-verification flow applies several defenses in depth:

- **15-minute TTL**: OTP codes expire 15 minutes after issuance
- **60-second resend cooldown**: Enforced at the service layer; the endpoint returns `{ cooldownSeconds: 60 }` regardless of whether the email is registered (prevents account enumeration)
- **3-attempt lockout**: After 3 failed verify attempts the active code is invalidated and a fresh `sendOtp()` is required, bounding online guessing to 3 guesses per issued code
- **Hash never exposed**: The stored SHA-256 OTP hash is excluded from every API response via the `updatePublic()` repository projection, making offline brute-force impossible without access to the database

### Session Binding for Public Flows

The onboarding flow is public (unauthenticated), so session binding uses a separate token:

- On `POST /api/onboarding/start`, a cryptographically random UUID `sessionToken` is generated server-side, stored in the database, and returned once to the client
- All subsequent mutating operations (`update`, `send-otp`, `verify-otp`) require this token via the `X-Session-Token` header
- A missing or mismatched token returns `401` — knowledge of the session UUID alone is insufficient to advance or modify the session

### AI Prompt Integrity

User-typed content is never inserted raw into AI prompts:

- All user-controlled text is wrapped in explicit `<user_input>...</user_input>` delimiters in every prompt, signalling to the model that the enclosed content is untrusted
- Gemini's `generateText()` includes a `systemInstruction` that explicitly forbids following directives inside `<user_input>` blocks
- Groq's system message contains a `<security_boundary>` block with the same instruction
- Both providers are invoked with structured output schemas (Groq: `response_format: { type: 'json_object' }`, Gemini: `responseJsonSchema`). Any response deviating from the schema fails `JSON.parse()` and falls to the deterministic heuristic — no injected output can be persisted as a trusted analysis record
- A pre-filter layer (`checkInappropriate()`, `checkOffTopic()` in `prompt-validator.ts`) intercepts common abuse patterns before they reach the AI

**Toxicity verdicts are immune to prompt injection**: The ASPCA database is the sole source of toxicity truth. AI output (Gemini Vision) is used only to identify the plant's name; the actual toxic/safe classification is always derived from the local ASPCA dataset.

---

## Known Limitations

### Stateless JWT Auth — Tokens Remain Valid After Password Reset

**Root cause**: The backend verifies JWT signatures on every request but maintains no revocation store. Once issued, a token is valid until expiry even if the account password is subsequently changed.

**What we did**:
- Tokens are short-lived (enforced by Supabase's Auth infrastructure)
- The `/reset-password` flow calls `supabase.auth.signOut()` after the reset completes, destroying the recovery session
- Rate limiting on `POST /api/auth/recover` prevents rapid successive recovery link requests

**Residual risk**: An attacker who obtains a valid token before a password reset retains API access until that token's natural expiry. Full mitigation requires a Redis-backed token denylist or Supabase Admin `signOut(userId, 'others')` on password change — accepted as a known limitation pending infrastructure investment.

---

### Prompt Injection via Behavior Chat

**Root cause**: User-typed behavior descriptions are passed to Groq and Gemini after lightweight pre-filtering. A sufficiently novel payload could attempt to override system instructions.

**What we did**: See [AI Prompt Integrity](#ai-prompt-integrity) above.

**Residual risk**: Novel indirect injection payloads cannot be fully eliminated at the application layer. The impact is bounded: the toxicity scanner is immune (ASPCA is ground truth), and the structured output schema prevents injected content from persisting as authoritative behavioral data.

---

### Email Delivery — No Delivery Confirmation

**Root cause**: OTP and recovery emails are sent via Gmail SMTP. The backend cannot confirm delivery to the recipient's inbox.

**What we did**: See [OTP Security](#otp-security) above.

**Residual risk**: If a user's email inbox is compromised, an attacker can receive the OTP directly. This is outside the application's trust boundary.

---

## Fixed Vulnerabilities

### CVE-2025-13033, CVE-2025-14874, GHSA-c7w3-x93f-qmm8, GHSA-vvjj-xcjg-gr5g, sonatype-2026-003884
**Nodemailer 6.10.1 → 9.0.3**
- Email library had multiple vulnerabilities including SSRF, file-access, and exceptional-condition handling flaws
- **Status**: Fixed ✓ — `e5c6baa`

### Path Traversal in Avatar Upload
- `uploadAvatarFile()` accepted `file.originalname` in the Supabase Storage path, allowing traversal outside the owner's folder
- **Status**: Fixed ✓ — `e5c6baa`

### Client-Forged AI Analysis
- Behavior chat accepted client-supplied `analysis` payloads and wrote BehaviorLog entries without AI involvement
- **Status**: Fixed ✓ — `e5c6baa`

### Onboarding Session Takeover
- Sessions were accessible via UUID alone; any party knowing the ID could read, advance steps, and submit OTP attempts
- **Status**: Fixed ✓ — `e5c6baa`

### SSRF via Avatar URL in PDF Export
- `cat.photoUrl` was fetched server-side during PDF export with no destination allowlist
- **Status**: Fixed ✓ — `2aa6496`

### OTP Hash Leakage in Public Onboarding Responses
- Full `OnboardingSession` Prisma records (including `otpHash`) were returned from public endpoints, enabling offline brute-force of the 6-digit code
- **Status**: Fixed ✓ — `666d220`

### Authenticated IDOR in Insight Refresh
- `POST /api/timeline/:catId/insights/refresh` used the victim cat's stored owner ID for authorization, making the ownership check tautological
- **Status**: Fixed ✓ — `6e8635b`

### Sensitive Data Exposure — 19 Instances
- OTP codes, reset link tokens, `supabaseUserId`, full request bodies, file paths, signed URLs, and SDK internals were exposed via logs and API responses across 8 files
- **Status**: Fixed ✓ — `b1890f5`

---

**Last Updated**: July 7, 2026
