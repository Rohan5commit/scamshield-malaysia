import { Firestore } from '@google-cloud/firestore';

import { env } from '../config.js';

export class FirestoreStorage {
  constructor() {
    const options = env.FIRESTORE_KEY_JSON
      ? { projectId: env.FIRESTORE_PROJECT_ID, credentials: JSON.parse(env.FIRESTORE_KEY_JSON) }
      : { projectId: env.FIRESTORE_PROJECT_ID };

    this.collectionName = env.FIRESTORE_COLLECTION;
    this.client = new Firestore(options);
  }

  async ensureReady() {
    await this.client.collection(this.collectionName).limit(1).get();
  }

  async listUserReports(limit = 25) {
    const snapshot = await this.client.collection(this.collectionName).orderBy('reportedAt', 'desc').limit(limit).get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async saveReport(report) {
    await this.client.collection(this.collectionName).doc(report.id).set(report);
    return report;
  }

  async getStats() {
    const snapshot = await this.client.collection(this.collectionName).limit(1).get();
    return { storedReports: snapshot.size, mode: 'firestore', probe: 'ok' };
  }
}
