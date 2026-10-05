# 🤖 AGENTS & AI ASSISTANT GUIDELINES — HaiPhysio Frontend

Dokumen ini berisi panduan, konvensi koding, dan aturan arsitektur untuk AI coding assistants (Antigravity, Claude, Copilot, Cursor) yang bekerja pada repositori `web-HaiPhysio`.

---

## 🏗️ 1. Gambaran Arsitektur & Teknologi

- **Framework:** Next.js 15+ (App Router architecture with React 19).
- **TypeScript:** Strict type checking aktif.
- **Styling:** Tailwind CSS v4 dengan palet brand HaiPhysio dari logo — **kuning, putih & hitam** (token di `src/app/globals.css`):
  - Primary Yellow (isian/CTA): `brand-600` #f5c900, hover `brand-700` #e0b400 — teks di atasnya WAJIB `text-brand-950`, bukan putih
  - Kuning logo: `brand-500` #fcdf09
  - Ink (teks, judul, panel gelap, sidebar): `brand-900` #1a1814 / `brand-950` #0e0d0a
  - Teks aksen di latar terang: `gold-700` #8a6500 (kuning murni tidak terbaca di atas putih)
  - Tint: `brand-50` #fffbe6, `brand-100` #fff3bf
  - Ciri khas: `<LogoWatermark />`, `.mark-swoosh`, `.bg-logo-pattern`. Panduan lengkap: `docs/DESIGN_SYSTEM.md`
- **Iconography:** `@phosphor-icons/react`.
- **State & Data Fetching:** React Hooks (`useState`, `useEffect`, `useCallback`) + Service Layer dengan Axios (`authApi`, `bookingApi`).
- **Authentication & Sessions:** Cookie-based session auth (`withCredentials: true`).

---

## 📁 2. Konvensi Struktur Folder

```text
src/
├── app/                  # Routing & Layouts Next.js App Router
│   ├── (public)/         # Halaman Pasien (Home, Booking, dsb)
│   ├── (auth)/           # Halaman Login Pasien (/login, /register)
│   └── admin/            # Route Khusus Administrator
│       ├── (auth)/       # /admin/login
│       └── (dashboard)/  # /admin, /admin/booking, /admin/jadwal, /admin/terapis, /admin/pasien, /admin/profil
├── components/           # Komponen UI Terisolasi
│   ├── admin/            # Komponen Khusus Admin (booking, jadwal, terapis, pasien, profil, layout)
│   ├── auth/             # Komponen Form Autentikasi
│   ├── booking/          # Komponen Pasien Booking Flow
│   └── shared/           # Navbar, Footer, Modal, Buttons
├── services/             # Axios API Service Modules (adminService, bookingService, profileService)
├── types/                # TypeScript Interfaces & Types
└── utils/                # API Instances (api.ts) & Helper Functions
```

> ⚠️ **Aturan Komponen Admin:**
> Seluruh komponen tabel, form, filter, dan kartu statistik admin WAJIB diletakkan di `src/components/admin/<fitur>/`, BUKAN di dalam folder route `src/app/admin/.../components/`.

---

## 🔌 3. Standar Koneksi API & Service Layer

- **Auth Service:** `POST /api/v1/auth/admin/login` untuk login admin, `POST /api/v1/auth/login` untuk pasien.
- **Booking Service:** Menggunakan `bookingApi` (`<NEXT_PUBLIC_API_URL>/api`) — backend sekarang 1 service di port 8000.
- **Kontrak API:** Ikuti `backend/API_REFERENCE.md`. Jangan menambah "loop fallback URL" — panggil hanya endpoint yang memang ada, dan tampilkan `error.message` dari backend (`getApiErrorMessage` di `src/app/utils/api.ts`).

---

## 📜 4. Aturan Koding (Coding Standards)

1. **Next.js Client Components:**
   - Gunakan `"use client";` di baris pertama untuk komponen interaktif yang menggunakan Hooks atau event handlers.
   - Halaman yang menggunakan `useSearchParams()` WAJIB dibungkus dengan `<Suspense fallback={...}>` untuk mencegah deopt bailouts pada Next.js build.
2. **Icons:**
   - Gunakan ikon dari `@phosphor-icons/react`.
3. **Responsivitas:**
   - Gunakan responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) pada container dan grid.
   - Tabel harus selalu dibungkus dengan `<div className="w-full overflow-x-auto">` dengan min-width (misal `min-w-[900px]`).
4. **Verifikasi Build:**
   - Setiap selesai mengubah kode, selalu pastikan `npx tsc --noEmit` atau `npm run build` berjalan dengan **0 error**.
