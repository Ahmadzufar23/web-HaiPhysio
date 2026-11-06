"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SquaresFour, ClipboardText, CalendarBlank, Users, Stethoscope, Package, ChartLineUp, FilmStrip, Receipt, Wallet, Buildings, SignOut, X, type Icon } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import ModalLogout from "@/components/profile/ModalLogout";
import { useStaffUser } from "./AdminGuard";
import type { StaffRole } from "@/types/api.types";
import { PLATFORM } from "@/constants/platform";
import { useClinic } from "@/components/shared/ClinicProvider";
import ClinicLogo from "@/components/shared/ClinicLogo";
import BranchSwitcher from "@/components/shared/BranchSwitcher";

type NavItem = { title: string; path: string; icon: Icon; roles: StaffRole[] };

// Terapis: Ringkasan (jadwal miliknya, tanpa harga), Booking, Pasien, dan Video Terapi; sisanya khusus owner.
export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Operasional",
    items: [
      { title: "Ringkasan", path: "/admin", icon: SquaresFour, roles: ["owner", "terapis"] },
      { title: "Booking & Sesi", path: "/admin/booking", icon: ClipboardText, roles: ["owner", "terapis"] },
      { title: "Pasien", path: "/admin/pasien", icon: Users, roles: ["owner", "terapis"] },
      { title: "Video Terapi", path: "/admin/video", icon: FilmStrip, roles: ["owner", "terapis"] },
      { title: "Jadwal Slot", path: "/admin/jadwal", icon: CalendarBlank, roles: ["owner"] },
    ],
  },
  {
    group: "Pengelolaan",
    items: [
      { title: "Terapis", path: "/admin/terapis", icon: Stethoscope, roles: ["owner"] },
      { title: "Paket Terapi", path: "/admin/paket", icon: Package, roles: ["owner"] },
      { title: "Keuangan & Absensi", path: "/admin/laporan", icon: ChartLineUp, roles: ["owner"] },
      { title: "Pembukuan", path: "/admin/pembukuan", icon: Wallet, roles: ["owner"] },
      { title: "Tagihan", path: "/admin/tagihan", icon: Receipt, roles: ["owner"] },
      { title: "Profil Klinik", path: "/admin/klinik", icon: Buildings, roles: ["owner"] },
    ],
  },
];

const ROLE_LABEL: Record<StaffRole, string> = { owner: "Owner", terapis: "Terapis" };

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const user = useStaffUser();
  const clinic = useClinic();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await profileService.logout();
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path) || (path === "/admin/booking" && pathname.startsWith("/admin/sesi"));

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-zinc-900/20 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} aria-hidden />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <Link href="/admin" className="flex min-w-0 flex-col gap-1.5" onClick={onClose}>
              <ClinicLogo className="h-10 w-auto max-w-[150px] object-left" nameClassName="text-[14px] font-semibold tracking-tight text-zinc-900" />
              {clinic.logoUrl && <span className="truncate text-[12px] font-medium text-zinc-700">{clinic.brand}</span>}
            </Link>
            <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-900 lg:hidden" aria-label="Tutup menu">
              <X size={16} />
            </button>
          </div>
          {user.role === "owner" && <BranchSwitcher redirectTo="/admin" className="w-full" />}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map(({ group, items }) => {
            const visible = items.filter((item) => item.roles.includes(user.role));
            if (visible.length === 0) return null;
            return (
              <div key={group} className="mb-4">
                <p className="mb-1 px-2 text-[11px] font-medium text-zinc-500">{group}</p>
                <ul className="flex flex-col gap-px">
                  {visible.map(({ title, path, icon: IconEl }) => {
                    const active = isActive(path);
                    return (
                      <li key={path}>
                        <Link
                          href={path}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                            active ? "bg-action-soft font-medium text-action-ink" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                          }`}
                        >
                          <IconEl size={16} weight={active ? "fill" : "regular"} className={active ? "text-action-ink" : "text-zinc-500"} />
                          {title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-2">
          <Link href="/admin/profil" onClick={onClose} className="block rounded-md px-2 py-1.5 hover:bg-zinc-50">
            <p className="truncate text-[12px] font-medium text-zinc-900">{user.name}</p>
            <p className="text-[11px] text-zinc-500">{ROLE_LABEL[user.role]}</p>
          </Link>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <SignOut size={16} className="text-zinc-400" />
            Keluar
          </button>
          <p className="mt-1 flex items-center gap-1.5 px-2 pb-1 pt-1.5 text-[11px] text-zinc-400">
            <Image src={PLATFORM.logo} alt="" width={14} height={14} unoptimized className="h-3.5 w-3.5" />
            {PLATFORM.name}
          </p>
        </div>
      </aside>

      <ModalLogout isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} isLoggingOut={isLoggingOut} />
    </>
  );
}
