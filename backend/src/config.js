import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(backendRoot, '..');

loadDotenv({ path: path.join(repoRoot, '.env') });

const booleanish = z
  .union([z.boolean(), z.string(), z.undefined()])
  .transform((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    return value === undefined ? false : ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  });

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  MOCK_AI: booleanish.default(true),
  GEMINI_API_KEY: z.string().optional(),
  GENKIT_ENV: z.string().default('dev'),
  DEFAULT_MODEL: z.string().default('gemini-2.5-flash'),
  STORAGE_PROVIDER: z.enum(['local', 'firestore']).default('local'),
  LOCAL_REPORTS_PATH: z.string().default('./backend/data/community_reports.json'),
  FIRESTORE_PROJECT_ID: z.string().optional(),
  FIRESTORE_COLLECTION: z.string().default('scamshield_reports'),
  FIRESTORE_KEY_JSON: z.string().optional(),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  ANALYZE_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(8),
  REPORTS_READ_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  REPORTS_WRITE_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  REPORTS_WRITE_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  RETRIEVAL_USER_REPORT_LIMIT: z.coerce.number().int().positive().default(15)
});

const parsed = EnvSchema.parse(process.env);

function toAbsolutePath(relativePath) {
  return path.resolve(repoRoot, relativePath);
}

export const env = {
  ...parsed,
  repoRoot,
  backendRoot,
  dataDir: path.join(backendRoot, 'data'),
  frontendDistDir: path.join(repoRoot, 'frontend', 'dist'),
  localReportsPath: toAbsolutePath(parsed.LOCAL_REPORTS_PATH),
  maxUploadBytes: parsed.MAX_UPLOAD_MB * 1024 * 1024,
  hasGeminiKey: Boolean(parsed.GEMINI_API_KEY && parsed.GEMINI_API_KEY.trim())
};
