"use client";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import HomeHero from "@/components/home/HomeHero";
import ConditionsMarquee from "@/components/home/ConditionsMarquee";
import AboutSection from "@/components/home/AboutSection";
import FokusLayanan from "@/components/home/FokusLayanan";
import ProcessSection from "@/components/home/ProcessSection";
import CtaBand from "@/components/home/CtaBand";
import ContactSection from "@/components/home/ContactSection";
import LocationMap from "@/components/home/LocationMap";

export default function Beranda() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      {/* 1. HERO */}
      <HomeHero appointmentHref={appointmentHref} />

      {/* 2. PITA KELUHAN YANG DITANGANI */}
      <ConditionsMarquee />

      {/* 3. KENAPA PILIH HAI PHYSIO */}
      <AboutSection showMoreLink />

      {/* 4. FOKUS LAYANAN */}
      <FokusLayanan className="bg-brand-50/40 py-24 md:py-32" />

      {/* 5. CARA BUAT JANJI */}
      <ProcessSection />

      {/* 6. AJAKAN */}
      <CtaBand appointmentHref={appointmentHref} />

      {/* 7. HUBUNGI KAMI */}
      <ContactSection subtitle="Jangan ragu untuk menghubungi kami jika ada pertanyaan lebih lanjut." />

      {/* 8. LOKASI KLINIK */}
      <LocationMap />
    </div>
  );
}
