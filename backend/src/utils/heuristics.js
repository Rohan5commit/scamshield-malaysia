import { normalizePhoneNumber, looksLikePhoneNumber } from './phone.js';
import { looksLikeUrl, normalizeUrl } from './url.js';

const URGENCY_TERMS = ['urgent', 'immediately', 'within 24 hours', 'suspended', 'final notice', 'segera', 'gantung', 'last chance'];
const AUTHORITY_TERMS = ['bank negara', 'pdrm', 'police', 'ccid', 'lhdn', 'kwsp', 'epf', 'kastam', 'mahkamah'];
const CREDENTIAL_TERMS = ['otp', 'tac', 'pin', 'password', 'secure code', 'verification code'];
const MONEY_TERMS = ['pay now', 'transfer', 'safe account', 'top up', 'processing fee', 'release fee', 'deposit'];
const MALAYSIA_BRANDS = ['maybank', 'cimb', 'public bank', 'rhb', 'bsn', 'touch n go', 'tng', 'kwsp', 'epf', 'pos malaysia', 'j&t', 'tenaga'];
const IMAGE_HINT_TERMS = ['screenshot', 'wallet', 'otp', 'parcel', 'kwsp', 'bank'];

export function normalizeWhitespace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function tokenizeText(value = '') {
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 2);
}

export function detectInputKind({ kind, content, file }) {
  if (kind) {
    return kind;
  }

  if (file) {
    return 'image';
  }

  if (looksLikeUrl(content)) {
    return 'url';
  }

  if (looksLikePhoneNumber(content)) {
    return 'phone';
  }

  return 'text';
}

