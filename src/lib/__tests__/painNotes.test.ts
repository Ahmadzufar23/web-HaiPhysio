import { describe, expect, it } from "vitest";
import { COMPLAINT_MAX, formatPainNotes, parsePainNotes } from "@/lib/painNotes";
import { BODY_REGIONS } from "@/constants/bodyRegions";

const [a, b] = BODY_REGIONS;

describe("formatPainNotes / parsePainNotes", () => {
  it("menyimpan area body map lalu membacanya kembali", () => {
    const notes = formatPainNotes({ points: [a.id, b.id], text: "Sakit saat naik tangga" });
    expect(notes).toBe(`Area nyeri: ${a.label}, ${b.label}.\nSakit saat naik tangga`);
    expect(parsePainNotes(notes)).toEqual({ points: [a.id, b.id], scale: null, text: "Sakit saat naik tangga" });
  });

  it("hanya teks bila tidak ada area, dan kosong bila keduanya kosong", () => {
    expect(formatPainNotes({ points: [], text: "  nyeri lutut  " })).toBe("nyeri lutut");
    expect(formatPainNotes({ points: [], text: "" })).toBe("");
  });

  it("tidak melebihi batas complaint_notes backend", () => {
    expect(formatPainNotes({ points: [a.id], text: "x".repeat(500) })).toHaveLength(COMPLAINT_MAX);
  });

  it("membaca format lama yang masih menyimpan skala nyeri", () => {
    expect(parsePainNotes(`Area nyeri: ${a.label}. Skala nyeri: 7/10. Kaku pagi hari`)).toEqual({ points: [a.id], scale: 7, text: "Kaku pagi hari" });
  });

  it("keluhan biasa tanpa header tetap utuh", () => {
    expect(parsePainNotes("Nyeri punggung")).toEqual({ points: [], scale: null, text: "Nyeri punggung" });
    expect(parsePainNotes(null)).toEqual({ points: [], scale: null, text: "" });
  });
});
