"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { AdminTherapist } from "@/types/api.types";
import { btn, EmptyState, inputClass, MetricStrip, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${active ? "text-zinc-900" : "text-zinc-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-zinc-900" : "border border-zinc-400"}`} aria-hidden />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function AdminTerapisPage() {
  const [therapists, setTherapists] = useState<AdminTherapist[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | "aktif" | "nonaktif">("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    adminService
      .getTherapists()
      .then((res) => setTherapists(res.data.therapists))
      .catch((err) => {
        setError(getApiErrorMessage(err));
        setTherapists([]);
      });

  useEffect(() => {
    void load();
  }, []);

  const list = useMemo(() => therapists ?? [], [therapists]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (t) =>
        (!status || t.status === status) &&
        (!q || [t.fullName, t.sip, t.email, t.phone, ...t.specializations.map((s) => s.name)].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [list, query, status]);

  const toggleStatus = async (t: AdminTherapist) => {
    setBusyId(t.id);
    setError("");
    try {
      await adminService.updateTherapist(t.id, { status: t.status === "aktif" ? "nonaktif" : "aktif" });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Terapis"
        description="Profil, spesialisasi, dan akun login terapis."
        actions={
          <Link href="/admin/terapis/tambah" className={btn.primary}>
            <Plus size={12} />
            Tambah terapis
          </Link>
        }
      />

      <MetricStrip
        loading={therapists === null}
        items={[
          { label: "Total terapis", value: list.length },
          { label: "Aktif", value: list.filter((t) => t.status === "aktif").length },
          { label: "Nonaktif", value: list.filter((t) => t.status === "nonaktif").length },
          { label: "Belum punya akun", value: list.filter((t) => !t.account).length, hint: "Belum bisa login" },
        ]}
      />

      {error && <Notice tone="error">{error}</Notice>}

      <Panel>
        <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari terapis</span>
            <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, SIP, spesialisasi, atau kontak" className={`${inputClass} pl-8`} />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={`${inputClass} sm:w-[150px]`} aria-label="Status">
            <option value="">Semua status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {therapists === null ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={query || status ? "Tidak ada terapis yang cocok" : "Belum ada terapis"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Terapis</th>
                  <th className="px-4 py-2 font-medium">Spesialisasi</th>
                  <th className="px-4 py-2 font-medium">Kontak</th>
                  <th className="px-4 py-2 font-medium">Akun login</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/terapis/edit?id=${t.id}`} className="font-medium text-zinc-900 hover:underline">
                        {t.fullName}
                      </Link>
                      <div className="text-[11px] text-zinc-400">{t.sip ? `SIP ${t.sip}` : "SIP belum diisi"}</div>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{t.specializations.map((s) => s.name).join(", ") || "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">
                      <div>{t.phone ?? "—"}</div>
                      {t.email && <div className="text-[11px] text-zinc-400">{t.email}</div>}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.account ? (
                        <span className="text-zinc-700">
                          {t.account.email}
                          {t.account.isOwner && <span className="ml-1.5 rounded border border-zinc-200 px-1 py-px text-[10px] font-medium text-zinc-500">Owner</span>}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Belum ada</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <ActiveBadge active={t.status === "aktif"} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/terapis/edit?id=${t.id}`} className="rounded px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100">
                          Kelola
                        </Link>
                        {!t.account?.isOwner && (
                          <button
                            onClick={() => toggleStatus(t)}
                            disabled={busyId === t.id}
                            className={`rounded px-2 py-1 text-[12px] disabled:opacity-50 ${t.status === "aktif" ? "text-red-700 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-100"}`}
                          >
                            {t.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="text-[12px] text-zinc-400">Terapis yang punya riwayat sesi tidak dihapus, cukup dinonaktifkan supaya rekam medis dan laporan tetap utuh.</p>
    </div>
  );
}
