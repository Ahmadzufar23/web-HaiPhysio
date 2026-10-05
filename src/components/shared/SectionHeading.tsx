import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";

interface SectionHeadingProps {
  eyebrow: string;
  /** Bagian judul biasa. */
  title: string;
  /** Kata aksen (serif miring + stabilo kuning) setelah judul. */
  accent?: string;
  /** Taruh aksen di depan judul, bukan di belakang. */
  accentFirst?: boolean;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  className?: string;
}

/**
 * Pola judul section standar HaiPhysio: eyebrow → judul per-kata
 * (sans tebal + aksen serif miring) → subjudul. Dipakai di semua halaman publik.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  accentFirst = false,
  subtitle,
  align = "left",
  tone = "dark",
  as = "h2",
  className = "",
}: SectionHeadingProps) {
  const center = align === "center";
  const light = tone === "light";
  const accentPart = accent ? { text: accent, className: `font-display italic font-normal ${light ? "text-brand-300" : "text-brand-900 mark-swoosh"}` } : null;
  const parts = accentPart ? (accentFirst ? [accentPart, title] : [title, accentPart]) : [title];

  return (
    <div className={`flex flex-col gap-5 ${center ? "items-center text-center" : "items-start"} ${className}`}>
      <Reveal variant="fade">
        <span className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{eyebrow}</span>
      </Reveal>
      <SplitText
        as={as}
        parts={parts}
        className={`max-w-[18ch] text-balance text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[52px] lg:text-[60px] ${
          light ? "text-white" : "text-brand-900"
        } ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <Reveal delay={200} className={`max-w-[560px] text-[16px] leading-relaxed md:text-[18px] ${light ? "text-white/70" : "text-brand-900/70"}`}>
          {subtitle}
        </Reveal>
      )}
    </div>
  );
}
