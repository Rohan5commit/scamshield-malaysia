import fs from 'node:fs/promises';
import path from 'node:path';

import { env } from '../config.js';

const seedPath = path.join(env.dataDir, 'malaysian_scam_seed.json');
const communitySeedPath = path.join(env.dataDir, 'community_reports.seed.json');
const demoInputsPath = path.join(env.dataDir, 'demo_inputs.json');

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function tokenScore(inputTokens, candidateTokens) {
  if (inputTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  const input = new Set(inputTokens);
  const candidate = new Set(candidateTokens);
  let overlap = 0;

  for (const token of candidate) {
    if (input.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(input.size, candidate.size);
}

function clampUnit(value) {
  return Math.max(0, Math.min(1, value));
}

function scoreSeedPattern(pattern, normalizedInput) {
  const candidateTokens = [...pattern.searchTokens, ...pattern.commonKeywords.map((keyword) => keyword.toLowerCase())];
  let score = tokenScore(normalizedInput.tokens, candidateTokens) * 0.7;

  if (normalizedInput.url && pattern.suspiciousDomains.some((domain) => normalizedInput.url.hostname.includes(domain.replace(/^https?:\/\//, '')))) {
    score += 0.25;
  }

  if (normalizedInput.phone && pattern.suspiciousPhoneHints.some((hint) => normalizedInput.phone.normalizedDigits.startsWith(hint.replace(/\D+/g, '')))) {
    score += 0.2;
  }

  if (normalizedInput.normalizedText.toLowerCase().includes(pattern.category.replace(/-/g, ' '))) {
    score += 0.08;
  }

  return clampUnit(score);
}

function scoreCommunityReport(report, normalizedInput) {
  const candidateTokens = [...report.tags, ...report.redFlags, report.title, report.summary]
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 2);

  return clampUnit(tokenScore(normalizedInput.tokens, candidateTokens));
}

function toThreatMatch(item, score) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    score,
    summary: item.summary,
    malaysiaContext: item.malaysiaContext,
    redFlags: item.redFlags
  };
}

export async function getSeedPatterns() {
  return readJson(seedPath);
}

export async function getCommunitySeedReports() {
  return readJson(communitySeedPath);
}

export async function getDemoInputs() {
  return readJson(demoInputsPath);
}

export async function runRetrievalAgent({ normalizedInput, storage }) {
  const [patterns, seededReports, userReports] = await Promise.all([
    getSeedPatterns(),
    getCommunitySeedReports(),
    storage.listUserReports()
  ]);

  const seedMatches = patterns
    .map((pattern) => ({ pattern, score: scoreSeedPattern(pattern, normalizedInput) }))
    .filter((entry) => entry.score >= 0.12)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => toThreatMatch(entry.pattern, entry.score));

  const communityMatches = [...seededReports, ...userReports]
    .map((report) => ({ report, score: scoreCommunityReport(report, normalizedInput) }))
    .filter((entry) => entry.score >= 0.12)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((entry) => toThreatMatch(entry.report, entry.score));

  return {
    seed: seedMatches,
    community: communityMatches
  };
}

