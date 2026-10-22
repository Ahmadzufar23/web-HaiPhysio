# CLAUDE.md — Quick Commands & Development Reference

## 🛠️ Common Commands

- **Development:** `npm run dev` (Starts Next.js dev server on `http://localhost:3000`)
- **Type Checking:** `npx tsc --noEmit`
- **Production Build:** `npm run build`
- **Linting:** `npm run lint`

## 🎨 Design Tokens & Colors (Kuning Logo · Putih · Hitam)
- Token brand ada di `src/app/globals.css` → pakai class `bg-brand-600`, `text-brand-900`, dst. (jangan hardcode hex)
- **Primary Yellow:** `brand-600` #f5c900 (hover `brand-700` #e0b400) — teks di atasnya `text-brand-950`
- **Ink (teks/judul/sidebar):** `brand-900` #1a1814
- **Teks aksen di latar terang:** `gold-700` #8a6500
- **Tint:** `brand-50` #fffbe6 / `brand-100` #fff3bf
- **Prinsip:** tampilan publik tenang, tanpa hiasan; info klinik dari `src/constants/clinic.ts`
- **Gray Text:** `#585858` / `#9ca3af`
- Detail: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## 📁 Key Directories
- **Admin Dashboard Pages:** `src/app/admin/(dashboard)/*`
- **Admin Components:** `src/components/admin/*`
- **API Services:** `src/services/*`
- **API Axios Client:** `src/app/utils/api.ts`

For comprehensive rules and architecture guidelines, refer to [AGENTS.md](file:///d:/projke/Fisiotrapi/web_fe/web-HaiPhysio/AGENTS.md).
