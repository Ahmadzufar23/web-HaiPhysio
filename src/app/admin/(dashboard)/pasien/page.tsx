"use client";

import { useState, useEffect, useCallback } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import PasienStats from "@/components/admin/pasien/PasienStats";
import PasienTable from "@/components/admin/pasien/PasienTable";
import { adminService } from "@/services/adminService";

export default function AdminPasienPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    try {
      const [patientsRes, bookingsRes] = await Promise.all([
        adminService.getPatients(),
        adminService.getBookings(),
      ]);

      const pList = patientsRes.data.patients || [];
      const bList = bookingsRes.data.bookings || [];

      setPatients(pList);
      setBookings(bList);
    } catch (error) {
      console.error("Gagal memuat data pasien:", error);
      setPatients([]);
      setBookings([]);
    } finally {
      if (!background) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Silent auto refresh setiap 30 detik
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      
      {/* --- HEADER HALAMAN --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold text-brand-900">Kelola Data Pasien</h2>
          <p className="text-[#585858] text-[15px]">Pantau data rekam medis, riwayat kunjungan, dan status reservasi pasien.</p>
        </div>

        {/* Search Bar Cepat di Header */}
        <div className="relative min-w-[280px] md:w-[320px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, ID, kontak pasien..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gold-600 text-[14px] text-brand-900 bg-white shadow-sm transition-all"
          />
        </div>
      </div>

      {/* --- STATISTIK KARTU PASIEN --- */}
      <PasienStats 
        patients={patients} 
        bookings={bookings} 
        isLoading={isLoading} 
      />

      {/* --- TABEL DAFTAR PASIEN --- */}
      <PasienTable 
        patients={patients} 
        isLoading={isLoading} 
        searchQuery={searchQuery} 
      />

    </div>
  );
}
