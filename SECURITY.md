# Security Policy — PawWiz

> **Audit Tool**: Aikido Security (AI Code Audit)
> **Audit Date**: July 7, 2026
> **Audited Branch**: `working/primo`
> **Overall Status**: ✅ All confirmed vulnerabilities resolved

---

## Audit Summary

| Category | Findings | Status |
|---|---|---|
| Query Injection | 1 reported | ✅ False positive — confirmed safe |
| Missing Security Headers | 1 reported | ✅ False positive — Helmet already active |
| Vulnerable Dependencies | 1 package (12 CVEs) | ✅ Fixed — nodemailer 6.10.1 → 9.0.3 |
| Path Traversal | 1 confirmed | ✅ Fixed |
| Server-Side Request Forgery (SSRF) | 2 confirmed | ✅ Fixed |
| Broken Object-Level Authorization (IDOR) | 1 confirmed | ✅ Fixed |
| Sensitive Data Exposure | 19 instances across 8 files | ✅ Fixed |
| Authentication / Session Issues | 2 confirmed | ✅ Fixed |
| AI-Specific Risks | 2 confirmed, 1 architectural | ✅ Mitigated |

---

## Vulnerability Disclosure

To report a security vulnerability, email **security.pawwiz@gmail.com** with:

1. A clear description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Your suggested fix (optional)

**Do not open public GitHub issues for security vulnerabilities.**

| Stage | Timeline |
|---|---|
| Acknowledgment | Within 48 hours |
| Triage & fix (critical) | Within 14 days |
| Public disclosure embargo | 30 days after fix |
| Researcher credit | Granted unless anonymity requested |

---

## Security Implementation

### Authentication

All protected routes verify a Supabase-issued JWT on every request with two independent paths:

| Path | Algorithm | Mechanism |
|---|---|---|
| Primary | ES256 | Signature verification via Supabase JWKS endpoint |
| Fallback | HS256 | Symmetric verification using `SUPABASE_JWT_SECRET` |

Both paths extract `sub` (Supabase user ID) and `email` claims used for all downstream authorization. Tokens are never cached — every request is independently verified.

---

### Authorization

Every endpoint that accesses user-owned data performs an explicit ownership check before returning or modifying data:

| Resource | Mechanism |
|---|---|
| Profile, diet, cat records | Prisma queries scoped to `supabaseUserId` at the database level |
| Insight refresh, PDF export | `timelineService.verifyOwnership(catId, callerUserId)` using the caller's JWT `sub` — never a value extracted from the resource itself |
| Behavior chats & messages | `belongsToUser(chatId, supabaseUserId)` checked before every read or write |

Using the caller's identity (not the resource's stored owner) eliminates the class of tautological ownership checks that allowed the IDOR described below.

---

### Input Validation

| Layer | What it validates |
|---|---|
| Zod middleware (`validate.ts`) | All request bodies and query strings; replaces `req.body` with the cleaned, type-safe result |
| multer | File uploads: JPEG/PNG/WebP/GIF only, 5 MB maximum, MIME type enforced server-side |
| `updateAvatarSchema` | `photoUrl` validated against the Supabase Storage hostname at schema level — arbitrary external URLs rejected before reaching the database |

---

### Security Headers

Helmet is mounted as the first middleware in the Express pipeline, enabling all 14 of its default protections:

| Header | Purpose |
|---|---|
| `Strict-Transport-Security` | Enforces HTTPS (HSTS) |
| `Content-Security-Policy` | Restricts script, style, and frame sources |
| `X-Frame-Options: DENY` | Blocks clickjacking via iframe embedding |
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | Controls referrer header exposure |
| `X-DNS-Prefetch-Control` | Disables cross-origin DNS prefetch |

---

### Bot Protection

Three independent layers are applied on sensitive endpoints:

| Layer | Mechanism |
|---|---|
| Honeypot fields | Invisible form fields; any request that fills them is silently rejected (403) before business logic runs |
| Rate limiting | `express-rate-limit` with separate limits for login, registration, OTP send/verify, email check, search, and scan; enforced by `X-Real-IP` set by nginx |
| OTP email verification | Onboarding completion is gated behind a 6-digit code emailed to the user, binding registration to mailbox possession |

---

### SSRF Prevention

Two independent guards prevent server-side request forgery:

**Layer 1 — Schema allowlist** (`updateAvatarSchema` in `diet.schemas.ts`)

`photoUrl` must match the application's own Supabase Storage hostname, derived from `SUPABASE_URL` at runtime. Any URL pointing to a different origin is rejected at Zod validation before the value reaches the database.

**Layer 2 — Fetch-time DNS + IP guard** (`assertSafeFetchUrl()` in `pdf.service.ts`)

Before every outbound `fetch()` call during PDF export, the hostname is resolved via DNS and each resolved address is checked against blocked ranges:

