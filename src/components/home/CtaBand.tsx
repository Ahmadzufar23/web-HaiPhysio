"use client";

import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import LogoWatermark from "@/components/shared/LogoWatermark";

/** Panel ajakan hitam (warna teks logo) dengan cahaya bergerak + tekstur grain. */
export default function CtaBand({ appointmentHref }: { appointmentHref: string }) {
  return (
    <section className="w-full bg-white px-5 py-20 md:px-8 md:py-28 lg:px-10 xl:px-[80px]">
      <Reveal variant="scale" className="mx-auto w-full max-w-[1280px]">
        <div className="grain relative isolate overflow-hidden rounded-[40px] bg-brand-900 px-6 py-16 md:px-16 md:py-24">
          <div className="animate-orb pointer-events-none absolute -left-24 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-brand-600/25 blur-[110px]" aria-hidden="true" />
          <div className="animate-orb-slow pointer-events-none absolute -bottom-40 -right-20 -z-10 h-[460px] w-[460px] rounded-full bg-brand-400/20 blur-[120px]" aria-hidden="true" />
          {/* Figur logo besar di sisi kanan panel */}
          <LogoWatermark className="-z-10 -right-16 -bottom-20 w-[340px] md:-right-10 md:w-[460px]" opacity={0.22} rotate={-6} />

          <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
            <SectionHeading
              tone="light"
              eyebrow="Mulai hari ini"
              title="Langkah pertama menuju pulih"
              accent="dimulai di sini."
              subtitle="Pilih jadwal yang cocok, datang ke klinik, dan biarkan terapis kami memandu pemulihan Anda — sesi demi sesi."
            />
            <Reveal delay={400} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
              <Link href={appointmentHref} className="btn btn-light">
                Buat Janji Temu
                <ArrowRight size={18} weight="bold" className="btn-arrow" />
              </Link>
              <a href="https://wa.me/628983050149" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                <WhatsappLogo size={20} weight="fill" />
                Tanya via WhatsApp
              </a>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
