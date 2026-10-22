"use client";

import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { PageIntro, mk } from "@/components/marketing/ui";
import FokusLayanan from "@/components/home/FokusLayanan";
import BodyMapShowcase from "@/components/home/BodyMapShowcase";
import ScopeSection from "@/components/marketing/ScopeSection";
import ComparisonSection from "@/components/marketing/Comparison";
import ProcessSection from "@/components/home/ProcessSection";
import PricingSection from "@/components/marketing/PricingSection";
import FaqSection from "@/components/home/FaqSection";
import CtaBand from "@/components/home/CtaBand";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const INCLUDED = ["Asesmen sebelum terapi", "Catatan terapis setiap kunjungan", "Video latihan rumah dari terapis", "Pilihan homecare"];

export default function Layanan() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      <PageIntro
        crumb="Layanan"
        title="Fisioterapi untuk otot, saraf, dan cedera olahraga"
        lead="Penanganan disesuaikan dengan kondisi dan tujuan Anda, di klinik atau di rumah. Setiap sesi dicatat supaya perkembangan Anda terukur."
        image={{ src: "/service-Muskulo.png", alt: "Fisioterapis menangani pergelangan kaki pasien" }}
      >
        <ul className="mt-1 grid max-w-[480px] gap-2 sm:grid-cols-2">
          {INCLUDED.map((i) => (
            <li key={i} className="flex items-center gap-2 text-[14px] text-zinc-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-brand-950">
                <Check size={11} weight="bold" />
              </span>
              {i}
            </li>
          ))}
        </ul>
        <Link href="#harga" className={`${mk.link} mt-1`}>
          Lihat harga paket <ArrowRight size={13} />
        </Link>
      </PageIntro>
      <FokusLayanan detailed className="bg-zinc-50" />
      <BodyMapShowcase appointmentHref={appointmentHref} />
      <ScopeSection />
      <ComparisonSection className="bg-white" />
      <ProcessSection className="bg-zinc-50" />
      <PricingSection appointmentHref={appointmentHref} />
      <FaqSection className="bg-zinc-50" />
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
