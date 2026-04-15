export const version = 'explanation-generation.v1';

export function buildExplanationInstruction() {
  return `Generate:
1. a concise explanation in plain English,
2. Malaysia-specific context,
3. a practical recommended action list,
4. a short community feed summary.
Keep it specific, consumer-safe, and non-alarmist.`;
}

