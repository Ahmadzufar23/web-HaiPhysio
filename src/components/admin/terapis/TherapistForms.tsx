"use client";

import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import type { FocusArea } from "@/types/api.types";
import FocusAreaCheckboxes from "./FocusAreaCheckboxes";
import { inputClass } from "@/components/admin/shared/AdminUI";

export type ProfileDraft = { fullName: string; sip: string; phone: string; email: string; education: string; focusIds: string[] };
export type AccountDraft = { email: string; phone: string; password: string };

export const emptyProfile: ProfileDraft = { fullName: "", sip: "", phone: "", email: "", education: "", focusIds: [] };

/** Validasi sisi klien; pesan error backend tetap ditampilkan bila lolos sini. */
export function validateProfile(p: ProfileDraft): string | null {
  if (p.fullName.trim().length < 3) return "Nama lengkap minimal 3 karakter.";
  if (p.focusIds.length === 0) return "Pilih minimal satu spesialisasi.";
  return null;
}

export function validateAccount(a: AccountDraft): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) return "Email login tidak valid.";
  if (!/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(a.phone.trim())) return "Nomor telepon tidak valid (contoh 081234567890).";
  if (a.password.length < 8 || !/[A-Za-z]/.test(a.password) || !/\d/.test(a.password)) return "Password minimal 8 karakter, kombinasi huruf dan angka.";
  return null;
}

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}

/** Field profil terapis: nama, SIP, spesialisasi, kontak, pendidikan. */
export function ProfileFields({ value, onChange }: { value: ProfileDraft; onChange: (v: ProfileDraft) => void }) {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getFocusAreas()
      .then((res) => setFocusAreas(res.data?.focusAreas ?? []))
      .catch((err) => console.error("Gagal memuat layanan:", err))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Omit<ProfileDraft, "focusIds">) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Nama lengkap" required>
          <input value={value.fullName} onChange={set("fullName")} placeholder="Ftr. Budi Santoso, S.Ft" className={inputClass} />
        </Field>
      </div>
      <Field label="Nomor SIP">
        <input value={value.sip} onChange={set("sip")} placeholder="SIP/2026/0402/PHY/99" className={inputClass} />
      </Field>
      <Field label="Pendidikan">
        <input value={value.education} onChange={set("education")} placeholder="S1 Fisioterapi" className={inputClass} />
      </Field>
      <Field label="Telepon / WhatsApp">
        <input value={value.phone} onChange={set("phone")} inputMode="tel" placeholder="081234567890" className={inputClass} />
      </Field>
      <Field label="Email kontak">
        <input value={value.email} onChange={set("email")} type="email" placeholder="nama@haiphysio.com" className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <span className="mb-1 block text-[12px] font-medium text-zinc-700">
          Spesialisasi<span className="text-red-600"> *</span>
        </span>
        <FocusAreaCheckboxes focusAreas={focusAreas} value={value.focusIds} onChange={(ids) => onChange({ ...value, focusIds: ids })} isLoading={loading} />
      </div>
    </div>
  );
}

/** Field akun login terapis; password dibuat oleh owner. */
export function AccountFields({ value, onChange }: { value: AccountDraft; onChange: (v: AccountDraft) => void }) {
  const set = (key: keyof AccountDraft) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Email login" required>
        <input value={value.email} onChange={set("email")} type="email" autoComplete="off" placeholder="nama@haiphysio.dev" className={inputClass} />
      </Field>
      <Field label="Telepon akun" required hint="Harus unik antar akun">
        <input value={value.phone} onChange={set("phone")} inputMode="tel" autoComplete="off" placeholder="081234567890" className={inputClass} />
      </Field>
      <Field label="Password awal" required hint="Min. 8 karakter, huruf + angka">
        <input value={value.password} onChange={set("password")} type="text" autoComplete="new-password" className={inputClass} />
      </Field>
    </div>
  );
}
