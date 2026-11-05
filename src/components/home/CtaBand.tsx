"use client";

import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { useClinic } from "@/components/shared/ClinicProvider";
import LogoWatermark from "@/components/shared/LogoWatermark";
import { mk } from "@/components/marketing/ui";

/** Ajakan penutup halaman: panel kuning brand dengan figur logo. */
export default function CtaBand({ appointmentHref }: { appointmentHref: string }) {
  const clinic = useClinic();
  return (
    <section className={`${mk.section} bg-white`}>
      <div className={mk.container}>
        <div className="relative overflow-hidden rounded-3xl bg-brand-500 px-6 py-12 sm:px-12 md:py-16">
          <LogoWatermark className="-bottom-16 right-0 w-[260px] md:right-10 md:w-[320px]" opacity={0.14} rotate={-6} tone="ink" />
          <div className="relative flex max-w-[560px] flex-col gap-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-on-action/70">Efektif & Progresif</p>
            <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-on-action md:text-[38px]">Siap bergerak lagi? Pesan jadwal terapi Anda hari ini.</h2>
            <p className="text-[15px] leading-relaxed text-on-action/70">Pilih jam yang kosong secara online, atau konsultasikan keluhan Anda dulu lewat WhatsApp.</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href={appointmentHref} className={mk.btnDark}>
                Buat janji temu
                <ArrowRight size={15} />
              </Link>
              <a href={clinic.whatsapp.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg border border-on-action/20 px-5 text-[14px] font-medium text-on-action hover:bg-on-action/5">
                <WhatsappLogo size={16} weight="fill" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
