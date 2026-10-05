"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/services/profileService";

/**
 * Status login pasien dari GET /api/v1/auth/profile.
 * `appointmentHref` = tujuan tombol "Buat Janji Temu" (booking bila login, login bila belum).
 */
export function useAuthStatus(deps: unknown[] = []) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        const user = res.data?.user || res.user;
        setFullName(user?.full_name || user?.name || "Pasien");
        setIsLoggedIn(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoggedIn(false);
        setFullName(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { isLoggedIn, fullName, appointmentHref: isLoggedIn ? "/booking" : "/login" };
}
