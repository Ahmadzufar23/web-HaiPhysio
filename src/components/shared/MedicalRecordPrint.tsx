"use client";

import Image from "next/image";
import { Printer } from "@phosphor-icons/react";
import type { MedicalRecordReport } from "@/types/api.types";
import BodyMap from "@/components/bodymap/BodyMap";
import { CLINIC } from "@/constants/clinic";
import { genderLabel } from "@/constants/patient";
import { painLabel } from "@/constants/painScale";
import { regionLabel } from "@/constants/bodyRegions";
import { parsePainNotes } from "@/lib/painNotes";
import { formatDate, formatDateTime, formatSlotTime } from "@/lib/format";
import { PainTable, RomTable } from "./ProgressChart";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="break-inside-avoid">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-0.5 whitespace-pre-line text-[12.5px] leading-relaxed ${value ? "text-zinc-900" : "text-zinc-400"}`}>{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-zinc-300 pb-1 text-[13px] font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}

const ageOf = (dob: string | null) => {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
};

/**
 * Rekam medis siap cetak. Tombol memanggil dialog cetak browser; pilih
 * "Simpan sebagai PDF" untuk berkas PDF. Kerangka halaman (navbar, sidebar) disembunyikan saat cetak.
 */
export default function MedicalRecordPrint({ report }: { report: MedicalRecordReport }) {
  const { patient, medicalRecord: record, visits, progress } = report;
  const age = ageOf(patient.dateOfBirth);
  const patientPoints = record.bodyPoints.filter((b) => b.source === "patient").map((b) => b.regionId);
  const therapistPoints = record.bodyPoints.filter((b) => b.source === "therapist").map((b) => b.regionId);

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-[13px] text-zinc-600">Pratinjau rekam medis. Pilih &ldquo;Simpan sebagai PDF&rdquo; di dialog cetak untuk mengunduh berkas.</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-[13px] font-medium text-white hover:bg-zinc-800"
        >
          <Printer size={15} />
          Cetak / Simpan PDF
        </button>
      </div>

      <article className="rounded-lg border border-zinc-200 bg-white p-8 text-zinc-900 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b-2 border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <Image src="/fisio_nobg.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <div>
              <p className="text-[16px] font-bold tracking-tight">Hai Physio</p>
              <p className="text-[11px] text-zinc-600">{CLINIC.name}</p>
              <p className="max-w-[360px] text-[11px] text-zinc-600">{CLINIC.address}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold">Rekam Medis Fisioterapi</p>
            <p className="text-[11px] text-zinc-600">Dicetak {formatDateTime(report.generatedAt)}</p>
          </div>
        </header>

        <Section title="Identitas pasien">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            <Field label="Nama" value={patient.fullName} />
            <Field label="Tanggal lahir" value={patient.dateOfBirth ? `${formatDate(patient.dateOfBirth)}${age !== null ? ` (${age} th)` : ""}` : null} />
            <Field label="Jenis kelamin" value={genderLabel(patient.gender)} />
            <Field label="Telepon" value={patient.phone} />
            <Field label="Email" value={patient.email} />
            <Field label="Pekerjaan" value={patient.occupation} />
            <div className="col-span-2 sm:col-span-3">
              <Field label="Alamat" value={patient.address} />
            </div>
          </div>
        </Section>

        <Section title="Rekam medis terkini">
          {/* Catatan terapis di kiri, titik berobat (gambar tubuh) di kanan */}
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_230px] print:grid-cols-[minmax(0,1fr)_230px]">
            <div className="flex flex-col gap-3">
              <Field label="Diagnosis" value={record.diagnosis} />
              <Field label="Obat & penanganan" value={record.medications} />
              <div className="break-inside-avoid rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 [print-color-adjust:exact]">
                <Field label="Catatan terapis" value={record.notes} />
              </div>
              <Field label="Latihan pemulihan di rumah" value={record.homeExercise} />
              {record.updatedAt && <p className="text-[11px] text-zinc-500">Terakhir diperbarui {formatDateTime(record.updatedAt)}</p>}
            </div>

            <aside className="break-inside-avoid rounded-md border border-zinc-200 p-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-zinc-500">Titik berobat</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["front", "back"] as const).map((view) => (
                  <figure key={view} className="flex flex-col items-center gap-1">
                    <BodyMap view={view} selected={patientPoints} marked={therapistPoints} dots="none" className="w-full" />
                    <figcaption className="text-[10.5px] text-zinc-500">{view === "front" ? "Depan" : "Belakang"}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-zinc-600 [print-color-adjust:exact]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[#fcdf09]" aria-hidden /> Keluhan pasien
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-zinc-600" aria-hidden /> Ditandai terapis
                </span>
              </div>
              {record.bodyPoints.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-0.5 border-t border-zinc-100 pt-2 text-[11.5px] text-zinc-800">
                  {record.bodyPoints.map((b) => (
                    <li key={b.regionId}>
                      {regionLabel(b.regionId)}
                      <span className="text-zinc-500"> · {b.source === "therapist" ? "terapis" : "pasien"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 border-t border-zinc-100 pt-2 text-[11.5px] text-zinc-400">Belum ada titik berobat</p>
              )}
            </aside>
          </div>
        </Section>

        {progress.length > 0 && (
          <Section title="Progres asesmen">
            <div className="flex flex-col gap-4">
              <PainTable points={progress} />
              <RomTable points={progress} />
            </div>
          </Section>
        )}

        <Section title={`Riwayat kunjungan (${visits.length} sesi selesai)`}>
          {visits.length === 0 ? (
            <p className="text-[12px] text-zinc-500">Belum ada sesi yang selesai.</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {visits.map((v) => {
                const complaint = parsePainNotes(v.complaintNotes);
                return (
                  <li key={v.id} className="break-inside-avoid rounded-md border border-zinc-200 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[12.5px] font-semibold">
                        {formatDate(v.date)}, {formatSlotTime(v.startTime)} WIB
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {v.therapistName ?? "—"} · {v.packageName ?? "Tanpa paket"} · {v.referenceCode}
                      </p>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <Field label="Keluhan saat booking" value={[painLabel(v.painLevel) !== "—" ? `Nyeri ${painLabel(v.painLevel)}` : "", complaint.points.map(regionLabel).join(", "), complaint.text].filter(Boolean).join("\n")} />
                      {v.assessment && (
                        <Field
                          label="Asesmen"
                          value={[
                            v.assessment.painBefore !== null || v.assessment.painAfter !== null ? `VAS ${v.assessment.painBefore ?? "—"} → ${v.assessment.painAfter ?? "—"}` : "",
                            v.assessment.rom.map((r) => `${r.joint} ${r.movement}${r.side !== "-" ? ` ${r.side}` : ""}: ${r.degrees}°`).join("; "),
                            v.assessment.functionalNotes ?? "",
                          ]
                            .filter(Boolean)
                            .join("\n")}
                        />
                      )}
                      <Field label="Diagnosis" value={v.sessionRecord?.diagnosis} />
                      <Field label="Catatan terapis" value={v.sessionRecord?.notes} />
                      <Field label="Obat & penanganan" value={v.sessionRecord?.medications} />
                      <Field label="Latihan di rumah" value={v.sessionRecord?.homeExercise} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Section>

        <footer className="mt-8 border-t border-zinc-200 pt-3 text-[10.5px] text-zinc-500">
          Dokumen ini berisi data kesehatan pribadi. Simpan dengan aman dan bagikan hanya kepada tenaga kesehatan yang berwenang.
        </footer>
      </article>
    </div>
  );
}
