"use client";

import { useState } from "react";
import { X, WarningCircle } from "@phosphor-icons/react";
import { bookingService } from "@/services/bookingService";

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

  const handleCancelSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Nembak API cancel booking sesuai dokumentasi BE
      await bookingService.cancelBooking(bookingId, reason);
      
      setIsLoading(false);
      onSuccess(); // Buat nge-refresh data riwayat di parent component
      onClose();   // Tutup modal
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.data?.error?.message) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Gagal membatalkan sesi. Pastikan pembatalan dilakukan >24 jam sebelum jadwal.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[450px] rounded-[24px] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} weight="bold" />
        </button>

        <div className="flex items-center gap-3 mb-4 text-[#EF4444]">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <WarningCircle size={28} weight="fill" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-brand-900">Batalkan Sesi Terapi?</h3>
            <p className="text-[13px] text-gray-500">Sesi yang dibatalkan tidak dapat dikembalikan.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium border border-red-100">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-[14px] font-bold text-brand-900">Alasan Pembatalan (Opsional)</label>
          <textarea 
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan Anda membatalkan sesi..."
            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:border-[#EF4444] transition-colors text-[14px] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
          <button 
            onClick={handleCancelSubmit}
            disabled={isLoading}
            className={`flex-1 py-3.5 rounded-xl text-white font-bold text-[14px] transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#EF4444] hover:bg-[#DC2626]'
            }`}
          >
            {isLoading ? "Memproses..." : "Ya, Batalkan"}
          </button>
        </div>

      </div>
    </div>
  );
}