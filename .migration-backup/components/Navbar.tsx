"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "المزايا", href: "/benefits" },
  { label: "تواصل معنا", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0d1117]/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <img src="/esaad-logo.png" alt="إسعاد" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden xs:block">اسعاد</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${pathname === link.href ? "text-[#FDC700] bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/register" className="bg-[#FDC700] hover:bg-[#e6b400] text-[#101828] font-bold px-5 py-2.5 rounded-2xl text-sm transition-all duration-200">
              سجّل الآن
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="القائمة">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="md:hidden mobile-menu-open bg-[#0d1117]/98 backdrop-blur-md border-t border-white/10 pb-4 rounded-b-2xl">
            <nav className="flex flex-col gap-1 px-2 pt-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === link.href ? "text-[#FDC700] bg-white/10" : "text-white/80"}`}>
                  {link.label}
                </Link>
              ))}
              <Link href="/register" className="mt-2 bg-[#FDC700] text-[#101828] font-bold px-4 py-3 rounded-2xl text-sm text-center">سجّل الآن</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
