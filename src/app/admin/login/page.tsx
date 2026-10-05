import Link from "next/link";
import AdminLoginForm from "@/components/auth/AdminLoginForm";
import AuthShell from "@/components/auth/AuthShell";

export default function AdminLoginPage() {
  return (
    <AuthShell
      headline="Kelola Klinik Lebih Praktis & Terpusat"
      description="Akses panel admin untuk mengatur jadwal, data pasien, dan operasional klinik dalam satu tempat."
      illustration="admin"
    >
      <div className="mb-7 space-y-2">
        <h2 className="text-[28px] font-bold text-brand-900">Login Admin</h2>
        <p className="text-[15px] leading-6 text-slate-500">
          Masuk menggunakan kredensial admin klinik.
        </p>
      </div>

      <AdminLoginForm />

      <Link
        href="/"
        className="mt-7 block text-center text-[14px] font-semibold text-brand-900 hover:text-gold-700"
      >
        Bukan Admin? Kembali ke Beranda Pasien
      </Link>
    </AuthShell>
  );
}
