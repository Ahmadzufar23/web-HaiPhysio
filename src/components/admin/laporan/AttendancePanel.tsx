"use client";

import { useState } from "react";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { AttendanceDay, AttendanceDayStatus, AttendanceMarkStatus } from "@/types/api.types";
import { EmptyState, Notice, Panel, btn, inputClass, tableHead } from "@/components/admin/shared/AdminUI";
import { formatClock, formatDate, formatHours } from "@/lib/format";

const STATUS: Record<AttendanceDayStatus, { label: string; dot: string; text: string }> = {
  hadir: { label: "Hadir", dot: "bg-zinc-900", text: "text-zinc-900" },
  hadir_tanpa_pasien: { label: "Hadir · tanpa pasien", dot: "bg-zinc-900", text: "text-zinc-900" },
  sakit: { label: "Sakit", dot: "bg-zinc-400", text: "text-zinc-600" },
  izin: { label: "Izin", dot: "bg-zinc-400", text: "text-zinc-600" },
  tidak_hadir: { label: "Tidak hadir", dot: "bg-red-600", text: "text-red-700" },
  belum_ditandai: { label: "Belum ditandai", dot: "border border-zinc-400 bg-white", text: "text-zinc-500" },
};

const MARK_OPTIONS: { value: AttendanceMarkStatus; label: string }[] = [
  { value: "hadir_tanpa_pasien", label: "Hadir tanpa pasien" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "tidak_hadir", label: "Tidak hadir" },
];

const NOTE_MIN = 5;

// Kolom: tanggal, terapis, slot/selesai, mulai–selesai, jam kerja, status, aksi
const GRID = "grid grid-cols-[110px_minmax(140px,1fr)_130px_150px_110px_minmax(170px,1.2fr)_90px]";

function StatusText({ status }: { status: AttendanceDayStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

/** Form tanda absensi oleh owner. Hadir tanpa pasien wajib disertai laporan. */
function MarkForm({ day, onDone, onCancel }: { day: AttendanceDay; onDone: () => void; onCancel: () => void }) {
  const marked = day.status !== "belum_ditandai";
  const [status, setStatus] = useState<AttendanceMarkStatus>(marked ? (day.status as AttendanceMarkStatus) : "hadir_tanpa_pasien");
  const [note, setNote] = useState(day.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const noteRequired = status === "hadir_tanpa_pasien";
  const ready = !noteRequired || note.trim().length >= NOTE_MIN;

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal menyimpan absensi."));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Status absensi">
        {MARK_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={status === o.value}
            onClick={() => setStatus(o.value)}
            className={`h-8 rounded-md border px-3 text-[12px] ${
              status === o.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <label className="flex max-w-[560px] flex-col gap-1 text-[12px] text-zinc-500">
        {noteRequired ? "Laporan *" : "Keterangan (opsional)"}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder={noteRequired ? "Mis. Tidak ada pengunjung. Merapikan alat dan ruang terapi." : "Mis. Surat dokter menyusul"}
          className={`${inputClass} resize-none`}
        />
        {noteRequired && <span className="text-[11px] text-zinc-400">Wajib diisi untuk hadir tanpa pasien (minimal {NOTE_MIN} karakter).</span>}
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex max-w-[560px] flex-wrap justify-end gap-2">
        {marked && (
          <button
            type="button"
            className={`${btn.danger} mr-auto`}
            disabled={busy}
            onClick={() => run(() => clinicService.clearAttendanceMark({ therapist_id: day.therapistId, date: day.date }))}
          >
            Hapus tanda
          </button>
        )}
        <button type="button" className={btn.secondary} onClick={onCancel} disabled={busy}>
          Batal
        </button>
        <button
          type="button"
          className={btn.primary}
          disabled={!ready || busy}
          onClick={() => run(() => clinicService.markAttendance({ therapist_id: day.therapistId, date: day.date, status, note: note.trim() || null }))}
        >
          {busy ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

/**
 * Absensi harian staf. Hadir otomatis dari sesi selesai; hari lain ditandai owner
 * (hadir tanpa pasien + laporan, sakit, izin, tidak hadir). Jam kerja = jam slot terjadwal di hari hadir.
 */
export default function AttendancePanel({ days, onChanged }: { days: AttendanceDay[] | null; onChanged: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [onlyUnmarked, setOnlyUnmarked] = useState(false);
  const rows = (days ?? []).filter((d) => !onlyUnmarked || d.status === "belum_ditandai");
  const unmarked = (days ?? []).filter((d) => d.status === "belum_ditandai").length;

  return (
    <Panel
      title="Absensi harian"
      description="Hadir otomatis dari sesi selesai. Hari tanpa sesi selesai ditandai owner."
      actions={
        <label className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-zinc-600">
          <input type="checkbox" checked={onlyUnmarked} onChange={(e) => setOnlyUnmarked(e.target.checked)} />
          Belum ditandai ({unmarked})
        </label>
      }
    >
      {rows.length === 0 ? (
        <EmptyState title={onlyUnmarked ? "Semua hari sudah ditandai" : "Belum ada jadwal atau absensi pada periode ini"} />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            <div className={`${GRID} ${tableHead}`}>
              <span className="px-4 py-2">Tanggal</span>
              <span className="px-4 py-2">Terapis</span>
              <span className="px-4 py-2 text-right">Slot / selesai</span>
              <span className="px-4 py-2">Mulai – selesai</span>
              <span className="px-4 py-2 text-right">Jam kerja</span>
              <span className="px-4 py-2">Status</span>
              <span />
            </div>
            <ul>
              {rows.map((d) => {
                const key = `${d.therapistId}|${d.date}`;
                const open = editing === key;
                return (
                  <li key={key} className="border-b border-zinc-100 text-[13px] last:border-0">
                    <div className={`${GRID} items-start`}>
                      <span className="px-4 py-2.5 tabular-nums text-zinc-600">{formatDate(d.date)}</span>
                      <span className="px-4 py-2.5 text-zinc-900">
                        {d.therapistName}
                        {d.isOwner && <span className="text-zinc-400"> · Owner</span>}
                      </span>
                      <span className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                        {d.scheduledSlots} / {d.completedSessions}
                      </span>
                      <span className="px-4 py-2.5 tabular-nums text-zinc-600">{d.firstStart ? `${formatClock(d.firstStart)} – ${formatClock(d.lastEnd)}` : "—"}</span>
                      <span className="px-4 py-2.5 text-right tabular-nums text-zinc-900">{d.workMinutes ? formatHours(d.workMinutes) : "—"}</span>
                      <span className="flex flex-col gap-0.5 px-4 py-2.5">
                        <StatusText status={d.status} />
                        {d.note && <span className="whitespace-pre-line text-[12px] text-zinc-500">{d.note}</span>}
                      </span>
                      <span className="px-4 py-2 text-right">
                        {d.status !== "hadir" && !open && (
                          <button type="button" className={btn.secondary} onClick={() => setEditing(key)}>
                            {d.status === "belum_ditandai" ? "Tandai" : "Ubah"}
                          </button>
                        )}
                      </span>
                    </div>
                    {open && (
                      <MarkForm
                        day={d}
                        onCancel={() => setEditing(null)}
                        onDone={() => {
                          setEditing(null);
                          onChanged();
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  );
}
