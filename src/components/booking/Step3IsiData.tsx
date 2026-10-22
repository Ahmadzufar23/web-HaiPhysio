"use client";

import { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import BodyMapPicker from "@/components/bodymap/BodyMapPicker";
import { readPainDraft } from "@/lib/painNotes";
import { Field, inputClass, Section, StepNav, ui } from "./BookingUI";
import type { PatientDraft } from "./bookingDraft";

interface Step3Props {
  initial: PatientDraft | null;
  onBack: () => void;
  onNext: (data: PatientDraft) => void;
}

type Errors = Partial<Record<"name" | "phone" | "painScale", string>>;

export default function Step3IsiData({ initial, onBack, onNext }: Step3Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    complaint: initial?.complaint ?? "",
  });
  // Titik nyeri: dari isian sebelumnya, atau dari demo body map di Beranda (sessionStorage)
  const [painPoints, setPainPoints] = useState<string[]>(() => (initial?.painPoints.length ? initial.painPoints : typeof window === "undefined" ? [] : readPainDraft()));
  const [painScale, setPainScale] = useState<number | null>(initial?.painScale ?? null);
  const [errors, setErrors] = useState<Errors>({});

  // Kontak diisi otomatis dari profil (sekali, bila belum ada isian sebelumnya)
  useEffect(() => {
    if (initial) return;
    profileService
      .getProfile()
      .then((res) => {
        const user = res.data?.user || res.user;
        if (!user) return;
        setForm((prev) => ({
          ...prev,
          name: prev.name || user.full_name || user.name || "",
          phone: prev.phone || user.phone || "",
          email: user.email || prev.email,
        }));
      })
      .catch(() => {});
  }, [initial]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key as keyof Errors]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi.";
    if (!/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(form.phone.trim().replace(/[\s-]/g, ""))) next.phone = "Nomor tidak valid, contoh 081234567890.";
    if (!painScale) next.painScale = "Pilih tingkat nyeri yang kamu rasakan.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext({ ...form, painPoints, painScale });
  };

  return (
    <div className="flex flex-col gap-4">
      <Section title="Data kontak" description="Diambil dari profilmu. Klinik menghubungi nomor ini bila ada perubahan jadwal.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama lengkap" required error={errors.name}>
              <input value={form.name} onChange={set("name")} autoComplete="name" className={inputClass(errors.name)} />
            </Field>
          </div>
          <Field label="Nomor telepon / WhatsApp" required error={errors.phone}>
            <input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="081234567890" className={inputClass(errors.phone)} />
          </Field>
          {/* Email selalu email akun (notifikasi jadwal), tidak bisa diganti per booking */}
          <Field label="Email" hint="Email akunmu. Ubah lewat dukungan klinik bila perlu.">
            <input value={form.email} readOnly type="email" className={`${inputClass()} bg-zinc-50 text-zinc-500`} />
          </Field>
        </div>
      </Section>

      <Section title="Keluhan" description="Bantu terapis memahami kondisimu sebelum sesi dimulai.">
        <div className="flex flex-col gap-5">
          {/* Body map: area nyeri opsional, tingkat nyeri wajib */}
          <BodyMapPicker
            selected={painPoints}
            onChange={setPainPoints}
            scale={painScale}
            onScaleChange={(value) => {
              setPainScale(value);
              if (value) setErrors((prev) => ({ ...prev, painScale: undefined }));
            }}
            scaleError={errors.painScale}
          />

          <Field label="Ceritakan keluhanmu" hint="Opsional. Misalnya sejak kapan, saat aktivitas apa terasa nyeri.">
            <textarea value={form.complaint} onChange={set("complaint")} rows={4} className={`${ui.input} h-auto border-zinc-200 py-2 leading-relaxed`} />
          </Field>
        </div>
      </Section>

      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
