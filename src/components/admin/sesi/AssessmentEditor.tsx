"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { BookingStatus, RomMeasurement, RomSide, SessionAssessment } from "@/types/api.types";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import { btn, inputClass } from "@/components/admin/shared/AdminUI";
import { formatDateTime } from "@/lib/format";

const JOINTS = ["Leher", "Bahu", "Siku", "Pergelangan tangan", "Punggung", "Panggul", "Lutut", "Pergelangan kaki"];
const MOVEMENTS = ["Fleksi", "Ekstensi", "Abduksi", "Adduksi", "Rotasi internal", "Rotasi eksternal", "Lateral fleksi", "Dorsifleksi", "Plantarfleksi"];

type RomRow = Omit<RomMeasurement, "degrees"> & { degrees: string };

interface Props {
  sessionId: string;
  status: BookingStatus;
  assessment: SessionAssessment | null;
  onSaved: () => void;
}

/** Skala VAS 0–10 sebagai deretan tombol */
function VasScale({ label, value, onChange, disabled }: { label: string; value: number | null; onChange: (v: number | null) => void; disabled: boolean }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-brand-900/55">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1" role="radiogroup" aria-label={label}>
        {Array.from({ length: 11 }, (_, v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            disabled={disabled}
            onClick={() => onChange(value === v ? null : v)}
            className={`h-7 w-7 rounded-md border text-[12px] tabular-nums transition-colors disabled:cursor-not-allowed ${
              value === v ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Asesmen klinis terstruktur sesi ini: nyeri VAS sebelum/sesudah terapi dan ROM.
 * Diisi setelah Start, masih bisa dikoreksi setelah Selesai. Datanya membentuk grafik progres pasien.
 */
export default function AssessmentEditor({ sessionId, status, assessment, onSaved }: Props) {
  const editable = status === "Berlangsung" || status === "Selesai";
  const [painBefore, setPainBefore] = useState<number | null>(assessment?.painBefore ?? null);
  const [painAfter, setPainAfter] = useState<number | null>(assessment?.painAfter ?? null);
  const [rom, setRom] = useState<RomRow[]>((assessment?.rom ?? []).map((r) => ({ ...r, degrees: String(r.degrees) })));
  const [notes, setNotes] = useState(assessment?.functionalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const setRow = (i: number, patch: Partial<RomRow>) => setRom((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async () => {
    const parsed = rom.filter((r) => r.joint.trim() || r.movement.trim() || r.degrees.trim());
    if (parsed.some((r) => !r.joint.trim() || !r.movement.trim() || r.degrees.trim() === "" || !Number.isInteger(Number(r.degrees)))) {
      setMessage({ tone: "error", text: "Lengkapi sendi, gerakan, dan derajat (bilangan bulat) di setiap baris ROM." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await clinicService.saveAssessment(sessionId, {
        painBefore,
        painAfter,
        rom: parsed.map((r) => ({ joint: r.joint.trim(), movement: r.movement.trim(), side: r.side, degrees: Number(r.degrees) })),
        functionalNotes: notes,
      });
      setMessage({ tone: "ok", text: "Asesmen tersimpan." });
      onSaved();
    } catch (error) {
      setMessage({ tone: "error", text: getApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-surface-2 bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-surface-2 px-5 py-4">
        <div>
          <h2 className="text-[13px] font-semibold text-brand-900">Asesmen klinis sesi ini</h2>
          <p className="mt-0.5 text-[12px] text-brand-900/50">
            {editable ? "Nyeri VAS 0–10 dan lingkup gerak sendi (ROM). Membentuk grafik progres pasien." : "Bisa diisi setelah sesi di-Start."}
          </p>
        </div>
        {assessment?.updatedAt && <span className="shrink-0 text-[11px] text-brand-900/45">Disimpan {formatDateTime(assessment.updatedAt)}</span>}
      </header>

      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="grid gap-4 md:grid-cols-2">
          <VasScale label="Nyeri sebelum terapi" value={painBefore} onChange={setPainBefore} disabled={!editable} />
          <VasScale label="Nyeri sesudah terapi" value={painAfter} onChange={setPainAfter} disabled={!editable} />
        </div>

        <div>
          <p className="text-[12px] font-medium text-brand-900/55">Lingkup gerak sendi (ROM, derajat)</p>
          <datalist id="rom-joints">
            {JOINTS.map((j) => (
              <option key={j} value={j} />
            ))}
          </datalist>
          <datalist id="rom-movements">
            {MOVEMENTS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <div className="mt-1.5 flex flex-col gap-2">
            {rom.length === 0 && <p className="text-[12px] text-brand-900/40">Belum ada pengukuran.</p>}
            {rom.map((r, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_90px_80px_32px]">
                <input list="rom-joints" value={r.joint} onChange={(e) => setRow(i, { joint: e.target.value })} placeholder="Sendi" aria-label="Sendi" disabled={!editable} className={inputClass} />
                <input list="rom-movements" value={r.movement} onChange={(e) => setRow(i, { movement: e.target.value })} placeholder="Gerakan" aria-label="Gerakan" disabled={!editable} className={inputClass} />
                <select value={r.side} onChange={(e) => setRow(i, { side: e.target.value as RomSide })} aria-label="Sisi" disabled={!editable} className={inputClass}>
                  <option value="kanan">Kanan</option>
                  <option value="kiri">Kiri</option>
                  <option value="-">—</option>
                </select>
                <input value={r.degrees} onChange={(e) => setRow(i, { degrees: e.target.value })} inputMode="numeric" placeholder="°" aria-label="Derajat" disabled={!editable} className={inputClass} />
                <button type="button" onClick={() => setRom((rows) => rows.filter((_, j) => j !== i))} disabled={!editable} aria-label="Hapus baris ROM" className={`${btn.secondary} px-0`}>
                  <Trash size={13} />
                </button>
              </div>
            ))}
          </div>
          {editable && (
            <button type="button" onClick={() => setRom((rows) => [...rows, { joint: "", movement: "", side: "kanan", degrees: "" }])} className={`${btn.secondary} mt-2`}>
              <Plus size={13} />
              Tambah pengukuran
            </button>
          )}
        </div>

        <div>
          <label htmlFor="functional-notes" className="text-[12px] font-medium text-brand-900/55">
            Catatan fungsional
          </label>
          <textarea
            id="functional-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={!editable}
            placeholder="Mis. naik tangga tanpa pegangan, jalan 500 m tanpa nyeri"
            className={`${inputClass} mt-1.5 resize-y`}
          />
        </div>

        {editable && (
          <div className="flex items-center justify-end gap-3">
            {message && <span className={`text-[12px] ${message.tone === "error" ? "text-red-600" : "text-brand-900/60"}`}>{message.text}</span>}
            <button type="button" onClick={save} disabled={saving} className={btn.primary}>
              {saving ? "Menyimpan…" : "Simpan asesmen"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
