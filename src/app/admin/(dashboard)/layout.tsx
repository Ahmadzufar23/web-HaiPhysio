import AdminGuard from "@/components/admin/layout/AdminGuard";
import AdminShell from "@/components/admin/layout/AdminShell";

// Semua halaman /admin (kecuali login) hanya untuk akun staf: owner atau terapis.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
