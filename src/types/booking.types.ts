// src/types/booking.types.ts

// Tipe data buat list terapis
export interface Terapis {
  id: string;
  name: string;
  sp: string;
  rating: number;
  patients: string;
  photo: string;
}

// Tipe data buat kotak-kotak jadwal di kalender
export interface SlotJadwal {
  id: string;
  date: string;
  time: string;
  therapistId: string;
  status: "tersedia" | "penuh" | "tidak_praktik";
}

// Tipe data buat card di halaman Riwayat Booking
export interface RiwayatBooking {
  id: string;
  layanan: string;
  tanggal: string;
  waktu: string;
  terapis: string;
  status: "Terkonfirmasi" | "Selesai" | "Dibatalkan";
  keluhan?: string;
  alasanBatal?: string;
}

// Tipe data buat nangkep inputan form di fitur "Buat Janji Temu"
export interface FormBookingData {
  serviceId: string;
  therapistId: string;
  scheduleId: string;
  patientData: {
    name: string;
    phone: string;
    email: string;
    complaint?: string;
    painPoints?: string[]; // id dari BODY_REGIONS (body map)
    painScale?: number | null; // 1 sampai 10
    photoPreview?: string | null;
  } | null;
}