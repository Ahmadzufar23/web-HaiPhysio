"use client";

import { useClinic } from "@/components/shared/ClinicProvider";

// Logo klinik aktif. Klinik yang belum mengunggah logo tampil dengan namanya saja.
export default function ClinicLogo({ className = "h-10 w-auto", nameClassName = "text-[15px] font-semibold tracking-tight text-zinc-900" }: { className?: string; nameClassName?: string }) {
  const clinic = useClinic();
  if (!clinic.brand) return null;
  if (!clinic.logoUrl) return <span className={nameClassName}>{clinic.groupName || clinic.brand}</span>;
  // eslint-disable-next-line @next/next/no-img-element -- logo unggahan disajikan API dengan ukuran apa pun
  return <img src={clinic.logoUrl} alt={`Logo ${clinic.brand}`} className={`object-contain ${className}`} />;
}
