"use client";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import HomeHero from "@/components/home/HomeHero";
import FokusLayanan from "@/components/home/FokusLayanan";
import BrandStory from "@/components/marketing/BrandStory";
import TerapisSection from "@/components/home/TerapisSection";
import DigitalCare from "@/components/marketing/DigitalCare";
import PricingSection from "@/components/marketing/PricingSection";
import ProcessSection from "@/components/home/ProcessSection";
import FaqSection from "@/components/home/FaqSection";
import ContactSection from "@/components/home/ContactSection";
import CtaBand from "@/components/home/CtaBand";

export default function Beranda() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      {/* 1. Siapa kami + pita fakta klinik */}
      <HomeHero appointmentHref={appointmentHref} />
      {/* 2. Layanan dengan foto */}
      <FokusLayanan />
      {/* 3. Identitas: logo, motto Efektif & Progresif */}
      <BrandStory showMoreLink className="bg-zinc-50" />
      {/* 4. Tim terapis (data asli dari backend) */}
      <TerapisSection appointmentHref={appointmentHref} className="bg-white" />
      {/* 5. Nilai tambah: pendampingan digital (mockup HP) */}
      <DigitalCare appointmentHref={appointmentHref} />
      {/* 6. Harga paket dari owner */}
      <PricingSection appointmentHref={appointmentHref} />
      {/* 7. Perjalanan pemulihan */}
      <ProcessSection className="bg-zinc-50" />
      {/* 8. FAQ, kontak, ajakan */}
      <FaqSection />
      <ContactSection className="bg-zinc-50" />
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
