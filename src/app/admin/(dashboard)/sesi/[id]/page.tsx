"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { BodyPoint, SessionDetail } from "@/types/api.types";
import { parsePainNotes } from "@/lib/painNotes";
import { formatRupiah } from "@/lib/format";
import PatientCard from "@/components/admin/sesi/PatientCard";
import SessionControls from "@/components/admin/sesi/SessionControls";
import MedicalRecordEditor, { type RecordDraft } from "@/components/admin/sesi/MedicalRecordEditor";
import AssessmentEditor from "@/components/admin/sesi/AssessmentEditor";
import { Notice } from "@/components/admin/shared/AdminUI";
import ProgramManager from "@/components/admin/video/ProgramManager";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";

type NoticeState = { tone: "ok" | "warn" | "error"; text: string } | null;


export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useStaffUser();
  const [data, setData] = useState<SessionDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(
    () =>
      clinicService.getSession(id).then(
        (res) => {
          setData(res.data);
          setLoadError("");
        },
        (error) => setLoadError(getApiErrorMessage(error, "Sesi tidak dapat dimuat."))
      ),
    [id]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Titik nyeri yang dipilih pasien saat booking (tersimpan di keluhan booking)
  const patientPoints: BodyPoint[] = useMemo(
    () => parsePainNotes(data?.session.complaintNotes).points.map((regionId) => ({ regionId, source: "patient" as const })),
    [data?.session.complaintNotes]
  );

  const run = async (action: () => Promise<NoticeState>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await action());
      await load();
    } catch (error) {
      setNotice({ tone: "error", text: getApiErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleStart = (therapistId: string) =>
    run(async () => {
      await clinicService.startSession(id, therapistId);
      return { tone: "ok", text: "Sesi dimulai. Absensi tercatat setelah sesi Selesai." };
    });

  const handleFinish = () =>
    run(async () => {
      const res = await clinicService.finishSession(id);
      const { recordedAmount, priceMissing } = res.data.session;
      // Terapis tidak menerima nominal dari backend
      if (recordedAmount === undefined) return { tone: "ok", text: "Sesi selesai dan tercatat." };
      return priceMissing
        ? { tone: "warn", text: "Sesi selesai. Harga paket belum diatur owner, jadi pendapatan tercatat Rp0." }
        : { tone: "ok", text: `Sesi selesai. Pendapatan ${formatRupiah(recordedAmount)} tercatat.` };
    });

  const handleCancel = () =>
    run(async () => {
      await clinicService.cancelSession(id);
      return { tone: "ok", text: "Sesi ditandai Tidak Hadir. Tidak ada absensi maupun pendapatan yang dicatat." };
    });

  const handleSave = async (draft: RecordDraft) => {
    if (!data) return;
    setSaving(true);
    setSaveError("");
    try {
      await clinicService.saveMedicalRecord(data.patient.id, draft);
      setEditing(false);
      await load();
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-surface-2 bg-white px-6 py-12 text-center">
        <p className="text-[13px] text-brand-900">{loadError}</p>
        <Link href="/admin/booking" className="mt-3 inline-block text-[13px] font-medium text-gold-700">
          Kembali ke daftar booking
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-[420px] animate-pulse rounded-xl bg-white" />
        <div className="h-[620px] animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/booking" className="inline-flex w-fit items-center gap-1.5 text-[13px] text-brand-900/60 hover:text-brand-900">
          <ArrowLeft size={14} />
          Booking & Sesi
        </Link>
        <Link href={`/admin/pasien/detail?id=${data.patient.id}`} className="text-[13px] font-medium text-brand-900/70 hover:text-brand-900">
          Progres & rekam medis lengkap pasien →
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <PatientCard data={data} />

        <div className="flex min-w-0 flex-col gap-4">
          {notice && <Notice tone={notice.tone === "error" ? "error" : "info"}>{notice.text}</Notice>}

          <SessionControls
            // key: dropdown terapis kembali ke data server setelah status berubah
            key={data.session.status}
            data={data}
            noteReady={data.session.noteReady}
            editing={editing}
            busy={busy}
            onStart={handleStart}
            onFinish={handleFinish}
            onCancel={handleCancel}
            showPrices={user.role === "owner"}
            currentUserId={user.id}
          />

          <AssessmentEditor
            key={`${data.session.status}-${data.assessment?.updatedAt ?? "baru"}`}
            sessionId={id}
            status={data.session.status}
            assessment={data.assessment}
            onSaved={() => void load()}
          />

          <MedicalRecordEditor
            key={data.medicalRecord.updatedAt ?? "baru"}
            record={data.medicalRecord}
            patientPoints={patientPoints}
            editing={editing}
            saving={saving}
            error={saveError}
            onEdit={() => {
              setSaveError("");
              setEditing(true);
            }}
            onCancelEdit={() => setEditing(false)}
            onSave={handleSave}
            videoSection={<ProgramManager patientId={data.patient.id} />}
          />
        </div>
      </div>
    </div>
  );
}
