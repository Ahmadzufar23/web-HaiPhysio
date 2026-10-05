"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { servicesData } from "../../constants/data"; 
import type { FocusArea } from "@/types/api.types";
import Stepper from "./Stepper";
import { bookingService } from "@/services/bookingService";

interface Step1Props {
  onNext: (serviceId: string) => void;
}

export default function Step1PilihLayanan({ onNext }: Step1Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // State buat nyimpen data layanan dari API backend
  const [apiServices, setApiServices] = useState<FocusArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tarik data UUID layanan dari backend saat halaman dimuat
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const response = await bookingService.getFocusAreas();
        setApiServices(response.data.focusAreas);
      } catch (error) {
        console.error("Gagal menarik data layanan dari API:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayanan();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      
      <div className="text-center mb-10">
        <h2 className="text-[32px] md:text-[36px] font-bold text-brand-900 mb-3">Booking Layanan Fisioterapi</h2>
        <p className="text-[#585858] text-[15px] md:text-[16px]">Silakan pilih jenis layanan yang sesuai dengan keluhan tubuh Anda untuk memulai janji temu.</p>
      </div>

      <Stepper currentStep={1} />

      {/* Tampilan Loading kalau API masih narik data */}
      {isLoading ? (
        <div className="w-full h-40 flex items-center justify-center">
           <span className="text-brand-900 font-bold animate-pulse">Memuat pilihan layanan...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-10">
          
          {/* Loop data statis lu buat UI-nya */}
          {servicesData.map((staticService) => {
            
            // Cocokin slug dari UI statis sama slug dari data API backend buat dapet UUID-nya
            const apiData = apiServices.find(api => api.slug === staticService.id);
            // Hanya UUID asli dari backend yang boleh dipilih — kalau layanan tidak ada di BE,
            // kartu dinonaktifkan (tidak ada fallback ke slug statis).
            const serviceUuid: string | null = apiData?.id ?? null;
            const isAvailable = serviceUuid !== null;

            // Cek status terpilih
            const isSelected = isAvailable && selectedId === serviceUuid;

            return (
              <div
                key={staticService.id}
                onClick={() => serviceUuid && setSelectedId(serviceUuid)}
                aria-disabled={!isAvailable}
                className={`flex flex-col rounded-[20px] p-8 transition-all duration-300 border-2
                  ${!isAvailable
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "border-brand-600 bg-brand-50 shadow-[0_8px_24px_rgba(245,201,0,0.2)] cursor-pointer"
                    : "border-gray-100 bg-white hover:border-brand-600/50 hover:bg-brand-50 hover:shadow-[0_8px_24px_rgba(245,201,0,0.15)] cursor-pointer"}
                `}
              >
                
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-[56px] h-[56px] rounded-xl border border-brand-600/30 flex items-center justify-center shrink-0 bg-white text-gold-700">
                    {staticService.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-brand-900 text-[20px] font-bold leading-tight">{staticService.titleBold}</h3>
                    <span className="text-[#585858] text-[14px] mt-1">{staticService.subtitle}</span>
                  </div>
                </div>
                
                <p className="text-[#585858] text-[14px] leading-relaxed mb-6">
                  {staticService.desc}
                </p>

                <div className="w-full h-[1px] bg-gray-100 mb-6"></div>

                <span className="text-gold-700 font-bold text-[15px] mb-4">Paling Cocok Untuk:</span>
                <ul className="flex flex-col gap-3">
                  {staticService.cases.map((caseItem, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={20} weight="fill" color="#3B82F6" className="shrink-0 mt-0.5" />
                      <span className="text-[#585858] text-[14px] leading-relaxed">{caseItem}</span>
                    </li>
                  ))}
                </ul>

              </div>
            );
          })}
        </div>
      )}

      <div className="w-full flex justify-end">
        <button
          onClick={() => selectedId && onNext(selectedId)}
          disabled={!selectedId} 
          className={`w-full max-w-[300px] h-[56px] rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all duration-300
            ${selectedId 
              ? "bg-brand-600 hover:bg-brand-700 text-brand-950 cursor-pointer shadow-[0_4px_12px_rgba(245,201,0,0.3)]" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}
          `}
        >
          Lanjut 
          <span>→</span>
        </button>
      </div>

    </div>
  );
}