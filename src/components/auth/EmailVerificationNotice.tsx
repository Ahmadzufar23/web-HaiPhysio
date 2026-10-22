"use client";

import Link from "next/link";
import { useState } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { authApi, getApiErrorMessage } from "@/app/utils/api";

// Ditampilkan setelah registrasi atau saat login dengan email yang belum diverifikasi.
export default function EmailVerificationNotice({ email, intro }: { email: string; intro: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const resend = async () => {
    setStatus("sending");
    try {
      await authApi.post("/resend-verification", { email });
      setStatus("sent");
      setMessage("Tautan baru sudah dikirim. Tautan berlaku 1 jam.");
    } catch (error) {
      setStatus("error");
      setMessage(getApiErrorMessage(error, "Gagal mengirim ulang tautan. Coba lagi nanti."));
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-gold-700">
        <EnvelopeSimple size={26} />
      </span>
      <div className="space-y-2">
        <h2 className="text-[24px] font-bold leading-tight text-brand-900">Cek email kamu</h2>
        <p className="text-[15px] leading-7 text-[#707070]">
          {intro} <strong className="text-brand-900">{email}</strong>. Klik tautan di dalamnya untuk mengaktifkan akun, lalu masuk.
        </p>
        <p className="text-[13px] text-slate-500">Tidak ada di kotak masuk? Periksa folder spam atau promosi.</p>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={status === "sending"}
        className="h-11 w-full rounded-[8px] border border-slate-200 text-[14px] font-semibold text-brand-900 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {status === "sending" ? "Mengirim…" : "Kirim ulang tautan verifikasi"}
      </button>
      {message && <p className={`text-[13px] ${status === "error" ? "text-red-600" : "text-slate-600"}`}>{message}</p>}
      <Link href="/login" className="text-[14px] font-semibold text-brand-900 hover:text-gold-700">
        Ke halaman login
      </Link>
    </div>
  );
}
