"use client";

import { calendarHours } from "@/constants/data";
import type { PublicTherapist } from "@/types/api.types";

/** Satu sel jadwal yang sudah dinormalkan halaman pemanggil */
export interface CalendarSlot {
  id: string;
  therapistId: string;
  /** "YYYY-MM-DD..." dari API */
  slotDate: string;
  startTime: string;
  /** tersedia | penuh | tidak_praktik | lewat */
  status: string;
}

interface GridKalenderProps {
  selectedTherapists: string[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  slots: CalendarSlot[];
  therapists: Pick<PublicTherapist, "id" | "fullName">[];
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
    if (isSelected) return "bg-zinc-900 text-white border-zinc-900";
    if (status === "tersedia") return "bg-white text-zinc-800 border-zinc-200 cursor-pointer hover:border-zinc-400 transition-colors";
    if (status === "penuh") return "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed";
    if (status === "tidak_praktik") return "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed";
    if (status === "lewat") return "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed line-through";
    return "bg-zinc-50 border-zinc-100";
  };

  return (
    <div className="w-full mt-6">
      {/* Header minggu (Bisa dibikin dinamis nanti di parent) */}
      <h3 className="text-[14px] font-semibold text-zinc-900 mb-3">{title}</h3>  

      {/* Grid scroll horizontal */}
      <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
        <div className="min-w-[900px] border border-zinc-200 bg-white rounded-lg overflow-hidden">  

          {/* Baris Header: Hari (Senin-Minggu) */}
          <div className="grid grid-cols-8 bg-zinc-50 border-b border-zinc-200">
            <div className="p-4 flex items-center justify-center border-r border-zinc-200">
              <span className="text-[11px] font-medium text-zinc-400">Jam</span>
            </div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-zinc-200 last:border-0 flex flex-col justify-center">
                <span className="text-[12px] font-medium text-zinc-900">{day.name}</span>
                <span className="text-[11px] text-zinc-500">{day.date}</span>
              </div>  
            ))}
          </div>

          {/* Body: Loop per jam */}
          {calendarHours.map((hour, idx) => (
            <div key={idx} className="grid grid-cols-8 border-b border-zinc-100 last:border-0">
              
              {/* Kolom jam (kiri) */}
              <div className="p-3 flex items-center justify-center border-r border-zinc-200 bg-zinc-50">
                <span className="text-[12px] font-medium text-zinc-600">{hour}</span>
              </div>  

              {/* Kolom per hari */}
              {weekDays.map((day, dayIdx) => {
                
                // FILTER: Cocokkan slot dengan hari, jam, dan terapis
                const cellSlots = slots.filter(
                  (s) =>
                    s.slotDate.substring(0, 10) === day.fullDate &&
                    s.startTime.substring(0, 5) === hour &&
                    selectedTherapists.includes(s.therapistId)
                );

                return (
                  <div key={dayIdx} className="p-2 border-r border-zinc-100 last:border-0 min-h-[90px] flex flex-col gap-2">
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
                            {therapist?.fullName || "Terapis"}
                          </span>   
                          <span className="text-[10px] opacity-70">
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