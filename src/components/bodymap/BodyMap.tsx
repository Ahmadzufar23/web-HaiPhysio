"use client";

import type { KeyboardEvent } from "react";
import { ANATOMY } from "@/constants/bodyAnatomy";
import type { BodyView } from "@/constants/bodyRegions";

interface BodyMapProps {
  view: BodyView;
  selected: string[];
  /** Area tambahan dari terapis: digambar dengan warna kedua supaya beda dari pilihan pasien. */
  marked?: string[];
  /** Tanpa onToggle = hanya tampilan (mis. mockup, ringkasan). */
  onToggle?: (id: string) => void;
  /** Dipanggil saat otot di-hover/fokus (null saat keluar). */
  onHover?: (id: string | null) => void;
  tone?: "light" | "dark";
  /** Titik di tengah otot: semua, hanya yang ditandai, atau tanpa titik. */
  dots?: "all" | "selected" | "none";
  className?: string;
  /** Lebar eksplisit (px). Dipakai di mockup supaya tidak bergantung pada kelas arbitrer. */
  width?: number;
}

const TONES = {
  light: {
    skin: "#e9ecf0",
    muscle: "#d4d9e0",
    hover: "#bfc6d0",
    seam: "#ffffff",
    outline: "rgb(20 21 24 / 0.25)",
    hair: "#b3bac5",
    dot: "#ffffff",
    dotStroke: "rgb(20 21 24 / 0.35)",
  },
  dark: {
    skin: "rgb(255 255 255 / 0.07)",
    muscle: "rgb(255 255 255 / 0.16)",
    hover: "rgb(255 255 255 / 0.28)",
    seam: "#141518",
    outline: "rgb(255 255 255 / 0.22)",
    hair: "rgb(255 255 255 / 0.3)",
    dot: "rgb(255 255 255 / 0.55)",
    dotStroke: "rgb(0 0 0 / 0.35)",
  },
};

const ON_FILL = "#fcdf09";
const ON_SEAM = "#c99d00";
// Titik dari terapis (dibedakan dari pilihan pasien)
const MARK_FILL = "#52525b";
const MARK_SEAM = "#27272a";

/** Body map anatomi: otot-otot yang bisa ditandai pasien + titik di tiap otot. */
export default function BodyMap({ view, selected, marked = [], onToggle, onHover, tone = "light", dots = "all", className = "w-full", width }: BodyMapProps) {
  const t = TONES[tone];
  const a = ANATOMY[view];
  // Ukuran titik & garis relatif terhadap lebar viewBox (≈ 660 unit)
  const unit = a.viewBox[2] / 200;

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle?.(id);
    }
  };

  return (
    <svg
      viewBox={a.viewBox.join(" ")}
      className={`h-auto select-none ${className}`}
      style={width ? { width } : undefined}
      aria-label={`Peta otot tubuh tampak ${view === "front" ? "depan" : "belakang"}`}
    >
      {/* Siluet dasar */}
      <path d={a.outline} fill={t.skin} stroke={t.outline} strokeWidth={unit * 0.9} strokeLinejoin="round" />
      {a.decor.map((dec) => dec.d.map((d, i) => <path key={`${dec.kind}-${i}`} d={d} fill={dec.kind === "hair" ? t.hair : t.muscle} />))}

      {/* Otot */}
      {a.muscles.map((m) => {
        const isMarked = !selected.includes(m.id) && marked.includes(m.id);
        const on = selected.includes(m.id) || isMarked;
        const fill = isMarked ? MARK_FILL : ON_FILL;
        const shapes = m.d.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={on ? fill : t.muscle}
            stroke={on ? (isMarked ? MARK_SEAM : ON_SEAM) : t.seam}
            strokeWidth={unit * 0.8}
            strokeLinejoin="round"
            className={onToggle && !on ? "transition-[fill] duration-150 group-hover:fill-[var(--hover)]" : undefined}
          />
        ));
        const dot = (dots === "all" || (dots === "selected" && on)) && (
          <>
            {on && <circle cx={m.x} cy={m.y} r={unit * 5} fill={fill} className="pain-pulse" />}
            <circle
              cx={m.x}
              cy={m.y}
              r={on ? unit * 3.6 : unit * 2.3}
              fill={on ? "#141518" : t.dot}
              stroke={on ? "#ffffff" : t.dotStroke}
              strokeWidth={unit * (on ? 1.4 : 0.7)}
            />
          </>
        );

        if (!onToggle) {
          return (
            <g key={m.id}>
              {shapes}
              {dot}
            </g>
          );
        }
        return (
          <g
            key={m.id}
            role="checkbox"
            aria-checked={on}
            aria-label={m.label}
            tabIndex={0}
            onClick={() => onToggle(m.id)}
            onKeyDown={(e) => onKey(e, m.id)}
            onMouseEnter={() => onHover?.(m.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(m.id)}
            onBlur={() => onHover?.(null)}
            className="group cursor-pointer outline-none focus-visible:[&>path]:stroke-[#141518]"
            style={{ ["--hover" as string]: t.hover }}
          >
            <title>{m.label}</title>
            {shapes}
            {dot}
          </g>
        );
      })}
    </svg>
  );
}
