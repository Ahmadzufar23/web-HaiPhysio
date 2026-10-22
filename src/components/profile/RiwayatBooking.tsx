"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown, Check } from "@phosphor-icons/react";
import BodyMap from "@/components/bodymap/BodyMap";
import ModalCancelBooking from "@/components/profile/ModalCancelBooking";
import { BODY_REGIONS, regionLabel } from "@/constants/bodyRegions";
import { painLabel, PAIN_SCALE_MAX } from "@/constants/painScale";
import { parsePainNotes } from "@/lib/painNotes";
import { formatClock, formatLongDate, formatSlotTime } from "@/lib/format";
import type { BookingStatus, PatientBooking } from "@/types/api.types";

const monthShort = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", month: "short" });
const noon = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00Z`);

const STATUS: Record<BookingStatus, { label: string; cls: string; dot?: string }> = {
  Terkonfirmasi: { label: "Terjadwal", cls: "border-zinc-300 text-zinc-800", dot: "bg-brand-500" },
  Berlangsung: { label: "Berlangsung", cls: "border-zinc-900 text-zinc-900", dot: "bg-zinc-900 animate-pulse" },
  Selesai: { label: "Selesai", cls: "border-transparent bg-zinc-100 text-zinc-700" },
  Dibatalkan: { label: "Dibatalkan", cls: "border-red-200 text-red-700" },
  "Tidak Hadir": { label: "Tidak hadir", cls: "border-red-200 text-red-700" },
};

export function PatientStatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${s.cls}`}>
      {s.dot ? <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden /> : status === "Selesai" ? <Check size={10} weight="bold" /> : null}
      {s.label}
    </span>
  );
}

/** Blok tanggal di kiri linimasa */
function DateBlock({ date, muted }: { date: string; muted?: boolean }) {
  return (
    <div className={`flex w-12 shrink-0 flex-col items-center self-start rounded-lg border py-1.5 ${muted ? "border-zinc-200 bg-white" : "border-zinc-900 bg-zinc-900 text-white"}`}>
      <span className={`text-[10px] uppercase tracking-wide ${muted ? "text-zinc-400" : "text-white/60"}`}>{monthShort.format(noon(date))}</span>
      <span className={`text-[17px] font-semibold leading-tight tabular-nums ${muted ? "text-zinc-900" : ""}`}>{Number(date.slice(8, 10))}</span>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <div className="mt-1 text-[13px] leading-relaxed text-zinc-800">{children}</div>
    </div>
  );
}

const Text = ({ value }: { value: string | null }) => (value ? <p className="whitespace-pre-line">{value}</p> : <p className="text-zinc-400">—</p>);

function MiniBodyMap({ patient, therapist }: { patient: string[]; therapist: string[] }) {
  const all = [...patient, ...therapist];
  const views = (["front", "back"] as const).filter((v) => BODY_REGIONS.some((r) => all.includes(r.id) && r.views.includes(v)));
  if (views.length === 0) return null;
  return (
    <div className="flex gap-2">
      {views.map((view) => (
        <div key={view} className="flex w-[64px] flex-col items-center gap-1">
          <BodyMap view={view} selected={patient} marked={therapist} dots="none" />
          <span className="text-[10px] text-zinc-400">{view === "front" ? "Depan" : "Belakang"}</span>
        </div>
      ))}
    </div>
  );
}

