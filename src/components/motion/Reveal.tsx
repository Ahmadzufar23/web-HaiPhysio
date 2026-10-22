"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Jeda sebelum animasi mulai (ms). */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Pembungkus fade-in pendek saat elemen masuk viewport. Gaya ada di
 * src/styles/motion.css, komponen ini hanya menambahkan kelas `is-visible`.
 */
export default function Reveal({ children, as: Tag = "div", delay = 0, className = "", style }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
