"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import BookingFilter from "@/components/admin/booking/BookingFilter";
import BookingTable from "@/components/admin/booking/BookingTable";
import { PageHeader, Panel, btn } from "@/components/admin/shared/AdminUI";
import { adminService } from "@/services/adminService";
import type { AdminBooking, BookingStatus } from "@/types/api.types";
import { todayWib } from "@/lib/format";

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [date, setDate] = useState(todayWib);
  // Filter yang datanya sedang tampil; beda dengan filter aktif = masih memuat
  const filterKey = `${status}|${date}|${search.trim()}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== filterKey;

  const loadBookings = useCallback(
    () =>
      adminService
        .getBookings({
          status: status || undefined,
          date_from: date || undefined,
          date_to: date || undefined,
          search: search.trim() || undefined,
        })
        .then((res) => setBookings(res.data.bookings))
        .catch((error) => {
          console.error("Gagal memuat booking:", error);
          setBookings([]);
        })
        .finally(() => setLoadedKey(filterKey)),
    [status, date, search, filterKey]
  );

  useEffect(() => {
    const t = setTimeout(loadBookings, 250); // jeda kecil saat mengetik di kolom cari
    const interval = setInterval(loadBookings, 60_000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [loadBookings]);

  const handleExportCsv = () => {
    if (bookings.length === 0) return;
    const headers = ["Kode", "Pasien", "Telepon", "Paket", "Terapis", "Tanggal", "Jam", "Status"];
    const rows = bookings.map((b) => [
      b.referenceCode,
      `"${b.patientName}"`,
      `"${b.patientPhone}"`,
      `"${b.packageName ?? "-"}"`,
      `"${b.therapistName}"`,
      b.bookingDate.slice(0, 10),
      b.bookingTime.slice(0, 5),
      b.bookingStatus,
    ]);
    // Separator ; untuk Excel lokal Indonesia, BOM supaya karakter terbaca benar
    const csv = "﻿" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-haiphysio-${date || "semua"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Booking & Sesi"
        description="Buka sesi untuk memilih terapis, menekan Start/Selesai, dan mengisi rekam medis."
        actions={
          <Link href="/admin/booking/walk-in" className={btn.primary}>
            <Plus size={13} />
            Pasien datang langsung
          </Link>
        }
      />
      <BookingFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        date={date}
        onDateChange={setDate}
        onExportCsv={handleExportCsv}
      />
      <Panel>
        <BookingTable bookings={bookings} isLoading={isLoading} onRefresh={loadBookings} />
      </Panel>
    </div>
  );
}
