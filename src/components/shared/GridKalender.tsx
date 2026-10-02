"use client";

import { calendarHours } from "@/constants/data";

interface GridKalenderProps {
  selectedTherapists: string[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  slots: any[];       
  therapists: any[];
  weekDays: { name: string; date: string; fullDate: string }[];
  title?: string;
}

export default function GridKalender({ 
  selectedTherapists, 
  selectedSlot, 
  onSelectSlot,
  slots,
  therapists,
  weekDays,
  title = "Pilih Jadwal"
}: GridKalenderProps) {

  // Fungsi penentu warna kotak berdasarkan statusnya
  const getSlotStyle = (status: string, isSelected: boolean) => {
  if (isSelected) return "bg-[#1b2a4e] text-white shadow-md border-transparent";      
  if (status === "tersedia") return "bg-[#BFDBFE] text-[#1e3a8a] border-[#93C5FD] cursor-pointer hover:bg-[#93C5FD] transition-colors"; 
  if (status === "penuh") return "bg-[#F3F4F6] text-gray-400 border-gray-200 cursor-not-allowed";  
  if (status === "tidak_praktik") return "bg-[#FEF2F2] text-[#EF4444] border-red-200 cursor-not-allowed";  
  if (status === "lewat") return "bg-[#F3F4F6] text-gray-400 border-gray-200 cursor-not-allowed line-through";
  return "bg-gray-50 border-gray-100";
};

  // Helper buat nyamain format jam 
  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : "";
  };

  // Helper buat ngambil tanggal aja
  const getDayNumber = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return String(date.getDate()).padStart(2, '0');
  };

  return (
    <div className="w-full mt-6">
      {/* Header minggu (Bisa dibikin dinamis nanti di parent) */}
      <h3 className="text-[18px] font-bold text-[#1b2a4e] mb-4">{title}</h3>  

      {/* Grid scroll horizontal */}
      <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
        <div className="min-w-[900px] border border-gray-200 bg-white rounded-xl overflow-hidden">  

          {/* Baris Header: Hari (Senin-Minggu) */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-4 flex items-center justify-center border-r border-gray-200">
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Jam</span>
            </div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-gray-200 last:border-0 flex flex-col justify-center">
                <span className="text-[15px] font-bold text-[#1b2a4e]">{day.name}</span>
                <span className="text-[13px] text-gray-500">{day.date}</span>
              </div>  
            ))}
          </div>

          {/* Body: Loop per jam */}
          {calendarHours.map((hour, idx) => (
            <div key={idx} className="grid grid-cols-8 border-b border-gray-100 last:border-0">
              
              {/* Kolom jam (kiri) */}
              <div className="p-3 flex items-center justify-center border-r border-gray-200 bg-gray-50">
                <span className="text-[14px] font-bold text-gray-600">{hour}</span>
              </div>  

              {/* Kolom per hari */}
              {weekDays.map((day, dayIdx) => {
                
                // FILTER: Cocokkan slot dengan hari, jam, dan terapis
                const cellSlots = (slots || []).filter(s => {
                  // Ambil format YYYY-MM-DD dari slot
                  const rawSlotDate = s.slotDate || s.slot_date || s.date;
                  let slotDateStr = "";
                  let slotDayNum = "";
                  if (typeof rawSlotDate === "string") {
                    slotDateStr = rawSlotDate.substring(0, 10); // "2026-08-16"
                    slotDayNum = slotDateStr.split("-")[2] || "";
                  } else if (rawSlotDate instanceof Date) {
                    const year = rawSlotDate.getFullYear();
                    const month = String(rawSlotDate.getMonth() + 1).padStart(2, '0');
                    const d = String(rawSlotDate.getDate()).padStart(2, '0');
                    slotDateStr = `${year}-${month}-${d}`;
                    slotDayNum = d;
                  }
                  const sTime = s.time || (s.startTime ? String(s.startTime).substring(0, 5) : "");
                  const sTherapistId = s.therapistId || s.therapist_id;
                  const isDateMatch = slotDateStr === day.fullDate || slotDayNum === day.date;
                  const isTimeMatch = sTime === hour;
                  const isTherapistMatch = (selectedTherapists || []).includes(sTherapistId);
                  return isDateMatch && isTimeMatch && isTherapistMatch;
                });
                
                 if (dayIdx === 0 && hour === "09:00") {
                  console.log("🔍 DEBUG KALENDER:");
                  console.log("Contoh 1 Slot:", slots[0]);
                  console.log("Daftar Hari Grid (weekDays):", weekDays);
                  console.log("Selected Therapists:", selectedTherapists);
                }

                return (
                  <div key={dayIdx} className="p-2 border-r border-gray-100 last:border-0 min-h-[90px] flex flex-col gap-2">
                    {cellSlots.map((slot) => {
                      const therapist = therapists.find(t => t.id === slot.therapistId);
                      const isSelected = selectedSlot === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => slot.status === "tersedia" && onSelectSlot(slot.id)}
                          className={`p-2 flex flex-col items-center justify-center text-center rounded-lg border ${getSlotStyle(slot.status, isSelected)}`}
                        >
                          {/* Pakai fallback nama terapis */}
                          <span className="text-[11px] font-bold mb-1 leading-snug">
                            {therapist?.fullName || therapist?.name || "Terapis"}
                          </span>   
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-[4px] bg-white/50 mix-blend-multiply tracking-wide">
                            {String(slot.status).replace(/_/g, " ")}
                          </span>        
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}