"use client";

import { PageHeader, Panel } from "@/components/admin/shared/AdminUI";
import AccountsTable from "@/components/super-admin/AccountsTable";

export default function SuperAdminAccountsPage() {
  return (
    <>
      <PageHeader title="Cari akun" description="Bantu yang lupa akun: cari lewat nama, email, atau nomor HP di semua klinik, lalu kirim link reset lewat WhatsApp." />
      <Panel title="Semua akun" description="Menampilkan 50 akun terbaru yang cocok. Kata sandi dan rekam medis tidak pernah ditampilkan.">
        <AccountsTable showClinic />
      </Panel>
    </>
  );
}
