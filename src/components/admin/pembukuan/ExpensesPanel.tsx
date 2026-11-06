"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { btn, EmptyState, inputClass, Notice, Panel } from "@/components/admin/shared/AdminUI";
import { getApiErrorMessage } from "@/app/utils/api";
import { financeService } from "@/services/financeService";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/finance.types";
import { formatDate, formatRupiah, todayWib } from "@/lib/format";
import { useFinanceData } from "./useFinanceData";

const categoryLabel = (value: string) => EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
const emptyDraft = () => ({ expenseDate: todayWib(), category: "token_listrik" as ExpenseCategory, description: "", amount: "" });

/** Pencatatan pengeluaran klinik oleh owner: token listrik, air, sewa, dll. */
export default function ExpensesPanel({ dateFrom, dateTo, onChanged }: { dateFrom: string; dateTo: string; onChanged: () => void }) {
  const list = useFinanceData(`${dateFrom}|${dateTo}`, async () => (await financeService.getExpenses({ date_from: dateFrom, date_to: dateTo })).data);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const amount = Number(draft.amount);
  const needsDescription = draft.category === "lainnya" && !draft.description.trim();
  const canSave = !saving && Number.isInteger(amount) && amount > 0 && !!draft.expenseDate && !needsDescription;

  const refresh = () => {
    list.reload();
    onChanged();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await financeService.createExpense({ ...draft, amount });
      setDraft({ ...emptyDraft(), expenseDate: draft.expenseDate, category: draft.category });
      setMessage({ tone: "info", text: "Pengeluaran tercatat." });
      refresh();
    } catch (err) {
      setMessage({ tone: "error", text: getApiErrorMessage(err, "Pengeluaran gagal disimpan.") });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await financeService.deleteExpense(id);
      refresh();
    } catch (err) {
      setMessage({ tone: "error", text: getApiErrorMessage(err, "Pengeluaran gagal dihapus.") });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Catat pengeluaran" description="Hanya owner. Salah catat? Hapus lalu catat ulang.">
        <form onSubmit={save} className="grid gap-3 px-4 py-4 sm:grid-cols-[150px_170px_1fr_150px_auto] sm:items-end">
          <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
            Tanggal
            <input type="date" value={draft.expenseDate} max={todayWib()} onChange={(e) => setDraft({ ...draft, expenseDate: e.target.value })} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
            Kategori
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpenseCategory })} className={inputClass}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
            Keterangan{draft.category === "lainnya" ? " (wajib)" : ""}
            <input value={draft.description} maxLength={300} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Mis. token 100 kWh" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-zinc-500">
            Nominal (Rp)
            <input inputMode="numeric" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/\D/g, "") })} className={`${inputClass} tabular-nums`} />
          </label>
          <button type="submit" disabled={!canSave} className={btn.primary}>
            <Plus size={14} />
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </form>
        {message && (
          <div className="px-4 pb-4">
            <Notice tone={message.tone}>{message.text}</Notice>
          </div>
        )}
      </Panel>

      {list.error && <Notice tone="error">{list.error}</Notice>}

      <Panel title="Daftar pengeluaran" description={`Total periode ini ${formatRupiah(list.data?.total ?? 0)}.`}>
        {list.data && list.data.byCategory.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 border-b border-zinc-200 px-4 py-3 text-[12px] text-zinc-600">
            {list.data.byCategory.map((c) => (
              <span key={c.category}>
                {categoryLabel(c.category)} <span className="tabular-nums text-zinc-900">{formatRupiah(c.amount)}</span>
              </span>
            ))}
          </div>
        )}
        {!list.data || list.data.expenses.length === 0 ? (
          <EmptyState title="Belum ada pengeluaran pada periode ini" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                  <th className="px-4 py-2.5 font-medium">Kategori</th>
                  <th className="px-4 py-2.5 font-medium">Keterangan</th>
                  <th className="px-4 py-2.5 text-right font-medium">Nominal</th>
                  <th className="w-[140px] px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {list.data.expenses.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 tabular-nums text-zinc-700">{formatDate(e.expenseDate)}</td>
                    <td className="px-4 py-3 text-zinc-900">{categoryLabel(e.category)}</td>
                    <td className="px-4 py-3 text-zinc-600">{e.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(e.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {confirmDeleteId === e.id ? (
                        <span className="inline-flex gap-1.5">
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className={btn.secondary}>
                            Batal
                          </button>
                          <button type="button" onClick={() => remove(e.id)} className={btn.danger}>
                            Hapus
                          </button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(e.id)} aria-label="Hapus pengeluaran" className={btn.secondary}>
                          <Trash size={13} />
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
    </div>
  );
}
