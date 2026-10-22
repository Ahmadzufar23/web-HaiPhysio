"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { AdminBooking } from "@/types/api.types";
import { btn, EmptyState, inputClass, StatusBadge } from "@/components/admin/shared/AdminUI";
import { formatDate, formatSlotTime } from "@/lib/format";
import { genderLabel } from "@/constants/patient";

interface BookingTableProps {
  bookings: AdminBooking[];
  isLoading: boolean;
  onRefresh: () => void;
}

const PAGE_SIZE = 12;

export default function BookingTable({ bookings, isLoading, onRefresh }: BookingTableProps) {
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = bookings.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setBusy(true);
    setError("");
    try {
      await adminService.cancelBooking(cancelTarget.id, reason);
      setCancelTarget(null);
      onRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return <EmptyState title="Tidak ada booking" description="Coba ubah tanggal atau filter status." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-surface-2 text-[12px] text-brand-900/55">
              <th className="px-5 py-2.5 font-medium">Jadwal</th>
              <th className="px-5 py-2.5 font-medium">Pasien</th>
              <th className="px-5 py-2.5 font-medium">Jenis kelamin</th>
              <th className="px-5 py-2.5 font-medium">Paket</th>
              <th className="px-5 py-2.5 font-medium">Terapis</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-surface-2 last:border-0 hover:bg-surface/60">
                <td className="px-5 py-3">
                  <div className="tabular-nums text-brand-900">{formatSlotTime(b.bookingTime)}</div>
                  <div className="text-[12px] text-brand-900/50">{formatDate(b.bookingDate)}</div>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/admin/sesi/${b.id}`} className="font-medium text-brand-900 hover:underline">
                    {b.patientName}
                  </Link>
                  <div className="text-[12px] text-brand-900/50">
                    {b.referenceCode} · {b.patientPhone}
                    {b.source === "walk_in" && <span className="ml-1.5 rounded border border-zinc-200 px-1 text-[11px] text-zinc-600">Datang langsung</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-brand-900/70">{genderLabel(b.patientGender) ?? "—"}</td>
                <td className="px-5 py-3 text-brand-900/70">{b.packageName ?? "—"}</td>
                <td className="px-5 py-3 text-brand-900/70">{b.therapistName}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={b.bookingStatus} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {b.bookingStatus === "Terkonfirmasi" && (
                      <>
                        <Link href={`/admin/booking/reschedule?id=${b.id}`} className="rounded-md px-2 py-1 text-[13px] text-brand-900/70 hover:bg-surface hover:text-brand-900">
                          Jadwal ulang
                        </Link>
                        <button
                          onClick={() => {
                            setCancelTarget(b);
                            setReason("");
                            setError("");
                          }}
                          className="rounded-md px-2 py-1 text-[13px] text-red-700 hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                    <Link href={`/admin/sesi/${b.id}`} className="inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[13px] font-medium text-brand-900 hover:bg-surface">
                      Buka
                      <CaretRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-2 px-5 py-3 text-[13px] text-brand-900/60">
          <span>
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, bookings.length)} dari {bookings.length}
          </span>
          <div className="flex gap-2">
            <button className={btn.secondary} disabled={current === 1} onClick={() => setPage(current - 1)}>
              Sebelumnya
            </button>
            <button className={btn.secondary} disabled={current === totalPages} onClick={() => setPage(current + 1)}>
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-[420px] rounded-xl bg-white p-6">
            <h3 id="cancel-title" className="text-[14px] font-semibold text-brand-900">
              Batalkan booking?
            </h3>
            <p className="mt-1 text-[13px] text-brand-900/65">
              {cancelTarget.patientName}, {formatDate(cancelTarget.bookingDate)} pukul {formatSlotTime(cancelTarget.bookingTime)}. Slot akan dibuka lagi untuk pasien lain.
            </p>
            <label className="mt-4 block text-[13px] font-medium text-brand-900">
              Alasan pembatalan
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={`${inputClass} mt-1.5 resize-none`} placeholder="Mis. pasien minta dibatalkan lewat WhatsApp" />
            </label>
            {error && <p className="mt-2 text-[13px] text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button className={btn.secondary} onClick={() => setCancelTarget(null)} disabled={busy}>
                Kembali
              </button>
              <button className={btn.danger} onClick={confirmCancel} disabled={busy || !reason.trim()}>
                {busy ? "Membatalkan…" : "Ya, batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
