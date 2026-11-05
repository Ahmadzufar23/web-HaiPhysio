"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { setClinicSlug } from "@/app/utils/api";
import { publicClinicService } from "@/services/publicClinicService";
import { clinicAssetUrl, type ClinicLinkTarget } from "@/constants/clinic";
import { PLATFORM } from "@/constants/platform";

// Link yang dipasang klinik di website atau media sosialnya: /k/<slug> atau /k/<slug>/booking.
// Link cabang langsung membuka cabangnya. Link merek yang punya beberapa cabang menampilkan
// pilihan cabang dulu. Klinik disimpan di browser, lalu pengunjung diarahkan ke halaman tujuan.
export default function ClinicLinkPage() {
  const params = useParams<{ slug: string; rest?: string[] }>();
  const [target, setTarget] = useState<Extract<ClinicLinkTarget, { kind: "group" }> | null>(null);
  const [notFound, setNotFound] = useState(false);

  const destination = `/${(params.rest ?? []).map(encodeURIComponent).join("/")}`;

  const openBranch = (slug: string) => {
    setClinicSlug(slug);
    // Muat ulang penuh supaya tampilan memakai klinik ini
    window.location.replace(destination);
  };

  useEffect(() => {
    publicClinicService
      .resolveLink(params.slug.toLowerCase())
      .then((result) => {
        if (result.kind === "group") setTarget(result);
        else {
          setClinicSlug(result.clinic.slug);
          window.location.replace(`/${(params.rest ?? []).map(encodeURIComponent).join("/")}`);
        }
      })
      .catch(() => setNotFound(true));
  }, [params.slug, params.rest]);

  if (target) {
    const logo = clinicAssetUrl(target.group.logoUrl);
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-[520px]">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element -- logo klinik dari API
            <img src={logo} alt={`Logo ${target.group.name}`} className="mb-4 h-14 w-auto object-contain" />
          )}
          <h1 className="text-[20px] font-semibold tracking-tight text-zinc-900">Pilih cabang {target.group.name}</h1>
          <p className="mt-1.5 text-[14px] text-zinc-500">Pilih cabang terdekat. Satu akun bisa dipakai di semua cabang.</p>
          <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {target.branches.map((branch) => (
              <li key={branch.slug}>
                <button type="button" onClick={() => openBranch(branch.slug)} className="block w-full px-4 py-3 text-left transition-colors hover:bg-zinc-50">
                  <span className="block text-[14px] font-medium text-zinc-900">{branch.branchName || branch.brand}</span>
                  {branch.address && <span className="mt-0.5 block text-[13px] text-zinc-500">{branch.address}</span>}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[12px] text-zinc-400">Ditenagai oleh {PLATFORM.name}</p>
        </div>
      </div>
    );
  }

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
