"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CaretRight, Printer } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { clinicService } from "@/services/clinicService";
import type { AdminBooking, AdminPatient, MedicalRecord, MedicalRecordRevision, ProgressPoint } from "@/types/api.types";
import BodyMap from "@/components/bodymap/BodyMap";
import { regionLabel } from "@/constants/bodyRegions";
import ProgramManager from "@/components/admin/video/ProgramManager";
import { EmptyState, Panel, StatusBadge, btn, inputClass, tableHead } from "@/components/admin/shared/AdminUI";
import ProgressPanel from "@/components/shared/ProgressChart";
import { GENDER_OPTIONS, genderLabel } from "@/constants/patient";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { getApiErrorMessage } from "@/app/utils/api";
import { formatDate, formatDateOf, formatDateTime, formatSlotTime } from "@/lib/format";

type Detail = {
  patient: AdminPatient | null;
  bookings: AdminBooking[];
  record: MedicalRecord | null;
  progress: ProgressPoint[];
  revisions: MedicalRecordRevision[];
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-900">{value || "—"}</dd>
    </div>
  );
}

/** Jenis kelamin dikunci; hanya owner yang bisa mengoreksi bila salah input. */
function GenderRow({ patient, onSaved }: { patient: AdminPatient; onSaved: (p: AdminPatient) => void }) {
  const isOwner = useStaffUser().role === "owner";
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(patient.gender ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminService.updatePatientGender(patient.id, value);
      onSaved(res.data.patient);
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 py-1.5">
        <dt className="text-zinc-500">Jenis kelamin</dt>
        <dd className="flex items-center gap-2 text-zinc-900">
          {genderLabel(patient.gender) ?? "—"}
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setValue(patient.gender ?? "");
                setEditing(true);
              }}
              className="text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Koreksi
            </button>
          )}
        </dd>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      <dt className="text-zinc-500">Jenis kelamin</dt>
      <dd className="flex flex-col gap-2">
        <select value={value} onChange={(e) => setValue(e.target.value)} className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-[13px]">
          <option value="" disabled>
            Pilih
          </option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[12px] text-red-600">{error}</span>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btn.secondary} onClick={() => setEditing(false)} disabled={busy}>
            Batal
          </button>
          <button type="button" className={btn.primary} onClick={save} disabled={busy || !value || value === patient.gender}>
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </dd>
    </div>
  );
}

const ACCOUNT_STATUS_LABEL: Record<AdminPatient["accountStatus"], string> = {
  aktif: "Aktif",
  belum_aktivasi: "Menunggu aktivasi",
  offline: "Offline (belum ada email)",
};

/** Akun buatan klinik: kirim ulang link aktivasi, atau isi/betulkan email selama belum aktif. */
function AccountRow({ patient, onSaved }: { patient: AdminPatient; onSaved: (p: AdminPatient) => void }) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(patient.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  const send = async (newEmail?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminService.sendActivation(patient.id, newEmail);
      onSaved(res.data.patient);
      setEditing(false);
      setMessage({ tone: "info", text: `Link aktivasi dikirim ke ${res.data.sentTo}.` });
    } catch (err) {
      setMessage({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-1.5">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-zinc-500">Status akun</dt>
        <dd className="text-right text-zinc-900">{ACCOUNT_STATUS_LABEL[patient.accountStatus]}</dd>
      </div>
      {patient.accountStatus !== "aktif" && !editing && (
        <dd className="flex flex-wrap justify-end gap-2">
          {patient.accountStatus === "belum_aktivasi" && (
            <button type="button" className={btn.secondary} onClick={() => send()} disabled={busy}>
              {busy ? "Mengirim…" : "Kirim ulang link"}
            </button>
          )}
          <button
            type="button"
            className={btn.secondary}
            onClick={() => {
              setEmail(patient.email ?? "");
              setEditing(true);
              setMessage(null);
            }}
          >
            {patient.email ? "Ubah email" : "Isi email"}
          </button>
        </dd>
      )}
      {editing && (
        <dd className="flex flex-col gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@pasien.com" className={`${inputClass} h-8`} />
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.secondary} onClick={() => setEditing(false)} disabled={busy}>
              Batal
            </button>
            <button type="button" className={btn.primary} onClick={() => send(email.trim())} disabled={busy || !email.trim()}>
              {busy ? "Mengirim…" : "Simpan & kirim link"}
            </button>
          </div>
        </dd>
      )}
      {message && <p className={`text-[12px] ${message.tone === "error" ? "text-red-600" : "text-zinc-600"}`}>{message.text}</p>}
    </div>
  );
}

function RecordField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500">{label}</p>
      <p className={`mt-0.5 whitespace-pre-line leading-relaxed ${value ? "text-zinc-900" : "text-zinc-400"}`}>{value || "Belum diisi"}</p>
    </div>
  );
}

