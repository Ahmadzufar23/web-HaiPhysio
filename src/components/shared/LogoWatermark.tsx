import Image from "next/image";
import type { CSSProperties } from "react";

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
 * Figur logo Hai Physio (orang yang melompat + sapuan) sebagai watermark latar —
 * ciri khas visual klinik. Sumber: public/brand/logo-mark.png (dipotong dari logo asli).
 * Murni dekoratif: disembunyikan dari pembaca layar.
 */
export default function LogoWatermark({
  className = "",
  opacity = 0.1,
  rotate = -8,
  drift = true,
  tone = "brand",
}: LogoWatermarkProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${drift ? "animate-drift" : ""} ${className}`}
      style={{ opacity, "--wm-rotate": `${rotate}deg`, transform: drift ? undefined : `rotate(${rotate}deg)` } as CSSProperties}
    >
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={640}
        height={711}
        className="h-auto w-full"
        style={{ filter: TONE_FILTER[tone] }}
      />
    </div>
  );
}
