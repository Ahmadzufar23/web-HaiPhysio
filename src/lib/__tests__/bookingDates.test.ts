import { describe, expect, it } from "vitest";
import { addDays, buildDateWindow, isDateInWindow } from "../bookingDates";

describe("addDays", () => {
  it("melewati pergantian bulan dan tahun", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("buildDateWindow", () => {
  it("membuat deretan tanggal berurutan sejumlah yang diminta", () => {
    expect(buildDateWindow("2026-11-05", 3)).toEqual([
      { date: "2026-11-05", weekday: "Kam", dayMonth: "5 Nov" },
      { date: "2026-11-06", weekday: "Jum", dayMonth: "6 Nov" },
      { date: "2026-11-07", weekday: "Sab", dayMonth: "7 Nov" },
    ]);
  });
});

describe("isDateInWindow", () => {
  it("batas awal dan akhir termasuk, di luar itu tidak", () => {
    expect(isDateInWindow("2026-11-05", "2026-11-05", 14)).toBe(true);
    expect(isDateInWindow("2026-11-18", "2026-11-05", 14)).toBe(true);
    expect(isDateInWindow("2026-11-19", "2026-11-05", 14)).toBe(false);
    expect(isDateInWindow("2026-11-04", "2026-11-05", 14)).toBe(false);
  });
});
