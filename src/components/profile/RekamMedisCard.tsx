"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import BodyMap from "@/components/bodymap/BodyMap";
import { regionLabel } from "@/constants/bodyRegions";
import { clinicService } from "@/services/clinicService";
import type { MedicalRecord } from "@/types/api.types";
import { formatDateTime } from "@/lib/format";

function Item({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-1 whitespace-pre-line text-[13px] leading-relaxed ${value ? "text-zinc-800" : "text-zinc-400"}`}>{value || "Belum diisi terapis"}</p>
    </div>
  );
}

/** Rekam medis terkini (hanya baca), diperbarui terapis setiap sesi. Dipakai di kolom samping Riwayat. */
export default function RekamMedisCard() {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    clinicService
      .getMyMedicalRecord()
      .then((res) => setRecord(res.data.medicalRecord))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const filled = Boolean(record?.updatedAt);
  const patientIds = record?.bodyPoints.filter((p) => p.source === "patient").map((p) => p.regionId) ?? [];
  const therapistIds = record?.bodyPoints.filter((p) => p.source === "therapist").map((p) => p.regionId) ?? [];

  return (
    <section aria-labelledby="rekam-medis-title" className="rounded-xl border border-zinc-200 bg-white">
      <header className="border-b border-zinc-100 px-4 py-3">
        <h2 id="rekam-medis-title" className="text-[13px] font-semibold text-zinc-900">
          Rekam medis terkini
        </h2>
        <p className="mt-0.5 text-[11px] text-zinc-500">{record?.updatedAt ? `Diperbarui ${formatDateTime(record.updatedAt)}` : "Diisi terapis setelah sesi pertamamu."}</p>
      </header>

      {!record ? (
        <div className="m-4 h-40 animate-pulse rounded-lg bg-zinc-100" />
      ) : !filled ? (
        <p className="px-4 py-6 text-center text-[12px] text-zinc-500">Belum ada catatan dari terapis.</p>
      ) : (
        <div className="px-4">
          {/* Gambar tubuh selalu tampil; tanpa titik tetap ada keterangan supaya tidak terlihat hilang */}
          <div className="border-b border-zinc-100 py-3">
            <div className="mx-auto grid max-w-[200px] grid-cols-2 gap-2">
              {(["front", "back"] as const).map((view) => (
                <BodyMap key={view} view={view} selected={patientIds} marked={therapistIds} dots="none" className="w-full" />
              ))}
            </div>
            <p className={`mt-2 text-center text-[11px] leading-relaxed ${record.bodyPoints.length > 0 ? "text-zinc-500" : "text-zinc-400"}`}>
              {record.bodyPoints.length > 0 ? record.bodyPoints.map((p) => regionLabel(p.regionId)).join(", ") : "Belum ada titik berobat"}
            </p>
          </div>
          <div className="divide-y divide-zinc-100">
            <Item label="Diagnosis" value={record.diagnosis} />
            <Item label="Obat & penanganan" value={record.medications} />
            <Item label="Latihan di rumah" value={record.homeExercise} />
          </div>
          <Link href="/video-terapi" className="flex items-center justify-between border-t border-zinc-100 py-3 text-[12px] font-medium text-zinc-900 hover:text-zinc-600">
            Program video latihan
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}
