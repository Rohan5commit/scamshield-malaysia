import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from '../config.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.file.bufferBase64',
      'metadata.apiKey',
      'metadata.GEMINI_API_KEY'
    ],
    censor: '[redacted]'
  }
});

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req(request) {
      return {
        method: request.method,
        url: request.url,
        remoteAddress: request.ip ?? request.remoteAddress,
        requestId: request.id
      };
    },
    res(response) {
      return {
        statusCode: response.statusCode
      };
    }
  }
});
