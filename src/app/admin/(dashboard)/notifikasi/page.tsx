"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BellRinging, CheckCircle, CalendarX, Checks, BellSlash, ArrowRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import type { AdminBooking } from "@/types/api.types";

type NotifType = "new" | "done" | "cancel";
type Tab = "all" | NotifType;

type Notif = {
  id: number;
  bookingId: string;
  type: NotifType;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "new", label: "Booking Baru" },
  { id: "done", label: "Selesai" },
  { id: "cancel", label: "Dibatalkan" },
];

// Booking terbaru → kartu notifikasi (diurutkan dari jadwal terbaru)
function toNotifs(bookings: AdminBooking[], readIds: number[]): Notif[] {
  const sorted = [...bookings].sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));

  return sorted.slice(0, 15).map((b, index) => {
    const status = b.bookingStatus.toLowerCase();
    const pName = b.patientName || "Pasien";
    const tName = b.therapistName || "Fisioterapis";
    const sName = b.focusArea?.name || b.therapistSpecializations[0]?.name || "Fisioterapi";
    const dateStr = b.bookingDate.substring(0, 10);
    const timeStr = b.bookingTime.substring(0, 5);

    let type: NotifType = "new";
    let title = "Booking Baru Masuk!";
    let desc = `Pasien ${pName} mengajukan reservasi untuk ${sName} pada ${dateStr}${timeStr ? ` pukul ${timeStr} WIB` : ""} bersama ${tName}.`;

    if (status === "selesai") {
      type = "done";
      title = "Sesi Terapi Selesai";
      desc = `${tName} telah menyelesaikan sesi ${sName} bersama pasien ${pName}.`;
    } else if (status === "dibatalkan") {
      type = "cancel";
      title = "Booking Dibatalkan oleh Pasien";
      desc = `Pasien ${pName} telah membatalkan jadwal sesi ${sName} pada ${dateStr}${timeStr ? ` pukul ${timeStr} WIB` : ""}.`;
    }

    const notifId = index + 1;
    return {
      id: notifId,
      bookingId: b.id,
      type,
      title,
      desc,
      time: dateStr && timeStr ? `${dateStr} • ${timeStr} WIB` : dateStr || "Aktivitas Terkini",
      isRead: readIds.includes(notifId),
    };
  });
}

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      adminService
        // 15 booking yang terakhir dibuat/berubah cukup untuk daftar notifikasi
        .getBookings({ sort: "recent", limit: 15 })
        .then((res) => {
          const readIds: number[] = JSON.parse(localStorage.getItem("admin_read_notifs") || "[]");
          setNotifs(toNotifs(res.data.bookings || [], readIds));
        })
        .catch((error) => console.error("Gagal memuat notifikasi:", error))
        .finally(() => setIsLoading(false));

    load();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tandai semua sudah dibaca & sinkronkan dengan Header
  const handleMarkAllRead = () => {
    const allIds = notifs.map(n => n.id);
    localStorage.setItem("admin_read_notifs", JSON.stringify(allIds));
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));

    // Kirim event agar lonceng di Header langsung hilang titik merahnya
    window.dispatchEvent(new Event("adminNotifsUpdated"));
  };

  const getIcon = (type: string, isRead: boolean) => {
    if (type === "new") return <BellRinging size={26} weight="fill" className={isRead ? "text-gold-700/60" : "text-gold-700"} />;
    if (type === "done") return <CheckCircle size={26} weight="fill" className={isRead ? "text-green-400/60" : "text-green-500"} />;
    if (type === "cancel") return <CalendarX size={26} weight="fill" className={isRead ? "text-red-400/60" : "text-red-500"} />;
    return <BellRinging size={26} />;
  };

  // Filter notifikasi sesuai tab aktif
  const filteredNotifs = notifs.filter(n => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      
      {/* --- Header Halaman --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-brand-900">Notifikasi</h2>
          <p className="text-[#585858] text-[13px]">
            Pantau pembaruan aktivitas booking masuk, penyelesaian sesi, dan pembatalan jadwal secara real-time.
          </p>
        </div>

        {/* Tombol Tandai Semua Sudah Dibaca */}
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-brand-900 font-bold text-[13px] rounded-xl transition-all shadow-sm shrink-0"
        >
          <Checks size={20} weight="bold" className="text-gold-700" />
          Tandai semua sudah dibaca
        </button>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-brand-900 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- List Kartu Notifikasi --- */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-medium">
          Memuat daftar notifikasi klinik...
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
            <BellSlash size={32} />
          </div>
          <h4 className="text-[14px] font-bold text-brand-900 mb-1">Tidak Ada Notifikasi</h4>
          <p className="text-[13px] text-gray-500 max-w-sm">
            Saat ini belum ada aktivitas notifikasi pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredNotifs.map((notif) => {
            const cardClass = notif.isRead 
              ? "bg-white border-gray-100 opacity-75" 
              : "bg-white border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-l-4 border-l-brand-600";
              
            const iconBgClass = notif.isRead
              ? "bg-gray-50 border-gray-100"
              : notif.type === 'new' ? 'bg-brand-50 border-brand-100' : notif.type === 'done' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100';

            return (
              <Link
                key={notif.id}
                href="/admin/booking"
                className={`w-full flex gap-5 md:gap-6 p-6 rounded-2xl border transition-all duration-200 hover:shadow-md hover:border-gray-300 group cursor-pointer ${cardClass}`}
              >
                {/* Box Ikon */}
                <div className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 border ${iconBgClass}`}>
                  {getIcon(notif.type, notif.isRead)}
                </div>
                
                {/* Konten Notif */}
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                    <h3 className={`font-bold text-[14px] md:text-[14px] group-hover:text-gold-700 transition-colors ${notif.isRead ? "text-gray-600" : "text-brand-900"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">
                      {notif.time}
                    </span>
                  </div>
                  <p className={`text-[13px] leading-relaxed ${notif.isRead ? "text-gray-400" : "text-[#585858]"}`}>
                    {notif.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
