import Image from "next/image";
import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import { mk, SectionTitle } from "./ui";

const ROWS: { label: string; us: string; usual: string | null }[] = [
  { label: "Membuat janji", us: "Online 24 jam, pilih terapis & jam sendiri", usual: "Telepon atau datang langsung" },
  { label: "Keluhan awal", us: "Peta nyeri & skala nyeri diisi sebelum datang", usual: "Diceritakan ulang di ruang praktik" },
  { label: "Catatan terapi", us: "Bisa dibaca pasien untuk setiap kunjungan", usual: "Tersimpan di berkas klinik" },
  { label: "Latihan di rumah", us: "Video dari terapis + dosis yang jelas", usual: "Penjelasan lisan atau lembar kertas" },
  { label: "Pemantauan latihan", us: "Check-in harian terlihat oleh terapis", usual: null },
  { label: "Perkembangan nyeri", us: "Grafik dari kunjungan ke kunjungan", usual: null },
  { label: "Harga", us: "Tarif paket tampil sebelum booking", usual: "Biasanya diketahui di kasir" },
];

/** Perbandingan dengan alur fisioterapi pada umumnya (tanpa menyebut pihak lain). */
export default function ComparisonSection({ className = "bg-zinc-50" }: { className?: string }) {
  return (
    <section id="perbedaan" className={`${mk.section} ${className} scroll-mt-24`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionTitle eyebrow="Perbedaannya" title="Lebih dari sekadar sesi terapi" lead="Perbandingan alur di Hai Physio dengan fisioterapi pada umumnya." />
        <div className={`${mk.card} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                <th className="w-[26%] px-5 py-3.5 font-medium" />
                <th className="w-[40%] bg-brand-500 px-5 py-3.5 font-semibold text-brand-950">
                  <span className="inline-flex items-center gap-2">
                    <Image src="/brand/logo-mark.png" alt="" width={16} height={18} className="h-auto w-[14px] brightness-0" />
                    Hai Physio
                  </span>
                </th>
                <th className="px-5 py-3.5 font-medium">Pada umumnya</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-zinc-100 last:border-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-zinc-900">{r.label}</td>
                  <td className="px-5 py-3.5 text-[13px] text-zinc-800">
                    <span className="flex items-start gap-2">
                      <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-zinc-900" />
                      {r.us}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-zinc-400">
                    {r.usual ?? (
                      <span className="inline-flex items-center gap-2">
                        <Minus size={14} /> Jarang tersedia
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
