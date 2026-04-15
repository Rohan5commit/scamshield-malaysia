import { AnalyzeRequestSchema, NormalizedInputSchema } from '../schemas/analysis.js';
import { analyzeHeuristics, normalizeIncomingInput } from '../utils/heuristics.js';

export function runIntakeAgent(payload) {
  const parsed = AnalyzeRequestSchema.parse(payload);
  const normalizedInput = NormalizedInputSchema.parse(normalizeIncomingInput(parsed));
  const heuristics = analyzeHeuristics(normalizedInput);

  return { normalizedInput, heuristics };
}

