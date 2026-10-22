"use client";

import { MagnifyingGlass, DownloadSimple } from "@phosphor-icons/react";
import type { BookingStatus } from "@/types/api.types";
import { btn, inputClass } from "@/components/admin/shared/AdminUI";

const STATUS_OPTIONS: { value: BookingStatus | ""; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "Terkonfirmasi", label: "Menunggu" },
  { value: "Berlangsung", label: "Berlangsung" },
  { value: "Selesai", label: "Selesai" },
  { value: "Tidak Hadir", label: "Tidak hadir" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

interface BookingFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: BookingStatus | "";
  onStatusChange: (val: BookingStatus | "") => void;
  date: string;
  onDateChange: (val: string) => void;
  onExportCsv: () => void;
}

export default function BookingFilter({ search, onSearchChange, status, onStatusChange, date, onDateChange, onExportCsv }: BookingFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Cari pasien</span>
        <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/40" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau nomor telepon pasien"
          className={`${inputClass} pl-9`}
        />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <label>
          <span className="sr-only">Tanggal sesi</span>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className={`${inputClass} sm:w-[160px]`} />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select value={status} onChange={(e) => onStatusChange(e.target.value as BookingStatus | "")} className={`${inputClass} sm:w-[160px]`}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={onExportCsv} className={`${btn.secondary} col-span-2 h-[38px] sm:col-span-1`}>
          <DownloadSimple size={16} />
          Ekspor CSV
        </button>
      </div>
    </div>
  );
}
