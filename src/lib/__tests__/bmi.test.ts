import { describe, expect, it } from "vitest";
import { bmiOf } from "@/constants/patient";

describe("IMT (WHO)", () => {
  it("menghitung nilai dan kategori", () => {
    expect(bmiOf(170, 65)).toEqual({ value: 22.5, label: "Ideal", ideal: true });
    expect(bmiOf(170, 50)?.label).toBe("Berat badan kurang");
    expect(bmiOf(170, 80)?.label).toBe("Berat badan berlebih");
    expect(bmiOf(170, 95)?.label).toBe("Obesitas");
  });

  it("batas kategori mengikuti tabel WHO", () => {
    expect(bmiOf(100, 18.5)?.label).toBe("Ideal");
    expect(bmiOf(100, 25)?.label).toBe("Berat badan berlebih");
    expect(bmiOf(100, 30)?.label).toBe("Obesitas");
  });

  it("kosong bila data belum diisi", () => {
    expect(bmiOf(null, 60)).toBeNull();
    expect(bmiOf(170, null)).toBeNull();
  });
});
