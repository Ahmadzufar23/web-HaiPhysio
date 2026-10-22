import { bookingApi } from "@/app/utils/api";
import type { ApiSuccess, CreateBookingResult, PatientPackage } from "@/types/api.types";

// Body POST /api/bookings (strict di BE). Paket baru: package_id + focus_id;
// sisa paket: patient_package_id. slot_ids = 1..sisa kuota jadwal.
export type CreateBookingPayload = {
  slot_ids: string[];
  focus_id?: string;
  package_id?: string;
  patient_package_id?: string;
  pain_level: number;
  complaint_notes?: string;
  patient_name?: string;
  patient_phone?: string;
};

export const bookingService = {
  
  // 1. Narik semua riwayat booking pasien
  // (Bisa dikasih param status buat fitur filter tab Nanti)
  getRiwayatBooking: async (status?: string) => {
    // Kalau milih "Semua", kita nggak usah kirim filter ke backend
    const params = status && status !== "Semua" ? { status } : {};
    const response = await bookingApi.get("/bookings", { params });
    return response.data;
  },

  // 2. Narik detail satu booking spesifik
  getDetailBooking: async (id: string) => {
    const response = await bookingApi.get(`/bookings/${id}`);
    return response.data;
  },

  // 3. Bikin booking baru (Buat di ujung Langkah 4 Konfirmasi)
  createBooking: async (data: CreateBookingPayload): Promise<ApiSuccess<CreateBookingResult>> => {
    const response = await bookingApi.post("/bookings", data);
    return response.data;
  },

  // Paket milik pasien beserta sisa sesi yang belum dijadwalkan
  getMyPackages: async (): Promise<ApiSuccess<{ packages: PatientPackage[] }>> => {
    const response = await bookingApi.get("/patient-packages");
    return response.data;
  },

  // 4. Batalin booking (paling lambat H-2 sebelum jadwal)
  cancelBooking: async (id: string, cancellation_reason?: string) => {
    const response = await bookingApi.patch(`/bookings/${id}/cancel`, {
      cancellation_reason
    });
    return response.data;
  },

  // 5. Ubah jadwal / Reschedule (paling lambat H-2 sebelum jadwal)
  rescheduleBooking: async (id: string, new_slot_id: string, reschedule_reason?: string) => {
    const response = await bookingApi.patch(`/bookings/${id}/reschedule`, {
      new_slot_id,
      reschedule_reason
    });
    return response.data;
  },

  // BAGIAN DATA BROWSING (Nggak butuh login)

  // 6. Narik daftar terapis berdasarkan ID Layanan (focus_id)
  getTherapists: async (focus_id: string) => {
    const response = await bookingApi.get("/therapists", {
      params: { focus_id }
    });
    return response.data;
  },
  
  // 6. Ambil Daftar Layanan (Focus Areas)
  getFocusAreas: async () => {
    const response = await bookingApi.get("/focus-areas");
    return response.data;
  },

  // 7. Narik kotak-kotak ketersediaan jadwal terapis (per minggu)
  getScheduleGrid: async (therapist_id: string, week: string) => {
    const response = await bookingApi.get("/schedule-grid", {
      params: { therapist_id, week }
    });
    return response.data;
  }
};