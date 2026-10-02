"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import { CLINIC_LOCATION } from "@/constants/data";

export default function EditProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Tarik data profil admin asli dari database saat halaman dibuka
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await profileService.getProfile();
        const user = res.data?.user || res.user;
        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.full_name || user.name || "Admin Hai Physio",
            email: user.email || "",
            phone: user.phone || "",
          }));
        }
      } catch (error) {
        console.error("Gagal menarik profil admin:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Simpan perubahan nama ke API Backend
  const handleSave = async () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setToastType("error");
      setToastMsg("Nama lengkap minimal 3 karakter.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      return;
    }
    setIsSaving(true);
    try {
      // Backend hanya mendukung full_name di PATCH /profile
      await profileService.updateProfile({
        full_name: formData.fullName.trim(),
      });

      setIsEditing(false);
      setToastType("success");
      setToastMsg("Profil Admin Berhasil Diperbarui!");
      setShowToast(true);

      // Beritahu komponen AdminHeader agar namanya langsung sinkron berubah
      window.dispatchEvent(new Event("adminProfileUpdated"));

      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error("Gagal update profil admin:", error);
      const msg = error?.response?.data?.error?.message
        || error?.response?.data?.message
        || "Gagal menyimpan perubahan. Coba lagi.";
      setToastType("error");
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 flex justify-center items-center">
        <span className="text-[#1b2a4e] font-bold animate-pulse">Memuat profil admin...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 relative pb-10">
      
      {/* --- KARTU PROFIL ATAS --- */}
      <div className="w-full bg-[#fcfaf7] border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[300px] h-full bg-gradient-to-l from-[#FFFBEA] to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-[#1b2a4e] shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || "Admin")}&background=1b2a4e&color=fff&size=150`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="text-[22px] md:text-[24px] font-bold text-[#1b2a4e]">{formData.fullName}</h3>
            <span className="text-[#585858] text-[14px]">Administrator Klinik</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full mt-2 w-max border border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[12px] font-bold">Active Status</span>
            </div>
          </div>
        </div>

        {/* Employee ID Badge */}
        <div className="flex flex-col border border-gray-200 bg-white rounded-xl px-5 py-3 relative z-10 shadow-sm shrink-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employee Role</span>
          <span className="text-[16px] font-bold text-[#1b2a4e]">Super Admin</span>
        </div>
      </div>

      {/* --- KOTAK FORM PERSONAL DETAILS --- */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        
        {/* Header Form & Tombol Aksi */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 border-b border-gray-100 pb-4">
          <h4 className="text-[18px] font-bold text-[#1b2a4e]">Personal Details</h4>
          
          <div className="flex items-center gap-3">

            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl font-bold text-[#585858] bg-gray-100 hover:bg-gray-200 transition-colors text-[14px]"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#F5B301] hover:bg-[#dda101] transition-colors shadow-sm text-[14px]"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#F5B301] hover:bg-[#dda101] transition-colors shadow-sm text-[14px]"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Grid Inputan Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1b2a4e]">Full Name (Dapat Diubah)</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              disabled={!isEditing}
              className={`w-full p-3.5 rounded-xl border outline-none transition-colors text-[14px] ${isEditing ? "border-[#F5B301] bg-white text-[#1b2a4e] font-bold" : "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"}`}
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1b2a4e]">Email Address (Terkunci)</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              disabled
              className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed text-[14px]"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1b2a4e]">Phone Number {isEditing && <span className="text-gray-400 font-normal">(Opsional)</span>}</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? "Contoh: 08123456789" : "-"}
              className={`w-full p-3.5 rounded-xl border outline-none transition-colors text-[14px] ${isEditing ? "border-[#F5B301] bg-white text-[#1b2a4e] font-bold" : "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"}`}
            />
          </div>

          {/* Department — info statis */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1b2a4e]">Department</label>
            <input 
              type="text" 
              value="Administration & Operations"
              disabled
              className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed text-[14px]"
            />
          </div>

          {/* Clinic Address — info statis */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[14px] font-medium text-[#1b2a4e]">Clinic Address</label>
            <textarea 
              value={CLINIC_LOCATION}
              disabled 
              rows={2}
              className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed text-[14px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* --- TOAST NOTIFIKASI SUKSES / GAGAL --- */}
      {showToast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-lg z-50 animate-bounce border ${
          toastType === "success"
            ? "bg-[#ecfdf3] border-[#a6f4c5] text-[#027a48]"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <CheckCircle size={20} weight="fill" />
          <span className="text-[14px] font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
