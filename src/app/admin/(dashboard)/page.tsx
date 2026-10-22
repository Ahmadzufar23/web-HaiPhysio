"use client";

import { useEffect, useState } from "react";
import { genderLabel } from "@/constants/patient";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { clinicService } from "@/services/clinicService";
import type { ClinicReport, DashboardData, DashboardPeriod } from "@/types/api.types";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { EmptyState, linkClass, MetricStrip, PageHeader, Panel, StatusBadge, tableHead } from "@/components/admin/shared/AdminUI";
import { formatDate, formatHours, formatRupiah, formatSlotTime } from "@/lib/format";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu ini" },
  { value: "month", label: "Bulan ini" },
];

const REFRESH_MS = 60_000;

function PeriodFilter({ value, onChange }: { value: DashboardPeriod; onChange: (p: DashboardPeriod) => void }) {
  return (
    <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5" role="tablist" aria-label="Periode">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          role="tab"
          aria-selected={value === p.value}
          onClick={() => onChange(p.value)}
          className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${value === p.value ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useStaffUser();
  const isOwner = user.role === "owner";
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [data, setData] = useState<DashboardData | null>(null);
  const [report, setReport] = useState<ClinicReport | null>(null);
  // Data yang tampil berasal dari periode mana; beda = sedang memuat
  const loading = data?.period !== period;

  useEffect(() => {
    let alive = true;
    const load = () =>
      clinicService
        .getDashboard(period)
        .then(async (res) => {
          // Rincian per terapis (owner) memakai rentang yang sama dengan dashboard
          const rep = isOwner ? await clinicService.getReport({ date_from: res.data.range.from, date_to: res.data.range.to }) : null;
          if (!alive) return;
          setData(res.data);
          setReport(rep?.data ?? null);
        })
        .catch((error) => console.error("Gagal memuat ringkasan:", error));
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [period, isOwner]);

  const c = data?.counts;
  const metrics = [
    { label: "Jadwal terapi", value: c?.total ?? 0, hint: c ? `${c.waiting} menunggu · ${c.inProgress} berlangsung` : undefined },
    { label: "Selesai", value: c?.completed ?? 0 },
    { label: "Cancel", value: c?.cancelled ?? 0, hint: "Dibatalkan + tidak hadir" },
    isOwner ? { label: "Pendapatan", value: formatRupiah(data?.revenue ?? 0) } : { label: "Menunggu", value: c?.waiting ?? 0 },
  ];
  const showDate = period !== "today";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Ringkasan"
        description={
          data
            ? `${isOwner ? "Seluruh klinik" : "Jadwal terapi kamu"} · ${data.range.from === data.range.to ? formatDate(data.range.from) : `${formatDate(data.range.from)} – ${formatDate(data.range.to)}`}`
            : undefined
        }
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <MetricStrip items={metrics} loading={loading} />

      <Panel title="Jadwal terapi" actions={<Link href="/admin/booking" className={linkClass}>Semua booking</Link>}>
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
        ) : !data || data.sessions.length === 0 ? (
          <EmptyState title="Belum ada jadwal terapi pada periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">{showDate ? "Jadwal" : "Jam"}</th>
                  <th className="px-4 py-2 font-medium">Pasien</th>
                  <th className="px-4 py-2 font-medium">Jenis kelamin</th>
                  <th className="px-4 py-2 font-medium">Paket</th>
                  <th className="px-4 py-2 font-medium">Terapis</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id} className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5 tabular-nums text-zinc-700">
                      {showDate ? `${formatDate(s.date)}, ` : ""}
                      {formatSlotTime(s.startTime)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/sesi/${s.id}`} className="font-medium text-zinc-900 hover:underline">
                        {s.patientName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{genderLabel(s.patientGender) ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{s.packageName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{s.therapistName}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="pr-3 text-right">
                      <Link href={`/admin/sesi/${s.id}`} aria-label={`Buka sesi ${s.patientName}`} className="inline-flex p-1 text-zinc-300 group-hover:text-zinc-600">
                        <CaretRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {isOwner && (
        <Panel title="Per terapis" actions={<Link href="/admin/laporan" className={linkClass}>Keuangan & absensi</Link>}>
          {!report || report.therapists.length === 0 ? (
            <EmptyState title="Belum ada jadwal atau sesi selesai pada periode ini" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[13px]">
                <thead>
                  <tr className={tableHead}>
                    <th className="px-4 py-2 font-medium">Terapis</th>
                    <th className="px-4 py-2 text-right font-medium">Hari hadir</th>
                    <th className="px-4 py-2 text-right font-medium">Jam kerja</th>
                    <th className="px-4 py-2 text-right font-medium">Sesi selesai</th>
                    <th className="px-4 py-2 text-right font-medium">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {report.therapists.map((t) => (
                    <tr key={t.therapistId} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-2.5 text-zinc-900">
                        {t.therapistName}
                        {t.isOwner && <span className="text-zinc-400"> · Owner</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{t.daysPresent}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatHours(t.workMinutes)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{t.sessions}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(t.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
