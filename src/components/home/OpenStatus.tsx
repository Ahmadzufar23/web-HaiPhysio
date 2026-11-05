"use client";

import { useClinic } from "@/components/shared/ClinicProvider";
import { clinicHoursText } from "@/constants/clinic";

/** Jam buka yang diisi klinik sendiri. Tiap klinik punya jam berbeda, jadi tidak ditebak buka atau tutupnya. */
export default function OpenStatus({ className = "" }: { className?: string }) {
  const clinic = useClinic();
  const hours = clinicHoursText(clinic);
  if (!hours) return null;
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex w-[18px] shrink-0 justify-center">
        <span className="h-2 w-2 rounded-full bg-brand-900/30" />
      </span>
      <span>{hours}</span>
    </span>
  );
}
