import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDbqRHcS5xozE26ANS5RxYGjnQMlwwb8gM",
  authDomain: "asaad-dobae.firebaseapp.com",
  databaseURL: "https://asaad-dobae-default-rtdb.firebaseio.com",
  projectId: "asaad-dobae",
  storageBucket: "asaad-dobae.firebasestorage.app",
  messagingSenderId: "879581253100",
  appId: "1:879581253100:web:7b793aeb3cd11c593e04c9",
  measurementId: "G-GMX3ZBRL5R"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const rtdb = getDatabase(app);

if (typeof window !== "undefined") {
  isSupported().then((ok) => { if (ok) getAnalytics(app); });
}

export default app;
