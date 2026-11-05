import { bookingApi } from "@/app/utils/api";
import type { ClinicDirectoryEntry, ClinicLinkTarget, PublicClinic } from "@/constants/clinic";

export const publicClinicService = {
  listClinics: async (): Promise<ClinicDirectoryEntry[]> => {
    const response = await bookingApi.get("/clinics");
    return response.data.data.clinics;
  },

  getClinic: async (slug: string): Promise<PublicClinic> => {
    const response = await bookingApi.get(`/clinics/${encodeURIComponent(slug)}`);
    return response.data.data.clinic;
  },

  resolveLink: async (slug: string): Promise<ClinicLinkTarget> => {
    const response = await bookingApi.get(`/clinics/link/${encodeURIComponent(slug)}`);
    return response.data.data;
  },
};
