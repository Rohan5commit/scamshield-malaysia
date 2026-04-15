import path from 'node:path';
import fs from 'node:fs/promises';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ZodError } from 'zod';

import { env } from './config.js';
import analyzeRouter from './routes/analyze.js';
import healthRouter from './routes/health.js';
import reportsRouter from './routes/reports.js';
import samplesRouter from './routes/samples.js';
import { httpLogger, logger } from './utils/logger.js';

const frontendIndex = path.join(env.frontendDistDir, 'index.html');

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: false
    })
  );
  app.use(httpLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-8',
      legacyHeaders: false
    })
  );

  app.use('/api/health', healthRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/samples', samplesRouter);

  app.use(express.static(env.frontendDistDir));

  app.get('/{*path}', async (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }

    try {
      await fs.access(frontendIndex);
      response.sendFile(frontendIndex);
    } catch (error) {
      if (error.code === 'ENOENT') {
        response.status(404).json({
          ok: false,
          error: {
            message: 'Frontend build not found. Run the Vite dev server or build the frontend bundle.'
          }
        });
        return;
      }

      next(error);
    }
  });

  app.use((request, response) => {
    response.status(404).json({
      ok: false,
      error: {
        message: `Route not found: ${request.method} ${request.originalUrl}`
      }
    });
  });

  app.use((error, _request, response, _next) => {
    void _next;
    logger.error({ err: error }, 'Request failed.');

    if (error instanceof ZodError) {
      response.status(400).json({
        ok: false,
        error: {
          message: 'Validation failed.',
          issues: error.issues
        }
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      response.status(400).json({
        ok: false,
        error: {
          message: `Uploaded image is larger than ${env.MAX_UPLOAD_MB} MB.`
        }
      });
      return;
    }

    response.status(error.statusCode ?? 500).json({
      ok: false,
      error: {
        message: error.message ?? 'Unexpected server error.'
      }
    });
  });

  return app;
}

export const app = createApp();
