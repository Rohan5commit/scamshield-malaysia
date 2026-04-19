import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { env } from '../config.js';

function normalizeIp(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/^"|"$/g, '');

  if (!trimmed || trimmed.toLowerCase() === 'unknown' || trimmed.startsWith('_')) {
    return null;
  }

  if (trimmed.startsWith('[')) {
    const closingIndex = trimmed.indexOf(']');
    return closingIndex > 1 ? trimmed.slice(1, closingIndex) : null;
  }

  if (/:\d+$/.test(trimmed) && trimmed.indexOf(':') === trimmed.lastIndexOf(':')) {
    return trimmed.replace(/:\d+$/, '');
  }

  return trimmed;
}

function extractForwardedIp(headerValue) {
  if (typeof headerValue !== 'string' || headerValue.trim() === '') {
    return null;
  }

  for (const entry of headerValue.split(',')) {
    for (const token of entry.split(';')) {
      const [key, rawValue] = token.trim().split('=');

      if (key?.toLowerCase() === 'for') {
        return normalizeIp(rawValue);
      }
    }
  }

  return null;
}

export function getClientIp(request) {
  const forwardedIp = extractForwardedIp(request.headers.forwarded);
  if (forwardedIp) {
    return forwardedIp;
  }

  const forwardedForHeader = request.headers['x-forwarded-for'];
  if (typeof forwardedForHeader === 'string' && forwardedForHeader.trim() !== '') {
    const [firstHop] = forwardedForHeader.split(',');
    const forwardedForIp = normalizeIp(firstHop);
    if (forwardedForIp) {
      return forwardedForIp;
    }
  }

  return request.ip || request.socket?.remoteAddress || '127.0.0.1';
}

function buildIpRateLimiter({ limit, windowMs }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator(request) {
      return ipKeyGenerator(getClientIp(request));
    }
  });
}

export const apiLimiter = buildIpRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX
});

export const analyzeLimiter = buildIpRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.ANALYZE_RATE_LIMIT_MAX
});

export const reportsReadLimiter = buildIpRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.REPORTS_READ_RATE_LIMIT_MAX
});

export const reportsWriteLimiter = buildIpRateLimiter({
  windowMs: env.REPORTS_WRITE_RATE_LIMIT_WINDOW_MS,
  limit: env.REPORTS_WRITE_RATE_LIMIT_MAX
});
