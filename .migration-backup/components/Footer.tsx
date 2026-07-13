"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#060a0f] border-t border-white/10 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <img src="/esaad-logo.png" alt="إسعاد" className="w-8 h-8 object-contain" />
              </div>
              <div><p className="text-white font-bold text-lg">اسعاد</p><p className="text-white/50 text-xs">esaad</p></div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">بطاقة اسعاد هي بطاقة ممتازة للمواطنين والمقيمين في الإمارات العربية المتحدة، مربوطة بعدد الأبناء.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">الصفحات</h4>
            <ul className="space-y-2">
              {[{label:"الرئيسية",href:"/"},{label:"المزايا",href:"/benefits"},{label:"طلب البطاقة",href:"/register"}].map((l) => (
                <li key={l.href}><Link href={l.href} className="text-white/60 hover:text-[#FDC700] text-sm transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">الدعم</h4>
            <ul className="space-y-2">
              {["سياسة الخصوصية","الشروط والأحكام","الأسئلة الشائعة"].map((l) => (
                <li key={l}><span className="text-white/60 text-sm cursor-pointer hover:text-[#FDC700] transition-colors">{l}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/60 text-sm"><span className="text-[#2d7a3a]">📧</span>info@esaad.ae</li>
              <li className="flex items-center gap-2 text-white/60 text-sm"><span className="text-[#2d7a3a]">📞</span>800-ESAAD</li>
              <li className="flex items-center gap-2 text-white/60 text-sm"><span className="text-[#2d7a3a]">📍</span>دبي، الإمارات العربية المتحدة</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} بطاقة اسعاد. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2"><span className="text-white/40 text-xs">الإمارات العربية المتحدة</span><span>🇦🇪</span></div>
        </div>
      </div>
    </footer>
  );
}
