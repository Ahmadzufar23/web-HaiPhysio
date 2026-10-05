"use client";

import { MapPin, NavigationArrow, Clock } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";

const MAPS_QUERY = "Klinik%20Fisioterapi%20Hai%20Physio";

export default function LocationMap() {
  return (
    <section className="w-full bg-white pb-24 md:pb-32">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-5 md:px-8 lg:px-10 xl:px-[80px]">
        <SectionHeading eyebrow="Lokasi" title="Mudah dijangkau di" accent="Condet." />

        <Reveal variant="scale" className="relative w-full overflow-hidden rounded-[32px] border border-brand-900/[0.07] shadow-[0_40px_80px_-40px_rgb(26_24_20/0.4)]">
          {/* Peta: sedikit desaturasi agar menyatu dengan palet kuning-putih */}
          <div className="h-[420px] w-full bg-brand-50 md:h-[560px]">
            <iframe
              title="Peta lokasi Klinik Hai Physio"
              src={`https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full grayscale-[35%] contrast-[1.05]"
            />
          </div>

          {/* Kartu alamat melayang */}
          <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:bottom-8 md:left-8 md:w-[380px]">
            <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_30px_60px_-24px_rgb(26_24_20/0.45)] backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-brand-950">
                  <MapPin size={22} weight="fill" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-semibold text-brand-900">Klinik Pratama Condet Jaya</span>
                  <p className="text-[14px] leading-relaxed text-brand-900/70">
                    Jl. Condet Raya No. 18, Batu Ampar, Kramat Jati, Jakarta Timur 13520
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-900/[0.07] pt-4">
                <span className="flex items-center gap-2 text-[13px] text-brand-900/60">
                  <Clock size={16} weight="bold" /> Sen–Sab · 08.00–16.00
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <NavigationArrow size={16} weight="fill" />
                  Petunjuk arah
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
