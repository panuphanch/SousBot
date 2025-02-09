import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore>;

export function initializeFirebase() {
  if (!db) {
    console.log('Initializing Firebase...');
    
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Using environment variables for Firebase');
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('Private key length:', privateKey.length);

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
      });
    } else {
      console.log('Using service account for Firebase');
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