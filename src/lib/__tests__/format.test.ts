import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, formatHours, formatRupiah, formatSlotTime, initials, todayWib } from "@/lib/format";
import { quotaLabel, sortSlots, emptyDraft, type SelectedSlot } from "@/components/booking/bookingDraft";

afterEach(() => vi.useRealTimers());

describe("format", () => {
  it("rupiah tanpa desimal, tanda pisah bila kosong", () => {
    expect(formatRupiah(300000).replace(/\s/g, " ")).toBe("Rp 300.000");
    expect(formatRupiah(null)).toBe("—");
  });

  it("jam slot memakai titik", () => {
    expect(formatSlotTime("09:00:00")).toBe("09.00");
  });

  it("tanggal kalender tidak bergeser hari", () => {
    expect(formatDate("2026-10-22")).toBe("22 Okt 2026");
  });

  it("hari ini mengikuti WIB, bukan UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 9, 21, 18, 0))); // 22 Okt 01.00 WIB
    expect(todayWib()).toBe("2026-10-22");
  });

  it("durasi jam kerja", () => {
    expect(formatHours(0)).toBe("0 jam");
    expect(formatHours(120)).toBe("2 jam");
    expect(formatHours(330)).toBe("5 jam 30 mnt");
  });

  it("inisial tanpa gelar", () => {
    expect(initials("Ftr. Dina Marpaung, S.Ft")).toBe("DM");
  });
});

describe("draft booking", () => {
  const slot = (slotDate: string, startTime: string): SelectedSlot => ({ slotId: `${slotDate}-${startTime}`, therapistId: "t", therapistName: "T", slotDate, startTime });

  it("mengurutkan jadwal dari yang paling dekat", () => {
    const sorted = sortSlots([slot("2026-10-24", "11:00"), slot("2026-10-23", "15:00"), slot("2026-10-23", "09:00")]);
    expect(sorted.map((s) => s.slotId)).toEqual(["2026-10-23-09:00", "2026-10-23-15:00", "2026-10-24-11:00"]);
  });

  it("label kuota hanya untuk paket lebih dari satu sesi", () => {
    expect(quotaLabel({ ...emptyDraft, sessionQuota: 3, slots: [slot("2026-10-24", "11:00")] })).toBe("1 dari 3 sesi dijadwalkan");
    expect(quotaLabel({ ...emptyDraft, sessionQuota: 1, slots: [slot("2026-10-24", "11:00")] })).toBe("");
  });
});
