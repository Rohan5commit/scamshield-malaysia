import { ai } from '../genkit.js';
import { NormalizedCommunityReportSchema, ReportSubmissionSchema } from '../schemas/report.js';
import { runCommunityIntelligenceAgent } from '../services/communityIntelligenceAgent.js';

export const normalizeCommunityReportFlow = ai.defineFlow(
  {
    name: 'normalizeCommunityReportFlow',
    inputSchema: ReportSubmissionSchema,
    outputSchema: NormalizedCommunityReportSchema
  },
  async (payload) => runCommunityIntelligenceAgent(payload)
);

