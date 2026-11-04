"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService } from "@/services/superAdminService";
import { btn, inputClass, Notice, PageHeader, Panel } from "@/components/admin/shared/AdminUI";

const EMPTY_FORM = { slug: "", brand: "", name: "", whatsapp: "", commission: "7000", ownerName: "", ownerEmail: "", ownerPhone: "", ownerPassword: "" };

type FieldKey = keyof typeof EMPTY_FORM;

function Field({ label, hint, field, form, onChange, type = "text" }: { label: string; hint?: string; field: FieldKey; form: typeof EMPTY_FORM; onChange: (field: FieldKey, value: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-zinc-700">{label}</span>
      <input type={type} required value={form[field]} onChange={(e) => onChange(field, e.target.value)} autoComplete="off" className={inputClass} />
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}

export default function NewClinicPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (field: FieldKey, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await superAdminService.createClinic({
        slug: form.slug.trim(),
        brand: form.brand.trim(),
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        commission_amount: Number(form.commission),
        owner: { full_name: form.ownerName.trim(), email: form.ownerEmail.trim(), phone: form.ownerPhone.trim(), password: form.ownerPassword },
      });
      router.push(`/super-admin/klinik/${res.data.clinic.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Klinik gagal dibuat."));
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Klinik baru" description="Membuat klinik, akun owner, dan katalog awal. Harga paket diisi owner dari panelnya." />
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Panel title="Data klinik" bodyClassName="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Alamat link" hint={`Pasien membuka /k/${form.slug || "nama-klinik"}`} field="slug" form={form} onChange={handleChange} />
          <Field label="Nama klinik" field="brand" form={form} onChange={handleChange} />
          <Field label="Nama resmi" field="name" form={form} onChange={handleChange} />
          <Field label="WhatsApp klinik" hint="Diawali 62, contoh 6281234567890" field="whatsapp" form={form} onChange={handleChange} />
          <Field label="Komisi per booking (Rp)" hint="5.000 sampai 10.000" field="commission" form={form} onChange={handleChange} type="number" />
        </Panel>
        <Panel title="Akun owner" bodyClassName="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Nama owner" field="ownerName" form={form} onChange={handleChange} />
          <Field label="Email owner" field="ownerEmail" form={form} onChange={handleChange} type="email" />
          <Field label="No. HP owner" hint="Diawali 08" field="ownerPhone" form={form} onChange={handleChange} />
          <Field label="Kata sandi awal" hint="Minimal 8 karakter" field="ownerPassword" form={form} onChange={handleChange} type="password" />
        </Panel>
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className={btn.primary}>
            {busy ? "Menyimpan…" : "Buat klinik"}
          </button>
        </div>
      </form>
    </>
  );
}
