"use client";

import { useState, type ReactNode } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import BodyMap from "@/components/bodymap/BodyMap";
import { regionLabel } from "@/constants/bodyRegions";
import type { BodyPoint, MedicalRecord } from "@/types/api.types";
import { btn, inputClass } from "@/components/admin/shared/AdminUI";
import { formatDateTime } from "@/lib/format";

export type RecordDraft = { diagnosis: string; medications: string; notes: string; homeExercise: string; bodyPoints: BodyPoint[] };

export const toDraft = (r: MedicalRecord, fallbackPoints: BodyPoint[]): RecordDraft => ({
  diagnosis: r.diagnosis ?? "",
  medications: r.medications ?? "",
  notes: r.notes ?? "",
  homeExercise: r.homeExercise ?? "",
  bodyPoints: r.bodyPoints.length > 0 ? r.bodyPoints : fallbackPoints,
});

interface Props {
  record: MedicalRecord;
  /** Titik dari keluhan booking, dipakai bila rekam medis belum punya titik */
  patientPoints: BodyPoint[];
  editing: boolean;
  saving: boolean;
  error: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (draft: RecordDraft) => void;
  /** Daftar + form video latihan (disimpan langsung, terpisah dari tombol Edit) */
  videoSection: ReactNode;
}

const VIEWS = [
  { view: "front", caption: "Depan" },
  { view: "back", caption: "Belakang" },
] as const;

function Field({ label, value, editing, onChange, rows, placeholder }: { label: string; value: string; editing: boolean; onChange: (v: string) => void; rows: number; placeholder: string }) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="text-[12px] font-medium text-brand-900/55">
        {label}
      </label>
      {editing ? (
        rows === 1 ? (
          <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputClass} mt-1.5`} />
        ) : (
          <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputClass} mt-1.5 resize-y`} />
        )
      ) : (
        <p className={`mt-1.5 whitespace-pre-line text-[13px] leading-relaxed ${value ? "text-brand-900" : "text-brand-900/40"}`}>{value || "Belum diisi"}</p>
      )}
    </div>
  );
}

/** Rekam medis pasien: titik berobat, nama penyakit, obat, catatan, dan latihan pemulihan. */
export default function MedicalRecordEditor({ record, patientPoints, editing, saving, error, onEdit, onCancelEdit, onSave, videoSection }: Props) {
  const [draft, setDraft] = useState<RecordDraft>(() => toDraft(record, patientPoints));
  const [hovered, setHovered] = useState<string | null>(null);
  const shown = editing ? draft : toDraft(record, patientPoints);

  const patientIds = shown.bodyPoints.filter((p) => p.source === "patient").map((p) => p.regionId);
  const therapistIds = shown.bodyPoints.filter((p) => p.source === "therapist").map((p) => p.regionId);

  const set = (key: keyof Omit<RecordDraft, "bodyPoints">) => (v: string) => setDraft((d) => ({ ...d, [key]: v }));
  const togglePoint = (id: string) =>
    setDraft((d) => ({
      ...d,
      bodyPoints: d.bodyPoints.some((p) => p.regionId === id) ? d.bodyPoints.filter((p) => p.regionId !== id) : [...d.bodyPoints, { regionId: id, source: "therapist" }],
    }));

  return (
    <section className="rounded-xl border border-surface-2 bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-surface-2 px-5 py-4">
        <div>
          <h2 className="text-[13px] font-semibold text-brand-900">Rekam medis</h2>
          <p className="mt-0.5 text-[13px] text-brand-900/55">
            {record.updatedAt ? `Terakhir diubah ${formatDateTime(record.updatedAt)}` : "Belum pernah diisi"} · tampil juga di akun pasien
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button className={btn.secondary} onClick={onCancelEdit} disabled={saving}>
              Batal
            </button>
            <button className={btn.primary} onClick={() => onSave(draft)} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        ) : (
          <button
            className={btn.secondary}
            onClick={() => {
              setDraft(toDraft(record, patientPoints));
              onEdit();
            }}
          >
            <PencilSimple size={15} />
            Edit
          </button>
        )}
      </header>

      {error && <p className="border-b border-surface-2 bg-red-50 px-5 py-2.5 text-[13px] text-red-700">{error}</p>}

      {/* Titik berobat (gambar organ) */}
      <div className="border-b border-surface-2 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-brand-900">Titik berobat</h3>
          <div className="flex items-center gap-4 text-[12px] text-brand-900/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#fcdf09]" aria-hidden /> Dipilih pasien
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-zinc-600" aria-hidden /> Ditambah terapis
            </span>
          </div>
        </div>
        <p className="mt-1 h-5 text-[13px] text-brand-900/55" aria-live="polite">
          {editing ? (hovered ? regionLabel(hovered) : "Ketuk area tubuh untuk menambah atau menghapus titik") : ""}
        </p>
        <div className="mx-auto mt-2 grid max-w-[520px] grid-cols-2 gap-6">
          {VIEWS.map(({ view, caption }) => (
            <figure key={view} className="flex flex-col items-center gap-2">
              <BodyMap
                view={view}
                selected={patientIds}
                marked={therapistIds}
                onToggle={editing ? togglePoint : undefined}
                onHover={setHovered}
                dots="none"
                className="w-full max-w-[220px]"
              />
              <figcaption className="text-[12px] text-brand-900/50">{caption}</figcaption>
            </figure>
          ))}
        </div>
        {shown.bodyPoints.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {shown.bodyPoints.map((p) => (
              <li
                key={p.regionId}
                className={`rounded-md px-2 py-1 text-[12px] font-medium ${p.source === "therapist" ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-800"}`}
              >
                {regionLabel(p.regionId)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hasil pemeriksaan */}
      <div className="grid gap-5 border-b border-surface-2 px-5 py-5">
        <Field label="Nama penyakit / diagnosis" value={shown.diagnosis} editing={editing} onChange={set("diagnosis")} rows={1} placeholder="Mis. Frozen shoulder kanan" />
        <Field label="Obat & penanganan" value={shown.medications} editing={editing} onChange={set("medications")} rows={3} placeholder="Obat, alat bantu, atau tindakan yang diberikan" />
        <Field label="Catatan terapi" value={shown.notes} editing={editing} onChange={set("notes")} rows={4} placeholder="Hasil pemeriksaan dan perkembangan pasien (wajib sebelum sesi diselesaikan)" />
      </div>

      {/* Latihan pemulihan di rumah */}
      <div className="px-5 py-5">
        <Field label="Latihan pemulihan di rumah" value={shown.homeExercise} editing={editing} onChange={set("homeExercise")} rows={3} placeholder="Mis. Pendulum 3 × 10 repetisi, pagi dan sore" />
        <div className="mt-4">
          {videoSection}
        </div>
      </div>
    </section>
  );
}
