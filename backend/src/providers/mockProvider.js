import { CommunityNormalizationSchema } from '../schemas/report.js';
import { ProviderAnalysisSchema } from '../schemas/analysis.js';
import { analyzeHeuristics, normalizeIncomingInput } from '../utils/heuristics.js';

function categoryFromContext({ normalizedInput, retrieval }) {
  if (retrieval.seed[0]?.score >= 0.28) {
    return retrieval.seed[0].category;
  }

  if (retrieval.community[0]?.score >= 0.14) {
    return retrieval.community[0].category;
  }

  if (normalizedInput.url) {
    return 'phishing-link';
  }

  if (normalizedInput.phone) {
    return 'suspicious-caller';
  }

  if (normalizedInput.detectedKind === 'image') {
    return 'screenshot-scam';
  }

  return 'social-engineering';
}

function modelRiskFromInputs({ normalizedInput, heuristics, retrieval }) {
  const retrievalScore = Math.round((retrieval.seed[0]?.score ?? 0) * 100);
  const communityScore = Math.round((retrieval.community[0]?.score ?? 0) * 100);
  let score = Math.round(heuristics.score * 0.52 + retrievalScore * 0.24 + communityScore * 0.24);

  if (normalizedInput.detectedKind === 'image' && communityScore >= 14) {
    score = Math.max(score, 58);
  }

  if (normalizedInput.normalizedText.toLowerCase().includes('wallet') && normalizedInput.normalizedText.toLowerCase().includes('verify')) {
    score += 8;
  }

  return Math.max(15, Math.min(98, score));
}

function verdictFromRisk(score) {
  if (score >= 85) {
    return 'critical scam risk';
  }

  if (score >= 65) {
    return 'likely scam';
  }

  if (score >= 40) {
    return 'suspicious';
  }

  return 'low risk';
}

function recommendedActions({ normalizedInput, retrieval }) {
  const actions = new Set([
    'Do not click, reply, transfer money, or share OTP / TAC details.',
    'Verify the claim using the official website, app, or hotline of the organisation.'
  ]);

  if (normalizedInput.url) {
    actions.add('Open the official domain manually instead of using the suspicious link.');
  }

  if (normalizedInput.phone) {
    actions.add('If the caller claimed to be an authority or bank, hang up and call the official number yourself.');
  }

  if (retrieval.seed[0]?.title?.toLowerCase().includes('bank negara')) {
    actions.add("If funds were transferred recently, contact your bank and Malaysia's NSRC 997 as quickly as possible.");
  }

  if (retrieval.seed[0]?.recommendedActions) {
    retrieval.seed[0].recommendedActions.forEach((action) => actions.add(action));
  }

  return Array.from(actions).slice(0, 4);
}

export class MockProvider {
  async analyzeThreat({ normalizedInput, heuristics, retrieval }) {
    const modelRisk = modelRiskFromInputs({ normalizedInput, heuristics, retrieval });
    const category = categoryFromContext({ normalizedInput, retrieval });
    const topMatch = retrieval.seed[0];
    const verdict = verdictFromRisk(modelRisk);

    return ProviderAnalysisSchema.parse({
      category,
      verdict,
      confidence: Math.max(52, Math.min(96, Math.round(modelRisk * 0.9))),
      modelRisk,
      redFlags: Array.from(new Set([...heuristics.redFlags, ...(topMatch?.redFlags ?? [])])).slice(0, 5),
      conciseExplanation:
        topMatch?.summary ??
        'The input shows social-engineering patterns commonly used in Malaysian scam campaigns, including urgency, impersonation, and a push toward unsafe action.',
      recommendedActions: recommendedActions({ normalizedInput, retrieval }),
      malaysiaContext:
        topMatch?.malaysiaContext ??
        'This resembles scam patterns frequently reported in Malaysia, where victims are pressured to act before they can verify the message independently.',
      communitySummary:
        retrieval.community[0]?.summary ??
        'Community reports show similar narratives circulating, which raises confidence that this is part of a repeatable scam pattern.',
      severityLabel: verdict,
      reasoningTrace: heuristics.reasons
    });
  }

  async normalizeCommunityReport({ submission, sanitizedText }) {
    const normalizedInput = normalizeIncomingInput({
      kind: 'text',
      content: sanitizedText
    });
    const heuristics = analyzeHeuristics(normalizedInput);

    return CommunityNormalizationSchema.parse({
      title: submission.title ?? sanitizedText.slice(0, 72),
      summary: sanitizedText.slice(0, 240),
      category: submission.category ?? (heuristics.tags.includes('authority-impersonation') ? 'authority-impersonation' : 'community-report'),
      channel: submission.channel,
      tags: Array.from(new Set([...submission.tags, ...heuristics.tags])).slice(0, 6),
      redFlags: heuristics.redFlags.slice(0, 4),
      locationHint: submission.locationHint ?? null,
      riskLevel: submission.suspectedRiskLevel ?? (heuristics.score >= 80 ? 'critical' : heuristics.score >= 60 ? 'high' : heuristics.score >= 35 ? 'medium' : 'low'),
      piiRedactions: []
    });
  }
}
