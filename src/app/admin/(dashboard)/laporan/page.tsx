"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { ClinicReport } from "@/types/api.types";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { EmptyState, inputClass, MetricStrip, PageHeader, Panel } from "@/components/admin/shared/AdminUI";
import AttendancePanel from "@/components/admin/laporan/AttendancePanel";
import { formatDateTime, formatHours, formatRupiah, todayWib } from "@/lib/format";

/** "1 sakit · 2 izin" dari ringkasan absensi; "—" bila tidak ada */
const absenceLabel = (t: ClinicReport["therapists"][number]) =>
  [t.daysSick && `${t.daysSick} sakit`, t.daysLeave && `${t.daysLeave} izin`, t.daysAbsent && `${t.daysAbsent} tidak hadir`].filter(Boolean).join(" · ") || "—";

export default function ReportPage() {
  const user = useStaffUser();
  const router = useRouter();
  const today = todayWib();
  const [from, setFrom] = useState(`${today.slice(0, 7)}-01`);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState<ClinicReport | null>(null);
  const [error, setError] = useState("");
  // Naik setiap absensi ditandai → muat ulang tanpa mengosongkan tampilan
  const [version, setVersion] = useState(0);
  // Periode yang datanya sedang tampil; beda dengan periode aktif = masih memuat
  const rangeKey = `${from}|${to}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== rangeKey;

  useEffect(() => {
    if (user.role !== "owner") {
      router.replace("/admin");
      return;
    }
    if (!from || !to || from > to) return;
    clinicService
      .getReport({ date_from: from, date_to: to })
      .then((res) => {
        setReport(res.data);
        setError("");
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoadedKey(`${from}|${to}`));
  }, [from, to, version, user.role, router]);

  const totals = report?.totals;
  const workMinutes = report?.therapists.reduce((sum, t) => sum + t.workMinutes, 0) ?? 0;
  const unmarked = report?.attendanceDays.filter((d) => d.status === "belum_ditandai").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Keuangan & Absensi"
        description="Pendapatan dan absensi tercatat saat terapis menekan Selesai. Hari tanpa pasien, sakit, atau izin ditandai owner."
        actions={
          <div className="flex items-center gap-2 text-[13px] text-brand-900/60">
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} w-[150px]`} aria-label="Dari tanggal" />
            <span>s.d.</span>
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={`${inputClass} w-[150px]`} aria-label="Sampai tanggal" />
          </div>
        }
      />

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">{error}</p>}

      <MetricStrip
        loading={loading}
        items={[
          {
            label: "Pendapatan",
            value: formatRupiah(totals?.revenue ?? 0),
            hint: totals?.sessionsWithoutPrice ? `${totals.sessionsWithoutPrice} sesi tanpa harga` : undefined,
          },
          { label: "Sesi selesai", value: totals?.completedSessions ?? 0 },
          { label: "Jam kerja staf", value: formatHours(workMinutes), hint: "Jam slot terjadwal di hari hadir" },
          { label: "Absensi belum ditandai", value: unmarked, hint: unmarked ? "Tandai di Absensi harian" : undefined },
        ]}
      />

      <Panel title="Per terapis">
        {!report || report.therapists.length === 0 ? (
          <EmptyState title="Belum ada data pada periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-2 text-[12px] text-brand-900/55">
                  <th className="px-5 py-2.5 font-medium">Terapis</th>
                  <th className="px-5 py-2.5 text-right font-medium">Hari hadir</th>
                  <th className="px-5 py-2.5 font-medium">Tidak masuk</th>
                  <th className="px-5 py-2.5 text-right font-medium">Jam kerja</th>
                  <th className="px-5 py-2.5 text-right font-medium">Jam terapi</th>
                  <th className="px-5 py-2.5 text-right font-medium">Sesi selesai</th>
                  <th className="px-5 py-2.5 text-right font-medium">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {report.therapists.map((t) => (
                  <tr key={t.therapistId} className="border-b border-surface-2 last:border-0">
                    <td className="px-5 py-3 font-medium text-brand-900">
                      {t.therapistName}
                      {t.isOwner && <span className="font-normal text-zinc-400"> · Owner</span>}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {t.daysPresent}
                      {t.daysNoPatient > 0 && <span className="text-zinc-400"> ({t.daysNoPatient} tanpa pasien)</span>}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{absenceLabel(t)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatHours(t.workMinutes)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-zinc-600">{formatHours(t.therapyMinutes)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{t.sessions}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatRupiah(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AttendancePanel days={report?.attendanceDays ?? null} onChanged={() => setVersion((v) => v + 1)} />

      <Panel title="Pencatatan pendapatan" description="Satu baris per sesi selesai">
        {!report || report.revenue.length === 0 ? (
          <EmptyState title="Belum ada pendapatan tercatat" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-2 text-[12px] text-brand-900/55">
                  <th className="px-5 py-2.5 font-medium">Waktu</th>
                  <th className="px-5 py-2.5 font-medium">Pasien · paket</th>
                  <th className="px-5 py-2.5 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {report.revenue.map((r) => (
                  <tr key={r.bookingId} className="border-b border-surface-2 last:border-0">
                    <td className="px-5 py-3 tabular-nums text-brand-900/70">{formatDateTime(r.recordedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="text-brand-900">{r.patientName}</div>
                      <div className="text-[12px] text-brand-900/50">
                        {r.packageName ?? "Tanpa paket"} · {r.therapistName}
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-right tabular-nums ${r.amount === 0 ? "text-zinc-400" : "text-zinc-900"}`}>{formatRupiah(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
