"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useStaffUser } from "./AdminGuard";

// Halaman yang boleh dibuka terapis; selain ini khusus owner (backend juga menolak dengan 403).
const TERAPIS_PATHS = ["/admin/booking", "/admin/sesi", "/admin/pasien", "/admin/video", "/admin/profil"];

// Kerangka dashboard dengan tema netral (.admin-theme di globals.css).
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useStaffUser();
  const pathname = usePathname();
  const router = useRouter();
  const allowed = user.role === "owner" || pathname === "/admin" || TERAPIS_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!allowed) router.replace("/admin");
  }, [allowed, router]);

  return (
    <div className="admin-theme min-h-screen bg-zinc-50 text-[13px] print:bg-white">
      {/* Sidebar & header tidak ikut tercetak (cetak rekam medis) */}
      <div className="print:hidden">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
      <div className="flex min-h-screen flex-col lg:pl-[220px] print:pl-0">
        <div className="print:hidden">
          <AdminHeader onOpenMenu={() => setMenuOpen(true)} />
        </div>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5 sm:px-6 lg:py-6 print:max-w-none print:p-0">{allowed ? children : null}</main>
      </div>
    </div>
  );
}
