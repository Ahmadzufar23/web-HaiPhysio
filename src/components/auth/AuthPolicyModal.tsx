"use client";

import { X } from "@phosphor-icons/react";

type AuthPolicyModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
};

export default function AuthPolicyModal({
  title,
  open,
  onClose,
}: AuthPolicyModalProps) {
  if (!open) {
    return null;
  }

  const isTerms = title.toLowerCase().includes("syarat");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-policy-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[720px] max-h-[85vh] flex flex-col rounded-[16px] bg-white p-6 shadow-[0_32px_100px_rgba(15,23,42,0.3)] md:p-8">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 shrink-0">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-700">
              Informasi Pasien
            </p>
            <h2
              id="auth-policy-modal-title"
              className="text-[22px] font-bold leading-tight text-brand-900 md:text-[26px]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-brand-900"
            aria-label="Tutup"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="mt-5 space-y-5 overflow-y-auto pr-2 text-[14px] leading-relaxed text-slate-600">
          {isTerms ? (
            <>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">1. Layanan & Reservasi Janji Temu</h4>
                <p>Hai Physio menyediakan layanan fisioterapi profesional. Reservasi janji temu wajib dilakukan dengan memilih jadwal slot terapis yang tersedia secara akurat.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">2. Ketentuan Perubahan & Pembatalan Jadwal</h4>
                <p>Perubahan jadwal (reschedule) dan pembatalan sesi dapat dilakukan maksimal <strong>24 jam sebelum waktu sesi dimulai</strong>. Pembatalan kurang dari 24 jam tidak dapat diproses secara mandiri.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">3. Kehadiran di Klinik</h4>
                <p>Pasien diimbau hadir minimal 10 menit sebelum sesi dimulai dengan menunjukkan Nomor Kode Reservasi kepada petugas resepsionis klinik.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">4. Rekam Medis & Kondisi Fisik</h4>
                <p>Pasien bertanggung jawab memberikan informasi keluhan medis yang jujur dan benar demi keselamatan serta efektivitas proses fisioterapi.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">1. Pengumpulan Informasi</h4>
                <p>Kami mengumpulkan data pribadi Anda seperti nama, nomor telepon, email, tanggal lahir, dan catatan keluhan medis saat Anda mendaftar dan melakukan reservasi di Hai Physio.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">2. Penggunaan Data Pribadi</h4>
                <p>Data Anda hanya digunakan untuk verifikasi akun, kebutuhan penanganan medis oleh fisioterapis, dan konfirmasi pengingat jadwal melalui WhatsApp/Email.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">3. Keamanan Data Pasien (UU PDP)</h4>
                <p>Kami menjamin kerahasiaan rekam medis dan data pribadi Anda dengan standar enkripsi aman. Data Anda tidak akan pernah dijual atau dibagikan kepada pihak ketiga tanpa persetujuan Anda.</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-900 mb-1">4. Hak Pasien</h4>
                <p>Anda berhak memperbarui data profil Anda kapan saja atau meminta penghapusan akun melalui kontak layanan bantuan resmi Hai Physio.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Tombol Tutup */}
        <div className="pt-5 mt-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-brand-950 font-bold rounded-xl text-[14px] transition-colors"
          >
            Saya Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}
