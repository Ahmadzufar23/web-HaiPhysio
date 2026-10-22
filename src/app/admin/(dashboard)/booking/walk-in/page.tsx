"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { clinicService } from "@/services/clinicService";
import { bookingService } from "@/services/bookingService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { FocusArea, TherapyPackage, WalkInPatient, WalkInSlot } from "@/types/api.types";
import { EmptyState, Notice, PageHeader, Panel, btn, inputClass } from "@/components/admin/shared/AdminUI";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { GENDER_OPTIONS, genderLabel } from "@/constants/patient";
import { PAIN_LEVELS } from "@/constants/painScale";
import BodyMapPicker from "@/components/bodymap/BodyMapPicker";
import { formatPainNotes } from "@/lib/painNotes";
import { formatDate, formatRupiah, formatSlotTime, todayWib } from "@/lib/format";

const ageFrom = (dob: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

const slotKey = (s: Pick<WalkInSlot, "slotDate" | "startTime">) => `${String(s.slotDate).slice(0, 10)} ${s.startTime}`;

/** "Pakai sisa paket" = id paket milik pasien; "new" = beli paket baru dari katalog. */
type PackageChoice = { kind: "owned"; patientPackageId: string } | { kind: "new" };

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-medium text-white">{n}</span>
      {children}
    </span>
  );
}

const PHONE_LIKE = /^\+?[\d\s-]{8,}$/;

/**
 * Akun pasien baru oleh staf. Tanpa password: pasien mengaktifkan akun sendiri lewat
 * link di email. Email boleh kosong (akun offline, belum bisa login sampai email diisi).
 */
