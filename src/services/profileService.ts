import { authApi, clearSessionToken } from "@/app/utils/api";

// Bikin satu object yang isinya fungsi-fungsi buat nembak API Profil
export const profileService = {
  
  // Fungsi buat ngambil data profil (GET)
  getProfile: async () => {
    const response = await authApi.get("/profile");
    return response.data;
  },

  // Fungsi buat nyimpen editan profil (PATCH) — hanya full_name yang didukung backend
  updateProfile: async (data: { full_name: string }) => {
    const response = await authApi.patch("/profile", data);
    return response.data;
  },

  // Fungsi buat ganti password (PATCH)
  changePassword: async (data: any) => {
    // Lu perhatiin di kodingan asli lu kemaren endpointnya panjang banget,
    // sekarang cukup tulis path ujungnya aja karena baseURL udah di-setting di authApi
    const response = await authApi.patch("/profile/password", data);
    return response.data;
  },

  // Fungsi buat logout (POST)
  logout: async () => {
    try {
      const response = await authApi.post("/logout");
      return response.data;
    } finally {
      clearSessionToken();
    }
  }
};