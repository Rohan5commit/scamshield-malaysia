export const version = 'explanation-generation.v1';

export function buildExplanationInstruction() {
  return `Return exactly one JSON object and no markdown.
Use these exact camelCase keys:
- category: short kebab-case label such as phishing-link, parcel-scam, authority-impersonation, suspicious-caller
- verdict: one of "low risk", "suspicious", "likely scam", "critical scam risk"
- confidence: integer 0-100
- modelRisk: integer 0-100
- redFlags: array of 3-5 short strings
- conciseExplanation: short plain-English explanation
- recommendedActions: array of 2-5 practical actions
- malaysiaContext: short Malaysia-specific context
- communitySummary: one-sentence summary for the community feed
- severityLabel: short label aligned to the verdict
- reasoningTrace: array of short reasoning steps
Keep it specific, consumer-safe, and non-alarmist.`;
}
