"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Printer } from "@phosphor-icons/react";
import RiwayatBooking from "@/components/profile/RiwayatBooking";
import RekamMedisCard from "@/components/profile/RekamMedisCard";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import { ui } from "@/components/booking/BookingUI";
import { bookingService } from "@/services/bookingService";
import { clinicService } from "@/services/clinicService";
import ProgressPanel from "@/components/shared/ProgressChart";
import { PAIN_SCALE_MAX } from "@/constants/painScale";
import { formatDate } from "@/lib/format";
import type { PatientBooking, PatientPackage, ProgressPoint } from "@/types/api.types";

/** Batang kecil tingkat nyeri per kunjungan selesai (dari isian pasien saat booking) */
function PainTrend({ levels }: { levels: number[] }) {
  if (levels.length === 0) return <p className="mt-1 text-[15px] font-semibold text-zinc-300">—</p>;
  const first = levels[0];
  const last = levels[levels.length - 1];
  return (
    <div className="mt-1 flex items-end justify-between gap-3">
      <p className="text-[15px] font-semibold tabular-nums text-zinc-900">
        {levels.length > 1 ? (
          <>
            {first} <span className="text-zinc-400">→</span> {last}
          </>
        ) : (
          last
        )}
        <span className="text-[12px] font-normal text-zinc-400">/{PAIN_SCALE_MAX}</span>
      </p>
      {levels.length > 1 && (
      <div className="flex h-7 items-end gap-[3px]" aria-hidden>
        {levels.slice(-10).map((l, i, arr) => (
          <span key={i} className={`w-[5px] rounded-sm ${i === arr.length - 1 ? "bg-zinc-900" : "bg-zinc-300"}`} style={{ height: `${(l / PAIN_SCALE_MAX) * 100}%` }} />
        ))}
      </div>
      )}
    </div>
  );
}

export default function RiwayatBookingPage() {
  const [bookings, setBookings] = useState<PatientBooking[] | null>(null);
  const [packages, setPackages] = useState<PatientPackage[]>([]);
  const [progress, setProgress] = useState<ProgressPoint[]>([]);

  const load = useCallback(
    () =>
      Promise.all([
        bookingService.getRiwayatBooking().then((res) => setBookings(res.data?.bookings ?? [])),
        // Kuota paket berubah setiap batal / booking, jadi dimuat ulang bersama riwayat
        bookingService.getMyPackages().then((res) => setPackages(res.data.packages)),
        clinicService.getMyProgress().then((res) => setProgress(res.data.progress)),
      ]).catch((error) => {
        if (error?.response?.status === 401) window.location.href = "/login";
        else setBookings((prev) => prev ?? []);
      }),
    []
  );

  useEffect(() => {
    void load();
  }, [load]);

  const list = bookings ?? [];
  const done = list.filter((b) => b.bookingStatus === "Selesai").sort((a, b) => `${a.bookingDate}${a.bookingTime}`.localeCompare(`${b.bookingDate}${b.bookingTime}`));
  const upcomingCount = list.filter((b) => b.bookingStatus === "Terkonfirmasi").length;
  const openPackages = packages.filter((p) => p.remaining > 0);
  const lastVisit = done[done.length - 1];
  const painLevels = done.map((b) => b.painLevel).filter((l): l is number => l !== null);

  const stats = [
    { label: "Sesi selesai", value: String(done.length) },
    { label: "Akan datang", value: String(upcomingCount) },
    { label: "Terapi terakhir", value: lastVisit ? formatDate(lastVisit.bookingDate) : "—" },
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        <PatientPageHeader
          crumbs={[{ label: "Beranda", href: "/" }, { label: "Akun", href: "/profil" }, { label: "Riwayat terapi" }]}
          title="Riwayat terapi"
          aside={
            <Link href="/booking" className={ui.btnPrimary}>
              <Plus size={13} />
              Buat janji temu
            </Link>
          }
        />

        {/* Ringkasan perjalanan terapi */}
        <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-3.5">
              <p className="text-[11px] text-zinc-500">{s.label}</p>
              <p className={`mt-1 text-[15px] font-semibold tabular-nums ${bookings === null ? "text-zinc-300" : "text-zinc-900"}`}>{bookings === null ? "–" : s.value}</p>
            </div>
          ))}
          <div className="bg-white px-4 py-3.5">
            <p className="text-[11px] text-zinc-500">Tingkat nyeri</p>
            <PainTrend levels={painLevels} />
          </div>
        </div>

        {openPackages.length > 0 && (
          <section className="mb-6 rounded-xl border border-zinc-200 bg-white" aria-labelledby="paket-title">
            <header className="border-b border-zinc-100 px-4 py-3">
              <h2 id="paket-title" className="text-[13px] font-semibold text-zinc-900">
                Sesi paket belum dijadwalkan
              </h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">Sesi yang dibatalkan paling lambat H-2 kembali ke sini.</p>
            </header>
            <ul className="divide-y divide-zinc-100">
              {openPackages.map((p) => (
                <li key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900">
                      {p.packageName}
                      {p.focusArea?.name && <span className="font-normal text-zinc-500"> · Fisioterapi {p.focusArea.name}</span>}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      {p.completed} selesai · {p.scheduled} terjadwal · <strong className="font-medium text-zinc-800">{p.remaining} belum dijadwalkan</strong> dari {p.totalSessions} sesi
                    </p>
                  </div>
                  <Link href={`/booking?paket=${p.id}`} className={ui.btnSecondary}>
                    Jadwalkan sisa sesi
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {progress.length > 0 && (
          <section className="mb-6 rounded-xl border border-zinc-200 bg-white" aria-labelledby="progres-title">
            <header className="border-b border-zinc-100 px-4 py-3">
              <h2 id="progres-title" className="text-[13px] font-semibold text-zinc-900">
                Progres pemulihan
              </h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">Diukur terapis di setiap sesi: nyeri (0–10) dan lingkup gerak sendi.</p>
            </header>
            <div className="p-4">
              <ProgressPanel points={progress} />
            </div>
          </section>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <RiwayatBooking bookings={bookings} onChanged={load} />
          <aside className="lg:sticky lg:top-[96px]">
            <RekamMedisCard />
            <Link href="/rekam-medis/cetak" className={`${ui.btnSecondary} mt-3 w-full`}>
              <Printer size={13} />
              Cetak / unduh PDF rekam medis
            </Link>
            <p className="mt-3 px-1 text-[11px] leading-relaxed text-zinc-500">
              Rekam medis ini selalu versi terbaru. Catatan tiap kunjungan tersimpan di riwayat, buka kunjungan untuk melihatnya.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
