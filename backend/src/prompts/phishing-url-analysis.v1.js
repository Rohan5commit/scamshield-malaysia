export const version = 'phishing-url-analysis.v1';

export function buildUrlPrompt({ normalizedInput, heuristics, retrieval }) {
  return {
    system: `You are ScamShield Malaysia's phishing URL analysis agent.
Explain domain impersonation, payment traps, credential theft risk, and Malaysia-specific context.
Return strict JSON-compatible reasoning only.`,
    prompt: `Analyze this suspicious URL.

Normalized URL: ${normalizedInput.url?.normalized ?? 'unknown'}
Hostname: ${normalizedInput.url?.hostname ?? 'unknown'}
Heuristic score: ${heuristics.score}
Heuristic red flags: ${heuristics.redFlags.join(' | ')}
Top Malaysian matches: ${retrieval.seed.map((match) => `${match.title} (${Math.round(match.score * 100)}%)`).join('; ') || 'none'}

Emphasize whether the domain appears to spoof a Malaysian institution or payment brand.`
  };
}

