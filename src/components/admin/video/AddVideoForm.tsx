"use client";

import { useState } from "react";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { StaffVideoFolder } from "@/types/api.types";
import { formatDuration } from "@/components/video/VideoPlayer";
import { btn, inputClass, Notice } from "@/components/admin/shared/AdminUI";

// Deploy (Supabase Storage free) dibatasi 50 MB per file; lokal 300 MB
const MAX_MB = Number(process.env.NEXT_PUBLIC_VIDEO_MAX_MB) || 300;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ACCEPT = ["video/mp4", "video/webm"];

// Sama dengan parseYoutubeId di backend (validators/videos.validator.ts)
export function youtubeIdOf(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www|m)\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/)?.[2] ?? null) : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

type VideoMeta = { duration?: number; poster?: string };

/**
 * Dibaca di browser sebelum diunggah: durasi (syarat check-in di backend) dan
 * satu frame sebagai sampul JPEG 480×270.
 */
function readVideoMeta(file: File) {
  return new Promise<VideoMeta>((resolve) => {
    const el = document.createElement("video");
    const url = URL.createObjectURL(file);
    el.preload = "auto";
    el.muted = true;
    let duration: number | undefined;
    let settled = false;
    const done = (poster?: string) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve({ duration, poster });
    };
    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 270;
        const ctx = canvas.getContext("2d")!;
        // Potong tengah supaya rasio 16:9
        const scale = Math.max(480 / el.videoWidth, 270 / el.videoHeight);
        const w = el.videoWidth * scale;
        const h = el.videoHeight * scale;
        ctx.drawImage(el, (480 - w) / 2, (270 - h) / 2, w, h);
        done(canvas.toDataURL("image/jpeg", 0.72));
      } catch {
        done();
      }
    };
    const seekForPoster = () => {
      if (Number.isFinite(el.duration)) duration = Math.round(el.duration);
      el.onseeked = capture;
      el.currentTime = Math.min(1, (duration ?? 2) * 0.1);
    };
    el.onloadedmetadata = () => {
      if (Number.isFinite(el.duration)) return seekForPoster();
      // WebM hasil rekaman sering tanpa durasi: lompat ke ujung supaya browser menghitungnya
      el.ondurationchange = () => {
        if (!Number.isFinite(el.duration)) return;
        el.ondurationchange = null;
        seekForPoster();
      };
      el.currentTime = 1e7;
    };
    el.onerror = () => done();
    setTimeout(() => done(), 6000);
    el.src = url;
  });
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function AddVideoForm({
  folders,
  defaultFolderId,
  onDone,
  onRefresh,
  onCancel,
}: {
  folders: StaffVideoFolder[];
  defaultFolderId: string;
  /** Selesai: muat ulang daftar dan tutup form */
  onDone: () => void;
  /** Muat ulang daftar tanpa menutup form (mis. unggahan gagal setelah video tercatat) */
  onRefresh: () => void;
  onCancel: () => void;
}) {
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<({ file: File } & VideoMeta) | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const ytId = youtubeIdOf(youtubeUrl);
  const busy = progress !== null;

  const pickFile = async (f: File | undefined) => {
    setError("");
    if (!f) return setFile(null);
    if (!ACCEPT.includes(f.type)) return setError("Format video harus MP4 atau WebM.");
    if (f.size > MAX_BYTES) return setError(`Ukuran video maksimal ${MAX_MB} MB.`);
    setFile({ file: f, ...(await readVideoMeta(f)) });
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) return setError("Judul minimal 3 karakter.");
    if (source === "youtube" && !ytId) return setError("Link YouTube tidak valid.");
    if (source === "upload" && !file) return setError("Pilih file video dulu.");

    setProgress(0);
    let videoId = createdId;
    try {
      if (!videoId) {
        const base = { folder_id: folderId, title: title.trim(), description: description.trim() || undefined };
        const res = await videoService.createVideo(source === "youtube" ? { ...base, source, youtube_url: youtubeUrl } : { ...base, source, duration_seconds: file!.duration, poster: file!.poster });
        videoId = res.data.video.id;
      }
      if (source === "upload") {
        // Data video sudah tercatat; bila unggahan gagal, kirim ulang hanya mengulang unggahan
        setCreatedId(videoId);
        await videoService.uploadVideoFile(videoId, file!.file, setProgress);
      }
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal menyimpan video."));
      setProgress(null);
      if (videoId) onRefresh();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 border-b border-zinc-200 bg-zinc-50/60 p-4">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-zinc-700">Judul</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder="Mis. Quad set setelah rekonstruksi ACL" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-zinc-700">Folder</span>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className={inputClass}>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-zinc-700">
          Petunjuk <span className="font-normal text-zinc-400">· opsional</span>
        </span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} placeholder="Posisi awal, hal yang perlu diperhatikan, kapan berhenti" className={`${inputClass} h-auto py-2`} />
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex w-fit rounded-md border border-zinc-200 bg-white p-0.5" role="tablist" aria-label="Sumber video">
          {(
            [
              ["upload", "Upload file"],
              ["youtube", "Link YouTube"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={source === key}
              onClick={() => setSource(key)}
              className={`h-7 rounded px-3 text-[12px] ${source === key ? "bg-zinc-900 font-medium text-white" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {source === "upload" ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 bg-white px-4 py-5 text-center hover:border-zinc-400">
            <input type="file" accept={ACCEPT.join(",")} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} disabled={busy} />
            {file ? (
              <>
                {file.poster && (
                  // eslint-disable-next-line @next/next/no-img-element -- frame sampul dari file lokal
                  <img src={file.poster} alt="" className="mb-1.5 h-[68px] w-[120px] rounded object-cover" />
                )}
                <span className="text-[13px] font-medium text-zinc-900">{file.file.name}</span>
                <span className="text-[11px] text-zinc-500">
                  {mb(file.file.size)}
                  {file.duration ? ` · ${formatDuration(file.duration)}` : ""} · klik untuk ganti
                </span>
              </>
            ) : (
              <>
                <span className="text-[13px] font-medium text-zinc-700">Pilih file video</span>
                <span className="text-[11px] text-zinc-400">MP4 atau WebM, maksimal {MAX_MB} MB</span>
              </>
            )}
          </label>
        ) : (
          <div className="flex items-start gap-3">
            <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/…" className={`${inputClass} flex-1`} />
            {ytId && (
              // eslint-disable-next-line @next/next/no-img-element -- pratinjau thumbnail YouTube
              <img src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`} alt="" className="h-[52px] w-[92px] shrink-0 rounded object-cover" />
            )}
          </div>
        )}
        {source === "youtube" && <p className="text-[11px] text-zinc-400">Gunakan video unlisted milik klinik supaya tidak bisa dicari orang lain di YouTube.</p>}
      </div>

      {progress !== null && source === "upload" && (
        <div>
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>Mengunggah…</span>
            <span className="tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full bg-zinc-900 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className={btn.secondary}>
          Batal
        </button>
        <button type="submit" disabled={busy} className={btn.primary}>
          {busy ? "Menyimpan…" : "Simpan video"}
        </button>
      </div>
    </form>
  );
}
