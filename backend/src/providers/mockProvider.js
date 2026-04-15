import { CommunityNormalizationSchema } from '../schemas/report.js';
import { buildDefaultCommunityNormalization, buildDefaultProviderAnalysis } from './providerOutputUtils.js';

export class MockProvider {
  async analyzeThreat({ normalizedInput, heuristics, retrieval }) {
    return buildDefaultProviderAnalysis({ normalizedInput, heuristics, retrieval });
  }

  async normalizeCommunityReport({ submission, sanitizedText }) {
    return CommunityNormalizationSchema.parse(buildDefaultCommunityNormalization({ submission, sanitizedText }));
  }
}
