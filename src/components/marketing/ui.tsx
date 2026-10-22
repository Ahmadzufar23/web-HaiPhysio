import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import LogoWatermark from "@/components/shared/LogoWatermark";

// Bahasa visual company profile: identitas Hai Physio (kuning logo + tinta hitam) di atas putih.
// Kuning dipakai sebagai bidang tegas (tombol utama, panel brand), bukan titik-titik kecil.
export const mk = {
  container: "mx-auto w-full max-w-[1160px] px-5 md:px-8",
  section: "w-full py-16 md:py-24",
  btnPrimary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-[14px] font-semibold text-brand-950 transition-colors hover:bg-brand-600",
  btnDark:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-[14px] font-medium text-white transition-colors hover:bg-zinc-800",
  btnSecondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-[14px] font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50",
  link: "inline-flex items-center gap-1.5 text-[14px] font-medium text-zinc-900 underline-offset-4 hover:underline",
  card: "rounded-2xl border border-zinc-200 bg-white",
};

/** Label kecil di atas judul section */
export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return <span className={`text-[12px] font-semibold uppercase tracking-[0.1em] ${tone === "dark" ? "text-brand-300" : "text-gold-700"}`}>{children}</span>;
}

export function SectionTitle({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "light",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  action?: ReactNode;
}) {
  const center = align === "center";
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end ${center ? "md:justify-center" : "md:justify-between"}`}>
      <div className={`flex max-w-[640px] flex-col gap-3 ${center ? "mx-auto items-center text-center" : ""}`}>
        {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
        <h2 className={`text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[36px] ${tone === "dark" ? "text-white" : "text-zinc-900"}`}>{title}</h2>
        {lead && <p className={`text-[15px] leading-relaxed md:text-[16px] ${tone === "dark" ? "text-white/60" : "text-zinc-500"}`}>{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Foto berbingkai dengan blok kuning brand di belakangnya */
export function BrandPhoto({ src, alt, className = "", ratio = "aspect-[4/3]", priority = false }: { src: string; alt: string; className?: string; ratio?: string; priority?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -bottom-4 -right-4 h-[72%] w-[72%] rounded-3xl bg-brand-500 sm:-bottom-5 sm:-right-5" aria-hidden />
      <div className={`relative ${ratio} overflow-hidden rounded-3xl bg-zinc-100`}>
        <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" priority={priority} />
      </div>
    </div>
  );
}

/** Pembuka halaman dalam (Tentang, Layanan, Kontak): teks di kiri, foto brand di kanan */
export function PageIntro({ title, lead, crumb, image, children }: { title: string; lead: string; crumb: string; image: { src: string; alt: string }; children?: ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <LogoWatermark className="-left-24 top-10 w-[380px]" opacity={0.06} rotate={-10} />
      <div className={`${mk.container} relative grid items-center gap-12 pb-16 pt-10 md:pb-20 md:pt-14 lg:grid-cols-[1.05fr_0.95fr]`}>
        <div className="flex flex-col gap-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-zinc-400">
            <Link href="/" className="hover:text-zinc-700">
              Beranda
            </Link>
            <CaretRight size={10} />
            <span className="text-zinc-600" aria-current="page">
              {crumb}
            </span>
          </nav>
          <h1 className="max-w-[18ch] text-balance text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-900 md:text-[48px]">{title}</h1>
          <p className="max-w-[540px] text-[16px] leading-relaxed text-zinc-500 md:text-[17px]">{lead}</p>
          {children}
        </div>
        <BrandPhoto src={image.src} alt={image.alt} className="mr-4 sm:mr-5" priority />
      </div>
    </section>
  );
}
