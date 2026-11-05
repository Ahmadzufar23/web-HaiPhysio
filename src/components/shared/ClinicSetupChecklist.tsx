"use client";

export type ClinicSetup = { hasLogo: boolean; hasPrices: boolean; hasTherapists: boolean; hasSchedule: boolean };

const ITEMS: { key: keyof ClinicSetup; label: string; todo: string; required: boolean }[] = [
  { key: "hasPrices", label: "Harga paket", todo: "Isi harga di menu Paket Terapi", required: true },
  { key: "hasTherapists", label: "Terapis dengan layanan", todo: "Pilih spesialisasi di menu Terapis", required: true },
  { key: "hasSchedule", label: "Jadwal ke depan", todo: "Buat slot di menu Jadwal Slot", required: true },
  { key: "hasLogo", label: "Logo klinik", todo: "Unggah logo di halaman ini", required: false },
];

// Pasien baru bisa booking kalau tiga hal wajib sudah ada
export default function ClinicSetupChecklist({ setup }: { setup: ClinicSetup }) {
  const canBook = ITEMS.every((item) => !item.required || setup[item.key]);
  return (
    <div className="flex flex-col gap-2 p-4 text-[13px]">
      <p className={canBook ? "font-medium text-emerald-800" : "font-medium text-amber-800"}>{canBook ? "Pasien sudah bisa booking di klinik ini." : "Pasien belum bisa booking. Lengkapi yang masih kurang."}</p>
      <ul className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <li key={item.key} className="flex flex-wrap justify-between gap-2">
            <span className="text-zinc-700">{item.label}</span>
            <span className={setup[item.key] ? "text-zinc-500" : "text-amber-800"}>{setup[item.key] ? "Sudah" : item.todo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
