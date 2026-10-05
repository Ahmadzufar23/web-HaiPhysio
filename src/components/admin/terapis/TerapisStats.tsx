"use client";

import { UsersThree, CheckCircle, CalendarX } from "@phosphor-icons/react";

interface TerapisStatsProps {
  therapists: any[];
  isLoading: boolean;
}

export default function TerapisStats({ therapists, isLoading }: TerapisStatsProps) {
  const total = therapists.length;
  const active = therapists.filter((t: any) => t.status === "aktif" || (t.status === undefined && t.isActive !== false && t.is_active !== false)).length;
  const inactive = total - active;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Total Terapis */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-brand-50 text-gold-700 flex items-center justify-center shrink-0">
          <UsersThree size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Total Fisioterapis</span>
          <span className="text-[32px] font-bold text-brand-900 leading-none">
            {isLoading ? "..." : `${total} Terapis`}
          </span>
        </div>
      </div>

      {/* Terapis Aktif */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
          <CheckCircle size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Terapis Aktif</span>
          <span className="text-[32px] font-bold text-green-600 leading-none">
            {isLoading ? "..." : `${active} Terapis`}
          </span>
        </div>
      </div>

      {/* Terapis Nonaktif / Cuti */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0">
          <CalendarX size={28} weight="fill" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#585858] text-[13px] font-medium">Sedang Cuti / Nonaktif</span>
          <span className="text-[32px] font-bold text-red-500 leading-none">
            {isLoading ? "..." : `${inactive} Terapis`}
          </span>
        </div>
      </div>

    </div>
  );
}
