"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { bookingService } from "@/services/bookingService";
import { getApiErrorMessage } from "@/app/utils/api";

interface ModalCancelBookingProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess: () => void;
}

export default function ModalCancelBooking({ isOpen, onClose, bookingId, onSuccess }: ModalCancelBookingProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const close = () => {
    setReason("");
    setErrorMessage("");
    onClose();
  };

  const handleCancelSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await bookingService.cancelBooking(bookingId, reason.trim() || undefined);
      onSuccess();
      close();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Gagal membatalkan sesi. Coba lagi nanti."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title" onClick={close}>
      <div className="relative w-full max-w-[400px] rounded-xl border border-zinc-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Tutup" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <X size={14} />
        </button>
        <div className="p-5">
          <h3 id="cancel-title" className="text-[15px] font-semibold text-zinc-900">
            Batalkan sesi terapi?
          </h3>
          <p className="mt-1 text-[12px] text-zinc-500">Slot akan dilepas untuk pasien lain dan tidak bisa dikembalikan.</p>

          {errorMessage && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{errorMessage}</div>}

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-zinc-700">
              Alasan <span className="font-normal text-zinc-400">· opsional</span>
            </span>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-[13px] text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">
          <button onClick={close} className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50">
            Kembali
          </button>
          <button onClick={handleCancelSubmit} disabled={isLoading} className="inline-flex h-9 items-center rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-60">
            {isLoading ? "Memproses…" : "Batalkan sesi"}
          </button>
        </div>
      </div>
    </div>
  );
}
