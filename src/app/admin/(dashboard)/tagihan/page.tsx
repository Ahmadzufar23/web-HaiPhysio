"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookingApi, getApiErrorMessage } from "@/app/utils/api";
import { useStaffUser } from "@/components/admin/layout/AdminGuard";
import { EmptyState, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";
import { INVOICE_STATUS_LABEL, type BillingInvoice } from "@/services/superAdminService";
import { formatRupiah } from "@/lib/format";
import { PLATFORM } from "@/constants/platform";

type ClinicBilling = { billingStatus: "active" | "suspended"; commissionAmount: number; invoices: BillingInvoice[] };

// Tagihan komisi klinik. Tetap bisa dibuka saat klinik di-suspend, supaya tagihan bisa dibayar.
export default function ClinicBillingPage() {
  const router = useRouter();
  const user = useStaffUser();
  const [billing, setBilling] = useState<ClinicBilling | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "owner") {
      router.replace("/admin");
      return;
    }
    bookingApi
      .get("/clinic-billing")
      .then((res) => setBilling(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err, "Tagihan gagal dimuat.")));
  }, [router, user.role]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tagihan"
        description={`Komisi ${PLATFORM.name} untuk booking yang dibayar tunai${billing ? `, ${formatRupiah(billing.commissionAmount)} per booking selesai` : ""}.`}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {billing?.billingStatus === "suspended" && (
        <Notice tone="error">Klinik sedang tidak bisa menerima booking baru. Data dan booking yang sudah ada tetap bisa diakses. Lunasi tagihan yang telat untuk membukanya kembali.</Notice>
      )}

      <Panel>
        {billing?.invoices.length === 0 ? (
          <EmptyState title="Belum ada tagihan" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Periode</th>
                  <th className="px-4 py-2 text-right font-medium">Nominal</th>
                  <th className="px-4 py-2 font-medium">Jatuh tempo</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {billing?.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-zinc-900">{invoice.period}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatRupiah(invoice.amount)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-zinc-600">{invoice.dueDate}</td>
                    <td className={`px-4 py-2.5 ${invoice.status === "overdue" ? "font-medium text-red-700" : "text-zinc-600"}`}>{INVOICE_STATUS_LABEL[invoice.status]}</td>
                    <td className="px-4 py-2.5 text-right">
                      {invoice.status === "paid" ? (
                        <span className="text-zinc-400">—</span>
                      ) : invoice.invoiceUrl ? (
                        <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-900 underline">
                          Bayar
                        </a>
                      ) : (
                        <span className="text-[12px] text-zinc-500">Link sedang disiapkan</span>
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
