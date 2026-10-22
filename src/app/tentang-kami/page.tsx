"use client";

import { PageIntro } from "@/components/marketing/ui";
import BrandStory from "@/components/marketing/BrandStory";
import ScopeSection from "@/components/marketing/ScopeSection";
import DigitalCare from "@/components/marketing/DigitalCare";
import TerapisSection from "@/components/home/TerapisSection";
import CtaBand from "@/components/home/CtaBand";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const FACTS = [
  { value: "1985", label: "Klinik Pratama Condet Jaya berdiri" },
  { value: "3", label: "Bidang fisioterapi" },
  { value: "Homecare", label: "Terapi di rumah tersedia" },
];

export default function TentangKami() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      <PageIntro
        crumb="Tentang Kami"
        title="Pengalaman klinik sejak 1985, cara kerja yang modern"
        lead="Hai Physio adalah layanan fisioterapi di bawah Klinik Pratama Condet Jaya. Kami menangani nyeri dan gangguan gerak dengan pemeriksaan yang teliti, terapi yang terarah, dan pemantauan dari sesi ke sesi."
        image={{ src: "/hero-tentang-kami.png", alt: "Ruang terapi dengan poster anatomi" }}
      >
        <dl className="mt-2 grid max-w-[480px] grid-cols-3 gap-4 border-t border-zinc-200 pt-6">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <dt className="order-2 text-[12px] leading-snug text-zinc-500">{f.label}</dt>
              <dd className="order-1 text-[22px] font-semibold tracking-[-0.02em] text-zinc-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      </PageIntro>
      <BrandStory className="bg-zinc-50" />
      <ScopeSection className="bg-white" />
      <DigitalCare appointmentHref={appointmentHref} />
      <TerapisSection appointmentHref={appointmentHref} className="bg-white" />
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
