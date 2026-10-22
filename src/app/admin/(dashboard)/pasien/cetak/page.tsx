"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { MedicalRecordReport } from "@/types/api.types";
import MedicalRecordPrint from "@/components/shared/MedicalRecordPrint";

// /admin/pasien/cetak?id=<patientId> — rekam medis siap cetak/PDF untuk staf
function PrintPage() {
  const patientId = useSearchParams().get("id") ?? "";
  const [report, setReport] = useState<MedicalRecordReport | null>(null);
  const [error, setError] = useState(patientId ? "" : "Pasien tidak ditemukan.");

  useEffect(() => {
    if (!patientId) return;
    clinicService
      .getMedicalRecordReport(patientId)
      .then((res) => setReport(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Rekam medis tidak dapat dimuat.")));
  }, [patientId]);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/admin/pasien/detail?id=${patientId}`} className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900 print:hidden">
        <ArrowLeft size={12} />
        Detail pasien
      </Link>
      {error ? <p className="text-[13px] text-red-600">{error}</p> : report ? <MedicalRecordPrint report={report} /> : <div className="h-96 animate-pulse rounded-lg bg-white" />}
    </div>
  );
}

export default function AdminMedicalRecordPrintPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-white" />}>
      <PrintPage />
    </Suspense>
  );
}
