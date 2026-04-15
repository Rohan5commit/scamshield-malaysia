import { z } from 'zod';

export const ReportChannelSchema = z.enum([
  'sms',
  'whatsapp',
  'telegram',
  'phone',
  'email',
  'website',
  'social',
  'marketplace',
  'other'
]);

export const ReportSubmissionSchema = z.object({
  title: z.string().trim().min(4).max(120).optional(),
  description: z.string().trim().min(12).max(1200),
  category: z.string().trim().max(80).optional(),
  channel: ReportChannelSchema.default('other'),
  locationHint: z.string().trim().max(80).optional(),
  suspectedRiskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.array(z.string().trim().min(2).max(32)).max(8).default([])
});

export const NormalizedCommunityReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  channel: ReportChannelSchema,
  tags: z.array(z.string()),
  redFlags: z.array(z.string()),
  locationHint: z.string().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  reportedAt: z.string(),
  sourceType: z.enum(['user', 'seed']),
  fingerprint: z.string(),
  piiRedactions: z.array(z.string())
});

export const CommunityNormalizationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  channel: ReportChannelSchema,
  tags: z.array(z.string()),
  redFlags: z.array(z.string()),
  locationHint: z.string().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  piiRedactions: z.array(z.string())
});
