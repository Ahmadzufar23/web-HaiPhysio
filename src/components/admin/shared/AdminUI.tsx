import type { ReactNode } from "react";
import type { BookingStatus } from "@/types/api.types";

// Komponen dasar dashboard admin. Palet netral (putih, abu, hitam), teks kecil,
// garis tipis tanpa bayangan. Merah hanya untuk aksi/status batal.

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-zinc-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

// Status dibedakan lewat isian titik (kosong → setengah → penuh), bukan warna.
const STATUS_STYLE: Record<BookingStatus, { label: string; dot: string; text: string }> = {
  Terkonfirmasi: { label: "Menunggu", dot: "border border-zinc-400 bg-white", text: "text-zinc-600" },
  Berlangsung: { label: "Berlangsung", dot: "bg-zinc-900 ring-2 ring-zinc-200", text: "text-zinc-900 font-medium" },
  Selesai: { label: "Selesai", dot: "bg-zinc-400", text: "text-zinc-600" },
  Dibatalkan: { label: "Dibatalkan", dot: "bg-red-600", text: "text-red-700" },
  "Tidak Hadir": { label: "Tidak hadir", dot: "bg-red-600", text: "text-red-700" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Terkonfirmasi;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

/** Deretan angka ringkas dalam satu panel, dipisah garis tipis. */
export function MetricStrip({ items, loading }: { items: { label: string; value: ReactNode; hint?: string }[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-0.5 px-4 py-3 ${i % 2 === 1 ? "border-l border-zinc-200" : ""} ${i >= 2 ? "border-t border-zinc-200 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
        >
          <span className="text-[12px] text-zinc-500">{item.label}</span>
          <span className="text-[18px] font-semibold tabular-nums tracking-tight text-zinc-900">
            {loading ? <span className="inline-block h-5 w-14 animate-pulse rounded bg-zinc-100" /> : item.value}
          </span>
          {item.hint && <span className="text-[11px] text-zinc-400">{item.hint}</span>}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[13px] font-medium text-zinc-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-[12px] text-zinc-500">{description}</p>}
    </div>
  );
}

/** Pemberitahuan setelah aksi: netral, merah hanya untuk gagal. */
export function Notice({ tone, children }: { tone: "info" | "error"; children: ReactNode }) {
  return (
    <p className={`rounded-md border px-3 py-2 text-[12px] ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-zinc-200 bg-white text-zinc-700"}`}>
      {children}
    </p>
  );
}

export const btn = {
  primary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400",
  secondary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-white",
  danger:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[12px] font-medium text-red-700 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:border-zinc-200 disabled:hover:bg-white",
};

export const inputClass =
  "w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-500";

export const tableHead = "border-b border-zinc-200 bg-zinc-50/60 text-[11px] font-medium uppercase tracking-wide text-zinc-500";
export const linkClass = "text-[12px] font-medium text-zinc-600 hover:text-zinc-900";
