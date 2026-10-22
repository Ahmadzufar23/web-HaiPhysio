"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "@phosphor-icons/react";
import { profileService } from "@/services/profileService";
import { bookingService } from "@/services/bookingService";
import { getApiErrorMessage } from "@/app/utils/api";
import { formatDate, formatLongDate, formatSlotTime, initials, todayWib } from "@/lib/format";
import { resizeToSquareJpeg } from "@/lib/imageResize";
import { GENDER_OPTIONS, genderLabel } from "@/constants/patient";
import ModalLogout from "@/components/profile/ModalLogout";
import ModalGantiPassword from "@/components/profile/ModalGantiPassword";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import { ui } from "@/components/booking/BookingUI";

type Profile = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string;
  occupation: string;
  photo: string | null;
};
type Draft = Pick<Profile, "fullName" | "gender" | "address" | "occupation">;
type BookingItem = {
  id: string;
  bookingDate: string;
  bookingTime: string;
  therapistName: string;
  bookingStatus: string;
  referenceCode?: string;
  focusArea?: { name: string } | null;
};

// Respons GET/PATCH /profile → bentuk yang dipakai halaman
const toProfile = (user: Record<string, string | null>): Profile => ({
  fullName: user.full_name || "",
  email: user.email || "",
  phone: user.phone || "",
  dateOfBirth: user.date_of_birth ?? null,
  gender: user.gender ?? null,
  address: user.address ?? "",
  occupation: user.occupation ?? "",
  photo: user.photo ?? null,
});

/** Baris pengaturan: judul + keterangan di kiri, isi di kanan (bertumpuk di layar kecil) */
function SettingsRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-zinc-200 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ReadOnlyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-[130px] shrink-0 text-[12px] text-zinc-500">{label}</dt>
      <dd className={`text-[13px] ${value ? "text-zinc-900" : "text-zinc-400"}`}>{value || "Belum diisi"}</dd>
    </div>
  );
}

