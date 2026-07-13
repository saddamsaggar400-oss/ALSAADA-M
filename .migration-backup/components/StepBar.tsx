"use client";
import { Check } from "lucide-react";

const STEPS = ["البيانات", "الرسوم", "الدفع", "تأكيد"];

interface Props { current: 1 | 2 | 3 | 4; }

export default function StepBar({ current }: Props) {
  return (
    <div className="w-full px-5 pt-4 pb-3 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const done = num < current;
          const active = num === current;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${done || active ? "bg-[#0c6e3e] border-[#0c6e3e] text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                  {done ? <Check size={13} strokeWidth={3} /> : num}
                </div>
                <span className={`text-[9px] whitespace-nowrap font-medium ${active || done ? "text-[#0c6e3e]" : "text-gray-400"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-3 transition-colors ${done ? "bg-[#0c6e3e]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