function NewPatientForm({
  initialQuery,
  onCreated,
  onCancel,
}: {
  initialQuery: string;
  onCreated: (patient: WalkInPatient, activationSent: boolean) => void;
  onCancel: () => void;
}) {
  // Isi awal dari kata kunci pencarian: nomor HP, email, atau nama
  const q = initialQuery.trim();
  const [form, setForm] = useState({
    fullName: !PHONE_LIKE.test(q) && !q.includes("@") ? q : "",
    phone: PHONE_LIKE.test(q) ? q.replace(/[\s-]/g, "") : "",
    email: q.includes("@") ? q : "",
    dateOfBirth: "",
    gender: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const ready = form.fullName.trim().length >= 3 && form.phone.trim() && form.dateOfBirth && form.gender && agreed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      const res = await adminService.createPatient({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        date_of_birth: form.dateOfBirth,
        gender: form.gender,
        email: form.email.trim() || undefined,
        terms_confirmed: true,
      });
      onCreated(res.data.patient, res.data.activationSent);
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal mendaftarkan pasien."));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-md border border-zinc-200 p-3">
      <p className="text-[13px] font-medium text-zinc-900">Daftarkan pasien baru</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500 sm:col-span-2">
          Nama lengkap *
          <input value={form.fullName} onChange={set("fullName")} maxLength={100} className={`${inputClass} h-8`} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          No. HP *
          <input type="tel" value={form.phone} onChange={set("phone")} placeholder="08…" className={`${inputClass} h-8`} />
        </label>
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          Tanggal lahir *
          <input type="date" value={form.dateOfBirth} max={todayWib()} onChange={set("dateOfBirth")} className={`${inputClass} h-8`} />
        </label>
        <div className="flex flex-col gap-1 text-[12px] text-zinc-500">
          <span id="new-gender">Jenis kelamin *</span>
          <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-labelledby="new-gender">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.value}
                type="button"
                role="radio"
                aria-checked={form.gender === g.value}
                onClick={() => setForm((f) => ({ ...f, gender: g.value }))}
                className={`h-8 rounded-md border text-[12px] ${
                  form.gender === g.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
          Email (opsional)
          <input type="email" value={form.email} onChange={set("email")} placeholder="Untuk link aktivasi akun" className={`${inputClass} h-8`} />
        </label>
      </div>
      <p className="text-[12px] text-zinc-500">
        {form.email.trim()
          ? "Link aktivasi dikirim ke email ini. Pasien membuat kata sandinya sendiri."
          : "Tanpa email, akun dibuat offline: rekam medis tetap tersimpan, tapi pasien belum bisa login sampai email diisi dari Detail Pasien."}
      </p>
      <label className="flex items-start gap-2 text-[12px] text-zinc-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
        Pasien sudah menyetujui Syarat & Ketentuan serta Kebijakan Privasi.
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn.secondary} onClick={onCancel} disabled={busy}>
          Batal
        </button>
        <button type="submit" className={btn.primary} disabled={!ready || busy}>
          {busy ? "Menyimpan…" : "Daftarkan & lanjut"}
        </button>
      </div>
    </form>
  );
}

/**
 * Pasien datang langsung (walk-in): staf mencari pasien, memilih paket & jadwal hari ini
 * (atau tanggal lain untuk sisa sesi), lalu mengisi keluhan. Aturan H-1 tidak berlaku
 * untuk staf; kapasitas, spesialisasi, bentrok jadwal, dan kuota tetap dicek di server.
 */
export default function WalkInPage() {
  const router = useRouter();
  const isOwner = useStaffUser().role === "owner";

  // [1] Pasien
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WalkInPatient[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [patient, setPatient] = useState<WalkInPatient | null>(null);
  const [registering, setRegistering] = useState(false);
  const [createdNotice, setCreatedNotice] = useState("");

  // [2] Paket & layanan
  const [catalog, setCatalog] = useState<TherapyPackage[]>([]);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [choice, setChoice] = useState<PackageChoice>({ kind: "new" });
  const [packageId, setPackageId] = useState("");
  const [focusId, setFocusId] = useState("");

  // [3] Jadwal: pilihan disimpan lintas tanggal supaya sisa sesi bisa sekalian dijadwalkan
  const [date, setDate] = useState(todayWib);
  const [loadedSlots, setLoadedSlots] = useState<{ key: string; slots: WalkInSlot[] }>({ key: "", slots: [] });
  const [selected, setSelected] = useState<WalkInSlot[]>([]);

  // [4] Keluhan
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    clinicService
      .getPackages()
      // Walk-in = pasien sudah di klinik, jadi paket homecare tidak ditawarkan
      .then((res) => setCatalog(res.data.packages.filter((p) => p.isActive && !p.isHomeVisit)))
      .catch(() => setCatalog([]));
    bookingService
      .getFocusAreas()
      .then((res) => setFocusAreas(res.data?.focusAreas ?? []))
      .catch(() => setFocusAreas([]));
  }, []);

  const ownedPackage = choice.kind === "owned" ? patient?.activePackages.find((p) => p.id === choice.patientPackageId) ?? null : null;
  const newPackage = choice.kind === "new" ? catalog.find((p) => p.id === packageId) ?? null : null;
  const effectiveFocusId = ownedPackage ? ownedPackage.focusArea?.id ?? "" : focusId;
  const quota = ownedPackage ? ownedPackage.remaining : (newPackage?.totalSessions ?? 1);
  const packageReady = Boolean(ownedPackage || (newPackage && focusId));

  const slotsKey = patient && packageReady ? `${date}|${effectiveFocusId}` : "";
  useEffect(() => {
    if (!slotsKey) return;
    let cancelled = false;
    adminService
      .getWalkInSlots(date, effectiveFocusId)
      .then((res) => !cancelled && setLoadedSlots({ key: slotsKey, slots: res.data.slots }))
      .catch(() => !cancelled && setLoadedSlots({ key: slotsKey, slots: [] }));
    return () => {
      cancelled = true;
    };
  }, [slotsKey, date, effectiveFocusId]);
  const slotsLoading = slotsKey !== "" && loadedSlots.key !== slotsKey;
  const daySlots = slotsLoading ? [] : loadedSlots.slots;

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setSearchError("Isi minimal 3 karakter.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const res = await adminService.lookupPatients(query.trim());
      setResults(res.data.patients);
    } catch (error) {
      setSearchError(getApiErrorMessage(error, "Gagal mencari pasien."));
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const pickPatient = (p: WalkInPatient) => {
    setPatient(p);
    setRegistering(false);
    setCreatedNotice("");
    // Sisa paket didahulukan supaya kuota yang sudah dibayar terpakai dulu
    setChoice(p.activePackages[0] ? { kind: "owned", patientPackageId: p.activePackages[0].id } : { kind: "new" });
    setSelected([]);
    setSaveError("");
  };

  // Ganti paket/layanan → jadwal yang sudah dipilih bisa tidak cocok lagi
  const changeChoice = (next: PackageChoice) => {
    setChoice(next);
    setSelected([]);
  };

  const toggleSlot = (slot: WalkInSlot) => {
    setSaveError("");
    setSelected((cur) => {
      if (cur.some((s) => s.id === slot.id)) return cur.filter((s) => s.id !== slot.id);
      // Satu sesi saja: pilih slot lain = ganti
      if (quota <= 1) return [slot];
      if (cur.length >= quota) return cur;
      return [...cur, slot];
    });
  };

  const sortedSelected = useMemo(() => [...selected].sort((a, b) => slotKey(a).localeCompare(slotKey(b))), [selected]);
  const canSave = Boolean(patient && packageReady && selected.length > 0 && painLevel);

  const save = async () => {
    if (!patient || !canSave) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await adminService.createWalkInBooking({
        patient_id: patient.id,
        slot_ids: selected.map((s) => s.id),
        pain_level: painLevel!,
        // Area body map digabung ke complaint_notes, sama seperti booking online
        complaint_notes: formatPainNotes({ points: painPoints, text: notes }) || undefined,
        ...(ownedPackage ? { patient_package_id: ownedPackage.id } : { package_id: packageId, focus_id: focusId }),
      });
      // Buka sesi paling awal (biasanya yang hari ini), siap di-Start
      const first = res.data.bookings.find((b) => b.slotId === sortedSelected[0].id) ?? res.data.bookings[0];
      router.push(`/admin/sesi/${first.id}`);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Gagal membuat booking."));
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      <Link href="/admin/booking" className="inline-flex w-fit items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900">
        <ArrowLeft size={12} />
        Booking & Sesi
      </Link>
      <PageHeader
        title="Pasien datang langsung"
        description="Untuk pasien yang datang tanpa booking online. Aturan H-1 tidak berlaku di sini; kapasitas slot dan kuota paket tetap dicek."
      />

      {/* [1] Pasien */}
      <Panel title={<StepTitle n={1}>Cari pasien</StepTitle>} bodyClassName="p-4">
        {patient ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-zinc-900">{patient.fullName}</p>
              <p className="text-[12px] text-zinc-500">
                {[patient.patientCode, patient.phone, genderLabel(patient.gender), ageFrom(patient.dateOfBirth) !== null ? `${ageFrom(patient.dateOfBirth)} tahun` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button type="button" className={btn.secondary} onClick={() => setPatient(null)}>
              Ganti pasien
            </button>
            {createdNotice && (
              <div className="w-full">
                <Notice tone="info">{createdNotice}</Notice>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <form onSubmit={search} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="No. HP, email, atau nama pasien"
                className={`${inputClass} h-8`}
                autoFocus
              />
              <button type="submit" className={btn.primary} disabled={searching}>
                <MagnifyingGlass size={13} />
                {searching ? "Mencari…" : "Cari"}
              </button>
            </form>
            {searchError && <Notice tone="error">{searchError}</Notice>}
            {results && results.length === 0 && !registering && (
              <EmptyState title="Pasien belum terdaftar" description="Daftarkan sebagai pasien baru, lalu lanjut pilih paket dan jadwal." />
            )}
            {results && results.length > 0 && (
              <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
                {results.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-zinc-900">{p.fullName}</p>
                      <p className="text-[12px] text-zinc-500">
                        {[p.patientCode, p.phone, genderLabel(p.gender)].filter(Boolean).join(" · ")}
                        {p.activePackages.length > 0 &&
                          ` · ${p.activePackages.map((pk) => `${pk.packageName} sisa ${pk.remaining}`).join(", ")}`}
                      </p>
                    </div>
                    <button type="button" className={btn.secondary} onClick={() => pickPatient(p)}>
                      Pilih
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {registering ? (
              <NewPatientForm
                initialQuery={query}
                onCancel={() => setRegistering(false)}
                onCreated={(p, activationSent) => {
                  pickPatient(p);
                  setCreatedNotice(
                    activationSent
                      ? `Akun dibuat. Link aktivasi dikirim ke ${p.email}.`
                      : "Akun offline dibuat. Isi email pasien nanti dari Detail Pasien supaya pasien bisa login."
                  );
                }}
              />
            ) : (
              results && (
                <button type="button" className={`${btn.secondary} self-start`} onClick={() => setRegistering(true)}>
                  + Daftarkan pasien baru
                </button>
              )
            )}
          </div>
        )}
      </Panel>

      {patient && (
        <>
          {/* [2] Paket & layanan */}
          <Panel title={<StepTitle n={2}>Paket & layanan</StepTitle>} bodyClassName="flex flex-col gap-3 p-4">
            {patient.activePackages.map((pk) => (
              <label key={pk.id} className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-900">
                <input
                  type="radio"
                  name="package"
                  checked={choice.kind === "owned" && choice.patientPackageId === pk.id}
                  onChange={() => changeChoice({ kind: "owned", patientPackageId: pk.id })}
                />
                Pakai sisa {pk.packageName}
                <span className="text-zinc-500">
                  · sisa {pk.remaining} dari {pk.totalSessions} sesi{pk.focusArea?.name ? ` · ${pk.focusArea.name}` : ""}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-900">
              <input type="radio" name="package" checked={choice.kind === "new"} onChange={() => changeChoice({ kind: "new" })} />
              Paket baru
            </label>
            {choice.kind === "new" && (
              <div className="grid gap-3 pl-6 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
                  Paket
                  <select
                    value={packageId}
                    onChange={(e) => {
                      setPackageId(e.target.value);
                      setSelected([]);
                    }}
                    className={`${inputClass} h-8`}
                  >
                    <option value="">Pilih paket</option>
                    {catalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.totalSessions ? ` · ${p.totalSessions} sesi` : ""}
                        {/* Harga hanya untuk owner */}
                        {isOwner && p.pricePerSession !== null ? ` · ${formatRupiah(p.pricePerSession)}/sesi` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
                  Layanan
                  <select
                    value={focusId}
                    onChange={(e) => {
                      setFocusId(e.target.value);
                      setSelected([]);
                    }}
                    className={`${inputClass} h-8`}
                  >
                    <option value="">Pilih layanan</option>
                    {focusAreas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </Panel>

          {/* [3] Jadwal */}
          {packageReady && (
            <Panel
              title={<StepTitle n={3}>Jadwal</StepTitle>}
              description={
                quota > 1
                  ? `Pilih sampai ${quota} jadwal. Ganti tanggal untuk menjadwalkan sisa sesi sekaligus.`
                  : "Pilih satu jadwal. Slot yang sedang berjalan tetap bisa dipakai selama belum berakhir."
              }
              bodyClassName="flex flex-col gap-3 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" value={date} min={todayWib()} onChange={(e) => setDate(e.target.value)} className={`${inputClass} h-8 w-auto`} />
                {date !== todayWib() && (
                  <button type="button" className={btn.secondary} onClick={() => setDate(todayWib())}>
                    Hari ini
                  </button>
                )}
              </div>

              {slotsLoading ? (
                <p className="animate-pulse text-[12px] text-zinc-500">Memuat slot…</p>
              ) : daySlots.length === 0 ? (
                <p className="text-[12px] text-zinc-500">
                  Tidak ada slot yang masih bisa dipakai di tanggal ini.
                  {isOwner ? (
                    <>
                      {" "}
                      Tambah slot dulu di{" "}
                      <Link href="/admin/jadwal" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                        Jadwal
                      </Link>
                      .
                    </>
                  ) : (
                    " Minta owner menambah slot di menu Jadwal."
                  )}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {daySlots.map((slot) => {
                    const on = selected.some((s) => s.id === slot.id);
                    const reason = !slot.handlesFocus ? "Bukan spesialisasinya" : slot.remaining <= 0 ? "Penuh" : "";
                    const full = !on && quota > 1 && selected.length >= quota;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={Boolean(reason) || full}
                        onClick={() => toggleSlot(slot)}
                        className={`flex flex-col items-start rounded-md border px-3 py-2 text-left text-[12px] transition-colors ${
                          on
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : reason || full
                              ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400"
                              : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
                        }`}
                      >
                        <span className="font-medium tabular-nums">
                          {formatSlotTime(slot.startTime)}–{formatSlotTime(slot.endTime)}
                          {slot.inProgress && <span className={on ? "text-white/70" : "text-zinc-500"}> · sedang berjalan</span>}
                        </span>
                        <span className={on ? "text-white/80" : reason ? "" : "text-zinc-500"}>
                          {slot.therapistName} · {reason || `${slot.remaining} kosong`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {sortedSelected.length > 0 && (
                <p className="text-[12px] text-zinc-600">
                  Dipilih ({sortedSelected.length}/{quota}):{" "}
                  {sortedSelected.map((s) => `${formatDate(String(s.slotDate).slice(0, 10))} ${formatSlotTime(s.startTime)} (${s.therapistName})`).join(", ")}
                </p>
              )}
            </Panel>
          )}

          {/* [4] Keluhan */}
          {packageReady && (
            <Panel title={<StepTitle n={4}>Keluhan pasien</StepTitle>} bodyClassName="flex flex-col gap-3 p-4">
              <BodyMapPicker selected={painPoints} onChange={setPainPoints} />
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-zinc-500">Tingkat nyeri saat ini *</span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tingkat nyeri">
                  {PAIN_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      role="radio"
                      aria-checked={painLevel === l.value}
                      onClick={() => setPainLevel(l.value)}
                      className={`h-8 rounded-md border px-3 text-[12px] ${
                        painLevel === l.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {l.value} · {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-1.5 text-[12px] text-zinc-500">
                Keluhan / catatan (opsional)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Mis. nyeri lutut kanan sejak 2 minggu, sakit saat naik tangga"
                  className={`${inputClass} resize-none`}
                />
              </label>
            </Panel>
          )}

          {saveError && <Notice tone="error">{saveError}</Notice>}
          <div className="flex justify-end gap-2">
            <Link href="/admin/booking" className={btn.secondary}>
              Batal
            </Link>
            <button type="button" className={btn.primary} onClick={save} disabled={!canSave || saving}>
              {saving ? "Menyimpan…" : "Simpan & buka sesi"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
