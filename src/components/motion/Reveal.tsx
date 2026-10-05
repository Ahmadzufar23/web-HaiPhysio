"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export type RevealVariant = "up" | "fade" | "left" | "right" | "scale" | "blur";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  /** Jeda sebelum animasi mulai (ms) — untuk efek berurutan (stagger). */
  delay?: number;
  /** Mode gambar: konten "dibuka" dari bawah + zoom-out halus. */
  mask?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Pembungkus animasi masuk-viewport. Semua gaya ada di src/styles/motion.css,
 * komponen ini hanya menambahkan kelas `is-visible` saat elemen terlihat.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  mask = false,
  className = "",
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const delayStyle = { "--reveal-delay": `${delay}ms`, ...style } as CSSProperties;

  // Mode mask: elemen yang diamati harus TIDAK ter-clip (IntersectionObserver
  // tidak menganggap elemen ber-clip-path penuh sebagai terlihat), jadi clip
  // diterapkan di lapisan dalam, sementara pembungkus luar yang diamati.
  if (mask) {
    return (
      <Tag ref={ref} className={className} style={delayStyle}>
        <div className={`reveal-mask absolute inset-0 ${inView ? "is-visible" : ""}`}>{children}</div>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      data-variant={variant}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={delayStyle}
    >
      {children}
    </Tag>
  );
}
