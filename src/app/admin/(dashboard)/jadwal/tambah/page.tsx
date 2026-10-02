"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight, CaretDown, Info, Clock, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";

export default function TambahJadwalPage() {
  const router = useRouter();

  const [therapists, setTherapists] = useState<any[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState("");

  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("09:00");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tarik data terapis
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await adminService.getTherapists();
        const list = res.data.therapists || [];
        setTherapists(list);
        if (list.length > 0) setSelectedTherapistId(list[0].id);
      } catch (error) {
        console.error("Gagal menarik daftar terapis:", error);
      }
    };
    fetchTherapists();
  }, []);

  const handleSave = async () => {
    if (!selectedTherapistId) {
      showNotification("Mohon pilih Fisioterapis terlebih dahulu!", "warning");
      return;
    }
    if (!tanggal) {
      showNotification("Mohon pilih tanggal praktek!", "warning");
      return;
    }
    if (jamMulai >= jamSelesai) {
      showNotification("Jam selesai harus lebih besar dari jam mulai!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createSlot({
        therapistId: selectedTherapistId,
        slotDate: tanggal,
        startTime: jamMulai,
        endTime: jamSelesai,
        capacity: 1,
      });

      showNotification("Slot Jadwal Berhasil Ditambahkan!", "success");
      setIsSubmitting(false);
      setTimeout(() => router.push("/admin/jadwal"), 1200);
    } catch (error: any) {
      console.error("Detail Error Backend:", error.response?.data);
      const beError = error.response?.data?.error;
      if (beError?.code === "SLOT_DATE_TIME_CONFLICT") {
        showNotification("Slot untuk fisioterapis di tanggal & jam ini sudah terdaftar.", "warning");
      } else {
        const msg = beError?.message || error.response?.data?.message || "Gagal menambahkan slot jadwal.";
        showNotification(msg, "error");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-10">

      {/* --- BREADCRUMB & JUDUL --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link href="/admin/jadwal" className="hover:text-[#F5B301] transition-colors">
            Kelola Slot Jadwal
          </Link>
          <CaretRight size={14} />
          <span className="text-[#1b2a4e] font-bold">Tambah Slot</span>
        </div>
        <h2 className="text-[28px] font-bold text-[#1b2a4e]">Tambah Slot Jadwal Baru</h2>
        <p className="text-[#585858] text-[15px]">Tambahkan satu slot praktek untuk tanggal dan jam tertentu.</p>
      </div>

      {/* --- FORM UTAMA --- */}
      <div className="w-full max-w-[860px] mx-auto bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-sm">

        {/* 1. Pilih Fisioterapis */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1b2a4e]">Nama Fisioterapis</label>
          <div className="relative">
            <select
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-[#1b2a4e] text-[14px] p-4 rounded-xl outline-none focus:border-[#F5B301] transition-colors cursor-pointer font-medium"
            >
              <option value="" disabled hidden>Pilih Fisioterapis</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName || t.full_name || t.name || `Terapis #${t.id}`}
                  {t.specialization ? ` — ${t.specialization}` : ""}
                </option>
              ))}
            </select>
            <CaretDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-100"></div>

        {/* 2. Tanggal Praktek (single date) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1b2a4e]">Tanggal Praktek</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full bg-white border border-gray-200 text-[#1b2a4e] text-[14px] p-4 rounded-xl outline-none focus:border-[#F5B301] transition-colors cursor-pointer font-medium"
          />
          <span className="text-[12px] text-gray-400">Pilih satu tanggal untuk slot ini. Untuk buat banyak sekaligus, gunakan fitur Generate Otomatis.</span>
        </div>

        <div className="w-full h-[1px] bg-gray-100"></div>

        {/* 3. Jam Mulai & Jam Selesai */}
        <div className="flex flex-col gap-3">
          <label className="text-[14px] font-bold text-[#1b2a4e] flex items-center gap-1.5">
            <Clock size={16} weight="bold" />
            Waktu Sesi
          </label>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Jam Mulai</span>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e] font-medium"
              />
            </div>
            <div className="hidden md:flex items-center justify-center mt-6 text-gray-400 font-bold text-[16px]">—</div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Jam Selesai</span>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e] font-medium"
              />
            </div>
          </div>

          {/* Shortcut jam standar */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-[12px] text-gray-400 font-semibold">Jam standar:</span>
            {[
              ["08:00", "09:00"], ["09:00", "10:00"], ["10:00", "11:00"],
              ["13:00", "14:00"], ["14:00", "15:00"], ["15:00", "16:00"],
            ].map(([s, e]) => (
              <button
                key={s}
                type="button"
                onClick={() => { setJamMulai(s); setJamSelesai(e); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-colors border ${
                  jamMulai === s && jamSelesai === e
                    ? "bg-yellow-50 text-[#dda101] border-[#F5B301]/40"
                    : "text-[#1b2a4e] bg-gray-100 hover:bg-yellow-50 hover:text-[#dda101] border-transparent hover:border-[#F5B301]/30"
                }`}
              >
                {s}–{e}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-100"></div>

        {/* 4. Info Box */}
        <div className="bg-[#FFFBEA] border border-[#fdeeb3] rounded-xl p-5 flex items-start gap-4">
          <Info size={22} weight="fill" className="text-[#F5B301] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="text-[14px] font-bold text-[#1b2a4e]">Catatan</h4>
            <p className="text-[13px] text-[#585858] leading-relaxed">
              Slot dengan fisioterapis, tanggal, dan jam yang sama persis tidak dapat dibuat dua kali.
              Untuk membuat banyak slot sekaligus, gunakan fitur <strong>Generate Otomatis</strong>.
            </p>
          </div>
        </div>

        {/* 5. Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/admin/jadwal"
            className="flex-1 py-4 flex items-center justify-center rounded-xl font-bold text-[#585858] bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-white bg-[#F5B301] hover:bg-[#dda101] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Menyimpan...
              </>
            ) : "Simpan Slot Baru"}
          </button>
        </div>

      </div>

      {/* --- TOAST NOTIFIKASI --- */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 animate-in slide-in-from-bottom-5 duration-300 border
          ${toast.type === "success" ? "bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]"
          : toast.type === "warning" ? "bg-[#fffbeb] border-[#fde68a] text-[#b45309]"
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