function Avatar({ profile, size }: { profile: Profile; size: "md" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16 text-[18px]" : "h-12 w-12 text-[15px]";
  return profile.photo ? (
    // eslint-disable-next-line @next/next/no-img-element -- data URL dari API profil
    <img src={profile.photo} alt="Foto profil" className={`${box} shrink-0 rounded-xl border border-zinc-200 object-cover`} />
  ) : (
    <span className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-brand-500 font-semibold text-brand-950`}>{initials(profile.fullName) || "?"}</span>
  );
}

export default function PengaturanProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Draft>({ fullName: "", gender: null, address: "", occupation: "" });
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const applyProfile = (user: Record<string, string | null>) => {
    const p = toProfile(user);
    setProfile(p);
    setDraft({ fullName: p.fullName, gender: p.gender, address: p.address, occupation: p.occupation });
  };

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => applyProfile(data.data.user))
      .catch((error) => {
        // Belum login / sesi habis -> arahkan ke halaman login
        if (error?.response?.status === 401) window.location.href = "/login";
      });
    bookingService
      .getRiwayatBooking()
      .then((res) => setBookings(res.data?.bookings ?? []))
      .catch(() => setBookings([]));
  }, []);

  const name = draft.fullName.trim();
  const nameError = name.length < 3 ? "Nama minimal 3 karakter." : "";
  const changes: Record<string, string | null> = {};
  if (profile) {
    if (name !== profile.fullName) changes.full_name = name;
    // Jenis kelamin hanya bisa diisi sekali (akun lama yang masih kosong)
    if (!profile.gender && draft.gender) changes.gender = draft.gender;
    if (draft.address.trim() !== profile.address) changes.address = draft.address.trim();
    if (draft.occupation.trim() !== profile.occupation) changes.occupation = draft.occupation.trim();
  }
  const dirty = Object.keys(changes).length > 0;
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    setSaveError("");
  };

  const handleSave = async () => {
    if (!dirty || nameError) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await profileService.updateProfile(changes);
      applyProfile(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Gagal menyimpan perubahan."));
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya file yang sama bisa dipilih ulang
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError("");
    try {
      const res = await profileService.uploadPhoto(await resizeToSquareJpeg(file));
      setProfile((p) => (p ? { ...p, photo: res.data.user.photo } : p));
    } catch (error) {
      setPhotoError(error instanceof Error && !("response" in error) ? error.message : getApiErrorMessage(error, "Gagal mengunggah foto."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    setPhotoError("");
    try {
      await profileService.deletePhoto();
      setProfile((p) => (p ? { ...p, photo: null } : p));
    } catch (error) {
      setPhotoError(getApiErrorMessage(error, "Gagal menghapus foto."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await profileService.logout();
    } catch {
      // Sesi di server bisa saja sudah habis (401); token lokal tetap dihapus oleh service
    } finally {
      window.location.href = "/login";
    }
  };

  // Janji temu terdekat yang masih aktif + hitungan sederhana
  const today = todayWib();
  const upcoming = (bookings ?? [])
    .filter((b) => b.bookingStatus === "Terkonfirmasi" && b.bookingDate.slice(0, 10) >= today)
    .sort((a, b) => `${a.bookingDate}${a.bookingTime}`.localeCompare(`${b.bookingDate}${b.bookingTime}`));
  const next = upcoming[0];
  const doneCount = (bookings ?? []).filter((b) => b.bookingStatus === "Selesai").length;

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[960px]">
        <PatientPageHeader
          crumbs={[{ label: "Beranda", href: "/" }, { label: "Akun" }]}
          title="Akun saya"
          aside={
            <Link href="/booking" className={ui.btnPrimary}>
              <Plus size={13} />
              Buat janji temu
            </Link>
          }
        />

        {/* Ringkasan akun */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className={`${ui.card} flex items-center gap-4 p-5`}>
            {profile ? (
              <>
                <Avatar profile={profile} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-zinc-900">{profile.fullName}</p>
                  <p className="truncate text-[12px] text-zinc-500">{profile.email}</p>
                  <p className="mt-1.5 text-[12px] text-zinc-500">
                    <span className="font-medium tabular-nums text-zinc-900">{bookings === null ? "–" : doneCount}</span> sesi selesai
                    <span className="mx-1.5 text-zinc-300">·</span>
                    <span className="font-medium tabular-nums text-zinc-900">{bookings === null ? "–" : upcoming.length}</span> akan datang
                  </p>
                </div>
              </>
            ) : (
              <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-100" />
            )}
          </div>

          <div className={`${ui.card} flex flex-col justify-between gap-3 p-5`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-medium text-zinc-500">Janji temu berikutnya</p>
              <Link href="/riwayat-booking" className="inline-flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900">
                Riwayat & rekam medis <ArrowRight size={11} />
              </Link>
            </div>
            {bookings === null ? (
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
            ) : next ? (
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-zinc-900">
                    {formatLongDate(next.bookingDate)} · {formatSlotTime(next.bookingTime)} WIB
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-zinc-500">
                    {next.focusArea?.name ? `Fisioterapi ${next.focusArea.name} · ` : ""}
                    {next.therapistName}
                  </p>
                </div>
                {next.referenceCode && <span className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[11px] text-zinc-700">{next.referenceCode}</span>}
              </div>
            ) : (
              <p className="text-[13px] text-zinc-500">Belum ada jadwal terapi yang akan datang.</p>
            )}
          </div>
        </div>

        {/* Pengaturan */}
        <div className="mt-8">
          <SettingsRow title="Foto profil" description="Membantu terapis mengenali kamu saat datang ke klinik. Foto otomatis dipotong persegi.">
            <div className={`${ui.card} flex flex-wrap items-center gap-4 p-5`}>
              {profile ? <Avatar profile={profile} size="lg" /> : <div className="h-16 w-16 animate-pulse rounded-xl bg-zinc-100" />}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={!profile || photoBusy} className={ui.btnSecondary}>
                    {photoBusy ? "Memproses…" : profile?.photo ? "Ganti foto" : "Unggah foto"}
                  </button>
                  {profile?.photo && (
                    <button type="button" onClick={removePhoto} disabled={photoBusy} className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50">
                      Hapus
                    </button>
                  )}
                </div>
                {photoError ? <p className="text-[11px] text-red-600">{photoError}</p> : <p className="text-[11px] text-zinc-400">JPG, PNG, atau WebP, maksimal 10 MB.</p>}
              </div>
            </div>
          </SettingsRow>

          <SettingsRow title="Informasi pribadi" description="Dipakai terapis untuk asesmen awal. Email, telepon, tanggal lahir, dan jenis kelamin hanya bisa diubah lewat klinik.">
            <div className={ui.card}>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className={ui.label}>Nama lengkap</span>
                  <input value={draft.fullName} onChange={set("fullName")} maxLength={100} disabled={!profile} className={`${ui.input} ${profile && nameError ? "border-red-300" : "border-zinc-200"}`} />
                  {profile && nameError && <span className="text-[11px] text-red-600">{nameError}</span>}
                </label>

                <div className="flex flex-col gap-1.5">
                  <span className={ui.label} id="gender-label">
                    Jenis kelamin
                  </span>
                  {profile?.gender ? (
                    <p className={`${ui.input} flex items-center border-zinc-200 bg-zinc-50 text-zinc-700`} aria-labelledby="gender-label">
                      {genderLabel(profile.gender)}
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5" role="radiogroup" aria-labelledby="gender-label">
                        {GENDER_OPTIONS.map((g) => {
                          const on = draft.gender === g.value;
                          return (
                            <button
                              key={g.value}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              disabled={!profile}
                              onClick={() => setDraft((d) => ({ ...d, gender: g.value }))}
                              className={`h-8 rounded-md text-[13px] transition-colors ${on ? "bg-white font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-800"}`}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[11px] text-zinc-400">Pilih dengan benar, tidak bisa diubah setelah disimpan.</span>
                    </>
                  )}
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className={ui.label}>Pekerjaan</span>
                  <input value={draft.occupation} onChange={set("occupation")} maxLength={100} disabled={!profile} placeholder="Mis. karyawan kantor, guru, atlet" className={`${ui.input} border-zinc-200`} />
                </label>

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className={ui.label}>Alamat</span>
                  <textarea value={draft.address} onChange={set("address")} maxLength={300} rows={2} disabled={!profile} className={`${ui.input} h-auto border-zinc-200 py-2 leading-relaxed`} />
                  <span className="text-[11px] text-zinc-400">Dipakai bila memilih paket homecare.</span>
                </label>

                <dl className="divide-y divide-zinc-100 border-t border-zinc-100 sm:col-span-2">
                  <ReadOnlyItem label="Email" value={profile?.email ?? ""} />
                  <ReadOnlyItem label="Nomor telepon" value={profile?.phone ?? ""} />
                  <ReadOnlyItem label="Tanggal lahir" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : ""} />
                </dl>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
                {saveError && <span className="mr-auto text-[12px] text-red-600">{saveError}</span>}
                {saved && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-zinc-600">
                    <Check size={12} /> Tersimpan
                  </span>
                )}
                <button type="button" onClick={handleSave} disabled={!dirty || !!nameError || saving} className={ui.btnPrimary}>
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </div>
          </SettingsRow>

          <SettingsRow title="Keamanan" description="Setelah kata sandi diganti, sesi di perangkat lain otomatis keluar.">
            <div className={`${ui.card} flex flex-wrap items-center justify-between gap-3 p-5`}>
              <div>
                <p className="text-[13px] font-medium text-zinc-900">Kata sandi</p>
                <p className="text-[12px] text-zinc-500">Minimal 8 karakter, kombinasi huruf dan angka.</p>
              </div>
              <button type="button" onClick={() => setIsPasswordOpen(true)} className={ui.btnSecondary}>
                Ganti kata sandi
              </button>
            </div>
          </SettingsRow>

          <SettingsRow title="Sesi" description="Keluar dari akun di perangkat ini.">
            <div className={`${ui.card} flex flex-wrap items-center justify-between gap-3 p-5`}>
              <div>
                <p className="text-[13px] font-medium text-zinc-900">Keluar akun</p>
                <p className="text-[12px] text-zinc-500">Kamu perlu login lagi untuk membuat booking.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-medium text-red-700 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          </SettingsRow>
        </div>
      </div>

      <ModalLogout isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} onConfirm={handleLogout} isLoggingOut={isLoggingOut} />
      <ModalGantiPassword isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}
