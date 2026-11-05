"use client";

import { useEffect, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { addDays, buildDateWindow, isDateInWindow } from "@/lib/bookingDates";
import { todayWib } from "@/lib/format";

const WINDOW_DAYS = 14;
const REFRESH_INTERVAL_MS = 60_000;

type Props = {
  selectedDate: string;
  onSelect: (date: string) => void;
};

// Penanda jumlah pasien per tanggal. Mengeklik tanggal mengisi filter tanggal di daftar booking.
export default function BookingDateStrip({ selectedDate, onSelect }: Props) {
  const [windowStart, setWindowStart] = useState(() => selectedDate || todayWib());
  const [previousSelected, setPreviousSelected] = useState(selectedDate);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hasError, setHasError] = useState(false);

  // Tanggal dipilih dari kolom filter dan berada di luar deretan: deretan ikut pindah
  if (selectedDate !== previousSelected) {
    setPreviousSelected(selectedDate);
    if (selectedDate && !isDateInWindow(selectedDate, windowStart, WINDOW_DAYS)) setWindowStart(selectedDate);
  }

  useEffect(() => {
    let isCancelled = false;
    const load = () =>
      adminService
        .getBookingDateCounts(windowStart, addDays(windowStart, WINDOW_DAYS - 1))
        .then((res) => {
          if (isCancelled) return;
          setCounts(Object.fromEntries(res.data.counts.map((item) => [item.date, item.patients])));
          setHasError(false);
        })
        .catch((error) => {
          console.error("Gagal memuat jumlah pasien per tanggal:", error);
          if (!isCancelled) setHasError(true);
        });

    void load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [windowStart]);

  const today = todayWib();
  const navClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Tanggal sebelumnya" className={navClass} onClick={() => setWindowStart(addDays(windowStart, -WINDOW_DAYS))}>
          <CaretLeft size={14} />
        </button>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {buildDateWindow(windowStart, WINDOW_DAYS).map((day) => {
            const patients = counts[day.date] ?? 0;
            const isSelected = day.date === selectedDate;
            const tone = isSelected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50";
            const countTone = isSelected ? "text-white" : patients > 0 ? "text-zinc-900" : "text-zinc-400";
            return (
              <button
                key={day.date}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${day.weekday} ${day.dayMonth}, ${patients} orang`}
                onClick={() => onSelect(day.date)}
                className={`flex min-w-[68px] flex-1 flex-col items-center rounded-md border px-1.5 py-1.5 text-[11px] ${tone}`}
              >
                <span>{day.date === today ? "Hari ini" : day.weekday}</span>
                <span className="font-medium">{day.dayMonth}</span>
                <span className={`mt-0.5 tabular-nums ${patients > 0 ? "font-semibold" : ""} ${countTone}`}>{patients} orang</span>
              </button>
            );
          })}
        </div>
        <button type="button" aria-label="Tanggal berikutnya" className={navClass} onClick={() => setWindowStart(addDays(windowStart, WINDOW_DAYS))}>
          <CaretRight size={14} />
        </button>
      </div>
      {hasError && <p className="text-[12px] text-red-700">Jumlah pasien per tanggal gagal dimuat.</p>}
    </div>
  );
}
