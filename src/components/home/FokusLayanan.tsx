"use client";

import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import SectionHeading from "@/components/shared/SectionHeading";
import LogoWatermark from "@/components/shared/LogoWatermark";
import { servicesData } from "@/constants/data";

interface FokusLayananProps {
  className?: string; // Prop opsional untuk ngubah warna background/spasi dari luar
}

export default function FokusLayanan({ className = "bg-white py-24 md:py-32" }: FokusLayananProps) {
  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-5 md:px-8 lg:px-10 xl:px-[80px]">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Layanan" title="Fokus" accent="layanan kami" />
          <Reveal delay={200} className="max-w-[420px] text-[16px] leading-relaxed text-brand-900/70 md:text-[17px] lg:pb-3">
            Tiga bidang yang kami tangani secara mendalam — masing-masing dengan pemeriksaan, program latihan, dan evaluasi yang terukur.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, i) => (
            <Reveal key={service.id} delay={i * 140} className="h-full">
              <SpotlightCard
                as="article"
                className="group flex h-full flex-col gap-6 overflow-hidden rounded-[28px] border border-brand-900/[0.07] bg-white p-3 shadow-[0_2px_4px_rgb(26_24_20/0.03)] transition-[transform,box-shadow,border-color] duration-700 ease-[var(--ease-out-soft)] hover:-translate-y-2 hover:border-brand-200 hover:shadow-[0_40px_80px_-32px_rgb(26_24_20/0.35)]"
              >
                <div className="relative h-[220px] w-full overflow-hidden rounded-[22px]">
                  <Image
                    src={service.imgSrc}
                    alt={`Fisioterapi ${service.titleBold}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-soft)] group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-brand-950/0 to-transparent" aria-hidden="true" />
                  <span className="absolute bottom-4 left-5 font-display text-[44px] italic leading-none text-white/90">0{i + 1}</span>
                  {/* Cap watermark logo di pojok foto */}
                  <LogoWatermark className="bottom-4 right-4 w-9 transition-transform duration-700 group-hover:-translate-y-1" opacity={0.9} rotate={0} drift={false} tone="white" />
                </div>

                <div className="flex flex-1 flex-col gap-5 px-4 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-gold-700 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-brand-950">
                      {service.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.01em] text-brand-900">
                        {service.title} <span className="font-display text-[24px] font-normal italic text-gold-700">{service.titleBold}</span>
                      </h3>
                      <span className="mt-1 text-[13px] text-brand-900/60">{service.subtitle}</span>
                    </div>
                  </div>

                  <p className="text-[15px] leading-relaxed text-brand-900/70">{service.desc}</p>

                  <div className="mt-auto flex flex-col gap-3 border-t border-brand-900/[0.07] pt-5">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-900/50">Contoh kasus</span>
                    <div className="flex flex-wrap gap-2">
                      {service.cases.map((caseItem) => (
                        <span
                          key={caseItem}
                          className="rounded-full border border-brand-900/10 bg-white px-3.5 py-1.5 text-[13px] font-medium text-brand-900 transition-colors duration-300 hover:border-brand-600 hover:text-gold-800"
                        >
                          {caseItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
