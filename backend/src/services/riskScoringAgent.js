function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelFromScore(score) {
  if (score >= 85) {
    return 'critical';
  }

  if (score >= 65) {
    return 'high';
  }

  if (score >= 40) {
    return 'medium';
  }

  return 'low';
}

function applyVerdictFloor(score, verdict) {
  if (verdict === 'critical scam risk') {
    return Math.max(score, 85);
  }

  if (verdict === 'likely scam') {
    return Math.max(score, 65);
  }

  if (verdict === 'suspicious') {
    return Math.max(score, 40);
  }

  return score;
}

export function runRiskScoringAgent({ heuristics, retrieval, providerAnalysis }) {
  const retrievalScore = clamp((retrieval.seed[0]?.score ?? 0) * 100);
  const communityScore = clamp((retrieval.community[0]?.score ?? 0) * 100);
  const modelScore = clamp(providerAnalysis.modelRisk);
  const heuristicScore = clamp(heuristics.score);
  const blendedScore = clamp(heuristicScore * 0.35 + retrievalScore * 0.2 + communityScore * 0.1 + modelScore * 0.35);
  const riskScore = clamp(applyVerdictFloor(blendedScore, providerAnalysis.verdict));
  const confidence = clamp(providerAnalysis.confidence * 0.7 + retrievalScore * 0.15 + heuristicScore * 0.15);

  return {
    riskScore,
    confidence,
    riskLevel: levelFromScore(riskScore),
    scoreComposition: {
      heuristics: heuristicScore,
      retrieval: retrievalScore,
      model: modelScore,
      community: communityScore
    }
  };
}
