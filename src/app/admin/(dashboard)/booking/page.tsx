"use client";

import { useState, useEffect, useCallback } from "react";
import BookingFilter from "@/components/admin/booking/BookingFilter";
import BookingTable from "@/components/admin/booking/BookingTable";
import { adminService } from "@/services/adminService";

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState(() => {
    // Gunakan fungsi init agar Date dieksekusi hanya saat render awal di client
    const today = new Date();
    // Format YYYY-MM-DD dengan mengkompensasi timezone lokal
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return localDate.toISOString().substring(0, 10);
  });

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getBookings({
        // Kita bypass filter status di backend supaya dilakuin di frontend secara case-insensitive
        date_from: date || undefined,
        date_to: date || undefined,
        search: search || undefined,
      });
      let list = res.data.bookings || [];

      // 1. Filter Status secara lokal
      if (status) {
        list = list.filter((b: any) => {
          const bStatus = (b.bookingStatus || b.status || "").toLowerCase();
          return bStatus === status.toLowerCase();
        });
      }

      // 2. Filter Layanan secara lokal
      if (service) {
        list = list.filter((b: any) => {
          // Tangkap nama layanan dari berbagai kemungkinan properti
          const sName = (b.focusArea?.name || b.therapistSpecializations?.[0]?.name) || b.serviceName || b.service_name || "Fisioterapi";
          return sName.toLowerCase().includes(service.toLowerCase());
        });
      }

      setBookings(list);
    } catch (error) {
      console.error("Gagal memuat booking admin:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, service, date, search]);

  useEffect(() => {
    loadBookings();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(loadBookings, 30000);
    return () => clearInterval(interval);
  }, [loadBookings]);

  // Ekspor Data ke File CSV
  const handleExportCsv = () => {
    if (bookings.length === 0) {
      alert("Tidak ada data booking untuk diekspor!");
      return;
    }

    const headers = ["No", "Kode Reservasi", "Nama Pasien", "No Telepon", "Fisioterapis", "Layanan", "Tanggal", "Waktu", "Status"];
    const rows = bookings.map((b, i) => [
      i + 1,
      b.referenceCode || b.bookingReferenceCode || b.reference_code || `#HP-${String(b.id).substring(0,6)}`,
      `"${b.patientName || b.patient_name || "-"}"`,
      `"${b.patientPhone || b.patient_phone || "-"}"`,
      `"${b.therapistName || b.therapist_name || "-"}"`,
      `"${(b.focusArea?.name || b.therapistSpecializations?.[0]?.name) || b.serviceName || b.service_name || "Fisioterapi"}"`,
      `" ${(b.bookingDate || b.slotDate || b.slot_date || "-").substring(0, 10)}"`,
      `" ${b.bookingTime ? `${b.bookingTime.substring(0, 5)} WIB` : "-"}"`,
      b.bookingStatus || b.status || "-",
    ]);

    // Pakai separator titik koma (;) buat region Indonesia dan tambahkan BOM (\uFEFF) buat Excel
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Booking_HaiPhysio_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      
      {/* --- HEADER HALAMAN --- */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-[28px] font-bold text-[#1b2a4e]">Daftar Booking Pasien</h2>
        <p className="text-[#585858] text-[15px]">Kelola dan pantau seluruh jadwal konsultasi masuk secara real-time.</p>
      </div>

      {/* --- FILTER BAR --- */}
      <BookingFilter 
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        service={service}
        onServiceChange={setService}
        date={date}
        onDateChange={setDate}
        onExportCsv={handleExportCsv}
      />

      {/* --- TABEL BOOKING --- */}
      <BookingTable 
        bookings={bookings}
        isLoading={isLoading}
        onRefresh={loadBookings}
      />

    </div>
  );
}
