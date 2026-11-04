// Identitas platform (sistem booking & rekam medis buatan kita), terpisah dari identitas
// klinik di constants/clinic.ts. Pasien melihat nama klinik; nama platform tampil sebagai
// "Ditenagai oleh …" di situs publik, dan sebagai nama aplikasi di panel staf.
// Ganti di sini (dan PLATFORM_NAME di backend/src/constants/brand.ts) bila nama berubah.
export const PLATFORM = {
  name: "Hyungtang Care",
  company: "Hyungtang",
  // Logo asli Hyungtang: huruf h hijau dengan titik emas, latar transparan
  logo: "/platform/hyungtang-logo.png",
  tagline: "Sistem booking & rekam medis klinik",
};
