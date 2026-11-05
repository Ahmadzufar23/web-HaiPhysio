"use client";

import { useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type ClinicDetails, type CreateBranchPayload } from "@/services/superAdminService";
import { btn, inputClass, Notice, Panel } from "@/components/admin/shared/AdminUI";
import LogoUploader from "@/components/shared/LogoUploader";
import ClinicLinks from "@/components/shared/ClinicLinks";
import ClinicSetupChecklist from "@/components/shared/ClinicSetupChecklist";
import AccentColorField from "@/components/shared/AccentColorField";
import { isValidAccent } from "@/lib/accentTheme";

const EMPTY_BRANCH = { slug: "", brand: "", name: "", branch_name: "", whatsapp: "", address: "", first_slug: "", first_name: "" };

function AddBranchForm({ details, onDone }: { details: ClinicDetails; onDone: () => Promise<void> }) {
  const [form, setForm] = useState(EMPTY_BRANCH);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Link lama menjadi link merek, jadi cabang pertama perlu alamat sendiri
  const needsFirstBranch = details.branches.length === 1 && details.branches[0].slug === details.group.slug;

  const set = (key: keyof typeof EMPTY_BRANCH) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload: CreateBranchPayload = {
      slug: form.slug.trim(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      branch_name: form.branch_name.trim(),
      whatsapp: form.whatsapp.trim(),
      ...(form.address.trim() ? { address: form.address.trim() } : {}),
      ...(needsFirstBranch ? { first_branch: { slug: form.first_slug.trim(), branch_name: form.first_name.trim() } } : {}),
    };
    try {
      await superAdminService.createBranch(details.group.id, payload);
      setForm(EMPTY_BRANCH);
      await onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "Cabang gagal dibuat."));
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof EMPTY_BRANCH, label: string, hint?: string) => (
    <label key={key} className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-zinc-700">{label}</span>
      <input value={form[key]} onChange={set(key)} className={inputClass} />
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4">
      {error && <Notice tone="error">{error}</Notice>}
      {needsFirstBranch && (
        <div className="grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 sm:grid-cols-2">
          <p className="text-[12px] text-amber-900 sm:col-span-2">Ini cabang kedua. Link /k/{details.group.slug} akan menjadi halaman pilihan cabang, jadi {details.clinic.brand} perlu alamat cabang sendiri.</p>
          {field("first_slug", "Alamat cabang pertama", `Contoh: ${details.group.slug}-pusat`)}
          {field("first_name", "Nama cabang pertama", "Contoh: Pusat")}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("branch_name", "Nama cabang", "Contoh: Jakarta Selatan")}
        {field("slug", "Alamat cabang", "Huruf kecil dan tanda hubung, contoh: prima-jaksel")}
        {field("brand", "Nama tampilan", "Contoh: Prima Fisio Jakarta Selatan")}
        {field("name", "Nama resmi")}
        {field("whatsapp", "WhatsApp", "Diawali 62")}
        {field("address", "Alamat")}
      </div>
      <p className="text-[11px] text-zinc-400">Cabang baru punya harga, jadwal, terapis, dan tagihan sendiri. Owner merek otomatis bisa mengelolanya.</p>
      <div className="flex justify-end">
        <button type="submit" disabled={busy} className={btn.primary}>
          {busy ? "Membuat…" : "Tambah cabang"}
        </button>
      </div>
    </form>
  );
}

function BrandForm({ details, onDone }: { details: ClinicDetails; onDone: () => Promise<void> }) {
  const [name, setName] = useState(details.group.name);
  const [tagline, setTagline] = useState(details.group.tagline ?? "");
  const [about, setAbout] = useState(details.group.about ?? "");
  const [year, setYear] = useState(details.group.foundedYear ? String(details.group.foundedYear) : "");
  const [accent, setAccent] = useState(details.group.accentColor ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await superAdminService.updateGroup(details.group.id, { name: name.trim(), tagline: tagline.trim() || null, about: about.trim() || null, founded_year: year.trim() ? Number(year) : null, accent_color: accent.trim() || null });
      await onDone();
      setMessage({ tone: "info", text: "Identitas merek disimpan." });
    } catch (err) {
      setMessage({ tone: "error", text: getApiErrorMessage(err, "Identitas merek gagal disimpan.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-2">
      {message && (
        <div className="sm:col-span-2">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-zinc-700">Nama merek</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-zinc-700">Tahun berdiri</span>
        <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-[12px] font-medium text-zinc-700">Motto</span>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-[12px] font-medium text-zinc-700">Tentang klinik</span>
        <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} maxLength={2000} className={`${inputClass} h-auto py-2`} />
      </label>
      <AccentColorField value={accent} onChange={setAccent} />
      <div className="flex justify-end sm:col-span-2">
        <button type="submit" disabled={busy || (accent.trim() !== "" && !isValidAccent(accent.trim()))} className={btn.secondary}>
          {busy ? "Menyimpan…" : "Simpan merek"}
        </button>
      </div>
    </form>
  );
}

// Merek, logo, cabang, dan link untuk website klinik
export default function GroupPanel({ details, onChanged }: { details: ClinicDetails; onChanged: () => Promise<void> }) {
  const uploadLogo = async (dataUrl: string) => {
    await superAdminService.uploadGroupLogo(details.group.id, dataUrl);
    await onChanged();
  };

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={`Logo ${details.group.name}`} description="Berlaku untuk semua cabang merek ini." bodyClassName="p-4">
          <LogoUploader logoUrl={details.group.logoUrl} onUpload={uploadLogo} />
        </Panel>
        <Panel title="Kesiapan klinik">
          <ClinicSetupChecklist setup={details.setup} />
        </Panel>
      </div>

      <Panel title={`Cabang ${details.group.name}`} description={details.branches.length > 1 ? `Link merek: /k/${details.group.slug} membuka pilihan cabang.` : "Merek ini belum punya cabang lain."}>
        <ul className="divide-y divide-zinc-100 text-[13px]">
          {details.branches.map((branch) => (
            <li key={branch.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              <span>
                {branch.id === details.clinic.id ? (
                  <span className="font-medium text-zinc-900">{branch.branchName || branch.brand} (sedang dibuka)</span>
                ) : (
                  <Link href={`/super-admin/klinik/${branch.id}`} className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                    {branch.branchName || branch.brand}
                  </Link>
                )}
                <span className="block font-mono text-[11px] text-zinc-400">/k/{branch.slug}</span>
              </span>
              {branch.billingStatus === "suspended" ? <span className="font-medium text-red-700">Suspend</span> : <span className="text-zinc-600">Aktif</span>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Link untuk website ${details.clinic.brand}`} description="Pasang di website company profile atau media sosial klinik. Pasien yang masuk lewat link ini otomatis ke klinik ini.">
        <ClinicLinks slug={details.clinic.slug} />
      </Panel>

      <Panel title="Identitas merek" description="Tampil di situs pasien semua cabang.">
        <BrandForm key={details.group.id} details={details} onDone={onChanged} />
      </Panel>

      <Panel title="Tambah cabang">
        <AddBranchForm details={details} onDone={onChanged} />
      </Panel>
    </>
  );
}
