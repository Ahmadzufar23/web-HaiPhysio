"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { bookingService } from "@/services/bookingService";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react";

export default function KonfirmasiUbahJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slotId");
  const reason = searchParams.get("reason") || "";

  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Tarik data jadwal lama buat ditampilin sebagai perbandingan
  useEffect(() => {
    const fetchOldBooking = async () => {
      try {
        const response = await bookingService.getDetailBooking(id);
        setBookingData(response.data.booking);
      } catch (error) {
        console.error("Gagal menarik data booking:", error);
        setErrorMessage("Gagal memuat data jadwal lama.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOldBooking();
  }, [id]);

  const formatTanggal = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  // Helper ngakalin jam (mirip kyk di RiwayatBooking tadi)
  const formatWaktu = (start?: string, end?: string) => {
    if (!start) return "-";
    const startTime = start.substring(0, 5);
    if (end) return `${startTime} - ${end.substring(0, 5)}`;
    const [hour, minute] = startTime.split(":");
    const endHour = String(Number(hour) + 1).padStart(2, "0");
    return `${startTime} - ${endHour}:${minute}`;
  };

  // Fungsi Eksekusi API Ubah Jadwal
  const handleConfirm = async () => {
    if (!slotId) {
      setErrorMessage("Slot jadwal baru tidak valid. Silakan kembali dan pilih ulang jadwal.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Nembak API Reschedule sesuai dokumentasi backend
      await bookingService.rescheduleBooking(id, slotId, reason);
      
      // Kalau dapet status 200 OK, langsung lempar ke halaman sukses!
      router.push(`/riwayat-booking/ubah-jadwal/${id}/sukses`);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error?.message || "Gagal mengubah jadwal. Pastikan perubahan dilakukan >24 jam sebelum jadwal.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-[120px] pb-24 flex justify-center items-center bg-[#FAFAFA]">
        <span className="text-[#1b2a4e] font-bold animate-pulse">Menyiapkan data konfirmasi...</span>
      </div>
    );
  }

  const namaLayanan = (bookingData?.focusArea?.name || bookingData?.therapistSpecializations?.[0]?.name) || "Fisioterapi";

  return (
    <div className="w-full min-h-screen pt-[120px] pb-24 px-5 md:px-[80px] bg-[#FAFAFA] flex flex-col items-center">
      <div className="w-full max-w-[800px]">
        
        <Link 
          href={`/riwayat-booking/ubah-jadwal/${id}`}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1b2a4e] mb-6 font-medium text-[14px] transition-colors w-fit"
        >
          <ArrowLeft size={18} weight="bold" />
          Kembali Pilih Jadwal
        </Link>

        <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-12 shadow-sm">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1b2a4e] mb-2">Konfirmasi Ubah Jadwal</h1>
          <p className="text-gray-500 text-[14px] mb-8">Tinjau kembali perubahan jadwal sesi {namaLayanan} Anda sebelum mengonfirmasi.</p>

          {/* Banner Error */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-[14px] font-medium border border-red-100 flex items-start gap-3">
              <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* Card Jadwal Lama */}
            <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 opacity-80">
              <h3 className="text-[15px] font-bold text-gray-500 mb-4 pb-3 border-b border-gray-200">Jadwal Lama</h3>
              
              <div className="flex flex-col gap-3 text-[14px]">
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[12px]">Fisioterapis</span>
                  <span className="font-bold text-gray-500">{bookingData?.therapistName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[12px]">Tanggal Sesi</span>
                  <span className="font-bold text-gray-500">{formatTanggal(bookingData?.bookingDate)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[12px]">Waktu Sesi</span>
                  <span className="font-bold text-gray-500">
                    {formatWaktu(bookingData?.bookingTime, bookingData?.bookingEndTime)} WIB
                  </span>
                </div>
              </div>
            </div>

            {/* Card Jadwal Baru */}
            <div className="p-6 rounded-2xl border-2 border-[#F5B301] bg-[#FFFBEA]">
              <h3 className="text-[15px] font-bold text-[#1b2a4e] mb-4 pb-3 border-b border-[#FDE68A]">Jadwal Baru</h3>
              
              <div className="flex flex-col gap-3 text-[14px]">
                <div>
                  <span className="text-gray-500 block mb-0.5 text-[12px]">ID Slot Pengganti</span>
                  <span className="font-bold text-[#1b2a4e] break-all">{slotId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5 text-[12px]">Alasan Perubahan</span>
                  <span className="font-bold text-[#1b2a4e]">{reason || "Tidak ada alasan khusus"}</span>
                </div>
                <div className="mt-2 pt-3 border-t border-[#FDE68A]">
                  <span className="text-[11px] text-[#b88601] font-medium leading-relaxed block">
                    *Detail hari dan jam terapis baru Anda akan dicetak pada halaman sukses setelah konfirmasi.
                  </span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Tombol Konfirmasi */}
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting || !slotId}
            className={`w-full py-4 rounded-xl font-bold text-[15px] transition-colors ${
              isSubmitting || !slotId ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#F5B301] text-white hover:bg-[#dda101]"
            }`}
          >
            {isSubmitting ? "Memproses Perubahan..." : "Konfirmasi Ubah Jadwal"}
          </button>

        </div>
      </div>
    </div>
  );
}