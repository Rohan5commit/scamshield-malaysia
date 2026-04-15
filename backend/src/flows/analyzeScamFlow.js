import { ai } from '../genkit.js';
import { AnalyzeRequestSchema, AnalysisResultSchema } from '../schemas/analysis.js';
import { runAnalysisAgent } from '../services/analysisAgent.js';
import { runIntakeAgent } from '../services/intakeAgent.js';
import { runReportGenerator } from '../services/reportGenerator.js';
import { runRetrievalAgent } from '../services/retrievalAgent.js';
import { runRiskScoringAgent } from '../services/riskScoringAgent.js';
import { getStorage } from '../storage/storageFactory.js';

export const analyzeScamFlow = ai.defineFlow(
  {
    name: 'analyzeScamFlow',
    inputSchema: AnalyzeRequestSchema,
    outputSchema: AnalysisResultSchema
  },
  async (payload) => {
    const storage = await getStorage();
    const { normalizedInput, heuristics } = runIntakeAgent(payload);
    const retrieval = await runRetrievalAgent({ normalizedInput, storage });
    const providerAnalysis = await runAnalysisAgent({ normalizedInput, heuristics, retrieval });
    const scoring = runRiskScoringAgent({ heuristics, retrieval, providerAnalysis });

    return runReportGenerator({
      normalizedInput,
      heuristics,
      retrieval,
      providerAnalysis,
      scoring
    });
  }
);

