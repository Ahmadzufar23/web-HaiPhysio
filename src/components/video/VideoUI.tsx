"use client";

import { Check, FilmStrip, Play } from "@phosphor-icons/react";
import type { TherapyVideo } from "@/types/api.types";
import { formatDuration } from "./VideoPlayer";

/** Sampul video: thumbnail YouTube, atau bidang netral untuk file unggahan. */
export function VideoThumb({ video, className = "", done }: { video: Pick<TherapyVideo, "thumbnailUrl" | "durationSeconds" | "title">; className?: string; done?: boolean }) {
  const duration = formatDuration(video.durationSeconds);
  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-zinc-100 ${className}`}>
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- thumbnail YouTube
        <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-200/70">
          <FilmStrip size={22} className="text-zinc-400" />
        </div>
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm">
          <Play size={12} weight="fill" />
        </span>
      </span>
      {duration && <span className="absolute bottom-1.5 right-1.5 rounded bg-zinc-950/75 px-1 py-px text-[10px] font-medium tabular-nums text-white">{duration}</span>}
      {done && (
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white" aria-label="Selesai hari ini">
          <Check size={11} weight="bold" />
        </span>
      )}
    </div>
  );
}

const noon = (d: string) => new Date(`${d}T12:00:00Z`);
const monthLabel = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "long", year: "numeric" });
const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Kalender bulan berjalan: hari dengan check-in ditandai, hari ini diberi cincin. */
export function StreakCalendar({ today, doneDates }: { today: string; doneDates: Set<string> }) {
  const [y, m] = today.split("-").map(Number);
  const first = `${y}-${String(m).padStart(2, "0")}-01`;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (noon(first).getUTCDay() + 6) % 7;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${first.slice(0, 8)}${String(i + 1).padStart(2, "0")}`)];

  return (
    <div>
      <p className="mb-2 text-[12px] font-medium capitalize text-zinc-700">{monthLabel.format(noon(first))}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((d) => (
          <span key={d} className="text-[10px] text-zinc-400">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`x${i}`} />;
          const done = doneDates.has(date);
          const isToday = date === today;
          const future = date > today;
          return (
            <span
              key={date}
              title={done ? "Latihan selesai" : undefined}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] tabular-nums ${
                done ? "bg-zinc-900 text-white" : future ? "text-zinc-300" : "text-zinc-500"
              } ${isToday ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}
            >
              {done ? <Check size={11} weight="bold" /> : Number(date.slice(8))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
