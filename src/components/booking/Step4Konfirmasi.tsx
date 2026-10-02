"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UserCircle, Copy, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import Stepper from "./Stepper";
import { bookingService } from "@/services/bookingService";
import { CLINIC_LOCATION } from "@/constants/data";
import { getApiErrorMessage } from "@/app/utils/api";
import type { CreatedBooking } from "@/types/api.types";

// Body POST /api/bookings (createBookingSchema di BE — strict, field lain ditolak)
type CreateBookingPayload = {
    slot_id: string;
    focus_id: string;
    complaint_notes?: string;
    patient_name?: string;
    patient_phone?: string;
    patient_email?: string;
};

interface Step4Props {
    onBack: () => void;
    bookingData: any; // Menerima data dari langkah 1 - 3
}

export default function Step4Konfirmasi({ onBack, bookingData }: Step4Props) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [createdBooking, setCreatedBooking] = useState<CreatedBooking | null>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    // --- LOGIKA HELPER TANGGAL & LAYANAN DINAMIS ---
    const formatSchedule = () => {
        if (!bookingData?.slotDate) return { date: "-", time: "-" };
        const dateObj = new Date(bookingData.slotDate);
        const dateFormatted = dateObj.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        const startTimeStr = bookingData.startTime ? String(bookingData.startTime).substring(0, 5) : "";
        return {
            date: dateFormatted,
            time: startTimeStr ? `${startTimeStr} WIB` : "-",
        };
    };

    const scheduleInfo = formatSchedule();
    const serviceName = bookingData?.serviceName || "Layanan Fisioterapi";
    const therapistName = bookingData?.therapistName || "-";

    // --- FUNGSI SUBMIT KE API BACKEND (POST /api/bookings) ---
    const handleConfirm = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            // Siapkan payload sesuai kontrak Zod Backend di API Reference
            // focus_id WAJIB (uuid) — tanpa ini BE balas 400 "focus_id wajib diisi!"
            const payload: CreateBookingPayload = {
                slot_id: bookingData.slotId || bookingData.scheduleId,
                focus_id: bookingData.serviceId,
            };

            if (bookingData.patientData?.complaint?.trim()) {
                payload.complaint_notes = bookingData.patientData.complaint.trim().substring(0, 300);
            }
            if (bookingData.patientData?.name?.trim()) {
                payload.patient_name = bookingData.patientData.name.trim();
            }
            if (bookingData.patientData?.phone?.trim()) {
                payload.patient_phone = bookingData.patientData.phone.trim();
            }
            if (bookingData.patientData?.email?.trim()) {
                payload.patient_email = bookingData.patientData.email.trim();
            }

            // Panggil API Booking
            const res = await bookingService.createBooking(payload);
            const bookingResult = res.data?.booking;
            // Sukses hanya kalau BE benar-benar mengembalikan booking dengan kode reservasi
            if (!bookingResult?.bookingReferenceCode) {
                throw new Error("Respons server tidak berisi data booking. Cek Riwayat Booking sebelum mencoba lagi.");
            }

            setCreatedBooking(bookingResult);
            setIsConfirmed(true);
        } catch (error: any) {
            console.error("Gagal membuat booking:", error);
            const backendMsg = error.response?.data?.error?.message || error.message || "Gagal memproses reservasi.";
            setErrorMessage(backendMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi salin nomor resi
    const handleCopyResi = (code: string) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    // --- TAMPILAN 2: HALAMAN SUKSES SETELAH DISUBMIT KE BACKEND ---
    if (isConfirmed) {
        // Kode reservasi asli dari BE (tidak ada kode pengganti/dummy)
        const referenceCode: string = createdBooking?.bookingReferenceCode || "";

        return (
            <div className="w-full flex flex-col items-center">
                <Stepper currentStep={5} />

                <div className="flex flex-col items-center text-center mt-4 w-full max-w-[700px] mx-auto gap-6">
                    {/* Ilustrasi Sukses */}
                    <div className="w-full max-w-[320px] h-[220px] flex items-center justify-center mb-2">
                        <img
                            src="/ilustrasi-sukses.png"
                            alt="Janji Temu Berhasil"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-[28px] md:text-[32px] font-bold text-[#1b2a4e]">Janji Temu Anda Berhasil Dipesan!</h2>
                        <p className="text-[#585858] text-[15px]">Silakan tunjukkan nomor reservasi Anda saat tiba di klinik.</p>
                    </div>

                    {/* Kotak Nomor Reservasi Nyata dari BE */}
                    <div className="flex items-center justify-between border-2 border-dashed border-[#8b9dc3] bg-[#f4f7fe] rounded-[16px] px-8 py-4 w-full max-w-[500px]">
                        <span className="text-[24px] md:text-[28px] font-bold text-[#1b2a4e] tracking-wider">{referenceCode}</span>
                        <div
                            onClick={() => handleCopyResi(referenceCode)}
                            className="flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-[#1b2a4e] transition-colors"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle size={24} weight="fill" className="text-green-500" />
                                    <span className="text-[10px] mt-1 font-bold text-green-600">Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={24} weight="bold" />
                                    <span className="text-[10px] mt-1 font-medium">Klik untuk<br />salin nomor</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Ringkasan Singkat Sesi */}
                    <div className="w-full border border-gray-200 rounded-[16px] p-6 text-left mt-4 bg-white">
                        <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#1b2a4e] mb-4">
                            <FileText size={24} weight="fill" className="text-[#1b2a4e]" /> Detail Sesi Terapi
                        </h3>
                        <div className="flex flex-col gap-3 text-[14px]">
                            <div className="flex border border-gray-100 rounded-lg p-3">
                                <span className="w-[150px] font-bold text-[#1b2a4e]">Jenis Layanan</span>
                                <span className="text-gray-600 flex-1">{serviceName}</span>
                            </div>
                            <div className="flex border border-gray-100 rounded-lg p-3">
                                <span className="w-[150px] font-bold text-[#1b2a4e]">Fisioterapis</span>
                                <span className="text-gray-600 flex-1">{therapistName}</span>
                            </div>
                            <div className="flex border border-gray-100 rounded-lg p-3">
                                <span className="w-[150px] font-bold text-[#1b2a4e]">Hari & Tanggal</span>
                                <span className="text-gray-600 flex-1">{scheduleInfo.date}</span>
                            </div>
                            <div className="flex border border-gray-100 rounded-lg p-3">
                                <span className="w-[150px] font-bold text-[#1b2a4e]">Waktu / Jam</span>
                                <span className="text-gray-600 flex-1">{scheduleInfo.time}</span>
                            </div>
                            <div className="flex border border-gray-100 rounded-lg p-3">
                                <span className="w-[150px] font-bold text-[#1b2a4e]">Lokasi Klinik</span>
                                <span className="text-gray-600 flex-1">{CLINIC_LOCATION}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex flex-col gap-3 w-full mt-4">
                        <button
                            onClick={() => router.push("/riwayat-booking")}
                            className="w-full bg-[#F5B301] hover:bg-[#dda101] text-white py-4 rounded-[12px] font-bold transition-colors shadow-md"
                        >
                            Lihat Detail Riwayat
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-[#1b2a4e] py-4 rounded-[12px] font-bold transition-colors"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- TAMPILAN 1: TAMPILAN REVIEW & KONFIRMASI (Default) ---
    return (
        <div className="w-full flex flex-col items-center">
            <div className="text-center mb-10">
                <h2 className="text-[32px] md:text-[36px] font-bold text-[#1b2a4e] mb-3">Tinjau & Konfirmasi Reservasi Anda</h2>
                <p className="text-[#585858] text-[15px] md:text-[16px]">Mohon periksa kembali detail jadwal, terapis, dan keluhan Anda di bawah ini agar proses terapi berjalan lancar.</p>
            </div>

            <Stepper currentStep={4} />

            {errorMessage && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <WarningCircle size={24} weight="fill" className="shrink-0" />
                    <span className="font-medium text-[14px]">{errorMessage}</span>
                </div>
            )}

            {/* KARTU 1: DETAIL SESI TERAPI */}
            <div className="w-full bg-white border border-gray-200 rounded-[16px] p-6 md:p-8 mb-6">
                <h3 className="flex items-center gap-3 text-[20px] font-bold text-[#1b2a4e] mb-6">
                    <FileText size={28} weight="fill" className="text-[#1b2a4e]" /> Detail Sesi Terapi
                </h3>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Jenis Layanan</span>
                        <span className="text-gray-600 text-[14px]">{serviceName}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Fisioterapis</span>
                        <span className="text-gray-600 text-[14px]">{therapistName}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Hari & Tanggal</span>
                        <span className="text-gray-600 text-[14px]">{scheduleInfo.date}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Waktu / Jam</span>
                        <span className="text-gray-600 text-[14px]">{scheduleInfo.time}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Lokasi Klinik</span>
                        <span className="text-gray-600 text-[14px]">{CLINIC_LOCATION}</span>
                    </div>
                </div>
            </div>

            {/* KARTU 2: DETAIL INFORMASI PASIEN */}
            <div className="w-full bg-white border border-gray-200 rounded-[16px] p-6 md:p-8 mb-10">
                <h3 className="flex items-center gap-3 text-[20px] font-bold text-[#1b2a4e] mb-6">
                    <UserCircle size={28} weight="fill" className="text-[#1b2a4e]" /> Detail Informasi Pasien
                </h3>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Nama Lengkap</span>
                        <span className="text-gray-600 text-[14px]">{bookingData.patientData?.name || "-"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Nomor Telepon</span>
                        <span className="text-gray-600 text-[14px]">{bookingData.patientData?.phone || "-"}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px]">Alamat Email</span>
                        <span className="text-gray-600 text-[14px]">{bookingData.patientData?.email || "-"}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px] shrink-0 mt-1">Keluhan Utama</span>
                        <span className="text-gray-600 text-[14px] leading-relaxed">
                            {bookingData.patientData?.complaint ? bookingData.patientData.complaint : "-"}
                        </span>
                    </div>

                    {/* Foto Keluhan */}
                    <div className="flex flex-col md:flex-row md:items-start border border-gray-100 rounded-xl p-4 gap-2 md:gap-0">
                        <span className="w-[180px] font-bold text-[#1b2a4e] text-[14px] shrink-0 mt-1">Foto Keluhan</span>
                        {bookingData.patientData?.photoPreview ? (
                            <div className="w-full max-w-[500px] h-[200px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                                <img src={bookingData.patientData.photoPreview} alt="Keluhan" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <span className="text-gray-600 text-[14px] mt-1">-</span>
                        )}
                    </div>
                </div>
            </div>

            {/* TOMBOL NAVIGASI */}
            <div className="w-full flex justify-between">
                <button
                    disabled={isLoading}
                    onClick={onBack}
                    className="text-[#F5B301] font-bold flex items-center gap-2 px-6 py-3 rounded-[12px] bg-gray-50 hover:bg-yellow-50 transition-colors"
                >
                    <span>←</span> Kembali
                </button>
                <button
                    disabled={isLoading}
                    onClick={handleConfirm}
                    className={`px-10 py-3 rounded-[12px] font-bold flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(245,179,1,0.3)]
                        ${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#F5B301] hover:bg-[#dda101] text-white cursor-pointer"}
                    `}
                >
                    {isLoading ? "Memproses Reservasi..." : "Konfirmasi Booking →"}
                </button>
            </div>
        </div>
    );
}
