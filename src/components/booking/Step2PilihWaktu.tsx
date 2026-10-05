"use client";

import { useState, useEffect } from "react";
import Stepper from "./Stepper";
import GridKalender from "../shared/GridKalender";
import { bookingService } from "@/services/bookingService";
import { CaretLeft, CaretRight, Stethoscope, UserCircle, WarningCircle } from "@phosphor-icons/react";

interface Step2Props {
  onBack: () => void;
  onNext: (scheduleData: any) => void;
  selectedServiceId: string;
}


export default function Step2PilihWaktu({ onBack, onNext, selectedServiceId }: Step2Props) {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // --- LOGIKA KALENDER SEBULAN FULL ---
  const [activeMonthDate, setActiveMonthDate] = useState(new Date()); // Buat Mini Kalender
  const [activeWeekStart, setActiveWeekStart] = useState(new Date()); // Buat Grid Besar

  // Helper nyari hari Senin di minggu tertentu
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(date.setDate(diff));
  };

  useEffect(() => {
    setActiveWeekStart(getMonday(new Date()));
  }, []);

  const currentMonthLabel = activeMonthDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Generate Hari buat Mini Kalender (42 Kotak / 6 Minggu)
  const generateMonthCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    let startOffset = firstDay === 0 ? 6 : firstDay - 1; // Senin = 0
    
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

  // Generate Hari buat Grid Kalender (7 Hari dari activeWeekStart)
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Generate Hari buat Grid Kalender (7 Hari dari activeWeekStart)
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

  // --- TARIK DATA API ---
  useEffect(() => {
    const fetchTherapistsAndSlots = async () => {
      setIsLoading(true);
      setErrorMessage("");
      
      try {
        if (!selectedServiceId || selectedServiceId.length < 5) {
          throw new Error("ID Layanan tidak valid. Harap kembali ke Step 1.");
        }
        const focusRes = await bookingService.getFocusAreas();
        const rawFocus = focusRes.data?.focusAreas || focusRes.focusAreas || focusRes.data || [];
        const activeFocus = rawFocus.find((f: any) => f.id === selectedServiceId);
        if (activeFocus) {
          setServiceName(`Fisioterapi ${activeFocus.name}`);
        }
        const therapistsRes = await bookingService.getTherapists(selectedServiceId);
        const rawTherapists = therapistsRes.data?.therapists || therapistsRes.therapists || therapistsRes.data || [];
        
        const normalizedTherapists = rawTherapists.map((t: any) => ({
          ...t,
          id: t.id || t.therapist_id || t.therapistId,
          fullName: t.fullName || t.full_name || t.name,
          totalPatientsLabel: t.totalPatientsLabel || t.total_patients_label || "Fisioterapis"
        }));
        setTherapists(normalizedTherapists);
        
        const therapistIds = normalizedTherapists.map((t: any) => t.id);
        setSelectedTherapists(therapistIds);

        const mondayDateString = currentWeekDays[0].fullDate;
        const slotsPromises = therapistIds.map(async (tId: string) => {
          const res = await bookingService.getScheduleGrid(tId, mondayDateString);
          return { res, currentTherapistId: tId };
        });
        const slotsResponses = await Promise.all(slotsPromises);
        let allSlots: any[] = [];
        slotsResponses.forEach(({ res, currentTherapistId }) => {
          // Tangkap data slots dari berbagai kemungkinan format respon BE
          const rawSlots = res.data?.slots || res.slots || res.data || [];
          
          if (Array.isArray(rawSlots)) {
            const mappedSlots = rawSlots.map((s: any) => {
              const rawDate = s.slotDate || s.slot_date || s.date;
              const rawTime = s.startTime || s.start_time || s.time || "";
              
              // 👉 INI KUNCINYA: Pastikan therapistId selalu terisi dengan ID terapis pemanggilnya
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

        console.log("🔥 Final allSlots siap masuk kalender:", allSlots);
        setSlots(allSlots);
      } catch (error: any) {
        console.error("Gagal narik data:", error);
        setErrorMessage(error.message || "Gagal menarik data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapistsAndSlots();
  }, [selectedServiceId, activeWeekStart]);
  const handleTherapistToggle = (therapistId: string) => {
    setSelectedTherapists((prev) => 
      prev.includes(therapistId) 
        ? prev.filter((id) => id !== therapistId) 
        : [...prev, therapistId]
    );
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

  const handleNextStep2 = () => {
    const selectedSlotObj = slots.find((s) => s.id === selectedSlot);
    const selectedTherapistObj = therapists.find((t) => t.id === selectedSlotObj?.therapistId);
    onNext({
      slotId: selectedSlot,
      scheduleId: selectedSlot,
      serviceName: serviceName,
      therapistId: selectedSlotObj?.therapistId,
      therapistName: selectedTherapistObj?.fullName || "Fisioterapis",
      slotDate: selectedSlotObj?.slotDate,
      startTime: selectedSlotObj?.startTime,
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-[32px] md:text-[36px] font-bold text-brand-900 mb-3">Tentukan Waktu & Terapis</h2>
        <p className="text-[#585858] text-[15px] md:text-[16px]">Pilih jadwal kunjungan yang paling nyaman bagi Anda.</p>
      </div>

      <Stepper currentStep={2} />

      {errorMessage && (
        <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
          <WarningCircle size={24} weight="fill" />
          <span className="font-medium text-[14px]">{errorMessage} <br/> (Info Dev: Step 1 masih kirim ID mock, belum nyambung API).</span>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* --- UI KALENDER MINI FULL SEBULAN --- */}
        <div className="w-full md:w-[320px] bg-white border border-gray-200 rounded-[16px] p-6 h-fit shrink-0">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold transition-colors">
              <CaretLeft weight="bold" />
            </button>
            <h4 className="font-bold text-brand-900 text-[15px] capitalize">{currentMonthLabel}</h4>
            <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 font-bold transition-colors">
              <CaretRight weight="bold" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(day => (
              <span key={day} className="text-[12px] font-bold text-gray-400">{day}</span>
            ))}
            {calendarMatrix.map((day, i) => {
              const isSelectedWeek = day.fullDate >= activeWeekStart && day.fullDate < new Date(activeWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <div key={i} onClick={() => handleSelectDate(day.fullDate)} className="flex flex-col items-center justify-center cursor-pointer">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors
                    ${isSelectedWeek ? "bg-brand-50 text-gold-700 font-bold border border-brand-100" : day.isCurrentMonth ? "text-brand-900 hover:bg-gray-100" : "text-gray-300"}
                  `}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FILTER TERAPIS --- */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full bg-white border border-gray-200 rounded-[16px] p-6 min-h-[220px]">
            <h4 className="font-bold text-brand-900 text-[16px] mb-1">Pilih Fisioterapis</h4>
            <p className="text-[#585858] text-[13px] mb-4">Terapis yang ditampilkan hanya yang memegang layanan pilihan Anda</p>
            
            {isLoading ? (
               <div className="w-full h-24 flex items-center justify-center">
                  <span className="text-gray-400 font-medium animate-pulse">Memuat daftar terapis...</span>
               </div>
            ) : therapists.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {therapists.map(therapist => {
                  const isChecked = selectedTherapists.includes(therapist.id);
                  return (
                    <div 
                      key={therapist.id} 
                      onClick={() => handleTherapistToggle(therapist.id)}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all duration-200
                        ${isChecked ? "border-brand-600 bg-brand-50 shadow-sm" : "border-gray-100 hover:bg-gray-50"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[48px] h-[48px] rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                          {therapist.photoUrl ? <img src={therapist.photoUrl} alt="Terapis" className="w-full h-full object-cover" /> : <UserCircle size={36} weight="fill" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-brand-900">{therapist.fullName}</span>
                          <span className="text-[11px] text-gray-500 mt-0.5">{therapist.totalPatientsLabel || "Fisioterapis"}</span>
                        </div>
                      </div>
                      <input type="checkbox" className="w-4 h-4 accent-brand-600 pointer-events-none" checked={isChecked} readOnly />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="w-full p-4 rounded-xl bg-gray-50 text-center border border-gray-100 text-gray-400 text-[13px]">
                Data terapis belum bisa ditampilkan.
              </div>
            )}
          </div>

          <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Stethoscope size={24} className="text-[#3B82F6] shrink-0" weight="fill" />
              <span className="text-[14px] font-medium text-brand-900">
                {serviceName || "Memuat layanan..."}
              </span>
            </div>
            <button onClick={onBack} className="text-gold-700 text-[14px] font-bold px-4 py-1.5 border border-brand-600 rounded-lg bg-white hover:bg-brand-50">
              Ubah
            </button>
          </div>
        </div>
      </div>

      {!errorMessage && (
        <GridKalender 
          selectedTherapists={selectedTherapists}
          selectedSlot={selectedSlot}
          onSelectSlot={(id) => setSelectedSlot(id)}
          slots={slots}             
          therapists={therapists}
          weekDays={currentWeekDays}
        />
      )}

      <div className="w-full flex justify-between mt-10">
        <button onClick={onBack} className="text-gold-700 font-bold flex items-center gap-2 px-6 py-3 rounded-[12px] hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-colors">
          <CaretLeft weight="bold" /> Kembali
        </button>
        <button 
          disabled={!selectedSlot} 
          onClick={handleNextStep2}
          className={`px-10 py-3 rounded-[12px] font-bold flex items-center gap-2 transition-all duration-300
            ${selectedSlot ? "bg-brand-600 hover:bg-brand-700 text-brand-950 shadow-md cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"}
          `}
        >
          Lanjut <CaretRight weight="bold" />
        </button>
      </div>

    </div>
  );
}