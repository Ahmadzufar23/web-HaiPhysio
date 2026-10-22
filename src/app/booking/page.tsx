"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { profileService } from "@/services/profileService";
import Step1PilihLayanan from "@/components/booking/Step1PilihLayanan";
import Step2PilihWaktu from "@/components/booking/Step2PilihWaktu";
import Step3IsiData from "@/components/booking/Step3IsiData";
import Step4Konfirmasi from "@/components/booking/Step4Konfirmasi";
import BookingSummary from "@/components/booking/BookingSummary";
import { STEPS, Stepper } from "@/components/booking/BookingUI";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import { emptyDraft, type BookingDraft } from "@/components/booking/bookingDraft";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <BookingFlow />
    </Suspense>
  );
}

function BookingFlow() {
  const router = useRouter();
  // ?paket=<id paket milik pasien>: langsung menjadwalkan sisa sesi paket itu
  const ownedPackageId = useSearchParams().get("paket") ?? "";

  // Wajibkan login sebelum masuk flow booking
  useEffect(() => {
    profileService.getProfile().catch(() => {
      router.push("/login");
    });
  }, [router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<BookingDraft>({ ...emptyDraft, patientPackageId: ownedPackageId });
  const [done, setDone] = useState(false);

  const goTo = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const update = (patch: Partial<BookingDraft>, next: number) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    goTo(next);
  };

  // Ringkasan samping hanya untuk langkah 1–3; langkah 4 sudah berupa ringkasan lengkap
  const withSummary = currentStep < 4;

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        {!done && (
          <PatientPageHeader
            crumbs={[{ label: "Beranda", href: "/" }, { label: "Booking" }]}
            title="Buat janji temu"
            aside={
              <span className="text-[12px] tabular-nums text-zinc-500">
                Langkah {currentStep} dari {STEPS.length}
              </span>
            }
          >
            <Stepper current={currentStep} />
          </PatientPageHeader>
        )}

        <div className={withSummary ? "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]" : done ? "mx-auto max-w-[640px]" : "max-w-[720px]"}>
          <main className="min-w-0">
            {currentStep === 1 && (
              <Step1PilihLayanan
                initial={draft}
                onNext={(patch) => {
                  // Ganti layanan/paket → jadwal lama tidak berlaku lagi (terapis per layanan, kuota per paket)
                  const changed =
                    patch.serviceId !== draft.serviceId || patch.packageId !== draft.packageId || patch.patientPackageId !== draft.patientPackageId;
                  const reset = changed ? { slots: [] } : {};
                  update({ ...patch, ...reset }, 2);
                }}
              />
            )}
            {currentStep === 2 && (
              <Step2PilihWaktu
                draft={draft}
                onBack={() => goTo(1)}
                onPick={(slots) => setDraft((prev) => ({ ...prev, slots }))}
                onNext={(patch) => update(patch, 3)}
              />
            )}
            {currentStep === 3 && <Step3IsiData initial={draft.patientData} onBack={() => goTo(2)} onNext={(patientData) => update({ patientData }, 4)} />}
            {currentStep === 4 && <Step4Konfirmasi draft={draft} onBack={() => goTo(3)} onEdit={goTo} onDone={() => setDone(true)} />}
          </main>

          {withSummary && (
            <aside className="lg:sticky lg:top-[96px]">
              <BookingSummary draft={draft} currentStep={currentStep} onEdit={goTo} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
