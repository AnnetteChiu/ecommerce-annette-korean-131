import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration should be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore;

try {
  // This will throw if the config values are undefined
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Firebase config values are missing in .env.local. Skipping initialization.");
  }
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);

} catch (error) {
  console.warn((error as Error).message);
  // If initialization fails, create a dummy `db` object.
  // This allows the application to load without crashing,
  // and pages that use `db` can check if it's properly configured.
  db = {
    app: {
      options: {}
    }
  } as any;
}


export { db };
