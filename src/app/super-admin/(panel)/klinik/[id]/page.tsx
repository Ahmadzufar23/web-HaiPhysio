"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getApiErrorMessage } from "@/app/utils/api";
import { currentPeriod, INVOICE_STATUS_LABEL, superAdminService, type ClinicDetails, type ClinicTransactions } from "@/services/superAdminService";
import { AccountsPanel, BookingsPanel, PackagesPanel, ProfilePanel } from "@/components/super-admin/ClinicInfoPanels";
import { btn, EmptyState, inputClass, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

const LEDGER_STATUS_LABEL = { settled_auto: "Otomatis", unbilled: "Belum ditagih", billed: "Ditagih", paid: "Lunas" } as const;
const METHOD_LABEL = { cash: "Tunai", xendit: "Xendit" } as const;

const TABS = [
  { key: "tagihan", label: "Tagihan & transaksi" },
  { key: "akun", label: "Akun & terapis" },
  { key: "harga", label: "Harga paket" },
  { key: "booking", label: "Booking" },
  { key: "profil", label: "Profil klinik" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(searchParams.get("period") ?? currentPeriod());
  const [data, setData] = useState<ClinicTransactions | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [commission, setCommission] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [overrideUntil, setOverrideUntil] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tab, setTab] = useState<TabKey>("tagihan");
  const [details, setDetails] = useState<ClinicDetails | null>(null);

  const loadDetails = useCallback(async () => {
    const res = await superAdminService.getDetails(id);
    setDetails(res.data);
  }, [id]);

  useEffect(() => {
    superAdminService
      .getDetails(id)
      .then((res) => setDetails(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Data klinik gagal dimuat.")));
  }, [id]);

  const load = useCallback(async () => {
    const res = await superAdminService.getTransactions(id, period);
    setData(res.data);
    setCommission(String(res.data.clinic.commissionAmount));
  }, [id, period]);

  useEffect(() => {
    superAdminService
      .getTransactions(id, period)
      .then((res) => {
        setData(res.data);
        setCommission(String(res.data.clinic.commissionAmount));
      })
      .catch((err) => setError(getApiErrorMessage(err, "Data gagal dimuat.")));
  }, [id, period]);

  const run = async (action: () => Promise<unknown>, doneMessage: string) => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await action();
      await load();
      setInfo(doneMessage);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReverse = (bookingId: string, referenceCode: string) => {
    const reason = window.prompt(`Alasan membatalkan booking ${referenceCode}? Komisinya dibalik, entri lama tetap ada.`);
    if (reason?.trim()) void run(() => superAdminService.reverseBooking(bookingId, reason.trim()), `Booking ${referenceCode} dibatalkan.`);
  };

  if (!data) {
    return error ? <Notice tone="error">{error}</Notice> : <p className="text-[13px] text-zinc-500">Memuat…</p>;
  }

  const { clinic, invoice, transactions } = data;
  const isSuspended = clinic.billingStatus === "suspended";

  return (
    <>
      <PageHeader
        title={clinic.brand}
        description={`Link klinik: /k/${clinic.slug}`}
        actions={
          <label className="flex items-center gap-2 text-[12px] text-zinc-600">
            Periode
            <input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} className={`${inputClass} w-[150px]`} />
          </label>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}

      <div className="flex flex-wrap gap-1 border-b border-zinc-200" role="tablist" aria-label="Bagian klinik">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-[13px] ${tab === item.key ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-600 hover:text-zinc-900"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "akun" && details && <AccountsPanel details={details} />}
      {tab === "harga" && details && <PackagesPanel details={details} />}
      {tab === "booking" && <BookingsPanel clinicId={id} period={period} />}
      {tab === "profil" && details && <ProfilePanel details={details} onSaved={loadDetails} />}

      {tab === "tagihan" && (
      <>
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Komisi per booking" description="Berlaku untuk booking berikutnya. Entri lama tidak berubah." bodyClassName="flex flex-col gap-2 p-4">
          <input inputMode="numeric" value={commission} onChange={(e) => setCommission(e.target.value.replace(/\D/g, ""))} aria-label="Komisi per booking dalam rupiah" className={inputClass} />
          <button
            type="button"
            className={btn.secondary}
            disabled={busy || Number(commission) === clinic.commissionAmount}
            onClick={() => run(() => superAdminService.updateCommission(id, Number(commission)), "Komisi diperbarui.")}
          >
            Simpan komisi
          </button>
        </Panel>

        <Panel title={isSuspended ? "Klinik di-suspend" : "Suspend klinik"} description="Hanya memblokir booking baru." bodyClassName="flex flex-col gap-2 p-4">
          {isSuspended ? (
            <>
              <p className="text-[12px] text-zinc-600">{clinic.suspendSource === "auto" ? "Otomatis karena tagihan telat." : "Di-suspend manual."}</p>
              <label className="flex flex-col gap-1 text-[12px] text-zinc-600">
                Job tidak men-suspend lagi sampai (opsional)
                <input type="date" value={overrideUntil} onChange={(e) => setOverrideUntil(e.target.value)} className={inputClass} />
              </label>
              <button type="button" className={btn.secondary} disabled={busy} onClick={() => run(() => superAdminService.unsuspend(id, overrideUntil || undefined), "Suspend dibuka.")}>
                Buka suspend
              </button>
            </>
          ) : (
            <>
              <input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Alasan suspend" aria-label="Alasan suspend" className={inputClass} />
              <button
                type="button"
                className={btn.danger}
                disabled={busy || suspendReason.trim().length < 3}
                onClick={() =>
                  run(async () => {
                    await superAdminService.suspend(id, suspendReason.trim());
                    setSuspendReason("");
                  }, "Klinik di-suspend.")
                }
              >
                Suspend
              </button>
            </>
          )}
        </Panel>

        <Panel title={`Invoice ${period}`} bodyClassName="flex flex-col gap-2 p-4 text-[13px]">
          {invoice ? (
            <>
              <p className="text-zinc-900">
                {formatRupiah(invoice.amount)} · {INVOICE_STATUS_LABEL[invoice.status]}
              </p>
              <p className="text-[12px] text-zinc-500">Jatuh tempo {invoice.dueDate}</p>
              {invoice.invoiceUrl ? (
                <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-zinc-900 underline">
                  Buka link pembayaran
                </a>
              ) : (
                <p className="text-[12px] text-amber-700">Link Xendit belum terbit, dicoba lagi oleh job harian.</p>
              )}
              {invoice.status !== "paid" && (
                <div className="mt-1 flex gap-2">
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Jatuh tempo baru" className={inputClass} />
                  <button
                    type="button"
                    className={btn.secondary}
                    disabled={busy || !dueDate}
                    onClick={() => run(() => superAdminService.extendInvoice(invoice.id, dueDate), "Jatuh tempo diperpanjang.")}
                  >
                    Perpanjang
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-zinc-500">Tidak ada invoice untuk periode ini.</p>
          )}
        </Panel>
      </div>

      <Panel title="Transaksi">
        {transactions.length === 0 ? (
          <EmptyState title="Belum ada transaksi di periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Booking</th>
                  <th className="px-4 py-2 font-medium">Tanggal</th>
                  <th className="px-4 py-2 font-medium">Metode</th>
                  <th className="px-4 py-2 text-right font-medium">Omzet</th>
                  <th className="px-4 py-2 text-right font-medium">Komisi</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((row) => {
                  const isReversed = transactions.some((t) => t.bookingId === row.bookingId && t.entryType === "reversal");
                  return (
                    <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-[12px] text-zinc-900">{row.referenceCode}</span>
                        <span className="block text-[11px] text-zinc-400">
                          {row.entryType === "reversal" ? "Pembalik" : row.packageName}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-600">{new Date(row.occurredAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
                      <td className="px-4 py-2.5 text-zinc-600">{METHOD_LABEL[row.paymentMethod]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.grossAmount)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(row.commissionAmount)}</td>
                      <td className="px-4 py-2.5 text-zinc-600">{LEDGER_STATUS_LABEL[row.status]}</td>
                      <td className="px-4 py-2.5 text-right">
                        {row.entryType === "charge" && !isReversed && (
                          <button type="button" disabled={busy} onClick={() => handleReverse(row.bookingId, row.referenceCode)} className="text-[12px] text-red-700 hover:underline disabled:opacity-50">
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      </>
      )}
    </>
  );
}

export default function ClinicDetailPage() {
  return (
    <Suspense fallback={<p className="text-[13px] text-zinc-500">Memuat…</p>}>
      <ClinicDetail />
    </Suspense>
  );
}
