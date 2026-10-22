import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/motion/Reveal";
import { mk, SectionTitle } from "@/components/marketing/ui";
import { servicesData } from "@/constants/data";

interface FokusLayananProps {
  /** Mode lengkap (halaman Layanan): foto + deskripsi. Mode ringkas (Beranda): daftar keluhan saja. */
  detailed?: boolean;
  className?: string;
}

export default function FokusLayanan({ detailed = false, className = "bg-white" }: FokusLayananProps) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionTitle
          eyebrow="Layanan"
          title={detailed ? "Tiga bidang fisioterapi" : "Keluhan yang kami tangani"}
          lead={detailed ? "Setiap bidang ditangani terapis yang memegang spesialisasinya. Anda bisa memilih terapis saat booking." : "Pilih bidang yang paling dekat dengan keluhan Anda. Terapis menyesuaikan penanganan setelah pemeriksaan."}
          action={
            !detailed && (
              <Link href="/layanan" className={mk.link}>
                Detail layanan <ArrowRight size={13} />
              </Link>
            )
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          {servicesData.map((service, i) => (
            <Reveal as="article" key={service.id} delay={i * 70} className={`${mk.card} group flex flex-col overflow-hidden`}>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                <Image src={service.imgSrc} alt={`Fisioterapi ${service.titleBold}`} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-brand-950 [&_svg]:h-[18px] [&_svg]:w-[18px]">{service.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-zinc-900">
                      {service.title} {service.titleBold}
                    </h3>
                    <p className="text-[12px] text-zinc-500">{service.subtitle}</p>
                  </div>
                </div>
                {detailed && <p className="text-[14px] leading-relaxed text-zinc-500">{service.desc}</p>}
                <ul className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-4">
                  {service.cases.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-[13px] text-zinc-700">
                      <Check size={13} weight="bold" className="shrink-0 text-zinc-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
