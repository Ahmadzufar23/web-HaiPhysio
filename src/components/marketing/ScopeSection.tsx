import Reveal from "@/components/motion/Reveal";
import { jenisPelayananData } from "@/constants/data";
import { mk, SectionTitle } from "./ui";

/** Ruang lingkup fisioterapi: promotif, preventif, kuratif, rehabilitatif. */
export default function ScopeSection({ className = "bg-zinc-50" }: { className?: string }) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionTitle eyebrow="Ruang lingkup" title="Dari pencegahan sampai pemulihan" lead="Fisioterapi tidak hanya untuk saat sudah sakit. Kami menangani empat tahap berikut." />
        <div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
          {jenisPelayananData.map((item, i) => (
            <Reveal key={item.id} delay={i * 60} className="flex flex-col gap-3 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 [&_svg]:h-[18px] [&_svg]:w-[18px]">{item.icon}</span>
              <h3 className="text-[15px] font-semibold text-zinc-900">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
