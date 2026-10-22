"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, CaretRight, DownloadSimple } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import type { AdminPatient } from "@/types/api.types";
import { btn, EmptyState, inputClass, MetricStrip, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { formatDate } from "@/lib/format";

export default function AdminPasienPage() {
  const [patients, setPatients] = useState<AdminPatient[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminService
      .getPatients()
      .then((res) => setPatients(res.data.patients))
      .catch((error) => {
        console.error("Gagal memuat data pasien:", error);
        setPatients([]);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!patients || !q) return patients ?? [];
    return patients.filter((p) => [p.fullName, p.patientCode, p.phone, p.email].some((v) => v?.toLowerCase().includes(q)));
  }, [patients, query]);

  const loading = patients === null;
  const list = patients ?? [];

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ["Kode", "Nama", "Telepon", "Email", "Total booking", "Sesi selesai", "Kunjungan terakhir"];
    const rows = filtered.map((p) => [p.patientCode, `"${p.fullName}"`, `"${p.phone}"`, p.email, p.totalBookings, p.totalSessions, p.lastVisitDate?.slice(0, 10) ?? "-"]);
    const csv = "﻿" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pasien-haiphysio.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Pasien" description="Data pasien terdaftar dan riwayat kunjungannya." />

      <MetricStrip
        loading={loading}
        items={[
          { label: "Pasien terdaftar", value: list.length },
          { label: "Pernah booking", value: list.filter((p) => p.totalBookings > 0).length },
          { label: "Sesi selesai", value: list.reduce((sum, p) => sum + p.totalSessions, 0) },
          { label: "Belum pernah booking", value: list.filter((p) => p.totalBookings === 0).length },
        ]}
      />

      <Panel>
        <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Cari pasien</span>
            <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, kode, telepon, atau email" className={`${inputClass} pl-8`} />
          </label>
          <button onClick={exportCsv} className={btn.secondary} disabled={filtered.length === 0}>
            <DownloadSimple size={14} />
            Ekspor CSV
          </button>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={query ? "Tidak ada pasien yang cocok" : "Belum ada pasien terdaftar"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Pasien</th>
                  <th className="px-4 py-2 font-medium">Kontak</th>
                  <th className="px-4 py-2 font-medium">Kunjungan terakhir</th>
                  <th className="px-4 py-2 text-right font-medium">Booking</th>
                  <th className="px-4 py-2 text-right font-medium">Sesi selesai</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/pasien/detail?id=${p.id}`} className="font-medium text-zinc-900 hover:underline">
                        {p.fullName}
                      </Link>
                      <div className="text-[11px] text-zinc-400">{p.patientCode}</div>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">
                      <div>{p.phone}</div>
                      <div className="text-[11px] text-zinc-400">{p.email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600">{p.lastVisitDate ? formatDate(p.lastVisitDate) : "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700">{p.totalBookings}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700">{p.totalSessions}</td>
                    <td className="pr-3 text-right">
                      <Link href={`/admin/pasien/detail?id=${p.id}`} aria-label={`Detail ${p.fullName}`} className="inline-flex p-1 text-zinc-300 group-hover:text-zinc-600">
                        <CaretRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
