"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User, ClipboardText, CalendarBlank, Barbell, Brain, Bandaids, CaretRight, CheckCircle, ClockCounterClockwise
} from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import type { AdminBooking, AdminPatient } from "@/types/api.types";

// Format tanggal dari BE (ISO / "YYYY-MM-DD") ke tampilan Indonesia; tanggal disimpan sebagai UTC 00:00
const formatTanggal = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

function DetailPasienContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id") || "";

  const [patient, setPatient] = useState<AdminPatient | null>(null);
  const [patientBookings, setPatientBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!patientId) {
          setPatient(null);
          return;
        }

        const [patientsRes, bookingsRes] = await Promise.all([
          adminService.getPatients(),
          adminService.getBookings(),
        ]);

        const allPatients = patientsRes.data?.patients || [];
        const allBookings = bookingsRes.data?.bookings || [];

        // Hanya cocok lewat ID akun atau kode pasien — tidak ada fallback ke pasien lain
        const target = String(patientId).toLowerCase();
        const targetPatient =
          allPatients.find((p) => String(p.id) === patientId || String(p.patientCode).toLowerCase() === target) || null;

        setPatient(targetPatient);
        // Booking dicocokkan lewat patientId (bukan nama/telepon yang bisa sama)
        setPatientBookings(targetPatient ? allBookings.filter((b) => b.patientId === targetPatient.id) : []);
      } catch (error) {
        console.error("Gagal memuat data detail pasien:", error);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const renderLayananIcon = (layanan: string) => {
    if (!layanan) return <Bandaids size={14} weight="bold" />;
    if (layanan.toLowerCase().includes("neuro")) return <Brain size={14} weight="bold" />;
    if (layanan.toLowerCase().includes("olahraga")) return <Barbell size={14} weight="bold" />;
    return <Bandaids size={14} weight="bold" />;
  };

  // Status BE: "Terkonfirmasi" | "Selesai" | "Dibatalkan"
  const renderStatus = (status: string) => {
    let colorClass = "border-green-500 text-green-600 bg-green-50/40";
    if (status === "Selesai") colorClass = "border-gray-300 text-gray-500 bg-gray-50";
    else if (status === "Dibatalkan") colorClass = "border-red-300 text-red-500 bg-red-50/40";

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${colorClass}`}>
        <CheckCircle size={14} weight="fill" />
        <span>{status || "-"}</span>
      </div>
    );
  };

  const serviceLabel = (b: AdminBooking) => (b?.focusArea?.name ? `Fisioterapi ${b.focusArea.name}` : "-");

  if (isLoading) {
    return (
      <div className="w-full py-24 text-center text-[#1b2a4e] font-bold animate-pulse">
        Memuat detail riwayat pasien...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="w-full py-24 flex flex-col items-center gap-4 text-center">
        <span className="text-[#1b2a4e] font-bold text-[18px]">Data pasien tidak ditemukan.</span>
        <Link href="/admin/pasien" className="px-6 py-3 rounded-xl font-bold text-white bg-[#F5B301] hover:bg-[#dda101]">
          Kembali ke Kelola Data Pasien
        </Link>
      </div>
    );
  }

  const patientName = patient.fullName || "-";
  const initials = patientName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  // Sesi Terkonfirmasi terdekat (list admin sudah urut jadwal terdekat dulu)
  const upcomingSession = patientBookings.find((b) => b.bookingStatus === "Terkonfirmasi") || null;
  const completedCount = patientBookings.filter((b) => b.bookingStatus === "Selesai").length;
  const activeBookings = patientBookings.filter((b) => b.bookingStatus !== "Dibatalkan");
  const progressPercent = activeBookings.length > 0 ? Math.round((completedCount / activeBookings.length) * 100) : 0;
  const mainService = patient.lastService || "-";

  return (
    <div className="w-full flex flex-col gap-6 pb-12 max-w-[1100px] mx-auto animate-in fade-in duration-300">

      {/* --- BREADCRUMB --- */}
      <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
        <Link href="/admin/pasien" className="hover:text-[#F5B301] transition-colors">Kelola Data Pasien</Link>
        <span>›</span>
        <span className="text-[#1b2a4e] font-bold">Lihat Detail</span>
      </div>

      {/* --- HEADER PROFIL --- */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#1b2a4e] text-white font-bold flex items-center justify-center text-[26px] shrink-0 border-4 border-white shadow-sm">
            {initials}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[28px] font-bold text-[#1b2a4e] leading-tight">{patientName}</h2>
            <p className="text-[14px] text-gray-500">ID Pasien: <span className="font-bold text-[#1b2a4e]">{patient.patientCode}</span></p>
          </div>
        </div>

        {/* Data kontak pasien read-only: backend tidak mengizinkan email/telepon diubah dari luar akun pasien */}
        <span className="px-4 py-2 rounded-xl text-[12px] font-medium text-gray-500 bg-gray-50 border border-gray-200 shrink-0">
          Data kontak dikelola oleh pasien melalui akunnya
        </span>
      </div>

      {/* --- 3 KARTU INFORMASI --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">

        {/* Kartu 1: Data Pasien */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2 font-bold text-[#1b2a4e]">
            <User size={20} weight="bold" />
            <span className="text-[16px]">Data Kontak Pasien</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">No Telepon</span>
              <span className="text-[14px] font-bold text-[#1b2a4e]">{patient.phone || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
              <span className="text-[14px] font-bold text-[#1b2a4e] truncate">{patient.email || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal Lahir</span>
              <span className="text-[14px] font-bold text-[#1b2a4e]">{formatTanggal(patient.dateOfBirth)}</span>
            </div>
          </div>
        </div>

        {/* Kartu 2: Ringkasan Terapi */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2 font-bold text-[#1b2a4e]">
            <ClipboardText size={20} weight="bold" />
            <span className="text-[16px]">Ringkasan Terapi</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Layanan Terakhir</span>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#F5B301] text-[#D69A00] bg-yellow-50/40 w-max">
                {renderLayananIcon(mainService)}
                <span className="text-[12px] font-bold">{mainService}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Progress Terapi</span>
                <span className="text-[14px] font-bold text-[#1b2a4e]">{completedCount}/{activeBookings.length} Sesi Selesai</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5B301] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Riwayat Booking</span>
              <span className="text-[14px] font-bold text-[#1b2a4e]">{patientBookings.length} Booking Tercatat</span>
            </div>
          </div>
        </div>

        {/* Kartu 3: Sesi Mendatang */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 font-bold text-[#1b2a4e] mb-4">
            <CalendarBlank size={20} weight="bold" />
            <span className="text-[16px]">Sesi Mendatang</span>
          </div>

          {upcomingSession ? (
            <div className="flex flex-col justify-between flex-1">
              <div className="border border-[#F5B301] bg-[#FFFBEA] rounded-xl p-4 flex gap-4 items-center">
                <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center w-14 h-14 shrink-0 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tgl</span>
                  <span className="text-[16px] font-bold text-[#1b2a4e] leading-none mt-0.5">
                    {String(upcomingSession.bookingDate).substring(8, 10)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#1b2a4e]">{serviceLabel(upcomingSession)}</span>
                  <span className="text-[12px] text-gray-500">
                    {formatTanggal(upcomingSession.bookingDate)}, {String(upcomingSession.bookingTime).substring(0, 5)} WIB
                  </span>
                  <span className="text-[12px] text-gray-500 font-semibold">
                    with {upcomingSession.therapistName}
                  </span>
                </div>
              </div>

              <Link
                href={`/admin/booking/reschedule?id=${upcomingSession.id}`}
                className="text-[#F5B301] font-bold text-[14px] hover:text-[#dda101] transition-colors mx-auto mt-4 flex items-center gap-1"
              >
                <ClockCounterClockwise size={16} weight="bold" />
                Ubah Jadwal Pasien <CaretRight size={14} weight="bold" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-4 text-center text-gray-400 text-[13px]">
              Belum ada sesi konsultasi mendatang.
            </div>
          )}
        </div>
      </div>

      {/* --- RIWAYAT SESI TABEL --- */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-[#1b2a4e]">Riwayat Konsultasi & Terapi</h3>
          <span className="text-[13px] text-gray-500 font-medium">Total {patientBookings.length} Booking</span>
        </div>

        {patientBookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">
            Belum ada riwayat sesi yang tercatat untuk pasien ini.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Waktu & Tanggal</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Layanan</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Nama Terapis</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Kode Reservasi</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {patientBookings.map((row) => {
                  const sName = serviceLabel(row);
                  const timeStr = `${String(row.bookingTime).substring(0, 5)} - ${String(row.bookingEndTime || "").substring(0, 5)} WIB`;

                  return (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 bg-white transition-colors">
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1b2a4e] text-[14px]">{formatTanggal(row.bookingDate)}</span>
                          <span className="text-[12px] text-gray-500">{timeStr}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F5B301] text-[#D69A00] bg-yellow-50/40">
                          {renderLayananIcon(sName)}
                          <span className="text-[11px] font-bold">{sName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-[14px] font-bold text-[#1b2a4e]">{row.therapistName}</td>
                      <td className="py-5 px-4 text-[13px] font-bold text-gray-500">{row.referenceCode}</td>
                      <td className="py-5 px-4 text-right">
                        {renderStatus(row.bookingStatus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default function DetailPasienPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[#1b2a4e] font-bold">Memuat detail pasien...</div>}>
      <DetailPasienContent />
    </Suspense>
  );
}
