"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Info, CalendarBlank, ClockCounterClockwise } from "@phosphor-icons/react";
import TabInfoDasar from "./components/TabInfoDasar";
import TabJadwal from "./components/TabJadwal";
import TabRiwayat from "./components/TabRiwayat";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";

function EditTerapisContent() {
  const searchParams = useSearchParams();
  const therapistId = searchParams.get("id") || "";

  const [activeTab, setActiveTab] = useState("info"); 
  const [isActive, setIsActive] = useState(true);
  const [isAddingException, setIsAddingException] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    sip: "",
    spesialisasi: "",
    focusIds: [] as string[],
    telepon: "",
    email: "",
    pendidikan: ""
  });

  // Load data terapis berdasarkan ID — GET /api/admin/therapists/:id (tidak ada fallback ke terapis lain)
  useEffect(() => {
    const fetchTherapistDetail = async () => {
      try {
        if (!therapistId) {
          setNotFound(true);
          return;
        }
        const res = await adminService.getTherapistById(therapistId);
        const target = res.data?.therapist;
        if (!target) {
          setNotFound(true);
          return;
        }

        setFormData({
          nama: target.fullName || "",
          sip: target.sip || "",
          spesialisasi: (target.specializations || []).map((s) => `Fisioterapi ${s.name}`).join(", "),
          // Semua spesialisasi dipertahankan (bukan cuma yang pertama) supaya tidak terhapus saat simpan
          focusIds: (target.specializations || []).map((s) => s.id),
          telepon: target.phone || "",
          email: target.email || "",
          pendidikan: target.education || "",
        });
        // BE mengirim status: "aktif" | "nonaktif"
        setIsActive(target.status === "aktif");
      } catch (error) {
        console.error("Gagal memuat detail terapis:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapistDetail();
  }, [therapistId]);

  // Toggle status keaktifan terapis
  const handleToggleActive = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (therapistId) {
      try {
        await adminService.updateTherapist(therapistId, { status: newStatus ? "aktif" : "nonaktif" });
      } catch (error) {
        console.error("Gagal update status aktif terapis:", error);
        setIsActive(!newStatus); // kembalikan toggle kalau gagal tersimpan
        alert(getApiErrorMessage(error, "Gagal mengubah status terapis."));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <span className="text-brand-900 font-bold animate-pulse">Memuat data terapis...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full py-24 flex flex-col items-center gap-4 text-center">
        <span className="text-brand-900 font-bold text-[18px]">Data terapis tidak ditemukan.</span>
        <Link href="/admin/terapis" className="px-6 py-3 rounded-xl font-bold text-brand-950 bg-brand-600 hover:bg-brand-700">
          Kembali ke Kelola Data Terapis
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-12 max-w-[1000px] mx-auto">
      
      {/* --- BREADCRUMB --- */}
      <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
        <Link href="/admin/terapis" className="hover:text-gold-700 transition-colors">Kelola Data Terapis</Link>
        <span>›</span>
        {isAddingException ? (
          <>
            <span className="cursor-pointer hover:text-gold-700" onClick={() => setIsAddingException(false)}>Edit Data Terapis</span>
            <span>›</span>
            <span className="text-brand-900 font-bold">Tambah Pengecualian Jadwal</span>
          </>
        ) : (
          <span className="text-brand-900 font-bold">Edit Data Terapis</span>
        )}
      </div>

      {/* --- HEADER KARTU PROFIL --- */}
      {!isAddingException && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-brand-900">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent((formData.nama || "Terapis").replace("Ftr. ", ""))}&background=1b2a4e&color=fff&size=150`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[24px] font-bold text-brand-900 leading-tight">{formData.nama || "Nama Terapis"}</h2>
              <p className="text-[14px] text-gray-500">{formData.spesialisasi} • SIP: {formData.sip || "-"}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00b074]' : 'bg-gray-400'}`}></span>
                <span className={`text-[13px] font-bold ${isActive ? 'text-[#00b074]' : 'text-gray-400'}`}>
                  Status: {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          {/* Switch Status Keaktifan */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 py-2.5 px-4 rounded-xl shrink-0">
            <span className="text-[14px] font-bold text-brand-900">Status Keaktifan</span>
            <div onClick={handleToggleActive} className="flex items-center gap-2 cursor-pointer">
              <div className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${isActive ? 'bg-[#00b074]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <span className={`text-[14px] font-bold ${isActive ? 'text-[#00b074]' : 'text-gray-400'}`}>
                {isActive ? 'Aktif' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- SISTEM TABS NAVIGATION --- */}
      {!isAddingException && (
        <div className="w-full flex items-center gap-8 border-b border-gray-200 px-2 mt-2">
          {['info', 'jadwal', 'riwayat'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)} 
              className={`flex items-center gap-2 pb-4 border-b-2 font-bold capitalize transition-colors ${activeTab === tab ? "border-brand-600 text-gold-700" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              {tab === 'info' && <><Info size={18} weight={activeTab === tab ? "bold" : "regular"} /> Informasi Dasar</>}
              {tab === 'jadwal' && <><CalendarBlank size={18} weight={activeTab === tab ? "bold" : "regular"} /> Jadwal Praktek</>}
              {tab === 'riwayat' && <><ClockCounterClockwise size={18} weight={activeTab === tab ? "bold" : "regular"} /> Riwayat Sesi</>}
            </button>
          ))}
        </div>
      )}

      {/* --- KONTEN TAB RENDERER --- */}
      {activeTab === "info" && !isAddingException && (
        <TabInfoDasar formData={formData} setFormData={setFormData} therapistId={therapistId} />
      )}
      {activeTab === "jadwal" && (
        <TabJadwal 
          isAddingException={isAddingException} 
          setIsAddingException={setIsAddingException} 
          therapistName={formData.nama} 
          therapistId={therapistId}
        />
      )}
      {activeTab === "riwayat" && !isAddingException && (
        <TabRiwayat 
          therapistName={formData.nama} 
          therapistId={therapistId} 
        />
      )}

    </div>
  );
}

export default function EditTerapisPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-900 font-bold">Memuat halaman edit...</div>}>
      <EditTerapisContent />
    </Suspense>
  );
}
