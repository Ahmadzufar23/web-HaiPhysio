"use client";

import { setClinicSlug } from "@/app/utils/api";
import { useClinic } from "@/components/shared/ClinicProvider";

// Pilihan cabang untuk klinik yang punya lebih dari satu cabang. Muat ulang penuh supaya
// semua data halaman mengikuti cabang yang dipilih.
export default function BranchSwitcher({ redirectTo, className = "" }: { redirectTo?: string; className?: string }) {
  const clinic = useClinic();
  if (clinic.branches.length < 2) return null;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setClinicSlug(event.target.value);
    if (redirectTo) window.location.href = redirectTo;
    else window.location.reload();
  };

  return (
    <select aria-label="Pilih cabang" value={clinic.slug} onChange={handleChange} className={`rounded-md border border-zinc-200 bg-white px-2 py-1 text-[12px] text-zinc-800 ${className}`}>
      {clinic.branches.map((branch) => (
        <option key={branch.slug} value={branch.slug}>
          {branch.branchName || branch.brand}
        </option>
      ))}
    </select>
  );
}
