import { bookingApi } from "@/app/utils/api";
import type { AdminBooking, AdminPatient, AdminSlot, AdminTherapist, ApiSuccess, BookingStatus } from "@/types/api.types";

type BookingStats = { totalToday: number; totalThisWeek: number; byStatus: Record<BookingStatus, number> };
type TherapistPayload = {
  full_name?: string;
  photo_url?: string;
  total_patients_label?: string;
  focus_ids?: string[];
  status?: "aktif" | "nonaktif";
  sip?: string;
  phone?: string;
  email?: string;
  education?: string;
};

// Semua endpoint di sini mengikuti kontrak backend HaiPhysio (lihat backend/API_REFERENCE.md).
// Response selalu { success, data }, jadi pemanggil membaca res.data.<field>.
export const adminService = {

  // --- 1. MANAJEMEN BOOKING PASIEN ---

  // GET /api/admin/bookings — filter status ("Terkonfirmasi" | "Selesai" | "Dibatalkan"), tanggal, search
  getBookings: async (params?: { status?: BookingStatus; date_from?: string; date_to?: string; search?: string }): Promise<ApiSuccess<{ bookings: AdminBooking[] }>> => {
    const response = await bookingApi.get("/admin/bookings", { params });
    return response.data;
  },

  // GET /api/admin/bookings/stats — { totalToday, totalThisWeek, byStatus }
  getBookingStats: async (): Promise<ApiSuccess<{ stats: BookingStats }>> => {
    const response = await bookingApi.get("/admin/bookings/stats");
    return response.data;
  },

  // Ubah status booking dari tabel admin. Backend hanya punya 2 aksi:
  // - Dibatalkan -> PATCH /api/bookings/:id/cancel (admin WAJIB kirim cancellation_reason)
  // - Selesai    -> PATCH /api/admin/bookings/:id/complete
  updateBookingStatus: async (id: string, status: string, reason?: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "dibatalkan") {
      const response = await bookingApi.patch(`/bookings/${id}/cancel`, {
        cancellation_reason: reason?.trim() || "Dibatalkan oleh Admin",
      });
      return response.data;
    }

    if (normalizedStatus === "selesai") {
      const response = await bookingApi.patch(`/admin/bookings/${id}/complete`);
      return response.data;
    }

    throw new Error(`Status "${status}" tidak didukung oleh backend`);
  },

  // PATCH /api/bookings/:id/reschedule (admin WAJIB kirim reschedule_reason)
  rescheduleBooking: async (id: string, newSlotId: string, reason?: string) => {
    const response = await bookingApi.patch(`/bookings/${id}/reschedule`, {
      new_slot_id: newSlotId,
      reschedule_reason: reason
    });
    return response.data;
  },


  // --- 2. MANAJEMEN SLOT JADWAL TERAPIS ---

  // GET /api/admin/slots
  getSlots: async (params?: { date_from?: string; date_to?: string; therapist_id?: string }): Promise<ApiSuccess<{ slots: AdminSlot[] }>> => {
    const response = await bookingApi.get("/admin/slots", { params });
    return response.data;
  },

  // POST /api/admin/slots — 409 SLOT_DATE_TIME_CONFLICT kalau bentrok dengan slot lain
  createSlot: async (data: {
    therapistId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity?: number;
  }) => {
    const response = await bookingApi.post("/admin/slots", {
      therapist_id: data.therapistId,
      slot_date: data.slotDate,
      start_time: data.startTime,
      end_time: data.endTime,
      capacity: data.capacity ?? 1,
    });
    return response.data;
  },

  // DELETE /api/admin/slots/:id
  deleteSlot: async (id: string) => {
    const response = await bookingApi.delete(`/admin/slots/${id}`);
    return response.data;
  },

  // PATCH /api/admin/slots/:id — buka/tutup slot
  // targetStatus: true = aktifkan (status: "aktif"), false = nonaktifkan (status: "nonaktif")
  toggleSlot: async (id: string, targetStatus: boolean) => {
    const response = await bookingApi.patch(`/admin/slots/${id}`, {
      status: targetStatus ? "aktif" : "nonaktif",
    });
    return response.data;
  },


  // --- 3. DATA PASIEN (read-only) ---

  // GET /api/admin/patients — data akun pasien + ringkasan booking.
  // Field alias (name, birthDate, lastBookingDate) dipertahankan untuk komponen lama.
  getPatients: async (search?: string): Promise<ApiSuccess<{ patients: AdminPatient[] }>> => {
    type RawPatient = Omit<AdminPatient, "name" | "birthDate" | "lastBookingDate" | "lastService"> & { lastService: string | null };
    const response = await bookingApi.get<ApiSuccess<{ patients: RawPatient[] }>>("/admin/patients", {
      params: { search: search || undefined },
    });
    const patients: AdminPatient[] = response.data.data.patients.map((p) => ({
      ...p,
      name: p.fullName,
      birthDate: p.dateOfBirth,
      lastBookingDate: p.lastVisitDate,
      lastService: p.lastService ? `Fisioterapi ${p.lastService}` : "-",
    }));
    return { success: true, data: { patients } };
  },


  // --- 4. MANAJEMEN DATA TERAPIS ---

  // GET /api/admin/therapists — tiap item punya status: "aktif" | "nonaktif"
  getTherapists: async (): Promise<ApiSuccess<{ therapists: AdminTherapist[] }>> => {
    const response = await bookingApi.get("/admin/therapists");
    return response.data;
  },

  // GET /api/admin/therapists/:id — 404 THERAPIST_NOT_FOUND kalau tidak ada
  getTherapistById: async (id: string): Promise<ApiSuccess<{ therapist: AdminTherapist }>> => {
    const response = await bookingApi.get(`/admin/therapists/${id}`);
    return response.data;
  },

  // POST /api/admin/therapists — { full_name, photo_url?, total_patients_label?, focus_ids[], sip?, phone?, email?, education? }
  createTherapist: async (data: TherapistPayload & { full_name: string; focus_ids: string[] }) => {
    const response = await bookingApi.post("/admin/therapists", data);
    return response.data;
  },

  // PATCH /api/admin/therapists/:id — termasuk { status } untuk aktif/nonaktif
  updateTherapist: async (id: string, data: TherapistPayload) => {
    const response = await bookingApi.patch(`/admin/therapists/${id}`, data);
    return response.data;
  },

  // DELETE /api/admin/therapists/:id — soft delete (status jadi nonaktif)
  deleteTherapist: async (id: string) => {
    const response = await bookingApi.delete(`/admin/therapists/${id}`);
    return response.data;
  },
};
