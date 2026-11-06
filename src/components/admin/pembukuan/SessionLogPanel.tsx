"use client";

import { useState } from "react";
import { EmptyState, inputClass, MetricStrip, Notice, Panel } from "@/components/admin/shared/AdminUI";
import { financeService } from "@/services/financeService";
import { formatClock, formatDate, formatRupiah } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/paymentMethod";
import DownloadButton from "./DownloadButton";
import { useFinanceData } from "./useFinanceData";

const durationLabel = (minutes: number | null) => (minutes === null ? "—" : `${minutes} mnt`);

/** Lama eksekusi per pasien: terapis, tanggal, durasi, pasien & akunnya, paket & harga */
export default function SessionLogPanel({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const [therapistId, setTherapistId] = useState("");
  const query = { date_from: dateFrom, date_to: dateTo, therapist_id: therapistId || undefined };
  const staff = useFinanceData("staff", async () => (await financeService.getPaySettings()).data.settings);
  const log = useFinanceData(`${dateFrom}|${dateTo}|${therapistId}`, async () => (await financeService.getSessionLog(query)).data);
  const totals = log.data?.totals;

  return (
    <div className="flex flex-col gap-4">
      <MetricStrip
        loading={!log.data}
        items={[
          { label: "Sesi selesai", value: totals?.sessions ?? 0 },
          { label: "Total waktu terapi", value: `${totals?.minutes ?? 0} mnt` },
          { label: "Rata-rata per pasien", value: totals?.averageMinutes == null ? "—" : `${totals.averageMinutes} mnt` },
          { label: "Nilai sesi", value: formatRupiah(totals?.revenue ?? 0) },
        ]}
      />
      {log.error && <Notice tone="error">{log.error}</Notice>}

      <Panel
        title="Eksekusi terapis per pasien"
        description="Durasi dihitung dari Start sampai Selesai. Harga sesuai yang tercatat saat sesi selesai."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)} aria-label="Filter terapis" className={`${inputClass} w-[190px]!`}>
              <option value="">Semua terapis</option>
              {staff.data?.map((s) => (
                <option key={s.therapistId} value={s.therapistId}>
                  {s.therapistName}
                  {s.isOwner ? " (Owner)" : ""}
                </option>
              ))}
            </select>
            <DownloadButton onDownload={() => financeService.downloadSessionLog(query)} disabled={!log.data?.sessions.length} />
          </div>
        }
      >
        {!log.data || log.data.sessions.length === 0 ? (
          <EmptyState title="Belum ada sesi selesai pada periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Terapis</th>
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Jam</th>
                  <th className="px-4 py-2.5 text-right font-medium">Durasi</th>
                  <th className="px-4 py-2.5 font-medium">Pasien</th>
                  <th className="px-4 py-2.5 font-medium">Paket</th>
                  <th className="px-4 py-2.5 text-right font-medium">Harga</th>
                </tr>
              </thead>
              <tbody>
                {log.data.sessions.map((s) => (
                  <tr key={s.bookingId} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-zinc-900">{s.therapistName}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-600">
                      {formatClock(s.startedAt)}–{formatClock(s.endedAt)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{durationLabel(s.durationMinutes)}</td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-900">{s.patientName}</div>
                      <div className="text-[12px] text-zinc-500">{s.patientEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{s.packageName ?? "Tanpa paket"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatRupiah(s.price)}
                      <div className="text-[11px] text-zinc-400">{paymentMethodLabel(s.paymentMethod)}</div>
                    </td>
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
