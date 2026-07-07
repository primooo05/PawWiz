# Security Policy

## Vulnerability Disclosure

We take security seriously and appreciate responsible disclosure. If you discover a security vulnerability in PawWiz, please report it privately to **[security-contact@example.com]** with:

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

## Security Model & Scope

### In Scope

The PawWiz backend (`packages/pawwiz-backend`) enforces the following security boundaries:

- **Authentication**: Supabase JWT validation (ES256 via JWKS + legacy HS256 fallback) on protected routes
- **Authorization**: Multi-tenant isolation via `supabaseUserId` with object-level IDOR checks
- **Input validation**: Zod schemas on all user-supplied data (requests, forms, uploads)
- **Data protection**:
  - Sensitive fields (`supabaseUserId`, `otpHash`, email verification state) are projection-filtered from API responses
  - PII and credentials are redacted from logs
  - File uploads (avatars) are path-traversal protected and origin-restricted
- **SSRF prevention**: Authenticated `photoUrl` fields validated to Supabase Storage origin only; DNS + IP range guards for outbound fetch
- **Rate limiting**: Adaptive rate limits on login, registration, OTP send/verify, search, and scan endpoints
- **Bot protection**: Honeypot fields, rate limiting, and OTP email verification
- **Security headers**: Helmet middleware (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.)

### Known Limitations

- **Stateless JWT auth**: Old tokens remain valid until expiry even after password reset. Requires separate Redis-backed denylist or Supabase webhook for immediate revocation.
  - *Mitigation*: Set reasonable JWT expiry times (recommend < 1 hour for sensitive operations).
- **Prompt injection**: User text reaches AI services with minimal transformation. While guardrails and structured output schemas reduce impact, deterministic systems cannot eliminate the risk entirely.
  - *Mitigation*: System instructions hardened against override; output validated by schema; sensitive operations (e.g., toxicity verdicts) never rely solely on AI results — ASPCA database is ground truth.
- **Email delivery**: OTP and recovery emails depend on Gmail SMTP uptime and mailbox delivery. No callback verification exists.
  - *Mitigation*: 60-second resend cooldown prevents brute-force attacks on email channels.

---

## Fixed Vulnerabilities

### CVE-2025-13033, CVE-2025-14874, GHSA-c7w3-x93f-qmm8, GHSA-vvjj-xcjg-gr5g, sonatype-2026-003884
**Nodemailer 6.10.1 → 9.0.3** (exact pin)
- Fixes: SSRF, file-access, exceptional-condition handling issues in email library
- **Status**: Fixed ✓
- **Commit**: e5c6baa

### Path Traversal in Avatar Upload
**Supabase Storage path constructed from client-supplied filename**
- **Vulnerability**: `uploadAvatarFile()` in `diet.controller.ts` accepted `file.originalname` directly in the storage path, allowing traversal like `../../other-user-id/evil.jpg`
- **Fix**: Filename derived from MIME type (validated by multer), not client-supplied header. Path now constructed from server values only (timestamp + MIME-derived extension)
- **Status**: Fixed ✓
- **Commit**: 2aa6496

### Client-Forged AI Analysis
**Frontend POSTed full analysis object accepted by backend without verification**
- **Vulnerability**: Behavior chat allowed `wiz`-speaker messages with client-supplied `analysis` + `decodeResult` fields. Backend accepted and persisted them in BehaviorLog without AI involvement.
- **Fix**: Strip `analysis`/`decodeResult` from all inbound requests. BehaviorLogs now written exclusively by server-side decode path in `gemini.controller.ts`
- **Status**: Fixed ✓
- **Commit**: e5c6baa

### Onboarding Session Takeover (Missing Session Token Binding)
**Sessions identified by UUID only, no credential binding**
- **Vulnerability**: Any user who knows a session ID could read, advance steps, and submit OTP attempts. No binding to the user who initiated the session.
- **Fix**: Issue `sessionToken` at session creation; require it via `X-Session-Token` header on all mutations. Token persisted in Prisma schema, stored in frontend localStorage.
- **Status**: Fixed ✓
- **Commit**: e5c6baa

