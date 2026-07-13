"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormData } from "@/context/FormContext";
import { updateApplicationData } from "@/lib/application-sync";

export default function SuccessPage() {
  const router = useRouter();
  const { docId, confirmationCode, reset } = useFormData();
  const code = confirmationCode || `ESA-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    if (!docId) return;

    void updateApplicationData(docId, {
      status: "completed",
      currentStep: "confi",
      currentPage: "success",
    }).catch((error) => {
      console.error("Failed to mark application as completed:", error);
    });
  }, [docId]);

  function handleHome() { reset(); router.push("/"); }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" dir="rtl">
      <div className="w-full max-w-sm mx-auto px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0c6e3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.5 3.5 6.5-7"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">تمت العملية بنجاح!</h1>
        <p className="text-gray-400 text-sm mb-8">تم استلام طلبك وسيتم معالجته قريباً</p>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
          <p className="text-xs text-gray-400 mb-2">رقم الطلب</p>
          <div className="bg-white border-2 border-dashed border-[#0c6e3e]/30 rounded-xl py-4 px-6 mb-4">
            <span className="text-2xl font-extrabold text-[#0c6e3e] tracking-widest">{code}</span>
          </div>
          <p className="text-xs text-gray-400">احتفظ بهذا الرمز لمتابعة طلبك</p>
        </div>
        <div className="flex justify-center mb-8">
          <img src="/esaad-logo.png" alt="إسعاد" className="h-12 w-12 object-contain opacity-60" />
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 text-right">
          <h3 className="text-sm font-bold text-gray-700 mb-3">ما الذي يحدث الآن؟</h3>
          {["مراجعة بياناتك ووثائقك","إشعار خلال 3-5 أيام عمل","إرسال البطاقة على عنوانك","تفعيل البطاقة والاستمتاع بالمزايا"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <span className="w-5 h-5 rounded-full bg-[#0c6e3e]/10 text-[#0c6e3e] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-gray-500 text-xs">{item}</span>
            </div>
          ))}
        </div>
        <button onClick={handleHome} className="w-full py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #0c6e3e 0%, #7cb342 100%)" }}>
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
