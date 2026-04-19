import { describe, expect, it } from 'vitest';

import { sanitizeCommunitySubmission } from './pii.js';

describe('sanitizeCommunitySubmission', () => {
  it('redacts PII across all user-controlled fields', () => {
    const result = sanitizeCommunitySubmission({
      title: 'WhatsApp recruiter +60123456789',
      description: 'Reach me at victim@example.com and click https://fraud.example/login',
      category: 'job scam',
      channel: 'whatsapp',
      locationHint: 'Penang',
      tags: ['https://fraud.example/login', 'tasks']
    });

    expect(result.blockedMatches).toEqual([]);
    expect(result.submission.title).toContain('[redacted-phone]');
    expect(result.submission.description).toContain('[redacted-email]');
    expect(result.submission.description).toContain('[redacted-url]');
    expect(result.submission.tags[0]).toBe('[redacted-url]');
    expect(result.piiRedactions).toEqual(expect.arrayContaining(['phone', 'email', 'url']));
  });

  it('flags blocked identifiers outside the description field', () => {
    const result = sanitizeCommunitySubmission({
      title: 'NRIC 900101015555',
      description: 'Scammer claimed to be from a bank.',
      category: 'bank scam',
      channel: 'phone',
      locationHint: 'Johor Bahru',
      tags: ['bank']
    });

    expect(result.blockedMatches).toContain('nric');
  });
});
