import { authApi, bookingApi, saveSessionToken } from "@/app/utils/api";
import type { ApiSuccess } from "@/types/api.types";

export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface BillingInvoice {
  id: string;
  period: string;
  amount: number;
  status: InvoiceStatus;
  issuedOn: string;
  dueDate: string;
  invoiceUrl: string | null;
  paidAt: string | null;
  remindedAt: string | null;
}

export interface OverviewClinic {
  clinicId: string;
  slug: string;
  brand: string;
  completedBookings: number;
  gross: number;
  commissionXendit: number;
  commissionCash: number;
  owedToClinic: number;
  invoiceStatus: InvoiceStatus | null;
  invoiceId: string | null;
  billingStatus: "active" | "suspended";
  suspendSource: "auto" | "manual" | null;
  commissionAmount: number;
  hangingBookings: number;
  autoNoShowBookings: number;
}

export interface Overview {
  period: string;
  totals: { platformRevenue: number; commissionXendit: number; commissionCash: number; owedToClinics: number; gross: number; completedBookings: number };
  clinics: OverviewClinic[];
}

export interface ClinicTransactions {
  clinic: {
    id: string;
    brand: string;
    slug: string;
    commissionAmount: number;
    billingStatus: "active" | "suspended";
    suspendSource: "auto" | "manual" | null;
    suspensionOverrideUntil: string | null;
  };
  period: string;
  invoice: BillingInvoice | null;
  transactions: {
    id: string;
    bookingId: string;
    referenceCode: string;
    packageName: string | null;
    entryType: "charge" | "reversal";
    paymentMethod: "cash" | "xendit";
    grossAmount: number;
    commissionAmount: number;
    status: "settled_auto" | "unbilled" | "billed" | "paid";
    occurredAt: string;
  }[];
}

export type Reminder = BillingInvoice & {
  clinicId: string;
  brand: string;
  reason: "due_in_3_days" | "due_today" | "overdue";
  message: string;
  whatsappUrl: string | null;
};

export interface HangingBooking {
  id: string;
  clinicId: string;
  brand: string;
  referenceCode: string;
  status: string;
  slotDate: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  brand: string | null;
  actorName: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export type CreateClinicPayload = {
  slug: string;
  brand: string;
  name: string;
  whatsapp: string;
  commission_amount?: number;
  owner: { full_name: string; email: string; phone: string; password: string };
};

export interface ClinicDetails {
  clinic: {
    id: string;
    slug: string;
    brand: string;
    name: string;
    address: string | null;
    hours: string | null;
    hoursNote: string | null;
    whatsapp: string | null;
    homeVisitWhatsapp: string | null;
    email: string | null;
    instagram: string | null;
  };
  accounts: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    role: "owner" | "terapis";
    therapistStatus: "aktif" | "nonaktif" | null;
    sip: string | null;
    lastLoginAt: string | null;
  }[];
  therapistsWithoutAccount: { therapistId: string; fullName: string; therapistStatus: "aktif" | "nonaktif"; sip: string | null }[];
  packages: { id: string; name: string; totalSessions: number | null; pricePerSession: number | null; isHomeVisit: boolean; isActive: boolean }[];
  stats: { patients: number; upcomingActiveSlots: number; activeVideos: number; bookingsByStatus: Record<string, number> };
}

export interface ClinicBookings {
  period: string;
  total: number;
  bookings: {
    id: string;
    referenceCode: string;
    status: string;
    source: "online" | "walk_in";
    paymentMethod: "cash" | "xendit";
    packageName: string | null;
    pricePerSession: number | null;
    slotDate: string;
    startTime: string;
    therapistName: string;
  }[];
}

export type ClinicProfilePayload = {
  brand?: string;
  name?: string;
  address?: string | null;
  hours?: string | null;
  hours_note?: string | null;
  whatsapp?: string | null;
  home_visit_whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
};

const BASE = "/super-admin";

export const superAdminService = {
  login: async (email: string, password: string) => {
    const response = await authApi.post("/super-admin/login", { email, password });
    saveSessionToken(response.data?.data?.token);
    return response.data;
  },

  getOverview: async (period: string): Promise<ApiSuccess<Overview>> => (await bookingApi.get(`${BASE}/overview`, { params: { period } })).data,

  getTransactions: async (clinicId: string, period: string): Promise<ApiSuccess<ClinicTransactions>> =>
    (await bookingApi.get(`${BASE}/clinics/${clinicId}/transactions`, { params: { period } })).data,

  getDetails: async (clinicId: string): Promise<ApiSuccess<ClinicDetails>> => (await bookingApi.get(`${BASE}/clinics/${clinicId}/details`)).data,

  getBookings: async (clinicId: string, period: string): Promise<ApiSuccess<ClinicBookings>> =>
    (await bookingApi.get(`${BASE}/clinics/${clinicId}/bookings`, { params: { period } })).data,

  updateProfile: async (clinicId: string, data: ClinicProfilePayload) => (await bookingApi.patch(`${BASE}/clinics/${clinicId}`, data)).data,

  createClinic: async (data: CreateClinicPayload): Promise<ApiSuccess<{ clinic: { id: string; slug: string } }>> => (await bookingApi.post(`${BASE}/clinics`, data)).data,

  updateCommission: async (clinicId: string, amount: number) => (await bookingApi.patch(`${BASE}/clinics/${clinicId}/commission`, { commission_amount: amount })).data,

  suspend: async (clinicId: string, reason: string) => (await bookingApi.post(`${BASE}/clinics/${clinicId}/suspend`, { reason })).data,

  unsuspend: async (clinicId: string, overrideUntil?: string) =>
    (await bookingApi.post(`${BASE}/clinics/${clinicId}/unsuspend`, overrideUntil ? { override_until: overrideUntil } : {})).data,

  extendInvoice: async (invoiceId: string, dueDate: string) => (await bookingApi.post(`${BASE}/invoices/${invoiceId}/extend`, { due_date: dueDate })).data,

  markReminded: async (invoiceId: string) => (await bookingApi.post(`${BASE}/invoices/${invoiceId}/remind`)).data,

  reverseBooking: async (bookingId: string, reason: string) => (await bookingApi.post(`${BASE}/bookings/${bookingId}/reverse`, { reason })).data,

  listReminders: async (): Promise<ApiSuccess<{ reminders: Reminder[] }>> => (await bookingApi.get(`${BASE}/reminders`)).data,

  listHanging: async (): Promise<ApiSuccess<{ bookings: HangingBooking[] }>> => (await bookingApi.get(`${BASE}/hanging-bookings`)).data,

  listAudit: async (): Promise<ApiSuccess<{ entries: AuditEntry[] }>> => (await bookingApi.get(`${BASE}/audit-log`)).data,
};

// Bulan berjalan menurut WIB, format YYYY-MM
export const currentPeriod = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date()).slice(0, 7);

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = { pending: "Menunggu", paid: "Lunas", overdue: "Telat" };
