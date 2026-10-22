import { formatLongDate, formatSlotTime } from "@/lib/format";

// Data yang dikumpulkan langkah 1–3 lalu dikirim di langkah 4
export type PatientDraft = {
  name: string;
  phone: string;
  email: string;
  complaint: string;
  painPoints: string[];
  painScale: number | null;
};

export type SelectedSlot = {
  slotId: string;
  therapistId: string;
  therapistName: string;
  slotDate: string;
  startTime: string;
};

export type BookingDraft = {
  serviceId: string;
  serviceName: string;
  /** Paket baru dari katalog */
  packageId: string;
  /** Paket milik pasien yang sisa sesinya dijadwalkan (bukan beli baru) */
  patientPackageId: string;
  packageName: string;
  packagePriceLabel: string;
  /** Maksimal jadwal yang bisa dipilih: jumlah sesi paket baru, atau sisa sesi paket lama */
  sessionQuota: number;
  slots: SelectedSlot[];
  patientData: PatientDraft | null;
};

export const emptyDraft: BookingDraft = {
  serviceId: "",
  serviceName: "",
  packageId: "",
  patientPackageId: "",
  packageName: "",
  packagePriceLabel: "",
  sessionQuota: 0,
  slots: [],
  patientData: null,
};

/** "Selasa, 20 Oktober 2026 · 14.00 WIB" */
export const slotLabel = (s: Pick<SelectedSlot, "slotDate" | "startTime">) => `${formatLongDate(s.slotDate)} · ${formatSlotTime(s.startTime)} WIB`;

/** Jadwal terurut dari yang paling dekat */
export const sortSlots = (slots: SelectedSlot[]) => [...slots].sort((a, b) => `${a.slotDate} ${a.startTime}`.localeCompare(`${b.slotDate} ${b.startTime}`));

/** "2 dari 5 sesi dijadwalkan" */
export const quotaLabel = (d: BookingDraft) => (d.sessionQuota > 1 ? `${d.slots.length} dari ${d.sessionQuota} sesi dijadwalkan` : "");
