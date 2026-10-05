"use client";

import { Check } from "@phosphor-icons/react";

export default function Stepper({ currentStep }: { currentStep: number }) {
    // Daftar langkah-langkah yang akan ditampilkan di Stepper
    const steps = [
        { num: 1, label: "Langkah 1", desc: "Pilih Layanan" },
        { num: 2, label: "Langkah 2", desc: "Pilih Waktu & Terapis" },
        { num: 3, label: "Langkah 3", desc: "Isi Data Booking" },
        { num: 4, label: "Langkah 4", desc: "Konfirmasi Booking" },
    ];

    return (
        // Pembungkus utama Stepper.
        <div className="w-full border border-gray-200 rounded-[16px] p-8 mb-10 bg-white">

            {/* Judul di dalam kotak Stepper */}
            <h3 className="text-center font-bold text-brand-900 text-[18px] mb-8">
                Langkah Buat Janji Temu
            </h3>

            {/* Container utama untuk garis dan lingkaran angka */}
            <div className="flex items-start justify-between relative w-full">

                {/* Melakukan looping untuk merender setiap langkah */}
                {steps.map((step, index) => {
                    // isActive = Benar kalau ini adalah langkah tempat user berada sekarang
                    const isActive = currentStep === step.num;
                    // isPast = Benar kalau langkah ini sudah dilewati oleh user
                    const isPast = currentStep > step.num;

                    return (
                        // Pembungkus untuk masing-masing item (Lingkaran + Teks)
                        <div key={index} className="flex flex-col items-center gap-3 relative flex-1">

                            {/* GARIS PENGHUBUNG DINAMIS */}
                            {/* Render garis di semua langkah KECUALI langkah terakhir */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-4 left-[50%] w-full h-[2px] z-0 transition-colors duration-300
                    ${currentStep > step.num ? "bg-brand-600" : "bg-gray-200"}
                  `}
                                ></div>
                            )}

                            {/* LINGKARAN INDIKATOR */}
                            {/* Dikasih z-10 biar numpuk di atas garis */}
                            <div
                                // Catatan: bg-white sengaja dipisah ke dalam kondisi biar gak bentrok sama bg kuning
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-colors
                  ${isActive
                                        ? "bg-white border-2 border-brand-600 text-gold-700" // Aktif: Background putih, Border kuning, teks kuning
                                        : isPast
                                            ? "bg-brand-600 text-brand-950 border-2 border-brand-600" // Lewat: Background kuning full, ikon gelap
                                            : "bg-white border-2 border-gray-200 text-gray-400" // Belum: Background putih, Abu-abu
                                    }
                `}
                            >
                                {/* Kalau udah lewat, munculin icon Check dari Phosphor. Kalau belum, munculin angka */}
                                {isPast ? <Check weight="bold" size={16} /> : step.num}
                            </div>

                            {/* TEKS LABEL & DESKRIPSI */}
                            <div className="flex flex-col items-center text-center mt-1">
                                {/* Teks Label (Contoh: Langkah 1) */}
                                <span className={`text-[14px] font-bold ${isActive || isPast ? "text-brand-900" : "text-gray-400"}`}>
                                    {step.label}
                                </span>
                                {/* Teks Deskripsi (Contoh: Pilih Layanan) */}
                                <span className={`hidden md:block text-[12px] ${isActive ? "text-[#585858]" : "text-gray-400"}`}>
                                    {step.desc}
                                </span>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}