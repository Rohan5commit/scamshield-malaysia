import { describe, expect, it } from 'vitest';

import { analyzeHeuristics, normalizeIncomingInput } from '../utils/heuristics.js';
import { coerceCommunityNormalization, coerceProviderAnalysis } from './providerOutputUtils.js';

function makeAnalysisContext(content, retrieval = {}) {
  const normalizedInput = normalizeIncomingInput({ content });
  const heuristics = analyzeHeuristics(normalizedInput);

  return {
    normalizedInput,
    heuristics,
    retrieval: {
      seed:
        retrieval.seed ??
        [
          {
            id: 'seed-posmalaysia',
            title: 'POS Malaysia parcel release fee scam',
            category: 'parcel-scam',
            score: 0.68,
            summary: 'This pattern impersonates courier and customs workflows to extract a small payment or card details.',
            malaysiaContext: 'Courier and customs impersonation scams are repeatedly reported in Malaysia during parcel delivery seasons.',
            redFlags: ['The message pressures a small release fee through a non-official link.']
          }
        ],
      community:
        retrieval.community ??
        [
          {
            id: 'community-1',
            title: 'Parcel fee phishing',
            category: 'parcel-scam',
            score: 0.41,
            summary: 'Community reports describe repeated parcel-fee phishing messages using fake tracking links.',
            redFlags: ['Victims are redirected to spoofed tracking pages.']
          }
        ]
    }
  };
}

describe('providerOutputUtils', () => {
  it('coerces snake_case Gemini JSON into the provider analysis schema', () => {
    const context = makeAnalysisContext(
      'POS MALAYSIA parcel held by Kastam. Pay RM2.99 immediately to release package: http://postmy-track.cc/claim'
    );

    const result = coerceProviderAnalysis({
      payload: {
        analysis: 'This message impersonates POS Malaysia and pushes a small payment through a suspicious parcel-release link.',
        malaysia_context:
          'Malaysian parcel scams often mention Kastam or POS Malaysia to create urgency around fake customs clearance.',
        recommendations: [
          'Do not click the link.',
          'Verify the parcel on the official POS Malaysia website.'
        ],
        community_feed_summary:
          'Users report recurring parcel-payment phishing messages that imitate Malaysian courier and customs workflows.'
      },
      responseText: '',
      context
    });

    expect(result.category).toBe('parcel-scam');
    expect(result.verdict).toMatch(/suspicious|likely scam|critical scam risk/);
    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.conciseExplanation).toContain('POS Malaysia');
    expect(result.malaysiaContext).toContain('Malaysian');
    expect(result.recommendedActions.length).toBeGreaterThanOrEqual(2);
    expect(result.communitySummary).toContain('Users report');
  });

  it('extracts structured fields from prose Gemini responses when JSON output is absent', () => {
    const context = makeAnalysisContext(
      'POS MALAYSIA parcel held by Kastam. Pay RM2.99 immediately to release package: http://postmy-track.cc/claim',
      { seed: [], community: [] }
    );

    const result = coerceProviderAnalysis({
      payload: null,
      responseText: `1. Explanation:
This message claims your POS MALAYSIA parcel is held by customs and requires an immediate payment of RM2.99 for release. This is a phishing scam designed to steal your money or personal information.

2. Malaysia Context:
Scammers frequently impersonate well-known Malaysian entities like POS MALAYSIA and Kastam to pressure victims into quick payment.

3. Recommended Actions:
Do not click the link.
Do not make any payment.
Verify the parcel status through official POS Malaysia channels.

4. Community Feed Summary:
Reports of fake parcel-release payment messages are circulating in Malaysia via suspicious links.`,
      context
    });

    expect(result.category).toBe('phishing-link');
    expect(result.conciseExplanation).toContain('RM2.99');
    expect(result.malaysiaContext).toContain('Malaysian');
    expect(result.recommendedActions).toContain('Do not click the link.');
    expect(result.communitySummary).toContain('circulating');
  });

  it('coerces community normalization payloads with alias keys', () => {
    const result = coerceCommunityNormalization({
      payload: {
        headline: 'Telegram task scam asking for top-up',
        description: 'Victims are promised commission, then told to top up before withdrawals are unlocked.',
        tags: 'telegram, job, top-up',
        red_flags: ['Asked for an upfront payment before releasing funds.'],
        risk_level: 'high'
      },
      responseText: '',
      submission: {
        channel: 'telegram',
        category: undefined,
        locationHint: undefined,
        suspectedRiskLevel: undefined,
        title: undefined,
        tags: ['telegram'],
        description:
          'Telegram recruiter promised commission for review tasks and asked me to top up RM300 before release.'
      },
      sanitizedText:
        'Telegram recruiter promised commission for review tasks and asked me to top up RM300 before release.'
    });

    expect(result.title).toContain('Telegram');
    expect(result.channel).toBe('telegram');
    expect(result.tags).toContain('job');
    expect(result.redFlags[0]).toContain('upfront payment');
    expect(result.riskLevel).toBe('high');
  });
});
