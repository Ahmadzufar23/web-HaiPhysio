"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { profileService } from "@/services/profileService";
import { PLATFORM } from "@/constants/platform";

const NAV = [
  { title: "Ringkasan", path: "/super-admin" },
  { title: "Reminder", path: "/super-admin/reminder" },
  { title: "Klinik baru", path: "/super-admin/klinik/baru" },
  { title: "Audit log", path: "/super-admin/audit" },
];

// Backend tetap jadi pengaman utama (403); guard ini mencegah akun lain melihat halaman kosong.
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        if (res?.data?.user?.role === "super_admin") setAllowed(true);
        else router.replace("/super-admin/login");
      })
      .catch(() => {
        if (!cancelled) router.replace("/super-admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await profileService.logout().catch(() => undefined);
    window.location.href = "/super-admin/login";
  };

  if (!allowed) return <div className="min-h-screen bg-zinc-50" />;

  return (
    <div className="min-h-screen w-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[14px] font-semibold text-zinc-900">{PLATFORM.name}</span>
            <nav className="flex flex-wrap gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={pathname === item.path ? "page" : undefined}
                  className={`rounded px-2.5 py-1 text-[13px] ${pathname === item.path ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <button type="button" onClick={handleLogout} className="text-[13px] text-zinc-600 hover:text-zinc-900">
            Keluar
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-6">{children}</main>
    </div>
  );
}
