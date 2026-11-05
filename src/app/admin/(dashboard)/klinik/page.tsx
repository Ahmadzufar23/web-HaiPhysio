"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { ownerClinicService, type BranchSummary, type OwnerClinicPayload, type OwnerClinicProfile } from "@/services/ownerClinicService";
import { currentPeriod } from "@/services/superAdminService";
import { btn, inputClass, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import LogoUploader from "@/components/shared/LogoUploader";
import ClinicLinks from "@/components/shared/ClinicLinks";
import ClinicSetupChecklist from "@/components/shared/ClinicSetupChecklist";
import AccentColorField from "@/components/shared/AccentColorField";
import { isValidAccent } from "@/lib/accentTheme";
import { formatRupiah } from "@/lib/format";

type TextField = "name" | "tagline" | "about" | "address" | "hours" | "hours_note" | "whatsapp" | "home_visit_whatsapp" | "email" | "instagram";

const BRAND_FIELDS: { key: TextField; label: string; hint?: string; long?: boolean }[] = [
  { key: "name", label: "Nama merek", hint: "Berlaku untuk semua cabang" },
  { key: "tagline", label: "Motto", hint: "Tampil di halaman depan" },
  { key: "about", label: "Tentang klinik", hint: "Tampil di halaman Tentang Kami", long: true },
];

const BRANCH_FIELDS: { key: TextField; label: string; hint?: string }[] = [
  { key: "address", label: "Alamat" },
  { key: "hours", label: "Jam buka", hint: "Contoh: Senin sampai Sabtu, 08.00 sampai 16.00 WIB" },
  { key: "hours_note", label: "Catatan jam buka", hint: "Contoh: Minggu tutup" },
  { key: "whatsapp", label: "WhatsApp klinik", hint: "Diawali 62" },
  { key: "home_visit_whatsapp", label: "WhatsApp Homecare", hint: "Diawali 62. Kosong berarti memakai WhatsApp klinik" },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram", hint: "Tanpa @" },
];

function toForm({ clinic, group }: OwnerClinicProfile): Record<TextField, string> & { founded_year: string; accent_color: string } {
  return {
    accent_color: group.accentColor ?? "",
    name: group.name,
    tagline: group.tagline ?? "",
    about: group.about ?? "",
    founded_year: group.foundedYear ? String(group.foundedYear) : "",
    address: clinic.address ?? "",
    hours: clinic.hours ?? "",
    hours_note: clinic.hoursNote ?? "",
    whatsapp: clinic.whatsapp ?? "",
    home_visit_whatsapp: clinic.homeVisitWhatsapp ?? "",
    email: clinic.email ?? "",
    instagram: clinic.instagram ?? "",
  };
}

export default function OwnerClinicPage() {
  const [profile, setProfile] = useState<OwnerClinicProfile | null>(null);
  const [form, setForm] = useState<ReturnType<typeof toForm> | null>(null);
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    Promise.all([ownerClinicService.getProfile(), ownerClinicService.getBranchesSummary(currentPeriod())])
      .then(([profileRes, summaryRes]) => {
        setProfile(profileRes.data);
        setForm(toForm(profileRes.data));
        setBranches(summaryRes.data.branches);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Data klinik gagal dimuat.")));
  }, []);

  if (!profile || !form) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[13px] text-zinc-500">Memuat…</p>;

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.accent_color.trim() && !isValidAccent(form.accent_color.trim())) {
      setError("Warna klinik belum bisa dipakai. Pilih warna lain.");
      return;
    }
    const initial = toForm(profile);
    const changes: OwnerClinicPayload = {};
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (form[key].trim() === initial[key]) continue;
      if (key === "founded_year") changes.founded_year = form.founded_year.trim() ? Number(form.founded_year) : null;
      else if (key === "name") changes.name = form.name.trim();
      else changes[key] = form[key].trim() || null;
    }
    if (Object.keys(changes).length === 0) return;

    setBusy(true);
    setError("");
    setSaved("");
    try {
      const res = await ownerClinicService.updateProfile(changes);
      setProfile(res.data);
      setForm(toForm(res.data));
      setSaved("Profil disimpan dan langsung tampil di situs pasien.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Profil gagal disimpan."));
    } finally {
      setBusy(false);
    }
  };

  const uploadLogo = async (dataUrl: string) => {
    const res = await ownerClinicService.uploadLogo(dataUrl);
    setProfile({ ...profile, group: { ...profile.group, logoUrl: res.data.logoUrl }, setup: { ...profile.setup, hasLogo: true } });
    setSaved("Logo diperbarui. Muat ulang halaman untuk melihatnya di menu.");
  };

  return (
    <>
      <PageHeader title="Profil Klinik" description={`${profile.clinic.brand}. Logo dan identitas yang dilihat pasien, serta link untuk website klinik.`} />
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="info">{saved}</Notice>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Logo klinik" description="Tampil di menu panel, situs pasien, dan rekam medis cetak." bodyClassName="p-4">
          <LogoUploader logoUrl={profile.group.logoUrl} onUpload={uploadLogo} />
        </Panel>
        <Panel title="Kesiapan klinik">
          <ClinicSetupChecklist setup={profile.setup} />
        </Panel>
      </div>

      <Panel title="Link untuk website klinik" description="Pasang di website company profile, Instagram, atau Google Maps supaya pasien langsung masuk ke klinik ini.">
        <ClinicLinks slug={profile.clinic.slug} />
      </Panel>

      {branches.length > 1 && (
        <Panel title="Semua cabang" description="Ringkasan bulan ini. Pindah cabang lewat pilihan di menu.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Cabang</th>
                  <th className="px-4 py-2 text-right font-medium">Sesi selesai</th>
                  <th className="px-4 py-2 text-right font-medium">Pendapatan</th>
                  <th className="px-4 py-2 text-right font-medium">Booking ke depan</th>
                  <th className="px-4 py-2 text-right font-medium">Tidak hadir</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.slug} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{branch.branchName || branch.brand}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{branch.completedSessions}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(branch.revenue)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{branch.upcomingBookings}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{branch.noShows}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{branch.billingStatus === "suspended" ? <span className="font-medium text-red-700">Suspend</span> : "Aktif"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Panel title="Identitas merek" description="Berlaku untuk semua cabang." bodyClassName="grid gap-3 p-4 sm:grid-cols-2">
          {BRAND_FIELDS.map(({ key, label, hint, long }) => (
            <label key={key} className={`flex flex-col gap-1 ${long ? "sm:col-span-2" : ""}`}>
              <span className="text-[12px] font-medium text-zinc-700">{label}</span>
              {long ? <textarea value={form[key]} onChange={set(key)} rows={3} maxLength={2000} className={`${inputClass} h-auto py-2`} /> : <input value={form[key]} onChange={set(key)} className={inputClass} />}
              {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
            </label>
          ))}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-zinc-700">Tahun berdiri</span>
            <input inputMode="numeric" value={form.founded_year} onChange={set("founded_year")} placeholder="Contoh: 2015" className={inputClass} />
            <span className="text-[11px] text-zinc-400">Kosongkan kalau tidak ingin ditampilkan</span>
          </label>
          <AccentColorField value={form.accent_color} onChange={(value) => setForm({ ...form, accent_color: value })} />
        </Panel>
        <Panel title={`Data ${profile.clinic.branchName || "klinik"}`} description="Hanya untuk cabang yang sedang dipilih." bodyClassName="grid gap-3 p-4 sm:grid-cols-2">
          {BRANCH_FIELDS.map(({ key, label, hint }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-zinc-700">{label}</span>
              <input value={form[key]} onChange={set(key)} className={inputClass} />
              {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
            </label>
          ))}
        </Panel>
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className={btn.primary}>
            {busy ? "Menyimpan…" : "Simpan profil"}
          </button>
        </div>
      </form>
    </>
  );
}
