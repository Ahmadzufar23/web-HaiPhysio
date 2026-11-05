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
  grossCash: number;
  grossXendit: number;
  bookingsCash: number;
  bookingsXendit: number;
  commissionXendit: number;
  commissionCash: number;
  owedToClinic: number;
  outstandingToClinic: number;
  invoiceStatus: InvoiceStatus | null;
  invoiceId: string | null;
  billingStatus: "active" | "suspended";
  suspendSource: "auto" | "manual" | null;
  commissionAmount: number;
  hangingBookings: number;
  groupId: string;
  groupName: string;
  groupSlug: string;
  logoUrl: string | null;
  branchName: string | null;
  overdueInvoices: number;
  autoNoShowBookings: number;
}

export interface Overview {
  period: string;
  totals: { platformRevenue: number; commissionXendit: number; commissionCash: number; owedToClinics: number; outstandingToClinics: number; gross: number; grossCash: number; grossXendit: number; bookingsCash: number; bookingsXendit: number; completedBookings: number };
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

export interface ClinicSettlement {
  id: string;
  amount: number;
  transferredOn: string;
  reference: string | null;
  note: string | null;
  recordedByName: string;
  createdAt: string;
  voidedAt: string | null;
  voidedByName: string | null;
  voidReason: string | null;
}

export interface ClinicSettlements {
  summary: { totalOwed: number; totalSettled: number; outstanding: number };
  settlements: ClinicSettlement[];
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
  group: { id: string; slug: string; name: string; tagline: string | null; about: string | null; foundedYear: number | null; logoUrl: string | null; accentColor: string | null };
  branches: { id: string; slug: string; brand: string; branchName: string | null; billingStatus: "active" | "suspended" }[];
  setup: { hasLogo: boolean; hasPrices: boolean; hasTherapists: boolean; hasSchedule: boolean };
  clinic: {
    id: string;
    groupId: string;
    branchName: string | null;
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

export type AccountRole = "pasien" | "terapis" | "owner";

export interface PlatformAccount {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: AccountRole;
  brand: string | null;
  slug: string | null;
  therapistStatus: "aktif" | "nonaktif" | null;
  accountStatus: "aktif" | "belum_aktivasi" | "offline";
  lastLoginAt: string | null;
}

export type ResetLink = { link: string; expiresAt: string; whatsappUrl: string };

export type CreateBranchPayload = {
  slug: string;
  brand: string;
  name: string;
  branch_name: string;
  whatsapp: string;
  address?: string;
  first_branch?: { slug: string; branch_name: string };
};

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

  getSettlements: async (clinicId: string): Promise<ApiSuccess<ClinicSettlements>> => (await bookingApi.get(`${BASE}/clinics/${clinicId}/settlements`)).data,

  recordSettlement: async (clinicId: string, input: { amount: number; transferred_on: string; reference?: string; note?: string }) =>
    (await bookingApi.post(`${BASE}/clinics/${clinicId}/settlements`, input)).data,

  voidSettlement: async (settlementId: string, reason: string) => (await bookingApi.post(`${BASE}/settlements/${settlementId}/void`, { reason })).data,

  extendInvoice: async (invoiceId: string, dueDate: string) => (await bookingApi.post(`${BASE}/invoices/${invoiceId}/extend`, { due_date: dueDate })).data,

  markReminded: async (invoiceId: string) => (await bookingApi.post(`${BASE}/invoices/${invoiceId}/remind`)).data,

  reverseBooking: async (bookingId: string, reason: string) => (await bookingApi.post(`${BASE}/bookings/${bookingId}/reverse`, { reason })).data,

  listAccounts: async (params: { q?: string; role?: AccountRole; clinic_id?: string }): Promise<ApiSuccess<{ accounts: PlatformAccount[] }>> => (await bookingApi.get(`${BASE}/accounts`, { params })).data,

  createResetLink: async (userId: string): Promise<ApiSuccess<ResetLink>> => (await bookingApi.post(`${BASE}/accounts/${userId}/reset-link`)).data,

  createBranch: async (groupId: string, data: CreateBranchPayload) => (await bookingApi.post(`${BASE}/groups/${groupId}/branches`, data)).data,

  updateGroup: async (groupId: string, data: { name?: string; tagline?: string | null; about?: string | null; founded_year?: number | null; accent_color?: string | null }) => (await bookingApi.patch(`${BASE}/groups/${groupId}`, data)).data,

  uploadGroupLogo: async (groupId: string, image: string) => (await bookingApi.put(`${BASE}/groups/${groupId}/logo`, { image })).data,

  listReminders: async (): Promise<ApiSuccess<{ reminders: Reminder[] }>> => (await bookingApi.get(`${BASE}/reminders`)).data,

  listHanging: async (): Promise<ApiSuccess<{ bookings: HangingBooking[] }>> => (await bookingApi.get(`${BASE}/hanging-bookings`)).data,

  listAudit: async (): Promise<ApiSuccess<{ entries: AuditEntry[] }>> => (await bookingApi.get(`${BASE}/audit-log`)).data,
};

// Bulan berjalan menurut WIB, format YYYY-MM
export const currentPeriod = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date()).slice(0, 7);

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = { pending: "Menunggu", paid: "Lunas", overdue: "Telat" };
