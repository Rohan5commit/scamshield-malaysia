import { Router } from 'express';

import { getProviderMode } from '../providers/aiProvider.js';
import { getCommunitySeedReports, getSeedPatterns } from '../services/retrievalAgent.js';
import { getStorage } from '../storage/storageFactory.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    const storage = await getStorage();
    const [patternSeed, communitySeed, storageStats] = await Promise.all([
      getSeedPatterns(),
      getCommunitySeedReports(),
      storage.getStats()
    ]);

    response.json({
      ok: true,
      data: {
        status: 'healthy',
        providerMode: getProviderMode(),
        patternSeedCount: patternSeed.length,
        communitySeedCount: communitySeed.length,
        storage: storageStats
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

