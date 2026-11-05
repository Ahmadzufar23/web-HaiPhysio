"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type AuditEntry } from "@/services/superAdminService";
import { EmptyState, Notice, PageHeader, Panel, tableHead } from "@/components/admin/shared/AdminUI";

const ACTION_LABEL: Record<string, string> = {
  clinic_created: "Membuat klinik",
  clinic_profile_updated: "Mengubah profil klinik",
  commission_changed: "Mengubah komisi",
  clinic_suspended: "Suspend klinik",
  clinic_unsuspended: "Membuka suspend",
  invoice_due_extended: "Memperpanjang jatuh tempo",
  invoice_reminded: "Menandai sudah diingatkan",
  booking_reversed: "Membatalkan booking selesai",
  branch_created: "Menambah cabang",
  group_profile_updated: "Mengubah identitas merek",
  group_logo_updated: "Mengganti logo",
  reset_link_created: "Membuat link reset akun",
  therapist_transferred: "Owner memutasi terapis",
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    superAdminService
      .listAudit()
      .then((res) => setEntries(res.data.entries))
      .catch((err) => setError(getApiErrorMessage(err, "Data gagal dimuat.")));
  }, []);

  return (
    <>
      <PageHeader title="Audit log" description="200 aksi super admin terakhir." />
      {error && <Notice tone="error">{error}</Notice>}
      <Panel>
        {entries?.length === 0 ? (
          <EmptyState title="Belum ada aksi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className={tableHead}>
                  <th className="px-4 py-2 font-medium">Waktu</th>
                  <th className="px-4 py-2 font-medium">Aksi</th>
                  <th className="px-4 py-2 font-medium">Klinik</th>
                  <th className="px-4 py-2 font-medium">Oleh</th>
                  <th className="px-4 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {entries?.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-100 align-top last:border-0">
                    <td className="px-4 py-2.5 tabular-nums text-zinc-600">{new Date(entry.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
                    <td className="px-4 py-2.5 text-zinc-900">{ACTION_LABEL[entry.action] ?? entry.action}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{entry.brand ?? "—"}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{entry.actorName ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-500">{Object.keys(entry.details).length > 0 ? JSON.stringify(entry.details) : "—"}</td>
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
