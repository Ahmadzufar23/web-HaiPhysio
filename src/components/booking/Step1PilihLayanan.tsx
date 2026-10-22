"use client";

import { useState, useEffect } from "react";
import { servicesData } from "../../constants/data";
import type { FocusArea, PatientPackage, TherapyPackage } from "@/types/api.types";
import { bookingService } from "@/services/bookingService";
import { clinicService } from "@/services/clinicService";
import { formatRupiah } from "@/lib/format";
import { ErrorNotice, RadioDot, Section, StepNav, ui } from "./BookingUI";
import type { BookingDraft } from "./bookingDraft";

type Step1Result = Pick<BookingDraft, "serviceId" | "serviceName" | "packageId" | "patientPackageId" | "packageName" | "packagePriceLabel" | "sessionQuota">;

interface Step1Props {
  initial: BookingDraft;
  onNext: (result: Step1Result) => void;
}

const priceLabel = (pkg: TherapyPackage) =>
  pkg.pricePerSession !== null ? `${formatRupiah(pkg.pricePerSession)} / sesi` : pkg.isHomeVisit ? "Harga menyesuaikan jarak" : "Harga dikonfirmasi klinik";

export default function Step1PilihLayanan({ initial, onNext }: Step1Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initial.serviceId || null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(initial.packageId || null);
  const [ownedId, setOwnedId] = useState<string | null>(initial.patientPackageId || null);
  const [apiServices, setApiServices] = useState<FocusArea[]>([]);
  const [packages, setPackages] = useState<TherapyPackage[]>([]);
  const [owned, setOwned] = useState<PatientPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // UUID layanan & paket terapi dari backend, plus paket milik pasien yang masih punya sisa sesi
  useEffect(() => {
    Promise.all([bookingService.getFocusAreas(), clinicService.getPackages(), bookingService.getMyPackages().catch(() => null)])
      .then(([focusRes, packageRes, ownedRes]) => {
        setApiServices(focusRes.data.focusAreas);
        setPackages(packageRes.data.packages);
        setOwned((ownedRes?.data.packages ?? []).filter((p) => p.remaining > 0));
      })
      .catch(() => setError("Gagal memuat layanan. Muat ulang halaman atau coba lagi nanti."))
      .finally(() => setIsLoading(false));
  }, []);

  const ownedPackage = owned.find((p) => p.id === ownedId) ?? null;
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) ?? null;
  const selectedService = apiServices.find((s) => s.id === selectedId) ?? null;
  const canContinue = Boolean(ownedPackage?.focusArea || (selectedService && selectedPackage));

  const handleNext = () => {
    if (ownedPackage?.focusArea) {
      onNext({
        serviceId: ownedPackage.focusArea.id,
        serviceName: `Fisioterapi ${ownedPackage.focusArea.name ?? ""}`.trim(),
        packageId: "",
        patientPackageId: ownedPackage.id,
        packageName: ownedPackage.packageName,
        packagePriceLabel: `Sisa ${ownedPackage.remaining} dari ${ownedPackage.totalSessions} sesi`,
        sessionQuota: ownedPackage.remaining,
      });
      return;
    }
    if (!selectedService || !selectedPackage) return;
    onNext({
      serviceId: selectedService.id,
      serviceName: `Fisioterapi ${selectedService.name}`,
      packageId: selectedPackage.id,
      patientPackageId: "",
      packageName: selectedPackage.name,
      packagePriceLabel: priceLabel(selectedPackage),
      // Homecare tanpa jumlah sesi dihitung 1 sesi per pemesanan (sama dengan BE)
      sessionQuota: selectedPackage.totalSessions ?? 1,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorNotice>{error}</ErrorNotice>}

      {owned.length > 0 && (
        <Section title="Lanjutkan paket kamu" description="Jadwalkan sisa sesi dari paket yang sudah kamu ambil, tanpa membeli paket baru.">
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Paket milikmu">
            {owned.map((pkg) => {
              const isSelected = ownedId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setOwnedId(isSelected ? null : pkg.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 ${ui.option(isSelected)}`}
                >
                  <RadioDot checked={isSelected} />
                  <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                    <span className="text-[13px] font-medium text-zinc-900">{pkg.packageName}</span>
                    <span className="text-[12px] text-zinc-500">{pkg.focusArea?.name ? `Fisioterapi ${pkg.focusArea.name}` : "Layanan sebelumnya"}</span>
                  </span>
                  <span className="shrink-0 text-right text-[12px] font-medium text-zinc-900">
                    Sisa {pkg.remaining} dari {pkg.totalSessions} sesi
                  </span>
                </button>
              );
            })}
          </div>
          {ownedPackage && <p className="mt-3 text-[12px] text-zinc-500">Layanan mengikuti paket ini. Batalkan pilihan untuk membeli paket baru.</p>}
        </Section>
      )}

      <div className={ownedPackage ? "pointer-events-none flex flex-col gap-4 opacity-40" : "flex flex-col gap-4"} aria-disabled={Boolean(ownedPackage)}>
        <Section title="Layanan" description="Pilih yang paling sesuai dengan keluhanmu. Terapis akan menyesuaikan setelah pemeriksaan.">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[132px] animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Layanan">
              {servicesData.map((service) => {
                // Hanya layanan yang ada di backend (punya UUID) yang bisa dipilih
                const uuid = apiServices.find((api) => api.slug === service.id)?.id ?? null;
                const isSelected = uuid !== null && selectedId === uuid;
                return (
                  <button
                    key={service.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!uuid}
                    onClick={() => uuid && setSelectedId(uuid)}
                    className={`flex flex-col gap-3 p-3.5 disabled:cursor-not-allowed disabled:opacity-40 ${ui.option(isSelected)}`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 [&>svg]:h-4 [&>svg]:w-4">{service.icon}</span>
                      <RadioDot checked={isSelected} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-900">{service.titleBold}</p>
                      <p className="text-[12px] text-zinc-500">{service.subtitle}</p>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500">{service.cases.join(" · ")}</p>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Paket terapi" description="Harga per sesi dikunci saat paket diambil. Pilih jadwal sebanyak jumlah sesi paket; sisanya bisa dijadwalkan nanti.">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <p className="text-[13px] text-zinc-500">Paket belum tersedia. Silakan hubungi klinik.</p>
          ) : (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Paket terapi">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 ${ui.option(isSelected)}`}
                  >
                    <RadioDot checked={isSelected} />
                    <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <span className="text-[13px] font-medium text-zinc-900">{pkg.name}</span>
                      <span className="text-[12px] text-zinc-500">{pkg.isHomeVisit ? "Terapis datang ke rumah" : `${pkg.totalSessions} sesi · 1 jam per sesi`}</span>
                    </span>
                    <span className={`shrink-0 text-right text-[12px] ${pkg.pricePerSession !== null ? "font-medium text-zinc-900" : "text-zinc-400"}`}>{priceLabel(pkg)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <StepNav onNext={handleNext} disabled={!canContinue} hint={canContinue ? undefined : "Pilih layanan dan paket"} />
    </div>
  );
}
