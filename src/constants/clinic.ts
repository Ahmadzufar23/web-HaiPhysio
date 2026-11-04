// Identitas klinik datang dari API (GET /api/clinics/:slug) dan dipakai lewat useClinic().
// Nama sistem ada di constants/platform.ts.
export type PublicClinic = {
  slug: string;
  brand: string;
  name: string;
  address: string | null;
  hours: string | null;
  hoursNote: string | null;
  whatsapp: string | null;
  homeVisitWhatsapp: string | null;
  email: string | null;
  instagram: string | null;
};

type ContactLink = { label: string; href: string };

export type ClinicView = {
  slug: string;
  brand: string;
  name: string;
  address: string;
  hours: string;
  hoursNote: string;
  homeVisitWhatsapp: string;
  whatsapp: ContactLink;
  email: ContactLink;
  instagram: ContactLink;
  mapsEmbedUrl: string;
  mapsPlaceUrl: string;
};

// Nilai sementara selama data klinik dimuat
export const EMPTY_CLINIC: ClinicView = {
  slug: "",
  brand: "",
  name: "",
  address: "",
  hours: "",
  hoursNote: "",
  homeVisitWhatsapp: "",
  whatsapp: { label: "", href: "#" },
  email: { label: "", href: "#" },
  instagram: { label: "", href: "#" },
  mapsEmbedUrl: "",
  mapsPlaceUrl: "#",
};

// 628983050149 -> +62 898-3050-149
export function formatWhatsappLabel(number: string) {
  const match = number.match(/^62(\d{3})(\d{4})(\d+)$/);
  return match ? `+62 ${match[1]}-${match[2]}-${match[3]}` : `+${number}`;
}

export function toClinicView(clinic: PublicClinic): ClinicView {
  const mapsQuery = encodeURIComponent(`Klinik Fisioterapi ${clinic.brand}`);
  return {
    slug: clinic.slug,
    brand: clinic.brand,
    name: clinic.name,
    address: clinic.address ?? "",
    hours: clinic.hours ?? "",
    hoursNote: clinic.hoursNote ?? "",
    homeVisitWhatsapp: clinic.homeVisitWhatsapp ?? clinic.whatsapp ?? "",
    whatsapp: clinic.whatsapp ? { label: formatWhatsappLabel(clinic.whatsapp), href: `https://wa.me/${clinic.whatsapp}` } : EMPTY_CLINIC.whatsapp,
    email: clinic.email ? { label: clinic.email, href: `mailto:${clinic.email}` } : EMPTY_CLINIC.email,
    instagram: clinic.instagram ? { label: `@${clinic.instagram}`, href: `https://instagram.com/${clinic.instagram}` } : EMPTY_CLINIC.instagram,
    mapsEmbedUrl: `https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    // Halaman tempat di Google Maps: petunjuk arah sekaligus ulasan pasien
    mapsPlaceUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  };
}

// Alamat klinik untuk konfirmasi booking dan reschedule
export const clinicLocation = (clinic: ClinicView) => [clinic.brand, clinic.name, clinic.address].filter(Boolean).join(", ");
