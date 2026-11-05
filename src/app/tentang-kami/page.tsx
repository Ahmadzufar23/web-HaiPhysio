"use client";

import { PageIntro } from "@/components/marketing/ui";
import BrandStory from "@/components/marketing/BrandStory";
import ScopeSection from "@/components/marketing/ScopeSection";
import DigitalCare from "@/components/marketing/DigitalCare";
import TerapisSection from "@/components/home/TerapisSection";
import CtaBand from "@/components/home/CtaBand";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useClinic } from "@/components/shared/ClinicProvider";

const FACTS = [
  { value: "3", label: "Bidang fisioterapi" },
  { value: "Homecare", label: "Terapi di rumah tersedia" },
];

export default function TentangKami() {
  const clinic = useClinic();
  const { appointmentHref } = useAuthStatus();
  const facts = clinic.foundedYear ? [{ value: String(clinic.foundedYear), label: "Tahun berdiri" }, ...FACTS] : FACTS;

  return (
    <div className="flex w-full flex-col">
      <PageIntro
        crumb="Tentang Kami"
        title={clinic.foundedYear ? `Pengalaman klinik sejak ${clinic.foundedYear}, cara kerja yang modern` : "Pemeriksaan teliti, cara kerja yang modern"}
        lead={clinic.about || `${clinic.brand} adalah layanan fisioterapi di bawah ${clinic.name}. Kami menangani nyeri dan gangguan gerak dengan pemeriksaan yang teliti, terapi yang terarah, dan pemantauan dari sesi ke sesi.`}
        image={{ src: "/hero-tentang-kami.png", alt: "Ruang terapi dengan poster anatomi" }}
      >
        <dl className="mt-2 grid max-w-[480px] grid-cols-3 gap-4 border-t border-zinc-200 pt-6">
          {facts.map((f) => (
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
