import { bookingApi } from "@/app/utils/api";
import type { AdminBooking, AdminPatient, AdminSlot, AdminTherapist, ApiSuccess, BookingStatus, PatientPackage, WalkInPatient, WalkInSlot } from "@/types/api.types";

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

type RawPatient = Omit<AdminPatient, "name" | "birthDate" | "lastBookingDate" | "lastService"> & { lastService: string | null };

// Field alias (name, birthDate, lastBookingDate) dipertahankan untuk komponen lama.
const withPatientAliases = (p: RawPatient): AdminPatient => ({
  ...p,
  name: p.fullName,
  birthDate: p.dateOfBirth,
  lastBookingDate: p.lastVisitDate,
  lastService: p.lastService ? `Fisioterapi ${p.lastService}` : "-",
});

// Semua endpoint di sini mengikuti kontrak backend HaiPhysio (lihat backend/API_REFERENCE.md).
// Response selalu { success, data }, jadi pemanggil membaca res.data.<field>.
export const adminService = {

  // --- 1. MANAJEMEN BOOKING PASIEN ---

  // GET /api/admin/bookings — filter status ("Terkonfirmasi" | "Selesai" | "Dibatalkan"), tanggal, search
  // patient_id / booking_id menyaring di server; sort=recent untuk booking terbaru dibuat. Maks 500 baris, total = jumlah tanpa batas.
  getBookings: async (params?: {
    status?: BookingStatus;
    date_from?: string;
    date_to?: string;
    search?: string;
    patient_id?: string;
    booking_id?: string;
    sort?: "schedule" | "recent";
    limit?: number;
  }): Promise<ApiSuccess<{ bookings: AdminBooking[]; total: number }>> => {
    const response = await bookingApi.get("/admin/bookings", { params });
    return response.data;
  },

  // GET /api/admin/bookings/stats — { totalToday, totalThisWeek, byStatus }
  getBookingStats: async (): Promise<ApiSuccess<{ stats: BookingStats }>> => {
    const response = await bookingApi.get("/admin/bookings/stats");
    return response.data;
  },

  // PATCH /api/bookings/:id/cancel — pembatalan oleh klinik (alasan wajib).
  // Sesi selesai / pasien tidak hadir dicatat lewat clinicService (halaman Detail Sesi).
  cancelBooking: async (id: string, reason: string) => {
    const response = await bookingApi.patch(`/bookings/${id}/cancel`, {
      cancellation_reason: reason.trim() || "Dibatalkan oleh klinik",
    });
    return response.data;
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
  getPatients: async (search?: string): Promise<ApiSuccess<{ patients: AdminPatient[] }>> => {
    const response = await bookingApi.get<ApiSuccess<{ patients: RawPatient[] }>>("/admin/patients", {
      params: { search: search || undefined },
    });
    return { success: true, data: { patients: response.data.data.patients.map(withPatientAliases) } };
  },

  // GET /api/admin/patients/:id — satu pasien (halaman Detail Pasien)
  getPatient: async (id: string): Promise<ApiSuccess<{ patient: AdminPatient }>> => {
    const response = await bookingApi.get<ApiSuccess<{ patient: RawPatient }>>(`/admin/patients/${id}`);
    return { success: true, data: { patient: withPatientAliases(response.data.data.patient) } };
  },

  // --- WALK-IN (owner & terapis) ---

  // GET /api/admin/patients/lookup?q= — No. HP (08/62/+62 dianggap sama), email, atau nama
  lookupPatients: async (q: string): Promise<ApiSuccess<{ patients: WalkInPatient[] }>> => {
    const response = await bookingApi.get("/admin/patients/lookup", { params: { q } });
    return response.data;
  },

  // POST /api/admin/patients — buat akun pasien walk-in (email opsional → akun offline)
  createPatient: async (data: {
    full_name: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    email?: string;
    terms_confirmed: true;
  }): Promise<ApiSuccess<{ patient: WalkInPatient; activationSent: boolean }>> => {
    const response = await bookingApi.post("/admin/patients", data);
    return response.data;
  },

  // POST /api/admin/patients/:id/activation — kirim ulang link aktivasi, boleh sambil mengisi email
  sendActivation: async (id: string, email?: string): Promise<ApiSuccess<{ patient: AdminPatient; sentTo: string }>> => {
    const response = await bookingApi.post<ApiSuccess<{ patient: RawPatient; sentTo: string }>>(`/admin/patients/${id}/activation`, email ? { email } : {});
    return { success: true, data: { patient: withPatientAliases(response.data.data.patient), sentTo: response.data.data.sentTo } };
  },

  // GET /api/admin/bookings/walk-in-slots — slot satu tanggal yang belum berakhir
  getWalkInSlots: async (date: string, focusId?: string): Promise<ApiSuccess<{ slots: WalkInSlot[] }>> => {
    const response = await bookingApi.get("/admin/bookings/walk-in-slots", { params: { date, focus_id: focusId || undefined } });
    return response.data;
  },

  // POST /api/admin/bookings — booking atas nama pasien, tanpa aturan H-1
  createWalkInBooking: async (data: {
    patient_id: string;
    slot_ids: string[];
    pain_level: number;
    complaint_notes?: string;
    package_id?: string;
    focus_id?: string;
    patient_package_id?: string;
  }): Promise<ApiSuccess<{ bookings: { id: string; slotId: string }[]; patientPackage: PatientPackage | null }>> => {
    const response = await bookingApi.post("/admin/bookings", data);
    return response.data;
  },

  // PATCH /api/admin/patients/:id/gender — koreksi jenis kelamin (owner saja)
  updatePatientGender: async (id: string, gender: string): Promise<ApiSuccess<{ patient: AdminPatient }>> => {
    const response = await bookingApi.patch<ApiSuccess<{ patient: RawPatient }>>(`/admin/patients/${id}/gender`, { gender });
    return { success: true, data: { patient: withPatientAliases(response.data.data.patient) } };
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

  // POST /api/admin/therapists/:id/account — owner membuat akun login terapis
  createTherapistAccount: async (id: string, data: { email: string; phone: string; password: string }) => {
    const response = await bookingApi.post(`/admin/therapists/${id}/account`, data);
    return response.data;
  },

  // PATCH /api/admin/therapists/:id/account/password — owner mengatur ulang password terapis
  resetTherapistPassword: async (id: string, password: string) => {
    const response = await bookingApi.patch(`/admin/therapists/${id}/account/password`, { password });
    return response.data;
  },

  // DELETE /api/admin/therapists/:id — soft delete (status jadi nonaktif)
  deleteTherapist: async (id: string) => {
    const response = await bookingApi.delete(`/admin/therapists/${id}`);
    return response.data;
  },
};
