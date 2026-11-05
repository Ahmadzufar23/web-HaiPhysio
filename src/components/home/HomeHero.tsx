"use client";

import Link from "next/link";
import ClinicLogo from "@/components/shared/ClinicLogo";
import { ArrowRight, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import OpenStatus from "@/components/home/OpenStatus";
import LogoWatermark from "@/components/shared/LogoWatermark";
import { BrandPhoto, mk } from "@/components/marketing/ui";
import { useClinic } from "@/components/shared/ClinicProvider";

const FACTS = [
  { value: "3", label: "Bidang fisioterapi: muskuloskeletal, neuro, olahraga" },
  { value: "Homecare", label: "Terapis datang ke rumah bila diperlukan" },
  { value: "Digital", label: "Rekam medis & latihan rumah dalam satu akun" },
];

export default function HomeHero({ appointmentHref }: { appointmentHref: string }) {
  const clinic = useClinic();
  const facts = clinic.foundedYear ? [{ value: String(clinic.foundedYear), label: `Tahun berdiri ${clinic.name}` }, ...FACTS] : FACTS;
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <LogoWatermark className="-left-28 -top-10 w-[460px]" opacity={0.05} rotate={-12} />

      <div className={`${mk.container} relative grid items-center gap-14 pb-20 pt-10 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-14`}>
        <div className="flex flex-col items-start gap-7">
          {clinic.tagline && (
            <span className="inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white py-1 pl-3.5 pr-3.5 text-[12px] font-medium text-zinc-700">{clinic.tagline}</span>
          )}

          <h1 className="text-balance text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-zinc-900 sm:text-[50px] lg:text-[58px]">Bergerak lagi tanpa nyeri, bersama {clinic.brand}.</h1>

          <p className="max-w-[500px] text-[16px] leading-relaxed text-zinc-500 md:text-[17px]">
            Klinik fisioterapi untuk nyeri otot dan sendi, gangguan saraf seperti pasca stroke, serta cedera olahraga. Ditangani fisioterapis bersertifikat, dipantau dari sesi ke sesi.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={appointmentHref} className={mk.btnPrimary}>
              Buat janji temu
              <ArrowRight size={15} weight="bold" />
            </Link>
            <a href={clinic.whatsapp.href} target="_blank" rel="noopener noreferrer" className={mk.btnSecondary}>
              <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
              Konsultasi via WhatsApp
            </a>
          </div>

          <div className="flex flex-col gap-1.5 text-[13px] text-zinc-500">
            <OpenStatus />
            <span className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-zinc-400" />
              {clinic.address}
            </span>
          </div>
        </div>

        {clinic.heroImageUrl ? (
          <div className="relative mr-4 sm:mr-5">
            <BrandPhoto src={clinic.heroImageUrl} alt={`Fisioterapis ${clinic.brand} menjelaskan hasil pemeriksaan kepada pasien`} ratio="aspect-[5/4]" priority />
            {clinic.foundedYear && (
              <div className="absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl bg-white py-3 pl-5 pr-5 shadow-[0_20px_40px_-20px_rgb(24_24_27/0.35)] sm:-left-8">
                <span>
                  <span className="block text-[14px] font-semibold text-zinc-900">Sejak {clinic.foundedYear}</span>
                  <span className="block text-[12px] text-zinc-500">Bagian dari {clinic.name}</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
            <ClinicLogo className="h-20 w-auto" nameClassName="text-[28px] font-semibold tracking-tight text-zinc-900" />
            <p className="text-[14px] leading-relaxed text-zinc-600">{clinic.about || clinic.name}</p>
            {clinic.hours && <p className="text-[13px] text-zinc-500">{clinic.hours}</p>}
          </div>
        )}
      </div>

      {/* Pita brand */}
      <div className="relative overflow-hidden bg-brand-500">
        <LogoWatermark className="-right-10 -top-16 w-[260px]" opacity={0.12} rotate={-6} tone="ink" drift={false} />
        <dl className={`${mk.container} relative grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4`}>
          {facts.map((f) => (
            <div key={f.value} className="flex flex-col gap-1 pr-6">
              <dt className="order-2 text-[13px] leading-snug text-on-action/70">{f.label}</dt>
              <dd className="order-1 text-[24px] font-semibold tracking-[-0.02em] text-on-action">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