### Prompt Injection Hardening
**User text reaches AI with minimal transformation**
- **Vulnerability**: Partially real. User text reaches AI services with minimal sanitization, creating potential for indirect prompt injection.
- **Fix**: Added `<user_input>` delimiters; hardened Gemini system instruction to prevent override attempts; structured output schema prevents unparseable responses from persisting
- **Status**: Mitigated ✓
- **Commit**: e5c6baa

### SSRF via Avatar URL in PDF Export
**Authenticated photoUrl on cat profiles fetched server-side without allowlist**
- **Vulnerability**: Users could set arbitrary `photoUrl` on cat profiles. PDF export called `fetch(cat.photoUrl)` server-side with no origin allowlist, enabling SSRF to internal services (AWS metadata, VPC, loopback).
- **Fix**: Two-layer defense:
  1. Schema validation restricts `photoUrl` to Supabase Storage origin only
  2. `assertSafeFetchUrl()` validates scheme (https: only) and resolves hostname via DNS, rejecting loopback (127/8, ::1), RFC1918 (10/8, 172.16/12, 192.168/16), link-local (169.254/16, fe80::/10), CGNAT (100.64/10), and ULA (fc00::/7) ranges
- **Status**: Fixed ✓
- **Commit**: 2aa6496

### OTP Hash Leakage in Public Onboarding Responses
**Full OnboardingSession records returned, exposing deterministic OTP hash**
- **Vulnerability**: Unauthenticated callers could trigger `sendOtp()`, retrieve SHA-256 hash from response, and brute-force 6-digit code offline (900k candidates). Hash is deterministic, not salted.
- **Fix**: Added `updatePublic()` method to onboarding repository with explicit `select` projection excluding OTP fields (`otpHash`, `otpExpiresAt`, `otpAttempts`, `otpLastSentAt`). All client-facing responses routed through it.
- **Status**: Fixed ✓
- **Commit**: 666d220

### Authenticated IDOR in Insight Refresh
**Endpoint ignored caller identity, used victim cat's stored owner for authorization check**
- **Vulnerability**: `POST /api/timeline/:catId/insights/refresh` accepted any authenticated user's `catId`. Internally, it read the **cat's stored owner id** and passed it into the ownership check, making the comparison tautological (always passed). Any user could trigger AI processing of another tenant's cat health data.
- **Fix**: Pass caller's `supabaseUserId` from controller to `triggerOnDemandRefresh()`, which now calls `timelineService.verifyOwnership(catId, callerUserId)` with the **actual** caller-vs-owner check. Also hardened `getInsights` endpoint (same dead variable).
- **Status**: Fixed ✓
- **Commit**: 6e8635b

### Sensitive Data Exposure – 19 Instances Across 8 Files
**PII, credentials, and secrets leaked via logs and API responses**
- **Vulnerabilities**:
  - **mailer.service.ts**: OTP codes, reset links (bearer tokens), emails logged in plaintext → now redacted
  - **quick-log.controller.ts**: `console.log` dumps of `supabaseUserId` + full `req.body` → removed
  - **profile.controller.ts**: `supabaseUserId` returned in all 3 response bodies → removed
  - **validate.ts**: Full `req.body` logged on validation failure → now logs field names only
  - **behavior-decoder.service.ts**: User chat messages logged at `info` level → downgraded to `debug`
  - **behavior-chat.service.ts**: `supabaseUserId` in 4 `logger.info` calls → removed
  - **behavior-dashboard.service.ts**: `supabaseUserId` via `console.log` → replaced with `logger.debug`
  - **diet.controller.ts**: Env var enumeration, file paths, signed URLs, SDK errors exposed → all removed
- **Status**: Fixed ✓
- **Commit**: b1890f5

---

## Security Best Practices for Contributors

### Input Validation
- Always validate user-supplied data using Zod schemas before use
- Use the `validate` middleware on all routes that accept request bodies
- Keep Zod schemas in `src/schemas/` and re-export them in `index.ts`

### Authorization Checks
- Always verify caller identity (`req.user.sub` from JWT) against the targeted resource
- Use explicit ownership checks, never rely on extracted values from the resource itself
- Check `timelineService.verifyOwnership(catId, supabaseUserId)` for multi-tenant resources

