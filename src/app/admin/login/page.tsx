import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminLoginForm from "@/components/auth/AdminLoginForm";
import { CLINIC } from "@/constants/clinic";

export const metadata: Metadata = {
  title: "Masuk | Panel Klinik Hai Physio",
};

// Login staf (owner & terapis). Sengaja polos dan memakai gaya yang sama dengan
// dashboard (zinc, panel ber-border 1px) supaya terasa satu aplikasi.
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image src="/fisio_nobg.png" alt="Hai Physio" width={122} height={80} priority className="h-14 w-auto" />
            <h1 className="mt-6 text-[20px] font-semibold tracking-tight text-zinc-900">Masuk ke panel klinik</h1>
            <p className="mt-1.5 text-[14px] text-zinc-500">Khusus owner dan terapis Hai Physio.</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-7">
            <AdminLoginForm />
          </div>

          <p className="mt-6 text-center text-[13px] text-zinc-500">Lupa kata sandi? Minta owner klinik mengatur ulang.</p>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-zinc-200 px-6 py-4 text-[12px] text-zinc-500 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {CLINIC.name}
        </span>
        <Link href="/" className="transition-colors hover:text-zinc-900">
          Ke situs pasien
        </Link>
      </footer>
    </div>
  );
}
