"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/app/utils/api";
import { btn } from "@/components/admin/shared/AdminUI";
import PaymentChoiceDialog from "@/components/admin/sesi/PaymentChoiceDialog";
import PaymentDialog from "@/components/admin/sesi/PaymentDialog";
import { clinicService } from "@/services/clinicService";
import type { AdminBooking, SessionPayment } from "@/types/api.types";

type Props = {
  booking: AdminBooking;
  onClose: () => void;
  onChanged: () => void;
};

// Menyelesaikan sesi langsung dari daftar booking, tanpa pindah ke halaman sesi.
export default function BookingFinishDialog({ booking, onClose, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<SessionPayment | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  // Isian sesi wajib lengkap dulu, jadi pilihan pembayaran baru muncul setelah dicek.
  // Null berarti masih dicek.
  const [missingItems, setMissingItems] = useState<string[] | null>(null);
  const [sessionPrice, setSessionPrice] = useState<{ amount: number | null; packageName: string | null }>({ amount: null, packageName: null });

  useEffect(() => {
    let isCancelled = false;
    clinicService
      .getSession(booking.id)
      .then((res) => {
        if (isCancelled) return;
        const { noteReady, painAfterReady, bodyReady, amountDue, package: sessionPackage } = res.data.session;
        setSessionPrice({ amount: amountDue, packageName: sessionPackage?.name ?? null });
        setMissingItems([
          ...(noteReady ? [] : ["catatan terapi"]),
          ...(painAfterReady ? [] : ["nyeri sesudah terapi"]),
          ...(bodyReady ? [] : ["tinggi & berat badan"]),
        ]);
      })
      .catch((err) => {
        if (!isCancelled) setError(getApiErrorMessage(err, "Sesi tidak dapat dimuat."));
      });
    return () => {
      isCancelled = true;
    };
  }, [booking.id]);

  const handlePayOnline = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await clinicService.createSessionPayment(booking.id);
      setPayment(res.data.payment);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePayCash = async () => {
    setBusy(true);
    setError("");
    try {
      await clinicService.finishSession(booking.id);
      onChanged();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  const handleCloseLink = () => {
    onChanged();
    onClose();
  };

  const handleCopy = async () => {
    if (!payment?.invoiceUrl) return;
    try {
      await navigator.clipboard.writeText(payment.invoiceUrl);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  if (missingItems === null || missingItems.length > 0) {
    return (
      <PaymentDialog title={missingItems === null ? "Mengecek sesi…" : "Sesi belum bisa diselesaikan"} patientName={booking.patientName} referenceCode={booking.referenceCode} onClose={onClose}>
        {missingItems && <p className="text-[13px] leading-relaxed text-zinc-600">Isi dan simpan {missingItems.join(" dan ")} dulu, baru sesi bisa diselesaikan dan dibayar.</p>}
        {error && <p className="text-[13px] text-red-700">{error}</p>}
        {missingItems && (
          <Link href={`/admin/sesi/${booking.id}`} className={`${btn.primary} self-end`}>
            Isi sesi
          </Link>
        )}
      </PaymentDialog>
    );
  }

  if (payment?.invoiceUrl) {
    return (
      <PaymentDialog title="Link pembayaran siap" patientName={booking.patientName} referenceCode={booking.referenceCode} amount={payment.amount} packageName={sessionPrice.packageName} busy={busy} onClose={handleCloseLink}>
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800" role="status">
          <span className="mt-[5px] size-2 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold">Menunggu pembayaran pasien</p>
            <p>Status jadi Selesai otomatis setelah pembayaran diterima.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className={`${btn.primary} h-9`}>
            Buka halaman pembayaran
          </a>
          <button type="button" onClick={handleCopy} className={`${btn.secondary} h-9`}>
            {isCopied ? "Link disalin" : "Salin link"}
          </button>
        </div>
        <button type="button" disabled={busy} onClick={handlePayCash} className="self-center text-[12px] font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-900 disabled:opacity-50">
          Pasien bayar tunai saja
        </button>
        {error && <p className="text-[13px] text-red-700">{error}</p>}
      </PaymentDialog>
    );
  }

  return (
    <PaymentChoiceDialog
      patientName={booking.patientName}
      referenceCode={booking.referenceCode}
      amount={sessionPrice.amount}
      packageName={sessionPrice.packageName}
      busy={busy}
      onPayOnline={handlePayOnline}
      onPayCash={handlePayCash}
      onClose={onClose}
    >
      {error && (
        <p className="text-[13px] text-red-700">
          {error}{" "}
          <Link href={`/admin/sesi/${booking.id}`} className="font-medium underline">
            Buka sesi
          </Link>
        </p>
      )}
    </PaymentChoiceDialog>
  );
}
