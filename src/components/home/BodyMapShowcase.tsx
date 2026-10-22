"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "@phosphor-icons/react";
import BodyMapPicker from "@/components/bodymap/BodyMapPicker";
import { savePainDraft } from "@/lib/painNotes";
import { Eyebrow, mk } from "@/components/marketing/ui";

const benefits = ["Tandai titik nyeri dan seberapa sakitnya", "Ikut tersimpan bersama data booking Anda", "Terapis membacanya sebelum sesi dimulai"];

/** Demo body map interaktif di Beranda. Pilihan dibawa ke form booking (langkah isi data). */
export default function BodyMapShowcase({ appointmentHref }: { appointmentHref: string }) {
  const router = useRouter();
  const [points, setPoints] = useState<string[]>(["bahu-kanan", "lutut-kiri"]);

  const continueToBooking = () => {
    savePainDraft(points);
    router.push(appointmentHref);
  };

  return (
    <section className={`${mk.section} bg-white`}>
      <div className={mk.container}>
        <div className="grid gap-10 rounded-3xl bg-zinc-950 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:p-12">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow tone="dark">Coba sekarang</Eyebrow>
            <h2 className="max-w-[16ch] text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-white md:text-[34px]">Tunjukkan bagian yang nyeri, langsung di peta tubuh.</h2>
            <p className="max-w-[440px] text-[15px] leading-relaxed text-white/60">
              Ketuk otot yang terasa nyeri. Pilihan Anda ikut terbawa ke form booking, jadi tidak perlu menjelaskan ulang dari awal.
            </p>
            <ul className="flex flex-col gap-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[14px] text-white/75">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-300">
                    <Check size={11} weight="bold" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={continueToBooking}
              disabled={points.length === 0}
              className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-[14px] font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Booking dengan area ini
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-7">
            <BodyMapPicker selected={points} onChange={setPoints} tone="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
