"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { bookingService } from "@/services/bookingService";
import FocusAreaCheckboxes from "@/components/admin/terapis/FocusAreaCheckboxes";
import { getApiErrorMessage } from "@/app/utils/api";
import type { FocusArea } from "@/types/api.types";

export type TherapistFormData = {
  nama: string;
  sip: string;
  spesialisasi: string;
  focusIds: string[];
  telepon: string;
  email: string;
  pendidikan: string;
};

type TabInfoDasarProps = {
  formData: TherapistFormData;
  setFormData: (data: TherapistFormData) => void;
  therapistId: string;
};

export default function TabInfoDasar({ formData, setFormData, therapistId }: TabInfoDasarProps) {
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusAreasList, setFocusAreasList] = useState<FocusArea[]>([]);
  const [isFocusLoading, setIsFocusLoading] = useState(true);

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

  const handleSaveInfo = async () => {
    if (!therapistId) {
      alert("ID terapis tidak valid.");
      return;
    }
    if (!formData.nama?.trim() || !formData.sip?.trim()) {
      alert("Nama Lengkap dan Nomor SIP wajib diisi!");
      return;
    }
    // Spesialisasi dikirim persis sesuai centangan (UUID asli), minimal 1 — tanpa pencocokan nama
    if (!formData.focusIds || formData.focusIds.length === 0) {
      alert("Pilih minimal satu spesialisasi layanan!");
      return;
    }

    setIsSaving(true);
    try {
      await adminService.updateTherapist(therapistId, {
        full_name: formData.nama.trim(),
        sip: formData.sip,
        phone: formData.telepon,
        email: formData.email,
        education: formData.pendidikan,
        focus_ids: formData.focusIds,
      });

      // Sinkronkan label spesialisasi di header halaman edit
      setFormData({
        ...formData,
        spesialisasi: focusAreasList
          .filter((f) => formData.focusIds.includes(f.id))
          .map((f) => `Fisioterapi ${f.name}`)
          .join(", "),
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Gagal update data terapis:", error);
      const errMsg = getApiErrorMessage(error, "Gagal menyimpan perubahan data terapis.");
      alert(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm animate-in fade-in duration-300">
      
      {/* Nama Lengkap */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Nama Lengkap</label>
        <input 
          type="text" 
          name="nama" 
          value={formData.nama} 
          onChange={(e) => setFormData({...formData, nama: e.target.value})} 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900 font-semibold" 
        />
      </div>

      {/* Nomor SIP */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Nomor SIP (Surat Izin Praktik)</label>
        <input 
          type="text" 
          name="sip" 
          value={formData.sip} 
          onChange={(e) => setFormData({...formData, sip: e.target.value})} 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900" 
        />
      </div>

      {/* Spesialisasi */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Spesialisasi <span className="text-red-500">*</span></label>
        <FocusAreaCheckboxes
          focusAreas={focusAreasList}
          value={formData.focusIds || []}
          onChange={(ids) => setFormData({ ...formData, focusIds: ids })}
          isLoading={isFocusLoading}
        />
      </div>

      {/* Nomor Telepon */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Nomor Telepon</label>
        <input 
          type="text" 
          name="telepon" 
          value={formData.telepon} 
          onChange={(e) => setFormData({...formData, telepon: e.target.value})} 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900" 
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900" 
        />
      </div>

      {/* Latar Belakang Pendidikan */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-brand-900">Latar Belakang Pendidikan</label>
        <input 
          type="text" 
          name="pendidikan" 
          value={formData.pendidikan} 
          onChange={(e) => setFormData({...formData, pendidikan: e.target.value})} 
          className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900" 
        />
      </div>

      {/* Tombol Aksi */}
      <div className="w-full h-[1px] bg-gray-100 my-2"></div>
      <div className="flex justify-end items-center gap-4 w-full">
        <Link 
          href="/admin/terapis" 
          className="py-3.5 px-8 rounded-xl font-bold text-[#585858] hover:bg-gray-100 transition-colors"
        >
          Kembali
        </Link>
        <button 
          onClick={handleSaveInfo} 
          disabled={isSaving}
          className="py-3.5 px-8 rounded-xl font-bold text-brand-950 bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* Toast Sukses */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#ecfdf3] border border-[#a6f4c5] text-[#027a48] px-6 py-3 rounded-full shadow-lg z-50 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle size={20} weight="fill" />
          <span className="text-[14px] font-bold">Perubahan Data Terapis Berhasil Disimpan</span>
        </div>
      )}
    </div>
  );
}
