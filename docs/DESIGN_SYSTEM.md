# HaiPhysio — Design System (Kuning Logo · Putih · Hitam)

> Diperbarui: 2026-10-05 · Kuning logo `#FCDF09` sebagai aksen di atas dasar putih/abu dingin + hitam netral.

Semua warna brand didefinisikan **sekali** di `src/app/globals.css` (`@theme`) sebagai token Tailwind v4. Komponen memakai class token (`bg-brand-600`), **bukan** hex hardcode.

## 1. Palet

| Token | Hex | Peran | Contoh class |
|---|---|---|---|
| `brand-50` | `#fffbe6` | Latar tint lembut, kartu terpilih | `bg-brand-50` |
| `brand-100` | `#fff3bf` | Border tint, badge | `border-brand-100` |
| `brand-200` / `300` | `#ffea85` / `#ffe14d` | Aksen kuning **di atas latar gelap / foto** | `text-brand-300` |
| `brand-400` | `#fdd92a` | Cadangan (tidak dipakai di halaman publik) | — |
| `brand-500` | `#fcdf09` | **Kuning logo** | `text-brand-500` (di atas hitam) |
| **`brand-600`** | **`#f5c900`** | **Primary**: tombol CTA, isian aktif, progress | `bg-brand-600 text-brand-950` |
| `brand-700` | `#e0b400` | Hover isian kuning | `hover:bg-brand-700` |
| `brand-800` | `#2a2c31` | Tinta sekunder (netral) | |
| `brand-900` | `#141518` | Judul & teks utama, panel gelap, sidebar admin | `text-brand-900`, `bg-brand-900` |
| `brand-950` | `#0b0b0d` | **Teks di atas kuning**, latar footer | `text-brand-950` |
| `gold-600` | `#b58a00` | Border fokus input | `focus:border-gold-600` |
| `gold-700` | `#8a6500` | **Teks/ikon aksen di atas latar terang** (eyebrow, link, ikon) | `text-gold-700` |
| `gold-800` | `#6b4e00` | Hover teks aksen | `hover:text-gold-800` |
| `surface` / `surface-2` | `#f4f5f7` / `#eaecf0` | Latar section selang-seling & border kartu (abu dingin) | `bg-surface`, `border-surface-2` |

Alias lama (`primary`, `accent`, …) tetap ada di `@theme` dan menunjuk ke token di atas.

> **Aturan emas:** kuning adalah warna **isian**, bukan warna **teks** di atas putih. Kuning murni di atas putih hanya ±1,5 : 1 — tidak terbaca. Untuk teks beraksen di latar terang selalu pakai `gold-700`; teks di atas isian kuning selalu `brand-950`.

## 2. Prinsip visual halaman publik

Tampilan dibuat tenang supaya informasi penting (layanan, terapis, jam, lokasi, cara booking) langsung terbaca.

1. **Setiap elemen harus menjawab pertanyaan pasien.** Tanpa emoji/ikon 3D, angka 01/02/03, atau grafik ilustrasi.
2. **Aksen logo maksimal 3 per halaman:** cap putih di foto hero, figur hitam di panel kuning (FAQ/CTA), figur kuning asli di footer.
3. **Kuning untuk tombol, panel aksen, dan satu pil `.hl` di judul hero saja.** Latar section bergantian putih dan `bg-surface` (abu dingin), bukan krem.
4. **Satu info, satu tempat per halaman.** Jam & kontak tidak diulang di banyak section; sumbernya `src/constants/clinic.ts`.
5. **Konten asli saja.** Jangan menulis testimoni, angka, atau data yang tidak bisa diverifikasi.

## 3. Warna semantik (tidak ikut kuning)

| Makna | Warna |
|---|---|
| Sukses / Selesai / Buka sekarang | hijau (`green-*`, `emerald-*`, `#027a48`) |
| Error / Dibatalkan | merah (`red-*`, `#ef4444`) |
| Peringatan (toast warning) | amber (`bg-amber-50 border-amber-200 text-amber-700`) |
| Menunggu | oranye (`orange-*`) |

