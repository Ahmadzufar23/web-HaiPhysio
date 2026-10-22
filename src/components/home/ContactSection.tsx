import type { Icon } from "@phosphor-icons/react";
import { Clock, EnvelopeSimple, InstagramLogo, MapPin, NavigationArrow, Star, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import OpenStatus from "@/components/home/OpenStatus";
import { mk, SectionTitle } from "@/components/marketing/ui";
import { CLINIC, MAPS_EMBED_URL, MAPS_PLACE_URL } from "@/constants/clinic";

interface ContactSectionProps {
  title?: string;
  lead?: string;
  /** Halaman Kontak: judul section disembunyikan karena sudah ada PageIntro */
  hideHeading?: boolean;
  className?: string;
}

type Row = { icon: Icon; label: string; value: string; note?: string; href?: string };

const rows: Row[] = [
  { icon: WhatsappLogo, label: "WhatsApp", value: CLINIC.whatsapp.label, note: "Balasan cepat pada jam operasional", href: CLINIC.whatsapp.href },
  { icon: EnvelopeSimple, label: "Email", value: CLINIC.email.label, href: CLINIC.email.href },
  { icon: InstagramLogo, label: "Instagram", value: CLINIC.instagram.label, href: CLINIC.instagram.href },
  { icon: MapPin, label: "Alamat", value: CLINIC.name, note: CLINIC.address },
  { icon: Clock, label: "Jam operasional", value: CLINIC.hours, note: CLINIC.hoursNote },
];

/** Kontak + lokasi klinik: daftar kontak di kiri, peta di kanan. */
export default function ContactSection({
  title = "Kunjungi atau hubungi kami",
  lead = "Ada pertanyaan sebelum booking? Chat kami lewat WhatsApp pada jam operasional.",
  hideHeading = false,
  className = "bg-white",
}: ContactSectionProps) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        {!hideHeading && <SectionTitle eyebrow="Kontak & lokasi" title={title} lead={lead} />}

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`${mk.card} flex flex-col`}>
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 text-[13px] text-zinc-600">
              <OpenStatus />
            </div>
            <ul className="flex flex-1 flex-col divide-y divide-zinc-100">
              {rows.map(({ icon: RowIcon, label, value, note, href }) => {
                const external = href?.startsWith("http");
                const content = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600">
                      <RowIcon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-wide text-zinc-400">{label}</span>
                      <span className="block break-words text-[14px] font-medium text-zinc-900 underline-offset-4 group-hover:underline">{value}</span>
                      {note && <span className="block text-[13px] leading-relaxed text-zinc-500">{note}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="group flex items-start gap-3 px-5 py-4 hover:bg-zinc-50">
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3 px-5 py-4">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 p-5">
              <a href={MAPS_PLACE_URL} target="_blank" rel="noopener noreferrer" className={mk.btnPrimary}>
                <NavigationArrow size={15} weight="fill" />
                Petunjuk arah
              </a>
              <a href={MAPS_PLACE_URL} target="_blank" rel="noopener noreferrer" className={mk.btnSecondary}>
                <Star size={15} weight="fill" className="text-brand-600" />
                Ulasan di Google Maps
              </a>
            </div>
          </div>

          <div className="min-h-[360px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
            <iframe
              title="Peta lokasi Klinik Hai Physio"
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[360px] w-full grayscale-[30%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
