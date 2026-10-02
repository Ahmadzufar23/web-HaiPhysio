"use client";

import { useState } from "react";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import { authApi, getApiErrorMessage, saveSessionToken } from "@/app/utils/api";

type AdminLoginErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AdminLoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const nextErrors: AdminLoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email Admin wajib diisi.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Masukkan format email yang valid.";
    }

    if (!password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }

    return nextErrors;
  }

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // 1. Nembak API Login khusus Admin
      const res = await authApi.post("/admin/login", {
        email: email.trim(),
        password: password,
      });

      // 2. Simpan token bearer dari response { success, data: { user, token } }
      saveSessionToken(res.data?.data?.token);

      // 3. Sukses login admin -> Langsung lempar ke Dashboard Admin
      window.location.href = "/admin";
    } catch (error: any) {
      console.error("Gagal login admin:", error);
      const status = error.response?.status;

      if (status === 401) {
        setErrors({ password: "Email atau kata sandi admin salah. Silakan cek kembali." });
      } else if (status === 400 || status === 403 || status === 429) {
        // 403 = EMAIL_NOT_REGISTERED_AS_ADMIN (akun pasien mencoba login admin)
        setErrors({ email: getApiErrorMessage(error) });
      } else {
        setErrors({ password: getApiErrorMessage(error, "Gagal terhubung ke server auth. Pastikan backend aktif.") });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleAdminLogin}
    >
      <AuthInput
        label="Email Admin"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="admin@haiphysio.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <AuthPasswordInput
        label="Kata Sandi"
        name="password"
        autoComplete="current-password"
        placeholder="********"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <AuthButton disabled={isLoading}>
        {isLoading ? "Memverifikasi Admin..." : "Masuk ke Dashboard"}
      </AuthButton>
    </form>
  );
}
