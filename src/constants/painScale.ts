// Skala tingkat nyeri yang diisi pasien saat booking (masukan fisioterapis: 1–5).
// Kalau klinik memakai 1–4, ubah PAIN_SCALE_MAX & PAIN_LEVELS di sini dan PAIN_SCALE_MAX di backend/src/constants/clinic.ts.
export const PAIN_SCALE_MAX = 5;

export const PAIN_LEVELS: { value: number; label: string }[] = [
  { value: 1, label: "Sangat ringan" },
  { value: 2, label: "Ringan" },
  { value: 3, label: "Sedang" },
  { value: 4, label: "Berat" },
  { value: 5, label: "Sangat berat" },
];

export const painLabel = (level: number | null | undefined) =>
  level ? `${level}/${PAIN_SCALE_MAX} · ${PAIN_LEVELS.find((l) => l.value === level)?.label ?? ""}` : "—";
