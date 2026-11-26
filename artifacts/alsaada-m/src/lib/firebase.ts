import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

function envOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const firebaseConfig = {
  apiKey: "AIzaSyDtVZT1bL58TUaTFmS2tMs55pyxESmKCik",
  authDomain: "asahd022.firebaseapp.com",
  databaseURL: "https://asahd022-default-rtdb.firebaseio.com",
  projectId: "asahd022",
  storageBucket: "asahd022.firebasestorage.app",
  messagingSenderId: "1009965653576",
  appId: "1:1009965653576:web:556fa5d727a70da967c27d",
  measurementId: "G-ZLXYXDY9HW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
