"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import BodyMap from "@/components/bodymap/BodyMap";
import { regionLabel } from "@/constants/bodyRegions";
import { PAIN_LEVELS, PAIN_SCALE_MAX } from "@/constants/painScale";

interface BodyMapPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  /** Tingkat nyeri 1–PAIN_SCALE_MAX; tidak ditampilkan bila onScaleChange kosong. */
  scale?: number | null;
  onScaleChange?: (value: number | null) => void;
  scaleError?: string;
  tone?: "light" | "dark";
}

const VIEWS = [
  { view: "front", caption: "Depan" },
  { view: "back", caption: "Belakang" },
] as const;

/**
 * Body map lengkap: tampak depan (kiri) & belakang (kanan) berdampingan,
 * nama otot yang sedang ditunjuk, daftar area terpilih, skala nyeri.
 * tone "light" dipakai form booking (netral, teks kecil); "dark" untuk demo di Beranda.
 */
export default function BodyMapPicker({ selected, onChange, scale = null, onScaleChange, scaleError, tone = "light" }: BodyMapPickerProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const dark = tone === "dark";
  const muted = dark ? "text-white/55" : "text-zinc-500";
  const label = dark ? "text-[13px] font-semibold text-white/55" : "text-[12px] font-medium text-zinc-700";

  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div className={`flex flex-col ${dark ? "gap-6" : "gap-5"}`}>
      {/* Peta tubuh; light dibingkai supaya terbaca sebagai satu area input */}
      <div className={dark ? "flex flex-col gap-6" : "flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4"}>
        {/* Nama otot yang sedang ditunjuk (tinggi tetap supaya tata letak tidak bergeser) */}
        <p aria-live="polite" className={dark ? "h-5 text-center text-[14px] font-semibold text-brand-300" : "h-4 text-center text-[12px] font-medium text-zinc-900"}>
          {hovered ? regionLabel(hovered) : <span className={dark ? muted : "font-normal text-zinc-400"}>Ketuk otot yang terasa nyeri</span>}
        </p>

        <div className={`grid grid-cols-2 ${dark ? "gap-3 sm:gap-6" : "gap-3 sm:gap-8"}`}>
          {VIEWS.map(({ view, caption }) => (
            <figure key={view} className="flex flex-col items-center gap-2">
              <BodyMap view={view} selected={selected} onToggle={toggle} onHover={setHovered} tone={tone} className={`w-full ${dark ? "max-w-[230px]" : "max-w-[190px]"}`} />
              <figcaption className={dark ? `text-[12px] font-semibold uppercase tracking-[0.12em] ${muted}` : "text-[11px] text-zinc-400"}>{caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Area terpilih */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className={label}>
            Area nyeri {selected.length > 0 && <span className={dark ? "" : "font-normal text-zinc-400"}>({selected.length})</span>}
            {!dark && <span className="font-normal text-zinc-400"> · opsional</span>}
          </span>
          {selected.length > 0 && (
            <button type="button" onClick={() => onChange([])} className={dark ? "text-[13px] font-semibold text-white/70 underline-offset-4 hover:underline" : "text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"}>
              Hapus semua
            </button>
          )}
        </div>
        {selected.length === 0 ? (
          <p className={dark ? "text-[14px] leading-relaxed text-white/50" : "text-[12px] text-zinc-400"}>
            Belum ada. Ketuk otot di gambar depan atau belakang, ketuk lagi untuk membatalkan.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {selected.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`Hapus ${regionLabel(id)}`}
                  className={
                    dark
                      ? "flex items-center gap-1.5 rounded-full bg-brand-500 py-1.5 pl-3 pr-2 text-[13px] font-semibold text-brand-950 transition-colors hover:bg-brand-600"
                      : "flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white py-1 pl-2 pr-1.5 text-[12px] text-zinc-800 transition-colors hover:border-zinc-300"
                  }
                >
                  {!dark && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />}
                  {regionLabel(id)}
                  <X size={dark ? 12 : 10} weight="bold" className={dark ? "" : "text-zinc-400"} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {onScaleChange && (
        <div className="flex flex-col gap-2">
          <span className={label}>
            Tingkat nyeri {!dark && <span className="text-zinc-400"> *</span>}
            <span className={dark ? "font-normal" : "font-normal text-zinc-400"}> · 1 sangat ringan, {PAIN_SCALE_MAX} sangat berat</span>
          </span>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${PAIN_SCALE_MAX}, minmax(0, 1fr))` }} role="radiogroup" aria-label="Tingkat nyeri">
            {PAIN_LEVELS.map(({ value: n, label: levelLabel }) => {
              const active = scale === n;
              const filled = Boolean(scale && n <= scale);
              const cls = dark
                ? `h-9 rounded-lg text-[13px] font-bold ${active ? "bg-brand-900 text-white" : filled ? "bg-brand-500 text-brand-950" : "bg-white/10 text-white/70 hover:bg-white/20"}`
                : `flex h-12 flex-col items-center justify-center rounded-lg border ${
                    active ? "border-zinc-900 bg-zinc-900 text-white" : filled ? "border-zinc-300 bg-zinc-100 text-zinc-700" : scaleError ? "border-red-200 bg-white text-zinc-600 hover:bg-zinc-50" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`;
              return (
                <button key={n} type="button" role="radio" aria-checked={active} aria-label={`Tingkat nyeri ${n}, ${levelLabel}`} onClick={() => onScaleChange(active ? null : n)} className={`transition-colors ${cls}`}>
                  {dark ? (
                    n
                  ) : (
                    <>
                      <span className="text-[13px] font-semibold">{n}</span>
                      <span className={`hidden text-[10px] sm:block ${active ? "text-white/70" : "text-zinc-400"}`}>{levelLabel}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          {scaleError ? (
            <p className="text-[11px] text-red-600">{scaleError}</p>
          ) : (
            <p className={dark ? `h-4 text-[12px] ${muted}` : "h-4 text-[11px] text-zinc-500 sm:hidden"} aria-live="polite">
              {scale ? PAIN_LEVELS.find((l) => l.value === scale)?.label : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
