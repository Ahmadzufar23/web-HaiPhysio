"use client";

interface ScheduleStatsProps {
  slots: any[];
  isLoading: boolean;
}

export default function ScheduleStats({ slots, isLoading }: ScheduleStatsProps) {
  // Hitung jumlah slot
  const totalSlots = slots.length;
  
  const bookedSlots = slots.filter((s: any) => {
    const isBooked = s.is_booked || s.isBooked;
    const status = (s.status || "").toLowerCase();
    return isBooked || status === "tidak tersedia" || status === "terisi" || status === "booked";
  }).length;

  const availableSlots = slots.filter((s: any) => {
    const isActive = s.isActive !== false && s.is_active !== false;
    const isBooked = s.is_booked || s.isBooked;
    const status = (s.status || "").toLowerCase();
    return isActive && !isBooked && (status === "tersedia" || status === "available" || status === "");
  }).length;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Total Slot */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[14px] font-medium">Total Slot Jadwal</span>
        <span className="text-[32px] font-bold text-brand-900">
          {isLoading ? "..." : `${totalSlots} Slot`}
        </span>
      </div>

      {/* Slot Terisi (Booked) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[14px] font-medium">Slot Terisi (Pasien)</span>
        <span className="text-[32px] font-bold text-green-500">
          {isLoading ? "..." : `${bookedSlots} Sesi`}
        </span>
      </div>

      {/* Slot Tersedia */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-2">
        <span className="text-[#585858] text-[14px] font-medium">Slot Tersedia</span>
        <span className="text-[32px] font-bold text-gold-700">
          {isLoading ? "..." : `${availableSlots} Slot`}
        </span>
      </div>

    </div>
  );
}
