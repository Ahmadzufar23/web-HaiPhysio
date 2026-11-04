// Setelah booking Homecare, pasien melanjutkan ke WhatsApp klinik untuk membahas harga
// dan jadwal kunjungan (blueprint pasien/booking §4). Pesannya diisi otomatis supaya
// klinik langsung tahu siapa pasiennya, alamat, dan keluhannya.

export interface HomeVisitMessage {
  name: string;
  phone: string;
  address: string;
  complaint: string;
  /** "Selasa, 20 Oktober 2026 · 14.00 WIB" */
  schedules: string[];
  referenceCodes: string[];
}

export function homeVisitMessage({ name, phone, address, complaint, schedules, referenceCodes }: HomeVisitMessage): string {
  const lines = [
    "Halo, saya sudah booking Homecare dan ingin membahas harga serta jadwal kunjungan.",
    "",
    `Nama: ${name.trim() || "-"}`,
    `No. HP: ${phone.trim() || "-"}`,
    `Alamat: ${address.trim() || "-"}`,
    `Jadwal yang dipilih: ${schedules.join("; ") || "-"}`,
    `Kode booking: ${referenceCodes.join(", ") || "-"}`,
    `Keluhan: ${complaint.trim() || "-"}`,
  ];
  return lines.join("\n");
}

export function homeVisitWhatsappUrl(message: HomeVisitMessage, number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(homeVisitMessage(message))}`;
}
