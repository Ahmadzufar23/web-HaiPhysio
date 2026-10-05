"use client";

import { CheckSquare, Square } from "@phosphor-icons/react";

type FocusArea = { id: string; name: string };

interface FocusAreaCheckboxesProps {
  focusAreas: FocusArea[];
  value: string[];
  onChange: (focusIds: string[]) => void;
  isLoading?: boolean;
}

// Pilihan spesialisasi terapis berbasis focus_id (UUID) asli dari GET /api/focus-areas.
// Tidak ada pencocokan nama / fallback ke layanan pertama: yang dikirim ke BE persis
// yang dicentang admin (BE mewajibkan minimal 1).
export default function FocusAreaCheckboxes({ focusAreas, value, onChange, isLoading }: FocusAreaCheckboxesProps) {
  if (isLoading) {
    return <p className="text-[13px] text-gray-500 animate-pulse">Memuat daftar layanan...</p>;
  }
  if (focusAreas.length === 0) {
    return <p className="text-[13px] text-red-500">Daftar layanan gagal dimuat. Muat ulang halaman sebelum menyimpan.</p>;
  }

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {focusAreas.map((focus) => {
        const checked = value.includes(focus.id);
        return (
          <button
            key={focus.id}
            type="button"
            onClick={() => toggle(focus.id)}
            className={`flex items-center gap-2 p-3.5 rounded-xl border text-left text-[14px] font-semibold transition-colors ${
              checked ? "border-brand-600 bg-brand-50 text-brand-900" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            {checked ? <CheckSquare size={20} weight="fill" className="text-gold-700 shrink-0" /> : <Square size={20} className="shrink-0" />}
            Fisioterapi {focus.name}
          </button>
        );
      })}
    </div>
  );
}
