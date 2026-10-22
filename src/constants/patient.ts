// Pilihan jenis kelamin pasien (sama dengan GENDERS di backend validators/auth.validator.ts)
export const GENDER_OPTIONS = [
  { value: "laki-laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

export const genderLabel = (g: string | null | undefined) => GENDER_OPTIONS.find((o) => o.value === g)?.label ?? null;

// Singkatan untuk kolom tabel (L / P)
export const genderShort = (g: string | null | undefined) => (g === "laki-laki" ? "L" : g === "perempuan" ? "P" : null);
