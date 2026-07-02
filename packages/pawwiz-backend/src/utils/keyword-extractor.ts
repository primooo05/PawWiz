/**
 * Deterministic RAKE-style keyword extractor.
 *
 * Used to hydrate BehaviorChat session titles from the first user message
 * without invoking an LLM. Runs synchronously in-process, no I/O, no async,
 * no external corpus required.
 *
 * Algorithm (Rapid Automatic Keyword Extraction, Rose et al. 2010):
 *   1. Normalize: lowercase, strip URLs, strip emoji, collapse whitespace.
 *   2. Split text into candidate phrases on stop-words and punctuation.
 *   3. For each word w:  score(w) = deg(w) / freq(w)
 *      where deg(w) sums the co-occurrence length of every phrase w appears
 *      in, and freq(w) is its raw frequency.
 *   4. Phrase score = sum of word scores in the phrase.
 *   5. Select highest-scoring phrase, break ties by earliest occurrence.
 *   6. Title-case and clamp to configured word/char limits.
 *
 * The function is total — it never throws and never returns an empty string
 * for a non-empty input.
 */

import { isStopword } from './stopwords.js';

export interface ExtractTitleOptions {
  /** Maximum number of tokens retained in the winning phrase. Default 3. */
  maxWords?: number;
  /** Hard character cap on the returned title. Default 40. */
  maxChars?: number;
}

const DEFAULT_MAX_WORDS = 3;
const DEFAULT_MAX_CHARS = 40;
const MIN_TOKEN_CHARS = 2;

/**
 * Extract a short, human-readable title from free-form chat text.
 *
 * Guarantees:
 *  - never throws
 *  - never returns an empty or whitespace-only string
 *  - deterministic: same input → same output
 *  - output length ≤ opts.maxChars
 */
export function extractTitle(text: string, opts: ExtractTitleOptions = {}): string {
  const maxWords = Math.max(1, opts.maxWords ?? DEFAULT_MAX_WORDS);
  const maxChars = Math.max(1, opts.maxChars ?? DEFAULT_MAX_CHARS);

  const safeInput = typeof text === 'string' ? text : '';
  const trimmed = safeInput.trim();

  if (trimmed.length === 0) {
    return clampChars('New Chat', maxChars);
  }

  const normalized = normalize(trimmed);
  const phrases = splitIntoCandidatePhrases(normalized);
  const scoredPhrases = scorePhrases(phrases);

  if (scoredPhrases.length > 0) {
    const winner = scoredPhrases[0]!;
    const clamped = winner.tokens.slice(0, maxWords);
    const formatted = titleCase(clamped.join(' '));
    return clampChars(formatted, maxChars);
  }

  // Fallback 1: no candidate survived — surface the first non-stop-word token.
  const firstContentWord = firstNonStopword(normalized);
  if (firstContentWord.length > 0) {
    return clampChars(titleCase(firstContentWord), maxChars);
  }

  // Fallback 2: entire message was stop-words / punctuation — mirror the
  // legacy slice-first-30 behaviour so callers still get something stable.
  const legacy = trimmed.slice(0, 30).trim();
  return clampChars(legacy.length > 0 ? legacy : 'New Chat', maxChars);
}

// ─── internals ──────────────────────────────────────────────────────────────

const URL_RE = /\bhttps?:\/\/\S+/gi;
// Unicode emoji + pictographic ranges (BMP + astral). Covers the common set
// without pulling a full grapheme-cluster library.
const EMOJI_RE =
  /[\u2600-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF]|\uFE0F/g;

/**
 * Lowercase, strip URLs + emoji, and collapse any non-alphanumeric sequence
 * to a single sentence-boundary marker. Apostrophes are preserved so that
 * contractions like "don't" survive intact for stop-word lookup.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(URL_RE, ' ')
    .replace(EMOJI_RE, ' ')
    .replace(/[^a-z0-9'\s]+/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Break the normalized text into candidate phrases. A phrase is a maximal
 * run of non-stop-word, non-punctuation tokens. Numeric-only and too-short
 * tokens are treated as boundaries as well.
 */
function splitIntoCandidatePhrases(normalized: string): string[][] {
  const tokens = normalized.split(' ').filter((t) => t.length > 0);
  const phrases: string[][] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length > 0) {
      phrases.push(current);
      current = [];
    }
  };

  for (const raw of tokens) {
    if (raw === '|') {
      flush();
      continue;
    }
    const token = raw.replace(/^'+|'+$/g, '');
    if (
      token.length < MIN_TOKEN_CHARS ||
      /^\d+$/.test(token) ||
      isStopword(token)
    ) {
      flush();
      continue;
    }
    current.push(token);
  }
  flush();

  return phrases;
}

interface ScoredPhrase {
  tokens: string[];
  score: number;
  position: number;
}

/**
 * Compute RAKE word scores and roll them up into phrase scores.
 * Tie-breaks favour the earliest-occurring phrase for positional stability.
 */
function scorePhrases(phrases: string[][]): ScoredPhrase[] {
  const freq = new Map<string, number>();
  const degree = new Map<string, number>();

  for (const phrase of phrases) {
    const phraseLen = phrase.length;
    for (const word of phrase) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
      // Classic RAKE degree: (phrase length - 1) contribution per word occurrence,
      // then add freq at the end. Equivalent formulation: sum of phrase lengths
      // over occurrences.
      degree.set(word, (degree.get(word) ?? 0) + phraseLen);
    }
  }

  const wordScore = new Map<string, number>();
  for (const [word, f] of freq.entries()) {
    const d = degree.get(word) ?? 0;
    wordScore.set(word, d / f);
  }

  const scored: ScoredPhrase[] = phrases.map((tokens, idx) => {
    let score = 0;
    for (const w of tokens) score += wordScore.get(w) ?? 0;
    return { tokens, score, position: idx };
  });

  // Highest score first; ties broken by earliest position.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.position - b.position;
  });

  return scored;
}

function firstNonStopword(normalized: string): string {
  for (const raw of normalized.split(' ')) {
    const token = raw.replace(/^'+|'+$/g, '');
    if (
      token.length >= MIN_TOKEN_CHARS &&
      !/^\d+$/.test(token) &&
      !isStopword(token) &&
      token !== '|'
    ) {
      return token;
    }
  }
  return '';
}

function titleCase(phrase: string): string {
  return phrase
    .split(' ')
    .filter((t) => t.length > 0)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');
}

function clampChars(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  const sliced = value.slice(0, maxChars - 1).trimEnd();
  return sliced + '…';
}