| Range | CIDR |
|---|---|
| Loopback | `127.0.0.0/8`, `::1` |
| RFC1918 private | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` |
| Link-local / metadata endpoint | `169.254.0.0/16`, `fe80::/10` |
| CGNAT shared address | `100.64.0.0/10` |
| Unique Local (ULA) | `fc00::/7`, `fd00::/7` |
| IPv4-mapped IPv6 | `::ffff:0:0/96` |

Only the `https:` scheme is permitted — `http:`, `file:`, and `data:` are rejected before DNS resolution.

---

### Sensitive Data Handling

**Logs** (Winston — console + `error.log` file transport):

| ❌ Never logged | ✅ Safe to log |
|---|---|
| `supabaseUserId` or user identifiers | Business event labels (e.g., "Chat deleted") |
| OTP codes or password-reset link tokens | Resource IDs without user correlation |
| Full request bodies | Validation field *names* (not values) on failure |
| Email addresses | Provider-assigned message IDs for email delivery |
| API keys or environment variable names | Error type and message (no stack traces to file) |

**API Responses**: Raw Prisma ORM objects are never serialized to JSON. All response shapes are explicitly constructed, excluding `supabaseUserId`, `otpHash`, `otpExpiresAt`, `sessionToken`, and similar internal fields via Prisma `select` projections.

---

### OTP Security

| Control | Implementation |
|---|---|
| Code lifetime | 15 minutes from issuance |
| Resend cooldown | 60 seconds, enforced at service layer |
| Brute-force lockout | 3 failed attempts invalidates the active code; fresh `sendOtp()` required |
| Hash exposure | `otpHash` excluded from all client-facing responses via `updatePublic()` repository projection |
| Enumeration protection | `sendOtp()` returns identical `{ cooldownSeconds: 60 }` regardless of whether the email is registered |

---

### Session Binding for Public Flows

The onboarding flow is unauthenticated, so sessions use a separate credential:

| Step | Mechanism |
|---|---|
| Session creation | A cryptographically random UUID `sessionToken` is generated server-side, stored in the database, and returned **once** to the client |
| Subsequent mutations (`update`, `send-otp`, `verify-otp`) | Token required via `X-Session-Token` header |
| Missing or mismatched token | `401 Unauthorized` — the session UUID alone is insufficient |

---

### AI Prompt Integrity

| Control | Implementation |
|---|---|
| Input isolation | All user-controlled text is wrapped in `<user_input>...</user_input>` delimiters in every prompt |
| Gemini system instruction | Explicit `systemInstruction` forbids following directives inside `<user_input>` blocks and forbids disclosing the system prompt |
| Groq security boundary | `<security_boundary>` block in system message with equivalent instruction |
| Schema enforcement | Both providers use structured output schemas; any non-conforming response fails `JSON.parse()` and falls to the deterministic heuristic — no injected output can persist as trusted data |
| Pre-filter | `checkInappropriate()` and `checkOffTopic()` in `prompt-validator.ts` intercept common abuse patterns before reaching the AI |
| Toxicity verdict isolation | ASPCA database is the sole source of toxicity truth; AI output is used only to identify the plant name, never for the final safe/toxic classification |

---

## Known Limitations

### 1. Stateless JWT Auth — No Immediate Token Revocation

| | |
|---|---|
| **Root cause** | No server-side revocation store; tokens are valid until expiry even after a password change |
| **Mitigations applied** | Tokens are short-lived (Supabase default); `/reset-password` calls `supabase.auth.signOut()` to destroy the recovery session after reset; `POST /api/auth/recover` is rate-limited |
| **Residual risk** | A token obtained before a password reset remains valid until natural expiry |
| **Full resolution** | Redis-backed denylist or Supabase Admin `signOut(userId, 'others')` on password change — deferred pending infrastructure investment |

---

### 2. Prompt Injection via Behavior Chat

| | |
|---|---|
| **Root cause** | User text is passed to Groq and Gemini after lightweight filtering; novel payloads may attempt to override system instructions |
| **Mitigations applied** | See [AI Prompt Integrity](#ai-prompt-integrity) above |
| **Residual risk** | Novel indirect injection cannot be fully eliminated at the application layer |
| **Bounded impact** | Toxicity scanner is immune (ASPCA is ground truth); structured schemas prevent injected content from persisting as authoritative behavioral data |

---

### 3. Email Delivery — No Delivery Confirmation

| | |
|---|---|
| **Root cause** | Gmail SMTP provides no inbox-delivery confirmation |
| **Mitigations applied** | See [OTP Security](#otp-security) above; `otpHash` is never exposed to the client, so the only way to pass verification is to receive the email |
| **Residual risk** | A compromised inbox allows an attacker to receive the OTP directly — outside the application's trust boundary |

---

## Fixed Vulnerabilities

| # | Vulnerability | Severity | Commit |
|---|---|---|---|
| 1 | **Nodemailer CVEs** — CVE-2025-13033, CVE-2025-14874, GHSA-c7w3-x93f-qmm8, GHSA-vvjj-xcjg-gr5g, sonatype-2026-003884 | High | `e5c6baa` |
| 2 | **Path traversal in avatar upload** — `file.originalname` used in Supabase Storage path | High | `e5c6baa` |
| 3 | **Client-forged AI analysis** — `wiz`-speaker messages accepted client-supplied `analysis` payloads, wrote BehaviorLog without AI | Medium | `e5c6baa` |
| 4 | **Onboarding session takeover** — sessions accessible via UUID alone, no credential binding | Medium | `e5c6baa` |
| 5 | **Prompt injection hardening** — user input reached AI without delimiters or Gemini system instruction | Medium | `e5c6baa` |
| 6 | **SSRF via avatar URL in PDF export** — `cat.photoUrl` fetched server-side with no destination allowlist | High | `2aa6496` |
| 7 | **OTP hash leakage** — full `OnboardingSession` records returned from public endpoints, exposing SHA-256 OTP hash | High | `666d220` |
| 8 | **IDOR in insight refresh** — `POST /api/timeline/:catId/insights/refresh` used victim cat's stored owner ID for authorization | High | `6e8635b` |
| 9 | **Sensitive data exposure** — 19 instances: OTP codes, reset tokens, `supabaseUserId`, request bodies, signed URLs, SDK errors in logs and responses | Medium–High | `b1890f5` |

---

*Last updated: July 7, 2026 · Audited by Aikido Security*
