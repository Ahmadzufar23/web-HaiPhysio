// Pilihan jenis kelamin pasien (sama dengan GENDERS di backend validators/auth.validator.ts)
export const GENDER_OPTIONS = [
  { value: "laki-laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

export const genderLabel = (g: string | null | undefined) => GENDER_OPTIONS.find((o) => o.value === g)?.label ?? null;

// Singkatan untuk kolom tabel (L / P)
export const genderShort = (g: string | null | undefined) => (g === "laki-laki" ? "L" : g === "perempuan" ? "P" : null);

// IMT (Indeks Massa Tubuh / BMI) = berat (kg) / tinggi (m)². Klasifikasi standar internasional WHO.
export const BMI_CATEGORIES = [
  { max: 18.5, label: "Berat badan kurang", ideal: false },
  { max: 25, label: "Ideal", ideal: true },
  { max: 30, label: "Berat badan berlebih", ideal: false },
  { max: Infinity, label: "Obesitas", ideal: false },
] as const;

export const bmiOf = (heightCm: number | null | undefined, weightKg: number | null | undefined) => {
  if (!heightCm || !weightKg) return null;
  const value = Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;
  const category = BMI_CATEGORIES.find((c) => value < c.max)!;
  return { value, label: category.label, ideal: category.ideal };
};
