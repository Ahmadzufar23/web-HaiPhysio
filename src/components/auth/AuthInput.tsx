import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function AuthInput({
  label,
  className = "",
  error,
  id,
  ...props
}: AuthInputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-brand-900">{label}</span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-12 rounded-[8px] border bg-white px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
            : "border-slate-200 focus:border-gold-600 focus:ring-4 focus:ring-brand-500/20"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-[13px] leading-5 text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
