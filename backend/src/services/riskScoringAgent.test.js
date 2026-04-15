import { describe, expect, it } from 'vitest';

import { runRiskScoringAgent } from './riskScoringAgent.js';

describe('riskScoringAgent', () => {
  it('produces a critical score when multiple strong signals align', () => {
    const result = runRiskScoringAgent({
      heuristics: { score: 88 },
      retrieval: {
        seed: [{ score: 0.91 }],
        community: [{ score: 0.72 }]
      },
      providerAnalysis: {
        modelRisk: 94,
        confidence: 90
      }
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(85);
    expect(result.riskLevel).toBe('critical');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
  });
});

