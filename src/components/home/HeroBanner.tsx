"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import LogoWatermark from "@/components/shared/LogoWatermark";

// Ini adalah "kontrak" data apa saja yang wajib dilempar ke komponen ini
interface HeroBannerProps {
  title: string;
  /** Kata aksen serif miring setelah judul (opsional). */
  accent?: string;
  subtitle?: string;
  imageSrc: string;
}

/** Banner halaman dalam: foto zoom-out pelan, overlay gelap + watermark logo, breadcrumb, judul per kata. */
export default function HeroBanner({ title, accent, subtitle, imageSrc }: HeroBannerProps) {
  return (
    <section className="w-full bg-white px-3 pt-3 md:px-5 md:pt-4">
      <div className="grain relative isolate mx-auto flex min-h-[380px] w-full max-w-[1440px] items-end overflow-hidden rounded-[28px] md:min-h-[520px] md:rounded-[40px]">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/90 via-brand-900/45 to-brand-900/10" aria-hidden="true" />
        {/* Watermark figur logo besar + cap logo di pojok foto */}
        <LogoWatermark className="-z-10 -right-10 -bottom-16 w-[280px] md:right-6 md:w-[420px]" opacity={0.18} rotate={-8} />
        <div className="absolute right-6 top-6 hidden items-center gap-2 text-white/90 md:flex" aria-hidden="true">
          <LogoWatermark className="static! w-8" opacity={0.95} rotate={0} drift={false} tone="white" />
          <span className="font-display text-[18px] italic leading-none">Hai Physio</span>
        </div>

        <div className="flex w-full flex-col gap-5 px-6 pb-10 md:px-14 md:pb-16">
          <Reveal variant="fade">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Link href="/" className="transition-colors hover:text-white">Beranda</Link>
              <CaretRight size={12} weight="bold" />
              <span className="text-white" aria-current="page">{title}{accent ? ` ${accent}` : ""}</span>
            </nav>
          </Reveal>

          <SplitText
            as="h1"
            delay={150}
            parts={accent ? [title, { text: accent, className: "font-display italic font-normal text-brand-200" }] : [title]}
            className="max-w-[16ch] text-[44px] font-semibold leading-[1] tracking-[-0.04em] text-white md:text-[72px] lg:text-[88px]"
          />

          {subtitle && (
            <Reveal delay={450}>
              <p className="max-w-[560px] text-[16px] leading-relaxed text-white/80 md:text-[18px]">{subtitle}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
