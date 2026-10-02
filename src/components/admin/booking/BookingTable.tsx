"use client";

import { useState } from "react";
import { Bandaids, Brain, Barbell, Info, CheckCircle, X, Check, CalendarX, ClockCounterClockwise } from "@phosphor-icons/react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

interface BookingTableProps {
  bookings: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function BookingTable({ bookings, isLoading, onRefresh }: BookingTableProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const currentData = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenCancelModal = (booking: any) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  // Konfirmasi Batal ke API
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    try {
      await adminService.updateBookingStatus(selectedBooking.id, "Dibatalkan", cancelReason);
      setIsCancelModalOpen(false);
      setToastMessage(`Booking ${selectedBooking.referenceCode || selectedBooking.bookingReferenceCode || selectedBooking.code} berhasil dibatalkan`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onRefresh();
    } catch (error) {
      console.error("Gagal membatalkan booking:", error);
      alert("Gagal membatalkan booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Tandai Sesi Selesai ke API
  const handleMarkDone = async (booking: any) => {
    try {
      await adminService.updateBookingStatus(booking.id, "Selesai");
      setToastMessage(`Sesi ${booking.patientName || booking.patient_name} telah selesai`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onRefresh();
    } catch (error) {
      console.error("Gagal update status selesai:", error);
    }
  };

  const renderLayananIcon = (layanan: string) => {
    if (layanan.toLowerCase().includes("neuro")) return <Brain size={15} weight="bold" />;
    if (layanan.toLowerCase().includes("olahraga")) return <Barbell size={15} weight="bold" />;
    return <Bandaids size={15} weight="bold" />;
  };

  const renderStatus = (statusRaw: string) => {
    const status = (statusRaw || "").toLowerCase();
    let label = "Terkonfirmasi";
    let colorClass = "border-green-500 text-green-600 bg-green-50/40";

    if (status === "selesai") {
      label = "Selesai";
      colorClass = "border-gray-300 text-gray-500 bg-gray-50";
    } else if (status === "dibatalkan") {
      label = "Dibatalkan";
      colorClass = "border-red-300 text-red-500 bg-red-50/40";
    } else if (status === "tidak_hadir" || status === "tidak hadir") {
      label = "Tidak Hadir";
      colorClass = "border-orange-300 text-orange-500 bg-orange-50/40";
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${colorClass}`}>
        <CheckCircle size={15} weight="fill" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      
      {isLoading ? (
        <div className="py-24 text-center text-gray-400 font-medium">
          Memuat data reservasi booking...
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
            <CalendarX size={32} />
          </div>
          <h4 className="text-[17px] font-bold text-[#1b2a4e] mb-1">Tidak Ada Booking</h4>
          <p className="text-[13px] text-gray-500 max-w-sm">
            Tidak ada reservasi konsultasi yang sesuai dengan filter pencarian.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 w-[50px] uppercase tracking-wider">No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">ID Booking</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Pasien</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Fisioterapis & Layanan</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Jadwal Sesi</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => {
                const pName = row.patientName || row.patient_name || "Pasien";
                const pPhone = row.patientPhone || row.patient_phone || "-";
                const tName = row.therapistName || row.therapist_name || "-";
                // therapistSpecializations[0].name sebagai nama layanan
                const sName = (row.focusArea?.name || row.therapistSpecializations?.[0]?.name) || row.serviceName || row.service_name || "Fisioterapi";
                // bookingDate format ISO, ambil YYYY-MM-DD
                const rawDate = row.bookingDate || row.slotDate || row.slot_date || "-";
                const dateStr = rawDate.substring(0, 10);
                // bookingTime sudah format HH:MM:SS
                const timeStr = row.bookingTime ? `${row.bookingTime.substring(0, 5)} WIB` : (row.startTime || row.start_time || "").substring(0, 5);
                const refCode = row.referenceCode || row.bookingReferenceCode || row.reference_code || row.kode || `#HP-${String(row.id).substring(0, 6)}`;
                // bookingStatus dari backend: "Terkonfirmasi" / "Selesai" / "Dibatalkan"
                const status = (row.bookingStatus || row.status || "").toLowerCase();

                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6 text-[14px] text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}.
                    </td>
                    <td className="py-5 px-6 text-[14px] font-bold text-[#1b2a4e]">
                      {refCode}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-bold text-[#1b2a4e]">{pName}</span>
                        <span className="text-[12px] text-gray-500">{pPhone}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[14px] font-bold text-[#1b2a4e]">{tName}</span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F5B301] text-[#D69A00] bg-yellow-50/40">
                          {renderLayananIcon(sName)}
                          <span className="text-[11px] font-bold">{sName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-semibold text-[#1b2a4e]">{dateStr}</span>
                        <span className="text-[13px] text-gray-500">{timeStr}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {renderStatus(row.bookingStatus || row.status)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      {status === "terkonfirmasi" ? (
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Reschedule */}
                          <Link
                            href={`/admin/booking/reschedule?id=${row.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[12px] font-bold transition-colors flex items-center gap-1"
                            title="Reschedule / Ubah Jadwal Pasien"
                          >
                            <ClockCounterClockwise size={14} weight="bold" />
                            Reschedule
                          </Link>

                          {/* Tombol Selesaikan */}
                          <button
                            onClick={() => handleMarkDone(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-[12px] font-bold transition-colors flex items-center gap-1"
                            title="Tandai Sesi Selesai"
                          >
                            <Check size={14} weight="bold" />
                            Selesai
                          </button>
                          
                          {/* Tombol Batalkan */}
                          <button 
                            onClick={() => handleOpenCancelModal(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-[12px] font-bold transition-colors"
                          >
                            Batalkan
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && bookings.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-[13px] text-gray-500">
            Menampilkan <strong>{currentData.length}</strong> dari <strong>{bookings.length}</strong> reservasi
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              {'<'}
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-[13px] transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#1b2a4e] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              {'>'}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL BATALKAN BOOKING --- */}
      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#1b2a4e]">Batalkan Booking</h3>
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[14px] text-gray-600 mb-4">
              Apakah Anda yakin ingin membatalkan reservasi untuk pasien <strong>{selectedBooking.patientName || selectedBooking.patient_name}</strong>?
            </p>

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[13px] font-bold text-[#1b2a4e]">Alasan Pembatalan</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tuliskan alasan pembatalan (misal: Pasien berhalangan hadir)..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#F5B301] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-[13px] text-gray-600 hover:bg-gray-50"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-[13px] hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFIKASI --- */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(2,122,72,0.1)] z-50 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle size={20} weight="fill" />
          <span className="text-[14px] font-bold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
