"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkle, Plus, CalendarBlank, Users, CheckCircle, WarningCircle, Clock } from "@phosphor-icons/react";
import ScheduleStats from "@/components/admin/jadwal/ScheduleStats";
import ScheduleFilter from "@/components/admin/jadwal/ScheduleFilter";
import ScheduleGrid from "@/components/admin/jadwal/ScheduleGrid";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";

// Jam standar klinik — tampil sebagai checklist di modal generate
const ALL_HOURS = [
  { start: "07:00", end: "08:00" },
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];
// Default aktif (jam standar klinik)
const DEFAULT_ACTIVE = new Set(["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]);

const todayStr = () => new Date().toISOString().split("T")[0];
const offsetStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

export default function AdminJadwalPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState("");

  // === Filter Date Range ===
  const [filterDateFrom, setFilterDateFrom] = useState(todayStr);
  const [filterDateTo, setFilterDateTo] = useState(todayStr);

  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ count: number; skipped: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  // === State modal generate ===
  const [genStartDate, setGenStartDate] = useState(todayStr);
  const [genEndDate, setGenEndDate] = useState(() => offsetStr(6));
  const [genTherapistId, setGenTherapistId] = useState("");
  // Jam yang dipilih (key = start time)
  const [selectedHours, setSelectedHours] = useState<Set<string>>(new Set(DEFAULT_ACTIVE));

  const showNotification = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Ambil daftar terapis
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await adminService.getTherapists();
        const list = res.data.therapists || [];
        setTherapists(list);
      } catch (error) {
        console.error("Gagal memuat terapis:", error);
      }
    };
    fetchTherapists();
  }, []);

  // 2. Ambil data slot sesuai filter
  const loadSlots = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getSlots({
        date_from: filterDateFrom,
        date_to: filterDateTo,
        therapist_id: selectedTherapistId || undefined,
      });
      const list = res.data.slots || [];
      setSlots(list);
    } catch (error) {
      console.error("Gagal memuat slot jadwal:", error);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTherapistId, filterDateFrom, filterDateTo]);

  // 3. Hitung durasi hari generate
  const genDayCount = (() => {
    if (!genStartDate || !genEndDate) return 0;
    const diff = Math.floor((new Date(genEndDate).getTime() - new Date(genStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  })();

  const targetTherapists = genTherapistId
    ? therapists.filter((t) => t.id === genTherapistId)
    : therapists;
  const activeHoursList = ALL_HOURS.filter((h) => selectedHours.has(h.start));
  const estimatedSlots = genDayCount * targetTherapists.length * activeHoursList.length;

  // Toggle satu jam di checklist
  const toggleHour = (startTime: string) => {
    setSelectedHours((prev) => {
      const next = new Set(prev);
      if (next.has(startTime)) next.delete(startTime);
      else next.add(startTime);
      return next;
    });
  };
  const selectAllHours = () => setSelectedHours(new Set(ALL_HOURS.map((h) => h.start)));
  const clearAllHours = () => setSelectedHours(new Set());
  const resetDefaultHours = () => setSelectedHours(new Set(DEFAULT_ACTIVE));

  // 4. Handle Generate
  const handleGenerateRange = async () => {
    if (!genStartDate || !genEndDate) {
      showNotification("Pilih rentang tanggal terlebih dahulu!", "warning"); return;
    }
    if (new Date(genEndDate) < new Date(genStartDate)) {
      showNotification("Tanggal akhir harus setelah tanggal mulai!", "warning"); return;
    }
    if (genDayCount > 31) {
      showNotification("Maksimal rentang generate adalah 31 hari.", "warning"); return;
    }
    if (activeHoursList.length === 0) {
      showNotification("Pilih minimal 1 jam slot!", "warning"); return;
    }

    setIsGenerating(true);
    setGenerateResult(null);

    let createdCount = 0;
    let skippedCount = 0;

    try {
      // Hanya terapis aktif (BE menolak slot untuk terapis nonaktif)
      const therapistsToGenerate = (genTherapistId
        ? therapists.filter((t) => t.id === genTherapistId)
        : therapists
      ).filter((t) => t.status === "aktif");

      if (therapistsToGenerate.length === 0) {
        showNotification("Tidak ada terapis aktif yang dipilih.", "warning");
        return;
      }

      for (let cur = new Date(genStartDate); cur <= new Date(genEndDate); cur.setDate(cur.getDate() + 1)) {
        const dateStr = cur.toISOString().split("T")[0];
        for (const therapist of therapistsToGenerate) {
          for (const hour of activeHoursList) {
            try {
              await adminService.createSlot({
                therapistId: therapist.id,
                slotDate: dateStr,
                startTime: hour.start,
                endTime: hour.end,
                capacity: 1,
              });
              createdCount++;
            } catch (err: any) {
              // HANYA bentrok jadwal (409 SLOT_DATE_TIME_CONFLICT) yang boleh dilewati.
              // Error lain (validasi, sesi habis, server) menghentikan proses & ditampilkan.
              if (err?.response?.status === 409) {
                skippedCount++;
                continue;
              }
              throw err;
            }
          }
        }
      }

      setGenerateResult({ count: createdCount, skipped: skippedCount });
      if (createdCount > 0) {
        showNotification(`Berhasil membuat ${createdCount} slot jadwal baru!`, "success");
      } else {
        showNotification(`Semua slot sudah ada (${skippedCount} dilewati).`, "warning");
      }
      loadSlots();
    } catch (error: any) {
      console.error("Gagal generate slot:", error);
      if (createdCount > 0) loadSlots();
      showNotification(
        `${getApiErrorMessage(error, "Gagal generate slot.")} (${createdCount} slot sempat dibuat sebelum berhenti)`,
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const openGenerateModal = () => {
    setGenStartDate(todayStr());
    setGenEndDate(offsetStr(6));
    setGenTherapistId("");
    setSelectedHours(new Set(DEFAULT_ACTIVE));
    setGenerateResult(null);
    setIsGenerateModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">

      {/* --- HEADER HALAMAN --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold text-brand-900">Manajemen Slot Jadwal Terapi</h2>
          <p className="text-[#585858] text-[15px]">Atur ketersediaan waktu untuk sesi fisioterapi harian.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openGenerateModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-900 hover:bg-brand-950 text-white font-bold text-[14px] rounded-xl transition-all shadow-sm shrink-0"
          >
            <Sparkle size={18} weight="fill" className="text-gold-700" />
            Generate Otomatis
          </button>

          <Link
            href="/admin/jadwal/tambah"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-brand-950 font-bold text-[14px] rounded-xl transition-all shadow-sm shrink-0"
          >
            <Plus size={18} weight="bold" />
            Tambah Slot
          </Link>
        </div>
      </div>

      {/* --- STATISTIK --- */}
      <ScheduleStats slots={slots} isLoading={isLoading} />

      {/* --- FILTER DATE RANGE --- */}
      <ScheduleFilter
        therapists={therapists}
        selectedTherapistId={selectedTherapistId}
        onTherapistChange={setSelectedTherapistId}
        dateFrom={filterDateFrom}
        dateTo={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
      />

      {/* --- GRID SLOT --- */}
      <div className="mt-2">
        <ScheduleGrid
          slots={slots}
          isLoading={isLoading}
          onRefresh={loadSlots}
          onOpenGenerateModal={openGenerateModal}
        />
      </div>

      {/* === MODAL GENERATE OTOMATIS === */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl w-full max-w-[560px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center gap-3 px-8 pt-7 pb-5 border-b border-gray-100 shrink-0">
              <div className="p-2.5 bg-brand-50 text-gold-700 rounded-xl shrink-0">
                <Sparkle size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-brand-900 leading-tight">Generate Slot Otomatis</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Atur terapis, tanggal, dan jam yang ingin digenerate</p>
              </div>
            </div>

            {/* Body — scrollable */}
            <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">

              {/* Pilih Fisioterapis */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-brand-900 flex items-center gap-1.5">
                  <Users size={15} weight="bold" />
                  Fisioterapis
                </label>
                <select
                  value={genTherapistId}
                  onChange={(e) => setGenTherapistId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-brand-900 text-[14px] font-semibold py-3 px-4 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer appearance-none"
                >
                  <option value="">Semua Fisioterapis ({therapists.length} terapis)</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName || t.full_name || t.name || `Terapis #${t.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rentang Tanggal */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-brand-900 flex items-center gap-1.5">
                  <CalendarBlank size={15} weight="bold" />
                  Rentang Tanggal
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Dari</span>
                    <input type="date" value={genStartDate}
                      onChange={(e) => setGenStartDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-brand-900 text-[13px] font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="mt-5 text-gray-400 font-bold text-[14px] shrink-0">—</div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Sampai</span>
                    <input type="date" value={genEndDate} min={genStartDate}
                      onChange={(e) => setGenEndDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-brand-900 text-[13px] font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-gold-600 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
                {/* Shortcut tanggal */}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-[11px] text-gray-400 font-semibold">Cepat:</span>
                  {[
                    { label: "Hari Ini", start: todayStr(), end: todayStr() },
                    { label: "3 Hari", start: todayStr(), end: offsetStr(2) },
                    { label: "1 Minggu", start: todayStr(), end: offsetStr(6) },
                    { label: "2 Minggu", start: todayStr(), end: offsetStr(13) },
                  ].map((opt) => (
                    <button key={opt.label} onClick={() => { setGenStartDate(opt.start); setGenEndDate(opt.end); }}
                      className="px-2.5 py-1 text-[11px] font-bold text-brand-900 bg-gray-100 hover:bg-brand-50 hover:text-gold-800 rounded-lg transition-colors"
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Pilih Jam */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-brand-900 flex items-center gap-1.5">
                    <Clock size={15} weight="bold" />
                    Jam Slot ({activeHoursList.length} dipilih)
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={resetDefaultHours} className="text-[11px] font-bold text-brand-900 hover:text-gold-800 transition-colors">Reset</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={selectAllHours} className="text-[11px] font-bold text-brand-900 hover:text-gold-800 transition-colors">Semua</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={clearAllHours} className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors">Hapus</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_HOURS.map((h) => {
                    const active = selectedHours.has(h.start);
                    return (
                      <button
                        key={h.start}
                        type="button"
                        onClick={() => toggleHour(h.start)}
                        className={`py-2 px-3 rounded-xl text-[12px] font-bold border transition-all ${
                          active
                            ? "bg-brand-50 border-brand-600 text-gold-700 ring-1 ring-brand-600/40"
                            : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {h.start}–{h.end}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Estimasi */}
              {genDayCount > 0 && (
                <div className={`rounded-2xl px-4 py-3 flex items-start gap-3 border ${genDayCount > 31 ? "bg-red-50 border-red-100" : "bg-brand-50 border-brand-100"}`}>
                  <Sparkle size={18} weight="fill" className={`mt-0.5 shrink-0 ${genDayCount > 31 ? "text-red-500" : "text-gold-700"}`} />
                  <div className="text-[13px] leading-relaxed">
                    {genDayCount > 31 ? (
                      <span className="font-bold text-red-600">Rentang terlalu panjang! Maksimal 31 hari.</span>
                    ) : activeHoursList.length === 0 ? (
                      <span className="font-bold text-orange-600">Pilih minimal 1 slot jam terlebih dahulu.</span>
                    ) : (
                      <>
                        <span className="font-bold text-brand-900">Estimasi: ~{estimatedSlots} slot</span>
                        <span className="text-gray-500"> dari {genDayCount} hari × {targetTherapists.length} terapis × {activeHoursList.length} jam</span>
                        <br />
                        <span className="text-gray-400 text-[12px]">Slot yang sudah ada akan dilewati otomatis.</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Hasil Generate */}
              {generateResult && (
                <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${generateResult.count > 0 ? "bg-green-50 border-green-100" : "bg-brand-50 border-brand-100"}`}>
                  <CheckCircle size={20} weight="fill" className={generateResult.count > 0 ? "text-green-500" : "text-gold-700"} />
                  <span className="text-[13px] font-bold text-brand-900">
                    {generateResult.count > 0
                      ? `Selesai! ${generateResult.count} slot baru dibuat${generateResult.skipped > 0 ? `, ${generateResult.skipped} dilewati` : ""}.`
                      : `Semua slot sudah ada (${generateResult.skipped} dilewati).`
                    }
                  </span>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex gap-3 px-8 pb-7 shrink-0">
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isGenerating}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#585858] bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-[14px] disabled:opacity-50"
              >
                {generateResult ? "Tutup" : "Batal"}
              </button>
              {!generateResult && (
                <button
                  onClick={handleGenerateRange}
                  disabled={isGenerating || genDayCount === 0 || genDayCount > 31 || activeHoursList.length === 0}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-brand-900 hover:bg-brand-950 transition-colors shadow-md text-[14px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Sedang Generate...
                    </>
                  ) : (
                    <>
                      <Sparkle size={16} weight="fill" className="text-gold-700" />
                      Generate Sekarang
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TOAST === */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-[60] animate-in slide-in-from-bottom-5 duration-300 border
          ${toast.type === "success" ? "bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]"
          : toast.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-[#fef3f2] border-[#fecdca] text-[#b42318]"}`}
        >
          {toast.type === "success" && <CheckCircle size={20} weight="fill" />}
          {(toast.type === "warning" || toast.type === "error") && <WarningCircle size={20} weight="fill" />}
          <span className="text-[14px] font-bold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
