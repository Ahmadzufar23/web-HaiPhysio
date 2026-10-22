"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { MedicalRecordReport } from "@/types/api.types";
import MedicalRecordPrint from "@/components/shared/MedicalRecordPrint";

// /rekam-medis/cetak — rekam medis milik pasien yang login, siap cetak/PDF
export default function PatientMedicalRecordPrintPage() {
  const router = useRouter();
  const [report, setReport] = useState<MedicalRecordReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    clinicService
      .getMedicalRecordReport()
      .then((res) => setReport(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) router.push("/login");
        else setError(getApiErrorMessage(err, "Rekam medis tidak dapat dimuat."));
      });
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8 print:bg-white print:p-0">
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
        <Link href="/riwayat-booking" className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900 print:hidden">
          <ArrowLeft size={12} />
          Riwayat terapi
        </Link>
        {error ? <p className="text-[13px] text-red-600">{error}</p> : report ? <MedicalRecordPrint report={report} /> : <div className="h-96 animate-pulse rounded-lg bg-white" />}
      </div>
    </div>
  );
}
