import { describe, expect, it } from "vitest";
import { ACCENT_PRESETS, buildAccentTokens, contrastRatio, isValidAccent } from "../accentTheme";

const MIN_TEXT_CONTRAST = 4.5;
const MIN_LINE_CONTRAST = 3;
const WHITE = "#ffffff";

describe("isValidAccent", () => {
  it("menerima kode warna yang terlihat di atas putih", () => {
    expect(isValidAccent("#1d4ed8")).toBe(true);
    expect(isValidAccent("#F5C900")).toBe(true);
  });

  it("menolak kode tidak valid dan warna terlalu pucat", () => {
    expect(isValidAccent("biru")).toBe(false);
    expect(isValidAccent("#123")).toBe(false);
    expect(isValidAccent("#fff8e1")).toBe(false);
    expect(isValidAccent(WHITE)).toBe(false);
  });

  it("semua warna siap pakai valid", () => {
    for (const preset of ACCENT_PRESETS) expect(isValidAccent(preset.value)).toBe(true);
  });
});

describe("buildAccentTokens", () => {
  it("teks di atas tombol kuning gelap, di atas tombol biru putih", () => {
    expect(buildAccentTokens("#f5c900")["--color-on-action"]).toBe("#0b0b0d");
    expect(buildAccentTokens("#1d4ed8")["--color-on-action"]).toBe(WHITE);
  });

  it("warna utama tombol sama dengan warna yang dipilih", () => {
    const tokens = buildAccentTokens("#dc2626");
    expect(tokens["--color-action"]).toBe("#dc2626");
    expect(tokens["--color-brand-500"]).toBe("#dc2626");
    expect(tokens["--color-brand-600"]).toBe("#dc2626");
  });

  it.each(ACCENT_PRESETS.map((preset) => [preset.label, preset.value]))("warna %s tetap terbaca", (_label, value) => {
    const tokens = buildAccentTokens(value);
    expect(contrastRatio(tokens["--color-on-action"], value)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(tokens["--color-action-ink"], WHITE)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(tokens["--color-gold-700"], WHITE)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    expect(contrastRatio(tokens["--color-action-line"], WHITE)).toBeGreaterThanOrEqual(MIN_LINE_CONTRAST);
  });

  it("warna hover berbeda dari warna utama, juga untuk warna sangat gelap", () => {
    expect(buildAccentTokens("#1d4ed8")["--color-action-hover"]).not.toBe("#1d4ed8");
    expect(buildAccentTokens("#000000")["--color-action-hover"]).not.toBe("#000000");
  });

  it("menghasilkan kode warna hex yang valid untuk semua token", () => {
    for (const value of Object.values(buildAccentTokens("#7c3aed"))) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });
});
