"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Star, InstagramLogo, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import LogoWatermark from "@/components/shared/LogoWatermark";
import { reasonsData } from "@/constants/data";

interface AboutSectionProps {
  eyebrow?: string;
  title?: string;
  accent?: string;
  /** Tampilkan tombol "Selengkapnya" ke halaman Tentang Kami (khusus Beranda). */
  showMoreLink?: boolean;
}

/** Blok "Tentang Hai Physio" — foto klinik + kartu melayang + narasi. Dipakai di Beranda & Tentang Kami. */
export default function AboutSection({
  eyebrow = "Tentang kami",
  title = "Kenapa pilih",
  accent = "Hai Physio?",
  showMoreLink = false,
}: AboutSectionProps) {
  return (
    <section className="relative isolate w-full overflow-hidden bg-white py-24 md:py-32">
      <LogoWatermark className="-z-10 -right-32 top-10 w-[520px] max-lg:hidden" opacity={0.06} rotate={12} />
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-20 px-5 md:px-8 lg:grid-cols-12 lg:gap-12 lg:px-10 xl:px-[80px]">
        {/* KIRI: Foto + kartu melayang */}
        <div className="relative mx-auto w-full max-w-[520px] lg:col-span-5 lg:mx-0">
          <Reveal mask className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgb(26_24_20/0.4)]">
            <Image src="/ruangan-klinik.png" alt="Ruang terapi Klinik Hai Physio" fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
          </Reveal>

          {/* Lingkaran dekoratif "Sejak 1985" yang berputar pelan */}
          <Reveal variant="scale" delay={500} className="absolute -right-4 -top-10 md:-right-12">
            <div className="relative flex h-[118px] w-[118px] items-center justify-center rounded-full bg-brand-900 text-white shadow-[0_20px_40px_-12px_rgb(26_24_20/0.6)] md:h-[136px] md:w-[136px]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_24s_linear_infinite]" aria-hidden="true">
                <defs>
                  <path id="about-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                {/* textLength = keliling lingkaran (2π·38 ≈ 239) supaya teks pas satu putaran, tidak menumpuk */}
                <text className="fill-brand-200 text-[8.5px] font-semibold uppercase">
                  <textPath href="#about-circle" textLength="236" lengthAdjust="spacing">Efektif · Progresif · Efektif · Progresif ·</textPath>
                </text>
              </svg>
              <div className="flex flex-col items-center leading-none">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-200">Sejak</span>
                <span className="font-display text-[34px] italic">1985</span>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={350} className="absolute -left-3 top-[18%] md:-left-12">
            <div className="animate-float flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 pr-6 shadow-[0_24px_48px_-16px_rgb(26_24_20/0.35)] backdrop-blur-xl">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-gold-700">
                <Clock size={20} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-brand-900">Jam operasional</span>
                <span className="mt-0.5 text-[12px] leading-snug text-brand-900/60">Senin–Sabtu, 08.00–16.00 WIB<br />(Minggu tutup)</span>
              </div>
            </div>
          </Reveal>

          <Reveal variant="left" delay={500} className="absolute -right-3 bottom-[22%] md:-right-10">
            <div className="animate-float-slow flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 pr-6 shadow-[0_24px_48px_-16px_rgb(26_24_20/0.35)] backdrop-blur-xl">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-gold-700">
                <Star size={20} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-brand-900">Motto klinik</span>
                <span className="mt-0.5 text-[12px] text-brand-900/60">Efektif & Progresif</span>
              </div>
            </div>
          </Reveal>

          <Reveal variant="up" delay={650} className="absolute -bottom-7 left-4 md:-left-6">
            <a
              href="https://instagram.com/fisioterapi_jakarta_timur"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-4 pr-6 shadow-[0_24px_48px_-16px_rgb(26_24_20/0.35)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-gold-700 transition-colors group-hover:bg-brand-600 group-hover:text-brand-950">
                <InstagramLogo size={20} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-brand-900">Instagram</span>
                <span className="text-[12px] text-brand-900/60">@fisioterapi_jakarta_timur</span>
              </div>
            </a>
          </Reveal>
        </div>

        {/* KANAN: Narasi */}
        <div className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
          <SectionHeading eyebrow={eyebrow} title={title} accent={accent} />

          <Reveal delay={150} className="flex flex-col gap-5 text-[16px] leading-relaxed text-brand-900/75 md:text-[17px]">
            <p>
              Fisioterapi adalah layanan kesehatan untuk memulihkan dan menjaga fungsi gerak tubuh. Hai Physio berada di bawah Klinik Pratama Condet Jaya, klinik yang sudah berdiri sejak 1985, dan fokus menangani tiga jenis kasus:{" "}
              <span className="font-semibold text-brand-900">neuro, olahraga, dan muskuloskeletal.</span>
            </p>
            <p>
              Motto kami <span className="font-semibold text-brand-900">&ldquo;Efektif dan Progresif&rdquo;</span> kami jalankan lewat pencatatan. Tiap sesi terapi ada datanya, sehingga progres pasien bisa dipantau dari waktu ke waktu.
            </p>
          </Reveal>

          <ul className="flex flex-col divide-y divide-brand-900/[0.08] border-y border-brand-900/[0.08]">
            {reasonsData.map((reason, i) => (
              <Reveal as="li" key={reason.id} delay={250 + i * 120} className="group flex items-center gap-4 py-4">
                <CheckCircle size={22} weight="fill" className="shrink-0 text-gold-700 transition-transform duration-500 group-hover:scale-110" />
                <span className="text-[16px] font-semibold text-brand-900">{reason.title}</span>
                <span className="ml-auto font-display text-[18px] italic text-brand-900/30">0{i + 1}</span>
              </Reveal>
            ))}
          </ul>

          {showMoreLink && (
            <Reveal delay={600}>
              <Link href="/tentang-kami" className="btn btn-ghost">
                Selengkapnya tentang kami
                <ArrowRight size={18} weight="bold" className="btn-arrow" />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
