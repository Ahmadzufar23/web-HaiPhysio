"use client";

import { inputClass } from "@/components/admin/shared/AdminUI";
import { ACCENT_PRESETS, buildAccentTokens, isValidAccent } from "@/lib/accentTheme";

const NEUTRAL_PREVIEW = "#18181b";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// Kosong berarti netral. Warna di luar pilihan diisi lewat kode warna, jadi tidak perlu ubah kode.
export default function AccentColorField({ value, onChange }: Props) {
  const hex = value.trim().toLowerCase();
  const isValid = hex === "" || isValidAccent(hex);
  const previewColor = hex && isValid ? hex : NEUTRAL_PREVIEW;
  const tokens = buildAccentTokens(previewColor);

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <span className="text-[12px] font-medium text-zinc-700">Warna klinik di situs pasien</span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={hex === ""}
          onClick={() => onChange("")}
          className={`flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[12px] text-zinc-700 ${hex === "" ? "border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
        >
          <span aria-hidden className="h-4 w-4 rounded-sm" style={{ background: NEUTRAL_PREVIEW }} />
          Netral
        </button>
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-pressed={hex === preset.value}
            onClick={() => onChange(preset.value)}
            className={`flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[12px] text-zinc-700 ${hex === preset.value ? "border-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
          >
            <span aria-hidden className="h-4 w-4 rounded-sm" style={{ background: preset.value }} />
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[12px] text-zinc-600">
          Warna lain
          <input type="color" value={previewColor} onChange={(event) => onChange(event.target.value)} aria-label="Pilih warna lain" className="h-9 w-11 cursor-pointer rounded-md border border-zinc-200 bg-white p-1" />
        </label>
        <label className="flex items-center gap-2 text-[12px] text-zinc-600">
          Kode warna
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#1d4ed8" maxLength={7} aria-invalid={!isValid} className={`${inputClass} w-[110px] font-mono`} />
        </label>
        <span className="flex items-center gap-2 text-[12px] text-zinc-600">
          Contoh
          <span className="flex h-9 items-center rounded-md px-3 text-[13px] font-semibold" style={{ background: previewColor, color: tokens["--color-on-action"] }}>
            Buat janji
          </span>
          <span className="font-medium underline" style={{ color: tokens["--color-action-ink"] }}>
            Tautan
          </span>
        </span>
      </div>
      {isValid ? (
        <span className="text-[11px] text-zinc-400">Berlaku untuk semua cabang. Warna status dan panel staf tidak berubah.</span>
      ) : (
        <span role="alert" className="text-[12px] text-red-700">
          Warna tidak bisa dipakai. Isi kode seperti #1d4ed8, dan hindari warna yang terlalu pucat.
        </span>
      )}
    </div>
  );
}
