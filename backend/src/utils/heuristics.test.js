import { describe, expect, it } from 'vitest';

import { analyzeHeuristics, normalizeIncomingInput } from './heuristics.js';

describe('heuristics', () => {
  it('detects a suspicious phishing URL with Malaysia-specific spoofing cues', () => {
    const input = normalizeIncomingInput({
      content: 'https://maybank-alert-secure.com/login/verify'
    });

    const result = analyzeHeuristics(input);

    expect(input.detectedKind).toBe('url');
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.redFlags.join(' ')).toMatch(/domain|link|URL|imitate/i);
  });

  it('detects credential and urgency patterns in scam text', () => {
    const input = normalizeIncomingInput({
      content:
        'URGENT: Bank Negara investigation. Transfer to safe account immediately and confirm OTP to avoid account suspension.'
    });

    const result = analyzeHeuristics(input);

    expect(input.detectedKind).toBe('text');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.matchedKeywords).toContain('bank negara');
    expect(result.matchedKeywords).toContain('otp');
  });
});

