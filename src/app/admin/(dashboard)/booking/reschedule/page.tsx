"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CaretRight, CaretLeft, CaretRight as CaretRightIcon, 
  Barbell, CalendarBlank, CheckSquare, CheckCircle, NotePencil, Brain, Bandaids 
} from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { AdminBooking, AdminSlot, AdminTherapist } from "@/types/api.types";

function RescheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || "";

  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [therapists, setTherapists] = useState<AdminTherapist[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().substring(0, 10);
  });
  // Slot ASLI dari backend untuk terapis + tanggal terpilih (bukan daftar jam statis)
  // `key` = kombinasi terapis|tanggal yang datanya sudah dimuat → status loading diturunkan
  // dari sini (tanpa setState sinkron di dalam effect)
  const [loadedSlots, setLoadedSlots] = useState<{ key: string; slots: AdminSlot[] }>({ key: "", slots: [] });
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load booking (WAJIB sesuai ?id=) & terapis yang menangani layanan booking tsb
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!bookingId) {
          setBooking(null);
          return;
        }

        const [bookingsRes, therapistsRes] = await Promise.all([
          adminService.getBookings(),
          adminService.getTherapists(),
        ]);

        const allBookings = bookingsRes.data?.bookings || [];
        // Tidak ada fallback ke booking lain: kalau ID tidak cocok, halaman menolak.
        const targetBooking = allBookings.find((b) => String(b.id) === String(bookingId)) || null;
        setBooking(targetBooking);
        if (!targetBooking) return;

        // Hanya terapis aktif yang punya spesialisasi sesuai layanan booking (BE juga memvalidasi ini)
        const focusId = targetBooking.focusArea?.id;
        const listTherapists = (therapistsRes.data?.therapists || []).filter(
          (t) => t.status === "aktif" && (!focusId || (t.specializations || []).some((s) => s.id === focusId))
        );
        setTherapists(listTherapists);

        if (listTherapists.some((t) => t.id === targetBooking.therapistId)) {
          setSelectedTherapistId(targetBooking.therapistId);
        } else if (listTherapists.length > 0) {
          setSelectedTherapistId(listTherapists[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat data booking:", error);
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // 2. Load slot asli dari backend setiap terapis / tanggal berubah
  const slotsKey = selectedTherapistId && selectedDate ? `${selectedTherapistId}|${selectedDate}` : "";
  useEffect(() => {
    if (!slotsKey) return;
    let cancelled = false;
    adminService
      .getSlots({ date_from: selectedDate, date_to: selectedDate, therapist_id: selectedTherapistId })
      .then((res) => {
        if (!cancelled) setLoadedSlots({ key: slotsKey, slots: res.data.slots });
      })
      .catch((error) => {
        console.error("Gagal memuat slot:", error);
        if (!cancelled) setLoadedSlots({ key: slotsKey, slots: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [slotsKey, selectedTherapistId, selectedDate]);

  const isSlotsLoading = slotsKey !== "" && loadedSlots.key !== slotsKey;
  const daySlots = isSlotsLoading ? [] : loadedSlots.slots;

  // Ganti terapis / tanggal → pilihan slot lama tidak berlaku lagi
  const changeTherapist = (id: string) => {
    setSelectedTherapistId(id);
    setSelectedSlotId("");
  };
  const changeDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId("");
  };

  // Slot bisa dipilih hanya kalau aktif, masih ada kuota, bukan slot booking saat ini
  const getSlotState = (slot: AdminSlot): "Tersedia" | "Penuh" | "Tutup" | "Jadwal Saat Ini" => {
    if (slot.status !== "aktif") return "Tutup";
    if ((slot.remaining ?? 0) <= 0) return "Penuh";
    const sameAsCurrent =
      String(slot.slotDate).substring(0, 10) === String(booking?.bookingDate).substring(0, 10) &&
      String(slot.startTime).substring(0, 5) === String(booking?.bookingTime).substring(0, 5) &&
      slot.therapistId === booking?.therapistId;
    return sameAsCurrent ? "Jadwal Saat Ini" : "Tersedia";
  };

  // Handle Simpan Reschedule ke Backend
  const handleSave = async () => {
    if (!booking?.id) {
      alert("Data booking tidak ditemukan.");
      return;
    }
    if (!reason.trim()) {
      alert("Alasan perubahan jadwal wajib diisi!");
      return;
    }
    if (!selectedSlotId) {
      alert("Pilih slot jadwal pengganti yang tersedia terlebih dahulu!");
      return;
    }

    setIsSaving(true);
    try {
      // Admin boleh pakai PATCH /api/bookings/:id/reschedule (reschedule_reason wajib untuk admin).
      // Slot TIDAK dibuat otomatis — kalau jam yang diinginkan belum ada, admin membuatnya
      // dulu lewat menu Kelola Slot Jadwal.
      await adminService.rescheduleBooking(booking.id, selectedSlotId, reason.trim());

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/admin/booking");
      }, 1500);
    } catch (error) {
      console.error("Gagal reschedule:", error);
      alert(getApiErrorMessage(error, "Gagal memproses reschedule jadwal pasien."));
    } finally {
      setIsSaving(false);
    }
  };

  const renderLayananIcon = (layanan: string) => {
    if (layanan.toLowerCase().includes("neuro")) return <Brain size={14} weight="bold" />;
    if (layanan.toLowerCase().includes("olahraga")) return <Barbell size={14} weight="bold" />;
    return <Bandaids size={14} weight="bold" />;
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 text-center text-brand-900 font-bold animate-pulse">
        Memuat data reservasi pasien...
      </div>
    );
  }

  // Booking wajib ada & masih Terkonfirmasi — tidak ada data pengganti/dummy
  if (!booking || booking.bookingStatus !== "Terkonfirmasi") {
    return (
      <div className="w-full py-24 flex flex-col items-center gap-4 text-center">
        <span className="text-brand-900 font-bold text-[18px]">
          {!booking ? "Data booking tidak ditemukan." : `Booking ini berstatus ${booking.bookingStatus} dan tidak bisa di-reschedule.`}
        </span>
        <Link href="/admin/booking" className="px-6 py-3 rounded-xl font-bold text-brand-950 bg-brand-600 hover:bg-brand-700">
          Kembali ke List Booking
        </Link>
      </div>
    );
  }

  const patientName = booking.patientName || "-";
  const refCode = booking.referenceCode || "-";
  const currentSchedule = `${new Date(booking.bookingDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}, ${String(booking.bookingTime).substring(0, 5)} WIB`;
  const serviceName = booking.focusArea?.name ? `Fisioterapi ${booking.focusArea.name}` : "-";
  const patientInitials = patientName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      
      {/* --- BREADCRUMB & JUDUL --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link href="/admin/booking" className="hover:text-gold-700 transition-colors">List Booking Masuk</Link>
          <CaretRight size={14} />
          <span className="text-brand-900 font-bold">Reschedule</span>
        </div>
        <h2 className="text-[28px] font-bold text-brand-900">Reschedule Jadwal Pasien</h2>
        <p className="text-[#585858] text-[15px]">Sesuaikan kembali waktu konsultasi atau sesi fisioterapi pasien secara fleksibel.</p>
      </div>

      {/* --- KARTU INFO PASIEN (DINAMIS DARI DATABASE) --- */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-900 text-white font-bold flex items-center justify-center text-[16px]">
            {patientInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pasien</span>
            <span className="text-[16px] font-bold text-brand-900">{patientName}</span>
          </div>
        </div>
        
        <div className="hidden md:block w-[1px] h-10 bg-gray-200"></div>
        
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">ID Reservasi</span>
          <span className="text-[16px] font-bold text-brand-900">{refCode}</span>
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-gray-200"></div>

        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jadwal Saat Ini</span>
          <div className="flex items-center gap-2 text-brand-900 font-bold text-[15px]">
            <CalendarBlank size={18} className="text-gold-700" />
            {currentSchedule}
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-gray-200"></div>

        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Layanan</span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-600 text-gold-700 bg-brand-50/40">
            {renderLayananIcon(serviceName)}
            <span className="text-[12px] font-bold">{serviceName}</span>
          </div>
        </div>
      </div>

      {/* --- PILIH TANGGAL & TERAPIS BARU --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        
        {/* Kiri: Pilih Tanggal Baru */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-[15px] font-bold text-brand-900">1. Pilih Tanggal Baru</h4>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-500">Tanggal Pengganti</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => changeDate(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900 font-semibold"
            />
          </div>
          <div className="bg-brand-50/60 border border-brand-100 p-4 rounded-xl text-[13px] text-brand-900 leading-relaxed">
            Pilihlah tanggal dan slot waktu kosong yang disepakati bersama pasien.
          </div>
        </div>

        {/* Kanan: Pilih Fisioterapis & Slot Waktu */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h4 className="text-[15px] font-bold text-brand-900">2. Pilih Fisioterapis & Slot Jam</h4>
          
          {/* List Terapis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {therapists.map((t) => {
              const isSelected = String(t.id) === String(selectedTherapistId);
              return (
                <div 
                  key={t.id}
                  onClick={() => changeTherapist(t.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? "border-brand-900 bg-brand-50/40 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                      {(t.fullName || "T").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-brand-900">{t.fullName}</span>
                      <span className="text-[11px] text-gray-500">{(t.specializations || []).map((s) => s.name).join(", ") || "Fisioterapis"}</span>
                    </div>
                  </div>
                  {isSelected && <CheckSquare size={22} weight="fill" className="text-brand-900" />}
                </div>
              );
            })}
          </div>

          {/* Slot Waktu */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[13px] font-bold text-brand-900">Pilihan Slot Jam (dari jadwal terapis)</span>
            {therapists.length === 0 ? (
              <p className="text-[13px] text-gray-500">Tidak ada terapis aktif untuk layanan ini.</p>
            ) : isSlotsLoading ? (
              <p className="text-[13px] text-gray-500 animate-pulse">Memuat slot...</p>
            ) : daySlots.length === 0 ? (
              <p className="text-[13px] text-gray-500">
                Belum ada slot untuk terapis ini di tanggal tersebut. Buat slot terlebih dahulu di menu{" "}
                <Link href="/admin/jadwal" className="font-bold text-gold-700 hover:underline">Kelola Slot Jadwal</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {daySlots.map((slot) => {
                  const state = getSlotState(slot);
                  const isSelected = selectedSlotId === slot.id;
                  const isDisabled = state !== "Tersedia";

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`py-3 px-2 rounded-xl text-[12px] font-bold border transition-all text-center flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? "bg-brand-900 text-white border-brand-900 shadow-sm"
                          : isDisabled
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-gray-200 text-brand-900 hover:border-brand-600"
                      }`}
                    >
                      <span>{String(slot.startTime).substring(0, 5)} - {String(slot.endTime).substring(0, 5)} WIB</span>
                      <span className="text-[10px] font-semibold opacity-80">{state}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- FORM ALASAN & TOMBOL SIMPAN --- */}
      <div className="w-full flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <NotePencil size={20} className="text-gold-700" />
            <h4 className="text-[15px] font-bold text-brand-900">Alasan Ubah Jadwal <span className="text-red-500">*</span></h4>
          </div>
          <textarea 
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Pasien meminta pengunduran jadwal karena urusan pekerjaan mendadak."
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 transition-colors text-[14px] resize-none text-brand-900"
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/admin/booking"
            className="flex-1 py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-[#585858] bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <CaretLeft size={18} />
            Batal & Kembali
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedSlotId || !reason.trim()}
            className="flex-1 py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-brand-950 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? "Memproses..." : "Simpan Perubahan"}
            <CaretRightIcon size={18} />
          </button>
        </div>
      </div>

      {/* --- TOAST SUKSES --- */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(2,122,72,0.1)] z-50 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle size={20} weight="fill" />
          <span className="text-[14px] font-bold">Jadwal Pasien Berhasil Diubah</span>
        </div>
      )}

    </div>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-brand-900 font-bold">Memuat halaman reschedule...</div>}>
      <RescheduleContent />
    </Suspense>
  );
}