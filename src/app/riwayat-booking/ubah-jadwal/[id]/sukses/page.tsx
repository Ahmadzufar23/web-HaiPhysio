"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, FileText, CheckCircle } from "@phosphor-icons/react";
import { bookingService } from "@/services/bookingService";
import type { BookingDetail } from "@/types/api.types";
import { CLINIC_LOCATION } from "@/constants/data";

export default function SuksesUbahJadwalPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Narik data booking terbaru buat ditampilin di halaman sukses
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await bookingService.getDetailBooking(bookingId);
        setBooking(response.data.booking);
      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (bookingId) fetchDetail();
  }, [bookingId]);

  // Fungsi buat nyalin kode RESV ke clipboard HP/Laptop
  const handleCopyCode = () => {
    if (booking?.referenceCode) {
      navigator.clipboard.writeText(booking.referenceCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatTanggal = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", { weekday: 'long', day: "numeric", month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <span className="text-brand-900 font-bold animate-pulse">Memuat data...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#FAFAFA]">
        <p className="text-gray-500 mb-4">Data tidak ditemukan.</p>
        <button onClick={() => router.push('/riwayat-booking')} className="px-6 py-2 bg-brand-600 text-brand-950 rounded-xl">Kembali</button>
      </div>
    );
  }

  const namaLayanan = (booking.focusArea?.name || booking.therapistSpecializations?.[0]?.name) || "Fisioterapi Umum";

  return (
    <div className="w-full min-h-screen pt-[120px] pb-24 px-5 bg-[#FAFAFA] flex justify-center">
      <div className="w-full max-w-[800px] bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] h-fit flex flex-col items-center text-center">
        
        {/* Ilustrasi Sukses (Ganti src-nya sesuai nama file ilustrasi lu di folder public) */}
        <div className="w-full max-w-[300px] mb-8">
          <img 
            src="/success-illustration.png" 
            alt="Sukses Ubah Jadwal" 
            className="w-full h-auto object-contain"
            // Kalau lu belum punya gambarnya, bisa biarin kosong dulu atau pakai div kotak pengganti
          />
        </div>

        <h1 className="text-[24px] md:text-[28px] font-bold text-brand-900 mb-2">
          Ubah Jadwal Terapis Anda Berhasil Diubah!
        </h1>
        <p className="text-[#585858] text-[14px] md:text-[15px] mb-8">
          Silakan tunjukkan nomor reservasi Anda saat tiba di klinik.
        </p>

        {/* Kotak Kode RESV (Dashed Border) */}
        <div className="border-2 border-dashed border-brand-900 rounded-2xl p-6 mb-10 w-full max-w-[400px] flex justify-between items-center bg-[#F8FAFC]">
          <span className="text-[28px] font-bold text-brand-900 tracking-wide">
            {booking.referenceCode}
          </span>
          <button 
            onClick={handleCopyCode}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-brand-900 transition-colors"
          >
            {isCopied ? <CheckCircle size={28} weight="fill" className="text-green-500" /> : <Copy size={28} />}
            <span className="text-[10px] font-medium">{isCopied ? "Tersalin!" : "Klik untuk salin nomor"}</span>
          </button>
        </div>

        {/* Card Detail Sesi Terapi */}
        <div className="w-full border border-gray-200 rounded-[20px] p-6 text-left mb-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <FileText size={24} className="text-brand-900" weight="fill" />
            <h3 className="text-[18px] font-bold text-brand-900">Detail Sesi Terapi</h3>
          </div>

          <div className="flex flex-col gap-4 text-[14px]">
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 sm:w-[150px] font-medium shrink-0">Jenis Layanan</span>
              <span className="font-bold text-brand-900">{namaLayanan}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 sm:w-[150px] font-medium shrink-0">Fisioterapis</span>
              <span className="font-bold text-brand-900">{booking.therapistName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 sm:w-[150px] font-medium shrink-0">Hari & Tanggal</span>
              <span className="font-bold text-brand-900">{formatTanggal(booking.bookingDate)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 sm:w-[150px] font-medium shrink-0">Waktu / Jam</span>
              <span className="font-bold text-brand-900">
                {booking.bookingTime?.substring(0, 5)} - {booking.bookingEndTime?.substring(0, 5)} WIB
              </span>
            </div>
            <div className="flex flex-col sm:flex-row py-2">
              <span className="text-gray-500 sm:w-[150px] font-medium shrink-0">Lokasi Klinik</span>
              <span className="font-bold text-brand-900">{CLINIC_LOCATION}</span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="w-full flex flex-col gap-3">
          <Link 
          href="/riwayat-booking"
          className="w-full py-4 rounded-xl bg-brand-600 text-brand-950 font-bold text-[15px] hover:bg-brand-700 transition-colors"
        >
          Lihat Detail Riwayat
        </Link>
          <Link 
            href="/"
            className="w-full py-4 rounded-xl bg-gray-100 text-gray-500 font-bold text-[15px] hover:bg-gray-200 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}