function extractUrlCandidate(value = '') {
  return value.match(/https?:\/\/[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i)?.[0] ?? null;
}

function extractPhoneCandidate(value = '') {
  return value.match(/\+?6?0\d[\d -]{7,12}\d/)?.[0] ?? null;
}

export function normalizeIncomingInput({ kind, content = '', notes = '', languageHint, file }) {
  const detectedKind = detectInputKind({ kind, content, file });
  const combinedText = normalizeWhitespace([content, notes, file?.originalname].filter(Boolean).join(' '));
  const tokens = tokenizeText(combinedText);
  const extractedIndicators = [];
  const urlCandidate = detectedKind === 'url' ? content : extractUrlCandidate(combinedText);
  const phoneCandidate = detectedKind === 'phone' ? content : extractPhoneCandidate(combinedText);

  const normalizedInput = {
    detectedKind,
    originalContent: content,
    normalizedText: combinedText,
    notes: normalizeWhitespace(notes),
    languageHint: languageHint || 'en',
    tokens,
    extractedIndicators
  };

  if (urlCandidate && looksLikeUrl(urlCandidate)) {
    const url = normalizeUrl(urlCandidate);
    normalizedInput.url = {
      normalized: url.normalized,
      hostname: url.hostname,
      pathname: url.pathname,
      protocol: url.protocol
    };
    extractedIndicators.push(url.hostname);
  }

  if (phoneCandidate && looksLikePhoneNumber(phoneCandidate)) {
    const phone = normalizePhoneNumber(phoneCandidate);
    normalizedInput.phone = phone;
    extractedIndicators.push(phone.normalizedDigits);
  }

  if (file) {
    normalizedInput.file = file;
    extractedIndicators.push(file.originalname.toLowerCase());
  }

  return normalizedInput;
}

function findMatches(haystack, terms) {
  return terms.filter((term) => haystack.includes(term));
}

export function analyzeHeuristics(input) {
  const haystack = input.normalizedText.toLowerCase();
  const redFlags = [];
  const reasons = [];
  const tags = new Set([input.detectedKind]);
  const matchedKeywords = new Set();
  let score = input.detectedKind === 'image' ? 24 : 12;

  const urgencyMatches = findMatches(haystack, URGENCY_TERMS);
  const authorityMatches = findMatches(haystack, AUTHORITY_TERMS);
  const credentialMatches = findMatches(haystack, CREDENTIAL_TERMS);
  const moneyMatches = findMatches(haystack, MONEY_TERMS);
  const brandMatches = findMatches(haystack, MALAYSIA_BRANDS);

  if (urgencyMatches.length > 0) {
    score += 16;
    redFlags.push('Urgent action language is pushing for a rushed decision.');
    reasons.push(`Urgency terms detected: ${urgencyMatches.join(', ')}.`);
    urgencyMatches.forEach((value) => matchedKeywords.add(value));
  }

  if (authorityMatches.length > 0) {
    score += 18;
    redFlags.push('The content references authorities or institutions in a coercive way.');
    reasons.push(`Authority-style references detected: ${authorityMatches.join(', ')}.`);
    authorityMatches.forEach((value) => matchedKeywords.add(value));
    tags.add('authority-impersonation');
  }

  if (credentialMatches.length > 0) {
    score += 22;
    redFlags.push('It requests sensitive credentials such as OTP, TAC, PIN, or password.');
    reasons.push(`Credential terms detected: ${credentialMatches.join(', ')}.`);
    credentialMatches.forEach((value) => matchedKeywords.add(value));
    tags.add('credential-theft');
  }

  if (moneyMatches.length > 0) {
    score += 18;
    redFlags.push('The sender is asking for money, transfer, or an upfront payment.');
    reasons.push(`Money movement language detected: ${moneyMatches.join(', ')}.`);
    moneyMatches.forEach((value) => matchedKeywords.add(value));
    tags.add('payment-request');
  }

  if (brandMatches.length > 0) {
    score += 10;
    reasons.push(`Malaysia-specific institutions or brands mentioned: ${brandMatches.join(', ')}.`);
    brandMatches.forEach((value) => matchedKeywords.add(value));
  }

  if (input.url) {
    tags.add('url');
    score += 14;
    redFlags.push(`The URL points to ${input.url.hostname}, which should be checked carefully.`);

    if (input.url.protocol !== 'https') {
      score += 10;
      reasons.push('The URL is not using HTTPS.');
    }

    if (/xn--/.test(input.url.hostname)) {
      score += 12;
      redFlags.push('The domain contains punycode-like encoding, which can hide impersonation.');
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(input.url.hostname)) {
      score += 18;
      redFlags.push('The URL uses a raw IP address instead of a recognizable domain.');
    }

    if (input.url.hostname.includes('bit.ly') || input.url.hostname.includes('tinyurl')) {
      score += 12;
      redFlags.push('The message uses a link shortener that hides the final destination.');
    }

    if (input.url.hostname.includes('login') || input.url.pathname.includes('verify')) {
      score += 8;
      reasons.push('The link path suggests a login or verification page.');
    }

    if (MALAYSIA_BRANDS.some((brand) => input.url.hostname.includes(brand.replace(/\s+/g, '')))) {
      score += 12;
      redFlags.push('The domain appears to imitate a known Malaysian brand or institution.');
      tags.add('brand-spoofing');
    }
  }

  if (input.phone) {
    tags.add('phone');
    score += input.phone.isValid ? 6 : 12;

    if (!input.phone.looksMalaysian) {
      score += 10;
      redFlags.push('The phone number format does not look like a normal Malaysian number.');
    }

    if (!input.phone.isValid) {
      reasons.push('The phone number does not parse as a valid number.');
    }
  }

  if (input.file) {
    const lowerName = input.file.originalname.toLowerCase();
    const imageMatches = IMAGE_HINT_TERMS.filter((term) => lowerName.includes(term.replace(/\s+/g, '')));
    if (imageMatches.length > 0) {
      score += 8;
      imageMatches.forEach((value) => matchedKeywords.add(value));
      reasons.push(`Image filename suggests scam-related content: ${imageMatches.join(', ')}.`);
    }
  }

  if (redFlags.length === 0) {
    redFlags.push('The content is suspicious enough to merit verification, but has fewer obvious scam markers than common high-risk cases.');
    reasons.push('Lower-visibility patterns still need verification against known Malaysian scam campaigns.');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    redFlags,
    matchedKeywords: Array.from(matchedKeywords),
    tags: Array.from(tags),
    reasons
  };
}
