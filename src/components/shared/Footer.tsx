"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsappLogo, EnvelopeSimple, InstagramLogo, MapPin, Clock, ArrowUp } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import LogoWatermark from "@/components/shared/LogoWatermark";

const menu = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Layanan", href: "/layanan" },
  { label: "Kontak Kami", href: "/kontak" },
  { label: "Buat Janji Temu", href: "/booking" },
];

const contacts = [
  { icon: WhatsappLogo, label: "WhatsApp", value: "+62 898-3050-149", href: "https://wa.me/628983050149" },
  { icon: EnvelopeSimple, label: "Email", value: "haiphysio@gmail.com", href: "mailto:haiphysio@gmail.com" },
  { icon: InstagramLogo, label: "Instagram", value: "@fisioterapi_jakarta_timur", href: "https://instagram.com/fisioterapi_jakarta_timur" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="grain relative isolate mt-auto w-full overflow-hidden bg-brand-950 text-white">
      <div className="animate-orb pointer-events-none absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-brand-600/25 blur-[130px]" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1440px] px-5 pt-20 md:px-8 md:pt-24 lg:px-10 xl:px-[80px]">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 xl:grid-cols-12 xl:gap-10">
          {/* Brand */}
          <Reveal className="flex flex-col gap-6 xl:col-span-4">
            <span className="eyebrow eyebrow-light">Hai Physio</span>
            <p className="max-w-[340px] text-[26px] font-semibold leading-[1.15] tracking-[-0.02em]">
              Pilihan terpercaya untuk pemulihan yang <span className="font-display font-normal italic text-brand-300">efektif dan progresif.</span>
            </p>
          </Reveal>

          {/* Menu */}
          <Reveal delay={100} as="nav" aria-label="Menu footer" className="flex flex-col gap-5 xl:col-span-2 xl:col-start-6">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Menu</h2>
            <ul className="flex flex-col gap-3">
              {menu.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group inline-flex items-center gap-2 text-[15px] text-white/80 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-brand-300 transition-all duration-500 group-hover:w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Kontak */}
          <Reveal delay={200} className="flex flex-col gap-5 xl:col-span-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Kontak</h2>
            <ul className="flex flex-col gap-4">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 text-[15px] text-white/80 transition-colors hover:text-white"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-brand-300 transition-colors group-hover:border-brand-300 group-hover:bg-brand-300 group-hover:text-brand-950">
                      <Icon size={18} weight="fill" />
                    </span>
                    <span className="break-all">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Alamat */}
          <Reveal delay={300} className="flex flex-col gap-5 xl:col-span-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Kunjungi</h2>
            <div className="flex items-start gap-3 text-[15px] leading-relaxed text-white/80">
              <MapPin size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-300" />
              <p>Klinik Pratama Condet Jaya, Jl. Condet Raya No. 18, Batu Ampar, Kramat Jati, Jakarta Timur 13520</p>
            </div>
            <div className="flex items-start gap-3 text-[15px] text-white/80">
              <Clock size={20} weight="fill" className="mt-0.5 shrink-0 text-brand-300" />
              <p>
                Senin – Sabtu, 08.00 – 16.00 WIB
                <span className="block text-[13px] text-white/50">Minggu tutup</span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* Wordmark besar */}
        <div className="mt-20 select-none border-t border-white/10 pt-10" aria-hidden="true">
          <Reveal variant="blur" className="flex items-end justify-center gap-[2vw]">
            <LogoWatermark className="static! w-[15vw] shrink-0 xl:w-[200px]" opacity={0.16} rotate={0} drift={false} />
            <p className="whitespace-nowrap font-display text-[17vw] italic leading-[0.8] tracking-[-0.04em] text-white/[0.07] xl:text-[240px]">
              Hai Physio
            </p>
          </Reveal>
        </div>

        {/* Bawah */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-[13px] text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Hai Physio · Klinik Pratama Condet Jaya. Semua hak dilindungi.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            Kembali ke atas
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/40">
              <ArrowUp size={16} weight="bold" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
