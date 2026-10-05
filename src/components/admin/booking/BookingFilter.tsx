"use client";

import { MagnifyingGlass, CalendarBlank, CaretDown, DownloadSimple } from "@phosphor-icons/react";

interface BookingFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  service: string;
  onServiceChange: (val: string) => void;
  date: string;
  onDateChange: (val: string) => void;
  onExportCsv: () => void;
}

export default function BookingFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  service,
  onServiceChange,
  date,
  onDateChange,
  onExportCsv,
}: BookingFilterProps) {
  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 mb-6">
      
      {/* 1. Search Bar */}
      <div className="relative flex-1">
        <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari Nama Pasien / Kode Reservasi..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-brand-900 outline-none focus:border-gold-600 transition-colors"
        />
      </div>

      {/* 2. Group Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        
        {/* Filter Tanggal */}
        <div className="relative min-w-[170px]">
          <input 
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-white border border-gray-200 text-[#585858] text-[13px] font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
          />
        </div>

        {/* Filter Layanan */}
        <div className="relative min-w-[180px]">
          <select 
            value={service}
            onChange={(e) => onServiceChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 text-[#585858] text-[13px] font-semibold py-3 pl-4 pr-9 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
          >
            <option value="">Semua Layanan</option>
            <option value="Olahraga">Fisioterapi Olahraga</option>
            <option value="Neuro">Fisioterapi Neuro</option>
            <option value="Muskuloskeletal">Fisioterapi Muskuloskeletal</option>
          </select>
          <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Filter Status */}
        <div className="relative min-w-[160px]">
          <select 
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 text-[#585858] text-[13px] font-semibold py-3 pl-4 pr-9 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="terkonfirmasi">Terkonfirmasi</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
            <option value="tidak_hadir">Tidak Hadir</option>
          </select>
          <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Tombol Ekspor CSV */}
        <button 
          onClick={onExportCsv}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-brand-900 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0"
        >
          <DownloadSimple size={18} weight="bold" className="text-gold-700" />
          Ekspor CSV
        </button>

      </div>
    </div>
  );
}
