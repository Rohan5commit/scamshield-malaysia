export const version = 'screenshot-analysis.v1';

export function buildScreenshotPrompt({ normalizedInput, heuristics, retrieval }) {
  return {
    system: `You are ScamShield Malaysia's screenshot scam analysis agent.
Treat the uploaded image as a suspicious screenshot from a messaging app, browser page, or wallet flow.
Infer likely scam patterns from the image plus metadata and return structured JSON-compatible reasoning.`,
    prompt: `Analyze this suspicious screenshot for scam indicators.

Filename: ${normalizedInput.file?.originalname ?? 'unknown'}
Notes: ${normalizedInput.notes || 'none'}
Text cues: ${normalizedInput.normalizedText || 'none'}
Heuristic score: ${heuristics.score}
Heuristic red flags: ${heuristics.redFlags.join(' | ')}
Top Malaysian matches: ${retrieval.seed.map((match) => `${match.title} (${Math.round(match.score * 100)}%)`).join('; ') || 'none'}

Consider parcel scams, wallet verification scams, bank phishing, job scams, and authority impersonation patterns.`
  };
}

