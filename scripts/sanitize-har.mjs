/**
 * sanitize-har.mjs
 *
 * Strips sensitive data from a Chrome DevTools HAR export so it's safe to share
 * with judges, teammates, or in GitHub issues.
 *
 * Usage:
 *   node scripts/sanitize-har.mjs path/to/recording.har
 *
 * Produces:  path/to/recording.sanitized.har
 *
 * What gets redacted:
 *   - Authorization headers (Bearer tokens, Basic auth)
 *   - Cookie and Set-Cookie headers
 *   - Supabase tokens in request/response bodies
 *   - API keys that appear in query strings or headers
 *   - Request POST bodies for auth endpoints (/token, /login, /recover)
 *   - Any value matching a JWT pattern (3 base64 segments separated by dots)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-supabase-auth',
  'apikey',
]);

const SENSITIVE_QUERY_KEYS = new Set([
  'apikey',
  'token',
  'key',
  'secret',
  'access_token',
  'refresh_token',
]);

const AUTH_PATH_PATTERNS = [
  /\/auth\/v1\/token/,
  /\/auth\/v1\/signup/,
  /\/auth\/v1\/recover/,
  /\/api\/auth\/recover/,
  /\/api\/onboarding\/verify-otp/,
];

// Matches JWTs (header.payload.signature — each segment is base64url)
const JWT_REGEX = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

function redact(value) {
  return '[REDACTED]';
}

function sanitizeHeaders(headers) {
  if (!headers) return headers;
  return headers.map((h) => {
    if (SENSITIVE_HEADERS.has(h.name.toLowerCase())) {
      return { ...h, value: redact(h.value) };
    }
    // Catch JWTs that snuck into other headers
    if (JWT_REGEX.test(h.value)) {
      return { ...h, value: h.value.replace(JWT_REGEX, '[REDACTED_JWT]') };
    }
    return h;
  });
}

function sanitizeQueryString(qs) {
  if (!qs) return qs;
  return qs.map((param) => {
    if (SENSITIVE_QUERY_KEYS.has(param.name.toLowerCase())) {
      return { ...param, value: redact(param.value) };
    }
    return param;
  });
}

function isAuthEndpoint(url) {
  return AUTH_PATH_PATTERNS.some((p) => p.test(url));
}

function sanitizeContent(content) {
  if (!content || !content.text) return content;
  // Replace any JWTs in response/request bodies
  let text = content.text.replace(JWT_REGEX, '[REDACTED_JWT]');
  // Redact common token fields in JSON bodies
  try {
    const parsed = JSON.parse(text);
    for (const key of ['access_token', 'refresh_token', 'token', 'password', 'otp']) {
      if (key in parsed) parsed[key] = '[REDACTED]';
    }
    text = JSON.stringify(parsed);
  } catch {
    // Not JSON — leave as-is (with JWT replacements already applied)
  }
  return { ...content, text };
}

function sanitizeEntry(entry) {
  const { request, response } = entry;

  // Sanitize request
  request.headers = sanitizeHeaders(request.headers);
  request.queryString = sanitizeQueryString(request.queryString);

  if (isAuthEndpoint(request.url) && request.postData) {
    request.postData = { ...request.postData, text: '[REDACTED_AUTH_BODY]' };
  } else if (request.postData) {
    request.postData = sanitizeContent(request.postData);
  }

  // Sanitize response
  response.headers = sanitizeHeaders(response.headers);
  if (response.content) {
    if (isAuthEndpoint(request.url)) {
      response.content = { ...response.content, text: '[REDACTED_AUTH_RESPONSE]' };
    } else {
      response.content = sanitizeContent(response.content);
    }
  }

  // Remove cookies arrays entirely
  if (request.cookies) request.cookies = [];
  if (response.cookies) response.cookies = [];

  return entry;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/sanitize-har.mjs <path-to-har-file>');
  process.exit(1);
}

const raw = readFileSync(inputPath, 'utf8');
const har = JSON.parse(raw);

if (!har.log || !har.log.entries) {
  console.error('Invalid HAR file — missing log.entries');
  process.exit(1);
}

har.log.entries = har.log.entries.map(sanitizeEntry);

// Also sanitize the creator/browser fields (may contain user-agent with OS details)
if (har.log.creator) har.log.creator.comment = '';
if (har.log.browser) har.log.browser.comment = '';

const outputPath = join(dirname(inputPath), basename(inputPath, '.har') + '.sanitized.har');
writeFileSync(outputPath, JSON.stringify(har, null, 2));

console.log(`✓ Sanitized HAR written to: ${outputPath}`);
console.log(`  ${har.log.entries.length} entries processed`);
console.log(`  Stripped: Authorization headers, cookies, JWTs, auth endpoint bodies`);
