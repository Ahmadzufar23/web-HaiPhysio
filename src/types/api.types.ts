// Tipe data respons backend HaiPhysio — mengikuti backend/API_REFERENCE.md.
// Dipakai supaya komponen tidak membaca respons sebagai `any` (field salah nama
// langsung ketahuan saat compile, bukan diam-diam jadi undefined di UI).

export type ApiSuccess<T> = { success: true; data: T };

export type BookingStatus = "Terkonfirmasi" | "Berlangsung" | "Selesai" | "Dibatalkan" | "Tidak Hadir";
export type StaffRole = "terapis" | "owner";
export type UserRole = "pasien" | StaffRole;
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
  // Dari akun pasien; null untuk akun lama yang belum mengisi
  patientGender: string | null;
  /** "walk_in" = didaftarkan staf di klinik */
  source: BookingSource;
  therapistId: string;
  therapistName: string;
  therapistSpecializations: Specialization[];
  focusArea: Pick<FocusArea, "id" | "name" | "slug"> | null;
  bookingDate: string;
  bookingTime: string;
  bookingEndTime: string;
  bookingStatus: BookingStatus;
  referenceCode: string;
  packageName: string | null;
  createdAt: string;
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
  /** Akun login terapis; null = belum dibuatkan owner */
  account: { email: string; isOwner: boolean } | null;
}

// GET /api/admin/patients (+ alias yang ditambahkan adminService.getPatients)
export interface AdminPatient {
  id: string;
  patientCode: string;
  fullName: string;
  /** null = akun offline (belum punya email) */
  email: string | null;
  accountStatus: PatientAccountStatus;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  occupation: string | null;
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
  slotId: string;
  bookingReferenceCode: string;
  bookingStatus: BookingStatus;
}

// GET /api/patient-packages — paket milik pasien & sisa kuotanya
export interface PatientPackage {
  id: string;
  packageId: string;
  packageName: string;
  focusArea: { id: string; name: string | null } | null;
  totalSessions: number;
  /** Terjadwal (Terkonfirmasi/Berlangsung) */
  scheduled: number;
  completed: number;
  noShow: number;
  /** Belum dijadwalkan */
  remaining: number;
  createdAt: string;
}

// POST /api/bookings
export interface CreateBookingResult {
  booking: CreatedBooking;
  bookings: CreatedBooking[];
  patientPackage: PatientPackage | null;
}

// Bentuk error axios dari backend: { success: false, error: { code, message, fields? } }
export interface ApiErrorLike {
  response?: {
    status?: number;
    data?: { error?: { code?: string; message?: string; fields?: Record<string, string> } };
  };
}

// GET /api/therapists?focus_id= (publik: hanya terapis aktif)
export interface PublicTherapist {
  id: string;
  fullName: string;
  photoUrl: string | null;
  totalPatientsLabel: string | null;
  specializations: Specialization[];
}

// GET /api/packages, /api/admin/packages — harga null = belum diatur owner
export interface TherapyPackage {
  id: string;
  code: string;
  name: string;
  totalSessions: number | null;
  pricePerSession: number | null;
  isHomeVisit: boolean;
  isActive: boolean;
}

export type BodyPointSource = "patient" | "therapist";
export interface BodyPoint {
  regionId: string;
  source: BodyPointSource;
}

// Rekam medis per pasien (diisi terapis, dibaca pasien)
export interface MedicalRecord {
  diagnosis: string | null;
  medications: string | null;
  notes: string | null;
  homeExercise: string | null;
  bodyPoints: BodyPoint[];
  updatedAt: string | null;
}

// Asesmen klinis per sesi: nyeri VAS 0–10 & lingkup gerak sendi (ROM)
export type RomSide = "kiri" | "kanan" | "-";
export interface RomMeasurement {
  joint: string;
  movement: string;
  side: RomSide;
  degrees: number;
}
export interface SessionAssessment {
  painBefore: number | null;
  painAfter: number | null;
  rom: RomMeasurement[];
  functionalNotes: string | null;
  updatedAt?: string;
}

// GET /api/progress, /api/admin/patients/:id/progress — urut tanggal lama → baru
export interface ProgressPoint extends SessionAssessment {
  bookingId: string;
  status: BookingStatus;
  date: string;
  startTime: string;
  therapistName: string | null;
}

// GET /api/admin/patients/:id/medical-record/history
export interface MedicalRecordRevision extends Omit<MedicalRecord, "updatedAt"> {
  id: string;
  editedAt: string;
  editedByName: string | null;
}

