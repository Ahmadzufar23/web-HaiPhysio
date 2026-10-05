"use client";

import { useState } from "react";
import { CalendarBlank, Plus, ArrowLeft, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";

interface TabJadwalProps {
  isAddingException: boolean;
  setIsAddingException: (val: boolean) => void;
  therapistName?: string;
  therapistId?: string;
}

export default function TabJadwal({ isAddingException, setIsAddingException, therapistName, therapistId }: TabJadwalProps) {
  const [excForm, setExcForm] = useState({ 
    jenis: "", 
    startDate: "", 
    endDate: "", 
    tipe: "seharian", 
    startTime: "08:00", 
    endTime: "16:00", 
    alasan: "" 
  });
  const [isErrorBentrok, setIsErrorBentrok] = useState(false);
  const [bentrokMsg, setBentrokMsg] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "warning" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const triggerToast = (message: string, type: "success" | "warning" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const [exceptionList, setExceptionList] = useState([
    { tgl: "24 Okt 2026", hari: "Selasa", ket: "Pelatihan Sertifikasi Dry Needling", st: "Libur Seharian", isPartial: false },
    { tgl: "30 Okt 2026", hari: "Senin", ket: "Kunjungan Rumah Sakit Partner", st: "Hanya Pagi (08:00 - 10:00)", isPartial: true }
  ]);

  const handleSimpanPengecualian = async () => {
    // 1. Validasi Input Form Terlebih Dahulu dengan Toast
    if (!excForm.jenis) {
      triggerToast("Silakan pilih Jenis Pengecualian terlebih dahulu!", "warning");
      return;
    }
    if (!excForm.startDate) {
      triggerToast("Silakan pilih Tanggal Mulai terlebih dahulu!", "warning");
      return;
    }

    const effectiveEndDate = excForm.endDate || excForm.startDate;
    setIsChecking(true);
    setIsErrorBentrok(false);

    try {
      // 2. Cek apakah ada booking aktif pasien di tanggal/rentang tersebut
      const bookingsRes = await adminService.getBookings();
      const allBookings = bookingsRes.data.bookings || [];

      // Cari booking terkonfirmasi untuk terapis ini di rentang tanggal cuti
      const clashingBookings = allBookings.filter((b: any) => {
        const matchTherapist = therapistId 
          ? (b.therapistId === therapistId || b.therapist_id === therapistId)
          : (therapistName && (b.therapistName || b.therapist_name || "").toLowerCase().includes(therapistName.toLowerCase()));

        if (!matchTherapist) return false;

        const bookingDate = (b.bookingDate || b.slotDate || b.slot_date || "").substring(0, 10);
        const status = (b.bookingStatus || b.status || "").toLowerCase();

        // Hanya booking berstatus terkonfirmasi yang dianggap bentrok
        const isConfirmed = status === "terkonfirmasi" || status === "aktif" || status === "confirmed";
        if (!isConfirmed) return false;

        // Cek apakah tanggal booking berada di antara startDate dan endDate
        const inDateRange = bookingDate >= excForm.startDate && bookingDate <= effectiveEndDate;
        return inDateRange;
      });

      if (clashingBookings.length > 0) {
        setIsErrorBentrok(true);
        const patientNames = clashingBookings.map((b: any) => b.patientName || b.patient_name || "Pasien").slice(0, 3).join(", ");
        setBentrokMsg(`Jadwal bentrok dengan ${clashingBookings.length} sesi pasien terkonfirmasi (${patientNames}${clashingBookings.length > 3 ? ", dst." : ""}). Silakan jadwalkan ulang pasien terlebih dahulu.`);
        return;
      }

      // 3. Jika tidak ada bentrok, tambahkan pengecualian ke daftar
      const startDateObj = new Date(excForm.startDate);
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      
      const tglFormatted = `${startDateObj.getDate()} ${months[startDateObj.getMonth()]} ${startDateObj.getFullYear()}`;
      const hariFormatted = days[startDateObj.getDay()];

      const newExc = {
        tgl: tglFormatted,
        hari: hariFormatted,
        ket: excForm.jenis,
        st: excForm.tipe === "seharian" ? "Libur Seharian" : `(${excForm.startTime} - ${excForm.endTime})`,
        isPartial: excForm.tipe !== "seharian"
      };

      setExceptionList([newExc, ...exceptionList]);
      setIsAddingException(false);
      setIsErrorBentrok(false);
      setExcForm({ jenis: "", startDate: "", endDate: "", tipe: "seharian", startTime: "08:00", endTime: "16:00", alasan: "" });
      triggerToast("Pengecualian Jadwal Berhasil Ditambahkan", "success");
    } catch (err) {
      console.error("Gagal memeriksa jadwal bentrok:", err);
      triggerToast("Terjadi kesalahan saat memeriksa ketersediaan jadwal.", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      {isAddingException ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAddingException(false)} className="text-brand-900 hover:text-gold-700 transition-colors">
              <ArrowLeft size={24} weight="bold" />
            </button>
            <div className="flex flex-col">
              <h3 className="text-[20px] font-bold text-brand-900">Tambah Pengecualian Jadwal</h3>
              <p className="text-[13px] text-gray-500">{therapistName || "Fisioterapis"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-brand-900">Jenis Pengecualian</label>
                <select 
                  className="p-3.5 border border-gray-200 rounded-xl outline-none focus:border-gold-600 text-[14px] text-brand-900 bg-white cursor-pointer" 
                  value={excForm.jenis} 
                  onChange={(e) => { setExcForm({...excForm, jenis: e.target.value}); setIsErrorBentrok(false); }}
                >
                  <option value="" hidden>Pilih jenis...</option>
                  <option value="Keperluan Keluarga">Keperluan Keluarga</option>
                  <option value="Cuti Sakit">Cuti Sakit</option>
                  <option value="Pelatihan / Workshop">Pelatihan / Workshop</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-brand-900">Rentang Tanggal</label>
                  <div className="relative">
                    <CalendarBlank size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      value={excForm.startDate} 
                      onChange={(e) => { setExcForm({...excForm, startDate: e.target.value}); setIsErrorBentrok(false); }} 
                      className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-gold-600 text-[14px] text-brand-900" 
                    />
                  </div>
                </div>
                <span className="mt-7 text-gray-400 font-bold">→</span>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-brand-900">&nbsp;</label>
                  <div className="relative">
                    <CalendarBlank size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      value={excForm.endDate} 
                      onChange={(e) => { setExcForm({...excForm, endDate: e.target.value}); setIsErrorBentrok(false); }} 
                      className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-gold-600 text-[14px] text-brand-900" 
                    />
                  </div>
                </div>
              </div>

              {/* Tipe Libur */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-brand-900">Tipe Libur</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-[14px] text-brand-900">
                    <input type="radio" name="tipeLibur" checked={excForm.tipe === "seharian"} onChange={() => setExcForm({...excForm, tipe: "seharian"})} />
                    Libur Seharian Penuh
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[14px] text-brand-900">
                    <input type="radio" name="tipeLibur" checked={excForm.tipe === "sebagian"} onChange={() => setExcForm({...excForm, tipe: "sebagian"})} />
                    Hanya Jam Tertentu
                  </label>
                </div>
              </div>

              {excForm.tipe === "sebagian" && (
                <div className="flex items-center gap-4">
                  <input 
                    type="time" 
                    value={excForm.startTime} 
                    onChange={(e) => setExcForm({...excForm, startTime: e.target.value})} 
                    className="flex-1 p-3.5 border border-gray-200 rounded-xl text-[14px]" 
                  />
                  <span className="text-gray-400 font-bold">sampai</span>
                  <input 
                    type="time" 
                    value={excForm.endTime} 
                    onChange={(e) => setExcForm({...excForm, endTime: e.target.value})} 
                    className="flex-1 p-3.5 border border-gray-200 rounded-xl text-[14px]" 
                  />
                </div>
              )}

              {/* Error Bentrok */}
              {isErrorBentrok && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-[13px] animate-in fade-in duration-200">
                  <WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                  <span>{bentrokMsg || "Jadwal bentrok dengan sesi pasien yang telah terkonfirmasi. Silakan jadwalkan ulang pasien terlebih dahulu."}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsAddingException(false)} 
                  disabled={isChecking}
                  className="py-2.5 px-6 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSimpanPengecualian} 
                  disabled={isChecking}
                  className="py-2.5 px-6 font-bold text-brand-950 bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isChecking ? "Memeriksa Jadwal..." : "Simpan Pengecualian"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-[14px] font-bold text-brand-900 mb-2">Himbauan Pengecualian</h4>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  Menambahkan pengecualian akan menutup slot ketersediaan terapis pada tanggal dan jam yang dipilih secara otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col">
              <h3 className="text-[18px] font-bold text-brand-900">Jadwal Praktek Standar</h3>
              <p className="text-[13px] text-gray-500">Senin - Sabtu (08:00 - 16:00 WIB)</p>
            </div>
            <button 
              onClick={() => setIsAddingException(true)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-brand-950 font-bold text-[13px] rounded-xl shadow-sm transition-colors"
            >
              <Plus size={16} weight="bold" />
              Tambah Pengecualian / Cuti
            </button>
          </div>

          {/* List Pengecualian */}
          <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
            <h4 className="text-[16px] font-bold text-brand-900">Daftar Pengecualian & Hari Libur</h4>
            <div className="flex flex-col gap-3">
              {exceptionList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <CalendarBlank size={20} className="text-gold-700" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-brand-900">{item.ket}</span>
                      <span className="text-[12px] text-gray-400">{item.hari}, {item.tgl}</span>
                    </div>
                  </div>
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full border ${item.isPartial ? 'bg-brand-50 text-gold-700 border-brand-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                    {item.st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Dynamic Toast */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-xl z-50 animate-in slide-in-from-bottom-5 duration-300 border ${
          toast.type === "warning" 
            ? "bg-amber-50 border-amber-200 text-amber-700" 
            : toast.type === "error"
            ? "bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]"
            : "bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]"
        }`}>
          {toast.type === "warning" || toast.type === "error" ? (
            <WarningCircle size={22} weight="fill" className="shrink-0" />
          ) : (
            <CheckCircle size={22} weight="fill" className="shrink-0" />
          )}
          <span className="text-[14px] font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