## 4. Pola komponen

| Komponen | Class |
|---|---|
| Tombol primary (halaman publik) | `btn btn-primary` |
| Tombol primary (admin/form) | `bg-brand-600 hover:bg-brand-700 text-brand-950` |
| Tombol sekunder | `btn btn-ghost` |
| Badge status "Terkonfirmasi" | `border border-brand-600 text-gold-700 bg-brand-50/40` |
| Tile ikon | `bg-brand-50 text-gold-700` → hover `bg-brand-600 text-brand-950` |
| Input fokus | `focus:border-gold-600` |
| Panel gelap | `bg-brand-900` + aksen `text-brand-300` |
| Ikon Phosphor (prop `color`) | `#8A6500` (latar terang), `#1A1814` (gelap), `#FDE233` (di atas hitam) |

## 5. Kontras (WCAG 2.1 AA)

| Kombinasi | Rasio | Status |
|---|---|---|
| `brand-950` di atas `brand-600` (teks tombol) | ≈ 12 : 1 | ✅ AAA |
| `brand-500` di atas `brand-900` (hover tombol) | ≈ 13 : 1 | ✅ AAA |
| `brand-900` di atas putih (teks utama) | ≈ 17 : 1 | ✅ AAA |
| `gold-700` di atas putih (teks aksen) | ≈ 4,9 : 1 | ✅ AA |
| `brand-300` di atas `brand-900` | ≈ 13 : 1 | ✅ AAA |
| ~~Putih di atas kuning~~ | ≈ 1,5 : 1 | ❌ jangan dipakai |

## 5b. Aturan

1. Jangan menambah hex brand baru di komponen — tambah/ubah token di `globals.css`.
2. Jangan pernah `text-white` di atas isian kuning, dan jangan `text-brand-500/600` di atas latar putih.
3. Kontainer halaman publik: `mx-auto max-w-[1200px] px-5 md:px-8`, jarak section `py-16 md:py-20`. Kartu `.card` (24px), panel besar `rounded-[28px]`.
4. Logo asli `public/fisio_nobg.png` tidak diubah. Di footer gelap dipakai figur `public/brand/logo-mark.png` + teks putih.

## 6. Tipografi

Satu huruf saja: **Plus Jakarta Sans** (`font-sans`), dimuat lewat `next/font` di `src/app/layout.tsx`.

| Peran | Ukuran |
|---|---|
| Judul hero (h1) | 40px → 56px (lg) |
| Judul halaman dalam (h1, `<HeroBanner>`) | 36px → 50px |
| Judul section (h2, `<SectionHeading>`) | 30px → 38px, `font-extrabold` |
| Teks paragraf | 15px → 16px |
| Lencana (`.badge`) | 13px, pil putih + titik kuning |

## 7. Motion

Secukupnya: satu efek masuk dan transisi warna saat hover.

| Elemen | Fungsi |
|---|---|
| `<Reveal delay={ms}>` | Fade naik 12px saat masuk viewport (0,6 s) |
| `src/app/template.tsx` | Fade halus antar halaman (opacity saja, aman untuk elemen `fixed`) |

Kelas pendukung di `src/styles/motion.css`: `.btn .btn-primary/.btn-ghost/.btn-dark`, `.card` (kartu standar, radius 24px), `.badge` (lencana pil), `.hl` (pil kuning, hanya hero), `.bg-dots` (latar titik hero/header).

**Aturan**

1. Jangan menambah animasi berulang (float, orb, marquee, teks berputar) atau efek yang mengikuti kursor.
2. Satu `IntersectionObserver` dipakai bersama (`src/hooks/useInView.ts`).
3. Konten hanya disembunyikan bila JS aktif (kelas `js` di `<html>`), jadi tanpa JS halaman tetap terbaca.
4. `prefers-reduced-motion: reduce` mematikan semua gerakan.
5. Jangan beri `transform` pada pembungkus yang berisi elemen `position: fixed` (sidebar admin, modal).
