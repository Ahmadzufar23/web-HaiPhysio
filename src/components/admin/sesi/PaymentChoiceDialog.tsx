"use client";

import type { ReactNode } from "react";
import { CaretRight, CreditCard, Money, type Icon } from "@phosphor-icons/react";
import PaymentDialog from "./PaymentDialog";

type Props = {
  patientName: string;
  referenceCode: string;
  amount?: number | null;
  packageName?: string | null;
  busy: boolean;
  onPayOnline: () => void;
  onPayCash: () => void;
  onClose: () => void;
  children?: ReactNode;
};

type MethodOptionProps = {
  icon: Icon;
  name: string;
  note: string;
  busy: boolean;
  onSelect: () => void;
};

function MethodOption({ icon: MethodIcon, name, note, busy, onSelect }: MethodOptionProps) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-action-line hover:bg-action-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-line disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-800 transition-colors group-hover:bg-action group-hover:text-on-action">
        <MethodIcon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-zinc-900">{name}</span>
        <span className="mt-px block text-[12px] text-zinc-500">{note}</span>
      </span>
      <CaretRight size={14} className="shrink-0 text-zinc-400" />
    </button>
  );
}

// Popup tombol Selesai, dipakai di daftar booking dan halaman sesi.
export default function PaymentChoiceDialog({ patientName, referenceCode, amount, packageName, busy, onPayOnline, onPayCash, onClose, children }: Props) {
  return (
    <PaymentDialog title="Pilih metode pembayaran" patientName={patientName} referenceCode={referenceCode} amount={amount} packageName={packageName} busy={busy} onClose={onClose}>
      <div className="flex flex-col gap-2">
        <MethodOption icon={CreditCard} name="Transfer / e-wallet" note="Lewat halaman Xendit, bisa transfer bank, e-wallet, QR, atau kartu. Sesi Selesai setelah pasien membayar." busy={busy} onSelect={onPayOnline} />
        <MethodOption icon={Money} name="Bayar tunai" note="Pasien membayar di klinik. Sesi langsung Selesai dan masuk log tunai." busy={busy} onSelect={onPayCash} />
      </div>
      {children}
    </PaymentDialog>
  );
}
