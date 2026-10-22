"use client";

import { useEffect, useState } from "react";

// Jam operasional klinik (WIB): Senin sampai Sabtu 08.00 sampai 16.00, Minggu tutup.
const OPEN_HOUR = 8;
const CLOSE_HOUR = 16;

type Status = { open: boolean; label: string };

function getStatus(now: Date): Status {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value) % 24;

  if (weekday === "Sun") return { open: false, label: "Hari ini tutup, buka lagi Senin pukul 08.00" };
  if (hour < OPEN_HOUR) return { open: false, label: "Buka hari ini pukul 08.00 WIB" };
  if (hour >= CLOSE_HOUR) {
    return { open: false, label: weekday === "Sat" ? "Sudah tutup, buka lagi Senin pukul 08.00" : "Sudah tutup, buka lagi besok pukul 08.00" };
  }
  return { open: true, label: "Buka sekarang sampai 16.00 WIB" };
}

/** Status buka/tutup klinik berdasarkan waktu Jakarta. */
export default function OpenStatus({ className = "" }: { className?: string }) {
  // Dihitung setelah mount supaya tidak bentrok dengan HTML hasil prerender
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStatus(new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`flex items-center gap-2 ${className}`} aria-live="polite">
      <span className="flex w-[18px] shrink-0 justify-center">
        <span className={`h-2 w-2 rounded-full ${status?.open ? "bg-emerald-500" : "bg-brand-900/30"}`} />
      </span>
      <span>{status?.label ?? "Senin sampai Sabtu, 08.00 sampai 16.00 WIB"}</span>
    </span>
  );
}