/** Satu kunjungan: ringkas, bisa dibuka untuk melihat keluhan & catatan terapis */
function VisitItem({ b, last, onCancel }: { b: PatientBooking; last: boolean; onCancel: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const complaint = parsePainNotes(b.complaintNotes);
  const record = b.sessionRecord;
  const therapistPoints = record?.bodyPoints.filter((p) => p.source === "therapist").map((p) => p.regionId) ?? [];
  const patientPoints = record ? record.bodyPoints.filter((p) => p.source === "patient").map((p) => p.regionId) : complaint.points;
  const upcoming = b.bookingStatus === "Terkonfirmasi";
  const service = b.focusArea ? `Fisioterapi ${b.focusArea.name}` : "Fisioterapi";
  const therapist = b.handledByTherapistName ?? b.therapistName;

  return (
    <li className="relative flex gap-4">
      {/* Garis linimasa */}
      {!last && <span className="absolute left-6 top-[52px] bottom-[-12px] w-px bg-zinc-200" aria-hidden />}
      <DateBlock date={b.bookingDate} muted={!upcoming} />

      <div className="mb-3 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-zinc-900">{service}</span>
              <PatientStatusBadge status={b.bookingStatus} />
            </div>
            <p className="mt-1 text-[12px] text-zinc-500">
              {formatLongDate(b.bookingDate)} · {formatSlotTime(b.bookingTime)} WIB · {therapist}
            </p>
            {(b.painLevel || record?.diagnosis) && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-zinc-600">
                {b.painLevel && <span>Nyeri {b.painLevel}/{PAIN_SCALE_MAX}</span>}
                {record?.diagnosis && <span className="truncate">{record.diagnosis}</span>}
              </p>
            )}
          </div>
          <CaretDown size={14} className={`mt-0.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-zinc-100 px-4 py-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <Block label="Keluhan saat booking">
                <p>{painLabel(b.painLevel)}</p>
                {complaint.points.length > 0 && <p className="text-zinc-600">{complaint.points.map(regionLabel).join(", ")}</p>}
                {complaint.text && <p className="mt-1 whitespace-pre-line text-zinc-600">{complaint.text}</p>}
              </Block>
              {(patientPoints.length > 0 || therapistPoints.length > 0) && (
                <Block label="Area tubuh">
                  <MiniBodyMap patient={patientPoints} therapist={therapistPoints} />
                  {therapistPoints.length > 0 && <p className="mt-1 text-[11px] text-zinc-500">Abu tua = area yang ditangani terapis</p>}
                </Block>
              )}
            </div>

            {record ? (
              <div className="mt-5 grid gap-5 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                <Block label="Diagnosis">
                  <Text value={record.diagnosis} />
                </Block>
                <Block label="Obat & penanganan">
                  <Text value={record.medications} />
                </Block>
                <div className="sm:col-span-2">
                  <Block label="Catatan terapis">
                    <Text value={record.notes} />
                  </Block>
                </div>
                {record.homeExercise && (
                  <div className="rounded-lg bg-zinc-50 p-3 sm:col-span-2">
                    <Block label="Latihan di rumah">
                      <Text value={record.homeExercise} />
                    </Block>
                  </div>
                )}
              </div>
            ) : b.bookingStatus === "Selesai" ? (
              <p className="mt-4 border-t border-zinc-100 pt-4 text-[12px] text-zinc-500">Catatan terapis untuk kunjungan ini belum tersimpan per sesi. Lihat rekam medis terkini di samping.</p>
            ) : null}

            {b.cancellationReason && (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">Alasan dibatalkan: {b.cancellationReason}</p>
            )}

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-zinc-100 pt-3 text-[12px]">
              <div className="flex gap-1.5">
                <dt className="text-zinc-400">Kode</dt>
                <dd className="font-mono text-zinc-700">{b.referenceCode}</dd>
              </div>
              {b.packageName && (
                <div className="flex gap-1.5">
                  <dt className="text-zinc-400">Paket</dt>
                  <dd className="text-zinc-700">{b.packageName}</dd>
                </div>
              )}
              {b.startedAt && (
                <div className="flex gap-1.5">
                  <dt className="text-zinc-400">Durasi</dt>
                  <dd className="tabular-nums text-zinc-700">
                    {formatClock(b.startedAt)}–{b.endedAt ? formatClock(b.endedAt) : "…"}
                  </dd>
                </div>
              )}
            </dl>

            {b.isActionAllowed && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/riwayat-booking/ubah-jadwal/${b.id}`} className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50">
                  Ubah jadwal
                </Link>
                <button type="button" onClick={() => onCancel(b.id)} className="inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-medium text-red-700 hover:bg-red-50">
                  Batalkan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "selesai", label: "Selesai" },
  { key: "batal", label: "Dibatalkan" },
] as const;

/** Jadwal mendatang + linimasa kunjungan. Data dimuat oleh halaman induk. */
export default function RiwayatBooking({ bookings, onChanged }: { bookings: PatientBooking[] | null; onChanged: () => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("semua");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const list = bookings ?? [];
  const upcoming = list
    .filter((b) => b.bookingStatus === "Terkonfirmasi" || b.bookingStatus === "Berlangsung")
    .sort((a, b) => `${a.bookingDate}${a.bookingTime}`.localeCompare(`${b.bookingDate}${b.bookingTime}`));
  const past = list.filter(
    (b) =>
      !upcoming.includes(b) &&
      (filter === "semua" || (filter === "selesai" ? b.bookingStatus === "Selesai" : b.bookingStatus === "Dibatalkan" || b.bookingStatus === "Tidak Hadir"))
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-[14px] font-semibold text-zinc-900">Jadwal mendatang</h2>
        {bookings === null ? (
          <div className="h-[76px] animate-pulse rounded-xl bg-zinc-100" />
        ) : upcoming.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-4">
            <p className="text-[13px] text-zinc-500">Belum ada jadwal terapi yang akan datang.</p>
            <Link href="/booking" className="text-[12px] font-medium text-zinc-900 underline-offset-2 hover:underline">
              Buat janji temu
            </Link>
          </div>
        ) : (
          <ol>
            {upcoming.map((b, i) => (
              <VisitItem key={b.id} b={b} last={i === upcoming.length - 1} onCancel={setCancelId} />
            ))}
          </ol>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-zinc-900">Riwayat kunjungan</h2>
          <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5" role="tablist" aria-label="Saring riwayat">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`h-7 rounded-md px-2.5 text-[12px] transition-colors ${filter === f.key ? "bg-zinc-900 font-medium text-white" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {bookings === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        ) : past.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-[13px] text-zinc-500">
            {filter === "semua" ? "Riwayat kunjungan akan muncul setelah sesi pertamamu." : "Tidak ada kunjungan dengan status ini."}
          </p>
        ) : (
          <ol>
            {past.map((b, i) => (
              <VisitItem key={b.id} b={b} last={i === past.length - 1} onCancel={setCancelId} />
            ))}
          </ol>
        )}
      </section>

      <ModalCancelBooking isOpen={cancelId !== null} onClose={() => setCancelId(null)} bookingId={cancelId ?? ""} onSuccess={onChanged} />
    </div>
  );
}
