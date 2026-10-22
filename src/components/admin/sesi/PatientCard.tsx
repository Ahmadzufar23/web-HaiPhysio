import Link from "next/link";
import type { SessionDetail } from "@/types/api.types";
import { StatusBadge } from "@/components/admin/shared/AdminUI";
import { formatDate, formatSlotTime, initials } from "@/lib/format";
import { painLabel } from "@/constants/painScale";
import { genderLabel } from "@/constants/patient";

const ageFrom = (dob: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

/** Kolom kiri: foto profil, identitas, keluhan saat booking, dan riwayat sesi pasien. */
export default function PatientCard({ data }: { data: SessionDetail }) {
  const { patient, session, history } = data;
  const age = ageFrom(patient.dateOfBirth);

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl border border-surface-2 bg-white">
        <div className="flex aspect-[4/3] items-center justify-center bg-surface lg:aspect-square">
          {patient.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL foto profil pasien
            <img src={patient.photoUrl} alt={`Foto ${patient.fullName}`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[40px] font-semibold text-brand-900/30" aria-label="Belum ada foto">
              {initials(patient.fullName)}
            </span>
          )}
        </div>
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
            {patient.occupation && (
              <div className="flex justify-between gap-3">
                <dt className="text-brand-900/55">Pekerjaan</dt>
                <dd className="text-right text-brand-900">{patient.occupation}</dd>
              </div>
            )}
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
