"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, List, Checks, BellRinging, CheckCircle, CalendarX } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profileService } from "@/services/profileService";
import { adminService } from "@/services/adminService";

export default function AdminHeader() {
  const pathname = usePathname();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [headerNotifs, setHeaderNotifs] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const [adminName, setAdminName] = useState("Admin");

  // Load profil admin
  const loadAdminProfile = async () => {
    try {
      const res = await profileService.getProfile();
      const user = res.data.user;
      if (user?.full_name || user?.name) {
        setAdminName(user.full_name || user.name);
      }
    } catch {}
  };

  // Load notifikasi terkini
  const loadNotifications = async () => {
    try {
      const res = await adminService.getBookings();
      const bookings = res.data.bookings || [];
      const readIds: number[] = JSON.parse(localStorage.getItem("admin_read_notifs") || "[]");

      const recent = bookings.slice(0, 4).map((b: any, index: number) => {
        const status = (b.status || "").toLowerCase();
        const pName = b.patientName || b.patient_name || "Pasien";
        const sName = b.serviceName || b.service_name || "Fisioterapi";

        let type = "new";
        let title = "Booking Baru Masuk!";
        let desc = `Pasien ${pName} memesan sesi ${sName}.`;

        if (status === "selesai") {
          type = "done";
          title = "Sesi Selesai";
          desc = `Sesi ${sName} bersama ${pName} telah selesai.`;
        } else if (status === "dibatalkan") {
          type = "cancel";
          title = "Booking Dibatalkan";
          desc = `Jadwal ${sName} dibatalkan oleh ${pName}.`;
        }

        return {
          id: index + 1,
          type,
          title,
          desc,
          time: "Baru saja",
          isRead: readIds.includes(index + 1),
        };
      });

      setHeaderNotifs(recent);

      // Cek apakah masih ada yang belum dibaca
      const anyUnread = recent.some((n: any) => !n.isRead);
      setHasUnread(recent.length > 0 && anyUnread);
    } catch {}
  };

  useEffect(() => {
    loadAdminProfile();
    loadNotifications();

    const handleProfileUpdate = () => loadAdminProfile();
    const handleNotifsUpdate = () => loadNotifications();

    window.addEventListener("adminProfileUpdated", handleProfileUpdate);
    window.addEventListener("adminNotifsUpdated", handleNotifsUpdate);

    // Auto-refresh notifikasi setiap 15 detik (Live Update)
    const notifInterval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => {
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
      window.removeEventListener("adminNotifsUpdated", handleNotifsUpdate);
      clearInterval(notifInterval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const allIds = headerNotifs.map((n: any) => n.id);
    localStorage.setItem("admin_read_notifs", JSON.stringify(allIds));
    setHasUnread(false);
    setHeaderNotifs(headerNotifs.map((n: any) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event("adminNotifsUpdated"));
  };
  
  const getTitle = () => {
     if (pathname.includes("/profil")) return "Profil";
     if (pathname.includes("/notifikasi")) return "Notifikasi";
     if (pathname.includes("/booking")) return "Daftar Booking";
     if (pathname.includes("/jadwal")) return "Kelola Jadwal";
     if (pathname.includes("/terapis")) return "Data Terapis";
     if (pathname.includes("/pasien")) return "Data Pasien";
     return "Dasbor Admin";
  };

  const getIcon = (type: string) => {
    if (type === "new") return <BellRinging size={18} weight="fill" className="text-gold-700" />;
    if (type === "done") return <CheckCircle size={18} weight="fill" className="text-green-500" />;
    if (type === "cancel") return <CalendarX size={18} weight="fill" className="text-red-500" />;
    return <Bell size={18} />;
  };

  return (
    <header className="w-full h-[80px] bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Kiri: Judul Halaman */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:text-gold-700">
          <List size={28} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-4 h-6 border-l-4 border-brand-900 rounded-sm hidden md:block"></div>
          <h1 className="text-[18px] md:text-[20px] font-bold text-brand-900">{getTitle()}</h1>
        </div>
      </div>

      {/* Kanan: Notifikasi & Profil Admin */}
      <div className="flex items-center gap-6 relative">
        
        {/* WRAPPER NOTIFIKASI */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? "bg-gray-100 text-brand-900" : "text-gray-500 hover:text-brand-900"}`}
          >
            <Bell size={24} weight={isNotifOpen ? "fill" : "regular"} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* KOTAK DROPDOWN NOTIFIKASI */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-[360px] bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <span className="font-bold text-brand-900 text-[14px]">Notifikasi</span>
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[12px] font-bold text-gold-700 flex items-center gap-1 hover:text-gold-800 transition-colors"
                >
                  <Checks size={16} weight="bold" /> Tandai sudah dibaca
                </button>
              </div>
              
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {headerNotifs.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">
                    Belum ada notifikasi baru
                  </div>
                ) : (
                  headerNotifs.map((notif) => (
                    <Link 
                      key={notif.id} 
                      href="/admin/booking"
                      onClick={() => setIsNotifOpen(false)}
                      className="flex gap-3.5 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'new' ? 'bg-brand-50' : notif.type === 'done' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-bold text-[13px] leading-tight truncate ${notif.isRead ? "text-gray-600" : "text-brand-900"}`}>
                            {notif.title}
                          </span>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{notif.desc}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-3.5 border-t border-gray-100 bg-white">
                <Link 
                  href="/admin/notifikasi"
                  onClick={() => setIsNotifOpen(false)}
                  className="w-full py-2 flex items-center justify-center rounded-xl text-[13px] font-bold text-brand-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Lihat semua notifikasi
                </Link>
              </div>

            </div>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gray-200"></div>

        {/* Foto Profil & Nama Admin Dinamis */}
        <Link href="/admin/profil" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 group-hover:border-brand-600 transition-colors bg-brand-900">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=1b2a4e&color=fff`} 
              alt="Profil Admin" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-col hidden sm:flex max-w-[140px]">
            <span className="text-[14px] font-bold text-brand-900 leading-tight group-hover:text-gold-700 transition-colors truncate">
              {adminName}
            </span>
            <span className="text-[12px] text-gray-500">Admin</span>
          </div>
        </Link>

      </div>
    </header>
  );
}
