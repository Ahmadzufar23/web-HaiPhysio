"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { formatRupiah } from "@/lib/format";

type Props = {
  title: string;
  patientName: string;
  referenceCode: string;
  /** Null bila harga sesi belum diatur */
  amount?: number | null;
  packageName?: string | null;
  /** Saat proses berjalan, popup tidak bisa ditutup */
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
};

// Kerangka popup pembayaran sesi: judul, pasien, total, lalu isi tiap langkah.
export default function PaymentDialog({ title, patientName, referenceCode, amount, packageName, busy = false, onClose, children }: Props) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="flex w-full max-w-[420px] flex-col gap-3.5 rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={titleId} className="text-[15px] font-semibold text-zinc-900">
              {title}
            </h3>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {patientName} · {referenceCode}
            </p>
          </div>
          <button type="button" disabled={busy} onClick={onClose} aria-label="Tutup" className="grid size-7 shrink-0 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        {amount != null && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-action-line/25 bg-action-soft px-3 py-2.5 text-action-ink">
            <span className="text-[12px] font-medium">{packageName ? `Total sesi ${packageName}` : "Total sesi"}</span>
            <span className="text-[18px] font-semibold tabular-nums">{formatRupiah(amount)}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
