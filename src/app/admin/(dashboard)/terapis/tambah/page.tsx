"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CaretRight, GraduationCap, Phone, EnvelopeSimple, Info, CheckCircle, WarningCircle 
} from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { bookingService } from "@/services/bookingService";
import FocusAreaCheckboxes from "@/components/admin/terapis/FocusAreaCheckboxes";
import { getApiErrorMessage } from "@/app/utils/api";
import type { FocusArea } from "@/types/api.types";

export default function TambahTerapisPage() {
  const router = useRouter();

  // State input form (sekaligus live preview)
  const [formData, setFormData] = useState({
    nama: "",
    sip: "",
    telepon: "",
    email: "",
    pendidikan: ""
  });
  
  const [focusAreasList, setFocusAreasList] = useState<FocusArea[]>([]);
  const [isFocusLoading, setIsFocusLoading] = useState(true);
  // focus_id (UUID) yang dicentang admin — dikirim apa adanya ke BE
  const [focusIds, setFocusIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "warning" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFocusAreas = async () => {
      try {
        const res = await bookingService.getFocusAreas();
        setFocusAreasList(res.data?.focusAreas || []);
      } catch (err) {
        console.error("Gagal memuat focus areas:", err);
      } finally {
        setIsFocusLoading(false);
      }
    };
    loadFocusAreas();
  }, []);

  const triggerToast = (message: string, type: "success" | "warning" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.sip.trim()) {
      triggerToast("Nama Lengkap dan Nomor SIP wajib diisi!", "warning");
      return;
    }

    // Spesialisasi wajib dipilih eksplisit — tidak ada fallback ke layanan pertama
    if (focusIds.length === 0) {
      triggerToast("Pilih minimal satu spesialisasi layanan!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createTherapist({
        full_name: formData.nama,
        sip: formData.sip,
        phone: formData.telepon,
        email: formData.email,
        education: formData.pendidikan,
        total_patients_label: "0 Pasien",
        focus_ids: focusIds,
      });

      triggerToast("Data Terapis Baru Berhasil Disimpan!", "success");
      setTimeout(() => {
        router.push("/admin/terapis");
      }, 1500);
    } catch (error) {
      console.error("Gagal menambahkan terapis:", error);
      const errMsg = getApiErrorMessage(error, "Gagal mendaftarkan terapis baru. Silakan periksa kembali data inputan.");
      triggerToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback nilai untuk Live Preview
  const previewNama = formData.nama || "Nama Fisioterapis";
  const previewSIP = formData.sip || "XX.XXX.XXX.XXXXX";
  const previewSpesialisasi =
    focusAreasList.filter((f) => focusIds.includes(f.id)).map((f) => `Fisioterapi ${f.name}`).join(", ") || "Spesialisasi";
  const previewPendidikan = formData.pendidikan || "Belum diisi";
  const previewTelepon = formData.telepon || "-";
  const previewEmail = formData.email || "-";

  return (
    <div className="w-full flex flex-col gap-6 pb-12 max-w-[1100px] mx-auto">
      
      {/* --- BREADCRUMB & JUDUL --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link href="/admin/terapis" className="hover:text-[#F5B301] transition-colors">
            Kelola Data Terapis
          </Link>
          <CaretRight size={14} />
          <span className="text-[#1b2a4e] font-bold">Tambah Terapis</span>
        </div>
        <h2 className="text-[28px] font-bold text-[#1b2a4e]">Tambah Terapis Baru</h2>
        <p className="text-[#585858] text-[15px]">Lengkapi informasi di bawah ini untuk mendaftarkan terapis profesional baru ke dalam sistem Hai Physio.</p>
      </div>

      {/* --- LAYOUT GRID (KIRI: FORM, KANAN: LIVE PREVIEW) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start mt-2">
        
        {/* === KOLOM KIRI: FORM INPUT === */}
        <form onSubmit={handleSave} className="w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          
          {/* Nama Lengkap */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nama" 
              value={formData.nama} 
              onChange={handleChange}
              placeholder="Contoh: Ftr. Budi Santoso, S.Ft"
              required
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e]"
            />
          </div>

          {/* Nomor SIP */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">
              Nomor SIP (Surat Izin Praktik) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="sip" 
              value={formData.sip} 
              onChange={handleChange}
              placeholder="Contoh: SIP/2026/0402/PHY/99"
              required
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e]"
            />
          </div>

          {/* Spesialisasi */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">Spesialisasi Layanan <span className="text-red-500">*</span></label>
            <FocusAreaCheckboxes focusAreas={focusAreasList} value={focusIds} onChange={setFocusIds} isLoading={isFocusLoading} />
            <p className="text-[12px] text-gray-400">Jadwal praktik diatur lewat menu Kelola Slot Jadwal setelah terapis disimpan.</p>
          </div>

          {/* Nomor Telepon */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">Nomor Telepon / WhatsApp</label>
            <input 
              type="text" 
              name="telepon" 
              value={formData.telepon} 
              onChange={handleChange}
              placeholder="0812 3456 7890"
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e]"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">Email Terapis</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="nama.terapis@haiphysio.com"
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e]"
            />
          </div>

          {/* Pendidikan */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1b2a4e]">Latar Belakang Pendidikan</label>
            <input 
              type="text" 
              name="pendidikan" 
              value={formData.pendidikan} 
              onChange={handleChange}
              placeholder="Contoh: S1 Fisioterapi - Universitas Indonesia"
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-[#F5B301] transition-colors text-[14px] text-[#1b2a4e]"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="w-full h-[1px] bg-gray-100 my-2"></div>
          <div className="flex justify-end items-center gap-4 w-full">
            <Link 
              href="/admin/terapis"
              className="py-3.5 px-8 rounded-xl font-bold text-[#585858] hover:bg-gray-100 transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="py-3.5 px-8 rounded-xl font-bold text-white bg-[#F5B301] hover:bg-[#dda101] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan Data..." : "Simpan Data Terapis"}
            </button>
          </div>
        </form>

        {/* === KOLOM KANAN: LIVE PREVIEW & CATATAN PENTING === */}
        <div className="flex flex-col gap-6 sticky top-28">
          
          {/* Kartu Pratinjau */}
          <div className="w-full bg-[#FFFBEA] border border-[#fdeeb3] rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col relative">
            <div className="flex items-center gap-2 mb-6">
              <Info size={18} className="text-[#F5B301]" />
              <span className="text-[13px] font-bold text-[#1b2a4e]">Pratinjau Kartu Terapis</span>
            </div>

            {/* Konten Kartu */}
            <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="h-[100px] bg-gray-200 relative w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1b2a4e]/10 to-[#F5B301]/20"></div>
                <div className="absolute top-3 right-3 bg-[#F5B301] text-white text-[11px] font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                  {previewSpesialisasi}
                </div>
              </div>
              
              <div className="w-20 h-20 rounded-full border-4 border-white bg-[#1b2a4e] shadow-sm mx-auto -mt-10 relative z-10 overflow-hidden">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(previewNama.replace("Ftr. ", ""))}&background=1b2a4e&color=fff&size=150`} 
                  alt="Preview Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="p-5 flex flex-col gap-3.5 mt-1">
                <div className="flex flex-col items-center text-center pb-3 border-b border-gray-100">
                  <h3 className="text-[17px] font-bold text-[#1b2a4e]">{previewNama}</h3>
                  <span className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1">
                    SIP: {previewSIP}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap size={17} className="text-[#F5B301] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendidikan</span>
                      <span className="text-[12px] font-semibold text-[#1b2a4e]">{previewPendidikan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={17} className="text-[#F5B301] shrink-0" />
                    <span className="text-[12px] font-medium text-[#1b2a4e]">{previewTelepon}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <EnvelopeSimple size={17} className="text-[#F5B301] shrink-0" />
                    <span className="text-[12px] font-medium text-[#1b2a4e] line-clamp-1">{previewEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Penting Warning Box */}
          <div className="bg-white border-l-4 border-l-[#F5B301] border-y border-r border-gray-200 rounded-xl p-5 flex items-start gap-3 shadow-sm">
            <Info size={24} weight="fill" className="text-[#F5B301] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="text-[14px] font-bold text-[#1b2a4e]">Catatan Penting</h4>
              <p className="text-[13px] text-[#585858] leading-relaxed">
                Pastikan Nomor SIP yang dimasukkan valid dan aktif. Setelah disimpan, data terapis baru akan langsung tampil di sistem booking pasien dan admin.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* --- TOAST NOTIFIKASI DINAMIS --- */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-xl z-50 animate-in slide-in-from-bottom-5 duration-300 border ${
          toast.type === "warning" 
            ? "bg-[#fffbeb] border-[#fde68a] text-[#b45309]" 
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
