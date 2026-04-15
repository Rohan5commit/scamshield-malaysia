export const version = 'phone-risk-analysis.v1';

export function buildPhonePrompt({ normalizedInput, heuristics, retrieval }) {
  return {
    system: `You are ScamShield Malaysia's phone risk agent.
Assess scam likelihood from caller identity cues, authority impersonation patterns, and known Malaysian fraud narratives.
Return structured analysis without markdown.`,
    prompt: `Analyze this suspicious phone number.

Original phone input: ${normalizedInput.phone?.original ?? normalizedInput.originalContent}
Normalized digits: ${normalizedInput.phone?.normalizedDigits ?? 'unknown'}
Looks Malaysian: ${normalizedInput.phone?.looksMalaysian ?? false}
Valid parse: ${normalizedInput.phone?.isValid ?? false}
Heuristic score: ${heuristics.score}
Top Malaysian matches: ${retrieval.seed.map((match) => `${match.title} (${Math.round(match.score * 100)}%)`).join('; ') || 'none'}

Highlight whether the number fits common authority or spoofing patterns in Malaysia.`
  };
}

