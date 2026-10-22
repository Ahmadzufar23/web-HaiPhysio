import axios, { type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorLike } from "@/types/api.types";

// Backend HaiPhysio sekarang SATU service (auth + booking) di port yang sama.
// Dua instance tetap dipertahankan supaya base path-nya beda:
// - authApi    -> <host>/api/v1/auth
// - bookingApi -> <host>/api
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Jalur khusus buat endpoint Auth (Login, Register, Profil)
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || `${API_HOST}/api/v1/auth`,
  // Ini wajib true biar cookie session otomatis keikut pas request
  withCredentials: true,
});

// Jalur khusus buat endpoint Booking (Layanan, Terapis, Jadwal, Booking, Admin)
export const bookingApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BOOKING_API_URL || `${API_HOST}/api`,
  // Ini juga wajib true biar backend tau kita udah login
  withCredentials: true,
});

// --- Session token (bearer) ---
// Backend pakai Better Auth + bearer plugin: login/register balikin `data.token`.
// Cookie tetap dipakai, token bearer jadi cadangan saat FE & BE beda domain
// (cookie cross-site bisa diblok browser).
const TOKEN_KEY = "session_token";
const LEGACY_TOKEN_KEYS = ["token", "auth_token"];

export const saveSessionToken = (token?: string | null) => {
  if (typeof window === "undefined" || !token) return;
  localStorage.setItem(TOKEN_KEY, token);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const clearSessionToken = () => {
  if (typeof window === "undefined") return;
  [TOKEN_KEY, ...LEGACY_TOKEN_KEYS].forEach((key) => localStorage.removeItem(key));
};

const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Interceptor untuk menyisipkan header Authorization: Bearer <token> secara otomatis
const attachAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
bookingApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// --- Helper response/error ---
// Semua endpoint backend balikin { success, data } / { success: false, error: { code, message, fields? } }.

export const getApiErrorStatus = (error: unknown): number | undefined =>
  (error as ApiErrorLike | undefined)?.response?.status;

export const getApiErrorCode = (error: unknown): string | undefined =>
  (error as ApiErrorLike | undefined)?.response?.data?.error?.code;

export const getApiErrorMessage = (error: unknown, fallback = "Terjadi kesalahan. Coba lagi nanti."): string => {
  const response = (error as ApiErrorLike | undefined)?.response;
  if (!response) {
    // Error non-HTTP yang dilempar kode kita sendiri (mis. validasi respons) tetap ditampilkan
    if (error instanceof Error && !("isAxiosError" in error)) return error.message || fallback;
    return "Tidak dapat terhubung ke server. Pastikan backend aktif.";
  }
  if (response.status === 429) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  return response.data?.error?.message || fallback;
};