// GET /api/medical-record/report, /api/admin/patients/:id/medical-record/report — data cetak PDF
export interface MedicalRecordReport {
  patient: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    occupation: string | null;
    photoUrl: string | null;
  };
  medicalRecord: MedicalRecord;
  visits: {
    id: string;
    referenceCode: string;
    date: string;
    startTime: string;
    packageName: string | null;
    therapistName: string | null;
    complaintNotes: string | null;
    painLevel: number | null;
    sessionRecord: Omit<MedicalRecord, "updatedAt"> | null;
    assessment: SessionAssessment | null;
  }[];
  progress: ProgressPoint[];
  generatedAt: string;
}

// GET /api/admin/sessions/:id
export interface SessionDetail {
  session: {
    id: string;
    referenceCode: string;
    status: BookingStatus;
    date: string;
    startTime: string;
    endTime: string;
    complaintNotes: string | null;
    painLevel: number | null;
    source: BookingSource;
    scheduledTherapist: { id: string; fullName: string };
    handledByTherapist: { id: string; fullName: string } | null;
    startedAt: string | null;
    endedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    /** Catatan terapi sudah disimpan setelah Start — syarat tombol Selesai */
    noteReady: boolean;
    /** Hari jadwal sudah tiba — syarat tombol Start */
    canStart: boolean;
    /** Jam jadwal sudah lewat — syarat tombol Tidak Hadir */
    canMarkNoShow: boolean;
    package: { id: string; name: string | null; totalSessions: number | null; isHomeVisit: boolean; pricePerSession: number | null } | null;
    recordedAmount: number | null;
    patientPackage: PatientPackage | null;
  };
  assessment: SessionAssessment | null;
  patient: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    photoUrl: string | null;
    gender: string | null;
    address: string | null;
    occupation: string | null;
  };
  medicalRecord: MedicalRecord;
  therapists: { id: string; fullName: string; userId: string | null; isOwner: boolean }[];
  history: { id: string; status: BookingStatus; packageName: string | null; date: string; startTime: string; therapistName: string | null }[];
}

// Absensi harian staf: hadir otomatis dari sesi selesai, selain itu ditandai owner
export type AttendanceMarkStatus = "hadir_tanpa_pasien" | "sakit" | "izin" | "tidak_hadir";
export type AttendanceDayStatus = "hadir" | AttendanceMarkStatus | "belum_ditandai";

export interface StaffAttendanceSummary {
  isOwner: boolean;
  daysPresent: number;
  daysNoPatient: number;
  daysSick: number;
  daysLeave: number;
  daysAbsent: number;
  daysUnmarked: number;
  /** Jam slot terjadwal pada hari hadir */
  workMinutes: number;
  /** Total durasi Start → Selesai */
  therapyMinutes: number;
}

export interface AttendanceDay {
  therapistId: string;
  therapistName: string;
  isOwner: boolean;
  date: string;
  status: AttendanceDayStatus;
  note: string | null;
  markedAt: string | null;
  scheduledSlots: number;
  completedSessions: number;
  firstStart: string | null;
  lastEnd: string | null;
  workMinutes: number;
  therapyMinutes: number;
}

// GET /api/admin/reports
export interface ClinicReport {
  range: { dateFrom: string; dateTo: string };
  totals: { revenue: number; completedSessions: number; sessionsWithoutPrice: number };
  therapists: ({ therapistId: string; therapistName: string; sessions: number; revenue: number } & StaffAttendanceSummary)[];
  attendanceDays: AttendanceDay[];
  revenue: { bookingId: string; recordedAt: string; amount: number; therapistName: string; patientName: string; packageName: string | null }[];
  attendance: { therapistName: string; patientName: string; scheduledTime: string; startedAt: string; endedAt: string | null }[];
}

// ---------- Video terapi (lihat API_REFERENCE bagian I) ----------
export type VideoSource = "upload" | "youtube";

export interface TherapyVideo {
  id: string;
  folderId: string;
  title: string;
  description: string | null;
  source: VideoSource;
  youtubeId: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  isActive: boolean;
  ready: boolean;
  createdAt: string;
}

export interface VideoFolder {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  videoCount: number;
  coverUrl: string | null;
}

export interface StaffVideoFolder extends Omit<VideoFolder, "videoCount" | "coverUrl"> {
  videos: (TherapyVideo & { fileSize: number | null; activePatients: number })[];
}

