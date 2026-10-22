"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clinicService } from "@/services/clinicService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { TherapyPackage } from "@/types/api.types";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { btn, inputClass, PageHeader, Panel } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

// "250.000" / "Rp 250000" → 250000; kosong → null (harga belum ditentukan)
const parsePrice = (raw: string): number | null | "invalid" => {
  const digits = raw.replace(/[^\d]/g, "");
  if (!raw.trim()) return null;
  if (!digits) return "invalid";
  return Number(digits);
};

const toInput = (price: number | null) => (price === null ? "" : new Intl.NumberFormat("id-ID").format(price));

function PackageRow({ pkg, onSaved }: { pkg: TherapyPackage; onSaved: (p: TherapyPackage) => void }) {
  const [value, setValue] = useState(toInput(pkg.pricePerSession));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const parsed = parsePrice(value);
  const dirty = parsed !== "invalid" && parsed !== pkg.pricePerSession;

  const save = async (data: { price_per_session?: number | null; is_active?: boolean }) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await clinicService.updatePackage(pkg.id, data);
      onSaved(res.data.package);
      setValue(toInput(res.data.package.pricePerSession));
      setMessage({ ok: true, text: "Tersimpan" });
    } catch (error) {
      setMessage({ ok: false, text: getApiErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const total = pkg.totalSessions && typeof parsed === "number" ? parsed * pkg.totalSessions : null;

  return (
    <tr className="border-b border-surface-2 align-top last:border-0">
      <td className="px-5 py-4">
        <p className={`font-medium ${pkg.isActive ? "text-brand-900" : "text-brand-900/45"}`}>{pkg.name}</p>
        <p className="mt-0.5 text-[12px] text-brand-900/50">
          {pkg.isHomeVisit ? "Kunjungan ke rumah pasien" : `${pkg.totalSessions} sesi`}
          {!pkg.isActive && " · tidak ditawarkan"}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="relative max-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-brand-900/45">Rp</span>
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setMessage(null);
            }}
            onBlur={() => typeof parsed === "number" && setValue(toInput(parsed))}
            placeholder="Belum diatur"
            aria-label={`Harga per sesi ${pkg.name}`}
            className={`${inputClass} pl-9 tabular-nums`}
          />
        </div>
        {parsed === "invalid" && <p className="mt-1 text-[12px] text-red-700">Isi dengan angka</p>}
        {pkg.isHomeVisit && <p className="mt-1 max-w-[260px] text-[12px] text-brand-900/50">Harga homecare bisa berbeda tergantung jarak. Boleh dikosongkan dulu.</p>}
      </td>
      <td className="px-5 py-4 text-right tabular-nums text-brand-900/70">{total !== null ? formatRupiah(total) : "—"}</td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {message && <span className={`text-[12px] ${message.ok ? "text-zinc-500" : "text-red-700"}`}>{message.text}</span>}
          <button className={btn.secondary} disabled={saving} onClick={() => save({ is_active: !pkg.isActive })}>
            {pkg.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button className={btn.primary} disabled={!dirty || saving} onClick={() => save({ price_per_session: parsed as number | null })}>
            Simpan
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PackagesPage() {
  const user = useStaffUser();
  const router = useRouter();
  const [packages, setPackages] = useState<TherapyPackage[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "owner") {
      router.replace("/admin");
      return;
    }
    clinicService
      .getAdminPackages()
      .then((res) => setPackages(res.data.packages))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, [user.role, router]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paket Terapi"
        description="Harga per sesi dicatat sebagai pendapatan setiap kali sesi diselesaikan. Mengubah harga tidak memengaruhi booking yang sudah dibuat."
      />
      <Panel>
        {error ? (
          <p className="px-5 py-6 text-[13px] text-red-700">{error}</p>
        ) : !packages ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-surface" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-surface-2 text-[12px] text-brand-900/55">
                  <th className="px-5 py-2.5 font-medium">Paket</th>
                  <th className="px-5 py-2.5 font-medium">Harga per sesi</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total paket</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <PackageRow key={p.id} pkg={p} onSaved={(saved) => setPackages((list) => list?.map((x) => (x.id === saved.id ? saved : x)) ?? null)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
