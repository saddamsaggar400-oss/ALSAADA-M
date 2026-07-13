import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? "AIzaSyDbqRHcS5xozE26ANS5RxYGjnQMlwwb8gM",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? "asaad-dobae.firebaseapp.com",
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL       ?? "https://asaad-dobae-default-rtdb.firebaseio.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? "asaad-dobae",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? "asaad-dobae.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "879581253100",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? "1:879581253100:web:7b793aeb3cd11c593e04c9",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     ?? "G-GMX3ZBRL5R",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
