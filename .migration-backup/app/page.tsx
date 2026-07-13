"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, ShoppingBag, Hotel, UtensilsCrossed, Heart, Star } from "lucide-react";

const ctaButtons = [
  "التسجيل في اسعاد",
  "طلب بطاقة الأسرة",
  "طلب بطاقة للمقيمين",
  "طلب توصيل بطاقة",
];

const cardTypes = [
  { id: "silver", name_ar: "عضوية فضية", eligibility_ar: "للأسرة الإماراتية الجديدة من دون أبناء", badge: "bg-gray-100 text-gray-600 border-gray-300" },
  { id: "gold", name_ar: "عضوية ذهبية", eligibility_ar: "للأسرة الإماراتية من 1-3 أبناء", badge: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  { id: "platinum", name_ar: "عضوية بلاتينية", eligibility_ar: "للأسرة الإماراتية التي تضم 4 أبناء فأكثر أو التي يكون أحد أفرادها من أصحاب الهمم", badge: "bg-blue-50 text-blue-700 border-blue-300" },
];

const benefits = [
  { icon: Plane, title: "خصومات السفر", desc: "خصومات حصرية على تذاكر الطيران وحجز السفر" },
  { icon: ShoppingBag, title: "تسوق ومتاجر", desc: "عروض حصرية في تشكيلة واسعة من المتاجر" },
  { icon: Hotel, title: "عروض الفنادق", desc: "خصومات حصرية في أفخم الفنادق الإماراتية" },
  { icon: UtensilsCrossed, title: "مطاعم وكافيهات", desc: "خصومات في مطاعم وكافيهات على منصة اسعاد" },
  { icon: Heart, title: "خدمات صحية", desc: "خدمات صحية ورعاية مخفضة التكلفة" },
  { icon: Star, title: "ترفيه وفعاليات", desc: "تذاكر الفعاليات وأماكن الترفيه بأسعار خاصة" },
];

const greenGradient = { background: "linear-gradient(135deg, #0c6e3e 0%, #7cb342 50%, #0c6e3e 100%)" };

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-200" dir="rtl">
      <div className="mx-auto min-h-screen w-full max-w-md bg-white relative overflow-x-hidden sm:shadow-xl">

        {/* VIDEO HERO */}
        <section className="relative overflow-hidden h-[52vh] min-h-[360px] flex flex-col items-center justify-center">
          <video className="absolute inset-0 w-full h-full object-cover" src="/bg-home.mp4" autoPlay muted loop playsInline />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white" />
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="relative z-10 flex flex-col items-center gap-3 px-4"
          >
            <div className="bg-white rounded-full p-4 shadow-xl">
              <img src="/esaad-logo.png" alt="إسعاد" className="h-20 w-20 object-contain" />
            </div>
            <p className="text-white text-lg font-bold drop-shadow-md text-center">بطاقة اسعاد بالتعاون مع إسعاد</p>
          </motion.div>
        </section>

        {/* CARD IMAGE */}
        <section className="pt-8 pb-0 bg-white relative overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex justify-center px-4">
            <img src="/esaad-about.png" alt="بطاقة إسعاد" className="w-full object-contain drop-shadow-xl" />
          </motion.div>
        </section>

        {/* TAGLINE */}
        <section className="bg-white pb-6 pt-4 px-6 text-center">
          <p className="text-base text-[#101828] font-medium mb-1">🇦🇪 بطاقة مميّزة للمواطنين والمقيمين</p>
          <h1 className="text-2xl font-bold text-[#101828] leading-snug mb-1">بطاقة اسعاد لكل الأسر الإماراتية</h1>
          <button onClick={() => router.push("/register")} className="text-xl font-bold text-[#101828] hover:text-[#0c6e3e] transition-colors cursor-pointer underline-offset-2 hover:underline">
            مربوطة بعدد الأبناء
          </button>
        </section>

        {/* CTA BUTTONS */}
        <section className="bg-white px-5 pb-6 pt-2">
          <div className="flex flex-col gap-3">
            {ctaButtons.map((label, i) => (
              <button key={i} onClick={() => router.push("/register")} className="w-full py-4 text-lg font-bold rounded-2xl text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]" style={greenGradient}>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* MEMBERSHIP TIERS */}
        <section className="bg-white px-6 pb-6 pt-2">
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {cardTypes.map((t) => (
              <div key={t.id} className="flex items-start gap-4 px-4 py-4 bg-white">
                <div className="flex-shrink-0 pt-0.5">
                  <span className={`inline-block border px-3 py-1 rounded-full text-sm font-bold ${t.badge}`}>{t.name_ar}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{t.eligibility_ar}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm mt-5 text-[#101828] leading-relaxed">
            عالم من المزايا الحصرية والخصومات الغير محدودة مع بطاقة{" "}
            <span className="text-[#0c6e3e] font-bold">اسعاد</span>
          </p>
        </section>

        {/* BENEFITS (DARK) */}
        <section className="relative overflow-hidden">
          <div className="relative bg-gray-900 py-8 px-5">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-95" />
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="flex-1 bg-green-600" /><div className="flex-1 bg-white" /><div className="flex-1 bg-black" /><div className="w-12 bg-red-600" />
            </div>
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-0.5">مزايا وعروض بطاقة اسعاد</h3>
                <p className="text-sm text-yellow-400 font-semibold tracking-wide">Esaad CARD BENEFITS</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {benefits.map((b, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex flex-col items-start gap-2">
                    <div className="w-10 h-10 bg-[#0c6e3e]/20 rounded-xl flex items-center justify-center">
                      <b.icon className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold leading-tight">{b.title}</h4>
                      <p className="text-white/60 text-xs leading-relaxed mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mb-6">
                <img src="/esaad-about.png" alt="بطاقات اسعاد" className="w-48 h-auto object-contain drop-shadow-2xl" />
              </div>
              <div className="flex justify-center">
                <button onClick={() => router.push("/register")} className="px-10 py-3 text-base font-bold rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:shadow-xl" style={greenGradient}>
                  اشترك الآن واستمتع!
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM BRANDING */}
        <section className="bg-white flex flex-col items-center py-6">
          <p className="text-xs text-gray-500 text-center">Esaad... a lifestyle of happiness &amp; positivity</p>
          <p className="text-xs text-[#0c6e3e] text-center">www.Esaad.ae</p>
        </section>
      </div>
    </div>
  );
}