export type VideoPlayback = { type: "youtube"; youtubeId: string } | { type: "file"; url: string; mimeType: string | null };

export interface VideoDetail {
  video: TherapyVideo;
  folder: { name: string; slug: string } | null;
  playback: VideoPlayback;
  /** watchToken wajib dikirim saat check-in */
  assignment: { id: string; dosage: string | null; doneToday: boolean; watchToken: string } | null;
}

export interface ProgramItem {
  id: string;
  dosage: string | null;
  assignedAt: string;
  doneToday: boolean;
  daysDone: number;
  video: TherapyVideo;
}

export interface VideoProgram {
  today: string;
  items: ProgramItem[];
  calendar: { date: string; completed: number }[];
  streak: number;
}

export interface StaffVideoProgram extends VideoProgram {
  days: string[];
  items: (ProgramItem & { doneDates: string[] })[];
}

export type DashboardPeriod = "today" | "week" | "month";

// GET /api/admin/dashboard — terapis: hanya jadwal miliknya, revenue null
export interface DashboardData {
  period: DashboardPeriod;
  range: { from: string; to: string };
  counts: { total: number; waiting: number; inProgress: number; completed: number; cancelled: number };
  sessions: {
    id: string;
    status: BookingStatus;
    patientName: string;
    patientGender: string | null;
    packageName: string | null;
    date: string;
    startTime: string;
    therapistName: string;
  }[];
  revenue: number | null;
}

// GET /api/bookings (riwayat milik pasien yang login)
export interface PatientBooking {
  id: string;
  therapistName: string;
  focusArea: { id: string; name: string; slug: string } | null;
  bookingDate: string;
  bookingTime: string;
  bookingEndTime: string | null;
  bookingStatus: BookingStatus;
  referenceCode: string;
  packageName: string | null;
  isActionAllowed: boolean;
  complaintNotes: string | null;
  painLevel: number | null;
  cancellationReason: string | null;
  handledByTherapistName: string | null;
  patientPackageId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  /** Catatan terapis yang dibekukan saat sesi selesai; null untuk sesi lama */
  sessionRecord: Omit<MedicalRecord, "updatedAt"> | null;
}

export type BookingSource = "online" | "walk_in";

// GET /api/admin/patients/lookup — pencarian pasien untuk walk-in
export interface WalkInPatient {
  id: string;
  patientCode: string;
  fullName: string;
  phone: string;
  /** null = akun offline (belum punya email) */
  email: string | null;
  accountStatus: PatientAccountStatus;
  dateOfBirth: string | null;
  gender: string | null;
  /** Paket yang masih punya sisa sesi */
  activePackages: PatientPackage[];
}

// GET /api/admin/bookings/walk-in-slots
export interface WalkInSlot {
  id: string;
  therapistId: string;
  therapistName: string;
  therapistSpecializations: Specialization[];
  slotDate: string;
  startTime: string;
  endTime: string;
  remaining: number;
  /** Jam mulai sudah lewat tapi belum berakhir */
  inProgress: boolean;
  /** Terapis menangani layanan yang dipilih */
  handlesFocus: boolean;
}

/** aktif = sudah punya password; belum_aktivasi = menunggu pasien membuka link; offline = belum ada email */
export type PatientAccountStatus = "aktif" | "belum_aktivasi" | "offline";

// GET /api/bookings/:id — detail satu booking milik pasien yang login
export interface BookingDetail {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  complaintNotes: string | null;
  complaintPhotoUrl: string | null;
  painLevel: number | null;
  therapistName: string;
  therapistSpecializations: Specialization[];
  focusArea: Pick<FocusArea, "id" | "name" | "slug"> | null;
  bookingDate: string;
  bookingTime: string;
  bookingEndTime: string;
  bookingStatus: BookingStatus;
  referenceCode: string;
  packageName: string | null;
  cancellationReason: string | null;
  rescheduleReason: string | null;
  createdAt: string;
  isActionAllowed: boolean;
}

// GET /api/schedule-grid?therapist_id=&week= — slot satu terapis dalam sepekan
export interface ScheduleGridCell {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  confirmedBookings: number;
  remainingQuota: number;
  cellStatus: "Tersedia" | "Penuh" | "Tidak Praktik";
  /** Jam slot sudah lewat */
  isPast: boolean;
  /** Pasien boleh memilih (paling cepat H-1) */
  isBookable: boolean;
}
