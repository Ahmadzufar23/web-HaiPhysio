"use client";

import { useState } from "react";
import { CircleNotch, Eye, EyeSlash } from "@phosphor-icons/react";
import { authApi, getApiErrorMessage, saveSessionToken } from "@/app/utils/api";

type AdminLoginErrors = {
  email?: string;
  password?: string;
  /** Kesalahan dari server (kredensial salah, akun nonaktif, dst.), tampil di atas form */
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const labelClass = "mb-1.5 block text-[13px] font-medium text-zinc-700";

// outline-none! menimpa :focus-visible global (styles/motion.css); fokus input
// ditandai border + ring 1px seperti input di dashboard.
const fieldClass = (hasError: boolean) =>
  `h-10 w-full rounded-md border bg-white px-3 text-[14px] text-zinc-900 outline-none! transition-colors placeholder:text-zinc-400 ${
    hasError
      ? "border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-zinc-300 hover:border-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
  }`;

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [errors, setErrors] = useState<AdminLoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const nextErrors: AdminLoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!emailPattern.test(email.trim())) {
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
      // Login khusus staf: owner & terapis (pasien ditolak 403)
      const res = await authApi.post("/admin/login", {
        email: email.trim(),
        password,
      });

      // Simpan token bearer dari response { success, data: { user, token } }
      saveSessionToken(res.data?.data?.token);
      window.location.href = "/admin";
    } catch (error) {
      console.error("Gagal login admin:", error);
      const status = (error as { response?: { status?: number } }).response?.status;

      if (status === 401) {
        setErrors({ form: "Email atau kata sandi salah." });
      } else if (status === 400 || status === 403 || status === 429) {
        // 403 = akun pasien / terapis nonaktif, 429 = terlalu banyak percobaan
        setErrors({ form: getApiErrorMessage(error) });
      } else {
        setErrors({ form: getApiErrorMessage(error, "Tidak dapat terhubung ke server. Coba lagi sebentar.") });
      }
      setIsLoading(false);
    }
  };

  const checkCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState("CapsLock"));

  return (
    <form className="space-y-5" noValidate onSubmit={handleAdminLogin}>
      {errors.form && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          {errors.form}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className={labelClass}>
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "admin-email-error" : undefined}
          className={fieldClass(Boolean(errors.email))}
        />
        {errors.email && (
          <p id="admin-email-error" className="mt-1.5 text-[12px] text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Kata sandi
        </label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            onBlur={() => setCapsLock(false)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "admin-password-error" : undefined}
            className={`${fieldClass(Boolean(errors.password))} pr-10`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700"
          >
            {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.password ? (
          <p id="admin-password-error" className="mt-1.5 text-[12px] text-red-600">
            {errors.password}
          </p>
        ) : (
          capsLock && <p className="mt-1.5 text-[12px] text-amber-700">Caps Lock aktif.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 text-[14px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-700"
      >
        {isLoading && <CircleNotch size={16} className="animate-spin" />}
        {isLoading ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
