"use client";

import { useState } from "react";
import Link from "next/link";
import type { SessionDetail } from "@/types/api.types";
import { StatusBadge, inputClass } from "@/components/admin/shared/AdminUI";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import { formatDate, formatSlotTime } from "@/lib/format";
import { painLabel } from "@/constants/painScale";
import { bmiOf, genderLabel } from "@/constants/patient";

const ageFrom = (dob: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

/** TB/BB + IMT. Terapis mengukur ulang saat pemeriksaan; simpan = langsung mengubah akun pasien. */
function BodyMeasurements({ patient, onSaved }: { patient: SessionDetail["patient"]; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [height, setHeight] = useState(patient.heightCm?.toString() ?? "");
  const [weight, setWeight] = useState(patient.weightKg?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const bmi = bmiOf(patient.heightCm, patient.weightKg);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminService.updatePatientBody(patient.id, {
        height_cm: Number(height),
        // Koma desimal ("65,5") lazim di keyboard Indonesia
        weight_kg: Number(weight.replace(",", ".")),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal menyimpan tinggi & berat badan."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border-t border-surface-2 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-brand-900/55">Tinggi & berat badan</p>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-medium text-brand-900/70 hover:text-brand-900">
            Perbarui
          </button>
        )}
      </div>
      {editing ? (
        <form onSubmit={save} className="mt-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
              Tinggi (cm)
              <input
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} h-8 tabular-nums`}
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
              Berat (kg)
              <input
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^\d.,]/g, ""))}
                className={`${inputClass} h-8 tabular-nums`}
              />
            </label>
          </div>
          {error && <p className="text-[12px] text-red-700">{error}</p>}
          <p className="text-[11px] text-zinc-500">Tersimpan langsung ke akun pasien.</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
                setHeight(patient.heightCm?.toString() ?? "");
                setWeight(patient.weightKg?.toString() ?? "");
              }}
              className="h-8 rounded-md border border-zinc-200 px-3 text-[12px] text-zinc-700 hover:border-zinc-400"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !height || !weight}
              className="h-8 rounded-md bg-action px-3 text-[12px] font-medium text-on-action disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-2 space-y-2 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-brand-900/55">Tinggi badan</dt>
            <dd className={patient.heightCm ? "tabular-nums text-brand-900" : "text-brand-900/40"}>{patient.heightCm ? `${patient.heightCm} cm` : "Belum diisi"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-brand-900/55">Berat badan</dt>
            <dd className={patient.weightKg ? "tabular-nums text-brand-900" : "text-brand-900/40"}>{patient.weightKg ? `${patient.weightKg} kg` : "Belum diisi"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-brand-900/55">IMT</dt>
            {bmi ? (
              <dd className="text-right">
                <span className="tabular-nums text-brand-900">{bmi.value}</span>
                <span className={`ml-1.5 rounded border px-1.5 py-0.5 text-[11px] ${bmi.ideal ? "border-zinc-200 text-zinc-600" : "border-red-200 text-red-700"}`}>
                  {bmi.label}
                </span>
              </dd>
            ) : (
              <dd className="text-brand-900/40">—</dd>
            )}
          </div>
        </dl>
      )}
    </div>
  );
}

/** Kolom kiri: identitas, TB/BB & IMT, keluhan saat booking, dan riwayat sesi pasien. */
export default function PatientCard({ data, onPatientUpdated }: { data: SessionDetail; onPatientUpdated: () => void }) {
  const { patient, session, history } = data;
  const age = ageFrom(patient.dateOfBirth);

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl border border-surface-2 bg-white">
        <div className="px-4 py-4">
          <h1 className="text-[14px] font-semibold text-brand-900">{patient.fullName}</h1>
          {session.source === "walk_in" && (
            <span className="mt-1 inline-block rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600">Datang langsung</span>
          )}
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-brand-900/55">Jenis kelamin</dt>
              <dd className={patient.gender ? "font-medium text-brand-900" : "text-brand-900/40"}>{genderLabel(patient.gender) ?? "Belum diisi"}</dd>
            </div>
            {age !== null && (
              <div className="flex justify-between gap-3">
                <dt className="text-brand-900/55">Usia</dt>
                <dd className="text-brand-900">{age} tahun</dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="text-brand-900/55">Pekerjaan</dt>
              <dd className={patient.occupation ? "text-right text-brand-900" : "text-brand-900/40"}>{patient.occupation ?? "Belum diisi"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-brand-900/55">Tingkat nyeri</dt>
              <dd className="font-medium text-brand-900">{painLabel(session.painLevel)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-brand-900/55">Telepon</dt>
              <dd className="text-brand-900">{patient.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-brand-900/55">Email</dt>
              <dd className="truncate text-brand-900">{patient.email ?? "—"}</dd>
            </div>
            {patient.address && (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-brand-900/55">Alamat</dt>
                <dd className="text-right text-brand-900">{patient.address}</dd>
              </div>
            )}
          </dl>
          {patient.id && <BodyMeasurements key={`${patient.heightCm}-${patient.weightKg}`} patient={patient} onSaved={onPatientUpdated} />}
          {session.complaintNotes && (
            <div className="mt-4 border-t border-surface-2 pt-3">
              <p className="text-[12px] font-medium text-brand-900/55">Keluhan saat booking</p>
              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-brand-900">{session.complaintNotes}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-surface-2 bg-white">
        <h2 className="border-b border-surface-2 px-4 py-3 text-[13px] font-semibold text-brand-900">Riwayat sesi</h2>
        <ul>
          {history.map((h) => (
            <li key={h.id} className="border-b border-surface-2 last:border-0">
              <Link
                href={`/admin/sesi/${h.id}`}
                aria-current={h.id === session.id ? "page" : undefined}
                className={`block px-4 py-2.5 text-[13px] hover:bg-surface/60 ${h.id === session.id ? "bg-surface/70" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular-nums text-brand-900">
                    {formatDate(h.date)}, {formatSlotTime(h.startTime)}
                  </span>
                  <StatusBadge status={h.status} />
                </div>
                <div className="mt-0.5 truncate text-[12px] text-brand-900/50">
                  {[h.packageName, h.therapistName].filter(Boolean).join(" · ") || "—"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
