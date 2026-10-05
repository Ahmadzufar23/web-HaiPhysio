"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import TerapisStats from "@/components/admin/terapis/TerapisStats";
import TerapisTable from "@/components/admin/terapis/TerapisTable";
import { adminService } from "@/services/adminService";

export default function AdminTerapisPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTherapists = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    try {
      const res = await adminService.getTherapists();
      const list = res.data.therapists || [];
      setTherapists(list);
    } catch (error) {
      console.error("Gagal memuat data terapis:", error);
      setTherapists([]);
    } finally {
      if (!background) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTherapists();
    // Auto-refresh setiap 30 detik (silent)
    const interval = setInterval(() => loadTherapists(true), 30000);
    return () => clearInterval(interval);
  }, [loadTherapists]);

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      
      {/* --- HEADER HALAMAN --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold text-brand-900">Kelola Data Terapis</h2>
          <p className="text-[#585858] text-[15px]">Manajemen profil, spesialisasi, dan jadwal kerja fisioterapis.</p>
        </div>

        {/* Tombol Tambah Terapis */}
        <Link 
          href="/admin/terapis/tambah"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-brand-950 font-bold text-[14px] rounded-xl transition-all shadow-sm shrink-0"
        >
          <Plus size={18} weight="bold" />
          Tambah Terapis
        </Link>
      </div>

      {/* --- KOMPONEN STATISTIK --- */}
      <TerapisStats therapists={therapists} isLoading={isLoading} />

      {/* --- KOMPONEN TABEL & FILTER --- */}
      <TerapisTable 
        therapists={therapists} 
        isLoading={isLoading} 
        onRefresh={loadTherapists}
      />

    </div>
  );
}
