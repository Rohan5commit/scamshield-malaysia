import { z } from 'zod';

export const InputKindSchema = z.enum(['text', 'url', 'phone', 'image']);
export const VerdictSchema = z.enum(['low risk', 'suspicious', 'likely scam', 'critical scam risk']);
export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const UploadedFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number().nonnegative(),
  bufferBase64: z.string().optional()
});

export const AnalyzeRequestSchema = z
  .object({
    kind: InputKindSchema.optional(),
    content: z.string().trim().max(5000).optional(),
    notes: z.string().trim().max(1200).optional(),
    languageHint: z.string().trim().max(40).optional(),
    file: UploadedFileSchema.optional()
  })
  .refine((value) => Boolean(value.content || value.file), {
    message: 'Provide text, URL, phone number, or image upload.'
  });

export const NormalizedInputSchema = z.object({
  detectedKind: InputKindSchema,
  originalContent: z.string().default(''),
  normalizedText: z.string().default(''),
  notes: z.string().default(''),
  languageHint: z.string().default('en'),
  tokens: z.array(z.string()).default([]),
  url: z
    .object({
      normalized: z.string(),
      hostname: z.string(),
      pathname: z.string(),
      protocol: z.string()
    })
    .optional(),
  phone: z
    .object({
      original: z.string(),
      formatted: z.string(),
      normalizedDigits: z.string(),
      countryCode: z.string().nullable(),
      looksMalaysian: z.boolean(),
      isValid: z.boolean()
    })
    .optional(),
  file: UploadedFileSchema.optional(),
  extractedIndicators: z.array(z.string()).default([])
});

export const HeuristicAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  redFlags: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  tags: z.array(z.string()),
  reasons: z.array(z.string())
});

export const ThreatMatchSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  score: z.number().min(0).max(1),
  summary: z.string(),
  malaysiaContext: z.string().optional(),
  redFlags: z.array(z.string()).default([])
});

export const ProviderAnalysisSchema = z.object({
  category: z.string(),
  verdict: VerdictSchema,
  confidence: z.number().min(0).max(100),
  modelRisk: z.number().min(0).max(100),
  redFlags: z.array(z.string()).min(1),
  conciseExplanation: z.string(),
  recommendedActions: z.array(z.string()).min(2),
  malaysiaContext: z.string(),
  communitySummary: z.string(),
  severityLabel: z.string(),
  reasoningTrace: z.array(z.string()).default([])
});

export const ScoreCompositionSchema = z.object({
  heuristics: z.number().min(0).max(100),
  retrieval: z.number().min(0).max(100),
  model: z.number().min(0).max(100),
  community: z.number().min(0).max(100)
});

export const AnalysisResultSchema = z.object({
  requestId: z.string(),
  analyzedAt: z.string(),
  providerMode: z.enum(['mock', 'gemini']),
  input: NormalizedInputSchema,
  verdict: VerdictSchema,
  riskLevel: RiskLevelSchema,
  riskScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  category: z.string(),
  redFlags: z.array(z.string()),
  conciseExplanation: z.string(),
  recommendedActions: z.array(z.string()),
  malaysiaContext: z.string(),
  scoreComposition: ScoreCompositionSchema,
  heuristics: HeuristicAnalysisSchema,
  matches: z.object({
    seed: z.array(ThreatMatchSchema),
    community: z.array(ThreatMatchSchema)
  }),
  communityDraft: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    privacyNotice: z.string()
  }),
  scoreExplanation: z.string()
});

