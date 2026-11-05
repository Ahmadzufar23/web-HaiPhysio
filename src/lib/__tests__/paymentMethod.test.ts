import { describe, expect, it } from "vitest";
import { matchesPaymentFilter, paymentMethodLabel } from "../paymentMethod";

describe("matchesPaymentFilter", () => {
  it("semua menampilkan seluruh metode, termasuk data lama", () => {
    expect(matchesPaymentFilter("cash", "all")).toBe(true);
    expect(matchesPaymentFilter("xendit", "all")).toBe(true);
    expect(matchesPaymentFilter(null, "all")).toBe(true);
  });

  it("tunai dan non tunai hanya menampilkan metodenya", () => {
    expect(matchesPaymentFilter("cash", "cash")).toBe(true);
    expect(matchesPaymentFilter("xendit", "cash")).toBe(false);
    expect(matchesPaymentFilter("xendit", "xendit")).toBe(true);
    expect(matchesPaymentFilter(null, "xendit")).toBe(false);
  });
});

describe("paymentMethodLabel", () => {
  it("memberi label yang dimengerti pengguna", () => {
    expect(paymentMethodLabel("cash")).toBe("Tunai");
    expect(paymentMethodLabel("xendit")).toBe("Non tunai");
    expect(paymentMethodLabel(null)).toBe("Tidak tercatat");
  });
});
