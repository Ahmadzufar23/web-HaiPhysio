"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsappLogo, EnvelopeSimple, InstagramLogo, MapPin, Clock } from "@phosphor-icons/react";
import { useClinic } from "@/components/shared/ClinicProvider";
import { PLATFORM } from "@/constants/platform";

const menu = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Layanan", href: "/layanan" },
  { label: "Kontak Kami", href: "/kontak" },
  { label: "Buat Janji Temu", href: "/booking" },
];

export default function Footer() {
  const pathname = usePathname();
  const clinic = useClinic();
  if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) return null;

  const contacts = [
    { icon: WhatsappLogo, ...clinic.whatsapp },
    { icon: EnvelopeSimple, ...clinic.email },
    { icon: InstagramLogo, ...clinic.instagram },
  ];

  return (
    <footer className="mt-auto w-full bg-brand-950 text-white print:hidden">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-5 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-12">
        {/* Brand */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* Figur logo kuning asli + nama putih (teks hitam bawaan logo tidak terbaca di latar gelap) */}
          <span className="flex items-center gap-2.5">
            <Image src="/brand/logo-mark.png" alt="" width={64} height={71} className="h-auto w-10" />
            <span className="text-[22px] font-extrabold tracking-[-0.02em] text-white">{clinic.brand}</span>
          </span>
          <p className="max-w-[300px] text-[14px] leading-relaxed text-white/60">
            Klinik fisioterapi di bawah Klinik Pratama Condet Jaya, Jakarta Timur. Efektif dan progresif.
          </p>
        </div>

        {/* Menu */}
        <nav aria-label="Menu footer" className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-[13px] font-semibold text-white">Menu</h2>
          <ul className="flex flex-col gap-2.5">
            {menu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[14px] text-white/60 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Kontak */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h2 className="text-[13px] font-semibold text-white">Kontak</h2>
          <ul className="flex flex-col gap-2.5">
            {contacts.map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2.5 text-[14px] text-white/60 transition-colors hover:text-white"
                >
                  <Icon size={16} weight="fill" className="shrink-0 text-brand-300" />
                  <span className="break-all">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Alamat & jam */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h2 className="text-[13px] font-semibold text-white">Kunjungi</h2>
          <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/60">
            <MapPin size={16} weight="fill" className="mt-1 shrink-0 text-brand-300" />
            {clinic.address}
          </p>
          <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-white/60">
            <Clock size={16} weight="fill" className="mt-1 shrink-0 text-brand-300" />
            <span>
              {clinic.hours}
              <span className="block text-white/40">{clinic.hoursNote}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-5 py-5 text-[13px] text-white/40 sm:flex-row sm:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} {clinic.brand}, {clinic.name}.
          </p>
          <p>Ditenagai oleh {PLATFORM.name}</p>
        </div>
      </div>
    </footer>
  );
}
