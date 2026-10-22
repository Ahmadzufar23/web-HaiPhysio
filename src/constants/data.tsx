

import { 
  Bandaids, 
  Brain, 
  Barbell,
  Lightbulb, 
  ShieldCheck, 
  Stethoscope, 
  Person,
  PersonSimpleRun,
  Bed,
  Heartbeat,
  HandHeart
} from "@phosphor-icons/react";

// Alamat klinik — satu sumber untuk konfirmasi booking, reschedule, & profil admin
export const CLINIC_LOCATION = "Hai Physio, Klinik Pratama Condet Jaya, Jl. Condet Raya No. 18, Batu Ampar, Kramat Jati, Jakarta Timur 13520";

// 1. Data Fokus Layanan Kami (Dipakai di Beranda & Layanan)
export const servicesData = [
  {
    id: "muskuloskeletal",
    title: "Fisioterapi",
    titleBold: "Muskuloskeletal",
    subtitle: "Otot, Tulang & Sendi",
    desc: "Pemulihan untuk masalah nyeri otot, sendi kaku, pasca patah tulang, atau perbaikan postur tubuh agar Anda bisa kembali bergerak bebas tanpa hambatan.",
    cases: ["Nyeri Pinggang Bawah", "Nyeri Sendi/Lutut", "Skoliosis"], 
    imgSrc: "/service-Muskulo.png",
    icon: <Bandaids size={28} weight="regular" />
  },
  {
    id: "neuro",
    title: "Fisioterapi",
    titleBold: "Neuro",
    subtitle: "Saraf & Gerak Otot",
    desc: "Terapi khusus untuk memulihkan gangguan gerak akibat masalah saraf, membantu menguatkan kembali otot yang melemah, serta melatih keseimbangan tubuh.",
    cases: ["Pasca-Stroke", "HNP (Saraf Kejepit)", "Carpal Tunnel Syndrome"],
    imgSrc: "/service-Neuro.png",
    icon: <Brain size={28} weight="regular" />
  },
  {
    id: "olahraga",
    title: "Fisioterapi",
    titleBold: "Olahraga",
    subtitle: "Cedera & Aktivitas Fisik",
    desc: "Dirancang khusus untuk memulihkan cedera akibat olahraga atau aktivitas berat, sekaligus mengembalikan performa fisik terbaik Anda tanpa takut cedera lagi.",
    cases: ["Cedera ACL/MCL", "Keseleo (Sprain/Strain)", "Kram Otot Kronis"],
    imgSrc: "/service-Olahraga.png",
    icon: <Barbell size={28} weight="regular" />
  }
];

// 2. Data Kenapa Pilih Kami (Dipakai di Tentang Kami)
export const reasonsData = [
  {
    id: "pemeriksaan",
    title: "Diperiksa dulu sebelum diterapi",
    desc: "Terapis mencatat keluhan yang Anda rasakan dan hasil pemeriksaan gerak tubuh, supaya penanganan sesuai dengan penyebabnya.",
    imgSrc: "/reason-1.png"
  },
  {
    id: "progres",
    title: "Perkembangan dicatat tiap sesi",
    desc: "Hasil terapi dievaluasi berkala, jadi Anda dan terapis bisa melihat kemajuan dari sesi ke sesi.",
    imgSrc: "/reason-2.png"
  },
  {
    id: "profesional",
    title: "Ditangani fisioterapis bersertifikat",
    desc: "Terapis kami bersertifikasi resmi dan berpengalaman menangani gangguan gerak dan fungsi tubuh.",
    imgSrc: "/reason-3.png"
  }
];

// 3. Data Jenis Pelayanan (Dipakai di Layanan)
export const jenisPelayananData = [
  {
    id: "promotif",
    title: "Promotif",
    desc: "Menjaga fungsi gerak tubuh Anda supaya tetap optimal, sebelum ada keluhan.",
    icon: <Lightbulb size={56} weight="fill" />
  },
  {
    id: "preventif",
    title: "Preventif",
    desc: "Mengenali risiko sejak dini, sebelum berkembang jadi gangguan yang lebih serius.",
    icon: <ShieldCheck size={56} weight="fill" />
  },
  {
    id: "kuratif",
    title: "Kuratif",
    desc: "Menangani keluhan yang sedang Anda alami saat ini.",
    icon: <Stethoscope size={56} weight="fill" />
  },
  {
    id: "rehabilitatif",
    title: "Rehabilitatif",
    desc: "Memulihkan fungsi tubuh secara bertahap setelah cedera, operasi, atau sakit.",
    icon: <Person size={56} weight="fill" />
  }
];

// 4. Data Manfaat Fisioterapi (Dipakai di Layanan)
export const manfaatData = [
  { text: "Meningkatkan Mobilitas Gerak", icon: <PersonSimpleRun size={28} weight="fill" /> },
  { text: "Membantu Pemulihan Pasca Operasi", icon: <Bed size={28} weight="fill" /> },
  { text: "Membantu Pemulihan Pasca Stroke", icon: <Brain size={28} weight="fill" /> },
  { text: "Membantu Rehabilitasi Jantung & Paru", icon: <Heartbeat size={28} weight="fill" /> },
  { text: "Mengurangi Nyeri", icon: <HandHeart size={28} weight="fill" /> }
];

// 5. Jam baris grid kalender jadwal (dipakai GridKalender)
export const calendarHours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
