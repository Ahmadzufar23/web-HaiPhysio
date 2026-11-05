import { bookingApi } from "@/app/utils/api";
import type { ClinicSetup } from "@/components/shared/ClinicSetupChecklist";
import type { ApiSuccess } from "@/types/api.types";

export type OwnerClinicProfile = {
  clinic: {
    id: string;
    slug: string;
    brand: string;
    name: string;
    branchName: string | null;
    address: string | null;
    hours: string | null;
    hoursNote: string | null;
    whatsapp: string | null;
    homeVisitWhatsapp: string | null;
    email: string | null;
    instagram: string | null;
  };
  group: { id: string; slug: string; name: string; tagline: string | null; about: string | null; foundedYear: number | null; logoUrl: string | null; accentColor: string | null };
  setup: ClinicSetup;
};

export type BranchSummary = {
  slug: string;
  brand: string;
  branchName: string | null;
  billingStatus: "active" | "suspended";
  completedSessions: number;
  revenue: number;
  upcomingBookings: number;
  noShows: number;
  overdueInvoices: number;
};

export type OwnerClinicPayload = Partial<Record<"address" | "hours" | "hours_note" | "whatsapp" | "home_visit_whatsapp" | "email" | "instagram" | "tagline" | "about", string | null>> & {
  name?: string;
  founded_year?: number | null;
  accent_color?: string | null;
};

export const ownerClinicService = {
  getProfile: async (): Promise<ApiSuccess<OwnerClinicProfile>> => (await bookingApi.get("/admin/clinic/profile")).data,
  updateProfile: async (data: OwnerClinicPayload): Promise<ApiSuccess<OwnerClinicProfile>> => (await bookingApi.patch("/admin/clinic/profile", data)).data,
  uploadLogo: async (image: string): Promise<ApiSuccess<{ logoUrl: string }>> => (await bookingApi.put("/admin/clinic/logo", { image })).data,
  getBranchesSummary: async (period: string): Promise<ApiSuccess<{ period: string; branches: BranchSummary[] }>> =>
    (await bookingApi.get("/admin/clinic/branches-summary", { params: { period } })).data,
  transferTherapist: async (therapistId: string, targetSlug: string): Promise<ApiSuccess<{ therapistId: string; clinic: { slug: string; brand: string } }>> =>
    (await bookingApi.post(`/admin/therapists/${therapistId}/transfer`, { target_slug: targetSlug })).data,
};
