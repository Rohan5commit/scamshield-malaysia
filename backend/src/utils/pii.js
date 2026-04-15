const REDACTION_PATTERNS = [
  { label: 'phone', regex: /(?:\+?6?0\d[\d -]{7,12}\d)/g, replacement: '[redacted-phone]' },
  { label: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[redacted-email]' },
  { label: 'url', regex: /\bhttps?:\/\/[^\s]+/gi, replacement: '[redacted-url]' }
];

const BLOCKED_PATTERNS = [
  { label: 'nric', regex: /\b\d{6}-?\d{2}-?\d{4}\b/g },
  { label: 'bank-account', regex: /\b\d{12,19}\b/g }
];

export function sanitizeCommunityText(text) {
  let sanitizedText = text;
  const piiRedactions = [];
  const blockedMatches = [];

  for (const pattern of BLOCKED_PATTERNS) {
    const matches = text.match(pattern.regex) ?? [];
    blockedMatches.push(...matches.map(() => pattern.label));
  }

  for (const pattern of REDACTION_PATTERNS) {
    const matches = sanitizedText.match(pattern.regex) ?? [];
    if (matches.length > 0) {
      piiRedactions.push(...matches.map(() => pattern.label));
      sanitizedText = sanitizedText.replace(pattern.regex, pattern.replacement);
    }
  }

  return {
    sanitizedText,
    piiRedactions: Array.from(new Set(piiRedactions)),
    blockedMatches: Array.from(new Set(blockedMatches))
  };
}
