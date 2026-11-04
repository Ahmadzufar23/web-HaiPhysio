"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type ClinicBookings, type ClinicDetails } from "@/services/superAdminService";
import { btn, EmptyState, inputClass, MetricStrip, Notice, Panel, StatusBadge, tableHead } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";
import type { BookingStatus } from "@/types/api.types";

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }) : "Belum pernah");

export function AccountsPanel({ details }: { details: ClinicDetails }) {
  const { accounts, therapistsWithoutAccount, stats } = details;
  return (
    <>
      <MetricStrip
        items={[
          { label: "Pasien", value: stats.patients },
          { label: "Staf berakun", value: accounts.length },
          { label: "Slot aktif ke depan", value: stats.upcomingActiveSlots },
          { label: "Video aktif", value: stats.activeVideos },
        ]}
      />
      <Panel title="Akun staf" description="Login terakhir dihitung dari sesi yang masih tersimpan.">
        {accounts.length === 0 ? (
          <EmptyState title="Belum ada akun staf" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Nama</th>
                  <th className="px-4 py-2 font-medium">Peran</th>
                  <th className="px-4 py-2 font-medium">Kontak</th>
                  <th className="px-4 py-2 font-medium">SIP</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Login terakhir</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.userId} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{account.fullName}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{account.role === "owner" ? "Owner" : "Terapis"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">
                      {account.email}
                      <span className="block text-[11px] text-zinc-400">{account.phone}</span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{account.sip ?? "—"}</td>
                    <td className={`px-4 py-2.5 ${account.therapistStatus === "nonaktif" ? "font-medium text-red-700" : "text-zinc-600"}`}>{account.therapistStatus === "nonaktif" ? "Nonaktif" : "Aktif"}</td>
                    <td className="px-4 py-2.5 tabular-nums text-zinc-600">{formatDateTime(account.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {therapistsWithoutAccount.length > 0 && (
        <Panel title="Terapis tanpa akun login" description="Profilnya ada dan bisa dijadwalkan, tapi belum bisa masuk ke panel.">
          <ul className="divide-y divide-zinc-100 text-[13px]">
            {therapistsWithoutAccount.map((therapist) => (
              <li key={therapist.therapistId} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span className="text-zinc-900">{therapist.fullName}</span>
                <span className="text-zinc-600">{therapist.therapistStatus === "aktif" ? "Aktif" : "Nonaktif"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

export function PackagesPanel({ details }: { details: ClinicDetails }) {
  return (
    <Panel title="Harga paket" description="Harga diatur owner klinik. Booking lama tetap memakai harga saat booking dibuat.">
      {details.packages.length === 0 ? (
        <EmptyState title="Belum ada paket" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className={tableHead}>
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 text-right font-medium">Jumlah sesi</th>
                <th className="px-4 py-2 text-right font-medium">Harga per sesi</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {details.packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{pkg.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">{pkg.totalSessions ?? "—"}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${pkg.pricePerSession === null ? "text-amber-700" : "text-zinc-900"}`}>{pkg.pricePerSession === null ? "Belum diatur" : formatRupiah(pkg.pricePerSession)}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{pkg.isActive ? "Ditawarkan" : "Tidak ditawarkan"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function BookingsPanel({ clinicId, period }: { clinicId: string; period: string }) {
  const [data, setData] = useState<ClinicBookings | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    superAdminService
      .getBookings(clinicId, period)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Booking gagal dimuat."));
      });
    return () => {
      cancelled = true;
    };
  }, [clinicId, period]);

  if (error) return <Notice tone="error">{error}</Notice>;

  const hidden = data ? data.total - data.bookings.length : 0;

  return (
    <Panel title={`Booking ${period}`} description={hidden > 0 ? `Menampilkan ${data?.bookings.length} dari ${data?.total} booking.` : "Tanpa identitas pasien."}>
      {data === null && <p className="px-4 py-6 text-[13px] text-zinc-500">Memuat…</p>}
      {data?.bookings.length === 0 && <EmptyState title="Belum ada booking di periode ini" />}
      {data && data.bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className={tableHead}>
                <th className="px-4 py-2 font-medium">Kode</th>
                <th className="px-4 py-2 font-medium">Jadwal</th>
                <th className="px-4 py-2 font-medium">Terapis</th>
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 text-right font-medium">Harga</th>
                <th className="px-4 py-2 font-medium">Asal</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-zinc-900">{booking.referenceCode}</td>
                  <td className="px-4 py-2.5 tabular-nums text-zinc-600">
                    {booking.slotDate} {booking.startTime.slice(0, 5)}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{booking.therapistName}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{booking.packageName ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(booking.pricePerSession)}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{booking.source === "walk_in" ? "Datang langsung" : "Online"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={booking.status as BookingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

type ProfileField = "brand" | "name" | "address" | "hours" | "hours_note" | "whatsapp" | "home_visit_whatsapp" | "email" | "instagram";

const PROFILE_FIELDS: { key: ProfileField; label: string; hint?: string }[] = [
  { key: "brand", label: "Nama klinik" },
  { key: "name", label: "Nama resmi" },
  { key: "address", label: "Alamat" },
  { key: "hours", label: "Jam buka", hint: "Contoh: Senin sampai Sabtu, 08.00 sampai 16.00 WIB" },
  { key: "hours_note", label: "Catatan jam buka", hint: "Contoh: Minggu tutup" },
  { key: "whatsapp", label: "WhatsApp klinik", hint: "Diawali 62" },
  { key: "home_visit_whatsapp", label: "WhatsApp Homecare", hint: "Diawali 62. Kosong berarti memakai WhatsApp klinik" },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram", hint: "Tanpa @" },
];

const REQUIRED_FIELDS: ProfileField[] = ["brand", "name"];

function profileToForm({ clinic }: ClinicDetails): Record<ProfileField, string> {
  return {
    brand: clinic.brand,
    name: clinic.name,
    address: clinic.address ?? "",
    hours: clinic.hours ?? "",
    hours_note: clinic.hoursNote ?? "",
    whatsapp: clinic.whatsapp ?? "",
    home_visit_whatsapp: clinic.homeVisitWhatsapp ?? "",
    email: clinic.email ?? "",
    instagram: clinic.instagram ?? "",
  };
}

export function ProfilePanel({ details, onSaved }: { details: ClinicDetails; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(() => profileToForm(details));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const initial = profileToForm(details);
    // Hanya yang berubah; kolom opsional yang dikosongkan dikirim sebagai null
    const changes = Object.fromEntries(
      (Object.keys(form) as ProfileField[])
        .filter((key) => form[key].trim() !== initial[key])
        .map((key) => [key, form[key].trim() || (REQUIRED_FIELDS.includes(key) ? "" : null)])
    );
    if (Object.keys(changes).length === 0) {
      setBusy(false);
      return;
    }
    try {
      await superAdminService.updateProfile(details.clinic.id, changes);
      await onSaved();
      setSaved(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Profil gagal disimpan."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="info">Profil klinik disimpan dan langsung tampil di situs pasien.</Notice>}
      <Panel title="Profil klinik" description="Identitas yang dilihat pasien di situs klinik ini." bodyClassName="grid gap-3 p-4 sm:grid-cols-2">
        {PROFILE_FIELDS.map(({ key, label, hint }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-zinc-700">{label}</span>
            <input value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className={inputClass} />
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
  );
}
