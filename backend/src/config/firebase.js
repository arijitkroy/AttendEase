import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let isFirebaseInitialized = false;

const resolveKeyPath = (rawPath) => {
  if (!rawPath) return null;
  const directPath = path.resolve(process.cwd(), rawPath);
  if (fs.existsSync(directPath)) return directPath;
  
  const fromConfigPath = path.resolve(__dirname, rawPath);
  if (fs.existsSync(fromConfigPath)) return fromConfigPath;

  const backendRootPath = path.resolve(__dirname, '..', '..', rawPath);
  if (fs.existsSync(backendRootPath)) return backendRootPath;

  return null;
};

try {
  const resolvedPath = resolveKeyPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    isFirebaseInitialized = true;
    console.log('[Firebase] Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
  } else if (resolvedPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    isFirebaseInitialized = true;
    console.log(`[Firebase] Admin initialized with service account JSON: ${path.basename(resolvedPath)}`);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
    isFirebaseInitialized = true;
    console.log('[Firebase] Admin initialized with direct environment credentials');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    db = admin.firestore();
    isFirebaseInitialized = true;
    console.log('[Firebase] Admin initialized with Project ID');
  } else {
    console.log('[Firebase] No Firebase credentials detected in .env. Running in local persistence mode with automatic fallback.');
  }
} catch (error) {
  console.warn('[Firebase] Initialization warning:', error.message);
  console.log('[Firebase] Defaulting to persistent storage layer.');
}

export { admin, db, isFirebaseInitialized };
