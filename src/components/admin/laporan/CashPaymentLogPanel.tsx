"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { EmptyState, Panel } from "@/components/admin/shared/AdminUI";
import { clinicService, type CashPaymentEntry } from "@/services/clinicService";
import { formatDateTime, formatRupiah } from "@/lib/format";

type Props = {
  dateFrom: string;
  dateTo: string;
};

// Bukti pembayaran tunai untuk owner: tidak bisa diubah atau dihapus dari aplikasi.
export default function CashPaymentLogPanel({ dateFrom, dateTo }: Props) {
  const [entries, setEntries] = useState<CashPaymentEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dateFrom || !dateTo || dateFrom > dateTo) return;
    let isCancelled = false;
    clinicService
      .getCashPayments({ date_from: dateFrom, date_to: dateTo })
      .then((res) => {
        if (isCancelled) return;
        setEntries(res.data.entries);
        setError("");
      })
      .catch((err) => {
        if (!isCancelled) setError(getApiErrorMessage(err, "Log pembayaran tunai gagal dimuat."));
      });
    return () => {
      isCancelled = true;
    };
  }, [dateFrom, dateTo]);

  const total = entries?.filter((entry) => !entry.isReversed).reduce((sum, entry) => sum + entry.amount, 0) ?? 0;

  return (
    <Panel title="Log pembayaran tunai" description={`Tercatat otomatis saat "Bayar tunai" ditekan, dan tidak bisa diubah. Total ${formatRupiah(total)}.`}>
      {error && <p className="px-5 py-3 text-[13px] text-red-700">{error}</p>}
      {!error && (!entries || entries.length === 0) && <EmptyState title="Belum ada pembayaran tunai pada periode ini" />}
      {entries && entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-surface-2 text-[12px] text-brand-900/55">
                <th className="px-5 py-2.5 font-medium">Waktu</th>
                <th className="px-5 py-2.5 font-medium">Pasien</th>
                <th className="px-5 py-2.5 font-medium">Terapis</th>
                <th className="px-5 py-2.5 font-medium">Dicatat oleh</th>
                <th className="px-5 py-2.5 text-right font-medium">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-surface-2 last:border-0">
                  <td className="px-5 py-3 tabular-nums text-brand-900/70">{formatDateTime(entry.recordedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="text-brand-900">{entry.patientName}</div>
                    <div className="text-[12px] text-brand-900/50">{entry.referenceCode}</div>
                  </td>
                  <td className="px-5 py-3 text-brand-900/70">{entry.therapistName}</td>
                  <td className="px-5 py-3 text-brand-900/70">{entry.recordedByName}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    <span className={entry.isReversed ? "text-zinc-400 line-through" : "text-zinc-900"}>{formatRupiah(entry.amount)}</span>
                    {entry.isReversed && <div className="text-[12px] font-medium text-red-700">Dibatalkan</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
