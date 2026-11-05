"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type ClinicSettlement, type ClinicSettlements } from "@/services/superAdminService";
import { btn, EmptyState, inputClass, MetricStrip, Notice, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

const MIN_VOID_REASON_LENGTH = 3;

const todayInJakarta = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

type Props = { clinicId: string };

export default function SettlementPanel({ clinicId }: Props) {
  const [data, setData] = useState<ClinicSettlements | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferredOn, setTransferredOn] = useState(todayInJakarta);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const load = useCallback(async () => {
    const res = await superAdminService.getSettlements(clinicId);
    setData(res.data);
  }, [clinicId]);

  useEffect(() => {
    let isCancelled = false;
    superAdminService
      .getSettlements(clinicId)
      .then((res) => {
        if (!isCancelled) setData(res.data);
      })
      .catch((err) => {
        if (!isCancelled) setError(getApiErrorMessage(err, "Data setoran gagal dimuat."));
      });
    return () => {
      isCancelled = true;
    };
  }, [clinicId]);

  const run = async (action: () => Promise<unknown>, doneMessage: string, onDone: () => void) => {
    setIsBusy(true);
    setError("");
    setInfo("");
    try {
      await action();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIsBusy(false);
      return;
    }

    // Aksi sudah tersimpan: form dikosongkan lebih dulu supaya gagal muat ulang tidak memicu setoran dobel
    onDone();
    setInfo(doneMessage);
    try {
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Tersimpan, tapi data gagal dimuat ulang. Muat ulang halaman sebelum mencatat lagi."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRecord = (event: React.FormEvent) => {
    event.preventDefault();
    void run(
      () => superAdminService.recordSettlement(clinicId, { amount: Number(amount), transferred_on: transferredOn, reference: reference.trim() || undefined, note: note.trim() || undefined }),
      "Setoran dicatat.",
      () => {
        setAmount("");
        setReference("");
        setNote("");
      }
    );
  };

  const handleVoid = (settlement: ClinicSettlement) => {
    void run(() => superAdminService.voidSettlement(settlement.id, voidReason.trim()), "Setoran dibatalkan.", () => {
      setVoidingId(null);
      setVoidReason("");
    });
  };

  if (!data) {
    return error ? <Notice tone="error">{error}</Notice> : <p className="text-[13px] text-zinc-500">Memuat…</p>;
  }

  const { summary, settlements } = data;
  const isAmountValid = Number(amount) > 0 && Number(amount) <= summary.outstanding;

  return (
    <>
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}

      <MetricStrip
        items={[
          { label: "Hak klinik dari Xendit", value: formatRupiah(summary.totalOwed), hint: "Omzet Xendit dikurangi komisi, semua periode" },
          { label: "Sudah disetor", value: formatRupiah(summary.totalSettled) },
          { label: "Belum disetor", value: formatRupiah(summary.outstanding), hint: summary.outstanding < 0 ? "Klinik kelebihan terima" : undefined },
        ]}
      />

      <Panel title="Catat setoran" description="Catat setelah uang benar-benar ditransfer ke rekening klinik." bodyClassName="p-4">
        <form onSubmit={handleRecord} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1 text-[12px] text-zinc-600">
            Nominal (Rp)
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-600">
            Tanggal transfer
            <input type="date" value={transferredOn} max={todayInJakarta()} onChange={(e) => setTransferredOn(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-600">
            No. referensi (opsional)
            <input value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-600">
            Catatan (opsional)
            <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </label>
          <div className="flex items-end">
            <button type="submit" className={`${btn.secondary} w-full`} disabled={isBusy || !isAmountValid || !transferredOn}>
              Simpan setoran
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Riwayat setoran" description="Setoran yang salah dibatalkan dengan alasan, catatannya tetap tersimpan.">
        {settlements.length === 0 ? (
          <EmptyState title="Belum ada setoran" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Tanggal transfer</th>
                  <th className="px-4 py-2 text-right font-medium">Nominal</th>
                  <th className="px-4 py-2 font-medium">Referensi</th>
                  <th className="px-4 py-2 font-medium">Catatan</th>
                  <th className="px-4 py-2 font-medium">Dicatat oleh</th>
                  <th className="px-4 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b border-zinc-100 align-top last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-zinc-600">{settlement.transferredOn}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${settlement.voidedAt ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{formatRupiah(settlement.amount)}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{settlement.reference ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{settlement.note ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{settlement.recordedByName}</td>
                    <td className="px-4 py-2.5 text-right">
                      {settlement.voidedAt ? (
                        <span className="text-[12px] text-zinc-500">
                          Dibatalkan {settlement.voidedByName}: {settlement.voidReason}
                        </span>
                      ) : voidingId === settlement.id ? (
                        <span className="flex items-center justify-end gap-2">
                          <input value={voidReason} maxLength={300} onChange={(e) => setVoidReason(e.target.value)} placeholder="Alasan" aria-label="Alasan membatalkan setoran" className={`${inputClass} w-[180px]`} />
                          <button type="button" className={btn.danger} disabled={isBusy || voidReason.trim().length < MIN_VOID_REASON_LENGTH} onClick={() => handleVoid(settlement)}>
                            Batalkan
                          </button>
                          <button type="button" className="text-[12px] text-zinc-600 hover:underline" onClick={() => setVoidingId(null)}>
                            Tutup
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-[12px] text-red-700 hover:underline disabled:opacity-50"
                          disabled={isBusy}
                          onClick={() => {
                            setVoidingId(settlement.id);
                            setVoidReason("");
                          }}
                        >
                          Batalkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
