import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logInfo } from '../utils/logger';
import { log } from 'console';

let db: ReturnType<typeof getFirestore>;

export function initializeFirebase() {
  if (!db) {
    logInfo('Initializing Firebase...');
    
    if (process.env.FIREBASE_PRIVATE_KEY) {
      logInfo('Using environment variables for Firebase');
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      logInfo(`Private key: ${privateKey}`);

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
      });
    } else {
      logInfo('Using service account for Firebase');
      const serviceAccount = require('../../../serviceAccountKey.json');
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    db = getFirestore();
    
    if (process.env.NODE_ENV === 'development') {
      db.settings({
        host: 'localhost:8080',
        ssl: false
      });
    }
  }
  
  return db;
}