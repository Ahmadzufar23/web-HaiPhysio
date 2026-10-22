"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profileService";
import type { StaffRole } from "@/types/api.types";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

const StaffUserContext = createContext<StaffUser | null>(null);

/** Akun staf yang sedang login (owner / terapis). Hanya dipakai di dalam AdminGuard. */
export function useStaffUser(): StaffUser {
  const user = useContext(StaffUserContext);
  if (!user) throw new Error("useStaffUser harus dipakai di dalam AdminGuard");
  return user;
}

// Penjaga semua halaman /admin/(dashboard): wajib login sebagai owner atau terapis.
// Backend tetap jadi pengaman utama (403 FORBIDDEN_ROLE), guard ini cuma
// mencegah pasien / tamu melihat UI admin yang isinya gagal semua.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    profileService
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        const u = res?.data?.user;
        if (u?.role === "owner" || u?.role === "terapis") {
          setUser({ id: u.id, name: u.full_name || u.name || "Staf", email: u.email, role: u.role });
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-[13px] text-brand-900/60">
        Memeriksa akses…
      </div>
    );
  }

  return <StaffUserContext.Provider value={user}>{children}</StaffUserContext.Provider>;
}
