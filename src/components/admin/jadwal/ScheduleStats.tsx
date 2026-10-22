"use client";

import type { AdminSlot } from "@/types/api.types";

interface ScheduleStatsProps {
  slots: AdminSlot[];
  isLoading: boolean;
}

export default function ScheduleStats({ slots, isLoading }: ScheduleStatsProps) {
  const totalSlots = slots.length;
  // Terisi = ada booking aktif; tersedia = slot aktif yang masih punya kapasitas
  const bookedSlots = slots.filter((s) => s.bookedCount > 0).length;
  const availableSlots = slots.filter((s) => s.status === "aktif" && s.remaining > 0).length;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Total Slot */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[13px] font-medium">Total Slot Jadwal</span>
        <span className="text-[22px] font-bold text-brand-900">
          {isLoading ? "..." : `${totalSlots} Slot`}
        </span>
      </div>

      {/* Slot Terisi (Booked) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[13px] font-medium">Slot Terisi (Pasien)</span>
        <span className="text-[22px] font-bold text-green-500">
          {isLoading ? "..." : `${bookedSlots} Sesi`}
        </span>
      </div>

      {/* Slot Tersedia */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[13px] font-medium">Slot Tersedia</span>
        <span className="text-[22px] font-bold text-gold-700">
          {isLoading ? "..." : `${availableSlots} Slot`}
        </span>
      </div>

    </div>
  );
}
