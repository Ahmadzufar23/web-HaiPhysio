"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "@phosphor-icons/react";
import { bookingService, type CreateBookingPayload } from "@/services/bookingService";
import { CLINIC_LOCATION } from "@/constants/data";
import { getApiErrorMessage } from "@/app/utils/api";
import type { CreateBookingResult } from "@/types/api.types";
import BodyMap from "@/components/bodymap/BodyMap";
import { BODY_REGIONS, regionLabel } from "@/constants/bodyRegions";
import { formatPainNotes, clearPainDraft } from "@/lib/painNotes";
import { painLabel } from "@/constants/painScale";
import { ErrorNotice, InfoRow, Section, StepNav, ui } from "./BookingUI";
import { quotaLabel, slotLabel, type BookingDraft } from "./bookingDraft";

interface Step4Props {
  draft: BookingDraft;
  onBack: () => void;
  onEdit: (step: number) => void;
  onDone: () => void;
}

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
    Ubah
  </button>
);

export default function Step4Konfirmasi({ draft, onBack, onEdit, onDone }: Step4Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [created, setCreated] = useState<CreateBookingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const patient = draft.patientData;
  const painPoints = patient?.painPoints ?? [];

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Paket baru: package_id + focus_id; sisa paket: patient_package_id (layanan ikut paketnya).
      // Titik body map digabung ke complaint_notes, tingkat nyeri punya field sendiri.
      const payload: CreateBookingPayload = {
        slot_ids: draft.slots.map((s) => s.slotId),
        pain_level: patient?.painScale ?? 0,
        ...(draft.patientPackageId ? { patient_package_id: draft.patientPackageId } : { package_id: draft.packageId, focus_id: draft.serviceId }),
      };
      const complaintNotes = formatPainNotes({ points: painPoints, text: patient?.complaint ?? "" });
      if (complaintNotes) payload.complaint_notes = complaintNotes;
      if (patient?.name.trim()) payload.patient_name = patient.name.trim();
      if (patient?.phone.trim()) payload.patient_phone = patient.phone.trim();

      const res = await bookingService.createBooking(payload);
      // Sukses hanya kalau BE benar-benar mengembalikan kode reservasi
      if (!res.data?.bookings?.length || !res.data.bookings.every((b) => b.bookingReferenceCode)) {
        throw new Error("Respons server tidak berisi data booking. Cek Riwayat Booking sebelum mencoba lagi.");
      }
      setCreated(res.data);
      clearPainDraft();
      onDone();
      window.scrollTo({ top: 0 });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Gagal memproses reservasi."));
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sessionRows = (
    <dl className="divide-y divide-zinc-100">
      <InfoRow label="Layanan">{draft.serviceName || "—"}</InfoRow>
      <InfoRow label="Paket">
        {draft.packageName || "—"}
        {draft.packagePriceLabel && <span className="text-zinc-500"> · {draft.packagePriceLabel}</span>}
      </InfoRow>
      <InfoRow label="Fisioterapis">{[...new Set(draft.slots.map((s) => s.therapistName))].join(", ") || "—"}</InfoRow>
      <InfoRow label="Jadwal">
        {draft.slots.length === 0 ? (
          "—"
        ) : (
          <ol className="flex flex-col gap-0.5">
            {draft.slots.map((s) => {
              const code = created?.bookings.find((b) => b.slotId === s.slotId)?.bookingReferenceCode;
              return (
                <li key={s.slotId}>
                  {slotLabel(s)}
                  {code && <span className="ml-2 font-mono text-[12px] text-zinc-500">{code}</span>}
                </li>
              );
            })}
          </ol>
        )}
        {quotaLabel(draft) && <p className="mt-1 text-[12px] text-zinc-500">{quotaLabel(draft)}</p>}
      </InfoRow>
      <InfoRow label="Lokasi">{CLINIC_LOCATION}</InfoRow>
    </dl>
  );

  // --- Setelah booking tersimpan ---
  if (created) {
    const code = created.booking.bookingReferenceCode;
    const remaining = created.patientPackage?.remaining ?? 0;
    return (
      <div className="flex flex-col gap-4">
        <div className={`${ui.card} flex flex-col items-center px-5 py-8 text-center`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Check size={18} weight="bold" />
          </span>
          <h1 className="mt-4 text-[18px] font-semibold tracking-tight text-zinc-900">Janji temu berhasil dibuat</h1>
          <p className="mt-1 max-w-[420px] text-[13px] text-zinc-500">
            {created.bookings.length > 1
              ? `${created.bookings.length} jadwal tersimpan. Tunjukkan nomor reservasi tiap sesi saat tiba di klinik.`
              : "Tunjukkan nomor reservasi ini saat tiba di klinik. Detailnya juga tersimpan di Riwayat Booking."}
            {remaining > 0 && ` Sisa ${remaining} sesi paket bisa dijadwalkan dari Riwayat Booking.`}
          </p>

          {/* Lebih dari satu jadwal: kode tiap sesi tampil di Detail sesi */}
          {created.bookings.length === 1 && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-4 pr-1.5">
              <span className="font-mono text-[15px] font-semibold tracking-wider text-zinc-900">{code}</span>
              <button type="button" onClick={() => copyCode(code)} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-zinc-600 hover:bg-white hover:text-zinc-900">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          )}
        </div>

        <Section title="Detail sesi">{sessionRows}</Section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href="/" className={ui.btnSecondary}>
            Kembali ke beranda
          </Link>
          <Link href="/riwayat-booking" className={ui.btnPrimary}>
            Lihat riwayat booking
          </Link>
        </div>
      </div>
    );
  }

  // --- Tinjau sebelum dikirim ---
  return (
    <div className="flex flex-col gap-4">
      {errorMessage && <ErrorNotice>{errorMessage}</ErrorNotice>}

      <Section title="Sesi terapi" actions={<EditButton onClick={() => onEdit(2)} />}>
        {sessionRows}
      </Section>

      <Section title="Pasien & keluhan" actions={<EditButton onClick={() => onEdit(3)} />}>
        <dl className="divide-y divide-zinc-100">
          <InfoRow label="Nama">{patient?.name || "—"}</InfoRow>
          <InfoRow label="Telepon">{patient?.phone || "—"}</InfoRow>
          <InfoRow label="Email">{patient?.email || "—"}</InfoRow>
          <InfoRow label="Tingkat nyeri">{painLabel(patient?.painScale)}</InfoRow>
          <InfoRow label="Area nyeri">
            {painPoints.length === 0 ? (
              <span className="text-zinc-400">Tidak ditandai</span>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {/* Hanya sisi depan/belakang yang berisi titik terpilih */}
                <div className="flex gap-2">
                  {(["front", "back"] as const)
                    .filter((view) => BODY_REGIONS.some((r) => painPoints.includes(r.id) && r.views.includes(view)))
                    .map((view) => (
                      <div key={view} className="flex w-[72px] flex-col items-center gap-1">
                        <BodyMap view={view} selected={painPoints} dots="selected" />
                        <span className="text-[10px] text-zinc-400">{view === "front" ? "Depan" : "Belakang"}</span>
                      </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {painPoints.map((id) => (
                    <span key={id} className="rounded-md border border-zinc-200 px-2 py-0.5 text-[12px] text-zinc-700">
                      {regionLabel(id)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </InfoRow>
          <InfoRow label="Keluhan">{patient?.complaint ? <span className="whitespace-pre-line leading-relaxed">{patient.complaint}</span> : <span className="text-zinc-400">—</span>}</InfoRow>
        </dl>
      </Section>

      <p className="text-[12px] text-zinc-500">Dengan mengonfirmasi, slot ini langsung dipesan atas namamu. Pembayaran dilakukan di klinik.</p>

      <StepNav onBack={onBack} onNext={handleConfirm} disabled={isLoading} nextLabel={isLoading ? "Memproses…" : "Konfirmasi booking"} />
    </div>
  );
}
