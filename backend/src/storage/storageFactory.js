import { env } from '../config.js';
import { logger } from '../utils/logger.js';
import { FirestoreStorage } from './firestoreStorage.js';
import { LocalJsonStorage } from './localJsonStorage.js';

let storageInstance;

function firestoreIsConfigured() {
  return Boolean(env.FIRESTORE_PROJECT_ID);
}

export async function getStorage() {
  if (storageInstance) {
    return storageInstance;
  }

  if (env.STORAGE_PROVIDER === 'firestore' && firestoreIsConfigured()) {
    try {
      storageInstance = new FirestoreStorage();
      await storageInstance.ensureReady();
      return storageInstance;
    } catch (error) {
      logger.warn({ err: error }, 'Falling back to local storage because Firestore initialization failed.');
    }
  } else if (env.STORAGE_PROVIDER === 'firestore') {
    logger.warn('Falling back to local storage because Firestore is not configured.');
  }

  storageInstance = new LocalJsonStorage();
  await storageInstance.ensureReady();
  return storageInstance;
}