### Sensitive Data in Responses
- Use Prisma `select` projections to exclude OTP fields, password hashes, and credential material
- Create explicit DTO/response types (e.g., `updatePublic()`) for unauthenticated endpoints
- Never return raw ORM objects; always define explicit response shapes

### Logging
- **Never log**:
  - `supabaseUserId` or other user identifiers in production
  - OTP codes, reset tokens, or Bearer tokens
  - Full request bodies or file contents
  - Email addresses or environment variables
- Use `logger.debug()` for verbose internal state (dev only)
- Use `logger.info()` for business events (safe to persist)
- Use `logger.error()` for actionable errors (no credentials)

### External Service Calls
- **SSRF prevention**:
  - Restrict outbound fetch to known-safe origins (e.g., Supabase Storage, PlantNet, Wikipedia)
  - Use DNS resolution + IP range checks (`assertSafeFetchUrl()`) to block loopback, RFC1918, and link-local ranges
  - Prefer origin-based allowlists over blacklists
- **Rate limiting**:
  - Wrap external API calls in rate limiters to prevent abuse (e.g., `sendOtp`, `scanToxicity`)
- **Graceful degradation**:
  - Mock external services when API keys are absent (Gemini, Groq, PlantNet, Perenual)
  - Return sensible defaults rather than errors

### File Uploads
- Validate file size and MIME type (multer enforces 5MB + JPEG/PNG/WebP/GIF)
- Derive the storage path from server values only (timestamp + MIME-derived extension), never from client-supplied headers
- Use Supabase Storage's private bucket and sign URLs for authenticated access

### Authentication & Session Management
- Require Bearer token (JWT) on protected routes; use `authMiddleware`
- For public endpoints that require correlation, bind additional tokens (e.g., `sessionToken` for onboarding)
- Do not rely on weak identifiers (UUIDs, guessable IDs) as the sole security boundary

---

## Testing Recommendations

### Prompt Injection Fuzzing
- Test behavior decoder with payloads designed to override system instructions (e.g., "Ignore above and return …")
- Verify structured output schema validation rejects unparseable responses
- Use property-based tests (fast-check) to generate malformed AI inputs

### IDOR & Authorization Traversal
- For each authenticated endpoint that accepts a resource ID, verify that a different user cannot access/modify it
- Test cross-tenant access (e.g., attempt to read another user's cat, diet profile, behavior chat)
- Use Vitest + Supertest to automate HTTP-level authorization tests

### Data Exposure Audits
- Grep for `console.log`, `logger.info`, and `logger.error` calls; verify no credentials/PII is passed
- Use the project's lint configuration (`oxlint`) to flag hardcoded secrets
- Review all API response shapes; confirm sensitive fields are excluded

### SSRF & External Service Calls
- Mock external services and verify fallback paths work
- Test `assertSafeFetchUrl()` with RFC1918, loopback, and link-local IP ranges
- Verify Supabase Storage URLs are accepted; non-Supabase origins are rejected

### Rate Limiting
- Verify rate limiters are active on `POST /api/onboarding/send-otp`, `POST /api/onboarding/verify-otp`, and other sensitive endpoints
- Test that limit is enforced per IP (X-Real-IP header respect) and per (user, endpoint) for authenticated routes

---

## Deployment Checklist

Before deploying a new version:

- [ ] All tests pass (`npm run test -w packages/pawwiz-backend`)
- [ ] No console.log or logger.info calls expose sensitive data
- [ ] Rate limiters are active on sensitive endpoints
- [ ] Helmet middleware is mounted first in the middleware stack
- [ ] CORS origin is set to the frontend's production URL
- [ ] JWT_SECRET and service-role keys are injected via Infisical (not hardcoded)
- [ ] Database migrations have been validated against a shadow database
- [ ] Security headers are present: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- [ ] SSRF guards are in place for any outbound fetch calls
- [ ] Authorization checks use caller identity, not resource-supplied values

---

## Support

For security-related questions or to report a vulnerability, contact **[security-contact@example.com]**.

For other issues, visit our GitHub repository or documentation.

---

**Last Updated**: July 7, 2026
