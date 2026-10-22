"use client";

import { useEffect, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { StaffVideoFolder, StaffVideoProgram } from "@/types/api.types";
import { btn, inputClass, Notice } from "@/components/admin/shared/AdminUI";
import { VideoThumb } from "@/components/video/VideoUI";

const dayFmt = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short" });

/**
 * Program video pasien: terapis/owner mengirim video dari perpustakaan beserta dosisnya,
 * lalu memantau check-in harian (14 hari terakhir).
 */
export default function ProgramManager({ patientId }: { patientId: string }) {
  const [program, setProgram] = useState<StaffVideoProgram | null>(null);
  const [library, setLibrary] = useState<StaffVideoFolder[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [folderId, setFolderId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [dosage, setDosage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    videoService
      .getPatientProgram(patientId)
      .then((res) => setProgram(res.data.program))
      .catch((err) => setError(getApiErrorMessage(err, "Gagal memuat program video.")));
  }, [patientId]);

  const openForm = () => {
    setAdding(true);
    setError("");
    if (library) return;
    videoService
      .getLibrary()
      .then((res) => {
        setLibrary(res.data.folders);
        const first = res.data.folders.find((f) => f.videos.some((v) => v.ready && v.isActive));
        if (first) setFolderId(first.id);
      })
      .catch((err) => setError(getApiErrorMessage(err)));
  };

  const assigned = new Set(program?.items.map((i) => i.video.id));
  const choices = library?.find((f) => f.id === folderId)?.videos.filter((v) => v.ready && v.isActive && !assigned.has(v.id)) ?? [];

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId) return setError("Pilih video yang akan dikirim.");
    setBusy("send");
    setError("");
    try {
      const res = await videoService.assignVideo(patientId, videoId, dosage.trim());
      setProgram(res.data.program);
      setVideoId("");
      setDosage("");
      setAdding(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal mengirim video."));
    } finally {
      setBusy(null);
    }
  };

  const stop = async (assignmentId: string) => {
    setBusy(assignmentId);
    setError("");
    try {
      const res = await videoService.endAssignment(patientId, assignmentId);
      setProgram(res.data.program);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-zinc-700">Program video</p>
          <p className="text-[11px] text-zinc-400">Pasien check-in otomatis setelah menonton video sampai habis.</p>
        </div>
        {!adding && (
          <button type="button" onClick={openForm} className={btn.secondary}>
            <Plus size={12} />
            Kirim video
          </button>
        )}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {adding && (
        <form onSubmit={send} className="mb-3 mt-2 grid gap-2 rounded-md border border-zinc-200 bg-zinc-50/60 p-3 sm:grid-cols-2">
          {library === null ? (
            <div className="h-8 animate-pulse rounded bg-zinc-100 sm:col-span-2" />
          ) : (
            <>
              <select
                value={folderId}
                onChange={(e) => {
                  setFolderId(e.target.value);
                  setVideoId("");
                }}
                className={inputClass}
                aria-label="Folder"
              >
                {library.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <select value={videoId} onChange={(e) => setVideoId(e.target.value)} className={inputClass} aria-label="Video">
                <option value="">{choices.length ? "Pilih video" : "Tidak ada video yang bisa dikirim"}</option>
                {choices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
              <input value={dosage} onChange={(e) => setDosage(e.target.value)} maxLength={150} placeholder="Dosis, mis. 3 set × 10, pagi & sore" className={`${inputClass} sm:col-span-2`} />
              <div className="flex justify-end gap-1.5 sm:col-span-2">
                <button type="button" onClick={() => setAdding(false)} className={btn.secondary}>
                  Batal
                </button>
                <button type="submit" disabled={busy === "send" || !videoId} className={btn.primary}>
                  {busy === "send" ? "Mengirim…" : "Kirim ke pasien"}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {program === null ? (
        !error && <div className="h-16 animate-pulse rounded bg-zinc-100" />
      ) : program.items.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-200 px-3 py-4 text-center text-[12px] text-zinc-500">Belum ada video yang dikirim ke pasien ini.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
          {program.items.map((item) => {
            const done = new Set(item.doneDates);
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <VideoThumb video={item.video} className="w-[72px] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-900">{item.video.title}</p>
                  {item.dosage && <p className="text-[11px] text-zinc-500">{item.dosage}</p>}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-[3px]" aria-label={`${item.doneDates.length} dari 14 hari terakhir`}>
                      {program.days.map((d) => (
                        <span key={d} title={`${dayFmt.format(new Date(`${d}T12:00:00Z`))}${done.has(d) ? " · selesai" : ""}`} className={`h-2.5 w-2.5 rounded-sm ${done.has(d) ? "bg-zinc-900" : "bg-zinc-200"}`} />
                      ))}
                    </div>
                    <span className="text-[11px] tabular-nums text-zinc-500">{item.doneDates.length}/14 hari</span>
                  </div>
                </div>
                <button type="button" onClick={() => stop(item.id)} disabled={busy === item.id} className="rounded px-2 py-1 text-[12px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50">
                  Hentikan
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
