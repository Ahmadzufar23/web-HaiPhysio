"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { StaffVideoFolder } from "@/types/api.types";
import { btn, EmptyState, inputClass, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import AddVideoForm from "@/components/admin/video/AddVideoForm";
import { VideoThumb } from "@/components/video/VideoUI";
import { formatDuration } from "@/components/video/VideoPlayer";

type FolderForm = { mode: "new" } | { mode: "edit"; id: string };

export default function AdminVideoPage() {
  const [folders, setFolders] = useState<StaffVideoFolder[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [folderForm, setFolderForm] = useState<FolderForm | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const [reuploadId, setReuploadId] = useState<string | null>(null);
  const [reuploadProgress, setReuploadProgress] = useState<number | null>(null);

  const load = () =>
    videoService
      .getLibrary()
      .then((res) => setFolders(res.data.folders))
      .catch((err) => {
        setError(getApiErrorMessage(err));
        setFolders([]);
      });

  useEffect(() => {
    void load();
  }, []);

  const list = folders ?? [];
  const selected = list.find((f) => f.id === selectedId) ?? list[0] ?? null;

  const run = async (id: string, action: () => Promise<unknown>, okMessage?: string) => {
    setBusyId(id);
    setError("");
    setInfo("");
    try {
      await action();
      if (okMessage) setInfo(okMessage);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openFolderForm = (form: FolderForm) => {
    setFolderForm(form);
    const f = form.mode === "edit" ? list.find((x) => x.id === form.id) : null;
    setFolderName(f?.name ?? "");
    setFolderDesc(f?.description ?? "");
  };

  const saveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm) return;
    await run("folder", async () => {
      const data = { name: folderName.trim(), description: folderDesc.trim() };
      const res = folderForm.mode === "new" ? await videoService.createFolder(data) : await videoService.updateFolder(folderForm.id, data);
      setSelectedId(res.data.folder.id);
      setFolderForm(null);
    });
  };

  const removeVideo = (id: string, title: string) =>
    run(id, async () => {
      const res = await videoService.deleteVideo(id);
      setInfo(res.data.deactivated ? `"${title}" pernah dikirim ke pasien, jadi hanya dinonaktifkan.` : `"${title}" dihapus.`);
    });

  const reupload = async (file: File | undefined) => {
    const id = reuploadId;
    if (!file || !id) return;
    setReuploadProgress(0);
    await run(id, () => videoService.uploadVideoFile(id, file, setReuploadProgress), "File video berhasil diunggah.");
    setReuploadProgress(null);
    setReuploadId(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Video terapi"
        description="Folder video latihan yang bisa dijelajah pasien. Kirim video ke pasien dari Detail Sesi atau Detail Pasien."
        actions={
          <>
            <button type="button" onClick={() => openFolderForm({ mode: "new" })} className={btn.secondary}>
              Folder baru
            </button>
            <button type="button" onClick={() => setAdding(true)} disabled={!selected} className={btn.primary}>
              <Plus size={12} />
              Tambah video
            </button>
          </>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}

      <div className="grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Panel title="Folder" bodyClassName="p-1.5">
          {folders === null ? (
            <div className="space-y-1.5 p-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-zinc-100" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col">
              {list.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(f.id);
                      setAdding(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] ${
                      selected?.id === f.id ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">{f.videos.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {folderForm && (
            <form onSubmit={saveFolder} className="mt-1.5 flex flex-col gap-2 border-t border-zinc-100 p-1.5 pt-3">
              <input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nama folder, mis. ACL" maxLength={80} autoFocus className={inputClass} />
              <input value={folderDesc} onChange={(e) => setFolderDesc(e.target.value)} placeholder="Deskripsi singkat (opsional)" maxLength={300} className={inputClass} />
              <div className="flex justify-end gap-1.5">
                <button type="button" onClick={() => setFolderForm(null)} className={btn.secondary}>
                  Batal
                </button>
                <button type="submit" disabled={busyId === "folder" || folderName.trim().length < 2} className={btn.primary}>
                  {folderForm.mode === "new" ? "Buat" : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </Panel>

        <Panel
          title={selected?.name ?? "Video"}
          description={selected?.description ?? undefined}
          actions={
            selected && (
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openFolderForm({ mode: "edit", id: selected.id })} className="rounded px-2 py-1 text-[12px] text-zinc-600 hover:bg-zinc-100">
                  Ubah folder
                </button>
                <button
                  type="button"
                  onClick={() => run(selected.id, () => videoService.deleteFolder(selected.id), `Folder "${selected.name}" dihapus.`)}
                  disabled={busyId === selected.id}
                  className="rounded px-2 py-1 text-[12px] text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Hapus folder
                </button>
              </div>
            )
          }
        >
          {adding && selected && (
            <AddVideoForm
              folders={list}
              defaultFolderId={selected.id}
              onDone={() => {
                setAdding(false);
                setInfo("Video disimpan.");
                void load();
              }}
              onRefresh={() => void load()}
              onCancel={() => setAdding(false)}
            />
          )}

          {!selected ? (
            <EmptyState title="Belum ada folder" description="Buat folder dulu, mis. ACL atau Nyeri punggung bawah." />
          ) : selected.videos.length === 0 ? (
            !adding && <EmptyState title="Folder ini masih kosong" description="Tambah video dengan upload file atau link YouTube." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[13px]">
                <thead>
                  <tr className={tableHead}>
                    <th className="px-4 py-2 font-medium">Video</th>
                    <th className="px-4 py-2 font-medium">Sumber</th>
                    <th className="px-4 py-2 font-medium">Durasi</th>
                    <th className="px-4 py-2 font-medium">Pasien aktif</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.videos.map((v) => (
                    <tr key={v.id} className={`border-b border-zinc-100 last:border-0 ${v.isActive ? "" : "text-zinc-400"}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <VideoThumb video={v} className="w-[88px] shrink-0" />
                          <div className="min-w-0">
                            <p className={`line-clamp-1 font-medium ${v.isActive ? "text-zinc-900" : ""}`}>{v.title}</p>
                            {v.description && <p className="line-clamp-1 text-[11px] text-zinc-400">{v.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600">
                        {v.source === "youtube" ? "YouTube" : "Upload"}
                        {v.fileSize ? <span className="block text-[11px] text-zinc-400">{(v.fileSize / 1024 / 1024).toFixed(1)} MB</span> : null}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-600">{formatDuration(v.durationSeconds) ?? "—"}</td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-600">{v.activePatients}</td>
                      <td className="px-4 py-2.5">
                        {!v.ready ? (
                          <span className="text-[12px] text-zinc-500">{reuploadId === v.id && reuploadProgress !== null ? `Mengunggah ${Math.round(reuploadProgress * 100)}%` : "Belum siap"}</span>
                        ) : v.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-900">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" /> Tampil
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full border border-zinc-400" /> Disembunyikan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          {!v.ready && (
                            <button
                              type="button"
                              onClick={() => {
                                setReuploadId(v.id);
                                uploadRef.current?.click();
                              }}
                              disabled={busyId === v.id}
                              className="rounded px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                            >
                              Unggah file
                            </button>
                          )}
                          {v.ready && (
                            <button
                              type="button"
                              onClick={() => run(v.id, () => videoService.updateVideo(v.id, { is_active: !v.isActive }))}
                              disabled={busyId === v.id}
                              className="rounded px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                            >
                              {v.isActive ? "Sembunyikan" : "Tampilkan"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeVideo(v.id, v.title)}
                            disabled={busyId === v.id}
                            className="rounded px-2 py-1 text-[12px] text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <input ref={uploadRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => {
        void reupload(e.target.files?.[0]);
        e.target.value = "";
      }} />
      <p className="text-[12px] text-zinc-400">Video yang pernah dikirim ke pasien tidak dihapus permanen, hanya disembunyikan dari folder supaya riwayat check-in tetap utuh.</p>
    </div>
  );
}
