"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ChartLineUp } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import CountUp from "@/components/motion/CountUp";
import OpenStatus from "@/components/home/OpenStatus";
import LogoWatermark from "@/components/shared/LogoWatermark";

// Tinggi batang grafik ilustrasi "progres tercatat tiap sesi" (bukan data pasien)
const PROGRESS_BARS = [34, 46, 52, 63, 74, 88];

export default function HomeHero({ appointmentHref }: { appointmentHref: string }) {
  return (
    <section className="relative isolate w-full overflow-hidden bg-white">
      {/* Latar: grid halus + cahaya kuning bergerak pelan + watermark logo */}
      <div className="bg-grid-faint pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="animate-orb pointer-events-none absolute -right-40 top-16 -z-10 h-[620px] w-[620px] rounded-full bg-brand-200/50 blur-[120px]" aria-hidden="true" />
      <div className="animate-orb-slow pointer-events-none absolute -bottom-56 left-[-12%] -z-10 h-[460px] w-[460px] rounded-full bg-brand-100/70 blur-[110px]" aria-hidden="true" />
      {/* Watermark figur logo besar di belakang teks */}
      <LogoWatermark className="-z-10 -left-24 bottom-[-8%] w-[420px] md:w-[560px] lg:left-[-6%]" opacity={0.09} rotate={-10} />

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-14 px-5 pb-20 pt-10 md:px-8 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pb-28 lg:pt-16 xl:px-[80px]">
        {/* KIRI: Teks */}
        <div className="flex flex-col gap-8 lg:col-span-6 xl:col-span-6">
          <Reveal variant="fade">
            <span className="eyebrow">Klinik Fisioterapi · Jakarta Timur</span>
          </Reveal>

          <SplitText
            as="h1"
            delay={120}
            parts={[
              "Kembali bergerak,",
              { text: "tanpa ragu.", className: "font-display italic font-normal text-brand-900 mark-swoosh" },
            ]}
            className="max-w-[12ch] text-[52px] font-semibold leading-[0.98] tracking-[-0.04em] text-brand-900 sm:text-[64px] lg:text-[76px] xl:text-[88px]"
          />

          <Reveal delay={450}>
            <p className="max-w-[520px] text-[17px] leading-relaxed text-brand-900/70 md:text-[19px]">
              Nyeri pinggang, cedera olahraga, atau kaku sendi bisa ditangani dengan tepat. Setiap sesi terapi di Hai Physio dicatat dan dievaluasi, jadi Anda tahu pasti progresnya.
            </p>
          </Reveal>

          <Reveal delay={600} className="flex flex-wrap items-center gap-3">
            <Link href={appointmentHref} className="btn btn-primary">
              Buat Janji Temu
              <ArrowRight size={18} weight="bold" className="btn-arrow" />
            </Link>
            <Link href="/layanan" className="btn btn-ghost">
              Lihat Layanan
            </Link>
          </Reveal>

          {/* Angka kepercayaan */}
          <Reveal delay={750} className="mt-2 grid max-w-[520px] grid-cols-3 divide-x divide-brand-900/10 border-t border-brand-900/10 pt-7">
            <div className="flex flex-col gap-1 pr-4">
              <CountUp to={1985} from={1940} className="text-[30px] font-semibold tracking-[-0.03em] text-brand-900 md:text-[36px]" />
              <span className="text-[13px] leading-snug text-brand-900/60">Klinik berdiri sejak</span>
            </div>
            <div className="flex flex-col gap-1 px-4">
              <CountUp to={3} className="text-[30px] font-semibold tracking-[-0.03em] text-brand-900 md:text-[36px]" />
              <span className="text-[13px] leading-snug text-brand-900/60">Bidang spesialisasi</span>
            </div>
            <div className="flex flex-col gap-1 pl-4">
              <CountUp to={6} suffix=" hari" className="text-[30px] font-semibold tracking-[-0.03em] text-brand-900 md:text-[36px]" />
              <span className="text-[13px] leading-snug text-brand-900/60">Buka setiap minggu</span>
            </div>
          </Reveal>
        </div>

        {/* KANAN: Foto + kartu melayang */}
        <div className="relative lg:col-span-6 xl:col-span-6">
          <Reveal mask delay={200} className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgb(26_24_20/0.45)] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/6]">
            <Image
              src="/hero-bg.png"
              alt="Fisioterapis Hai Physio menjelaskan progres terapi kepada pasien"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[62%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" aria-hidden="true" />
            {/* Cap logo di pojok foto */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2 text-white/90" aria-hidden="true">
              <LogoWatermark className="static! w-8" opacity={0.95} rotate={0} drift={false} tone="white" />
              <span className="font-display text-[18px] italic leading-none">Hai Physio</span>
            </div>
          </Reveal>

          {/* Status buka/tutup real-time */}
          <Reveal variant="blur" delay={1100} className="absolute right-4 top-4 md:right-6 md:top-6">
            <OpenStatus />
          </Reveal>

          {/* Kartu progres terapi */}
          <Reveal variant="blur" delay={900} className="absolute -bottom-8 left-4 right-4 sm:right-auto md:-left-10 lg:-left-12">
            <div className="animate-float w-full rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_30px_60px_-20px_rgb(26_24_20/0.4)] backdrop-blur-xl sm:w-[300px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-brand-950">
                  <ChartLineUp size={20} weight="bold" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-brand-900">Progres terapi</span>
                  <span className="text-[12px] text-brand-900/60">Tercatat di setiap sesi</span>
                </div>
              </div>
              <div className="mt-5 flex h-[72px] items-end gap-2" aria-hidden="true">
                {PROGRESS_BARS.map((h, i) => (
                  <span
                    key={i}
                    className={`grow-bar flex-1 rounded-t-md ${i === PROGRESS_BARS.length - 1 ? "bg-brand-600" : "bg-brand-100"}`}
                    style={{ height: `${h}%`, "--i": i } as CSSProperties}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-medium text-brand-900/45">
                <span>Sesi 1</span>
                <span>Sesi 6</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
