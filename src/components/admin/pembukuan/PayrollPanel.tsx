"use client";

import { useState } from "react";
import { btn, EmptyState, inputClass, MetricStrip, Notice, Panel } from "@/components/admin/shared/AdminUI";
import { getApiErrorMessage } from "@/app/utils/api";
import { financeService } from "@/services/financeService";
import type { CommissionType, PayrollRow } from "@/types/finance.types";
import { formatRupiah, todayWib } from "@/lib/format";
import DownloadButton from "./DownloadButton";
import { useFinanceData } from "./useFinanceData";

const COMMISSION_OPTIONS: { value: CommissionType; label: string }[] = [
  { value: "tidak_ada", label: "Tanpa komisi" },
  { value: "persen", label: "% dari harga sesi" },
  { value: "per_sesi", label: "Rp per sesi" },
];

function commissionRule(row: Pick<PayrollRow, "commissionType" | "commissionValue">) {
  if (row.commissionType === "persen") return `${row.commissionValue}% dari harga sesi`;
  if (row.commissionType === "per_sesi") return `${formatRupiah(row.commissionValue)} per sesi`;
  return "Tanpa komisi";
}

/** Form ubah gaji satu terapis (baris tabel) */
function PayEditor({ row, onDone }: { row: PayrollRow; onDone: (saved: boolean) => void }) {
  const [baseSalary, setBaseSalary] = useState(String(row.baseSalary));
  const [type, setType] = useState<CommissionType>(row.commissionType);
  const [value, setValue] = useState(row.commissionType === "tidak_ada" ? "" : String(row.commissionValue));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await financeService.savePaySetting(row.therapistId, {
        baseSalary: Number(baseSalary || 0),
        commissionType: type,
        commissionValue: type === "tidak_ada" ? 0 : Number(value.replace(",", ".") || 0),
      });
      onDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Pengaturan gaji gagal disimpan."));
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50/60 p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          Gaji pokok / bulan (Rp)
          <input inputMode="numeric" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value.replace(/\D/g, ""))} className={`${inputClass} tabular-nums`} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          Jenis komisi
          <select value={type} onChange={(e) => setType(e.target.value as CommissionType)} className={inputClass}>
            {COMMISSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          {type === "persen" ? "Persen (0–100)" : "Rupiah per sesi"}
          <input
            inputMode="decimal"
            value={value}
            disabled={type === "tidak_ada"}
            onChange={(e) => setValue(type === "persen" ? e.target.value.replace(/[^\d.,]/g, "") : e.target.value.replace(/\D/g, ""))}
            className={`${inputClass} tabular-nums`}
          />
        </label>
      </div>
      {error && <p className="text-[12px] text-red-700">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => onDone(false)} className={btn.secondary}>
          Batal
        </button>
        <button type="button" onClick={save} disabled={saving} className={btn.primary}>
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

/** Slip gaji bulanan: gaji pokok + komisi dari sesi Selesai, diatur owner per terapis */
export default function PayrollPanel() {
  const [month, setMonth] = useState(todayWib().slice(0, 7));
  const [editingId, setEditingId] = useState<string | null>(null);
  const payroll = useFinanceData(month || null, async () => (await financeService.getPayroll(month)).data);
  const totals = payroll.data?.totals;

  const finishEdit = (saved: boolean) => {
    setEditingId(null);
    if (saved) payroll.reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <MetricStrip
        loading={!payroll.data}
        items={[
          { label: "Total gaji pokok", value: formatRupiah(totals?.baseSalary ?? 0) },
          { label: "Total komisi", value: formatRupiah(totals?.commission ?? 0) },
          { label: "Total dibayar", value: formatRupiah(totals?.total ?? 0) },
        ]}
      />
      {payroll.error && <Notice tone="error">{payroll.error}</Notice>}

      <Panel
        title="Gaji & komisi terapis"
        description="Komisi dihitung dari sesi yang diselesaikan terapis itu pada bulan terpilih. Ubah aturan lewat tombol Atur."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Bulan" className={`${inputClass} w-[160px]!`} />
            <DownloadButton onDownload={() => financeService.downloadPayroll(month)} disabled={!payroll.data?.rows.length} />
          </div>
        }
      >
        {!payroll.data || payroll.data.rows.length === 0 ? (
          <EmptyState title="Belum ada terapis" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Terapis</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sesi</th>
                  <th className="px-4 py-2.5 text-right font-medium">Nilai sesi</th>
                  <th className="px-4 py-2.5 text-right font-medium">Gaji pokok</th>
                  <th className="px-4 py-2.5 font-medium">Aturan komisi</th>
                  <th className="px-4 py-2.5 text-right font-medium">Komisi</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {payroll.data.rows.map((r) =>
                  editingId === r.therapistId ? (
                    <tr key={r.therapistId} className="border-b border-zinc-100">
                      <td colSpan={8} className="px-4 py-3">
                        <p className="mb-2 text-[13px] font-medium text-zinc-900">{r.therapistName}</p>
                        <PayEditor row={r} onDone={finishEdit} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={r.therapistId} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {r.therapistName}
                        {r.isOwner && <span className="font-normal text-zinc-400"> · Owner</span>}
                        {r.status === "nonaktif" && <span className="font-normal text-zinc-400"> · Nonaktif</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.sessions}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-600">{formatRupiah(r.revenue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(r.baseSalary)}</td>
                      <td className="px-4 py-3 text-zinc-600">{commissionRule(r)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(r.commission)}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatRupiah(r.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setEditingId(r.therapistId)} disabled={editingId !== null} className={btn.secondary}>
                          Atur
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
