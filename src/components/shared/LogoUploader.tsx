"use client";

import { useRef, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { btn, Notice } from "@/components/admin/shared/AdminUI";
import { clinicAssetUrl } from "@/constants/clinic";

const MAX_SIDE_PX = 512;
const MAX_BYTES = 200 * 1024;
const WEBP_QUALITY = 0.85;

// Diperkecil di browser supaya foto logo besar tetap muat di batas 200 KB
async function fileToLogoDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const png = canvas.toDataURL("image/png");
  const pngBytes = (png.length * 3) / 4;
  return pngBytes <= MAX_BYTES ? png : canvas.toDataURL("image/webp", WEBP_QUALITY);
}

export default function LogoUploader({ logoUrl, onUpload }: { logoUrl: string | null; onUpload: (dataUrl: string) => Promise<unknown> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shown = clinicAssetUrl(logoUrl);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await onUpload(await fileToLogoDataUrl(file));
    } catch (err) {
      setError(getApiErrorMessage(err, "Logo gagal diunggah."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-32 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau logo unggahan
            <img src={shown} alt="Logo klinik" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-[12px] text-zinc-400">Belum ada logo</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" aria-label="Pilih file logo" />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={btn.secondary}>
            {busy ? "Mengunggah…" : shown ? "Ganti logo" : "Unggah logo"}
          </button>
          <span className="text-[11px] text-zinc-400">PNG, JPG, atau WebP. Berlaku untuk semua cabang.</span>
        </div>
      </div>
    </div>
  );
}
