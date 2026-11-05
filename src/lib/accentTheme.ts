// Warna aksen klinik: satu kode warna diturunkan menjadi token CSS di globals.css.
// Warna status (error, sukses) sengaja tidak ikut. Tanpa warna, situs memakai token netral bawaan.

const HEX_PATTERN = /^#[0-9a-f]{6}$/;
const WHITE = "#ffffff";
const INK = "#0b0b0d";
const BLACK = "#000000";

// Di bawah ini tombol nyaris tidak terlihat di atas putih. Harus sama dengan validator backend.
const MIN_ACCENT_CONTRAST_ON_WHITE = 1.4;
const MIN_TEXT_CONTRAST = 4.5;
const MIN_LINE_CONTRAST = 3;
const DARKEN_STEP = 0.05;
const DARK_COLOR_LUMINANCE = 0.05;

const CACHE_KEY = "clinic_accent_vars";

export const ACCENT_PRESETS = [
  { label: "Kuning", value: "#f5c900" },
  { label: "Oranye", value: "#ea580c" },
  { label: "Merah", value: "#dc2626" },
  { label: "Hijau", value: "#15803d" },
  { label: "Teal", value: "#0f766e" },
  { label: "Biru", value: "#1d4ed8" },
  { label: "Ungu", value: "#7c3aed" },
] as const;

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)) as Rgb;
const toHex = (rgb: number[]) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

/** Campur warna dengan warna lain; amount 0 = warna asal, 1 = warna lain. */
function mix(hex: string, other: string, amount: number): string {
  const target = toRgb(other);
  return toHex(toRgb(hex).map((channel, index) => channel + (target[index] - channel) * amount));
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Digelapkan bertahap sampai terbaca di atas putih. */
function darkenUntilReadable(hex: string, minContrast: number): string {
  let amount = 0;
  let color = hex;
  while (contrastRatio(color, WHITE) < minContrast && amount < 1) {
    amount += DARKEN_STEP;
    color = mix(hex, BLACK, amount);
  }
  return color;
}

export function isValidAccent(value: string): boolean {
  const hex = value.toLowerCase();
  return HEX_PATTERN.test(hex) && contrastRatio(hex, WHITE) >= MIN_ACCENT_CONTRAST_ON_WHITE;
}

export function buildAccentTokens(accent: string): Record<string, string> {
  const hex = accent.toLowerCase();
  // Warna sangat gelap dibuat lebih terang saat hover, supaya perubahannya tetap terlihat
  const hover = luminance(hex) < DARK_COLOR_LUMINANCE ? mix(hex, WHITE, 0.15) : mix(hex, BLACK, 0.12);
  const onAction = contrastRatio(WHITE, hex) >= contrastRatio(INK, hex) ? WHITE : INK;
  const ink = darkenUntilReadable(hex, MIN_TEXT_CONTRAST);
  const line = darkenUntilReadable(hex, MIN_LINE_CONTRAST);
  const soft = mix(hex, WHITE, 0.92);

  return {
    "--color-brand-50": soft,
    "--color-brand-100": mix(hex, WHITE, 0.82),
    "--color-brand-200": mix(hex, WHITE, 0.6),
    "--color-brand-300": mix(hex, WHITE, 0.4),
    "--color-brand-400": mix(hex, WHITE, 0.2),
    "--color-brand-500": hex,
    "--color-brand-600": hex,
    "--color-brand-700": hover,
    "--color-gold-600": line,
    "--color-gold-700": ink,
    "--color-gold-800": mix(ink, BLACK, 0.2),
    "--color-action": hex,
    "--color-action-hover": hover,
    "--color-on-action": onAction,
    "--color-action-soft": soft,
    "--color-action-line": line,
    "--color-action-ink": ink,
  };
}

function cacheTokens(value: string | null) {
  try {
    if (value) localStorage.setItem(CACHE_KEY, value);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    // Tanpa cache warna tetap terpasang, hanya sempat netral sesaat saat halaman dibuka
  }
}

/** Pasang warna klinik di <html>. Null mengembalikan tampilan netral. */
export function applyAccentTheme(accent: string | null) {
  const root = document.documentElement;
  root.style.cssText = "";
  if (accent === null) {
    cacheTokens(null);
    return;
  }
  for (const [name, value] of Object.entries(buildAccentTokens(accent))) root.style.setProperty(name, value);
  cacheTokens(root.style.cssText);
}

// Dijalankan sebelum halaman tampil, supaya warna klinik tidak berkedip dari netral.
export const ACCENT_BOOT_SCRIPT = `try{if(!location.pathname.startsWith('/super-admin')){var v=localStorage.getItem('${CACHE_KEY}');if(v)document.documentElement.style.cssText=v}}catch(e){}`;
