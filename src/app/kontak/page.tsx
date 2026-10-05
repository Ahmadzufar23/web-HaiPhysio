"use client";

import HeroBanner from "@/components/home/HeroBanner";
import ContactSection from "@/components/home/ContactSection";
import LocationMap from "@/components/home/LocationMap";
import CtaBand from "@/components/home/CtaBand";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function KontakKami() {
  // Sebelumnya di-hardcode false → pasien yang sudah login tetap diarahkan ke /login
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      {/* 1. HERO BANNER KONTAK */}
      <HeroBanner
        title="Kontak"
        accent="kami"
        subtitle="Hubungi kami lewat WhatsApp atau email, atau langsung datang ke klinik."
        imageSrc="/hero-kontak.png"
      />

      {/* 2. SALURAN KONTAK */}
      <ContactSection title="Masih ada yang" accent="ingin ditanyakan?" subtitle="Tim kami siap membantu pada jam operasional klinik." />

      {/* 3. LOKASI KLINIK */}
      <LocationMap />

      {/* 4. AJAKAN */}
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
