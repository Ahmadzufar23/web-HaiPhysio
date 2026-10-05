import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      headline="Pemulihan Tepat, Terapi Tanpa Ribet"
      description="Buat akun pasien untuk mengatur janji temu dan mengikuti progres terapi dengan lebih mudah."
    >
      <div className="mb-7 space-y-2">
        <h2 className="text-[28px] font-bold text-brand-900">Daftar Pasien</h2>
        <p className="text-[15px] leading-6 text-slate-500">
          Lengkapi data berikut untuk membuat akun Hai Physio.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-7 text-center text-[14px] text-slate-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand-900 hover:text-gold-700">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}
