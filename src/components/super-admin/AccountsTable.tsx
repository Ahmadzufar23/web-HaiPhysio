"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService, type AccountRole, type PlatformAccount, type ResetLink } from "@/services/superAdminService";
import { btn, EmptyState, inputClass, Notice, tableHead } from "@/components/admin/shared/AdminUI";

const ROLE_LABEL: Record<AccountRole, string> = { owner: "Owner", terapis: "Terapis", pasien: "Pasien" };
const STATUS_LABEL = { aktif: "Aktif", belum_aktivasi: "Belum aktivasi", offline: "Tanpa email" } as const;
const SEARCH_DELAY_MS = 300;

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }) : "Belum pernah");

function ResetLinkBox({ account, link, onClose }: { account: PlatformAccount; link: ResetLink; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(link.link).catch(() => undefined);
    setCopied(true);
  };
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50 p-4 text-[13px]">
      <p className="font-medium text-zinc-900">Link reset untuk {account.fullName}</p>
      <p className="text-[12px] text-zinc-600">Berlaku 1 jam dan sekali pakai. Pemilik akun membuat kata sandinya sendiri. Kirim hanya ke nomor pemilik akun.</p>
      <p className="break-all rounded-md border border-zinc-200 bg-white p-2 font-mono text-[12px] text-zinc-700">{link.link}</p>
      <div className="flex flex-wrap gap-2">
        <a href={link.whatsappUrl} target="_blank" rel="noopener noreferrer" className={btn.primary}>
          Kirim lewat WhatsApp
        </a>
        <button type="button" onClick={copy} className={btn.secondary}>
          {copied ? "Tersalin" : "Salin link"}
        </button>
        <button type="button" onClick={onClose} className={btn.secondary}>
          Tutup
        </button>
      </div>
    </div>
  );
}

// Daftar akun untuk membantu yang lupa akun. Tanpa rekam medis dan tanpa password.
export default function AccountsTable({ clinicId, showClinic = false }: { clinicId?: string; showClinic?: boolean }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<AccountRole | "">("");
  const [accounts, setAccounts] = useState<PlatformAccount[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reset, setReset] = useState<{ account: PlatformAccount; link: ResetLink } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      superAdminService
        .listAccounts({ q: query.trim() || undefined, role: role || undefined, clinic_id: clinicId })
        .then((res) => {
          if (cancelled) return;
          setError("");
          setAccounts(res.data.accounts);
        })
        .catch((err) => {
          if (!cancelled) setError(getApiErrorMessage(err, "Akun gagal dimuat."));
        });
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, role, clinicId]);

  const createLink = async (account: PlatformAccount) => {
    setBusyId(account.id);
    setError("");
    try {
      const res = await superAdminService.createResetLink(account.id);
      setReset({ account, link: res.data });
    } catch (err) {
      setError(getApiErrorMessage(err, "Link gagal dibuat."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col">
      {error && (
        <div className="p-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <div className="grid gap-2 border-b border-zinc-200 p-3 sm:grid-cols-[1fr_160px]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, email, atau nomor HP" aria-label="Cari akun" className={inputClass} />
        <select value={role} onChange={(e) => setRole(e.target.value as AccountRole | "")} aria-label="Filter peran" className={inputClass}>
          <option value="">Semua peran</option>
          <option value="owner">Owner</option>
          <option value="terapis">Terapis</option>
          <option value="pasien">Pasien</option>
        </select>
      </div>
      {reset && <ResetLinkBox account={reset.account} link={reset.link} onClose={() => setReset(null)} />}
      {accounts === null && !error && <p className="px-4 py-6 text-[13px] text-zinc-500">Memuat…</p>}
      {accounts?.length === 0 && <EmptyState title="Akun tidak ditemukan" />}
      {accounts && accounts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className={tableHead}>
                <th className="px-4 py-2 font-medium">Nama</th>
                {showClinic && <th className="px-4 py-2 font-medium">Klinik</th>}
                <th className="px-4 py-2 font-medium">Peran</th>
                <th className="px-4 py-2 font-medium">Kontak</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Login terakhir</th>
                <th className="px-4 py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{account.fullName}</td>
                  {showClinic && <td className="px-4 py-2.5 text-zinc-600">{account.brand ?? "—"}</td>}
                  <td className="px-4 py-2.5 text-zinc-600">{ROLE_LABEL[account.role]}</td>
                  <td className="px-4 py-2.5 text-zinc-600">
                    {account.email ?? "—"}
                    <span className="block text-[11px] text-zinc-400">{account.phone}</span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{account.therapistStatus === "nonaktif" ? <span className="font-medium text-red-700">Nonaktif</span> : STATUS_LABEL[account.accountStatus]}</td>
                  <td className="px-4 py-2.5 tabular-nums text-zinc-600">{formatDateTime(account.lastLoginAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" disabled={busyId === account.id} onClick={() => createLink(account)} className="whitespace-nowrap rounded px-2 py-1 text-[12px] text-zinc-700 hover:bg-zinc-100 disabled:opacity-50">
                      Buat link reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
