"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { inputClass, PageHeader } from "@/components/admin/shared/AdminUI";
import CashbookPanel from "@/components/admin/pembukuan/CashbookPanel";
import SessionLogPanel from "@/components/admin/pembukuan/SessionLogPanel";
import PackageRecapPanel from "@/components/admin/pembukuan/PackageRecapPanel";
import ExpensesPanel from "@/components/admin/pembukuan/ExpensesPanel";
import PayrollPanel from "@/components/admin/pembukuan/PayrollPanel";
import { todayWib } from "@/lib/format";

const TABS = [
  { id: "kas", label: "Buku kas" },
  { id: "eksekusi", label: "Eksekusi terapis" },
  { id: "paket", label: "Per paket" },
  { id: "pengeluaran", label: "Pengeluaran" },
  { id: "gaji", label: "Gaji" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Pembukuan owner: eksekusi terapis, pendapatan per paket, pengeluaran, dan gaji */
export default function BookkeepingPage() {
  const user = useStaffUser();
  const router = useRouter();
  const today = todayWib();
  const [tab, setTab] = useState<TabId>("kas");
  const [from, setFrom] = useState(`${today.slice(0, 7)}-01`);
  const [to, setTo] = useState(today);
  // Naik setiap pengeluaran berubah, supaya laba di tab Per paket ikut diperbarui
  const [expenseVersion, setExpenseVersion] = useState(0);
  const validRange = !!from && !!to && from <= to;
  const isOwner = user.role === "owner";

  useEffect(() => {
    if (!isOwner) router.replace("/admin");
  }, [isOwner, router]);

  if (!isOwner) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pembukuan"
        description="Data diambil dari sesi yang sudah Selesai. Semua tabel bisa diunduh sebagai Excel."
        actions={
          tab !== "gaji" && (
            <div className="flex items-center gap-2 text-[13px] text-zinc-500">
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} w-[150px]`} aria-label="Dari tanggal" />
              <span>s.d.</span>
              <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={`${inputClass} w-[150px]`} aria-label="Sampai tanggal" />
            </div>
          )
        }
      />

      <div role="tablist" aria-label="Bagian pembukuan" className="flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              tab === t.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!validRange && tab !== "gaji" ? (
        <p className="text-[13px] text-red-700">Tanggal awal harus sebelum tanggal akhir.</p>
      ) : (
        <>
          {tab === "kas" && <CashbookPanel dateFrom={from} dateTo={to} version={expenseVersion} />}
          {tab === "eksekusi" && <SessionLogPanel dateFrom={from} dateTo={to} />}
          {tab === "paket" && <PackageRecapPanel dateFrom={from} dateTo={to} version={expenseVersion} />}
          {tab === "pengeluaran" && <ExpensesPanel dateFrom={from} dateTo={to} onChanged={() => setExpenseVersion((v) => v + 1)} />}
          {tab === "gaji" && <PayrollPanel />}
        </>
      )}
    </div>
  );
}
