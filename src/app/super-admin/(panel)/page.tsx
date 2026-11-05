"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/app/utils/api";
import { currentPeriod, INVOICE_STATUS_LABEL, superAdminService, type HangingBooking, type Overview, type OverviewClinic } from "@/services/superAdminService";
import { PAYMENT_FILTER_OPTIONS, type PaymentFilter } from "@/lib/paymentMethod";
import { EmptyState, inputClass, MetricStrip, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

// Angka satu baris klinik sesuai metode pembayaran yang dipilih
function figuresOf(row: OverviewClinic, filter: PaymentFilter) {
  if (filter === "cash") return { bookings: row.bookingsCash, gross: row.grossCash, commission: row.commissionCash };
  if (filter === "xendit") return { bookings: row.bookingsXendit, gross: row.grossXendit, commission: row.commissionXendit };
  return { bookings: row.completedBookings, gross: row.gross, commission: row.commissionCash + row.commissionXendit };
}

export default function SuperAdminOverviewPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [hanging, setHanging] = useState<HangingBooking[]>([]);
  const [error, setError] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

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
          { label: "Pendapatan platform", value: formatRupiah(totals?.platformRevenue ?? 0), hint: `Komisi non tunai ${formatRupiah(totals?.commissionXendit ?? 0)} · tunai ${formatRupiah(totals?.commissionCash ?? 0)}` },
          { label: "Omzet tunai", value: formatRupiah(totals?.grossCash ?? 0), hint: `${totals?.bookingsCash ?? 0} booking` },
          { label: "Omzet non tunai", value: formatRupiah(totals?.grossXendit ?? 0), hint: `${totals?.bookingsXendit ?? 0} booking` },
          { label: "Booking selesai", value: totals?.completedBookings ?? 0, hint: `Omzet klinik ${formatRupiah(totals?.gross ?? 0)}` },
        ]}
      />

      <Panel
        title="Per klinik"
        description="Booking menggantung dan Tidak Hadir otomatis perlu dicek: bisa jadi tanda sesi tunai yang tidak ditutup."
        actions={
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)} aria-label="Filter metode pembayaran" className={`${inputClass} w-[170px]! shrink-0`}>
            {PAYMENT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      >
        {overview && overview.clinics.length === 0 ? (
          <EmptyState title="Belum ada klinik" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Klinik</th>
                  <th className="px-4 py-2 text-right font-medium">Selesai</th>
                  <th className="px-4 py-2 text-right font-medium">Omzet</th>
                  <th className="px-4 py-2 text-right font-medium">Komisi</th>
                  <th className="px-4 py-2 text-right font-medium">Hak klinik periode ini</th>
                  <th className="px-4 py-2 text-right font-medium">Belum disetor</th>
                  <th className="px-4 py-2 font-medium">Invoice</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Menggantung</th>
                  <th className="px-4 py-2 text-right font-medium">Tidak hadir otomatis</th>
                </tr>
              </thead>
              <tbody>
                {overview?.clinics.map((row, index) => (
                  <Fragment key={row.clinicId}>
                  {overview.clinics[index - 1]?.groupId !== row.groupId && overview.clinics.filter((c) => c.groupId === row.groupId).length > 1 && (
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <td colSpan={10} className="px-4 py-1.5 text-[12px] font-medium text-zinc-600">
                        {row.groupName} · {overview.clinics.filter((c) => c.groupId === row.groupId).length} cabang · omzet {formatRupiah(overview.clinics.filter((c) => c.groupId === row.groupId).reduce((total, c) => total + c.gross, 0))} · <span className="font-mono">/k/{row.groupSlug}</span>
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <Link href={`/super-admin/klinik/${row.clinicId}?period=${period}`} className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                        {row.brand}
                      </Link>
                      <span className="block text-[11px] text-zinc-400">/k/{row.slug}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{figuresOf(row, paymentFilter).bookings}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(figuresOf(row, paymentFilter).gross)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(figuresOf(row, paymentFilter).commission)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.owedToClinic)}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.outstandingToClinic !== 0 ? "font-medium text-zinc-900" : "text-zinc-500"}`}>{formatRupiah(row.outstandingToClinic)}</td>
                    <td className="px-4 py-2.5 text-zinc-600">
                      {row.invoiceStatus ? INVOICE_STATUS_LABEL[row.invoiceStatus] : "—"}
                      {row.overdueInvoices > 0 && <span className="block text-[11px] font-medium text-red-700">{row.overdueInvoices} telat</span>}
                    </td>
                    <td className="px-4 py-2.5">{row.billingStatus === "suspended" ? <span className="font-medium text-red-700">Suspend</span> : <span className="text-zinc-600">Aktif</span>}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.hangingBookings > 0 ? "font-medium text-red-700" : "text-zinc-500"}`}>{row.hangingBookings}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.autoNoShowBookings > 0 ? "font-medium text-amber-700" : "text-zinc-500"}`}>{row.autoNoShowBookings}</td>
                  </tr>
                  </Fragment>
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
