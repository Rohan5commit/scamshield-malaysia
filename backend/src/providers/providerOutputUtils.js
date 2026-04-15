import { CommunityNormalizationSchema } from '../schemas/report.js';
import { ProviderAnalysisSchema } from '../schemas/analysis.js';
import { analyzeHeuristics, normalizeIncomingInput, normalizeWhitespace } from '../utils/heuristics.js';

function uniqueStrings(values, limit = Number.POSITIVE_INFINITY) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value) => typeof value === 'string')
        .map((value) => normalizeWhitespace(value))
        .filter(Boolean)
    )
  ).slice(0, limit);
}

function asObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  return {};
}

function pickFirstValue(source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return undefined;
}

function pickFirstString(source, keys) {
  const value = pickFirstValue(source, keys);
  return typeof value === 'string' ? normalizeWhitespace(value) : undefined;
}

function clampScore(value, fallback) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function parseStringList(value, { splitOnComma = false } = {}) {
  if (Array.isArray(value)) {
    return uniqueStrings(value);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const normalized = value.replace(/\r/g, '');
  const pattern = splitOnComma ? /\n+|;|,/ : /\n+|;/;

  return uniqueStrings(
    normalized
      .split(pattern)
      .map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
      .filter(Boolean)
  );
}

function parseLabeledSections(text = '') {
  const sections = new Map();
  const pattern = /(?:^|\n)\s*(?:\d+[.)]\s*)?([A-Za-z][A-Za-z _-]{2,40})\s*:\s*([\s\S]*?)(?=(?:\n\s*(?:\d+[.)]\s*)?[A-Za-z][A-Za-z _-]{2,40}\s*:)|$)/g;

  for (const match of text.matchAll(pattern)) {
    const heading = normalizeWhitespace(match[1]).toLowerCase();
    const value = match[2].trim();

    if (heading && value) {
      sections.set(heading, value);
    }
  }

  return sections;
}

function findSection(sections, aliases) {
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase();
    if (sections.has(normalizedAlias)) {
      return sections.get(normalizedAlias);
    }
  }

  return undefined;
}

function normalizeCategoryValue(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function normalizeVerdict(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes('critical')) {
    return 'critical scam risk';
  }

  if (normalized.includes('likely') || normalized.includes('high risk') || normalized === 'scam') {
    return 'likely scam';
  }

  if (normalized.includes('suspicious') || normalized.includes('medium')) {
    return 'suspicious';
  }

  if (normalized.includes('low')) {
    return 'low risk';
  }

  return fallback;
}

function normalizeRiskLevel(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes('critical')) {
    return 'critical';
  }

  if (normalized.includes('high')) {
    return 'high';
  }

  if (normalized.includes('medium')) {
    return 'medium';
  }

  if (normalized.includes('low')) {
    return 'low';
  }

  return fallback;
}

function normalizeChannel(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.toLowerCase();
  const aliasMap = {
    sms: 'sms',
    text: 'sms',
    whatsapp: 'whatsapp',
    telegram: 'telegram',
    phone: 'phone',
    call: 'phone',
    email: 'email',
    website: 'website',
    web: 'website',
    social: 'social',
    marketplace: 'marketplace',
    other: 'other'
  };

  return aliasMap[normalized] ?? fallback;
}

