import Marquee from "@/components/motion/Marquee";
import { servicesData } from "@/constants/data";

// Daftar kasus diambil dari data layanan (SSOT) + beberapa keluhan umum
const conditions = [
  ...servicesData.flatMap((s) => s.cases),
  "Nyeri Leher & Bahu",
  "Pemulihan Pasca Operasi",
  "Gangguan Keseimbangan",
];

/** Pita bergerak berisi keluhan yang ditangani klinik. */
export default function ConditionsMarquee() {
  return (
    <section aria-label="Keluhan yang kami tangani" className="w-full border-y border-brand-900/[0.07] bg-brand-50/60 py-7 md:py-9">
      <Marquee
        duration={55}
        items={conditions.map((c, i) => (
          <span key={c} className={`whitespace-nowrap text-[26px] tracking-[-0.02em] md:text-[38px] ${i % 2 ? "font-display italic text-gold-700" : "font-semibold text-brand-900"}`}>
            {c}
          </span>
        ))}
        separator={
          // Pemisah antar kasus = figur logo Hai Physio
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/logo-mark.png" alt="" aria-hidden="true" width={30} height={33} className="h-[30px] w-auto shrink-0 md:h-[38px]" />
        }
      />
    </section>
  );
}
