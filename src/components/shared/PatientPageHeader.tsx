import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

/** Judul halaman area pasien: breadcrumb kecil, judul, aksi/info di kanan. */
export default function PatientPageHeader({
  crumbs,
  title,
  aside,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-zinc-200 pb-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-zinc-400">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1">
            {i > 0 && <CaretRight size={10} />}
            {c.href ? (
              <Link href={c.href} className="hover:text-zinc-700">
                {c.label}
              </Link>
            ) : (
              <span className="text-zinc-600">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-zinc-900">{title}</h1>
        {aside}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
