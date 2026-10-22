"use client";

type FocusArea = { id: string; name: string };

interface FocusAreaCheckboxesProps {
  focusAreas: FocusArea[];
  value: string[];
  onChange: (focusIds: string[]) => void;
  isLoading?: boolean;
}

// Pilihan spesialisasi terapis berbasis focus_id (UUID) asli dari GET /api/focus-areas.
// Yang dikirim ke BE persis yang dicentang (BE mewajibkan minimal 1).
export default function FocusAreaCheckboxes({ focusAreas, value, onChange, isLoading }: FocusAreaCheckboxesProps) {
  if (isLoading) {
    return <p className="text-[12px] text-zinc-400">Memuat daftar layanan…</p>;
  }
  if (focusAreas.length === 0) {
    return <p className="text-[12px] text-red-700">Daftar layanan gagal dimuat. Muat ulang halaman sebelum menyimpan.</p>;
  }

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {focusAreas.map((focus) => {
        const checked = value.includes(focus.id);
        return (
          <label
            key={focus.id}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors ${
              checked ? "border-zinc-900 bg-zinc-50 text-zinc-900" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <input type="checkbox" checked={checked} onChange={() => toggle(focus.id)} className="h-3.5 w-3.5 accent-zinc-900" />
            {focus.name}
          </label>
        );
      })}
    </div>
  );
}