export function categoryFromContext({ normalizedInput, retrieval }) {
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

export function modelRiskFromContext({ normalizedInput, heuristics, retrieval }) {
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

export function verdictFromRisk(score) {
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

export function recommendedActionsFromContext({ normalizedInput, retrieval }) {
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

export function buildDefaultProviderAnalysis({ normalizedInput, heuristics, retrieval }) {
  const modelRisk = modelRiskFromContext({ normalizedInput, heuristics, retrieval });
  const category = categoryFromContext({ normalizedInput, retrieval });
  const topMatch = retrieval.seed[0];
  const verdict = verdictFromRisk(modelRisk);

  return ProviderAnalysisSchema.parse({
    category,
    verdict,
    confidence: Math.max(52, Math.min(96, Math.round(modelRisk * 0.9))),
    modelRisk,
    redFlags: uniqueStrings([...heuristics.redFlags, ...(topMatch?.redFlags ?? [])], 5),
    conciseExplanation:
      topMatch?.summary ??
      'The input shows social-engineering patterns commonly used in Malaysian scam campaigns, including urgency, impersonation, and a push toward unsafe action.',
    recommendedActions: recommendedActionsFromContext({ normalizedInput, retrieval }),
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

export function coerceProviderAnalysis({ payload, responseText, context }) {
  const source = asObject(payload);
  const sections = parseLabeledSections(responseText);
  const fallback = buildDefaultProviderAnalysis(context);

  const explanation =
    pickFirstString(source, ['conciseExplanation', 'concise_explanation', 'analysis', 'explanation', 'summary']) ??
    normalizeWhitespace(findSection(sections, ['explanation', 'analysis', 'summary'])) ??
    fallback.conciseExplanation;

  const malaysiaContext =
    pickFirstString(source, ['malaysiaContext', 'malaysia_context', 'localContext', 'context']) ??
    normalizeWhitespace(findSection(sections, ['malaysia context', 'local context', 'context'])) ??
    fallback.malaysiaContext;

  const communitySummary =
    pickFirstString(source, ['communitySummary', 'community_summary', 'community_feed_summary', 'feedSummary']) ??
    normalizeWhitespace(findSection(sections, ['community feed summary', 'community summary'])) ??
    fallback.communitySummary;

  const redFlags = uniqueStrings(
    [
      parseStringList(pickFirstValue(source, ['redFlags', 'red_flags', 'warningSigns', 'indicators'])),
      fallback.redFlags
    ],
    5
  );

  const recommendedActions = uniqueStrings(
    [
      parseStringList(
        pickFirstValue(source, ['recommendedActions', 'recommended_actions', 'recommendations', 'actions'])
      ),
      parseStringList(findSection(sections, ['recommended actions', 'recommendations', 'actions'])),
      fallback.recommendedActions
    ],
    5
  );

  const modelRisk = clampScore(
    Number(
      pickFirstValue(source, [
        'modelRisk',
        'model_risk',
        'riskScore',
        'risk_score',
        'score',
        'scamRisk',
        'scam_risk'
      ])
    ),
    fallback.modelRisk
  );

  const verdict =
    normalizeVerdict(
      pickFirstString(source, ['verdict', 'severityLabel', 'severity_label', 'riskLevel', 'risk_level']),
      undefined
    ) ?? verdictFromRisk(modelRisk);

  const confidence = clampScore(Number(pickFirstValue(source, ['confidence', 'confidenceScore', 'confidence_score'])), Math.max(52, Math.min(96, Math.round(modelRisk * 0.9))));

  return ProviderAnalysisSchema.parse({
    category: normalizeCategoryValue(pickFirstString(source, ['category', 'categoryLabel', 'type']), fallback.category),
    verdict,
    confidence,
    modelRisk,
    redFlags,
    conciseExplanation: explanation,
    recommendedActions,
    malaysiaContext,
    communitySummary,
    severityLabel:
      pickFirstString(source, ['severityLabel', 'severity_label', 'severity']) ??
      verdict,
    reasoningTrace: uniqueStrings(
      [
        parseStringList(pickFirstValue(source, ['reasoningTrace', 'reasoning_trace', 'reasoning', 'reasons'])),
        fallback.reasoningTrace
      ],
      6
    )
  });
}

function defaultCommunityCategory({ submission, heuristics }) {
  return submission.category ?? (heuristics.tags.includes('authority-impersonation') ? 'authority-impersonation' : 'community-report');
}

function defaultCommunityRiskLevel(heuristics, submission) {
  if (submission.suspectedRiskLevel) {
    return submission.suspectedRiskLevel;
  }

  if (heuristics.score >= 80) {
    return 'critical';
  }

  if (heuristics.score >= 60) {
    return 'high';
  }

  if (heuristics.score >= 35) {
    return 'medium';
  }

  return 'low';
}

export function buildDefaultCommunityNormalization({ submission, sanitizedText }) {
  const normalizedInput = normalizeIncomingInput({
    kind: 'text',
    content: sanitizedText
  });
  const heuristics = analyzeHeuristics(normalizedInput);

  return CommunityNormalizationSchema.parse({
    title: submission.title ?? sanitizedText.slice(0, 72),
    summary: sanitizedText.slice(0, 240),
    category: defaultCommunityCategory({ submission, heuristics }),
    channel: submission.channel,
    tags: uniqueStrings([...submission.tags, ...heuristics.tags], 6),
    redFlags: heuristics.redFlags.slice(0, 4),
    locationHint: submission.locationHint ?? null,
    riskLevel: defaultCommunityRiskLevel(heuristics, submission),
    piiRedactions: []
  });
}

export function coerceCommunityNormalization({ payload, responseText, submission, sanitizedText }) {
  const source = asObject(payload);
  const sections = parseLabeledSections(responseText);
  const fallback = buildDefaultCommunityNormalization({ submission, sanitizedText });

  return CommunityNormalizationSchema.parse({
    title:
      pickFirstString(source, ['title', 'headline']) ??
      normalizeWhitespace(findSection(sections, ['title', 'headline'])) ??
      fallback.title,
    summary:
      pickFirstString(source, ['summary', 'description']) ??
      normalizeWhitespace(findSection(sections, ['summary', 'description'])) ??
      fallback.summary,
    category: normalizeCategoryValue(pickFirstString(source, ['category', 'categoryLabel']), fallback.category),
    channel: normalizeChannel(pickFirstString(source, ['channel']), fallback.channel),
    tags: uniqueStrings(
      [
        parseStringList(pickFirstValue(source, ['tags']), { splitOnComma: true }),
        fallback.tags
      ],
      6
    ),
    redFlags: uniqueStrings(
      [
        parseStringList(pickFirstValue(source, ['redFlags', 'red_flags'])),
        fallback.redFlags
      ],
      4
    ),
    locationHint:
      pickFirstString(source, ['locationHint', 'location_hint']) ??
      normalizeWhitespace(findSection(sections, ['location hint', 'location'])) ??
      fallback.locationHint,
    riskLevel:
      normalizeRiskLevel(pickFirstString(source, ['riskLevel', 'risk_level', 'severity']), fallback.riskLevel),
    piiRedactions: uniqueStrings(
      [
        parseStringList(pickFirstValue(source, ['piiRedactions', 'pii_redactions']), { splitOnComma: true }),
        fallback.piiRedactions
      ],
      6
    )
  });
}
