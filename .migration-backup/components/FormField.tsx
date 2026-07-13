"use client";
import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; error?: string; required?: boolean;
}

export default function FormField({ label, error, required, className, ...props }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...props}
        className={`w-full border rounded-xl px-4 py-3.5 text-base md:text-sm bg-white focus:outline-none transition-colors text-gray-700 ${error ? "border-red-400" : "border-gray-300 focus:border-[#0c6e3e]"} ${className ?? ""}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