function PatientDetail() {
  const patientId = useSearchParams().get("id") ?? "";
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    if (!patientId) return;
    // Semua disaring di server per pasien (tidak lagi menarik seluruh pasien & booking)
    Promise.all([
      adminService.getPatient(patientId),
      adminService.getBookings({ patient_id: patientId }),
      clinicService.getPatientMedicalRecord(patientId).catch(() => null),
      clinicService.getPatientProgress(patientId).catch(() => null),
      clinicService.getMedicalRecordHistory(patientId).catch(() => null),
    ])
      .then(([patientRes, bookingsRes, recordRes, progressRes, historyRes]) =>
        setData({
          patient: patientRes.data.patient,
          // Terbaru dulu
          bookings: [...bookingsRes.data.bookings].reverse(),
          record: recordRes?.data.medicalRecord ?? null,
          progress: progressRes?.data.progress ?? [],
          revisions: historyRes?.data.revisions ?? [],
        })
      )
      .catch((error) => {
        console.error("Gagal memuat detail pasien:", error);
        setData({ patient: null, bookings: [], record: null, progress: [], revisions: [] });
      });
  }, [patientId]);

  const back = (
    <Link href="/admin/pasien" className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900">
      <ArrowLeft size={12} />
      Pasien
    </Link>
  );

  if (!patientId || (data && !data.patient)) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <Panel>
          <EmptyState title="Pasien tidak ditemukan" />
        </Panel>
      </div>
    );
  }

  if (!data) {
    return <div className="h-64 animate-pulse rounded-lg bg-white" />;
  }

  const { patient, bookings, record, progress, revisions } = data;
  const p = patient!;
  const patientIds = record?.bodyPoints.filter((b) => b.source === "patient").map((b) => b.regionId) ?? [];
  const therapistIds = record?.bodyPoints.filter((b) => b.source === "therapist").map((b) => b.regionId) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-semibold text-zinc-900">{p.fullName}</h1>
          <p className="text-[12px] text-zinc-500">{p.patientCode}</p>
        </div>
        <Link href={`/admin/pasien/cetak?id=${p.id}`} className={btn.secondary}>
          <Printer size={13} />
          Cetak rekam medis (PDF)
        </Link>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
        <Panel title="Data pasien" bodyClassName="px-4 py-2">
          <dl className="divide-y divide-zinc-100">
            <Row label="Telepon" value={p.phone} />
            <Row label="Email" value={p.email ?? "Belum ada"} />
            <Row label="Tanggal lahir" value={p.dateOfBirth ? formatDate(p.dateOfBirth) : null} />
            <GenderRow patient={p} onSaved={(updated) => setData((d) => (d ? { ...d, patient: updated } : d))} />
            <Row label="Pekerjaan" value={p.occupation} />
            <Row label="Alamat" value={p.address} />
            <AccountRow patient={p} onSaved={(updated) => setData((d) => (d ? { ...d, patient: updated } : d))} />
            <Row label="Terdaftar" value={formatDateOf(p.registeredAt)} />
            <Row label="Total booking" value={String(p.totalBookings)} />
            <Row label="Sesi selesai" value={String(p.totalSessions)} />
          </dl>
        </Panel>

        <Panel title="Rekam medis" description={record?.updatedAt ? `Terakhir diubah ${formatDateTime(record.updatedAt)}` : "Belum pernah diisi. Isi dari halaman Detail Sesi."}>
          {record?.updatedAt ? (
            <div className="grid gap-5 p-4 md:grid-cols-[200px_1fr]">
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <BodyMap view="front" selected={patientIds} marked={therapistIds} dots="none" className="w-full" />
                  <BodyMap view="back" selected={patientIds} marked={therapistIds} dots="none" className="w-full" />
                </div>
                {record.bodyPoints.length > 0 && <p className="mt-2 text-[12px] text-zinc-600">{record.bodyPoints.map((b) => regionLabel(b.regionId)).join(", ")}</p>}
              </div>
              <div className="flex flex-col gap-3">
                <RecordField label="Nama penyakit / diagnosis" value={record.diagnosis} />
                <RecordField label="Obat & penanganan" value={record.medications} />
                <RecordField label="Catatan terapi" value={record.notes} />
                <RecordField label="Latihan pemulihan di rumah" value={record.homeExercise} />
              </div>
            </div>
          ) : (
            <EmptyState title="Belum ada rekam medis" />
          )}
        </Panel>
      </div>

      <Panel title="Progres pasien" description="Dari asesmen klinis tiap sesi (nyeri VAS & ROM)" bodyClassName="p-4">
        <ProgressPanel points={progress} />
      </Panel>

      <Panel bodyClassName="p-4">
        <ProgramManager patientId={p.id} />
      </Panel>

      <Panel title="Riwayat perubahan rekam medis" description="Setiap simpan tercatat: siapa, kapan, dan isinya. Tidak bisa diubah atau dihapus.">
        {revisions.length === 0 ? (
          <EmptyState title="Belum ada perubahan tercatat" />
        ) : (
          <ol className="divide-y divide-zinc-100">
            {revisions.map((r) => (
              <li key={r.id}>
                <details className="group px-4 py-2.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px]">
                    <span className="text-zinc-900">
                      {formatDateTime(r.editedAt)} <span className="text-zinc-500">· {r.editedByName ?? "Sistem"}</span>
                    </span>
                    <CaretRight size={12} className="text-zinc-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <RecordField label="Diagnosis" value={r.diagnosis} />
                    <RecordField label="Obat & penanganan" value={r.medications} />
                    <RecordField label="Catatan terapi" value={r.notes} />
                    <RecordField label="Latihan di rumah" value={r.homeExercise} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <Panel title="Riwayat sesi" description={`${bookings.length} booking`}>
        {bookings.length === 0 ? (
          <EmptyState title="Belum ada booking" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Jadwal</th>
                  <th className="px-4 py-2 font-medium">Paket</th>
                  <th className="px-4 py-2 font-medium">Terapis terjadwal</th>
                  <th className="px-4 py-2 font-medium">Kode</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5 tabular-nums text-zinc-900">
                      {formatDate(b.bookingDate)}, {formatSlotTime(b.bookingTime)}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{b.packageName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{b.therapistName}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{b.referenceCode}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                    <td className="pr-3 text-right">
                      <Link href={`/admin/sesi/${b.id}`} aria-label="Buka sesi" className="inline-flex p-1 text-zinc-300 group-hover:text-zinc-600">
                        <CaretRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export default function PatientDetailPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white" />}>
      <PatientDetail />
    </Suspense>
  );
}
