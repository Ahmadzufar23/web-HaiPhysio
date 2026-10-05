"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Barbell, Bandaids, CalendarX, ArrowRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";

export default function ScheduleTable() {
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodaySchedules = async () => {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const todayStr = `${y}-${m}-${d}`;

      const res = await adminService.getBookings();
      const allBookings = res.data.bookings || [];

      const filteredToday = allBookings.filter((b: any) => {
        // bookingDate format ISO: "2026-08-31T00:00:00.000Z", ambil substring YYYY-MM-DD
        const rawDate = b.bookingDate || b.slotDate || b.slot_date || "";
        return rawDate.substring(0, 10) === todayStr;
      });

      setTodaySchedules(filteredToday);
    } catch (error) {
      console.error("Gagal menarik jadwal hari ini:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedules();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchTodaySchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderLayananBadge = (layanan: string) => {
    let Icon = Bandaids;
    if (layanan.toLowerCase().includes("neuro")) Icon = Brain;
    if (layanan.toLowerCase().includes("olahraga")) Icon = Barbell;

    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-600 text-gold-700 bg-brand-50/50">
        <Icon size={16} weight="bold" />
        <span className="text-[13px] font-bold">{layanan}</span>
      </div>
    );
  };

  const renderStatusBadge = (statusRaw: string) => {
    const status = (statusRaw || "").toLowerCase();
    let label = "Terkonfirmasi";
    let colorClass = "border-green-500 text-green-600 bg-green-50/40";
    let dotClass = "bg-green-500";

    if (status === "selesai") {
      label = "Selesai";
      colorClass = "border-gray-300 text-gray-600 bg-gray-50";
      dotClass = "bg-gray-400";
    } else if (status === "dibatalkan") {
      label = "Dibatalkan";
      colorClass = "border-red-300 text-red-500 bg-red-50/40";
      dotClass = "bg-red-500";
    } else if (status === "tidak_hadir") {
      label = "Tidak Hadir";
      colorClass = "border-orange-300 text-orange-500 bg-orange-50/40";
      dotClass = "bg-orange-500";
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border ${colorClass}`}>
        <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
        <span className="text-[12px] font-bold">{label}</span>
      </div>
    );
  };

  const formatJam = (bookingTime?: string) => {
    if (!bookingTime) return "-";
    return `${bookingTime.substring(0, 5)} WIB`;
  };

  const getLayananName = (b: any): string => {
    // API tidak punya serviceName, pakai therapistSpecializations[0].name
    if (b.therapistSpecializations?.length > 0) {
      return b.therapistSpecializations[0].name || "Fisioterapi";
    }
    return b.serviceName || b.service_name || "Fisioterapi";
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden">
      
      {/* Header Tabel */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-bold text-brand-900">Jadwal Sesi Hari Ini</h3>
            {/* Live indicator */}
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <span className="text-[13px] text-gray-500">
            {isLoading ? "Memuat jadwal..." : `Total ${todaySchedules.length} sesi hari ini`}
          </span>
        </div>

        <Link
          href="/admin/booking"
          className="text-[13px] font-bold text-gold-700 hover:text-gold-700 flex items-center gap-1 transition-colors"
        >
          Lihat Semua Booking
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>

      {/* Isi Tabel atau Empty State */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 font-medium">
          Memuat jadwal sesi hari ini...
        </div>
      ) : todaySchedules.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <CalendarX size={32} />
          </div>
          <h4 className="text-[16px] font-bold text-brand-900 mb-1">Belum Ada Sesi Hari Ini</h4>
          <p className="text-[13px] text-gray-500 max-w-sm">
            Tidak ada pasien yang memiliki jadwal terapi untuk hari ini. Anda dapat melihat jadwal di hari lain pada menu Booking.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 w-[50px]">No</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 min-w-[150px]">Waktu</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 min-w-[200px]">Nama Pasien</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 min-w-[180px]">Nama Terapis</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 min-w-[180px] text-center">Layanan</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-500 min-w-[150px] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaySchedules.map((row: any, index: number) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[14px] text-gray-500">{index + 1}</td>
                  <td className="py-4 px-6 text-[14px] text-gray-600 font-medium">{formatJam(row.bookingTime || row.startTime || row.start_time)}</td>
                  <td className="py-4 px-6 text-[14px] font-bold text-brand-900">{row.patientName || row.patient_name}</td>
                  <td className="py-4 px-6 text-[14px] text-brand-900">{row.therapistName || row.therapist_name}</td>
                  <td className="py-4 px-6 text-center">{renderLayananBadge(getLayananName(row))}</td>
                  <td className="py-4 px-6 text-center">{renderStatusBadge(row.bookingStatus || row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
