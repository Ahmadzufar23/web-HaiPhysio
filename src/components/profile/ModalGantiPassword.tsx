"use client";

import { useState } from "react";
import { Eye, EyeSlash, X } from "@phosphor-icons/react";
import Link from "next/link";
import { profileService } from "@/services/profileService";

interface ModalGantiPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalGantiPassword({ isOpen, onClose }: ModalGantiPasswordProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseModal = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      setErrorMessage("");
    }, 300);
  };

  const handleSubmitPassword = async () => {
    setErrorMessage("");
    if (newPassword !== newPasswordConfirmation) {
      setErrorMessage("Konfirmasi kata sandi baru tidak sama!");
      return;
    }

    setIsPasswordLoading(true);
    try {
      // Nembak API-nya sekarang rapi banget, cukup panggil kurir data!
      await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      });
      
      setIsSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem. Coba lagi nanti.");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[500px] rounded-[24px] p-8 md:p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={handleCloseModal}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} weight="bold" />
        </button>

        {!isSuccess ? (
          <div className="flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-[20px] font-bold text-brand-900 mb-2">Buat Kata Sandi Baru</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Pastikan kata sandi baru Anda berbeda dari sebelumnya dan tidak mudah ditebak.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-[13px] font-medium border border-red-100 text-center">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-brand-900">Kata Sandi Lama</label>
                <div className="relative">
                  <input 
                    type={showOldPassword ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3.5 pr-12 border border-gray-200 rounded-xl outline-none focus:border-gold-600 transition-colors text-[14px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showOldPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-brand-900">Kata Sandi Baru</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full p-3.5 pr-12 border border-gray-200 rounded-xl outline-none focus:border-gold-600 transition-colors text-[14px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
                <span className="text-[12px] text-gray-400">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-brand-900">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={newPasswordConfirmation}
                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                    className="w-full p-3.5 pr-12 border border-gray-200 rounded-xl outline-none focus:border-gold-600 transition-colors text-[14px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmitPassword}
              disabled={isPasswordLoading}
              className={`w-full py-3.5 mt-8 rounded-xl text-brand-950 font-bold text-[15px] transition-colors ${isPasswordLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {isPasswordLoading ? 'Memproses...' : 'Konfirmasi Kata Sandi Baru'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300 pt-4">
            <img src="/success-illustration.png" alt="Success" className="w-[200px] h-[200px] object-contain mb-6 bg-gray-50 rounded-2xl" />
            <h3 className="text-[20px] font-bold text-gold-700 mb-2">Sandi Baru Anda Berhasil Disimpan!</h3>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              Sandi Anda sudah kami perbarui. Sesi di perangkat lain telah otomatis keluar.
            </p>
            <button onClick={handleCloseModal} className="w-full py-3.5 rounded-xl bg-brand-600 text-brand-950 font-bold text-[15px] hover:bg-brand-700 transition-colors">
              Kembali ke Profil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}