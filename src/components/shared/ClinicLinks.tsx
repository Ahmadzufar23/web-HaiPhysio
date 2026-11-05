"use client";

import { useState } from "react";
import { btn } from "@/components/admin/shared/AdminUI";

const LINKS = [
  { path: "", label: "Halaman klinik", hint: "Untuk tombol di website, Instagram, atau Google Maps" },
  { path: "/booking", label: "Langsung booking", hint: "Untuk tombol \"Buat janji\" di website klinik" },
  { path: "/register", label: "Daftar akun", hint: "Pasien yang daftar lewat link ini otomatis masuk klinik ini" },
];

// Link yang dipasang klinik di website company profile atau media sosialnya
export default function ClinicLinks({ slug }: { slug: string }) {
  const [copied, setCopied] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      setCopied("");
    }
  };

  return (
    <ul className="divide-y divide-zinc-100 text-[13px]">
      {LINKS.map(({ path, label, hint }) => {
        const url = `${origin}/k/${slug}${path}`;
        return (
          <li key={label} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <span className="min-w-0">
              <span className="block font-medium text-zinc-900">{label}</span>
              <span className="block break-all font-mono text-[12px] text-zinc-600">{url}</span>
              <span className="block text-[11px] text-zinc-400">{hint}</span>
            </span>
            <button type="button" onClick={() => copy(url)} className={btn.secondary}>
              {copied === url ? "Tersalin" : "Salin"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
