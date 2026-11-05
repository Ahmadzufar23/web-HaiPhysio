"use client";

import type { CSSProperties } from "react";
import { useClinic } from "@/components/shared/ClinicProvider";

interface LogoWatermarkProps {
  /** Posisi & ukuran (kelas Tailwind), mis. "-right-20 -bottom-24 w-[520px]". */
  className?: string;
  /** Opasitas watermark (0–1). */
  opacity?: number;
  /** Kemiringan dasar dalam derajat. */
  rotate?: number;
  /** Bergerak pelan naik-turun & sedikit berputar. */
  drift?: boolean;
  /** Ubah figur jadi siluet putih (untuk foto / panel gelap). */
  tone?: "brand" | "white" | "ink";
}

const TONE_FILTER: Record<NonNullable<LogoWatermarkProps["tone"]>, string> = {
  brand: "none",
  white: "brightness(0) invert(1)",
  ink: "brightness(0)",
};

/**
 * Figur logo klinik sebagai watermark latar. Klinik tanpa gambar figur tidak menampilkannya.
 * Murni dekoratif: disembunyikan dari pembaca layar.
 */
export default function LogoWatermark({
  className = "",
  opacity = 0.1,
  rotate = -8,
  drift = true,
  tone = "brand",
}: LogoWatermarkProps) {
  const { markUrl } = useClinic();
  if (!markUrl) return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${drift ? "animate-drift" : ""} ${className}`}
      style={{ opacity, "--wm-rotate": `${rotate}deg`, transform: drift ? undefined : `rotate(${rotate}deg)` } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- gambar milik klinik */}
      <img src={markUrl} alt="" className="h-auto w-full" style={{ filter: TONE_FILTER[tone] }} />
    </div>
  );
}
