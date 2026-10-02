# 🏥 HaiPhysio — Modern Physiotherapy & Clinic Management Platform

HaiPhysio adalah platform web modern untuk layanan fisioterapi, reservasi konsultasi pasien, dan sistem manajemen klinik terpadu (*Admin Dashboard*). Platform ini dirancang untuk memberikan pengalaman reservasi yang cepat dan transparan bagi pasien, serta sistem operasional klinik yang efisien bagi manajemen dan fisioterapis.

---

## 🚀 Tech Stack

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/) & React 19
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Utility
- **Icons:** [Phosphor Icons (`@phosphor-icons/react`)](https://phosphoricons.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) (dengan dukungan Cookie Session & CORS credentials)
- **Deployment:** [Vercel](https://vercel.com/)

---

## ✨ Fitur Utama

### 🧑‍⚕️ 1. Portal Pasien & Publik
- **Landing Page Interaktif:** Informasi layanan, tim terapis berlisensi, testimoni, dan FAQ.
- **Reservasi Online (Booking):** Pemilihan layanan fisioterapi, tanggal, terapis spesialis, dan slot waktu secara real-time.
- **Riwayat & Reschedule:** Pasien dapat memantau status reservasi dan mengajukan perubahan jadwal (*reschedule*).
- **Autentikasi Pasien:** Login, Registrasi Pasien Baru, dan Reset Password.

### 🛡️ 2. Portal Administrator (`/admin`)
- **Dashboard Ringkasan Eksekutif:** Statistik harian/mingguan (total booking, sesi selesai, konfirmasi, pembatalan).
- **Manajemen Antrean Booking:** Filter status, konfirmasi selesai/batal, live search, dan ekspor data ke CSV.
- **Reschedule Pasien:** Modul penyesuaian jadwal booking dengan alokasi slot jam dan notifikasi WhatsApp otomatis.
- **Kelola Jadwal & Slot Waktu:** Toggle buka/tutup slot per jam, auto-generate slot 1 minggu, dan tambah slot manual.
- **Manajemen Fisioterapis:** Tambah data terapis dengan live preview kartu, toggle status aktif/cuti, kelola hari libur, dan rekap riwayat sesi terapis.
- **Kelola Data Pasien:** Rekap pasien terdaftar, riwayat progress terapi, kontak pasien, dan ekspor laporan pasien.
- **Pusat Notifikasi:** Feed aktivitas klinik real-time dengan status baca/unread.
- **Profil Admin & Keamanan:** Pengaturan biodata admin dan modal ubah kata sandi.

---

## 📁 Struktur Direktori

```text
web-HaiPhysio/
├── public/                 # Aset statis & logo
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # Halaman publik (Home, Layanan, Booking, Kontak)
│   │   ├── (auth)/         # Halaman autentikasi pasien (Login, Register)
│   │   ├── admin/          # Route khusus Administrator
│   │   │   ├── (auth)/     # Login Admin (/admin/login)
│   │   │   └── (dashboard)/# Panel Kelola Admin (Booking, Jadwal, Terapis, Pasien, Profil)
│   │   └── utils/          # Konfigurasi Axios API Client (authApi, bookingApi)
│   ├── components/         # Komponen Modular
│   │   ├── admin/          # Komponen UI Panel Admin (Tabel, Stats, Filter, Modal)
│   │   ├── auth/           # Komponen Form Login/Register
│   │   ├── booking/        # Komponen Wizard Reservasi Pasien
│   │   ├── landing/        # Komponen Halaman Utama Pasien
│   │   └── shared/         # Navbar, Footer, Modal umum
│   ├── services/           # API Service Layer (adminService, bookingService, profileService)
│   └── types/              # Definisi TypeScript Interface & Data Types
├── .env.example            # Template Environment Variables
├── AGENTS.md               # Aturan & Panduan AI Assistant
├── CLAUDE.md               # Quick Reference untuk Claude / Copilot
└── package.json            # Daftar Dependencies & Scripts
```

---

## 🛠️ Panduan Memulai (Getting Started)

### 1. Prasyarat
- [Node.js](https://nodejs.org/) v18.18+ atau v20+
- Backend HaiPhysio (1 service: auth + booking) di port 8000

### 2. Instalasi Dependency
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi URL backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🚢 Build & Deployment

### Build untuk Produksi
```bash
npm run build
npm run start
```

### Deploy ke Vercel
1. Hubungkan repository GitHub ini ke akun **[Vercel](https://vercel.com/)**.
2. Masukkan Environment Variables di dashboard Vercel (`NEXT_PUBLIC_AUTH_API_URL` & `NEXT_PUBLIC_BOOKING_API_URL`).
3. Vercel akan otomatis melakukan build dan deploy setiap kali ada push ke branch `main`.

---

## 📄 Lisensi
Hak Cipta © 2026 **HaiPhysio Team**. Seluruh hak cipta dilindungi undang-undang.