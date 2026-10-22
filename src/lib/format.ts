// Format angka & waktu untuk dashboard klinik (selalu zona WIB).

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export const formatRupiah = (value: number | null | undefined) => (value === null || value === undefined ? "—" : rupiah.format(value));

const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" });
const longDateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

// "2026-10-20" (tanggal kalender) → dibaca sebagai tengah hari WIB supaya tidak bergeser hari
const fromDateOnly = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00+07:00`);

export const formatDate = (d: string | null | undefined) => (d ? dateFmt.format(fromDateOnly(d)) : "—");
/** Tanggal (WIB) dari timestamp ISO */
export const formatDateOf = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : "—");
export const formatLongDate = (d: string | null | undefined) => (d ? longDateFmt.format(fromDateOnly(d)) : "—");
/** Jam dari timestamp ISO, mis. "14.05" */
export const formatClock = (iso: string | null | undefined) => (iso ? timeFmt.format(new Date(iso)) : "—");
/** Tanggal + jam dari timestamp ISO */
export const formatDateTime = (iso: string | null | undefined) => (iso ? `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso))}` : "—");
/** "09:00:00" → "09.00" */
/** 330 → "5 jam 30 mnt", 0 → "0 jam" */
export const formatHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} jam ${m} mnt` : `${h} jam`;
};

export const formatSlotTime =(t: string | null | undefined) => (t ? t.slice(0, 5).replace(":", ".") : "—");

/** Hari ini dalam kalender WIB, "YYYY-MM-DD" */
export const todayWib = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
/** n hari dari hari ini (kalender WIB), "YYYY-MM-DD" */
export const wibDateFromToday = (days: number) => new Date(Date.now() + 7 * 3600_000 + days * 86_400_000).toISOString().slice(0, 10);

export const initials = (name: string) =>
  name
    .replace(/^(Ftr\.|dr\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
