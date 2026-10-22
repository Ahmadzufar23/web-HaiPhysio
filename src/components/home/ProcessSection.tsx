import Reveal from "@/components/motion/Reveal";
import { mk, SectionTitle } from "@/components/marketing/ui";

// Alur sebenarnya: booking (/booking) → sesi di klinik (Detail Sesi terapis) → program video (/video-terapi)
const steps = [
  { title: "Booking online", desc: "Pilih layanan, paket, terapis, dan jam. Tandai area nyeri di peta tubuh." },
  { title: "Asesmen & terapi", desc: "Terapis memeriksa, menangani, lalu mencatat hasilnya di rekam medis Anda." },
  { title: "Latihan di rumah", desc: "Video latihan dari terapis muncul di akun. Tonton sampai habis untuk check-in harian." },
  { title: "Evaluasi berkala", desc: "Perkembangan nyeri dan catatan tiap kunjungan dipakai untuk menyesuaikan sesi berikutnya." },
];

export default function ProcessSection({ className = "bg-white" }: { className?: string }) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} flex flex-col gap-12`}>
        <SectionTitle eyebrow="Alur terapi" title="Perjalanan pemulihan Anda" lead="Dari janji temu pertama sampai Anda kembali bergerak bebas, setiap langkah didampingi terapis." />

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map(({ title, desc }, i) => (
            <Reveal as="li" key={title} delay={i * 60} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[13px] font-semibold tabular-nums text-brand-950">{i + 1}</span>
                {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-zinc-200 lg:block" aria-hidden />}
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
