"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/app/utils/api";
import { currentPeriod, INVOICE_STATUS_LABEL, superAdminService, type HangingBooking, type Overview } from "@/services/superAdminService";
import { EmptyState, inputClass, MetricStrip, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

export default function SuperAdminOverviewPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [hanging, setHanging] = useState<HangingBooking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([superAdminService.getOverview(period), superAdminService.listHanging()])
      .then(([overviewRes, hangingRes]) => {
        if (cancelled) return;
        setError("");
        setOverview(overviewRes.data);
        setHanging(hangingRes.data.bookings);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Data gagal dimuat."));
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    setOverview(null);
    setPeriod(event.target.value);
  };

  const totals = overview?.totals;

  return (
    <>
      <PageHeader
        title="Ringkasan platform"
        description="Rekap transaksi dan tagihan semua klinik per bulan."
        actions={
          <label className="flex items-center gap-2 text-[12px] text-zinc-600">
            Periode
            <input type="month" value={period} onChange={handlePeriodChange} className={`${inputClass} w-[150px]`} />
          </label>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}

      <MetricStrip
        loading={!overview && !error}
        items={[
          { label: "Pendapatan platform", value: formatRupiah(totals?.platformRevenue ?? 0) },
          { label: "Komisi via Xendit", value: formatRupiah(totals?.commissionXendit ?? 0) },
          { label: "Komisi tunai", value: formatRupiah(totals?.commissionCash ?? 0) },
          { label: "Booking selesai", value: totals?.completedBookings ?? 0, hint: `Omzet klinik ${formatRupiah(totals?.gross ?? 0)}` },
        ]}
      />

      <Panel title="Per klinik" description="Booking menggantung dan Tidak Hadir otomatis perlu dicek: bisa jadi tanda sesi tunai yang tidak ditutup.">
        {overview && overview.clinics.length === 0 ? (
          <EmptyState title="Belum ada klinik" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Klinik</th>
                  <th className="px-4 py-2 text-right font-medium">Selesai</th>
                  <th className="px-4 py-2 text-right font-medium">Omzet</th>
                  <th className="px-4 py-2 text-right font-medium">Komisi Xendit</th>
                  <th className="px-4 py-2 text-right font-medium">Komisi tunai</th>
                  <th className="px-4 py-2 text-right font-medium">Setor ke klinik</th>
                  <th className="px-4 py-2 font-medium">Invoice</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Menggantung</th>
                  <th className="px-4 py-2 text-right font-medium">Tidak hadir otomatis</th>
                </tr>
              </thead>
              <tbody>
                {overview?.clinics.map((row) => (
                  <tr key={row.clinicId} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <Link href={`/super-admin/klinik/${row.clinicId}?period=${period}`} className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                        {row.brand}
                      </Link>
                      <span className="block text-[11px] text-zinc-400">/k/{row.slug}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.completedBookings}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.gross)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.commissionXendit)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.commissionCash)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.owedToClinic)}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{row.invoiceStatus ? INVOICE_STATUS_LABEL[row.invoiceStatus] : "—"}</td>
                    <td className="px-4 py-2.5">{row.billingStatus === "suspended" ? <span className="font-medium text-red-700">Suspend</span> : <span className="text-zinc-600">Aktif</span>}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.hangingBookings > 0 ? "font-medium text-red-700" : "text-zinc-500"}`}>{row.hangingBookings}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.autoNoShowBookings > 0 ? "font-medium text-amber-700" : "text-zinc-500"}`}>{row.autoNoShowBookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {hanging.length > 0 && (
        <Panel title="Booking menggantung" description="Sudah lewat jadwal lebih dari 3 hari, tapi belum selesai atau batal.">
          <ul className="divide-y divide-zinc-100 text-[13px]">
            {hanging.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="font-medium text-zinc-900">{booking.brand}</span>
                <span className="font-mono text-[12px] text-zinc-500">{booking.referenceCode}</span>
                <span className="text-zinc-600">
                  {booking.slotDate} · {booking.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
