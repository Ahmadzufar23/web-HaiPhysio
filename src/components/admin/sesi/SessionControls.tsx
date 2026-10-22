"use client";

import { useState } from "react";
import { Play, Stop, Prohibit } from "@phosphor-icons/react";
import type { SessionDetail } from "@/types/api.types";
import { btn, inputClass, StatusBadge } from "@/components/admin/shared/AdminUI";
import { formatClock, formatLongDate, formatRupiah, formatSlotTime } from "@/lib/format";

interface Props {
  data: SessionDetail;
  noteReady: boolean;
  editing: boolean;
  busy: boolean;
  onStart: (therapistId: string) => void;
  onFinish: () => void;
  onCancel: () => void;
  /** Harga & pendapatan hanya untuk owner */
  showPrices: boolean;
  /** User staf yang login: namanya dipilih otomatis di dropdown terapis */
  currentUserId: string;
}

const minutesBetween = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

/**
 * Baris kendali sesi: nama terapis (absensi), paket (harga yang dicatat),
 * dan tombol Start → Selesai, atau Cancel bila pasien tidak hadir.
 */
export default function SessionControls({ data, noteReady, editing, busy, onStart, onFinish, onCancel, showPrices, currentUserId }: Props) {
  const { session, therapists } = data;
  const [therapistId, setTherapistId] = useState(
    session.handledByTherapist?.id ?? therapists.find((t) => t.userId === currentUserId)?.id ?? ""
  );
  const [confirmCancel, setConfirmCancel] = useState(false);

  const waiting = session.status === "Terkonfirmasi";
  const running = session.status === "Berlangsung";
  const pkg = session.package;

  // Start baru boleh pada hari jadwalnya (BE juga menolak)
  const startHint = waiting && !session.canStart ? "Sesi baru bisa di-Start pada hari jadwalnya" : waiting && !therapistId ? "Pilih nama terapis dulu" : undefined;
  const finishHint = running && !noteReady ? "Perbarui dan simpan catatan terapi untuk sesi ini dulu" : running && editing ? "Simpan rekam medis dulu" : undefined;
  // Tidak Hadir baru boleh setelah jam jadwal dimulai (BE juga menolak)
  const cancelHint = waiting && !session.canMarkNoShow ? "Pasien baru bisa ditandai tidak hadir setelah jam jadwalnya dimulai" : undefined;
  // Alasan tombol nonaktif ditampilkan sebagai teks: tooltip tidak muncul di layar sentuh
  const hint = startHint ?? finishHint;
  const pp = session.patientPackage;

  return (
    <section className="rounded-xl border border-surface-2 bg-white">
      {/* Status + tombol aksi */}
      <div className="flex flex-col gap-3 border-b border-surface-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge status={session.status} />
            <span className="text-[13px] text-brand-900/50">{session.referenceCode}</span>
          </div>
          <p className="mt-1 text-[13px] text-brand-900">
            {formatLongDate(session.date)}, {formatSlotTime(session.startTime)}–{formatSlotTime(session.endTime)} WIB
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn.primary} disabled={!waiting || !session.canStart || !therapistId || busy} onClick={() => onStart(therapistId)} title={startHint}>
            <Play size={14} weight="fill" />
            Start
          </button>
          <button className={btn.primary} disabled={!running || !noteReady || editing || busy} onClick={onFinish} title={finishHint}>
            <Stop size={14} weight="fill" />
            Selesai
          </button>
          <button className={btn.danger} disabled={!waiting || !session.canMarkNoShow || busy} onClick={() => setConfirmCancel(true)} title={cancelHint}>
            <Prohibit size={14} />
            Cancel
          </button>
        </div>
      </div>
      {hint && <p className="border-b border-surface-2 bg-surface px-5 py-2 text-[12px] text-brand-900/60">{hint}</p>}

      {/* Terapis & paket */}
      <div className="grid gap-px bg-surface-2 sm:grid-cols-2">
        <div className="bg-white px-5 py-4">
          <label htmlFor="therapist" className="text-[12px] font-medium text-brand-900/55">
            Nama terapis
          </label>
          {waiting ? (
            <select id="therapist" value={therapistId} onChange={(e) => setTherapistId(e.target.value)} className={`${inputClass} mt-1.5`}>
              <option value="">Pilih terapis yang menangani…</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                  {t.isOwner ? " (Owner)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1.5 text-[13px] font-medium text-brand-900">{session.handledByTherapist?.fullName ?? "—"}</p>
          )}
          <p className="mt-1.5 text-[12px] text-brand-900/50">
            {session.startedAt
              ? `Mulai ${formatClock(session.startedAt)}${session.endedAt ? ` · Selesai ${formatClock(session.endedAt)} (${minutesBetween(session.startedAt, session.endedAt)} menit)` : ""}`
              : `Terjadwal dengan ${session.scheduledTherapist.fullName}. Absensi terapis yang dipilih tercatat saat sesi Selesai.`}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[12px] font-medium text-brand-900/55">Paket terapi</p>
          <p className="mt-1.5 text-[13px] font-medium text-brand-900">{pkg?.name ?? "Tanpa paket"}</p>
          {pp && (
            <p className="mt-1 text-[12px] text-brand-900/60">
              {pp.completed} selesai · {pp.scheduled} terjadwal · {pp.remaining} belum dijadwalkan dari {pp.totalSessions} sesi
              {pp.noShow > 0 && ` · ${pp.noShow} hangus`}
            </p>
          )}
          {showPrices ? (
            <p className="mt-1.5 text-[12px] text-brand-900/50">
              {session.status === "Selesai"
                ? `Tercatat ${formatRupiah(session.recordedAmount ?? 0)}`
                : pkg?.pricePerSession != null
                  ? `${formatRupiah(pkg.pricePerSession)} per sesi, dicatat saat Selesai`
                  : pkg?.isHomeVisit
                    ? "Harga homecare menyesuaikan jarak (belum diatur)"
                    : "Harga paket belum diatur owner"}
            </p>
          ) : (
            !pp && pkg?.totalSessions && <p className="mt-1.5 text-[12px] text-brand-900/50">{pkg.totalSessions} sesi</p>
          )}
        </div>
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="noshow-title">
          <div className="w-full max-w-[420px] rounded-xl bg-white p-6">
            <h3 id="noshow-title" className="text-[14px] font-semibold text-brand-900">
              Tandai pasien tidak hadir?
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-brand-900/65">
              Sesi {data.patient.fullName}, {formatLongDate(session.date)} pukul {formatSlotTime(session.startTime)} akan berstatus <strong>Tidak Hadir</strong>. Sesi hangus, tidak ada absensi
              terapis dan tidak ada pendapatan yang dicatat.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className={btn.secondary} onClick={() => setConfirmCancel(false)}>
                Kembali
              </button>
              <button
                className={btn.danger}
                disabled={busy}
                onClick={() => {
                  setConfirmCancel(false);
                  onCancel();
                }}
              >
                Ya, tidak hadir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
