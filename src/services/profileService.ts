import { authApi, clearSessionToken } from "@/app/utils/api";

// Bikin satu object yang isinya fungsi-fungsi buat nembak API Profil
export const profileService = {
  
  // Fungsi buat ngambil data profil (GET)
  getProfile: async () => {
    const response = await authApi.get("/profile");
    return response.data;
  },

  // Simpan editan profil (PATCH). Email, telepon, dan tanggal lahir tidak bisa diubah di sini.
  // String kosong pada address/occupation = hapus isian.
  updateProfile: async (data: Partial<Record<"full_name" | "gender" | "address" | "occupation", string | null>>) => {
    const response = await authApi.patch("/profile", data);
    return response.data;
  },

  // Foto profil: data URL JPEG yang sudah diperkecil (lib/imageResize.ts), maks 200 KB
  uploadPhoto: async (image: string) => {
    const response = await authApi.put("/profile/photo", { image });
    return response.data;
  },

  deletePhoto: async () => {
    const response = await authApi.delete("/profile/photo");
    return response.data;
  },

  // Fungsi buat ganti password (PATCH)
  changePassword: async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
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