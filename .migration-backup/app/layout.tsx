import type { Metadata } from "next";
import "./globals.css";
import { FormProvider } from "@/context/FormContext";
import ApplicationBridge from "@/components/ApplicationBridge";

export const metadata: Metadata = {
  title: "بطاقة إسعاد | Esaad Card",
  description: "سجّل الآن للحصول على بطاقة إسعاد للأسرة الإماراتية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <FormProvider>
          <ApplicationBridge />
          {children}
        </FormProvider>
      </body>
    </html>
  );
}
