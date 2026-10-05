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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[400px] rounded-[20px] p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-[20px] font-bold text-brand-900 mb-2">Keluar Akun?</h3>
        <p className="text-[14px] text-gray-500 mb-8">Sesi kamu akan diakhiri.</p>
        
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gold-700 font-bold text-[15px] hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoggingOut}
            className={`flex-1 py-3 rounded-xl text-white font-bold text-[15px] transition-colors ${isLoggingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}
          >
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}