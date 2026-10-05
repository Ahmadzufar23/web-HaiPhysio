"use client";

import { useEffect, useState } from "react";

// Jam operasional klinik (WIB): Senin–Sabtu 08.00–16.00, Minggu tutup.
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

  if (weekday === "Sun") return { open: false, label: "Minggu tutup · Buka Senin 08.00" };
  if (hour < OPEN_HOUR) return { open: false, label: "Buka hari ini pukul 08.00 WIB" };
  if (hour >= CLOSE_HOUR) {
    return { open: false, label: weekday === "Sat" ? "Tutup · Buka Senin 08.00" : "Tutup · Buka besok 08.00" };
  }
  return { open: true, label: "Buka sekarang · sampai 16.00 WIB" };
}

/** Lencana status buka/tutup klinik berdasarkan waktu Jakarta. */
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
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/60 bg-white/85 px-4 py-2 text-[13px] font-semibold text-brand-900 shadow-[0_12px_32px_-12px_rgb(26_24_20/0.35)] backdrop-blur-md transition-opacity duration-500 ${
        status ? "opacity-100" : "opacity-0"
      } ${className}`}
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        {status?.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status?.open ? "bg-emerald-500" : "bg-brand-900/30"}`} />
      </span>
      {status?.label ?? "Senin–Sabtu · 08.00–16.00 WIB"}
    </div>
  );
}
