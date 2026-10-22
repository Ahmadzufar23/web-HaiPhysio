import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import OpenStatus from "@/components/home/OpenStatus";
import LogoWatermark from "@/components/shared/LogoWatermark";
import { BrandPhoto, mk } from "@/components/marketing/ui";
import { CLINIC } from "@/constants/clinic";

const FACTS = [
  { value: "1985", label: "Berdiri sebagai Klinik Pratama Condet Jaya" },
  { value: "3", label: "Bidang fisioterapi: muskuloskeletal, neuro, olahraga" },
  { value: "Homecare", label: "Terapis datang ke rumah bila diperlukan" },
  { value: "Digital", label: "Rekam medis & latihan rumah dalam satu akun" },
];

export default function HomeHero({ appointmentHref }: { appointmentHref: string }) {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      <LogoWatermark className="-left-28 -top-10 w-[460px]" opacity={0.05} rotate={-12} />

      <div className={`${mk.container} relative grid items-center gap-14 pb-20 pt-10 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-14`}>
        <div className="flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white py-1 pl-1.5 pr-3.5 text-[12px] font-medium text-zinc-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500">
              <Image src="/brand/logo-mark.png" alt="" width={14} height={16} className="h-auto w-[13px] brightness-0" />
            </span>
            Efektif & Progresif
          </span>

          <h1 className="text-balance text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-zinc-900 sm:text-[50px] lg:text-[58px]">Bergerak lagi tanpa nyeri, bersama Hai Physio.</h1>

          <p className="max-w-[500px] text-[16px] leading-relaxed text-zinc-500 md:text-[17px]">
            Klinik fisioterapi di Condet, Jakarta Timur, untuk nyeri otot dan sendi, gangguan saraf seperti pasca stroke, serta cedera olahraga. Ditangani fisioterapis bersertifikat, dipantau dari sesi ke sesi.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={appointmentHref} className={mk.btnPrimary}>
              Buat janji temu
              <ArrowRight size={15} weight="bold" />
            </Link>
            <a href={CLINIC.whatsapp.href} target="_blank" rel="noopener noreferrer" className={mk.btnSecondary}>
              <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
              Konsultasi via WhatsApp
            </a>
          </div>

          <div className="flex flex-col gap-1.5 text-[13px] text-zinc-500">
            <OpenStatus />
            <span className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-zinc-400" />
              {CLINIC.address}
            </span>
          </div>
        </div>

        <div className="relative mr-4 sm:mr-5">
          <BrandPhoto src="/hero-bg.png" alt="Fisioterapis Hai Physio menjelaskan hasil pemeriksaan kepada pasien" ratio="aspect-[5/4]" priority />
          <div className="absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl bg-white py-3 pl-3 pr-5 shadow-[0_20px_40px_-20px_rgb(24_24_27/0.35)] sm:-left-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950">
              <Image src="/brand/logo-mark.png" alt="" width={24} height={27} className="h-auto w-[22px]" />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-zinc-900">Sejak 1985</span>
              <span className="block text-[12px] text-zinc-500">Bagian dari {CLINIC.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pita brand */}
      <div className="relative overflow-hidden bg-brand-500">
        <LogoWatermark className="-right-10 -top-16 w-[260px]" opacity={0.12} rotate={-6} tone="ink" drift={false} />
        <dl className={`${mk.container} relative grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4`}>
          {FACTS.map((f) => (
            <div key={f.value} className="flex flex-col gap-1 pr-6">
              <dt className="order-2 text-[13px] leading-snug text-brand-950/70">{f.label}</dt>
              <dd className="order-1 text-[24px] font-semibold tracking-[-0.02em] text-brand-950">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
