import EditProfileForm from "@/components/admin/profile/EditProfileForm";
import Link from "next/link";

export default function AdminProfilePage() {
  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* --- Bagian Judul & Breadcrumb Navigasi --- */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-2">
          <Link href="/admin" className="hover:text-gold-700 transition-colors">Dasbor Admin</Link>
          <span>›</span>
          <span className="text-brand-900 font-medium">Profil</span>
        </div>
        <h2 className="text-[20px] font-bold text-brand-900">Edit Profil Anda</h2>
      </div>

      {/* --- Render Komponen Form yang Barusan Kita Bikin --- */}
      <EditProfileForm />

    </div>
  );
}