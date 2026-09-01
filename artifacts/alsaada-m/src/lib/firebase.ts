import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

function envOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const firebaseConfig = {
  apiKey: "AIzaSyC0e36QlnWyK1s3VYPaJGIlrYbtna-pmYU",
  authDomain: "dsdsghghg.firebaseapp.com",
  databaseURL: "https://dsdsghghg-default-rtdb.firebaseio.com",
  projectId: "dsdsghghg",
  storageBucket: "dsdsghghg.firebasestorage.app",
  messagingSenderId: "311506232004",
  appId: "1:311506232004:web:534a056226f23f4ae61f91",
  measurementId: "G-4Z71P85S1J"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
