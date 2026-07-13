"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface FormData {
  name: string; phone: string; id_number: string;
  membership: string; emirate: string; delivery_date: string;
}

interface FormContextType {
  data: FormData; setField: (k: keyof FormData, v: string) => void; reset: () => void;
  docId: string | null; setDocId: (id: string | null) => void;
  confirmationCode: string; setConfirmationCode: (c: string) => void;
  hydrated: boolean;
}

const empty: FormData = { name: "", phone: "", id_number: "", membership: "", emirate: "", delivery_date: "" };
const STORAGE_KEY = "alsaada-m-form-state";

const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FormData>(empty);
  const [docId, setDocId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          data?: Partial<FormData>;
          docId?: string | null;
          confirmationCode?: string;
        };

        if (parsed.data) {
          setData({ ...empty, ...parsed.data });
        }

        setDocId(parsed.docId ?? null);
        setConfirmationCode(parsed.confirmationCode ?? "");
      }
    } catch (error) {
      console.error("Failed to restore form state:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data, docId, confirmationCode }),
      );
    } catch (error) {
      console.error("Failed to persist form state:", error);
    }
  }, [hydrated, data, docId, confirmationCode]);

  const setField = (k: keyof FormData, v: string) => setData((prev) => ({ ...prev, [k]: v }));
  const reset = () => {
    setData(empty);
    setDocId(null);
    setConfirmationCode("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear form state:", error);
    }
  };
  return (
    <FormContext.Provider value={{ data, setField, reset, docId, setDocId, confirmationCode, setConfirmationCode, hydrated }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormData() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormData must be inside FormProvider");
  return ctx;
}
