"use client";

import { authApi, getApiErrorMessage } from "@/app/utils/api";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import AuthShell from "./AuthShell";

type ResetStep = "request" | "sent" | "new-password" | "success";

type ResetErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordPageClient() {
  // ?token=xxx dari link di email → langsung tampilkan form sandi baru
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // ?aktivasi=1 = link dari email aktivasi akun yang dibuatkan klinik (walk-in)
  const isActivation = Boolean(token) && searchParams.get("aktivasi") === "1";

  const [step, setStep] = useState<ResetStep>(token ? "new-password" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetErrors>({});

  const isCentered = step === "sent" || step === "success";
  
  // LOGIKA HEADLINE & DESCRIPTION (Otomatis berubah menyesuaikan step)
  const headline = isActivation
    ? "Selamat Datang di Hai Physio"
    : step === "new-password"
    ? "Kembali Amankan Akun Anda" 
    : "Atur Ulang Akses Akun Anda";
    
  const description = step === "new-password"
    ? "Silakan masukkan kata sandi baru yang kuat. Pastikan untuk menggunakan kombinasi yang unik demi keamanan optimal."
    : "Masukkan email Anda yang telah terdaftar. Kami akan mengirimkan tautan untuk mereset kata sandi Anda.";

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Email wajib diisi." });
      return;
    }
    if (!emailPattern.test(email)) {
      setErrors({ email: "Masukkan format email yang valid." });
      return;
    }
    setErrors({});
    
    try {
      // Nembak API Lupa Password
      await authApi.post("/forgot-password", { email });
      setStep("sent");
    } catch (error) {
      console.error("Gagal request reset password:", error);
      // Backend Hai Physio selalu sukses balik 200 demi keamanan, tapi jika error koneksi/rate limit:
      setErrors({ email: getApiErrorMessage(error, "Gagal mengirim permintaan. Coba lagi nanti.") });
    }
  }

  async function submitNewPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ResetErrors = {};
    if (!password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = "Gunakan kombinasi huruf dan angka.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi belum sama.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      if (!token) {
        setErrors({ password: "Tautan atur ulang tidak valid. Silakan minta tautan baru." });
        return;
      }
      await authApi.post("/reset-password", {
        token,
        newPassword: password,
        newPasswordConfirmation: confirmPassword
      });
      setStep("success");
    } catch (error) {
      setErrors({ password: getApiErrorMessage(error, "Gagal memperbarui kata sandi. Token mungkin sudah kedaluwarsa.") });
    }
  }

  return (
    <AuthShell
      headline={headline}
      description={description} // <-- PERBAIKAN: Variabel dipanggil di sini
      illustration="mail"
      hideHero={isCentered}
    >
      {step === "request" ? (
        <>
          <div className="mb-7 space-y-2">
            <h2 className="text-[28px] font-bold text-brand-900">Atur Ulang Kata Sandi</h2>
            <p className="text-[15px] leading-6 text-slate-500">
              Kami akan mengirim tautan pengaturan ulang ke email yang terdaftar.
            </p>
          </div>

          <form className="space-y-5" noValidate onSubmit={submitEmail}>
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
            <AuthButton>Kirim Instruksi Reset</AuthButton>
            <Link
              href="/login"
              className="block text-center text-[14px] font-semibold text-brand-900 hover:text-gold-700"
            >
              Kembali ke Login
            </Link>
          </form>
        </>
      ) : null}

      {step === "sent" ? (
        <div className="flex min-h-[430px] flex-col items-center justify-center space-y-6 text-center">
          <div className="relative mx-auto h-44 w-44 md:h-52 md:w-52">
            <Image
              src="/wait-reset.png"
              alt="Instruksi reset kata sandi terkirim"
              fill
              sizes="(max-width: 768px) 176px, 208px"
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-[26px] font-bold leading-tight text-gold-700">
              Permintaan Atur Ulang Sandi Terkirim
            </h2>
            <p className="text-[15px] leading-7 text-[#707070]">
              Silakan periksa kotak masuk atau folder spam email Anda. Form kata sandi baru akan terbuka sebentar lagi.
            </p>
          </div>
        </div>
      ) : null}

      {step === "new-password" ? (
        <>
          {/* PERBAIKAN: Potongan '<div classname=' yang salah sudah dihapus dari sini */}
          <div className="mb-7 space-y-2">
            <h2 className="text-[28px] font-bold text-brand-900">{isActivation ? "Aktifkan Akun Kamu" : "Buat Kata Sandi Baru"}</h2>
            {isActivation && (
              <p className="text-[15px] leading-6 text-slate-500">
                Klinik sudah membuatkan akun untuk kamu. Buat kata sandi untuk masuk dan melihat riwayat terapi.
              </p>
            )}
          </div>

          <form className="space-y-5" noValidate onSubmit={submitNewPassword}>
            <div className="space-y-2">
              <AuthPasswordInput
                label="Kata Sandi"
                name="password"
                autoComplete="new-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.password}
              />
              <p className="text-[13px] leading-5 text-slate-500">
                Gunakan minimal 8 karakter dengan kombinasi huruf dan angka
              </p>
            </div>
            <AuthPasswordInput
              label="Konfirmasi Kata Sandi"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="********"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirmPassword}
            />
            <AuthButton>{isActivation ? "Aktifkan Akun" : "Konfirmasi Kata Sandi Baru"}</AuthButton>
          </form>
        </>
      ) : null}

      {step === "success" ? (
        <div className="flex min-h-[430px] flex-col items-center justify-center space-y-6 text-center">
          <div className="h-36 w-36 rounded-[8px] bg-slate-200" aria-hidden="true" />
          <div className="space-y-3">
            <h2 className="text-[26px] font-bold leading-tight text-gold-700">
              {isActivation ? "Akun Kamu Sudah Aktif!" : "Sandi Baru Anda Berhasil Disimpan!"}
            </h2>
            <p className="text-[15px] leading-7 text-[#707070]">
              {isActivation
                ? "Silakan masuk dengan email dan kata sandi yang baru kamu buat."
                : "Sandi Anda sudah kami perbarui. Silakan login kembali dengan sandi baru Anda."}
            </p>
          </div>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-[8px] bg-brand-500 px-5 text-[15px] font-semibold text-brand-950 transition hover:bg-brand-600"
          >
            Kembali ke Login
          </Link>
        </div>
      ) : null}
    </AuthShell>
  );
}