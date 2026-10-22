"use client";

import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";
import { PageIntro, mk } from "@/components/marketing/ui";
import ContactSection from "@/components/home/ContactSection";
import FaqSection from "@/components/home/FaqSection";
import { CLINIC } from "@/constants/clinic";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function KontakKami() {
  const { appointmentHref } = useAuthStatus();

  return (
    <div className="flex w-full flex-col">
      <PageIntro
        crumb="Kontak Kami"
        title="Kami siap membantu pemulihan Anda"
        lead={`Tanyakan keluhan, tarif, atau jadwal lewat WhatsApp. ${CLINIC.hours}, ${CLINIC.hoursNote.toLowerCase()}.`}
        image={{ src: "/ruangan-klinik.png", alt: "Ruang latihan dan terapi klinik" }}
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <a href={CLINIC.whatsapp.href} target="_blank" rel="noopener noreferrer" className={mk.btnPrimary}>
            <WhatsappLogo size={16} weight="fill" />
            Chat WhatsApp
          </a>
          <Link href={appointmentHref} className={mk.btnSecondary}>
            Booking online <ArrowRight size={14} />
          </Link>
        </div>
      </PageIntro>
      <ContactSection hideHeading className="bg-zinc-50" />
      <FaqSection />
    </div>
  );
}
