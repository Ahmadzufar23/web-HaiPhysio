"use client";

import { useState } from "react";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { StaffVideoFolder } from "@/types/api.types";
import { btn, inputClass, Notice } from "@/components/admin/shared/AdminUI";

// Sama dengan parseYoutubeId di backend (validators/videos.validator.ts)
function youtubeIdOf(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www|m)\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/)?.[2] ?? null) : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Video terapi selalu berupa link YouTube, jadi tidak ada file yang tersimpan di server.
export default function AddVideoForm({
  folders,
  defaultFolderId,
  onDone,
  onCancel,
}: {
  folders: StaffVideoFolder[];
  defaultFolderId: string;
  /** Selesai: muat ulang daftar dan tutup form */
  onDone: () => void;
  onCancel: () => void;
}) {
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ytId = youtubeIdOf(youtubeUrl);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) return setError("Judul minimal 3 karakter.");
    if (!ytId) return setError("Link YouTube tidak valid.");

    setBusy(true);
    try {
      await videoService.createVideo({ folder_id: folderId, title: title.trim(), description: description.trim() || undefined, youtube_url: youtubeUrl });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal menyimpan video."));
      setBusy(false);
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
          <span className="text-[12px] font-medium text-zinc-700">Kategori</span>
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
          Deskripsi <span className="font-normal text-zinc-400">· opsional</span>
        </span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} placeholder="Posisi awal, hal yang perlu diperhatikan, kapan berhenti" className={`${inputClass} h-auto py-2`} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-zinc-700">Link YouTube</span>
        <div className="flex items-start gap-3">
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtu.be/…" className={`${inputClass} flex-1`} />
          {ytId && (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau thumbnail YouTube
            <img src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`} alt="" className="h-[52px] w-[92px] shrink-0 rounded object-cover" />
          )}
        </div>
        <span className="text-[11px] text-zinc-400">Gunakan video unlisted milik klinik supaya tidak bisa dicari orang lain di YouTube. Jangan menampilkan pasien di video.</span>
      </label>

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
