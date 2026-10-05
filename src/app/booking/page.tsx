"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profileService";
import Step1PilihLayanan from "../../components/booking/Step1PilihLayanan";
import Step2PilihWaktu from "../../components/booking/Step2PilihWaktu";
import Step3IsiData from "../../components/booking/Step3IsiData";
import Step4Konfirmasi from "../../components/booking/Step4Konfirmasi";

export default function BookingPage() {
  const router = useRouter();

  // Wajibkan login sebelum masuk flow booking
  useEffect(() => {
    profileService.getProfile().catch(() => {
      router.push("/login");
    });
  }, [router]);

  // Melacak user sedang ada di langkah berapa (1 sampai 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Objek raksasa yang mengumpulkan data booking dari Langkah 1 sampai Langkah 4
  const [bookingData, setBookingData] = useState({
    serviceId: "",     // Dari Step 1
    therapistId: "",   // Dari Step 2
    scheduleId: "",    // Dari Step 2
    patientData: null  // Dari Step 3 (Nama, Keluhan, Foto) akan masuk ke sini
  });

  // Fungsi yang dipanggil saat user selesai di Langkah 1
  const handleNextFromStep1 = (selectedServiceId: string) => {
    setBookingData({ ...bookingData, serviceId: selectedServiceId });
    setCurrentStep(2);
  };

  // Fungsi yang dipanggil saat user selesai milih jadwal di Langkah 2
  const handleNextFromStep2 = (scheduleData: any) => {
    setBookingData({ ...bookingData, ...scheduleData });
    setCurrentStep(3);
  };

  // Fungsi yang dipanggil saat form Langkah 3 sudah divalidasi dan di-submit
  const handleNextFromStep3 = (formData: any) => {
    // Simpan semua ketikan user dan fotonya ke state bookingData
    setBookingData({ ...bookingData, patientData: formData });
    setCurrentStep(4); // Lanjut ke Langkah 4
  };

  return (
    <div className="relative w-full min-h-screen pt-[90px] pb-24 px-5 md:px-[80px] bg-[#FAFAFA] overflow-hidden">

      {/* Background Layer 1 (Gradasi Kuning) & Layer 2 (Efek Memudar) */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-r from-brand-100/40 to-brand-600/70 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-transparent via-transparent to-[#FAFAFA] z-0"></div>

      {/* Kanvas Putih Utama Pembungkus Form */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto bg-white rounded-[32px] p-6 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">

        {/* Render Step 1 */}
        {currentStep === 1 && (
          <Step1PilihLayanan onNext={handleNextFromStep1} />
        )}

        {/* Render Step 2 */}
        {currentStep === 2 && (
          <Step2PilihWaktu
            onBack={() => setCurrentStep(1)}
            onNext={handleNextFromStep2}
            selectedServiceId={bookingData.serviceId}
          />
        )}

        {/* Render Step 3 yang baru saja kita kerjakan */}
        {currentStep === 3 && (
          <Step3IsiData
            onBack={() => setCurrentStep(2)}
            onNext={handleNextFromStep3}
            bookingData={bookingData}
          />
        )}

        {/* Cangkang sementara untuk Langkah 4 (Konfirmasi) nanti */}
        {currentStep === 4 && (
          <Step4Konfirmasi
            onBack={() => setCurrentStep(3)}
            bookingData={bookingData} // Lempar semua data yang dikumpulin ke Step 4 buat dirangkum
          />
        )}

      </div>
    </div>
  );
}