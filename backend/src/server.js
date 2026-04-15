import { app } from './app.js';
import { env } from './config.js';
import { getStorage } from './storage/storageFactory.js';
import { logger } from './utils/logger.js';

await getStorage();

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      provider: env.MOCK_AI || !env.hasGeminiKey ? 'mock' : 'gemini',
      storage: env.STORAGE_PROVIDER
    },
    'ScamShield Malaysia backend is listening.'
  );
});

