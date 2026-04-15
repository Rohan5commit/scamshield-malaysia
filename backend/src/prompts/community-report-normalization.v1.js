export const version = 'community-report-normalization.v1';

export function buildCommunityPrompt({ submission, sanitizedText }) {
  return {
    system: `You are ScamShield Malaysia's community intelligence agent.
Rewrite user-submitted reports into privacy-safe, anonymized Malaysian scam intelligence.
Do not preserve personal identifiers.
Return exactly one JSON object with these keys only:
title, summary, category, channel, tags, redFlags, locationHint, riskLevel, piiRedactions.
Use camelCase keys. riskLevel must be one of low, medium, high, critical.`,
    prompt: `Normalize this community scam report for storage and search.

Channel: ${submission.channel}
Category hint: ${submission.category ?? 'none'}
Location hint: ${submission.locationHint ?? 'none'}
Existing tags: ${submission.tags.join(', ') || 'none'}
Sanitized description: ${sanitizedText}

Return a short title, summary, tags, red flags, risk level, and category.`
  };
}
