"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BellRinging, CheckCircle, CalendarX, Checks, BellSlash, ArrowRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "new" | "done" | "cancel">("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await adminService.getBookings();
      const bookings = res.data.bookings || [];

      const readIds: number[] = JSON.parse(localStorage.getItem("admin_read_notifs") || "[]");

      // Format timestamp nyata dari data booking
      const formatTimestamp = (b: any): string => {
        const rawDate = b.bookingDate || b.slotDate || b.slot_date || "";
        const dateStr = rawDate.substring(0, 10);
        const timeStr = (b.bookingTime || b.startTime || b.start_time || "").substring(0, 5);
        if (dateStr && timeStr) return `${dateStr} • ${timeStr} WIB`;
        if (dateStr) return dateStr;
        return "Aktivitas Terkini";
      };

      // Sort dari terbaru ke terlama sebelum dipetakan ke notifikasi
      const sorted = [...bookings].sort((a: any, b: any) => {
        const dateA = a.bookingDate || a.slotDate || "";
        const dateB = b.bookingDate || b.slotDate || "";
        return dateB.localeCompare(dateA);
      });

      const mapped = sorted.slice(0, 15).map((b: any, index: number) => {
        const status = (b.bookingStatus || b.status || "").toLowerCase();
        const pName = b.patientName || b.patient_name || "Pasien";
        const tName = b.therapistName || b.therapist_name || "Fisioterapis";
        const sName = (b.focusArea?.name || b.therapistSpecializations?.[0]?.name) || b.serviceName || b.service_name || "Fisioterapi";
        const rawDate = b.bookingDate || b.slotDate || b.slot_date || "Terjadwal";
        const dateStr = rawDate.substring(0, 10);
        const timeStr = (b.bookingTime || b.startTime || b.start_time || "").substring(0, 5);

        let type = "new";
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
          time: formatTimestamp(b),
          isRead: readIds.includes(notifId),
        };
      });

      setNotifs(mapped);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchNotifications, 30000);
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
    if (type === "new") return <BellRinging size={26} weight="fill" className={isRead ? "text-yellow-400/60" : "text-[#F5B301]"} />;
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
          <h2 className="text-[28px] font-bold text-[#1b2a4e]">Notifikasi</h2>
          <p className="text-[#585858] text-[15px]">
            Pantau pembaruan aktivitas booking masuk, penyelesaian sesi, dan pembatalan jadwal secara real-time.
          </p>
        </div>

        {/* Tombol Tandai Semua Sudah Dibaca */}
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#1b2a4e] font-bold text-[14px] rounded-xl transition-all shadow-sm shrink-0"
        >
          <Checks size={20} weight="bold" className="text-[#F5B301]" />
          Tandai semua sudah dibaca
        </button>
      </div>

      {/* --- Filter Tabs --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {[
          { id: "all", label: "Semua" },
          { id: "new", label: "Booking Baru" },
          { id: "done", label: "Selesai" },
          { id: "cancel", label: "Dibatalkan" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 rounded-xl text-[14px] font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-[#1b2a4e] text-white shadow-sm"
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
          <h4 className="text-[17px] font-bold text-[#1b2a4e] mb-1">Tidak Ada Notifikasi</h4>
          <p className="text-[14px] text-gray-500 max-w-sm">
            Saat ini belum ada aktivitas notifikasi pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredNotifs.map((notif) => {
            const cardClass = notif.isRead 
              ? "bg-white border-gray-100 opacity-75" 
              : "bg-white border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-l-4 border-l-[#F5B301]";
              
            const iconBgClass = notif.isRead
              ? "bg-gray-50 border-gray-100"
              : notif.type === 'new' ? 'bg-yellow-50 border-yellow-100' : notif.type === 'done' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100';

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
                    <h3 className={`font-bold text-[16px] md:text-[17px] group-hover:text-[#F5B301] transition-colors ${notif.isRead ? "text-gray-600" : "text-[#1b2a4e]"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap">
                      {notif.time}
                    </span>
                  </div>
                  <p className={`text-[14px] leading-relaxed ${notif.isRead ? "text-gray-400" : "text-[#585858]"}`}>
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
