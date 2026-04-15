import { randomUUID } from 'node:crypto';

import { getAiProvider } from '../providers/aiProvider.js';
import { CommunityNormalizationSchema, NormalizedCommunityReportSchema, ReportSubmissionSchema } from '../schemas/report.js';
import { sha256 } from '../utils/hash.js';
import { sanitizeCommunityText } from '../utils/pii.js';

export async function runCommunityIntelligenceAgent(payload) {
  const submission = ReportSubmissionSchema.parse(payload);
  const sanitized = sanitizeCommunityText(submission.description);

  if (sanitized.blockedMatches.length > 0) {
    const error = new Error(`Please remove sensitive identifiers before submitting: ${sanitized.blockedMatches.join(', ')}.`);
    error.statusCode = 400;
    throw error;
  }

  const provider = getAiProvider();
  const normalized = CommunityNormalizationSchema.parse(
    await provider.normalizeCommunityReport({
      submission,
      sanitizedText: sanitized.sanitizedText
    })
  );

  return NormalizedCommunityReportSchema.parse({
    ...normalized,
    id: randomUUID(),
    reportedAt: new Date().toISOString(),
    sourceType: 'user',
    fingerprint: sha256(`${normalized.title}:${normalized.summary}:${normalized.category}`),
    piiRedactions: Array.from(new Set([...normalized.piiRedactions, ...sanitized.piiRedactions]))
  });
}

