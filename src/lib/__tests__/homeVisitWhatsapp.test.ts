import { describe, expect, it } from "vitest";
import { homeVisitMessage, homeVisitWhatsappUrl } from "@/lib/homeVisitWhatsapp";

const message = {
  name: "Budi Santoso",
  phone: "081234567890",
  address: "Jl. Melati No. 5, Condet",
  complaint: "Area nyeri: Lutut kiri.\nSakit saat naik tangga",
  schedules: ["Selasa, 20 Oktober 2026 · 14.00 WIB"],
  referenceCodes: ["RESV-123456"],
};

describe("homeVisitWhatsapp", () => {
  it("menyusun pesan berisi data pasien, jadwal, dan kode booking", () => {
    const text = homeVisitMessage(message);
    expect(text).toContain("Nama: Budi Santoso");
    expect(text).toContain("No. HP: 081234567890");
    expect(text).toContain("Alamat: Jl. Melati No. 5, Condet");
    expect(text).toContain("Jadwal yang dipilih: Selasa, 20 Oktober 2026 · 14.00 WIB");
    expect(text).toContain("Kode booking: RESV-123456");
    expect(text).toContain("Keluhan: Area nyeri: Lutut kiri.\nSakit saat naik tangga");
  });

  it("isian kosong ditulis '-' supaya pesan tetap rapi", () => {
    const text = homeVisitMessage({ ...message, address: "  ", complaint: "", schedules: [], referenceCodes: [] });
    expect(text).toContain("Alamat: -");
    expect(text).toContain("Keluhan: -");
    expect(text).toContain("Jadwal yang dipilih: -");
    expect(text).toContain("Kode booking: -");
  });

  it("mengarah ke nomor WhatsApp Homecare dengan pesan ter-encode", () => {
    const url = new URL(homeVisitWhatsappUrl(message, "6281292197787"));
    expect(url.origin + url.pathname).toBe("https://wa.me/6281292197787");
    expect(url.searchParams.get("text")).toBe(homeVisitMessage(message));
  });
});
