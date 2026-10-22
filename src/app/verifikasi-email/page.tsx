"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import AuthShell from "@/components/auth/AuthShell";
import { authApi, getApiErrorMessage } from "@/app/utils/api";

// Tujuan tautan di email verifikasi: /verifikasi-email?token=...
export default function VerifyEmailPage() {
  return (
    <AuthShell headline="Verifikasi Email" illustration="mail" hideHero>
      <Suspense fallback={<p className="py-10 text-center text-[14px] text-slate-500">Memverifikasi…</p>}>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}

function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<{ status: "loading" | "ok" | "error"; message: string }>(
    token ? { status: "loading", message: "" } : { status: "error", message: "Tautan verifikasi tidak lengkap. Buka ulang tautan dari email kamu." }
  );
  // Token sekali pakai: jangan dikirim dua kali (StrictMode menjalankan efek dua kali di dev)
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    authApi
      .post("/verify-email", { token })
      .then(() => setState({ status: "ok", message: "Email kamu sudah terverifikasi. Silakan masuk untuk mulai booking." }))
      .catch((error) => setState({ status: "error", message: getApiErrorMessage(error, "Tautan verifikasi tidak valid atau sudah kedaluwarsa.") }));
  }, [token]);

  if (state.status === "loading") {
    return <p className="py-10 text-center text-[14px] text-slate-500">Memverifikasi email…</p>;
  }

  const ok = state.status === "ok";
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${ok ? "bg-brand-100 text-gold-700" : "bg-red-50 text-red-600"}`}>
        {ok ? <CheckCircle size={28} /> : <WarningCircle size={28} />}
      </span>
      <div className="space-y-2">
        <h2 className="text-[24px] font-bold leading-tight text-brand-900">{ok ? "Email terverifikasi" : "Verifikasi gagal"}</h2>
        <p className="text-[15px] leading-7 text-[#707070]">{state.message}</p>
        {!ok && <p className="text-[13px] text-slate-500">Masuk dengan email dan kata sandimu untuk menerima tautan baru.</p>}
      </div>
      <Link
        href="/login"
        className="flex h-12 w-full items-center justify-center rounded-[8px] bg-brand-500 px-5 text-[15px] font-semibold text-brand-950 transition hover:bg-brand-600"
      >
        Ke halaman login
      </Link>
    </div>
  );
}
