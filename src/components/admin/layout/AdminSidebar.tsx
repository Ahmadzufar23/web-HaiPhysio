"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChartBar, CalendarBlank, ClipboardText, Stethoscope, Users, SignOut } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import ModalLogout from "@/components/profile/ModalLogout";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await profileService.logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Gagal logout admin:", error);
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { title: "Dashboard Ringkasan", path: "/admin", icon: <ChartBar size={24} /> },
    { title: "Kelola Slot Jadwal", path: "/admin/jadwal", icon: <CalendarBlank size={24} /> },
    { title: "List Booking Masuk", path: "/admin/booking", icon: <ClipboardText size={24} /> },
    { title: "Kelola Data Terapis", path: "/admin/terapis", icon: <Stethoscope size={24} /> },
    { title: "Kelola Data Pasien", path: "/admin/pasien", icon: <Users size={24} /> },
  ];

  return (
    <>
      <aside className="w-[280px] h-screen bg-brand-900 flex flex-col fixed left-0 top-0 text-white shadow-xl z-50">
        
        {/* --- Area Logo --- */}
        <div className="flex items-center gap-3 px-8 py-8 border-b border-white/10">
          <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shrink-0">
            <Image src="/fisio_nobg.png" alt="Logo Hai Physio" width={32} height={32} className="object-contain w-auto h-auto" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[20px] leading-tight">Hai Physio</span>
            <span className="text-gray-300 text-[12px]">Admin Management</span>
          </div>
        </div>

        {/* --- Area Menu Navigasi --- */}
        <nav className="flex-1 flex flex-col gap-2 px-4 py-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? "bg-brand-950 text-brand-300 font-bold border-l-4 border-brand-300" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white font-medium border-l-4 border-transparent"}
                `}
              >
                {item.icon}
                <span className="text-[15px]">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* --- Tombol Keluar (Bawah) --- */}
        <div className="p-8 border-t border-white/10">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-4 text-red-400 hover:text-red-300 font-bold transition-colors w-full"
          >
            <SignOut size={24} />
            <span>Keluar</span>
          </button>
        </div>
        
      </aside>

      {/* Modal Konfirmasi Logout */}
      <ModalLogout
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
