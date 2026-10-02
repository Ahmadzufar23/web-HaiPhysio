import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminGuard from "@/components/admin/layout/AdminGuard";

// Cangkang ini bakal ngebungkus semua file page.tsx yang ada di dalam folder /admin
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Guard: hanya akun role "admin" yang boleh lihat dashboard, selain itu dilempar ke /admin/login
    <AdminGuard>
      <div className="flex min-h-screen bg-[#F8F9FA]">

        {/* Sidebar kita taro di sini. Posisi fix di kiri */}
        <AdminSidebar />

        {/* Area utama digeser ke kanan sejauh 280px (lebarnya Sidebar) */}
        <div className="flex flex-col flex-1 ml-[280px] min-h-screen">
          {/* Header kita taro di atas area utama */}
          <AdminHeader />

          {/* Semua konten halaman lu (Dashboard, Profil, dll) bakal masuk ke {children} ini */}
          <main className="p-8 w-full flex-1">
            {children}
          </main>
        </div>

      </div>
    </AdminGuard>
  );
}
