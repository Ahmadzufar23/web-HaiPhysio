"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profileService";

// Penjaga semua halaman /admin/(dashboard): wajib login DAN role === "admin".
// Backend tetap jadi pengaman utama (403 FORBIDDEN_ROLE), guard ini cuma
// mencegah pasien / tamu melihat UI admin yang isinya gagal semua.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    profileService
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        if (res?.data?.user?.role === "admin") {
          setAllowed(true);
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

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-[14px] font-medium text-[#585858]">
        Memverifikasi akses admin...
      </div>
    );
  }

  return <>{children}</>;
}
