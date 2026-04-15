import fs from 'node:fs/promises';

import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../app.js';
import { env } from '../config.js';

const reportsPath = env.localReportsPath;

async function cleanupReportsFile() {
  try {
    await fs.unlink(reportsPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

beforeAll(async () => {
  await cleanupReportsFile();
});

afterAll(async () => {
  await cleanupReportsFile();
});

describe('API routes', () => {
  it('returns backend health details', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.providerMode).toBe('mock');
  });

  it('analyzes suspicious text in mock mode', async () => {
    const response = await request(app).post('/api/analyze').send({
      content:
        'POS MALAYSIA parcel held by Kastam. Pay RM2.99 immediately via http://postmy-track.cc/claim to avoid return.'
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.riskScore).toBeGreaterThanOrEqual(50);
    expect(response.body.data.redFlags.length).toBeGreaterThan(0);
  });

  it('saves a privacy-safe community report', async () => {
    const createResponse = await request(app).post('/api/reports').send({
      description:
        'Telegram recruiter promised commission for review tasks and asked me to top up RM300 before release. Contact came from +60123456789.',
      channel: 'telegram',
      tags: ['telegram', 'job']
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.summary).toMatch(/\[redacted-phone\]/);

    const listResponse = await request(app).get('/api/reports').query({ q: 'telegram' });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.length).toBeGreaterThan(0);
  });
});
