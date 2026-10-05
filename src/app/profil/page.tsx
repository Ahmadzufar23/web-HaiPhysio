"use client";

import { useEffect, useState } from "react";
import { CheckCircle, SignOut } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import { getApiErrorMessage } from "@/app/utils/api";
import ModalLogout from "@/components/profile/ModalLogout";
import ModalGantiPassword from "@/components/profile/ModalGantiPassword";

export default function PengaturanProfilPage() {
  // State untuk UI (Modal, Toast, Loading)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Data Profil
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "12/03/1995",
  });
  
  // Ambil data profil dari API pas halaman pertama kali dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        const user = data.data.user;

        // Bikin fungsi kecil buat ngerapiin format tanggal (dari YYYY-MM-DDTHH... jadi DD/MM/YYYY)
        let formattedDate = "Belum diatur";
        const rawDob = user.date_of_birth || user.dateOfBirth;
        
        if (rawDob && typeof rawDob === "string") {
          const parts = rawDob.split("T")[0].split("-"); // ["1995", "03", "12"]
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // "12/03/1995"
          }
        }
        setProfileData({
          fullName: user.full_name || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: formattedDate, 
        });
      } catch (error: any) {
        console.error("Gagal narik data profil:", error);
        // Belum login / sesi habis -> arahkan ke halaman login
        if (error?.response?.status === 401) {
          window.location.href = "/login";
          return;
        }
      } finally {
        setIsLoading(false); 
      }
    };

    fetchProfile();
  }, []);

  // Simpan perubahan nama ke API
  const handleSaveProfile = async () => {
    try {
      await profileService.updateProfile({
        full_name: profileData.fullName,
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert(getApiErrorMessage(error, "Gagal menyimpan perubahan. Coba lagi!"));
    }
  };

  // Proses logout ke API
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await profileService.logout();
    } catch (error) {
      // Sesi di server bisa saja sudah habis (401); token lokal tetap dihapus oleh service
      console.error("Gagal logout:", error);
    } finally {
      window.location.href = "/login";
      setIsLoggingOut(false);
    }
  };

  // Tampilan layar loading
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <span className="text-brand-900 font-bold">Sedang memuat data profil...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-[120px] pb-24 px-5 md:px-[80px] bg-[#FAFAFA] flex justify-center">
      {/* Card Utama Profil */}
      <div className="w-full max-w-[900px] bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] h-fit">
        
        {/* Judul & Deskripsi Atas */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] md:text-[32px] font-bold text-brand-900 mb-3">Pengaturan Profil</h1>
          <p className="text-[#585858] text-[14px] md:text-[15px]">
            Kelola informasi pribadi akun Anda dan pantau riwayat sesi terapi fisioterapi yang pernah Anda jalani.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          
          {/* Bagian Avatar Kiri */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden mb-4 bg-brand-100 border-4 border-white shadow-md">
              <img 
                src={`https://ui-avatars.com/api/?name=${profileData.fullName.replace(/ /g, "+")}&background=1b2a4e&color=fff&size=140`}
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
           <h3 className="text-brand-900 font-bold text-[18px] mb-1 w-full max-w-[200px] text-center break-words">
            {profileData.fullName || "User"}
            </h3>
            <button className="text-gold-700 text-[13px] font-bold hover:text-gold-800 transition-colors">
              Edit Foto
            </button>
          </div>

          {/* Form Input Data Kanan */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Input Nama Lengkap (Bisa diedit) */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-brand-900">Nama Lengkap</label>
              <input 
                type="text" 
                value={profileData.fullName}
                maxLength={100}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-gold-600 transition-colors text-[14px]"
              />
            </div>

            {/* Input Email (Disabled) */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-brand-900">Email</label>
              <input 
                type="email" 
                value={profileData.email}
                disabled 
                className="w-full p-4 border border-gray-200 bg-gray-100 text-gray-400 rounded-xl outline-none cursor-not-allowed text-[14px]"
              />
            </div>

            {/* Input No HP (Disabled) */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-brand-900">Nomor Telepon</label>
              <input 
                type="text" 
                value={profileData.phone}
                disabled
                className="w-full p-4 border border-gray-200 bg-gray-100 text-gray-400 rounded-xl outline-none cursor-not-allowed text-[14px]"
              />
            </div>

            {/* Input Tanggal Lahir (Disabled) */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-brand-900">Tanggal Lahir</label>
              <input 
                type="text" 
                value={profileData.dateOfBirth}
                disabled 
                className="w-full p-4 border border-gray-200 bg-gray-100 text-gray-400 rounded-xl outline-none cursor-not-allowed text-[14px]"
              />
            </div>

            {/* Banner Tombol Logout */}
            <div className="mt-2 p-5 border border-red-200 bg-[#FEF2F2] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[#DC2626] font-bold text-[15px]">Keluar dari Akun</span>
                <span className="text-[#EF4444] text-[13px]">Keluar dari akun kamu saat ini.</span>
              </div>
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2.5 rounded-lg font-medium text-[14px] transition-colors"
              >
                Keluar Akun
                <SignOut size={18} weight="bold" />
              </button>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-[220px] py-4 rounded-xl border-2 border-brand-600 text-gold-700 font-bold text-[15px] hover:bg-brand-50 transition-colors shrink-0"
              >
                Ganti Password
              </button>
              <button 
                onClick={handleSaveProfile}
                className="w-full py-4 rounded-xl bg-brand-600 text-brand-950 font-bold text-[15px] hover:bg-brand-700 transition-colors shadow-[0_4px_12px_rgba(245,201,0,0.2)]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Toast Notifikasi Sukses */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#E6F4EA] border border-[#bbf7d0] px-5 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle size={20} weight="fill" className="text-[#1E8E3E]" />
          <span className="text-[#1E8E3E] text-[14px] font-bold">Data berhasil diperbarui</span>
        </div>
      )}

      {/* Render Komponen Modal Logout & Ganti Password */}
      <ModalLogout 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
        isLoggingOut={isLoggingOut} 
      />

      <ModalGantiPassword 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}