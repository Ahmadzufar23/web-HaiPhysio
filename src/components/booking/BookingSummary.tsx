"use client";

import { ui } from "./BookingUI";
import { quotaLabel, slotLabel, type BookingDraft } from "./bookingDraft";

/** Ringkasan pilihan yang terisi bertahap di samping form */
export default function BookingSummary({ draft, currentStep, onEdit }: { draft: BookingDraft; currentStep: number; onEdit: (step: number) => void }) {
  const rows = [
    { label: "Layanan", value: draft.serviceName, step: 1 },
    { label: "Paket", value: draft.packageName, sub: draft.packagePriceLabel, step: 1 },
    { label: "Fisioterapis", value: [...new Set(draft.slots.map((s) => s.therapistName))].join(", "), step: 2 },
    { label: "Jadwal", value: draft.slots.map(slotLabel).join("\n"), sub: quotaLabel(draft), step: 2 },
  ];

  return (
    <div className={ui.card}>
      <div className="border-b border-zinc-100 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-zinc-900">Ringkasan</h2>
      </div>
      <dl className="divide-y divide-zinc-100 px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <dt className="text-[11px] text-zinc-500">{row.label}</dt>
              <dd className={`mt-0.5 whitespace-pre-line text-[13px] ${row.value ? "text-zinc-900" : "text-zinc-300"}`}>{row.value || "Belum dipilih"}</dd>
              {row.value && row.sub && <dd className="text-[11px] text-zinc-500">{row.sub}</dd>}
            </div>
            {row.value && currentStep > row.step && (
              <button type="button" onClick={() => onEdit(row.step)} className="shrink-0 text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
                Ubah
              </button>
            )}
          </div>
        ))}
      </dl>
      <p className="border-t border-zinc-100 px-4 py-3 text-[11px] leading-relaxed text-zinc-500">
        Pembayaran dilakukan di klinik. Jadwal bisa diubah atau dibatalkan dari Riwayat Booking.
      </p>
    </div>
  );
}
