"use client";

import type { CSSProperties } from "react";
import { CursorClick, CalendarCheck, NotePencil, Handshake } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";

// Sesuai alur booking sebenarnya di /booking (Step 1–4) + kedatangan ke klinik
const steps = [
  { icon: CursorClick, title: "Pilih layanan", desc: "Muskuloskeletal, neuro, atau olahraga — sesuai keluhan Anda." },
  { icon: CalendarCheck, title: "Pilih terapis & jam", desc: "Lihat jadwal terapis yang tersedia minggu ini, lalu pilih slot." },
  { icon: NotePencil, title: "Isi data & keluhan", desc: "Data terisi otomatis dari profil. Ceritakan keluhan Anda singkat saja." },
  { icon: Handshake, title: "Datang & mulai terapi", desc: "Tunjukkan kode reservasi. Perubahan jadwal bisa sampai H-24 jam." },
];

/** "Cara buat janji" — 4 langkah dengan garis penghubung yang tergambar saat terlihat. */
export default function ProcessSection() {
  return (
    // Latar berpola figur logo (.bg-logo-pattern)
    <section className="bg-logo-pattern relative w-full overflow-hidden bg-brand-50/50 py-24 md:py-32">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:px-8 lg:px-10 xl:px-[80px]">
        <SectionHeading
          align="center"
          eyebrow="Cara buat janji"
          title="Empat langkah,"
          accent="semudah itu."
          subtitle="Booking online kapan saja — tanpa antre telepon, tanpa formulir panjang."
        />

        <Reveal variant="fade" className="relative">
          {/* Garis penghubung (desktop) */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[34px] hidden h-px bg-brand-900/10 lg:block" aria-hidden="true">
            <div className="draw-line h-full w-full bg-gradient-to-r from-brand-300 via-brand-600 to-brand-300" style={{ "--reveal-delay": "300ms" } as CSSProperties} />
          </div>

          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <Reveal as="li" key={title} delay={200 + i * 180} className="group relative flex flex-col items-center gap-5 text-center">
                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-brand-900/10 bg-white text-gold-700 shadow-[0_16px_32px_-16px_rgb(26_24_20/0.35)] transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-brand-600 group-hover:text-brand-950">
                  <Icon size={28} weight="duotone" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-900 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="flex max-w-[260px] flex-col gap-2">
                  <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-brand-900">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-brand-900/70">{desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
