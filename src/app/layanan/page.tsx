"use client";

import HeroBanner from "@/components/home/HeroBanner";
import FokusLayanan from "@/components/home/FokusLayanan";
import CtaBand from "@/components/home/CtaBand";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { jenisPelayananData, manfaatData } from "@/constants/data";

export default function Layanan() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      {/* 1. HERO BANNER LAYANAN */}
      <HeroBanner
        title="Layanan"
        accent="kami"
        subtitle="Dari pencegahan hingga rehabilitasi — penanganan yang disesuaikan dengan kondisi dan tujuan Anda."
        imageSrc="/hero-layanan.png"
      />

      {/* 2. JENIS PELAYANAN */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-5 md:px-8 lg:px-10 xl:px-[80px]">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="Pendekatan" title="Jenis" accent="pelayanan" />
            <Reveal delay={200} className="max-w-[420px] text-[16px] leading-relaxed text-brand-900/70 md:text-[17px] lg:pb-3">
              Empat pendekatan yang kami pakai dalam menangani pasien.
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {jenisPelayananData.map((item, i) => (
              <Reveal key={item.id} delay={i * 120} className="h-full">
                <SpotlightCard className="group flex h-full flex-col gap-10 rounded-[28px] border border-brand-900/[0.07] bg-white p-7 transition-[transform,box-shadow,background-color] duration-700 hover:-translate-y-2 hover:bg-brand-900 hover:shadow-[0_40px_80px_-32px_rgb(26_24_20/0.5)]">
                  <div className="flex items-start justify-between">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-gold-700 transition-colors duration-500 group-hover:bg-white/10 group-hover:text-brand-200 [&_svg]:h-8 [&_svg]:w-8">
                      {item.icon}
                    </span>
                    <span className="font-display text-[28px] italic leading-none text-brand-900/20 transition-colors duration-500 group-hover:text-white/30">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-brand-900 transition-colors duration-500 group-hover:text-white">{item.title}</h3>
                    <p className="text-[15px] leading-relaxed text-brand-900/70 transition-colors duration-500 group-hover:text-white/75">{item.desc}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOKUS LAYANAN KAMI */}
      <FokusLayanan className="bg-brand-50/40 py-24 md:py-32" />

      {/* 4. MANFAAT FISIOTERAPI */}
      <section className="w-full bg-white py-24 md:py-32">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-14 px-5">
          <SectionHeading
            align="center"
            eyebrow="Manfaat"
            title="Yang bisa Anda rasakan dari"
            accent="terapi rutin."
          />

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {manfaatData.map((manfaat, index) => (
              <Reveal key={manfaat.text} variant="scale" delay={index * 90}>
                <div className="group flex items-center gap-3 rounded-full border border-brand-900/[0.08] bg-white py-3 pl-3 pr-6 shadow-[0_12px_32px_-20px_rgb(26_24_20/0.35)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-600 md:py-3.5 md:pl-3.5 md:pr-7">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-gold-700 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-brand-950 [&_svg]:h-6 [&_svg]:w-6">
                    {manfaat.icon}
                  </span>
                  <span className="text-[15px] font-semibold text-brand-900 md:text-[16px]">{manfaat.text}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AJAKAN */}
      <CtaBand appointmentHref={appointmentHref} />
    </div>
  );
}
