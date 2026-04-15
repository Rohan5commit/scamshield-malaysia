export const version = 'scam-message-analysis.v1';

export function buildMessagePrompt({ normalizedInput, heuristics, retrieval }) {
  return {
    system: `You are ScamShield Malaysia's analysis agent.
Return concise, structured output for suspicious messages.
Focus on Malaysian scam patterns, clear consumer risk, and reproducible reasoning.
Never ask follow-up questions.
Do not include markdown.`,
    prompt: `Analyze this suspicious message content.

Detected mode: ${normalizedInput.detectedKind}
Normalized content: ${normalizedInput.normalizedText}
Heuristic score: ${heuristics.score}
Heuristic red flags: ${heuristics.redFlags.join(' | ')}
Top Malaysian scam matches: ${retrieval.seed.map((match) => `${match.title} (${Math.round(match.score * 100)}%)`).join('; ') || 'none'}
Community pattern matches: ${retrieval.community.map((match) => `${match.title} (${Math.round(match.score * 100)}%)`).join('; ') || 'none'}

Produce a consumer-facing assessment for Malaysia.`
  };
}

