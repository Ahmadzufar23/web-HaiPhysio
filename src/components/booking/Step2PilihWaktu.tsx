"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { bookingService } from "@/services/bookingService";
import { getApiErrorMessage } from "@/app/utils/api";
import { formatLongDate, formatSlotTime, initials, todayWib } from "@/lib/format";
import { ErrorNotice, Section, StepNav, ui } from "./BookingUI";
import { slotLabel, sortSlots, type BookingDraft, type SelectedSlot } from "./bookingDraft";

type Step2Result = Pick<BookingDraft, "slots">;

interface Step2Props {
  draft: BookingDraft;
  onBack: () => void;
  onNext: (result: Step2Result) => void;
  /** Dipanggil setiap pilihan berubah supaya Ringkasan ikut terisi sebelum Lanjut */
  onPick: (slots: SelectedSlot[]) => void;
}

type Therapist = { id: string; fullName: string; specializations?: { name: string }[] };
type Slot = { id: string; therapistId: string; date: string; startTime: string; status: "tersedia" | "penuh" | "lainnya" };

// Kalender pakai string "YYYY-MM-DD" (tanggal WIB) supaya tidak bergeser zona waktu
const noon = (d: string) => new Date(`${d}T12:00:00Z`);
const addDays = (d: string, n: number) => new Date(noon(d).getTime() + n * 86_400_000).toISOString().slice(0, 10);
const mondayOf = (d: string) => addDays(d, -((noon(d).getUTCDay() + 6) % 7));
const dayName = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", weekday: "short" });
const dayNum = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric" });
const shortDate = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

