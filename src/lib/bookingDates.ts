const MILLISECONDS_PER_DAY = 86_400_000;

const weekdayFormat = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" });
const dayMonthFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

const toUtc = (date: string) => new Date(`${date}T00:00:00Z`);

export type DateWindowDay = { date: string; weekday: string; dayMonth: string };

/** Tanggal "YYYY-MM-DD" digeser sejumlah hari. */
export function addDays(date: string, days: number): string {
  return new Date(toUtc(date).getTime() + days * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
}

/** Deretan tanggal berurutan mulai dari start, beserta labelnya. */
export function buildDateWindow(start: string, days: number): DateWindowDay[] {
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    const value = toUtc(date);
    return { date, weekday: weekdayFormat.format(value), dayMonth: dayMonthFormat.format(value) };
  });
}

export function isDateInWindow(date: string, start: string, days: number): boolean {
  return date >= start && date <= addDays(start, days - 1);
}
