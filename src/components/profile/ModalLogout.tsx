"use client";

interface ModalLogoutProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function ModalLogout({ isOpen, onClose, onConfirm, isLoggingOut }: ModalLogoutProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={onClose}>
      <div className="w-full max-w-[360px] rounded-xl border border-zinc-200 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 id="logout-title" className="text-[15px] font-semibold text-zinc-900">
          Keluar dari akun?
        </h3>
        <p className="mt-1 text-[13px] text-zinc-500">Sesi di perangkat ini akan diakhiri.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isLoggingOut} className="inline-flex h-9 items-center rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-60">
            {isLoggingOut ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
