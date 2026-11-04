"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type Reminder } from "@/services/superAdminService";
import { btn, EmptyState, Notice, PageHeader, Panel } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";

const REASON_LABEL: Record<Reminder["reason"], string> = { due_in_3_days: "3 hari lagi", due_today: "Jatuh tempo hari ini", overdue: "Telat" };

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    const res = await superAdminService.listReminders();
    setReminders(res.data.reminders);
  }, []);

  useEffect(() => {
    superAdminService
      .listReminders()
      .then((res) => setReminders(res.data.reminders))
      .catch((err) => setError(getApiErrorMessage(err, "Data gagal dimuat.")));
  }, []);

  const handleCopy = async (reminder: Reminder) => {
    setError("");
    try {
      await navigator.clipboard.writeText(reminder.message);
      setInfo(`Pesan untuk ${reminder.brand} disalin.`);
    } catch {
      setError("Browser menolak menyalin. Salin pesannya secara manual.");
    }
  };

  const handleMarkReminded = async (reminder: Reminder) => {
    setError("");
    try {
      await superAdminService.markReminded(reminder.id);
      await load();
      setInfo(`${reminder.brand} ditandai sudah diingatkan.`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader title="Reminder tagihan" description="Invoice yang perlu diingatkan: 3 hari sebelum jatuh tempo, hari jatuh tempo, dan yang sudah telat." />
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}

      <Panel>
        {reminders?.length === 0 && <EmptyState title="Tidak ada yang perlu diingatkan hari ini" />}
        {reminders === null && !error && <p className="px-4 py-6 text-[13px] text-zinc-500">Memuat…</p>}
        <ul className="divide-y divide-zinc-100">
          {reminders?.map((reminder) => (
            <li key={reminder.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[14px] font-medium text-zinc-900">
                  {reminder.brand} · {formatRupiah(reminder.amount)}
                </p>
                <p className={`text-[12px] ${reminder.reason === "overdue" ? "font-medium text-red-700" : "text-zinc-600"}`}>
                  {REASON_LABEL[reminder.reason]} · jatuh tempo {reminder.dueDate}
                </p>
              </div>
              <p className="whitespace-pre-line rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12px] text-zinc-700">{reminder.message}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={btn.secondary} onClick={() => handleCopy(reminder)}>
                  Salin pesan
                </button>
                {reminder.whatsappUrl ? (
                  <a href={reminder.whatsappUrl} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                    Buka WhatsApp
                  </a>
                ) : (
                  <span className="text-[12px] text-zinc-400">Nomor WhatsApp klinik belum diisi</span>
                )}
                <button type="button" className={btn.secondary} onClick={() => handleMarkReminded(reminder)}>
                  Tandai sudah diingatkan
                </button>
                {reminder.remindedAt && (
                  <span className="text-[12px] text-zinc-500">Terakhir diingatkan {new Date(reminder.remindedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
