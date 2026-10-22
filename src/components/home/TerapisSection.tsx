"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import Reveal from "@/components/motion/Reveal";
import { mk, SectionTitle } from "@/components/marketing/ui";
import { bookingService } from "@/services/bookingService";
import { initials } from "@/lib/format";
import type { FocusArea, PublicTherapist } from "@/types/api.types";

// Endpoint publik terapis wajib pakai focus_id, jadi ambil per layanan lalu gabungkan.
async function fetchAllTherapists(): Promise<PublicTherapist[]> {
  const focusRes = await bookingService.getFocusAreas();
  const focusAreas: FocusArea[] = focusRes.data?.focusAreas ?? [];
  const lists = await Promise.all(focusAreas.map((f) => bookingService.getTherapists(f.id).then((r) => (r.data?.therapists ?? []) as PublicTherapist[])));
  const byId = new Map<string, PublicTherapist>();
  // Pengaman: jangan tampilkan akun uji coba (mis. "Citra Fisio Test2") di halaman publik
  lists
    .flat()
    .filter((t) => !/\btest\d*\b/i.test(t.fullName))
    .forEach((t) => byId.set(t.id, t));
  return [...byId.values()];
}

/** Daftar fisioterapis aktif. Section disembunyikan bila data kosong atau API gagal. */
export default function TerapisSection({ appointmentHref, className = "bg-zinc-50" }: { appointmentHref: string; className?: string }) {
  const [therapists, setTherapists] = useState<PublicTherapist[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchAllTherapists()
      .then((list) => active && setTherapists(list))
      .catch(() => active && setTherapists([]));
    return () => {
      active = false;
    };
  }, []);

  if (therapists !== null && therapists.length === 0) return null;

  return (
    <section className={`${mk.section} ${className}`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionTitle
          eyebrow="Tim terapis"
          title="Fisioterapis yang menangani Anda"
          lead="Lihat jadwal kosong setiap terapis dan pilih sendiri saat booking."
          action={
            <Link href={appointmentHref} className={mk.link}>
              Pilih jadwal terapis <ArrowRight size={13} />
            </Link>
          }
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {therapists === null
            ? Array.from({ length: 4 }, (_, i) => <li key={i} className="h-[92px] animate-pulse rounded-2xl bg-zinc-100" aria-hidden />)
            : therapists.map((t, i) => (
                <Reveal as="li" key={t.id} delay={i * 60} className={`${mk.card} flex items-center gap-4 p-5`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-500 text-[14px] font-semibold text-brand-950">
                    {t.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt={t.fullName} className="h-full w-full object-cover" />
                    ) : (
                      initials(t.fullName)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-snug text-zinc-900">{t.fullName}</span>
                    <span className="block text-[12px] text-zinc-500">{t.specializations.map((s) => s.name).join(", ") || "Fisioterapis"}</span>
                    {t.totalPatientsLabel && <span className="mt-1 block text-[11px] text-zinc-400">{t.totalPatientsLabel}</span>}
                  </span>
                </Reveal>
              ))}
        </ul>
      </div>
    </section>
  );
}
