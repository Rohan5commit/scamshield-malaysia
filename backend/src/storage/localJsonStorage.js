import fs from 'node:fs/promises';
import path from 'node:path';

import { env } from '../config.js';

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
}

export class LocalJsonStorage {
  constructor(filePath = env.localReportsPath) {
    this.filePath = filePath;
  }

  async ensureReady() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const existing = await readJson(this.filePath, null);

    if (existing === null) {
      await fs.writeFile(this.filePath, '[]\n', 'utf8');
    }
  }

  async listUserReports(limit) {
    await this.ensureReady();
    const reports = await readJson(this.filePath, []);
    return typeof limit === 'number' ? reports.slice(0, limit) : reports;
  }

  async saveReport(report) {
    const current = await this.listUserReports();
    current.unshift(report);
    await fs.writeFile(this.filePath, JSON.stringify(current, null, 2), 'utf8');
    return report;
  }

  async getStats() {
    const reports = await this.listUserReports();
    return { storedReports: reports.length, mode: 'local' };
  }
}
