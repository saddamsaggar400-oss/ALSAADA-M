"use client";

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useFormData } from "@/context/FormContext";
import { db } from "@/lib/firebase";
import { getRouteForRemoteState, touchApplication } from "@/lib/application-sync";

const HEARTBEAT_INTERVAL_MS = 15000;

export default function ApplicationBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const { docId, hydrated } = useFormData();

  useEffect(() => {
    if (!hydrated || !docId) return;

    const sendHeartbeat = () => {
      void touchApplication(docId, pathname).catch((error) => {
        console.error("Heartbeat sync failed:", error);
      });
    };

    sendHeartbeat();

    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    const onFocus = () => sendHeartbeat();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [docId, hydrated, pathname]);

  useEffect(() => {
    if (!hydrated || !docId) return;

    return onSnapshot(doc(db, "pays", docId), (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      const targetRoute = getRouteForRemoteState({
        redirectPage: data.redirectPage,
        currentStep: data.currentStep,
        currentPage: data.currentPage,
        status: data.status,
      });

      if (!targetRoute || targetRoute === pathname) {
        return;
      }

      router.replace(targetRoute);
    });
  }, [docId, hydrated, pathname, router]);

  return null;
}
