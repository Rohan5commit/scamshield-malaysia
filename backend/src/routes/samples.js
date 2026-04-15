import { Router } from 'express';

import { getDemoInputs } from '../services/retrievalAgent.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    response.json({ ok: true, data: await getDemoInputs() });
  } catch (error) {
    next(error);
  }
});

export default router;

