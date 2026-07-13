import { useEffect } from "react";
import { useLocation } from "wouter";
import StepBar from "@/components/StepBar";
import { useFormData } from "@/context/FormContext";
import {
  ensureApplicationDoc,
  generateConfirmationCode,
  hasRequiredApplicantData,
} from "@/lib/application-sync";

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { data, docId, setDocId, confirmationCode, setConfirmationCode, hydrated } = useFormData();

  useEffect(() => {
    if (!hydrated) return;

    if (!hasRequiredApplicantData(data)) {
      setLocation("/register");
      return;
    }

    const code = confirmationCode || generateConfirmationCode();
    if (!confirmationCode) setConfirmationCode(code);

    void ensureApplicationDoc({
      docId,
      data,
      confirmationCode: code,
      pathname: "/payment",
    })
      .then((resolvedId) => {
        if (resolvedId !== docId) setDocId(resolvedId);
      })
      .catch((error) => {
        console.error("Failed to initialize payment application:", error);
      });
  }, [confirmationCode, data, docId, hydrated, setLocation, setConfirmationCode, setDocId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:shadow-xl">
        <StepBar current={2} />
        <div className="px-4 pt-6 pb-10 max-w-sm mx-auto">
          <div className="flex justify-center mb-7">
            <div className="flex items-center gap-1">
              <span className="text-[#1a2b50] font-bold text-3xl tracking-tight">network</span>
              <span className="text-[#e63946] font-bold text-3xl tracking-tight">pay</span>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 11l5 5 7-9" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="bg-[#f8f9fb] rounded-2xl p-6 mb-6 text-right">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">تفاصيل الطلب</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">1 درهم</span>
                <span className="text-gray-500 text-sm">رسوم التسجيل</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0c6e3e]">مجاني</span>
                <span className="text-gray-500 text-sm">الاشتراك السنوي</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-lg">1 درهم</span>
                <span className="text-gray-500 text-sm">الإجمالي</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">معلومات المشترك</p>
            <div className="space-y-2 text-right">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">{data.name || "—"}</span>
                <span className="text-gray-400">الاسم</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700" dir="ltr">{data.phone || "—"}</span>
                <span className="text-gray-400">الهاتف</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">{data.membership || "—"}</span>
                <span className="text-gray-400">نوع العضوية</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setLocation("/card")}
            className="w-full py-4 text-base font-bold rounded-2xl text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #0c6e3e 0%, #7cb342 100%)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            المتابعة للدفع
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">معاملة آمنة ومشفرة بالكامل</p>
        </div>
      </div>
    </div>
  );
}
