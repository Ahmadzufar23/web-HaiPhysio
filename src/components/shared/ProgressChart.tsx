"use client";

import { useState } from "react";
import type { ProgressPoint } from "@/types/api.types";
import { formatDate } from "@/lib/format";

// Warna seri tervalidasi (dataviz validate_palette, light): sebelum = oranye, sesudah = biru.
// Garis "sebelum" juga putus-putus supaya identitas tidak bergantung warna saja.
const SERIES = [
  { key: "painBefore", label: "Sebelum terapi", color: "#eb6834", dash: "5 4" },
  { key: "painAfter", label: "Sesudah terapi", color: "#2a78d6", dash: undefined },
] as const;

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 34, left: 30 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const y = (v: number) => PAD.top + plotH - (v / 10) * plotH;

/** Tren nyeri VAS 0–10 per sesi (sumbu tunggal), dengan tooltip saat titik disentuh. */
export function PainTrendChart({ points }: { points: ProgressPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = points.filter((p) => p.painBefore !== null || p.painAfter !== null);
  if (data.length === 0) {
    return <p className="py-6 text-center text-[12px] text-zinc-500">Belum ada pengukuran nyeri (VAS) di sesi mana pun.</p>;
  }

  const x = (i: number) => PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const pathOf = (key: (typeof SERIES)[number]["key"]) =>
    data
      .map((p, i) => ({ v: p[key], i }))
      .filter((d): d is { v: number; i: number } => d.v !== null)
      .map((d, n) => `${n === 0 ? "M" : "L"}${x(d.i).toFixed(1)},${y(d.v).toFixed(1)}`)
      .join(" ");
  // Label sumbu x dijarangkan supaya tidak bertumpuk
  const step = Math.ceil(data.length / 6);
  const hovered = hover !== null ? data[hover] : null;

  return (
    <figure className="m-0">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-zinc-600" aria-hidden>
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <svg width="18" height="6">
              <line x1="0" y1="3" x2="18" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
            </svg>
            {s.label}
          </span>
        ))}
        <span className="text-zinc-400">Skala 0 (tidak nyeri) – 10 (terberat)</span>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Grafik nyeri sebelum dan sesudah terapi per sesi" onMouseLeave={() => setHover(null)}>
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#e4e4e7" strokeWidth="1" />
              <text x={PAD.left - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#71717a">
                {v}
              </text>
            </g>
          ))}
          {data.map((p, i) =>
            i % step === 0 || i === data.length - 1 ? (
              <text key={p.bookingId} x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="#71717a">
                {formatDate(p.date).replace(/ \d{4}$/, "")}
              </text>
            ) : null
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="#a1a1aa" strokeWidth="1" />}
          {SERIES.map((s) => (
            <path key={s.key} d={pathOf(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {SERIES.map((s) =>
            data.map((p, i) =>
              p[s.key] === null ? null : (
                <circle key={`${s.key}-${p.bookingId}`} cx={x(i)} cy={y(p[s.key] as number)} r={hover === i ? 5 : 4} fill={s.color} stroke="#fff" strokeWidth="2" />
              )
            )
          )}
          {/* Area sentuh per sesi, lebih lebar dari titiknya */}
          {data.map((p, i) => (
            <rect
              key={`hit-${p.bookingId}`}
              x={x(i) - plotW / Math.max(data.length, 2) / 2}
              y={PAD.top}
              width={plotW / Math.max(data.length, 2)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onClick={() => setHover(i)}
            />
          ))}
        </svg>
        {hovered && hover !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] shadow-sm"
            style={{ left: `${(x(hover) / W) * 100}%` }}
          >
            <p className="font-medium text-zinc-900">{formatDate(hovered.date)}</p>
            <p className="text-zinc-600">Sebelum: {hovered.painBefore ?? "—"} · Sesudah: {hovered.painAfter ?? "—"}</p>
          </div>
        )}
      </div>
    </figure>
  );
}

const romKey = (r: { joint: string; movement: string; side: string }) => `${r.joint}|${r.movement}|${r.side}`;

/** ROM per sendi/gerakan (baris) per sesi (kolom), dalam derajat. */
export function RomTable({ points }: { points: ProgressPoint[] }) {
  const sessions = points.filter((p) => p.rom.length > 0);
  if (sessions.length === 0) {
    return <p className="py-4 text-center text-[12px] text-zinc-500">Belum ada pengukuran ROM.</p>;
  }
  const rows = [...new Map(sessions.flatMap((p) => p.rom.map((r) => [romKey(r), r] as const))).values()];
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-[12px]">
        <thead>
          <tr className="border-b border-zinc-200 text-[11px] text-zinc-500">
            <th className="py-1.5 pr-3 font-medium">Sendi · gerakan</th>
            {sessions.map((p) => (
              <th key={p.bookingId} className="px-2 py-1.5 text-right font-medium tabular-nums">
                {formatDate(p.date).replace(/ \d{4}$/, "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={romKey(r)} className="border-b border-zinc-100 last:border-0">
              <td className="py-1.5 pr-3 text-zinc-800">
                {r.joint} · {r.movement}
                {r.side !== "-" && <span className="text-zinc-500"> ({r.side})</span>}
              </td>
              {sessions.map((p) => {
                const m = p.rom.find((x) => romKey(x) === romKey(r));
                return (
                  <td key={p.bookingId} className="px-2 py-1.5 text-right tabular-nums text-zinc-900">
                    {m ? `${m.degrees}°` : <span className="text-zinc-300">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tabel nyeri per sesi: tampilan teks dari grafik (aksesibilitas & cetak) */
export function PainTable({ points }: { points: ProgressPoint[] }) {
  const data = points.filter((p) => p.painBefore !== null || p.painAfter !== null);
  if (data.length === 0) return null;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-[12px]">
        <thead>
          <tr className="border-b border-zinc-200 text-[11px] text-zinc-500">
            <th className="py-1.5 pr-3 font-medium">Tanggal</th>
            <th className="px-2 py-1.5 text-right font-medium">Nyeri sebelum</th>
            <th className="px-2 py-1.5 text-right font-medium">Nyeri sesudah</th>
            <th className="py-1.5 pl-2 font-medium">Terapis</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.bookingId} className="border-b border-zinc-100 last:border-0">
              <td className="py-1.5 pr-3 text-zinc-800">{formatDate(p.date)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{p.painBefore ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{p.painAfter ?? "—"}</td>
              <td className="py-1.5 pl-2 text-zinc-600">{p.therapistName ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Panel progres: grafik nyeri (atau tabelnya) + tabel ROM */
export default function ProgressPanel({ points }: { points: ProgressPoint[] }) {
  const [view, setView] = useState<"grafik" | "tabel">("grafik");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-[12px] font-medium text-zinc-700">Nyeri (VAS)</h3>
          <div className="inline-flex rounded-md border border-zinc-200 p-0.5 text-[11px]" role="tablist">
            {(["grafik", "tabel"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded px-2 py-0.5 capitalize ${view === v ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {view === "grafik" ? <PainTrendChart points={points} /> : <PainTable points={points} />}
      </div>
      <div>
        <h3 className="mb-2 text-[12px] font-medium text-zinc-700">Lingkup gerak sendi (ROM)</h3>
        <RomTable points={points} />
      </div>
    </div>
  );
}
