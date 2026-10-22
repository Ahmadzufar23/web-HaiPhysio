// Info kontak & lokasi klinik — satu sumber untuk Beranda, Kontak, dan Footer.
export const CLINIC = {
  name: "Klinik Pratama Condet Jaya",
  address: "Jl. Condet Raya No. 18, Batu Ampar, Kramat Jati, Jakarta Timur 13520",
  hours: "Senin sampai Sabtu, 08.00 sampai 16.00 WIB",
  hoursNote: "Minggu tutup",
  whatsapp: { label: "+62 898-3050-149", href: "https://wa.me/628983050149" },
  email: { label: "haiphysio@gmail.com", href: "mailto:haiphysio@gmail.com" },
  instagram: { label: "@fisioterapi_jakarta_timur", href: "https://instagram.com/fisioterapi_jakarta_timur" },
};

const MAPS_QUERY = "Klinik%20Fisioterapi%20Hai%20Physio";
export const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
// Halaman tempat di Google Maps: petunjuk arah sekaligus ulasan pasien
export const MAPS_PLACE_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