export default function Step2PilihWaktu({ draft, onBack, onNext, onPick }: Step2Props) {
  const thisWeek = mondayOf(todayWib());
  const [therapists, setTherapists] = useState<Therapist[] | null>(null);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const firstPicked = sortSlots(draft.slots)[0];
  const [weekStart, setWeekStart] = useState(firstPicked ? mondayOf(firstPicked.slotDate.slice(0, 10)) : thisWeek);
  const [day, setDay] = useState<string | null>(firstPicked ? firstPicked.slotDate.slice(0, 10) : null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  // Jadwal terpilih (bisa lintas minggu), maksimal sebanyak kuota sesi paket
  const [picked, setPicked] = useState<SelectedSlot[]>(draft.slots);
  const quota = Math.max(draft.sessionQuota, 1);
  const quotaFull = picked.length >= quota;
  const [error, setError] = useState("");

  const choose = (next: SelectedSlot[]) => {
    setPicked(next);
    onPick(sortSlots(next));
  };

  // Terapis yang memegang layanan terpilih
  useEffect(() => {
    bookingService
      .getTherapists(draft.serviceId)
      .then((res) => {
        const list: Therapist[] = res.data?.therapists ?? [];
        setTherapists(list);
        setActiveIds(list.map((t) => t.id));
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Gagal memuat daftar terapis."));
        setTherapists([]);
      });
  }, [draft.serviceId]);

  // Slot seminggu untuk semua terapis layanan ini; filter terapis dilakukan di klien
  const allIds = useMemo(() => (therapists ?? []).map((t) => t.id), [therapists]);
  const slotsKey = `${weekStart}|${allIds.join(",")}`;
  const slotsLoading = therapists === null || (allIds.length > 0 && loadedKey !== slotsKey);

  useEffect(() => {
    if (allIds.length === 0) return;
    Promise.all(allIds.map((id) => bookingService.getScheduleGrid(id, weekStart).then((res) => ({ id, rows: res.data?.slots ?? [] }))))
      .then((results) => {
        const next: Slot[] = results.flatMap(({ id, rows }) =>
          rows.map((s: { id: string; slotDate: string; startTime: string; cellStatus: string; isPast: boolean; isBookable?: boolean }) => ({
            id: s.id,
            therapistId: id,
            date: String(s.slotDate).slice(0, 10),
            startTime: s.startTime,
            // Booking paling cepat H-1: slot hari ini (isBookable false) disembunyikan
            status: s.isPast || s.isBookable === false ? "lainnya" : s.cellStatus === "Tersedia" ? "tersedia" : s.cellStatus === "Penuh" ? "penuh" : "lainnya",
          }))
        );
        setSlots(next);
        setLoadedKey(slotsKey);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Gagal memuat jadwal."));
        setLoadedKey(slotsKey);
      });
  }, [allIds, weekStart, slotsKey]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visible = useMemo(
    () => slots.filter((s) => s.status !== "lainnya" && activeIds.includes(s.therapistId)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, activeIds]
  );
  const availableOn = (d: string) => visible.filter((s) => s.date === d && s.status === "tersedia").length;

  // Hari aktif: pilihan user bila masih di minggu ini, kalau tidak hari pertama yang punya slot
  const activeDay = day && weekDays.includes(day) ? day : (weekDays.find((d) => availableOn(d) > 0) ?? weekDays[0]);
  const daySlots = visible.filter((s) => s.date === activeDay);
  const therapistName = (id: string) => therapists?.find((t) => t.id === id)?.fullName ?? "Fisioterapis";

  const toggleTherapist = (id: string) => {
    setActiveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isPicked = (slotId: string) => picked.some((p) => p.slotId === slotId);
  // Pasien tidak boleh punya dua sesi di jam yang sama (BE juga menolak)
  const clashes = (s: Slot) => picked.some((p) => p.slotId !== s.id && p.slotDate === s.date && p.startTime.slice(0, 5) === s.startTime.slice(0, 5));

  const togglePick = (s: Slot) => {
    if (isPicked(s.id)) {
      choose(picked.filter((p) => p.slotId !== s.id));
      return;
    }
    const next: SelectedSlot = { slotId: s.id, therapistId: s.therapistId, therapistName: therapistName(s.therapistId), slotDate: s.date, startTime: s.startTime };
    // Kuota 1: memilih slot lain langsung mengganti pilihan
    if (quota === 1) choose([next]);
    else if (picked.length < quota) choose([...picked, next]);
  };

  const moveWeek = (n: number) => {
    setWeekStart((w) => addDays(w, n * 7));
    setDay(null);
  };

  const handleNext = () => {
    if (picked.length === 0) return;
    onNext({ slots: sortSlots(picked) });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorNotice>{error}</ErrorNotice>}

      <Section title="Fisioterapis" description="Hanya terapis yang menangani layanan pilihanmu. Matikan nama untuk menyaring jadwal.">
        {therapists === null ? (
          <div className="flex gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-9 w-44 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        ) : therapists.length === 0 ? (
          <p className="text-[13px] text-zinc-500">Belum ada terapis untuk layanan ini. Silakan pilih layanan lain atau hubungi klinik.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {therapists.map((t) => {
              const on = activeIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTherapist(t.id)}
                  className={`flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-[12px] transition-colors ${
                    on ? "border-zinc-900 bg-white text-zinc-900" : "border-zinc-200 bg-zinc-50 text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold ${on ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-500"}`}>
                    {initials(t.fullName)}
                  </span>
                  {t.fullName}
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <Section
        title="Jadwal"
        description={
          quota > 1
            ? `Pilih hingga ${quota} jadwal (1 jam per sesi, WIB). Booking paling cepat H-1; sisa sesi bisa dijadwalkan nanti dari Riwayat.`
            : "Setiap sesi berlangsung sekitar 1 jam. Waktu dalam WIB. Booking paling cepat H-1."
        }
        actions={
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => moveWeek(-1)} disabled={weekStart <= thisWeek} aria-label="Minggu sebelumnya" className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40">
              <CaretLeft size={12} />
            </button>
            <span className="min-w-[150px] text-center text-[12px] text-zinc-700">
              {shortDate.format(noon(weekDays[0])).replace(/ \d{4}$/, "")} – {shortDate.format(noon(weekDays[6]))}
            </span>
            <button type="button" onClick={() => moveWeek(1)} aria-label="Minggu berikutnya" className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              <CaretRight size={12} />
            </button>
          </div>
        }
      >
        {/* Pilih hari */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => {
            const count = slotsLoading ? 0 : availableOn(d);
            const isActive = d === activeDay;
            const past = d < todayWib();
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                disabled={past}
                className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isActive ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className={`text-[11px] ${isActive ? "text-white/70" : "text-zinc-500"}`}>{dayName.format(noon(d))}</span>
                <span className="text-[14px] font-semibold">{dayNum.format(noon(d))}</span>
                <span className={`text-[10px] ${isActive ? "text-white/70" : count > 0 ? "text-zinc-600" : "text-zinc-300"}`}>{slotsLoading ? "·" : count > 0 ? `${count} slot` : "Kosong"}</span>
              </button>
            );
          })}
        </div>

        {/* Slot di hari terpilih */}
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-medium text-zinc-700">{formatLongDate(activeDay)}</p>
          {slotsLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[52px] animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          ) : activeIds.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-6 text-center text-[12px] text-zinc-500">Pilih minimal satu fisioterapis untuk melihat jadwal.</p>
          ) : daySlots.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-6 text-center text-[12px] text-zinc-500">Tidak ada jadwal di hari ini. Coba hari atau minggu lain.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" role="radiogroup" aria-label="Pilih jam">
              {daySlots.map((s) => {
                const isSelected = isPicked(s.id);
                const full = s.status === "penuh";
                const blocked = !isSelected && (clashes(s) || (quota > 1 && quotaFull));
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    disabled={full || blocked}
                    title={blocked ? (clashes(s) ? "Kamu sudah memilih jam yang sama" : "Kuota sesi paket sudah terpilih semua") : undefined}
                    onClick={() => togglePick(s)}
                    className={`flex flex-col px-3 py-2 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:bg-zinc-50 ${ui.option(isSelected)}`}
                  >
                    <span className={`text-[13px] font-semibold ${full ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{formatSlotTime(s.startTime)}</span>
                    <span className="truncate text-[11px] text-zinc-500">{full ? "Penuh" : therapistName(s.therapistId)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {quota > 1 && (
        <Section title={`Jadwal terpilih (${picked.length}/${quota})`} description={picked.length < quota ? `${quota - picked.length} sesi lagi bisa dijadwalkan sekarang atau nanti.` : "Semua sesi paket sudah terjadwal."}>
          {picked.length === 0 ? (
            <p className="text-[12px] text-zinc-500">Belum ada jadwal dipilih.</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {sortSlots(picked).map((p, i) => (
                <li key={p.slotId} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2">
                  <span className="min-w-0 text-[12px] text-zinc-800">
                    <span className="mr-2 tabular-nums text-zinc-400">{i + 1}.</span>
                    {slotLabel(p)} <span className="text-zinc-500">· {p.therapistName}</span>
                  </span>
                  <button type="button" onClick={() => choose(picked.filter((x) => x.slotId !== p.slotId))} aria-label="Hapus jadwal ini" className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Section>
      )}

      <StepNav onBack={onBack} onNext={handleNext} disabled={picked.length === 0} hint={picked.length > 0 ? undefined : "Pilih jam terapi"} />
    </div>
  );
}
