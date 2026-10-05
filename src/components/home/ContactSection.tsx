"use client";

import type { ReactNode } from "react";
import { Clock, WhatsappLogo, EnvelopeSimple, InstagramLogo, ArrowUpRight } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import SectionHeading from "@/components/shared/SectionHeading";

// Mendefinisikan Props untuk kustomisasi teks dan elemen tambahan (children)
interface ContactSectionProps {
  title?: string;
  accent?: string;
  subtitle?: string;
  children?: ReactNode;
}

const channels = [
  { icon: WhatsappLogo, label: "WhatsApp", value: "+62 898-3050-149", note: "Chat langsung, respon cepat", href: "https://wa.me/628983050149" },
  { icon: EnvelopeSimple, label: "Email", value: "haiphysio@gmail.com", note: "Pertanyaan lebih detail", href: "mailto:haiphysio@gmail.com" },
  { icon: InstagramLogo, label: "Instagram", value: "@fisioterapi_jakarta_timur", note: "Info terbaru klinik", href: "https://instagram.com/fisioterapi_jakarta_timur" },
  { icon: Clock, label: "Jam operasional", value: "Senin – Sabtu, 08.00 – 16.00", note: "Hari Minggu tutup", href: null },
];

export default function ContactSection({
  title = "Hubungi",
  accent = "kami",
  subtitle = "Punya pertanyaan atau ingin berkonsultasi? Silakan hubungi kami.",
  children,
}: ContactSectionProps) {
  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14 px-5 md:px-8 lg:px-10 xl:px-[80px]">
        <SectionHeading align="center" eyebrow="Kontak" title={title} accent={accent} subtitle={subtitle} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {channels.map(({ icon: Icon, label, value, note, href }, i) => {
            const external = href?.startsWith("http");
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-gold-700 transition-colors duration-500 group-hover:bg-brand-600 group-hover:text-brand-950">
                    <Icon size={24} weight="fill" />
                  </span>
                  {href && (
                    <ArrowUpRight size={20} weight="bold" className="text-brand-900/25 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-700" />
                  )}
                </div>
                <div className="mt-8 flex flex-col gap-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-900/50">{label}</span>
                  <span className="break-words text-[17px] font-semibold text-brand-900">{value}</span>
                  <span className="text-[14px] text-brand-900/60">{note}</span>
                </div>
              </>
            );
            const cardClass =
              "group flex h-full flex-col rounded-[24px] border border-brand-900/[0.07] bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_30px_60px_-30px_rgb(26_24_20/0.35)]";

            return (
              <Reveal key={label} delay={i * 110} className="h-full">
                {href ? (
                  <SpotlightCard className={cardClass}>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="absolute inset-0 z-10 rounded-[24px]"
                      aria-label={`${label}: ${value}`}
                    />
                    {body}
                  </SpotlightCard>
                ) : (
                  <SpotlightCard className={cardClass}>{body}</SpotlightCard>
                )}
              </Reveal>
            );
          })}
        </div>
        {children}
      </div>
    </section>
  );
}
