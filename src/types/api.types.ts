// Tipe data respons backend HaiPhysio — mengikuti backend/API_REFERENCE.md.
// Dipakai supaya komponen tidak membaca respons sebagai `any` (field salah nama
// langsung ketahuan saat compile, bukan diam-diam jadi undefined di UI).

export type ApiSuccess<T> = { success: true; data: T };

export type BookingStatus = "Terkonfirmasi" | "Selesai" | "Dibatalkan";
export type ActiveStatus = "aktif" | "nonaktif";

export interface FocusArea {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Specialization {
  id: string;
  name: string;
  slug: string;
}

// GET /api/admin/bookings
export interface AdminBooking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  therapistId: string;
  therapistName: string;
  therapistSpecializations: Specialization[];
  focusArea: Pick<FocusArea, "id" | "name" | "slug"> | null;
  bookingDate: string;
  bookingTime: string;
  bookingEndTime: string;
  bookingStatus: BookingStatus;
  referenceCode: string;
  isActionAllowed: boolean;
}

// GET /api/admin/slots
export interface AdminSlot {
  id: string;
  therapistId: string;
  therapistName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: ActiveStatus;
  bookedCount: number;
  remaining: number;
}

// GET /api/admin/therapists, /api/admin/therapists/:id
export interface AdminTherapist {
  id: string;
  fullName: string;
  photoUrl: string | null;
  totalPatientsLabel: string | null;
  sip: string | null;
  phone: string | null;
  email: string | null;
  education: string | null;
  status: ActiveStatus;
  specializations: Specialization[];
}

// GET /api/admin/patients (+ alias yang ditambahkan adminService.getPatients)
export interface AdminPatient {
  id: string;
  patientCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  registeredAt: string;
  totalBookings: number;
  totalSessions: number;
  lastVisitDate: string | null;
  lastService: string;
  name: string;
  birthDate: string | null;
  lastBookingDate: string | null;
}

// POST /api/bookings (respons berisi baris tabel bookings)
export interface CreatedBooking {
  id: string;
  bookingReferenceCode: string;
  bookingStatus: BookingStatus;
}

// Bentuk error axios dari backend: { success: false, error: { code, message, fields? } }
export interface ApiErrorLike {
  response?: {
    status?: number;
    data?: { error?: { code?: string; message?: string; fields?: Record<string, string> } };
  };
}
