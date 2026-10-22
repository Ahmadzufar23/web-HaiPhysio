import { BODY_REGIONS, regionLabel } from "@/constants/bodyRegions";

// Backend belum punya kolom khusus titik nyeri, jadi body map disimpan di complaint_notes
// (maks 300 karakter) dalam format yang tetap terbaca terapis:
//   "Area nyeri: Bahu kanan, Punggung bawah.\n<keluhan bebas>"
// parsePainNotes() membaca balik format ini supaya body map bisa ditampilkan lagi.
// Tingkat nyeri dikirim terpisah sebagai pain_level; "Skala nyeri: x/y." hanya ada di booking lama.

export const COMPLAINT_MAX = 300;

export interface PainData {
  points: string[];
  scale: number | null;
  text: string;
}

export function formatPainNotes({ points, text }: Pick<PainData, "points" | "text">, max = COMPLAINT_MAX): string {
  const parts: string[] = [];
  if (points.length) parts.push(`Area nyeri: ${points.map(regionLabel).join(", ")}.`);
  const header = parts.join(" ");
  const body = text.trim();
  const joined = header && body ? `${header}\n${body}` : header || body;
  return joined.slice(0, max);
}

export function parsePainNotes(notes: string | null | undefined): PainData {
  if (!notes) return { points: [], scale: null, text: "" };
  let rest = notes;
  let points: string[] = [];
  let scale: number | null = null;

  const area = rest.match(/^Area nyeri: ([^.]+)\.\s*/);
  if (area) {
    const labels = area[1].split(",").map((s) => s.trim().toLowerCase());
    points = BODY_REGIONS.filter((r) => labels.includes(r.label.toLowerCase())).map((r) => r.id);
    rest = rest.slice(area[0].length);
  }
  const sc = rest.match(/^Skala nyeri: (\d{1,2})\/\d{1,2}\.\s*/);
  if (sc) {
    scale = Number(sc[1]);
    rest = rest.slice(sc[0].length);
  }
  return { points, scale, text: rest.trim() };
}

// Pilihan dari demo body map di Beranda dibawa ke form booking (per tab, tidak wajib ada).
const DRAFT_KEY = "hp_pain_draft";

export function savePainDraft(points: string[]) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(points));
  } catch {
    /* storage diblokir: abaikan */
  }
}

/** Baca draf tanpa menghapus (aman dipanggil berulang, mis. di React Strict Mode). */
export function readPainDraft(): string[] {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => BODY_REGIONS.some((r) => r.id === id)) : [];
  } catch {
    return [];
  }
}

export function clearPainDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* abaikan */
  }
}
