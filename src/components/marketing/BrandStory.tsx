import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/motion/Reveal";
import { reasonsData } from "@/constants/data";
import { CLINIC } from "@/constants/clinic";
import { Eyebrow, mk } from "./ui";

const VALUES = [
  { word: "Efektif", desc: "Diperiksa dulu sebelum diterapi, supaya penanganan menyasar penyebab nyeri, bukan sekadar meredakan." },
  { word: "Progresif", desc: "Setiap sesi dicatat dan dievaluasi, latihan di rumah ditingkatkan bertahap sesuai kemajuan Anda." },
];

/** Identitas Hai Physio: logo, motto, dan prinsip kerja. */
export default function BrandStory({ showMoreLink = false, className = "bg-white" }: { showMoreLink?: boolean; className?: string }) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
        {/* Panel logo */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-8 sm:p-12 lg:sticky lg:top-28">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500" aria-hidden />
          <Image src="/fisio_nobg.png" alt="Logo Hai Physio, Efektif & Progresif" width={2048} height={1344} className="relative mx-auto h-auto w-full max-w-[340px]" />
          <div className="relative mt-8 border-t border-zinc-200 pt-6 text-[13px] leading-relaxed text-zinc-500">
            Layanan fisioterapi di bawah <span className="font-medium text-zinc-800">{CLINIC.name}</span>, berdiri sejak 1985 di Condet, Jakarta Timur.
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Eyebrow>Tentang Hai Physio</Eyebrow>
            <h2 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-zinc-900 md:text-[36px]">Motto kami adalah cara kami bekerja.</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.word} className="rounded-2xl bg-zinc-950 p-6">
                <p className="text-[22px] font-semibold tracking-[-0.02em] text-brand-500">{v.word}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/70">{v.desc}</p>
              </div>
            ))}
          </div>

          <ol className="flex flex-col divide-y divide-zinc-200 border-y border-zinc-200">
            {reasonsData.map((reason, i) => (
              <Reveal as="li" key={reason.id} delay={i * 70} className="flex gap-5 py-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[12px] font-semibold text-brand-950">{i + 1}</span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[15px] font-semibold text-zinc-900">{reason.title}</h3>
                  <p className="text-[14px] leading-relaxed text-zinc-500">{reason.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          {showMoreLink && (
            <Link href="/tentang-kami" className={mk.link}>
              Selengkapnya tentang kami <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
