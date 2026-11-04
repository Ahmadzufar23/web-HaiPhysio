"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { setClinicSlug } from "@/app/utils/api";
import { publicClinicService } from "@/services/publicClinicService";

// Link yang dibagikan klinik: /k/<slug> atau /k/<slug>/booking. Klinik disimpan di browser,
// lalu pengunjung diarahkan ke halaman tujuan. Muat ulang penuh supaya tampilan memakai klinik ini.
export default function ClinicLinkPage() {
  const params = useParams<{ slug: string; rest?: string[] }>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = params.slug.toLowerCase();
    publicClinicService
      .getClinic(slug)
      .then(() => {
        setClinicSlug(slug);
        window.location.replace(`/${(params.rest ?? []).map(encodeURIComponent).join("/")}`);
      })
      .catch(() => setNotFound(true));
  }, [params.slug, params.rest]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 text-center">
      {notFound ? (
        <div>
          <p className="text-[16px] font-semibold text-zinc-900">Klinik tidak ditemukan</p>
          <p className="mt-1.5 text-[14px] text-zinc-500">Periksa kembali link dari klinik Anda.</p>
          <Link href="/" className="mt-4 inline-block text-[14px] font-medium text-zinc-900 underline">
            Lihat daftar klinik
          </Link>
        </div>
      ) : (
        <p className="text-[14px] text-zinc-500">Membuka klinik…</p>
      )}
    </div>
  );
}
