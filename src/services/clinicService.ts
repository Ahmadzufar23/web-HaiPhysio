import { bookingApi } from "@/app/utils/api";
import type {
  ApiSuccess,
  AttendanceMarkStatus,
  BodyPoint,
  ClinicReport,
  DashboardData,
  DashboardPeriod,
  MedicalRecord,
  MedicalRecordReport,
  MedicalRecordRevision,
  ProgressPoint,
  RomMeasurement,
  SessionAssessment,
  SessionDetail,
  TherapyPackage,
} from "@/types/api.types";

// Paket terapi, eksekusi sesi, rekam medis, dan laporan (lihat backend/API_REFERENCE.md).
export const clinicService = {
  // GET /api/packages — paket aktif untuk pasien
  getPackages: async (): Promise<ApiSuccess<{ packages: TherapyPackage[] }>> => {
    const response = await bookingApi.get("/packages");
    return response.data;
  },

  // GET /api/admin/packages — owner, termasuk paket nonaktif
  getAdminPackages: async (): Promise<ApiSuccess<{ packages: TherapyPackage[] }>> => {
    const response = await bookingApi.get("/admin/packages");
    return response.data;
  },

  // PATCH /api/admin/packages/:id — price_per_session null = harga belum ditentukan
  updatePackage: async (id: string, data: { price_per_session?: number | null; is_active?: boolean }): Promise<ApiSuccess<{ package: TherapyPackage }>> => {
    const response = await bookingApi.patch(`/admin/packages/${id}`, data);
    return response.data;
  },

  // GET /api/admin/sessions/:id
  getSession: async (id: string): Promise<ApiSuccess<SessionDetail>> => {
    const response = await bookingApi.get(`/admin/sessions/${id}`);
    return response.data;
  },

  // POST /api/admin/sessions/:id/start — mencatat absensi terapis yang dipilih
  startSession: async (id: string, therapistId: string) => {
    const response = await bookingApi.post(`/admin/sessions/${id}/start`, { therapist_id: therapistId });
    return response.data;
  },

  // POST /api/admin/sessions/:id/finish — mencatat pendapatan sesuai paket
  finishSession: async (id: string): Promise<ApiSuccess<{ session: { recordedAmount?: number; priceMissing?: boolean } }>> => {
    const response = await bookingApi.post(`/admin/sessions/${id}/finish`);
    return response.data;
  },

  // POST /api/admin/sessions/:id/cancel — pasien tidak hadir (tanpa absensi & pendapatan)
  cancelSession: async (id: string) => {
    const response = await bookingApi.post(`/admin/sessions/${id}/cancel`);
    return response.data;
  },

  // GET /api/admin/patients/:id/medical-record — staf
  getPatientMedicalRecord: async (patientId: string): Promise<ApiSuccess<{ medicalRecord: MedicalRecord }>> => {
    const response = await bookingApi.get(`/admin/patients/${patientId}/medical-record`);
    return response.data;
  },

  // PUT /api/admin/patients/:id/medical-record
  saveMedicalRecord: async (
    patientId: string,
    data: { diagnosis: string; medications: string; notes: string; homeExercise: string; bodyPoints: BodyPoint[] }
  ): Promise<ApiSuccess<{ medicalRecord: MedicalRecord }>> => {
    const response = await bookingApi.put(`/admin/patients/${patientId}/medical-record`, {
      diagnosis: data.diagnosis,
      medications: data.medications,
      notes: data.notes,
      home_exercise: data.homeExercise,
      body_points: data.bodyPoints.map((p) => ({ region_id: p.regionId, source: p.source })),
    });
    return response.data;
  },

  // GET /api/admin/dashboard?period= — terapis hanya jadwal miliknya
  getDashboard: async (period: DashboardPeriod): Promise<ApiSuccess<DashboardData>> => {
    const response = await bookingApi.get("/admin/dashboard", { params: { period } });
    return response.data;
  },

  // GET /api/medical-record — milik pasien yang login
  getMyMedicalRecord: async (): Promise<ApiSuccess<{ medicalRecord: MedicalRecord }>> => {
    const response = await bookingApi.get("/medical-record");
    return response.data;
  },

  // PUT /api/admin/sessions/:id/assessment — nyeri VAS & ROM sesi ini
  saveAssessment: async (
    sessionId: string,
    data: { painBefore: number | null; painAfter: number | null; rom: RomMeasurement[]; functionalNotes: string }
  ): Promise<ApiSuccess<{ assessment: SessionAssessment }>> => {
    const response = await bookingApi.put(`/admin/sessions/${sessionId}/assessment`, {
      pain_before: data.painBefore,
      pain_after: data.painAfter,
      rom: data.rom,
      functional_notes: data.functionalNotes.trim() || null,
    });
    return response.data;
  },

  // GET /api/admin/patients/:id/progress — staf
  getPatientProgress: async (patientId: string): Promise<ApiSuccess<{ progress: ProgressPoint[] }>> => {
    const response = await bookingApi.get(`/admin/patients/${patientId}/progress`);
    return response.data;
  },

  // GET /api/progress — milik pasien yang login
  getMyProgress: async (): Promise<ApiSuccess<{ progress: ProgressPoint[] }>> => {
    const response = await bookingApi.get("/progress");
    return response.data;
  },

  // GET /api/admin/patients/:id/medical-record/history — siapa mengubah rekam medis & kapan
  getMedicalRecordHistory: async (patientId: string): Promise<ApiSuccess<{ revisions: MedicalRecordRevision[] }>> => {
    const response = await bookingApi.get(`/admin/patients/${patientId}/medical-record/history`);
    return response.data;
  },

  // Data cetak PDF rekam medis: staf (patientId) atau pasien sendiri (tanpa argumen)
  getMedicalRecordReport: async (patientId?: string): Promise<ApiSuccess<MedicalRecordReport>> => {
    const response = await bookingApi.get(patientId ? `/admin/patients/${patientId}/medical-record/report` : "/medical-record/report");
    return response.data;
  },

  // GET /api/admin/reports — owner
  getReport: async (params?: { date_from?: string; date_to?: string }): Promise<ApiSuccess<ClinicReport>> => {
    const response = await bookingApi.get("/admin/reports", { params });
    return response.data;
  },

  // PUT /api/admin/attendance — owner menandai absensi hari tanpa sesi selesai
  markAttendance: async (body: { therapist_id: string; date: string; status: AttendanceMarkStatus; note?: string | null }) => {
    const response = await bookingApi.put("/admin/attendance", body);
    return response.data;
  },

  // DELETE /api/admin/attendance — hapus tanda owner
  clearAttendanceMark: async (params: { therapist_id: string; date: string }) => {
    const response = await bookingApi.delete("/admin/attendance", { params });
    return response.data;
  },
};
