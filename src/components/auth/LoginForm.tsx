"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import EmailVerificationNotice from "./EmailVerificationNotice";
import { authApi, getApiErrorCode, getApiErrorMessage, getApiErrorStatus, saveSessionToken } from "../../app/utils/api";

type LoginErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  // Email belum diverifikasi: BE sudah mengirim ulang tautan, tampilkan petunjuk
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  function validate() {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email wajib diisi.";
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

  // Bikin fungsi submitnya jadi async
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Bersihin error sebelumnya dan nyalain mode loading
    setErrors({});
    setIsLoading(true);

    try {
      // Nembak API Login
      const res = await authApi.post("/login", {
        email: email,
        password: password,
      });

      // Simpan session token ke localStorage
      saveSessionToken(res.data?.data?.token);

      // Kalau sukses dapet cookie/token dari backend, langsung lempar ke halaman profil
      window.location.href = "/";
      
    } catch (error) {
      console.error("Gagal login:", error);
      
      // Tangkep pesan error dari backend
      const status = getApiErrorStatus(error);
      
      if (getApiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email.trim().toLowerCase());
      } else if (status === 401) {
        setErrors({ password: "Email atau kata sandi salah. Silakan cek kembali." });
      } else if (status === 403) {
        setErrors({ email: "Akun ini terdaftar sebagai admin. Silakan masuk lewat halaman admin." });
      } else if (status === 400 || status === 429) {
        setErrors({ email: getApiErrorMessage(error) });
      } else {
        setErrors({ password: getApiErrorMessage(error, "Terjadi kesalahan sistem. Coba lagi nanti!") });
      }
    } finally {
      // Matiin loading kalau proses udah kelar (baik sukses maupun gagal)
      setIsLoading(false);
    }
  };

  if (unverifiedEmail) {
    return <EmailVerificationNotice email={unverifiedEmail} intro="Akunmu belum diverifikasi. Kami sudah mengirim ulang tautan verifikasi ke" />;
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleLogin}
    >
      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="contoh@email.com"
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
      <Link
        href="/reset-password"
        className="block text-right text-[14px] font-semibold text-brand-900 hover:text-gold-700"
      >
        Lupa kata sandi?
      </Link>
      
      {/* Oper prop disabled sama ubah teksnya kalau lagi loading */}
      <AuthButton disabled={isLoading}>
        {isLoading ? "Masuk..." : "Masuk"}
      </AuthButton>
    </form>
  );
}