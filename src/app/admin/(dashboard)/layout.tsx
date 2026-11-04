import type { Metadata } from "next";
import AdminGuard from "@/components/admin/layout/AdminGuard";
import AdminShell from "@/components/admin/layout/AdminShell";
import { PLATFORM } from "@/constants/platform";

export const metadata: Metadata = {
  title: PLATFORM.name,
  description: PLATFORM.tagline,
  icons: { icon: PLATFORM.logo },
};

// Semua halaman /admin (kecuali login) hanya untuk akun staf: owner atau terapis.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
