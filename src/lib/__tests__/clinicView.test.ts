import { describe, expect, it } from "vitest";
import { clinicLocation, EMPTY_CLINIC, formatWhatsappLabel, toClinicView, type PublicClinic } from "@/constants/clinic";

const clinic: PublicClinic = {
  slug: "klinik-sehat",
  brand: "Klinik Sehat",
  name: "PT Klinik Sehat",
  address: "Jl. Sehat 1",
  hours: "Senin sampai Jumat",
  hoursNote: "Sabtu tutup",
  whatsapp: "628983050149",
  homeVisitWhatsapp: null,
  email: "halo@sehat.dev",
  instagram: "kliniksehat",
};

describe("identitas klinik dari API", () => {
  it("membentuk link kontak dari data klinik", () => {
    const view = toClinicView(clinic);
    expect(view.whatsapp).toEqual({ label: "+62 898-3050-149", href: "https://wa.me/628983050149" });
    expect(view.email.href).toBe("mailto:halo@sehat.dev");
    expect(view.instagram).toEqual({ label: "@kliniksehat", href: "https://instagram.com/kliniksehat" });
    expect(view.mapsPlaceUrl).toContain(encodeURIComponent("Klinik Sehat"));
  });

  it("nomor Homecare memakai WhatsApp klinik bila belum diisi", () => {
    expect(toClinicView(clinic).homeVisitWhatsapp).toBe("628983050149");
    expect(toClinicView({ ...clinic, homeVisitWhatsapp: "6281111" }).homeVisitWhatsapp).toBe("6281111");
  });

  it("kontak yang kosong tidak menghasilkan link palsu", () => {
    const view = toClinicView({ ...clinic, whatsapp: null, email: null, instagram: null });
    expect(view.whatsapp.href).toBe("#");
    expect(view.email.label).toBe("");
    expect(view.instagram.label).toBe("");
  });

  it("nomor di luar pola umum tetap ditampilkan", () => {
    expect(formatWhatsappLabel("1234")).toBe("+1234");
  });

  it("lokasi klinik melewati bagian yang kosong", () => {
    expect(clinicLocation(toClinicView({ ...clinic, address: null }))).toBe("Klinik Sehat, PT Klinik Sehat");
    expect(clinicLocation(EMPTY_CLINIC)).toBe("");
  });
});
