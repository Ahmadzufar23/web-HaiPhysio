"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { btn } from "@/components/admin/shared/AdminUI";
import { runDownload } from "./useFinanceData";

/** Tombol "Unduh Excel" dengan status memuat dan pesan gagal */
export default function DownloadButton({ label = "Unduh Excel", onDownload, disabled }: { label?: string; onDownload: () => Promise<void>; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setBusy(true);
    setError(await runDownload(onDownload));
    setBusy(false);
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      {error && <span className="text-[12px] text-red-700">{error}</span>}
      <button type="button" onClick={handleClick} disabled={busy || disabled} className={btn.secondary}>
        <DownloadSimple size={14} />
        {busy ? "Menyiapkan…" : label}
      </button>
    </div>
  );
}
