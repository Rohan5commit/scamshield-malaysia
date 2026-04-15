import { getAiProvider } from '../providers/aiProvider.js';

export async function runAnalysisAgent(context) {
  const provider = getAiProvider();
  return provider.analyzeThreat(context);
}

