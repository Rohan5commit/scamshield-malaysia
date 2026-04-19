import multer from 'multer';
import { Router } from 'express';

import { env } from '../config.js';
import { analyzeScamFlow } from '../flows/analyzeScamFlow.js';
import { analyzeLimiter } from '../utils/rateLimit.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }

    callback(new Error('Only image uploads are supported for screenshot analysis.'));
  }
});

function maybeHandleMultipart(request, response, next) {
  if (request.is('multipart/form-data')) {
    upload.single('image')(request, response, next);
    return;
  }

  next();
}

router.post('/', analyzeLimiter, maybeHandleMultipart, async (request, response, next) => {
  try {
    const result = await analyzeScamFlow({
      kind: request.body.kind,
      content: request.body.content,
      notes: request.body.notes,
      languageHint: request.body.languageHint,
      file: request.file
        ? {
            originalname: request.file.originalname,
            mimetype: request.file.mimetype,
            size: request.file.size,
            bufferBase64: request.file.buffer.toString('base64')
          }
        : undefined
    });

    response.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
