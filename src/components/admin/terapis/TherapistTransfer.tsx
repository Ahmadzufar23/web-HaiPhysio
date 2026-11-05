"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { ownerClinicService } from "@/services/ownerClinicService";
import { useClinic } from "@/components/shared/ClinicProvider";

// Mutasi terapis ke cabang lain. Riwayat dan absensi di cabang ini tetap tersimpan.
export default function TherapistTransfer({ therapistId, therapistName, onDone, onError }: { therapistId: string; therapistName: string; onDone: (message: string) => void; onError: (message: string) => void }) {
  const clinic = useClinic();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const others = clinic.branches.filter((branch) => branch.slug !== clinic.slug);
  if (others.length === 0) return null;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await ownerClinicService.transferTherapist(therapistId, target);
      onDone(`${therapistName} dimutasi ke ${res.data.clinic.brand}. Terapis perlu login ulang.`);
    } catch (err) {
      onError(getApiErrorMessage(err, "Mutasi gagal."));
    } finally {
      setBusy(false);
      setOpen(false);
      setTarget("");
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100">
        Mutasi
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label={`Cabang tujuan untuk ${therapistName}`} className="rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-[12px]">
        <option value="">Pilih cabang</option>
        {others.map((branch) => (
          <option key={branch.slug} value={branch.slug}>
            {branch.branchName || branch.brand}
          </option>
        ))}
      </select>
      <button type="button" disabled={!target || busy} onClick={submit} className="rounded px-2 py-1 text-[12px] font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50">
        Pindahkan
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded px-2 py-1 text-[12px] text-zinc-500 hover:bg-zinc-100">
        Batal
      </button>
    </span>
  );
}
