"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CaretRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { AdminBooking, AdminSlot, AdminTherapist } from "@/types/api.types";
import { btn, EmptyState, inputClass, linkClass, Notice, Panel, StatusBadge, tableHead } from "@/components/admin/shared/AdminUI";
import { AccountFields, Field, ProfileFields, validateAccount, validateProfile, type AccountDraft, type ProfileDraft } from "@/components/admin/terapis/TherapistForms";
import { formatDate, formatSlotTime, todayWib } from "@/lib/format";

type Tab = "profil" | "akun" | "jadwal" | "riwayat";
const TABS: { value: Tab; label: string }[] = [
  { value: "profil", label: "Profil" },
  { value: "akun", label: "Akun login" },
  { value: "jadwal", label: "Jadwal" },
  { value: "riwayat", label: "Riwayat sesi" },
];

const toDraft = (t: AdminTherapist): ProfileDraft => ({
  fullName: t.fullName,
  sip: t.sip ?? "",
  phone: t.phone ?? "",
  email: t.email ?? "",
  education: t.education ?? "",
  focusIds: t.specializations.map((s) => s.id),
});

function ProfileTab({ therapist, onSaved }: { therapist: AdminTherapist; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState(() => toDraft(therapist));
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const invalid = validateProfile(draft);
    if (invalid) return setMsg({ tone: "error", text: invalid });
    setSaving(true);
    setMsg(null);
    try {
      await adminService.updateTherapist(therapist.id, {
        full_name: draft.fullName.trim(),
        sip: draft.sip,
        phone: draft.phone,
        email: draft.email,
        education: draft.education,
        focus_ids: draft.focusIds,
      });
      await onSaved();
      setMsg({ tone: "info", text: "Perubahan profil tersimpan." });
    } catch (err) {
      setMsg({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel bodyClassName="p-4">
      <div className="flex flex-col gap-4">
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <ProfileFields value={draft} onChange={setDraft} />
        <div className="flex justify-end">
          <button className={btn.primary} onClick={save} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </button>
        </div>
      </div>
    </Panel>
  );
}

function AccountTab({ therapist, initialError, onSaved }: { therapist: AdminTherapist; initialError: string; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState<AccountDraft>({ email: therapist.email ?? "", phone: therapist.phone ?? "", password: "" });
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(initialError ? { tone: "error", text: `Akun belum dibuat: ${initialError}` } : null);
  const [saving, setSaving] = useState(false);

  const create = async () => {
    const invalid = validateAccount(draft);
    if (invalid) return setMsg({ tone: "error", text: invalid });
    setSaving(true);
    setMsg(null);
    try {
      await adminService.createTherapistAccount(therapist.id, draft);
      await onSaved();
      setMsg({ tone: "info", text: "Akun dibuat. Berikan email dan password awal kepada terapis." });
    } catch (err) {
      setMsg({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return setMsg({ tone: "error", text: "Password minimal 8 karakter, kombinasi huruf dan angka." });
    }
    setSaving(true);
    setMsg(null);
    try {
      await adminService.resetTherapistPassword(therapist.id, password);
      setPassword("");
      setMsg({ tone: "info", text: "Password baru tersimpan. Terapis perlu login ulang." });
    } catch (err) {
      setMsg({ tone: "error", text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (therapist.account?.isOwner) {
    return (
      <Panel bodyClassName="p-4">
        <p className="text-[13px] text-zinc-600">
          Profil ini milik akun owner (<span className="text-zinc-900">{therapist.account.email}</span>). Password owner diubah dari halaman{" "}
          <Link href="/admin/profil" className="underline">
            Profil
          </Link>
          .
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title={therapist.account ? "Akun aktif" : "Belum ada akun"}
      description={therapist.account ? `Login sebagai ${therapist.account.email} di /admin/login` : "Buat akun supaya terapis bisa login dan menjalankan sesi."}
      bodyClassName="p-4"
    >
      <div className="flex flex-col gap-4">
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        {therapist.account ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Password baru" hint="Min. 8 karakter, huruf + angka. Sesi terapis yang sedang login akan diakhiri.">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" autoComplete="new-password" className={inputClass} />
              </Field>
            </div>
            <button className={`${btn.primary} sm:mb-[18px]`} onClick={reset} disabled={saving || !password}>
              Atur ulang password
            </button>
          </div>
        ) : (
          <>
            <AccountFields value={draft} onChange={setDraft} />
            <div className="flex justify-end">
              <button className={btn.primary} onClick={create} disabled={saving}>
                {saving ? "Membuat…" : "Buat akun"}
              </button>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

function ScheduleTab({ therapistId }: { therapistId: string }) {
  const [slots, setSlots] = useState<AdminSlot[] | null>(null);

  useEffect(() => {
    const from = todayWib();
    const to = new Date(Date.parse(`${from}T00:00:00Z`) + 30 * 86400_000).toISOString().slice(0, 10);
    adminService
      .getSlots({ therapist_id: therapistId, date_from: from, date_to: to })
      .then((res) => setSlots(res.data.slots))
      .catch(() => setSlots([]));
  }, [therapistId]);

  return (
    <Panel title="Slot 30 hari ke depan" actions={<Link href="/admin/jadwal" className={linkClass}>Atur di Jadwal Slot</Link>}>
      {slots === null ? (
        <div className="h-24 animate-pulse bg-zinc-50" />
      ) : slots.length === 0 ? (
        <EmptyState title="Belum ada slot" description="Tambahkan slot praktik terapis ini dari menu Jadwal Slot." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className={tableHead}>
                <th className="px-4 py-2 font-medium">Tanggal</th>
                <th className="px-4 py-2 font-medium">Jam</th>
                <th className="px-4 py-2 text-right font-medium">Terisi</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2.5 text-zinc-900">{formatDate(s.slotDate)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-zinc-600">
                    {formatSlotTime(s.startTime)}–{formatSlotTime(s.endTime)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                    {s.bookedCount}/{s.capacity}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{s.status === "aktif" ? "Buka" : "Ditutup"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function HistoryTab({ therapistId }: { therapistId: string }) {
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null);

  useEffect(() => {
    adminService
      .getBookings()
      .then((res) => setBookings(res.data.bookings.filter((b) => b.therapistId === therapistId).reverse()))
      .catch(() => setBookings([]));
  }, [therapistId]);

  return (
    <Panel title="Riwayat sesi" description={bookings ? `${bookings.length} sesi terjadwal untuk terapis ini` : undefined}>
      {bookings === null ? (
        <div className="h-24 animate-pulse bg-zinc-50" />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada sesi" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-[13px]">
            <thead>
              <tr className={tableHead}>
                <th className="px-4 py-2 font-medium">Jadwal</th>
                <th className="px-4 py-2 font-medium">Pasien</th>
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-2.5 tabular-nums text-zinc-700">
                    {formatDate(b.bookingDate)}, {formatSlotTime(b.bookingTime)}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-900">{b.patientName}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{b.packageName ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={b.bookingStatus} />
                  </td>
                  <td className="pr-3 text-right">
                    <Link href={`/admin/sesi/${b.id}`} aria-label="Buka sesi" className="inline-flex p-1 text-zinc-300 group-hover:text-zinc-600">
                      <CaretRight size={14} />
                    </Link>
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

function EditTerapisContent() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [tab, setTab] = useState<Tab>(() => (params.get("tab") as Tab) || "profil");
  const [therapist, setTherapist] = useState<AdminTherapist | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [toggling, setToggling] = useState(false);

  const load = useCallback(
    () =>
      adminService.getTherapistById(id).then(
        (res) => setTherapist(res.data.therapist),
        () => setNotFound(true)
      ),
    [id]
  );

  useEffect(() => {
    if (id) void load();
  }, [id, load]);

  const toggleStatus = async () => {
    if (!therapist) return;
    setToggling(true);
    setStatusMsg("");
    try {
      await adminService.updateTherapist(therapist.id, { status: therapist.status === "aktif" ? "nonaktif" : "aktif" });
      await load();
    } catch (err) {
      setStatusMsg(getApiErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  const back = (
    <Link href="/admin/terapis" className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900">
      <ArrowLeft size={12} />
      Terapis
    </Link>
  );

  if (!id || notFound) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <Panel>
          <EmptyState title="Terapis tidak ditemukan" />
        </Panel>
      </div>
    );
  }
  if (!therapist) return <div className="h-40 animate-pulse rounded-lg bg-white" />;

  const active = therapist.status === "aktif";

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4">
      {back}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-zinc-900">{therapist.fullName}</h1>
          <p className="text-[12px] text-zinc-500">
            {[therapist.specializations.map((s) => s.name).join(", "), therapist.sip && `SIP ${therapist.sip}`, active ? "Aktif" : "Nonaktif"].filter(Boolean).join(" · ")}
          </p>
        </div>
        {!therapist.account?.isOwner && (
          <button className={active ? btn.danger : btn.secondary} onClick={toggleStatus} disabled={toggling}>
            {active ? "Nonaktifkan" : "Aktifkan kembali"}
          </button>
        )}
      </div>

      {statusMsg && <Notice tone="error">{statusMsg}</Notice>}

      <div className="flex gap-4 border-b border-zinc-200" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`-mb-px border-b-2 pb-2 text-[13px] transition-colors ${tab === t.value ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && <ProfileTab key={therapist.id} therapist={therapist} onSaved={load} />}
      {tab === "akun" && <AccountTab key={therapist.account?.email ?? "baru"} therapist={therapist} initialError={params.get("gagal") ?? ""} onSaved={load} />}
      {tab === "jadwal" && <ScheduleTab therapistId={therapist.id} />}
      {tab === "riwayat" && <HistoryTab therapistId={therapist.id} />}
    </div>
  );
}

export default function EditTerapisPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-white" />}>
      <EditTerapisContent />
    </Suspense>
  );
}
