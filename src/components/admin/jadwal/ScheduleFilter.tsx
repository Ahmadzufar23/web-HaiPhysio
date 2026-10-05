"use client";

import { useState } from "react";
import { CaretDown, CalendarBlank, ArrowRight } from "@phosphor-icons/react";

interface ScheduleFilterProps {
  therapists: any[];
  selectedTherapistId: string;
  onTherapistChange: (id: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export default function ScheduleFilter({
  therapists,
  selectedTherapistId,
  onTherapistChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: ScheduleFilterProps) {
  const todayStr = () => new Date().toISOString().split("T")[0];

  const setRange = (offsetStart: number, offsetEnd: number) => {
    const s = new Date();
    const e = new Date();
    s.setDate(s.getDate() + offsetStart);
    e.setDate(e.getDate() + offsetEnd);
    onDateFromChange(s.toISOString().split("T")[0]);
    onDateToChange(e.toISOString().split("T")[0]);
  };

  // Hitung berapa hari di rentang yang aktif
  const countDays = () => {
    if (!dateFrom || !dateTo) return 1;
    const diff = Math.floor((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };
  const dayCount = countDays();

  const shortcuts = [
    { label: "Hari Ini", fn: () => { onDateFromChange(todayStr()); onDateToChange(todayStr()); } },
    { label: "Besok", fn: () => setRange(1, 1) },
    { label: "Minggu Ini", fn: () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun
      const diffToMon = day === 0 ? -6 : 1 - day;
      const diffToSun = day === 0 ? 0 : 7 - day;
      setRange(diffToMon, diffToSun);
    }},
    { label: "7 Hari ke Depan", fn: () => setRange(0, 6) },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">

      {/* Baris 1: Terapis + Shortcut */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">

        {/* Filter Fisioterapis */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[13px] font-bold text-brand-900">Fisioterapis</label>
          <div className="relative">
            <select
              value={selectedTherapistId}
              onChange={(e) => onTherapistChange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-brand-900 text-[14px] font-semibold py-3 pl-4 pr-10 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
            >
              <option value="">Semua Fisioterapis</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.full_name || t.name || "Fisioterapis"}
                </option>
              ))}
            </select>
            <CaretDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[13px] font-bold text-brand-900 flex items-center gap-1.5">
            <CalendarBlank size={14} weight="bold" />
            Rentang Tanggal
            {dayCount > 1 && (
              <span className="ml-1 px-2 py-0.5 bg-brand-50 text-gold-700 text-[11px] font-bold rounded-full border border-brand-600/30">
                {dayCount} hari
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                onDateFromChange(e.target.value);
                if (e.target.value > dateTo) onDateToChange(e.target.value);
              }}
              className="flex-1 bg-white border border-gray-200 text-brand-900 text-[14px] font-semibold py-3 px-3 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
            />
            <ArrowRight size={16} className="text-gray-400 shrink-0" />
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => onDateToChange(e.target.value)}
              className="flex-1 bg-white border border-gray-200 text-brand-900 text-[14px] font-semibold py-3 px-3 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Baris 2: Shortcut Cepat */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] text-gray-400 font-semibold shrink-0">Cepat:</span>
        {shortcuts.map((s) => {
          const isActive =
            (s.label === "Hari Ini" && dateFrom === todayStr() && dateTo === todayStr());
          return (
            <button
              key={s.label}
              onClick={s.fn}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all border ${
                isActive
                  ? "bg-brand-50 text-gold-700 border-brand-600/40"
                  : "text-brand-900 bg-gray-100 hover:bg-brand-50 hover:text-gold-800 border-transparent hover:border-brand-600/30"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
