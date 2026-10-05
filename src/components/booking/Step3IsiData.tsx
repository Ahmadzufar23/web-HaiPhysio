"use client";

import { useState, useRef, useEffect } from "react";
import { Stethoscope, CalendarBlank, User, UserCircle, UploadSimple } from "@phosphor-icons/react";
import Stepper from "./Stepper";
import { profileService } from "@/services/profileService";

interface Step3Props {
  onBack: () => void;
  onNext: (formData: any) => void;
  bookingData: any;
}

export default function Step3IsiData({ onBack, onNext, bookingData }: Step3Props) {
  // Referensi ke input file tersembunyi (dipakai saat user klik kotak putus-putus)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk menyimpan semua isian form user
  // Dibuat pre-filled (sudah terisi) sesuai desain Figma
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    complaint: "",
    photoPreview: null as string | null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await profileService.getProfile();
        const user = res.data?.user || res.user;
        if (user) {
          setFormData((prev) => ({
            ...prev,
            name: user.full_name || user.name || "",
            phone: user.phone || "",
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.log("User belum login / profil belum terisi:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // State untuk melacak pesan error (misal: "Nama tidak boleh kosong")
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Fungsi ini jalan setiap kali user ngetik di kotak input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Update data form sesuai apa yang diketik
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Kalau ada error di kotak itu, hapus error-nya karena user sudah mulai ngetik lagi
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Fungsi Validasi: Ngecek apakah ada kotak wajib yang dikosongin
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", phone: "", email: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap tidak boleh kosong.";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon tidak boleh kosong.";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong.";
      isValid = false;
    }

    // Tampilkan pesan error ke layar
    setErrors(newErrors);
    return isValid;
  };

  // Fungsi ini jalan ketika user milih foto dari komputernya
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cek ukuran file (Maks 10 MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar! Maksimal 10 MB.");
      return;
    }

    // Baca file fotonya dan ubah jadi URL agar bisa ditampilkan di layar (Preview)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoPreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Fungsi ini dipanggil pas tombol Lanjut diklik
  const handleNextClick = () => {
    // Jalankan validasi dulu. Kalau lolos (true), baru pindah ke langkah 4
    if (validateForm()) {
      onNext(formData);
    }
  };

  // --- LOGIKA FRONT-END: Penterjemah Mock Data Jadwal ---
  // Fungsi ini membaca ID yang dipilih user dan mengembalikan teks yang sesuai
  const formatScheduleText = () => {
    if (!bookingData?.slotDate || !bookingData?.startTime) {
      return "Jadwal Belum Dipilih";
    }
    const dateObj = new Date(bookingData.slotDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeFormatted = String(bookingData.startTime).substring(0, 5);
    return `${dateFormatted} @ ${timeFormatted} WIB`;
  };
  const displayServiceName = bookingData?.serviceName || "Fisioterapi";
  const displaySchedule = formatScheduleText();
  const displayTherapist = bookingData?.therapistName || "-";

  return (
    <div className="w-full flex flex-col items-center">

      <div className="text-center mb-10">
        <h2 className="text-[32px] md:text-[36px] font-bold text-brand-900 mb-3">Isi Data Diri & Detail Keluhan</h2>
        <p className="text-[#585858] text-[15px] md:text-[16px]">Pastikan Nama dan Nomor Telepon Anda benar. Data ini otomatis diambil dari profil Anda.</p>
      </div>

      <Stepper currentStep={3} />

      {/* --- BOX RINGKASAN PILIHAN --- */}
      <div className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[16px] p-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-3 text-[14px]">
            <Stethoscope size={20} weight="bold" className="text-[#3B82F6]" />
            <span className="w-[120px] text-gray-500">Layanan Terpilih</span>
            <span className="text-brand-900 font-medium">: {displayServiceName}</span>
          </div>
          <div className="flex flex-col gap-3 text-[14px]">
            <CalendarBlank size={20} weight="bold" className="text-[#3B82F6]" />
            <span className="w-[120px] text-gray-500">Jadwal Terpilih</span>
            <span className="text-brand-900 font-medium">: {displaySchedule}</span>
          </div>
          <div className="flex flex-col gap-3 text-[14px]">
            <User size={20} weight="bold" className="text-[#3B82F6]" />
            <span className="w-[120px] text-gray-500">Nama Terapis</span>
            <span className="text-brand-900 font-medium">: {displayTherapist}</span>
          </div>
          <button onClick={onBack} className="shrink-0 w-full md:w-auto text-gold-700 text-[14px] font-bold px-5 py-2 border border-brand-600 rounded-xl bg-white hover:bg-brand-50">
            ✎ Ubah
          </button>
        </div>
      </div>

      {/* --- FORM KONTAK PASIEN --- */}
      <div className="w-full bg-white border border-gray-200 rounded-[16px] p-8 mb-6">
        <h3 className="flex items-center gap-3 text-[20px] font-bold text-brand-900 mb-6">
          <UserCircle size={28} weight="fill" className="text-brand-900" />
          Informasi Kontak Pasien
        </h3>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-900">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-4 border rounded-xl outline-none transition-colors ${errors.name ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-gold-600"}`}
            />
            {errors.name && <span className="text-[12px] text-red-500">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-900">Nomor Telepon</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full p-4 border rounded-xl outline-none transition-colors ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-gold-600"}`}
            />
            {errors.phone && <span className="text-[12px] text-red-500">{errors.phone}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-900">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-4 border rounded-xl outline-none transition-colors ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-gold-600"}`}
            />
            {errors.email && <span className="text-[12px] text-red-500">{errors.email}</span>}
          </div>
        </div>
      </div>

      {/* --- FORM DETAIL KELUHAN --- */}
      <div className="w-full bg-white border border-gray-200 rounded-[16px] p-8 mb-10">
        <h3 className="flex items-center gap-3 text-[20px] font-bold text-brand-900 mb-6">
          <Stethoscope size={28} weight="fill" className="text-brand-900" />
          Detail Keluhan Medis
        </h3>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-900">Keluhan Utama (Opsional)</label>
            <textarea
              name="complaint"
              value={formData.complaint}
              onChange={handleInputChange}
              placeholder="Isi Keluhan yang dirasakan"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none min-h-[120px] focus:border-gold-600"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-900">Unggah Foto Keluhan (Opsional)</label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative"
            >
              {formData.photoPreview ? (
                <img src={formData.photoPreview} alt="Preview Keluhan" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <UploadSimple size={32} weight="bold" className="text-gold-700" />
                  <span className="text-[14px] font-medium text-gray-500">Ketuk untuk unggah file</span>
                  <span className="text-[12px]">Maks. 10 MB</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- TOMBOL NAVIGASI BAWAH --- */}
      <div className="w-full flex justify-between">
        <button onClick={onBack} className="text-gold-700 font-bold flex items-center gap-2 px-6 py-3 rounded-[12px] bg-gray-50 hover:bg-brand-50 transition-colors">
          <span>←</span> Kembali
        </button>
        <button
          onClick={handleNextClick}
          className="bg-brand-600 hover:bg-brand-700 text-brand-950 px-10 py-3 rounded-[12px] font-bold flex items-center gap-2 transition-colors shadow-[0_4px_12px_rgba(245,201,0,0.3)]"
        >
          Lanjut <span>→</span>
        </button>
      </div>

    </div>
  );
}