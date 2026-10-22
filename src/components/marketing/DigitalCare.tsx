import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import BodyMap from "@/components/bodymap/BodyMap";
import { Eyebrow, mk } from "./ui";

// Fitur di sini semuanya sudah berjalan di sistem. Mockup HP meniru langkah peta nyeri di /booking.
const POINTS = [
  { title: "Booking & pilih terapis online", desc: "Jam kosong setiap terapis terlihat langsung." },
  { title: "Rekam medis tiap kunjungan", desc: "Diagnosis, catatan, dan latihan bisa Anda baca kapan saja." },
  { title: "Video latihan dari terapis", desc: "Gerakan di rumah sama dengan yang diajarkan di klinik." },
  { title: "Check-in harian & grafik nyeri", desc: "Terapis memantau konsistensi dan perkembangan Anda." },
];

const PAIN_POINTS = ["bahu-kanan", "punggung-bawah-kanan", "lutut-kiri"];
const PAIN_LABELS = ["Bahu kanan", "Punggung bawah kanan", "Lutut kiri"];

/**
 * iPhone dengan proporsi asli (±1 : 2,06, layar 393×852 pt) berisi layar peta nyeri
 * saat booking. Ilustrasi statis memakai komponen BodyMap yang sama dengan sistem.
 */
function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[600px] w-[292px] sm:h-[640px] sm:w-[311px]" aria-hidden>
      {/* Tombol samping */}
      <span className="absolute -left-[3px] top-[118px] h-[30px] w-[3px] rounded-l bg-zinc-700" />
      <span className="absolute -left-[3px] top-[166px] h-[54px] w-[3px] rounded-l bg-zinc-700" />
      <span className="absolute -left-[3px] top-[230px] h-[54px] w-[3px] rounded-l bg-zinc-700" />
      <span className="absolute -right-[3px] top-[184px] h-[84px] w-[3px] rounded-r bg-zinc-700" />

      {/* Bingkai titanium + bezel */}
      <div className="h-full w-full rounded-[54px] bg-gradient-to-b from-zinc-600 to-zinc-800 p-[3px] shadow-[0_50px_100px_-30px_rgb(0_0_0/0.85)]">
        <div className="h-full w-full rounded-[51px] bg-black p-[9px]">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[43px] bg-white">
            {/* Status bar + Dynamic Island */}
            <div className="relative flex h-[46px] shrink-0 items-center justify-between px-7 pt-1 text-[12px] font-semibold text-zinc-950">
              <span>9:41</span>
              <span className="absolute left-1/2 top-[10px] h-[27px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1">
                <span className="flex h-[9px] items-end gap-[1.5px]">
                  {[4, 6, 8, 10].map((h) => (
                    <span key={h} className="w-[2.5px] rounded-[1px] bg-zinc-950" style={{ height: h }} />
                  ))}
                </span>
                <span className="ml-1 flex h-[11px] w-[22px] items-center rounded-[3px] border border-zinc-950/40 p-[1.5px]">
                  <span className="h-full w-[80%] rounded-[1.5px] bg-zinc-950" />
                </span>
              </span>
            </div>

            {/* Header aplikasi */}
            <div className="flex items-center gap-2 px-5 pb-3 pt-1">
              <Image src="/brand/logo-mark.png" alt="" width={18} height={20} className="h-auto w-[15px]" />
              <span className="text-[12px] font-semibold text-zinc-900">Hai Physio</span>
              <span className="ml-auto text-[10px] text-zinc-400">Langkah 3 dari 4</span>
            </div>
            <div className="px-5">
              <p className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-zinc-950">Di mana terasa nyeri?</p>
              <p className="mt-1 text-[11px] text-zinc-500">Ketuk otot yang nyeri. Terapis membacanya sebelum sesi.</p>
            </div>

            {/* Peta anatomi depan & belakang */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-50 px-3 pb-2 pt-3">
              {(["front", "back"] as const).map((view) => (
                <div key={view} className="flex flex-col items-center gap-1">
                  <BodyMap view={view} selected={PAIN_POINTS} dots="selected" className="w-full" />
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400">{view === "front" ? "Depan" : "Belakang"}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 px-5 pt-3">
              {PAIN_LABELS.map((l) => (
                <span key={l} className="rounded-md border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700">
                  {l}
                </span>
              ))}
            </div>

            <div className="px-5 pt-3">
              <p className="text-[10px] font-medium text-zinc-600">Tingkat nyeri</p>
              <div className="mt-1.5 grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`rounded-md py-1 text-center text-[11px] font-semibold ${n === 3 ? "bg-zinc-950 text-white" : n < 3 ? "bg-brand-500 text-brand-950" : "border border-zinc-200 text-zinc-400"}`}>
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto px-5 pb-3">
              <span className="flex h-10 items-center justify-center rounded-xl bg-brand-500 text-[12px] font-semibold text-brand-950">Lanjut ke konfirmasi</span>
              {/* Home indicator */}
              <span className="mx-auto mt-3 block h-[5px] w-[120px] rounded-full bg-zinc-950" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nilai tambah sistem digital, diringkas dalam satu section (company profile tetap fokus ke klinik). */
export default function DigitalCare({ appointmentHref }: { appointmentHref: string }) {
  return (
    <section className={`${mk.section} relative overflow-hidden bg-zinc-950`}>
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
      <div className={`${mk.container} relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Eyebrow tone="dark">Pendampingan digital</Eyebrow>
            <h2 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-white md:text-[36px]">Terapis Anda tetap mendampingi, bahkan saat Anda di rumah.</h2>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-white/60">
              Pasien Hai Physio mendapat akun pribadi. Jadwal, catatan terapi, dan program latihan tersimpan di satu tempat, jadi pemulihan tidak berhenti di ruang praktik.
            </p>
          </div>

          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-brand-950">
                  <Check size={12} weight="bold" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-white">{p.title}</span>
                  <span className="block text-[13px] leading-relaxed text-white/55">{p.desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link href={appointmentHref} className={mk.btnPrimary}>
              Mulai dengan booking <ArrowRight size={15} weight="bold" />
            </Link>
            <Link href="/layanan#perbedaan" className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-[14px] font-medium text-white hover:bg-white/10">
              Bandingkan dengan fisioterapi umumnya
            </Link>
          </div>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}
