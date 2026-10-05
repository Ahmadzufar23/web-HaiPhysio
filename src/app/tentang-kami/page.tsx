"use client";

import Image from "next/image";
import HeroBanner from "@/components/home/HeroBanner";
import AboutSection from "@/components/home/AboutSection";
import CtaBand from "@/components/home/CtaBand";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { reasonsData } from "@/constants/data";

export default function TentangKami() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      {/* 1. HERO BANNER */}
      <HeroBanner
        title="Tentang"
        accent="kami"
        subtitle="Bagian dari Klinik Pratama Condet Jaya sejak 1985 — kini dengan layanan fisioterapi yang terukur di setiap sesi."
        imageSrc="/hero-tentang-kami.png"
      />

      {/* 2. TENTANG HAI PHYSIO */}
      <AboutSection eyebrow="Siapa kami" title="Tentang" accent="Hai Physio" />

      {/* 3. KENAPA PILIH KAMI? */}
      <section className="w-full bg-brand-50/50 py-24 md:py-32">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-5 md:px-8 lg:px-10 xl:px-[80px]">
          <SectionHeading
            align="center"
            eyebrow="Nilai kami"
            title="Kenapa pilih"
            accent="kami?"
            subtitle="Beberapa hal yang kami perhatikan dalam menangani setiap pasien."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reasonsData.map((reason, i) => (
              <Reveal key={reason.id} delay={i * 140} className="h-full">
                <SpotlightCard className="group flex h-full flex-col items-center gap-6 rounded-[28px] border border-brand-900/[0.07] bg-white p-8 text-center transition-[transform,box-shadow] duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-32px_rgb(26_24_20/0.35)] md:p-10">
                  <span className="self-start font-display text-[40px] italic leading-none text-brand-200 transition-colors duration-500 group-hover:text-gold-700">
                    0{i + 1}
                  </span>
                  <div className="relative -mt-6 h-[170px] w-[170px] transition-transform duration-700 group-hover:scale-105">
                    <Image src={reason.imgSrc} alt="" fill sizes="170px" className="object-contain" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.01em] text-brand-900">{reason.title}</h3>
                    <p className="text-[15px] leading-relaxed text-brand-900/70">{reason.desc}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AJAKAN */}
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
