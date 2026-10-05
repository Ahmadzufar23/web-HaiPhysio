# HaiPhysio — Design System (Kuning Logo · Putih · Hitam)

> Diperbarui: 2026-10-05 · Warna diambil langsung dari logo Hai Physio: kuning `#FCDF09` + hitam teks logo.

Semua warna brand didefinisikan **sekali** di `src/app/globals.css` (`@theme`) sebagai token Tailwind v4. Komponen memakai class token (`bg-brand-600`), **bukan** hex hardcode.

## 1. Palet

| Token | Hex | Peran | Contoh class |
|---|---|---|---|
| `brand-50` | `#fffbe6` | Latar tint lembut, kartu terpilih | `bg-brand-50` |
| `brand-100` | `#fff3bf` | Border tint, badge | `border-brand-100` |
| `brand-200` / `300` | `#ffea85` / `#ffe14d` | Aksen kuning **di atas latar gelap / foto** | `text-brand-300` |
| `brand-400` | `#fdd92a` | Stabilo judul (`.mark-swoosh`) | — |
| `brand-500` | `#fcdf09` | **Kuning logo** | `text-brand-500` (di atas hitam) |
| **`brand-600`** | **`#f5c900`** | **Primary**: tombol CTA, isian aktif, progress | `bg-brand-600 text-brand-950` |
| `brand-700` | `#e0b400` | Hover isian kuning | `hover:bg-brand-700` |
| `brand-800` | `#2b2820` | Tinta sekunder | |
| `brand-900` | `#1a1814` | Judul & teks utama, panel gelap, sidebar admin, pil menu aktif | `text-brand-900`, `bg-brand-900` |
| `brand-950` | `#0e0d0a` | **Teks di atas kuning**, latar footer | `text-brand-950` |
| `gold-600` | `#b58a00` | Border fokus input | `focus:border-gold-600` |
| `gold-700` | `#8a6500` | **Teks/ikon aksen di atas latar terang** (eyebrow, link, ikon) | `text-gold-700` |
| `gold-800` | `#6b4e00` | Hover teks aksen | `hover:text-gold-800` |

Alias lama (`primary`, `accent`, …) tetap ada di `@theme` dan menunjuk ke token di atas.

> **Aturan emas:** kuning adalah warna **isian**, bukan warna **teks** di atas putih. Kuning murni di atas putih hanya ±1,5 : 1 — tidak terbaca. Untuk teks beraksen di latar terang selalu pakai `gold-700`; teks di atas isian kuning selalu `brand-950`.

## 2. Ciri khas visual

| Elemen | Implementasi | Dipakai di |
|---|---|---|
| **Figur logo sebagai watermark** | `<LogoWatermark />` (`src/components/shared/LogoWatermark.tsx`), aset `public/brand/logo-mark.png` (figur + sapuan, dipotong dari logo asli tanpa teks) | Hero beranda, section Tentang, panel CTA, banner subhalaman, footer |
| **Cap logo di foto** | `<LogoWatermark tone="white" drift={false} />` + teks "Hai Physio" serif | Pojok foto hero, foto kartu layanan, banner |
| **Pola latar figur logo** | kelas `.bg-logo-pattern` | Section "Cara buat janji" |
| **Stabilo kuning** di kata aksen judul | kelas `.mark-swoosh` (tersapu kiri→kanan saat judul muncul) | Semua `<SectionHeading>` & hero |
| **Figur logo sebagai pemisah** | `<img src="/brand/logo-mark.png">` | Pita berjalan keluhan |
| **Tombol berbalik warna** | `.btn-primary`: kuning → hover hitam + teks kuning (warna logo) | Semua CTA utama |

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
3. Watermark logo harus tetap samar (opacity 0,06–0,22) agar tidak bersaing dengan konten; cap logo di foto boleh 0,9.
4. Logo asli `public/fisio_nobg.png` tidak diubah; versi figur saja ada di `public/brand/logo-mark.png`.

## 6. Tipografi

| Peran | Font | Pemakaian |
|---|---|---|
| Utama (`font-sans`) | **Plus Jakarta Sans** | Seluruh teks UI & judul (semibold, tracking rapat) |
| Aksen (`font-display`) | **Instrument Serif** (miring) | 1–3 kata aksen di judul, angka urutan `01/02/03`, wordmark footer |

Keduanya dimuat lewat `next/font` di `src/app/layout.tsx` (self-hosted, tanpa layout shift). Pola judul: kata biasa sans + kata aksen serif miring dengan stabilo kuning — pakai `<SectionHeading title="Fokus" accent="layanan kami" />`.

## 7. Sistem Motion

Semua animasi publik memakai komponen di `src/components/motion/` dan kelas di `src/styles/motion.css`. Easing tunggal: `--ease-out-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`).

| Komponen | Fungsi |
|---|---|
| `<Reveal variant="up\|fade\|left\|right\|scale\|blur" delay={ms}>` | Muncul saat masuk viewport. `mask` = gambar terbuka dari bawah + zoom-out |
| `<SplitText parts={[...]} />` | Judul muncul kata per kata; teks lengkap tetap dibaca screen reader (`aria-label`) |
| `<CountUp to={1985} />` | Angka berhitung naik saat terlihat |
| `<SpotlightCard>` | Cahaya kuning lembut mengikuti kursor di kartu |
| `<Marquee items={[...]} />` | Pita teks berjalan, berhenti saat hover |
| `<ScrollProgress />` | Garis progres scroll di atas layar (halaman publik) |
| `src/app/template.tsx` | Fade halus antar halaman (opacity saja, aman untuk elemen `fixed`) |

Kelas pendukung: `.btn .btn-primary/.btn-ghost/.btn-light/.btn-outline-light` (tombol pil dengan kilau saat hover), `.eyebrow`, `.grain` (tekstur panel gelap), `.bg-grid-faint`, `.animate-float`, `.animate-orb`.

**Aturan**

1. Stagger antar item 90–180 ms; jangan lebih dari ~1,2 s total sebelum konten utama terbaca.
2. Satu `IntersectionObserver` dipakai bersama (`src/hooks/useInView.ts`) — jangan membuat observer baru per elemen.
3. Konten hanya disembunyikan bila JS aktif (kelas `js` di `<html>`), jadi tanpa JS halaman tetap terbaca.
4. `prefers-reduced-motion: reduce` mematikan semua gerakan — wajib tetap didukung (pengguna lansia / sensitif gerak).
5. Jangan beri `transform` pada pembungkus yang berisi elemen `position: fixed` (sidebar admin, modal).
