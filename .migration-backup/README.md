# ALSAADA-M — بطاقة إسعاد

تطبيق تسجيل بطاقة الأسرة الإماراتية (إسعاد) — Next.js + Tailwind CSS + Firebase

## البنية

```
app/                  # App Router pages
  layout.tsx
  page.tsx            # الرئيسية
  register/page.tsx
  payment/page.tsx
  card/page.tsx
  otp/page.tsx
  success/page.tsx
  benefits/page.tsx
  globals.css
components/           # مكونات مشتركة
  StepBar.tsx
  FormField.tsx
  Navbar.tsx
  Footer.tsx
context/
  FormContext.tsx
lib/
  firebase.ts
  utils.ts
hooks/
  use-mobile.tsx
  use-toast.ts
public/               # أضف ملفات الوسائط هنا
  esaad-logo.png
  esaad-about.png
  bg-home.mp4
```

## التشغيل

```bash
npm install
# أنشئ ملف .env.local وأضف متغيرات Firebase
npm run dev
```

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وأضف قيم Firebase.
