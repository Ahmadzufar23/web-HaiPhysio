// Identitas klinik datang dari API (GET /api/clinics/:slug) dan dipakai lewat useClinic().
// Nama sistem ada di constants/platform.ts.
export type ClinicBranch = {
  slug: string;
  brand: string;
  branchName: string | null;
  address: string | null;
};

export type ClinicGroupIdentity = {
  slug: string;
  name: string;
  tagline: string | null;
  about: string | null;
  foundedYear: number | null;
  logoUrl: string | null;
  markUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string | null;
};

export type PublicClinic = {
  slug: string;
  brand: string;
  name: string;
  branchName: string | null;
  address: string | null;
  hours: string | null;
  hoursNote: string | null;
  whatsapp: string | null;
  homeVisitWhatsapp: string | null;
  email: string | null;
  instagram: string | null;
  group: ClinicGroupIdentity;
  branches: ClinicBranch[];
};

// Satu baris di daftar klinik alamat utama
export type ClinicDirectoryEntry = ClinicBranch & { group: { slug: string; name: string; logoUrl: string | null } };

// Tujuan link /k/<slug>: langsung ke klinik, atau pilih cabang dulu
export type ClinicLinkTarget =
  | { kind: "clinic"; clinic: PublicClinic }
  | { kind: "group"; group: { slug: string; name: string; logoUrl: string | null }; branches: ClinicBranch[] };

type ContactLink = { label: string; href: string };

export type ClinicView = {
  slug: string;
  brand: string;
  name: string;
  branchName: string;
  address: string;
  hours: string;
  hoursNote: string;
  homeVisitWhatsapp: string;
  whatsapp: ContactLink;
  email: ContactLink;
  instagram: ContactLink;
  mapsEmbedUrl: string;
  mapsPlaceUrl: string;
  groupName: string;
  tagline: string;
  about: string;
  foundedYear: number | null;
  logoUrl: string | null;
  markUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string | null;
  branches: ClinicBranch[];
};

// Nilai sementara selama data klinik dimuat
export const EMPTY_CLINIC: ClinicView = {
  slug: "",
  brand: "",
  name: "",
  branchName: "",
  address: "",
  hours: "",
  hoursNote: "",
  homeVisitWhatsapp: "",
  whatsapp: { label: "", href: "#" },
  email: { label: "", href: "#" },
  instagram: { label: "", href: "#" },
  mapsEmbedUrl: "",
  mapsPlaceUrl: "#",
  groupName: "",
  tagline: "",
  about: "",
  foundedYear: null,
  logoUrl: null,
  markUrl: null,
  heroImageUrl: null,
  accentColor: null,
  branches: [],
};

// Logo unggahan disajikan API, gambar bawaan disajikan frontend
export function clinicAssetUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith("/api/") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${path}` : path;
}

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
    branchName: clinic.branchName ?? "",
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
    groupName: clinic.group.name,
    tagline: clinic.group.tagline ?? "",
    about: clinic.group.about ?? "",
    foundedYear: clinic.group.foundedYear,
    logoUrl: clinicAssetUrl(clinic.group.logoUrl),
    markUrl: clinicAssetUrl(clinic.group.markUrl),
    heroImageUrl: clinicAssetUrl(clinic.group.heroImageUrl),
    accentColor: clinic.group.accentColor,
    branches: clinic.branches,
  };
}

// Jam buka dan catatannya; bagian yang belum diisi klinik dilewati
export const clinicHoursText = (clinic: Pick<ClinicView, "hours" | "hoursNote">) => [clinic.hours, clinic.hoursNote].filter(Boolean).join(". ");

// Alamat klinik untuk konfirmasi booking dan reschedule
export const clinicLocation = (clinic: ClinicView) => [clinic.brand, clinic.name, clinic.address].filter(Boolean).join(", ");
