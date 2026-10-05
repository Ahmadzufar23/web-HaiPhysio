"use client";

import { Users, UserCheck, Article, XCircle } from "@phosphor-icons/react";

interface PasienStatsProps {
  patients: any[];
  bookings: any[];
  isLoading: boolean;
}

export default function PasienStats({ patients, bookings, isLoading }: PasienStatsProps) {
  const totalPasien = patients.length;
  
  // Pasien aktif (yang memiliki sesi/booking)
  const pasienAktif = patients.filter((p: any) => (p.totalBookings || 0) > 0 || (p.totalSessions || 0) > 0).length || totalPasien;
  
  // Total sesi selesai secara keseluruhan
  const totalSelesai = bookings.filter((b: any) => {
    const st = (b.bookingStatus || b.status || "").toLowerCase();
    return st === "selesai";
  }).length;

  // Hitung juga sesi selesai di bulan ini untuk insight tambahan
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const selesaiBulanIni = bookings.filter((b: any) => {
    const st = (b.bookingStatus || b.status || "").toLowerCase();
    if (st !== "selesai") return false;
    const bDate = new Date(b.bookingDate || b.slotDate || b.created_at || Date.now());
    return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
  }).length;
  
  // Sesi yang dibatalkan / dicancel
  const sesiDibatalkan = bookings.filter((b: any) => {
    const st = (b.bookingStatus || b.status || "").toLowerCase();
    return st === "dibatalkan" || st === "batal" || st === "cancel" || st === "cancelled";
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      
      {/* 1. Total Pasien Terdaftar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5 hover:border-gray-300 transition-all">
        <div className="w-14 h-14 rounded-full bg-brand-50 text-gold-700 flex items-center justify-center shrink-0">
          <Users size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Total Pasien Terdaftar</span>
          <span className="text-[32px] font-bold text-brand-900 leading-none">
            {isLoading ? "..." : `${totalPasien}`}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">Seluruh database klinik</span>
        </div>
      </div>

      {/* 2. Pasien Aktif */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5 hover:border-gray-300 transition-all">
        <div className="w-14 h-14 rounded-full bg-[#e6f7f1] text-[#00b074] flex items-center justify-center shrink-0">
          <UserCheck size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Pasien Aktif</span>
          <span className="text-[32px] font-bold text-green-600 leading-none">
            {isLoading ? "..." : `${pasienAktif}`}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">Memiliki riwayat terapi</span>
        </div>
      </div>

      {/* 3. Total Sesi Selesai (Kumulatif + Insight Bulan Ini) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5 hover:border-gray-300 transition-all">
        <div className="w-14 h-14 rounded-full bg-[#f0f4ff] text-[#3b82f6] flex items-center justify-center shrink-0">
          <Article size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Total Sesi Selesai</span>
          <span className="text-[32px] font-bold text-gold-700 leading-none">
            {isLoading ? "..." : `${totalSelesai}`}
          </span>
          <span className="text-[11px] text-gold-700 font-semibold mt-0.5">
            {selesaiBulanIni > 0 ? `+${selesaiBulanIni} sesi bulan ini` : "Keseluruhan riwayat"}
          </span>
        </div>
      </div>

      {/* 4. Sesi Dibatalkan (Dicancel) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5 hover:border-gray-300 transition-all">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <XCircle size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Sesi Dibatalkan</span>
          <span className="text-[32px] font-bold text-red-500 leading-none">
            {isLoading ? "..." : `${sesiDibatalkan}`}
          </span>
          <span className="text-[11px] text-red-400 mt-0.5">Total reservasi dibatalkan</span>
        </div>
      </div>

    </div>
  );
}
