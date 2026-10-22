"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, House, WhatsappLogo } from "@phosphor-icons/react";
import { clinicService } from "@/services/clinicService";
import { formatRupiah } from "@/lib/format";
import { CLINIC } from "@/constants/clinic";
import type { TherapyPackage } from "@/types/api.types";
import { mk, SectionTitle } from "./ui";

// Didapat setiap paket; semuanya fitur yang memang berjalan di sistem
const INCLUDED = ["Asesmen & evaluasi tiap sesi", "Rekam medis digital per kunjungan", "Program video latihan di rumah", "Ubah jadwal online (maks. H-2)"];

/** Harga paket sesuai tarif yang diatur owner (GET /api/packages). Harga kosong = belum diumumkan. */
export default function PricingSection({ appointmentHref, className = "bg-white" }: { appointmentHref: string; className?: string }) {
  const [packages, setPackages] = useState<TherapyPackage[] | null>(null);

  useEffect(() => {
    clinicService
      .getPackages()
      .then((res) => setPackages(res.data.packages))
      .catch(() => setPackages([]));
  }, []);

  const list = packages ?? [];
  const clinicPackages = list.filter((p) => !p.isHomeVisit);
  const homecare = list.find((p) => p.isHomeVisit);
  const visitPrice = list.find((p) => p.totalSessions === 1 && !p.isHomeVisit)?.pricePerSession ?? null;

  const savingOf = (p: TherapyPackage) =>
    visitPrice && p.pricePerSession !== null && (p.totalSessions ?? 1) > 1 && p.pricePerSession < visitPrice ? Math.round((1 - p.pricePerSession / visitPrice) * 100) : 0;
  const bestId = clinicPackages.reduce<{ id: string | null; saving: number }>((best, p) => (savingOf(p) > best.saving ? { id: p.id, saving: savingOf(p) } : best), { id: null, saving: 0 }).id;
  const anyPrice = list.some((p) => p.pricePerSession !== null);

  return (
    <section id="harga" className={`${mk.section} ${className} scroll-mt-24`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionTitle
          eyebrow="Harga"
          title="Harga paket yang jelas sejak awal"
          lead="Pilih per kunjungan atau paket beberapa sesi. Harga per sesi dikunci saat Anda booking, pembayaran dilakukan di klinik."
        />

        {packages === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[380px] animate-pulse rounded-2xl bg-zinc-100" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="text-[14px] text-zinc-500">Informasi harga belum bisa dimuat. Tanyakan langsung lewat WhatsApp.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {clinicPackages.map((p) => {
                const best = p.id === bestId;
                const saving = savingOf(p);
                const sessions = p.totalSessions ?? 1;
                return (
                  <article key={p.id} className={`relative flex flex-col rounded-2xl border bg-white p-6 ${best ? "border-brand-500 ring-1 ring-brand-500 shadow-[0_24px_48px_-28px_rgb(24_24_27/0.45)]" : "border-zinc-200"}`}>
                    {best && <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-brand-950">Paling hemat</span>}
                    <h3 className="text-[15px] font-semibold text-zinc-900">{p.name}</h3>
                    <p className="text-[13px] text-zinc-500">{sessions === 1 ? "Satu kali kunjungan" : `${sessions} sesi terapi · 1 jam per sesi`}</p>

                    <div className="mt-6 min-h-[76px]">
                      {p.pricePerSession !== null ? (
                        <>
                          <p className="flex items-baseline gap-1">
                            <span className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-zinc-900">{formatRupiah(p.pricePerSession)}</span>
                            <span className="text-[13px] text-zinc-500">/ sesi</span>
                          </p>
                          {sessions > 1 && <p className="mt-1 text-[13px] text-zinc-500">Total {formatRupiah(p.pricePerSession * sessions)}</p>}
                          {saving > 0 && <p className="mt-1 text-[12px] font-medium text-zinc-900">Hemat {saving}% per sesi dibanding Visit</p>}
                        </>
                      ) : (
                        <>
                          <p className="text-[18px] font-semibold text-zinc-900">Segera diumumkan</p>
                          <p className="mt-1 text-[13px] text-zinc-500">Tanyakan tarif terbaru lewat WhatsApp.</p>
                        </>
                      )}
                    </div>

                    <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-zinc-100 pt-5">
                      {INCLUDED.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-600">
                          <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-zinc-900" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={appointmentHref} className={`mt-6 ${best ? mk.btnPrimary : mk.btnSecondary} w-full`}>
                      Pilih {p.name}
                    </Link>
                  </article>
                );
              })}
            </div>

            {homecare && (
              <div className={`${mk.card} flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between`}>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-brand-950">
                    <House size={18} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-zinc-900">{homecare.name}</h3>
                    <p className="mt-0.5 max-w-[520px] text-[13px] leading-relaxed text-zinc-500">
                      Fisioterapis datang ke rumah untuk pasien yang sulit bepergian, misalnya pasca stroke atau pasca operasi. Fitur rekam medis dan program video tetap berlaku.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                  <p className="text-[15px] font-semibold text-zinc-900">
                    {homecare.pricePerSession !== null ? `Mulai ${formatRupiah(homecare.pricePerSession)} / sesi` : "Menyesuaikan jarak"}
                  </p>
                  <a href={CLINIC.whatsapp.href} target="_blank" rel="noopener noreferrer" className={mk.btnSecondary}>
                    <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
                    Tanya jadwal homecare
                  </a>
                </div>
              </div>
            )}

            <p className="text-[12px] text-zinc-400">
              {anyPrice ? "Harga dapat berubah sewaktu-waktu; harga yang berlaku adalah harga saat Anda booking." : "Tarif sedang diperbarui. Booking tetap bisa dilakukan, harga dikonfirmasi klinik."}{" "}
              <Link href={appointmentHref} className="inline-flex items-center gap-1 text-zinc-600 underline-offset-2 hover:underline">
                Mulai booking <ArrowRight size={11} />
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
