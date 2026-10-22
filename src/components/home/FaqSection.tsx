import Link from "next/link";
import { CaretDown, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { mk, SectionTitle } from "@/components/marketing/ui";
import { CLINIC } from "@/constants/clinic";

// Hanya jawaban yang faktanya sudah pasti (alur di sistem & info klinik).
const faqs = [
  {
    q: "Berapa biaya terapi?",
    a: (
      <>
        Tarif per sesi untuk setiap paket tercantum di bagian{" "}
        <Link href="/#harga" className="text-zinc-900 underline underline-offset-2">
          Harga
        </Link>
        . Harga dikunci saat Anda booking dan dibayar di klinik. Untuk homecare, biaya menyesuaikan jarak.
      </>
    ),
  },
  { q: "Apakah bisa pakai BPJS atau asuransi?", a: "Ketentuan BPJS dan asuransi bisa ditanyakan langsung lewat WhatsApp sebelum booking." },
  { q: "Apakah harus punya akun untuk booking?", a: "Ya. Akun menyimpan jadwal, rekam medis per kunjungan, dan program latihan Anda, jadi semuanya bisa dilihat kapan saja." },
  { q: "Bisakah saya mengubah atau membatalkan jadwal?", a: "Bisa, paling lambat H-2 (dua hari sebelum jadwal) lewat menu Riwayat di akun Anda. Sesi yang dibatalkan kembali ke sisa paket. Booking baru bisa dibuat paling cepat H-1." },
  { q: "Apa itu program video dan check-in harian?", a: "Setelah sesi, terapis bisa mengirim video latihan beserta dosisnya ke akun Anda. Setiap kali video ditonton sampai habis, check-in hari itu tercatat dan terapis bisa melihat konsistensi latihan Anda." },
  { q: "Saya belum yakin keluhan saya termasuk layanan yang mana.", a: "Ceritakan keluhan Anda lewat WhatsApp pada jam operasional. Kami bantu arahkan ke layanan yang sesuai sebelum Anda booking." },
  { q: "Kapan klinik buka?", a: `${CLINIC.hours}. ${CLINIC.hoursNote}. Alamat: ${CLINIC.address}.` },
];

export default function FaqSection({ className = "bg-white" }: { className?: string }) {
  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <SectionTitle eyebrow="FAQ" title="Pertanyaan yang sering ditanyakan" />
          <div className={`${mk.card} flex flex-col items-start gap-3 p-5`}>
            <p className="text-[14px] font-semibold text-zinc-900">Pertanyaan Anda tidak ada di sini?</p>
            <p className="text-[13px] text-zinc-500">Tim kami membalas WhatsApp pada jam operasional.</p>
            <a href={CLINIC.whatsapp.href} target="_blank" rel="noopener noreferrer" className={mk.btnSecondary}>
              <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
              Chat via WhatsApp
            </a>
          </div>
        </div>

        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {faqs.map(({ q, a }) => (
            <li key={q}>
              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-medium text-zinc-900">
                  {q}
                  <CaretDown size={14} className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="-mt-1 pb-5 pr-8 text-[14px] leading-relaxed text-zinc-500">{a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
