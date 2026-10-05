"use client";

import type { InputHTMLAttributes } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";

type AuthPasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
};

export default function AuthPasswordInput({
  label,
  className = "",
  error,
  id,
  ...props
}: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const Icon = showPassword ? EyeSlash : Eye;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-brand-900">{label}</span>
      <span className="relative block">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-12 w-full rounded-[8px] border bg-white px-4 pr-12 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-slate-200 focus:border-gold-600 focus:ring-4 focus:ring-brand-500/20"
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-slate-500 transition hover:bg-slate-100 hover:text-brand-900"
        >
          <Icon size={20} strokeWidth={2} />
        </button>
      </span>
      {error ? (
        <span id={`${inputId}-error`} className="text-[13px] leading-5 text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
