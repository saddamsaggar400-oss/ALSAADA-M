"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" dir="rtl">
      <div className="text-center px-6">
        <h1 className="text-6xl font-extrabold text-[#0c6e3e] mb-4">404</h1>
        <p className="text-gray-600 text-lg mb-8">الصفحة غير موجودة</p>
        <Link href="/" className="inline-block bg-[#0c6e3e] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#0a5c33] transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
