import { randomUUID } from 'node:crypto';

import { AnalysisResultSchema } from '../schemas/analysis.js';
import { getProviderMode } from '../providers/aiProvider.js';

function uniqueList(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildSafeInput(normalizedInput) {
  if (!normalizedInput.file?.bufferBase64) {
    return normalizedInput;
  }

  return {
    ...normalizedInput,
    file: {
      ...normalizedInput.file,
      bufferBase64: undefined
    }
  };
}

export function runReportGenerator({ normalizedInput, heuristics, retrieval, providerAnalysis, scoring }) {
  const redFlags = uniqueList([...providerAnalysis.redFlags, ...heuristics.redFlags]).slice(0, 6);
  const recommendedActions = uniqueList(providerAnalysis.recommendedActions).slice(0, 5);
  const topTags = uniqueList([
    providerAnalysis.category,
    ...heuristics.tags,
    ...(retrieval.seed[0]?.category ? [retrieval.seed[0].category] : [])
  ]).slice(0, 5);

  const scoreExplanation = `Score ${scoring.riskScore}/100 from heuristics ${scoring.scoreComposition.heuristics}, seeded-pattern retrieval ${scoring.scoreComposition.retrieval}, community similarity ${scoring.scoreComposition.community}, and model assessment ${scoring.scoreComposition.model}.`;

  return AnalysisResultSchema.parse({
    requestId: randomUUID(),
    analyzedAt: new Date().toISOString(),
    providerMode: getProviderMode(),
    input: buildSafeInput(normalizedInput),
    verdict: providerAnalysis.verdict,
    riskLevel: scoring.riskLevel,
    riskScore: scoring.riskScore,
    confidence: scoring.confidence,
    category: providerAnalysis.category,
    redFlags,
    conciseExplanation: providerAnalysis.conciseExplanation,
    recommendedActions,
    malaysiaContext: providerAnalysis.malaysiaContext,
    scoreComposition: scoring.scoreComposition,
    heuristics,
    matches: retrieval,
    communityDraft: {
      title: `${providerAnalysis.category.replace(/-/g, ' ')} warning`,
      summary: providerAnalysis.communitySummary,
      tags: topTags,
      privacyNotice: 'Community reports are stored in redacted form and should not contain IC, bank account, or full contact details.'
    },
    scoreExplanation
  });
}
