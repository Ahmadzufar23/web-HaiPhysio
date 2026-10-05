"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import AuthPolicyModal from "./AuthPolicyModal";
import { authApi, getApiErrorMessage, saveSessionToken } from "../../app/utils/api";

type RegisterErrors = {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  password?: string;
  confirmPassword?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{8,}$/;
const registeredEmails = ["pasien@haiphysio.com", "terdaftar@email.com"];
const registeredPhones = ["081234567890", "0812 3456 7890"];
const duplicateMessage =
  "Email/No Telepon ini sudah terdaftar. Silakan gunakan yang lain atau langsung masuk ke akun Anda.";

export default function RegisterForm() {
  const [agreed, setAgreed] = useState(false);
  const [activePolicy, setActivePolicy] = useState<"terms" | "privacy" | null>(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  // State buat ngunci tombol pas lagi nembak API
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors: RegisterErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "Nama lengkap wajib diisi.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "Masukkan format email yang valid.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "No. Telepon wajib diisi.";
    } else if (!phonePattern.test(values.phone)) {
      nextErrors.phone = "Masukkan no. telepon yang valid.";
    }

    if (!values.birthDate) {
      nextErrors.birthDate = "Tanggal lahir wajib diisi.";
    }

    if (!values.password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    } else if (values.password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
      nextErrors.password = "Gunakan kombinasi huruf dan angka.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi belum sama.";
    }

    return nextErrors;
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Nembak API Register dengan format key sesuai permintaan backend
      const res = await authApi.post("/register", {
        fullName: values.name,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.birthDate,
        password: values.password,
        passwordConfirmation: values.confirmPassword,
        termsAgreement: agreed,
      });

      // Simpan session token ke localStorage
      saveSessionToken(res.data?.data?.token);

      // Kalau sukses, user dilempar ke profil
      window.location.href = "/profil";

    } catch (error: any) {
      console.error("Gagal register:", error);
      
      const status = error.response?.status;
      const errorCode = error.response?.data?.error?.code;

      const systemErrors: RegisterErrors = {};

      if (status === 409) {
        // Handle konflik email atau nomor telepon
        if (errorCode === "EMAIL_ALREADY_REGISTERED") {
          systemErrors.email = duplicateMessage;
        } else if (errorCode === "PHONE_ALREADY_REGISTERED") {
          systemErrors.phone = duplicateMessage;
        } else if (errorCode === "REGISTRATION_CONFLICT") {
          systemErrors.email = duplicateMessage;
          systemErrors.phone = duplicateMessage;
        }
      } else {
        // 400 (validasi Zod backend), 429 (rate limit), atau error server
        alert(getApiErrorMessage(error, "Terjadi kesalahan sistem saat mendaftar. Coba lagi nanti!"));
      }

      if (Object.keys(systemErrors).length > 0) {
        setErrors(systemErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleRegister}
      >
        <AuthInput
          label="Nama Lengkap"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Tulis Nama Lengkap Anda"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
        />
        <AuthInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="contoh@email.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
        />
        <AuthInput
          label="No. Telepon"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0812 3456 7890"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          error={errors.phone}
        />
        <AuthInput
          label="Tanggal Lahir"
          name="birthDate"
          type="date"
          value={values.birthDate}
          onChange={(event) => updateField("birthDate", event.target.value)}
          error={errors.birthDate}
        />
        <div className="space-y-2">
          <AuthPasswordInput
            label="Kata Sandi"
            name="password"
            autoComplete="new-password"
            placeholder="********"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
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
          value={values.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          error={errors.confirmPassword}
        />

        <label className="flex items-start gap-3 text-[14px] leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-gold-700 accent-brand-500"
          />
          <span>
            Saya menyetujui{" "}
            <button
              type="button"
              onClick={() => setActivePolicy("terms")}
              className="font-semibold text-brand-900 hover:text-gold-700"
            >
              Syarat & Ketentuan
            </button>{" "}
            serta{" "}
            <button
              type="button"
              onClick={() => setActivePolicy("privacy")}
              className="font-semibold text-brand-900 hover:text-gold-700"
            >
              Kebijakan Privasi
            </button>{" "}
            yang berlaku.
          </span>
        </label>

        {/* Tombol dikunci kalau belum dicentang ATAU lagi loading */}
        <AuthButton disabled={!agreed || isLoading}>
          {isLoading ? "Membuat Akun..." : "Buat Akun"}
        </AuthButton>
      </form>

      <AuthPolicyModal
        open={activePolicy !== null}
        title={activePolicy === "terms" ? "Syarat & Ketentuan" : "Kebijakan Privasi"}
        onClose={() => setActivePolicy(null)}
      />
    </>
  );
}