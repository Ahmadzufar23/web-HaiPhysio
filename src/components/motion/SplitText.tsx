"use client";

import type { CSSProperties, ElementType } from "react";
import { Fragment } from "react";
import { useInView } from "@/hooks/useInView";

export type SplitPart = string | { text: string; className?: string };

interface SplitTextProps {
  /** Teks biasa, atau array bagian agar sebagian kata bisa diberi gaya beda (mis. serif miring). */
  parts: SplitPart | SplitPart[];
  as?: ElementType;
  className?: string;
  delay?: number;
}

/**
 * Judul yang muncul kata-per-kata dari bawah garis. Teks lengkap tetap
 * dibaca screen reader lewat aria-label; span animasi disembunyikan.
 */
export default function SplitText({ parts, as: Tag = "h2", className = "", delay = 0 }: SplitTextProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const list = (Array.isArray(parts) ? parts : [parts]).map((p) => (typeof p === "string" ? { text: p } : p));
  const label = list.map((p) => p.text).join(" ").replace(/\s+/g, " ").trim();

  let index = 0;
  return (
    <Tag
      ref={ref}
      aria-label={label}
      className={`${inView ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {list.map((part, partIdx) => (
        <Fragment key={partIdx}>
        {/* Spasi antar bagian di LUAR span, supaya gaya bagian (mis. stabilo) tidak ikut menyorot spasi */}
        {partIdx > 0 && " "}
        <span aria-hidden="true" className={part.className}>
          {part.text.split(/(\s+|\n)/).map((token, tokenIdx) => {
            if (token === "\n") return <br key={tokenIdx} />;
            if (token === "") return null;
            if (/^\s+$/.test(token)) return <Fragment key={tokenIdx}> </Fragment>;
            const i = index++;
            return (
              <span key={tokenIdx} className="split-word">
                <span style={{ "--i": i } as CSSProperties}>{token}</span>
              </span>
            );
          })}
        </span>
        </Fragment>
      ))}
    </Tag>
  );
}
