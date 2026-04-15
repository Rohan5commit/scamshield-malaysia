import { Router } from 'express';

import { normalizeCommunityReportFlow } from '../flows/normalizeCommunityReportFlow.js';
import { getCommunitySeedReports } from '../services/retrievalAgent.js';
import { getStorage } from '../storage/storageFactory.js';

const router = Router();

router.get('/', async (request, response, next) => {
  try {
    const query = (request.query.q ?? '').toString().trim().toLowerCase();
    const limit = Math.max(1, Math.min(50, Number(request.query.limit ?? 20)));
    const storage = await getStorage();
    const [seededReports, userReports] = await Promise.all([getCommunitySeedReports(), storage.listUserReports()]);
    const reports = [...userReports, ...seededReports]
      .filter((report) => {
        if (!query) {
          return true;
        }

        const haystack = [report.title, report.summary, report.category, ...(report.tags ?? [])].join(' ').toLowerCase();
        return haystack.includes(query);
      })
      .sort((left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime())
      .slice(0, limit);

    response.json({ ok: true, data: reports });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const normalizedReport = await normalizeCommunityReportFlow(request.body);
    const storage = await getStorage();
    await storage.saveReport(normalizedReport);
    response.status(201).json({ ok: true, data: normalizedReport });
  } catch (error) {
    next(error);
  }
});

export default router;

