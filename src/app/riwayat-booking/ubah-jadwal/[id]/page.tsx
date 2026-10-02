"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingService } from "@/services/bookingService";
import GridKalender from "@/components/shared/GridKalender";
import { UserCircle, CaretLeft, CaretRight, Stethoscope } from "@phosphor-icons/react";

export default function UbahJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State penyimpan data dari database
  const [bookingData, setBookingData] = useState<any>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  // State untuk nyimpen pilihan dan inputan user
  const [selectedTerapis, setSelectedTerapis] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [alasan, setAlasan] = useState("");
  const [kirimNotif, setKirimNotif] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // --- LOGIKA KALENDER SEBULAN & MINGGUAN DINAMIS ---
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const [activeMonthDate, setActiveMonthDate] = useState(new Date()); // Buat Mini Kalender
  const [activeWeekStart, setActiveWeekStart] = useState(getMonday(new Date())); // Buat Grid Besar

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentMonthLabel = activeMonthDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Generate Hari buat Mini Kalender (42 Kotak)
  const generateMonthCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: daysInPrevMonth - i, isCurrentMonth: false, fullDate: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true, fullDate: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, fullDate: new Date(year, month + 1, i) });
    }
    return days;
  };

  const calendarMatrix = generateMonthCalendar(activeMonthDate);

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      days.push({
        name: nextDay.toLocaleDateString("id-ID", { weekday: "short" }),
        date: String(nextDay.getDate()).padStart(2, "0"),
        fullDate: formatLocalDate(nextDay)
      });
    }
    return days;
  };

  const currentWeekDays = getWeekDays(activeWeekStart);

  // Proses narik data saat halaman dibuka atau minggu berganti
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const bookingRes = await bookingService.getDetailBooking(id);
        const booking = bookingRes.data?.booking || bookingRes.booking;
        setBookingData(booking);

        // Layanan yang dipesan ada di booking.focusArea (bukan spesialisasi pertama terapis,
        // karena terapis bisa punya lebih dari satu spesialisasi)
        const focusId = booking?.focusArea?.id || booking?.therapistSpecializations?.[0]?.id;

        if (focusId) {
          const therapistsRes = await bookingService.getTherapists(focusId);
          const rawTherapists = therapistsRes.data?.therapists || therapistsRes.therapists || therapistsRes.data || [];

          const normalizedTherapists = rawTherapists.map((t: any) => ({
            ...t,
            id: t.id || t.therapist_id || t.therapistId,
            fullName: t.fullName || t.full_name || t.name,
            totalPatientsLabel: t.totalPatientsLabel || t.total_patients_label || "Fisioterapis"
          }));

          setTherapists(normalizedTherapists);

          const therapistIds = normalizedTherapists.map((t: any) => t.id);
          setSelectedTerapis(therapistIds);

          const mondayDateString = currentWeekDays[0].fullDate;
          const slotsPromises = therapistIds.map(async (tId: string) => {
            const res = await bookingService.getScheduleGrid(tId, mondayDateString);
            return { res, currentTherapistId: tId };
          });

          const slotsResponses = await Promise.all(slotsPromises);

          let allSlots: any[] = [];
          slotsResponses.forEach(({ res, currentTherapistId }) => {
            const rawSlots = res.data?.slots || res.slots || res.data || [];
            if (Array.isArray(rawSlots)) {
              const mappedSlots = rawSlots.map((s: any) => {
                const rawDate = s.slotDate || s.slot_date || s.date;
                const rawTime = s.startTime || s.start_time || s.time || "";
                const finalTherapistId = s.therapistId || s.therapist_id || currentTherapistId;
                const rawStatus = s.cellStatus || s.cell_status || s.status || "Tersedia";
                const dateObj = new Date(rawDate);
                const dayStr = String(dateObj.getDate()).padStart(2, "0");
                const timeStr = String(rawTime).substring(0, 5);

                return {
                  ...s,
                  id: s.id || s.slotId || s.slot_id,
                  slotDate: rawDate,
                  startTime: rawTime,
                  therapistId: finalTherapistId,
                  date: dayStr,
                  time: timeStr,
                  // BE: cellStatus "Tersedia" | "Penuh" | "Tidak Praktik" + flag isPast (jam sudah lewat -> ditolak saat booking)
                  status: s.isPast ? "lewat" : String(rawStatus).toLowerCase().replace(/\s+/g, "_")
                };
              });
              allSlots = [...allSlots, ...mappedSlots];
            }
          });
          setSlots(allSlots);
        }
      } catch (error) {
        console.error("Gagal menarik data jadwal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id, activeWeekStart]);

  const handleToggleTerapis = (therapistId: string) => {
    if (selectedTerapis.includes(therapistId)) {
      setSelectedTerapis(selectedTerapis.filter(t => t !== therapistId));
    } else {
      setSelectedTerapis([...selectedTerapis, therapistId]);
    }
    setSelectedSlot(null);
  };

  const handlePrevMonth = () => {
    setActiveMonthDate(new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveMonthDate(new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (dateObj: Date) => {
    setActiveWeekStart(getMonday(dateObj));
    setSelectedSlot(null);
  };

  const handleLanjut = () => {
    if (!selectedSlot) return;
    const url = `/riwayat-booking/ubah-jadwal/${id}/konfirmasi?slotId=${selectedSlot}&reason=${encodeURIComponent(alasan)}`;
    router.push(url);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-[120px] pb-24 flex justify-center items-center bg-[#FAFAFA]">
        <span className="text-[#1b2a4e] font-bold animate-pulse">Menyiapkan jadwal pengganti...</span>
      </div>
    );
  }

  const namaLayanan = (bookingData?.focusArea?.name || bookingData?.therapistSpecializations?.[0]?.name) || "Fisioterapi";

  return (
    <div className="w-full min-h-screen pt-[120px] pb-24 px-5 md:px-[80px] bg-[#FAFAFA] flex flex-col items-center">
      <div className="w-full max-w-[1100px] bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 h-fit">

        <h1 className="text-[24px] md:text-[28px] font-bold text-[#1b2a4e] mb-2">Ubah Jadwal Terapis</h1>
        <p className="text-gray-500 text-[14px] mb-8">Pilih tanggal dan jadwal baru untuk sesi {namaLayanan} Anda.</p>

        {/* --- DUA KOLOM: MINI KALENDER (KIRI) & PILIH TERAPIS (KANAN) --- */}
        <div className="w-full flex flex-col lg:flex-row gap-6 mb-8">
          
          {/* Mini Kalender Full Sebulan */}
          <div className="w-full lg:w-[320px] bg-white border border-gray-200 rounded-[20px] p-6 h-fit shrink-0 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold transition-colors">
                <CaretLeft weight="bold" />
              </button>
              <h4 className="font-bold text-[#1b2a4e] text-[15px] capitalize">{currentMonthLabel}</h4>
              <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold transition-colors">
                <CaretRight weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-3 text-center">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(day => (
                <span key={day} className="text-[12px] font-bold text-gray-400">{day}</span>
              ))}
              {calendarMatrix.map((day, i) => {
                const isSelectedWeek = day.fullDate >= activeWeekStart && day.fullDate < new Date(activeWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div key={i} onClick={() => handleSelectDate(day.fullDate)} className="flex flex-col items-center justify-center cursor-pointer">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors
                      ${isSelectedWeek ? "bg-[#FFFBEA] text-[#F5B301] font-bold border border-[#FDE68A]" : day.isCurrentMonth ? "text-[#1b2a4e] hover:bg-gray-100" : "text-gray-300"}
                    `}>
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Terapis */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Box Daftar Terapis */}
            <div className="w-full bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm min-h-[200px]">
              <h3 className="text-[16px] font-bold text-[#1b2a4e] mb-1">Pilih Fisioterapis</h3>
              <p className="text-[#585858] text-[13px] mb-4">Terapis yang ditampilkan sesuai dengan layanan {namaLayanan} Anda</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {therapists.map(therapist => {
                  const isChecked = selectedTerapis.includes(therapist.id);
                  return (
                    <div
                      key={therapist.id}
                      onClick={() => handleToggleTerapis(therapist.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked ? "border-[#F5B301] bg-[#FFFBEA] shadow-sm" : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {therapist.photoUrl ? (
                        <img src={therapist.photoUrl} alt={therapist.fullName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <UserCircle size={40} className="text-gray-300" weight="fill" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#1b2a4e] truncate">{therapist.fullName}</p>
                        <p className="text-[11px] text-gray-500">{therapist.totalPatientsLabel || "Fisioterapis"}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 accent-[#F5B301] pointer-events-none shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Box Informasi Layanan Terpilih */}
            <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Stethoscope size={22} className="text-[#3B82F6]" weight="fill" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium">Layanan yang Sedang Diubah:</span>
                <span className="text-[14px] font-bold text-[#1b2a4e]">Fisioterapi {namaLayanan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Kalender Jadwal Besar */}
        <GridKalender
          title="Pilih Jadwal Pengganti"
          selectedTherapists={selectedTerapis}
          selectedSlot={selectedSlot}
          onSelectSlot={(slotId) => setSelectedSlot(slotId)}
          slots={slots}
          therapists={therapists}
          weekDays={currentWeekDays}
        />

        {/* Input Alasan Ubah Jadwal */}
        <div className="mt-8 mb-6">
          <label className="block text-[14px] font-bold text-[#1b2a4e] mb-2">Alasan Ubah Jadwal (Opsional)</label>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Contoh: Saya berhalangan hadir karena ada urusan mendadak..."
            rows={3}
            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-[#F5B301] text-[14px] resize-none transition-colors"
          />
        </div>

        {/* Opsi Kirim Notifikasi WhatsApp */}
        <label className="flex items-start gap-3 mb-10 cursor-pointer">
          <input
            type="checkbox"
            checked={kirimNotif}
            onChange={() => setKirimNotif(!kirimNotif)}
            className="w-5 h-5 mt-0.5 accent-[#F5B301] rounded cursor-pointer"
          />
          <span className="text-[14px] text-gray-600 leading-relaxed">
            Kirim detail perubahan jadwal ini ke WhatsApp saya secara otomatis.
          </span>
        </label>

        {/* Area Tombol Navigasi */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
          <Link
            href={`/riwayat-booking`}
            className="flex-1 py-4 text-center rounded-xl border border-gray-200 text-gray-600 font-bold text-[15px] hover:bg-gray-50 transition-colors"
          >
            Kembali
          </Link>

          <button
            onClick={handleLanjut}
            disabled={!selectedSlot}
            className={`flex-1 py-4 text-center rounded-xl font-bold text-[15px] transition-colors ${
              selectedSlot ? "bg-[#F5B301] text-white hover:bg-[#dda101] shadow-md" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Lanjut
          </button>
        </div>

      </div>
    </div>
  );
}
