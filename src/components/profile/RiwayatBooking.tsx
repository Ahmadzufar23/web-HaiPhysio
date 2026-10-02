"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { bookingService } from "@/services/bookingService";
import ModalCancelBooking from "@/components/profile/ModalCancelBooking";
import { CalendarBlank, Stethoscope, CaretDown, CaretUp, WarningCircle, Barbell, Brain, Bone, Receipt, User } from "@phosphor-icons/react";

export default function RiwayatBooking() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk ngatur card mana yang lagi dibuka (Accordion)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // State buat ngatur modal cancel
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const tabs = ["Semua", "Terkonfirmasi", "Selesai", "Dibatalkan"];

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getRiwayatBooking(activeTab);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Gagal menarik data riwayat booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setExpandedId(null); // Tutup semua card kalau pindah tab
  }, [activeTab]);

  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const formatWaktu = (start?: string, end?: string) => {
    if (!start) return "-";
    const startTime = start.substring(0, 5); // Ambil "14:00"

    // Kalau API ngirim jam selesai, langsung pakai
    if (end) return `${startTime} - ${end.substring(0, 5)}`;

    // Kalau API nggak ngirim, kita tambah 1 jam otomatis
    const [hour, minute] = startTime.split(":");
    const endHour = String(Number(hour) + 1).padStart(2, "0");
    return `${startTime} - ${endHour}:${minute}`;
  };

  const renderLayananIcon = (layanan: string = "") => {
    if (layanan.includes("Olahraga")) return <Barbell size={28} weight="regular" />;
    if (layanan.includes("Neuro")) return <Brain size={28} weight="regular" />;
    return <Bone size={28} weight="regular" />;
  };

  // Fungsi buat buka/tutup card
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-[24px] font-bold text-[#1b2a4e] mb-2">Riwayat Booking</h2>
        <p className="text-[#585858] text-[14px]">
          Kelola informasi pribadi akun Anda dan pantau riwayat sesi terapi fisioterapi yang pernah Anda jalani.
        </p>
      </div>

      {/* Tab Filter */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors ${activeTab === tab
              ? "bg-[#F5B301] text-white shadow-md"
              : "border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Card Riwayat */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[#1b2a4e] font-bold animate-pulse">Memuat riwayat jadwal...</p>
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => {
            const namaLayanan = (booking.focusArea?.name || booking.therapistSpecializations?.[0]?.name) || "Fisioterapi Umum";
            const isExpanded = expandedId === booking.id;

            return (
              <div key={booking.id} className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-sm transition-shadow">

                {/* --- HEADER CARD (Selalu Kelihatan) --- */}
                <div className="flex flex-col md:flex-row justify-between gap-4">

                  {/* Info Kiri */}
                  <div className="flex items-start gap-4">
                    {/* Icon Layanan Dinamis */}
                    <div className="w-[52px] h-[52px] rounded-xl bg-[#FFFBEA] text-[#F5B301] flex items-center justify-center border border-[#FDE68A] shrink-0">
                      {renderLayananIcon(namaLayanan)}
                    </div>

                    <div>
                      <h4 className="text-[16px] font-bold text-[#1b2a4e]">{namaLayanan}</h4>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1.5">
                        <CalendarBlank size={16} />
                        <span>{formatTanggal(booking.bookingDate)} | {formatWaktu(booking.bookingTime, booking.bookingEndTime)} WIB</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1">
                        <User size={16} />
                        <span>Fisioterapis: {booking.therapistName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge Status & Tombol Expand (Kanan) */}
                  <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold border flex items-center gap-2 ${booking.bookingStatus === "Terkonfirmasi" ? "text-[#10B981] border-[#D1FAE5] bg-[#ECFDF5]" :
                      booking.bookingStatus === "Selesai" ? "text-gray-600 border-gray-200 bg-white shadow-sm" :
                        "text-[#EF4444] border-[#FEE2E2] bg-[#FEF2F2]"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${booking.bookingStatus === "Terkonfirmasi" ? "bg-[#10B981]" :
                        booking.bookingStatus === "Selesai" ? "bg-gray-400" :
                          "bg-[#EF4444]"
                        }`}></span>
                      {booking.bookingStatus}
                    </span>

                    {/* Tombol Lihat Detail berubah fungsi jadi Buka/Tutup Accordion */}
                    <button
                      onClick={() => toggleExpand(booking.id)}
                      className="text-[#F5B301] text-[13px] font-bold hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? "Tutup Detail" : "Lihat Detail"}
                      {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                    </button>
                  </div>
                </div>

                {/* --- AREA EXPANDED (Hanya Kelihatan Kalau Diklik) --- */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* Kode Reservasi */}
                    <div className="flex items-center gap-2 text-[14px] bg-gray-50 p-3 rounded-lg border border-gray-200 w-fit mb-4">
                      <Receipt size={18} className="text-gray-500" />
                      <span className="text-gray-500">Kode Reservasi:</span>
                      <span className="font-bold text-[#1b2a4e] tracking-wide">{booking.referenceCode}</span>
                    </div>

                    {/* Keluhan */}
                    {booking.complaintNotes ? (
                      <div className="mb-4">
                        <p className="text-[13px] font-bold text-[#1b2a4e]">Keluhan:</p>
                        <p className="text-[13px] text-gray-600 leading-relaxed mt-1">{booking.complaintNotes}</p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-[13px] font-bold text-[#1b2a4e]">Keluhan:</p>
                        <p className="text-[13px] text-gray-400 italic mt-1">Tidak ada catatan keluhan.</p>
                      </div>
                    )}

                    {/* Alasan Batal */}
                    {booking.cancellationReason && (
                      <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-[13px] text-[#EF4444] font-bold flex items-center gap-1.5 mb-1">
                          <WarningCircle size={16} weight="fill" />
                          Alasan Dibatalkan:
                        </p>
                        <p className="text-[13px] text-[#EF4444]">{booking.cancellationReason}</p>
                      </div>
                    )}

                    {/* Tombol Aksi (Ubah Jadwal & Batal Sesi) */}
                    {booking.isActionAllowed && (
                      <div className="flex gap-4 mt-6 pt-5 border-t border-gray-100">
                        <Link
                          href={`/riwayat-booking/ubah-jadwal/${booking.id}`}
                          className="px-6 py-2.5 rounded-full border-2 border-[#F5B301] text-[#F5B301] font-bold text-[13px] hover:bg-[#FFFBEA] transition-colors inline-block"
                        >
                          Ubah Jadwal
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setIsCancelModalOpen(true);
                          }}
                          className="px-6 py-2.5 rounded-full text-[#EF4444] font-bold text-[13px] hover:bg-red-50 transition-colors"
                        >
                          Batalkan Sesi
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-[14px]">Belum ada riwayat {activeTab !== "Semua" ? activeTab.toLowerCase() : ""} saat ini.</p>
          </div>
        )}
      </div>

      <ModalCancelBooking
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        bookingId={selectedBookingId || ""}
        onSuccess={() => fetchBookings()}
      />
    </div>
  );
}