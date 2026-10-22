"use client";

import { useState } from "react";
import { Check, Eye, EyeSlash, X } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import { getApiErrorMessage } from "@/app/utils/api";

interface ModalGantiPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white pl-3 pr-9 text-[13px] text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5";

function PasswordField({ label, hint, value, onChange, autoComplete }: { label: string; hint?: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-zinc-700">{label}</span>
      <span className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className={inputCls} />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
        >
          {show ? <EyeSlash size={15} /> : <Eye size={15} />}
        </button>
      </span>
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}

export default function ModalGantiPassword({ isOpen, onClose }: ModalGantiPasswordProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    onClose();
    setIsSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!currentPassword || !newPassword) {
      setErrorMessage("Isi kata sandi lama dan kata sandi baru.");
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      setErrorMessage("Konfirmasi kata sandi baru tidak sama.");
      return;
    }
    setIsLoading(true);
    try {
      await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Terjadi kesalahan. Coba lagi nanti."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="pw-title" onClick={handleClose}>
      <div className="relative w-full max-w-[400px] rounded-xl border border-zinc-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} aria-label="Tutup" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <X size={14} />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="px-5 pb-1 pt-5">
              <h3 id="pw-title" className="text-[15px] font-semibold text-zinc-900">
                Ganti kata sandi
              </h3>
              <p className="mt-1 text-[12px] text-zinc-500">Sesi di perangkat lain akan otomatis keluar.</p>
            </div>
            <div className="flex flex-col gap-4 p-5">
              {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{errorMessage}</div>}
              <PasswordField label="Kata sandi lama" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
              <PasswordField label="Kata sandi baru" hint="Minimal 8 karakter, kombinasi huruf dan angka." value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
              <PasswordField label="Ulangi kata sandi baru" value={newPasswordConfirmation} onChange={setNewPasswordConfirmation} autoComplete="new-password" />
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">
              <button type="button" onClick={handleClose} className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50">
                Batal
              </button>
              <button type="submit" disabled={isLoading} className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white hover:bg-zinc-800 disabled:opacity-60">
                {isLoading ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Check size={14} weight="bold" />
            </span>
            <h3 id="pw-title" className="mt-3 text-[15px] font-semibold text-zinc-900">
              Kata sandi diperbarui
            </h3>
            <p className="mt-1 text-[13px] text-zinc-500">Gunakan kata sandi baru saat login berikutnya. Sesi di perangkat lain sudah keluar.</p>
            <button onClick={handleClose} className="mt-5 inline-flex h-9 items-center self-end rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white hover:bg-zinc-800">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
