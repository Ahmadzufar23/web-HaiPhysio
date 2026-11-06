"use client";

import { EmptyState, MetricStrip, Notice, Panel } from "@/components/admin/shared/AdminUI";
import { financeService } from "@/services/financeService";
import { EXPENSE_CATEGORIES, type CashbookEntry } from "@/types/finance.types";
import { formatDate, formatRupiah } from "@/lib/format";
import DownloadButton from "./DownloadButton";
import { useFinanceData } from "./useFinanceData";

const INCOME_SOURCE_LABEL: Record<string, string> = { sesi: "Sesi terapi" };

const sourceLabel = (e: CashbookEntry) =>
  e.kind === "pemasukan" ? (INCOME_SOURCE_LABEL[e.source ?? ""] ?? "Pemasukan") : (EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category ?? "Pengeluaran");

/** Buku kas: pemasukan (sesi selesai) dan pengeluaran klinik dalam satu daftar */
export default function CashbookPanel({ dateFrom, dateTo, version }: { dateFrom: string; dateTo: string; version: number }) {
  const query = { date_from: dateFrom, date_to: dateTo };
  const book = useFinanceData(`${dateFrom}|${dateTo}|${version}`, async () => (await financeService.getCashbook(query)).data);
  const totals = book.data?.totals;

  return (
    <div className="flex flex-col gap-4">
      <MetricStrip
        loading={!book.data}
        items={[
          { label: "Pemasukan", value: formatRupiah(totals?.income ?? 0), hint: "Dari sesi terapi yang Selesai" },
          { label: "Pengeluaran", value: formatRupiah(totals?.expense ?? 0) },
          { label: "Selisih", value: formatRupiah(totals?.net ?? 0), hint: "Belum dikurangi gaji terapis" },
        ]}
      />
      {book.error && <Notice tone="error">{book.error}</Notice>}

      <Panel
        title="Rekap harian"
        description="Selisih per hari dan akumulasinya sejak awal periode."
        actions={<DownloadButton label="Unduh Excel keuangan" onDownload={() => financeService.downloadFinance(query)} disabled={!book.data} />}
      >
        {!book.data || book.data.daily.length === 0 ? (
          <EmptyState title="Belum ada pemasukan atau pengeluaran pada periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pemasukan</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pengeluaran</th>
                  <th className="px-4 py-2.5 text-right font-medium">Selisih</th>
                  <th className="px-4 py-2.5 text-right font-medium">Akumulasi</th>
                </tr>
              </thead>
              <tbody>
                {book.data.daily.map((d) => (
                  <tr key={d.date} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 tabular-nums text-zinc-700">{formatDate(d.date)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(d.income)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(d.expense)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${d.net < 0 ? "text-red-700" : "text-zinc-900"}`}>{formatRupiah(d.net)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${d.runningBalance < 0 ? "text-red-700" : "text-zinc-600"}`}>{formatRupiah(d.runningBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Semua transaksi" description="Pemasukan tercatat otomatis saat sesi Selesai. Pengeluaran dicatat di tab Pengeluaran.">
        {!book.data || book.data.entries.length === 0 ? (
          <EmptyState title="Belum ada transaksi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Sumber / kategori</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pemasukan</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {book.data.entries.map((e, i) => (
                  <tr key={`${e.at}-${i}`} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 tabular-nums text-zinc-700">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-zinc-900">{sourceLabel(e)}</td>
                    <td className="px-4 py-3 text-zinc-600">{e.description || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{e.kind === "pemasukan" ? formatRupiah(e.amount) : ""}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{e.kind === "pengeluaran" ? formatRupiah(e.amount) : ""}</td>
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
