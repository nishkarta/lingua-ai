import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured) {
    try {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  } else {
    console.info(
      '%c[LinguaAI Firebase]%c No Firebase config found in environment variables. Falling back to active memory mode.',
      'color: #6366f1; font-weight: bold;',
      'color: inherit;'
    );
  }
}

export { app, auth, db };
