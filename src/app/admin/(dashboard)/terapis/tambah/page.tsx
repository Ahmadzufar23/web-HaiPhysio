"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import { btn, Notice, PageHeader, Panel } from "@/components/admin/shared/AdminUI";
import { AccountFields, emptyProfile, ProfileFields, validateAccount, validateProfile, type AccountDraft, type ProfileDraft } from "@/components/admin/terapis/TherapistForms";

export default function TambahTerapisPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [withAccount, setWithAccount] = useState(true);
  const [account, setAccount] = useState<AccountDraft>({ email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validateProfile(profile) ?? (withAccount ? validateAccount(account) : null);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await adminService.createTherapist({
        full_name: profile.fullName.trim(),
        sip: profile.sip,
        phone: profile.phone,
        email: profile.email,
        education: profile.education,
        focus_ids: profile.focusIds,
      });
      const id: string = res.data.therapist.id;
      if (withAccount) {
        try {
          await adminService.createTherapistAccount(id, account);
        } catch (err) {
          // Profil sudah tersimpan; akun bisa dibuat ulang dari halaman Kelola
          router.push(`/admin/terapis/edit?id=${id}&tab=akun&gagal=${encodeURIComponent(getApiErrorMessage(err))}`);
          return;
        }
      }
      router.push(`/admin/terapis/edit?id=${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal menyimpan terapis."));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-[820px] flex-col gap-5">
      <Link href="/admin/terapis" className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900">
        <ArrowLeft size={12} />
        Terapis
      </Link>
      <PageHeader title="Tambah terapis" description="Jadwal praktik diatur di menu Jadwal Slot setelah terapis disimpan." />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel title="Profil" bodyClassName="p-4">
        <ProfileFields value={profile} onChange={setProfile} />
      </Panel>

      <Panel
        title="Akun login"
        description="Terapis login di /admin/login. Password awal dibuat owner dan bisa diganti kapan saja."
        actions={
          <label className="flex items-center gap-2 text-[12px] text-zinc-600">
            <input type="checkbox" checked={withAccount} onChange={(e) => setWithAccount(e.target.checked)} className="h-3.5 w-3.5 accent-zinc-900" />
            Buat sekarang
          </label>
        }
        bodyClassName={withAccount ? "p-4" : ""}
      >
        {withAccount && <AccountFields value={account} onChange={setAccount} />}
      </Panel>

      <div className="flex justify-end gap-2">
        <Link href="/admin/terapis" className={btn.secondary}>
          Batal
        </Link>
        <button type="submit" className={btn.primary} disabled={saving}>
          {saving ? "Menyimpan…" : "Simpan terapis"}
        </button>
      </div>
    </form>
  );
}
