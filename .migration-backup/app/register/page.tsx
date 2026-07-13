"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import StepBar from "@/components/StepBar";
import FormField from "@/components/FormField";
import { useFormData } from "@/context/FormContext";

const EMIRATES = ["دبي","أبوظبي","الشارقة","عجمان","رأس الخيمة","الفجيرة","أم القيوين"];

function validatePhone(v: string) { return /^\d{10}$/.test(v.trim()); }
function validateId(v: string) { return /^784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d$/.test(v.trim()) || v.trim().length >= 9; }
function validateDate(v: string) { if (!v) return false; return new Date(v) >= new Date(); }

export default function RegisterPage() {
  const router = useRouter();
  const { data, setField } = useFormData();
  const [errors, setErrors] = useState<Partial<Record<keyof typeof data, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setField(k, e.target.value);
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  function validate() {
    const e: typeof errors = {};
    if (!data.name.trim()) e.name = "الاسم الكامل مطلوب";
    else if (data.name.trim().length < 3) e.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!data.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (!validatePhone(data.phone)) e.phone = "رقم الهاتف غير صحيح";
    if (!data.id_number.trim()) e.id_number = "رقم الهوية مطلوب";
    else if (!validateId(data.id_number)) e.id_number = "رقم الهوية غير صحيح";
    if (!data.membership) e.membership = "يرجى اختيار نوع العضوية";
    if (!data.emirate) e.emirate = "يرجى اختيار الإمارة";
    if (!data.delivery_date) e.delivery_date = "تاريخ التوصيل مطلوب";
    else if (!validateDate(data.delivery_date)) e.delivery_date = "يجب أن يكون التاريخ في المستقبل";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`f-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/payment");
  }

  const selectCls = (err?: string) =>
    `w-full border rounded-xl px-4 py-3.5 text-base md:text-sm text-right appearance-none bg-white focus:outline-none transition-colors ${err ? "border-red-400" : "border-gray-300 focus:border-[#0c6e3e]"} text-gray-700`;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="mx-auto w-full max-w-md bg-white min-h-screen sm:shadow-xl">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="رجوع">
            <ChevronRight size={20} className="text-gray-500" />
          </button>
          <span className="font-bold text-gray-800 text-sm">طلب البطاقة</span>
        </div>
        <StepBar current={1} />
        <div className="px-5 pt-5 pb-3">
          <img src="/esaad-about.png" alt="بطاقة إسعاد" className="w-full object-contain drop-shadow-md rounded-2xl max-h-52" loading="lazy" />
        </div>
        <div className="px-5 pb-3">
          <h1 className="text-base font-bold text-gray-800">أدخل البيانات المطلوبة</h1>
          <p className="text-xs text-gray-400 mt-0.5">يرجى تعبئة جميع الحقول بشكل صحيح</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="px-5 pb-10 space-y-4">
          <div id="f-name">
            <FormField label="الاسم الكامل" required placeholder="أدخل اسمك الكامل" value={data.name} onChange={set("name")} error={errors.name} autoComplete="name" />
          </div>
          <div id="f-phone">
            <FormField label="رقم الهاتف" required placeholder="05XXXXXXXX" value={data.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setField("phone", digits);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              error={errors.phone} type="tel" inputMode="numeric" maxLength={10} dir="ltr" autoComplete="tel"
            />
          </div>
          <div id="f-id_number">
            <FormField label="رقم الهوية" required placeholder="784-XXXX-XXXXXXX-X" value={data.id_number} onChange={set("id_number")} error={errors.id_number} dir="ltr" />
          </div>
          <div id="f-membership">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">نوع العضوية <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={data.membership} onChange={set("membership")} className={selectCls(errors.membership)}>
                <option value="" disabled>اختر نوع العضوية</option>
                <option value="silver">عضوية فضية — للأسرة بدون أبناء</option>
                <option value="gold">عضوية ذهبية — للأسرة من 1-3 أبناء</option>
                <option value="platinum">عضوية بلاتينية — للأسرة من 4 أبناء فأكثر</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.membership && <p className="text-red-500 text-xs mt-1">{errors.membership}</p>}
          </div>
          <div id="f-emirate">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الإمارة / المدينة <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={data.emirate} onChange={set("emirate")} className={selectCls(errors.emirate)}>
                <option value="" disabled>اختر الإمارة</option>
                {EMIRATES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.emirate && <p className="text-red-500 text-xs mt-1">{errors.emirate}</p>}
          </div>
          <div id="f-delivery_date">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ التوصيل <span className="text-red-400">*</span></label>
            <input type="date" value={data.delivery_date} onChange={set("delivery_date")} min={new Date().toISOString().split("T")[0]}
              className={`w-full border rounded-xl px-4 py-3.5 text-base md:text-sm bg-white focus:outline-none transition-colors text-gray-700 ${errors.delivery_date ? "border-red-400" : "border-gray-300 focus:border-[#0c6e3e]"}`}
            />
            {errors.delivery_date && <p className="text-red-500 text-xs mt-1">{errors.delivery_date}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 mt-2 text-base font-bold rounded-2xl text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #0c6e3e 0%, #7cb342 100%)" }}>
            {loading ? <><Loader2 size={18} className="animate-spin" />جاري المعالجة...</> : "متابعة"}
          </button>
        </form>
      </div>
    </div>
  );
}
