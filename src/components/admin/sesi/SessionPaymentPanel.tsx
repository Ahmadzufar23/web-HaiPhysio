"use client";

import { useState } from "react";
import { btn, Panel } from "@/components/admin/shared/AdminUI";
import { formatRupiah } from "@/lib/format";
import type { SessionPayment } from "@/types/api.types";

// Muncul setelah Selesai ditekan. Sesi baru berstatus Selesai setelah pasien membayar.
export default function SessionPaymentPanel({ payment, busy, onPayCash }: { payment: SessionPayment | null; busy: boolean; onPayCash: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = payment?.status === "pending" ? payment.invoiceUrl : null;

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel
      title={url ? "Menunggu pembayaran pasien" : "Pembayaran"}
      description={url ? "Status berubah menjadi Selesai otomatis setelah pembayaran diterima." : "Pembayaran online belum tersedia untuk sesi ini."}
      bodyClassName="flex flex-col gap-3 p-4"
    >
      {payment?.amount != null && url && <p className="text-[18px] font-semibold tabular-nums text-zinc-900">{formatRupiah(payment.amount)}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {url && (
          <>
            <a href={url} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              Buka halaman pembayaran
            </a>
            <button type="button" onClick={handleCopy} className={btn.secondary}>
              {copied ? "Link disalin" : "Salin link"}
            </button>
          </>
        )}
        <button type="button" onClick={onPayCash} disabled={busy} className={btn.secondary}>
          Pasien bayar tunai
        </button>
      </div>
    </Panel>
  );
}
