import { bookingApi } from "@/app/utils/api";
import type { PublicClinic } from "@/constants/clinic";

export const publicClinicService = {
  listClinics: async (): Promise<PublicClinic[]> => {
    const response = await bookingApi.get("/clinics");
    return response.data.data.clinics;
  },

  getClinic: async (slug: string): Promise<PublicClinic> => {
    const response = await bookingApi.get(`/clinics/${encodeURIComponent(slug)}`);
    return response.data.data.clinic;
  },
};
