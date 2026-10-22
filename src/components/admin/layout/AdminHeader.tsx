"use client";

import { List } from "@phosphor-icons/react";
import { formatLongDate, todayWib } from "@/lib/format";

// Bar atas tipis: tombol menu (layar kecil) dan tanggal hari ini (WIB).
// Judul halaman ada di masing-masing halaman lewat <PageHeader>.
export default function AdminHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
      <button onClick={onOpenMenu} className="-ml-1 rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden" aria-label="Buka menu">
        <List size={18} />
      </button>
      <span className="ml-auto text-[12px] text-zinc-500">{formatLongDate(todayWib())}</span>
    </header>
  );
}
