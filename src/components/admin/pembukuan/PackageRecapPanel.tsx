"use client";

import { EmptyState, MetricStrip, Notice, Panel } from "@/components/admin/shared/AdminUI";
import { financeService } from "@/services/financeService";
import { formatDate, formatRupiah } from "@/lib/format";
import DownloadButton from "./DownloadButton";
import { useFinanceData } from "./useFinanceData";

/** Pendapatan per paket (dihitung saat sesi Selesai), per tanggal, dikurangi pengeluaran */
export default function PackageRecapPanel({ dateFrom, dateTo, version }: { dateFrom: string; dateTo: string; version: number }) {
  const query = { date_from: dateFrom, date_to: dateTo };
  const recap = useFinanceData(`${dateFrom}|${dateTo}|${version}`, async () => (await financeService.getPackageRecap(query)).data);
  const totals = recap.data?.totals;

  return (
    <div className="flex flex-col gap-4">
      <MetricStrip
        loading={!recap.data}
        items={[
          { label: "Pendapatan sesi", value: formatRupiah(totals?.revenue ?? 0) },
          { label: "Pengeluaran", value: formatRupiah(totals?.expenses ?? 0) },
          { label: "Laba sebelum gaji", value: formatRupiah(totals?.profitBeforeSalary ?? 0), hint: "Gaji terapis ada di tab Gaji" },
          { label: "Sesi selesai", value: totals?.sessions ?? 0 },
        ]}
      />
      {recap.error && <Notice tone="error">{recap.error}</Notice>}

      <Panel
        title="Total per paket"
        description="Uang dihitung masuk saat sesi Selesai, sebesar harga per sesi paket."
        actions={<DownloadButton label="Unduh Excel keuangan" onDownload={() => financeService.downloadFinance(query)} disabled={!recap.data} />}
      >
        {!recap.data || recap.data.packages.length === 0 ? (
          <EmptyState title="Belum ada pendapatan pada periode ini" />
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Nama paket</th>
                <th className="px-4 py-2.5 text-right font-medium">Sesi</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recap.data.packages.map((p) => (
                <tr key={p.packageName} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.packageName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.sessions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Per tanggal" description="Berapa kali tiap paket dijalankan per hari.">
        {!recap.data || recap.data.daily.length === 0 ? (
          <EmptyState title="Belum ada data" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Nama paket</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sesi</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {recap.data.daily.map((d) => (
                  <tr key={`${d.date}-${d.packageName}`} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 tabular-nums text-zinc-700">{formatDate(d.date)}</td>
                    <td className="px-4 py-3 text-zinc-900">{d.packageName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{d.sessions}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(d.revenue)}</td>
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
