"use client";

import { ArrowLeft, ArrowRight, Check, WarningCircle } from "@phosphor-icons/react";

// Gaya dasar form booking pasien: putih, abu netral, teks kecil. Warna brand hanya di body map.
export const ui = {
  card: "rounded-xl border border-zinc-200 bg-white",
  label: "text-[12px] font-medium text-zinc-700",
  hint: "text-[11px] text-zinc-400",
  input:
    "h-9 w-full rounded-lg border bg-white px-3 text-[13px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5",
  btnPrimary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400",
  btnSecondary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50",
  /** Kartu pilihan (layanan, paket, slot) */
  option: (selected: boolean) =>
    `rounded-lg border text-left transition-colors ${selected ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"}`,
};

export const STEPS = ["Layanan & paket", "Jadwal", "Data & keluhan", "Konfirmasi"] as const;

/** Progres 4 segmen; label tiap langkah di bawah segmennya */
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Langkah booking">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <li key={label} className="flex flex-col gap-2" aria-current={active ? "step" : undefined}>
            <span className={`h-[3px] rounded-full ${done || active ? "bg-zinc-900" : "bg-zinc-200"}`} aria-hidden />
            <span className={`flex items-center gap-1 text-[12px] ${active ? "font-medium text-zinc-900" : done ? "text-zinc-600" : "text-zinc-400"}`}>
              {done && <Check size={11} weight="bold" className="shrink-0" />}
              <span className={active ? "" : "hidden sm:inline"}>{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Section({ title, description, actions, children }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={ui.card}>
      <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-zinc-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={ui.label}>
        {label}
        {required && <span className="text-zinc-400"> *</span>}
      </span>
      {children}
      {error ? <span className="text-[11px] text-red-600">{error}</span> : hint ? <span className={ui.hint}>{hint}</span> : null}
    </label>
  );
}

export const inputClass = (error?: string) => `${ui.input} ${error ? "border-red-300" : "border-zinc-200"}`;

/** Indikator radio bulat untuk kartu pilihan */
export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${checked ? "border-zinc-900" : "border-zinc-300"}`} aria-hidden>
      {checked && <span className="h-2 w-2 rounded-full bg-zinc-900" />}
    </span>
  );
}

export function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
      <WarningCircle size={14} className="mt-px shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function StepNav({
  onBack,
  onNext,
  nextLabel = "Lanjut",
  disabled,
  hint,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
      {onBack ? (
        <button type="button" onClick={onBack} className={ui.btnSecondary}>
          <ArrowLeft size={13} />
          Kembali
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {hint && <span className="hidden text-[12px] text-zinc-400 sm:inline">{hint}</span>}
        <button type="button" onClick={onNext} disabled={disabled} className={ui.btnPrimary}>
          {nextLabel}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/** Baris label–nilai untuk ringkasan & konfirmasi */
export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="w-[140px] shrink-0 text-[12px] text-zinc-500">{label}</dt>
      <dd className="text-[13px] text-zinc-900">{children}</dd>
    </div>
  );
}
