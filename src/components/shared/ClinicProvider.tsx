"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearClinicSlug, getClinicSlug, setClinicSlug } from "@/app/utils/api";
import { publicClinicService } from "@/services/publicClinicService";
import { profileService } from "@/services/profileService";
import { EMPTY_CLINIC, toClinicView, type ClinicView, type PublicClinic } from "@/constants/clinic";
import { PLATFORM } from "@/constants/platform";

const ClinicContext = createContext<ClinicView>(EMPTY_CLINIC);

/** Identitas klinik yang sedang dibuka. Kosong selama dimuat. */
export const useClinic = () => useContext(ClinicContext);

// Halaman yang tetap terbuka tanpa klinik: panel staf, super admin, link klinik, dan tautan dari email.
const PATHS_WITHOUT_CLINIC = ["/admin", "/super-admin", "/k/", "/login", "/reset-password", "/verifikasi-email"];

type Status = "loading" | "ready" | "none";

// Akun yang login selalu memakai kliniknya sendiri; tamu memakai klinik dari link /k/<slug>.
async function resolveSlug() {
  const profile = await profileService.getProfile().catch(() => null);
  const accountSlug: string | undefined = profile?.data?.user?.clinic?.slug;
  if (accountSlug) {
    setClinicSlug(accountSlug);
    return accountSlug;
  }
  return getClinicSlug();
}

export default function ClinicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clinic, setClinic] = useState<ClinicView>(EMPTY_CLINIC);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slug = await resolveSlug();
      if (cancelled) return;
      if (!slug) {
        setClinic(EMPTY_CLINIC);
        setStatus("none");
        return;
      }
      if (slug === clinic.slug) return;

      const loaded = await publicClinicService.getClinic(slug).catch(() => null);
      if (cancelled) return;
      if (!loaded) {
        clearClinicSlug();
        setClinic(EMPTY_CLINIC);
        setStatus("none");
        return;
      }
      setClinic(toClinicView(loaded));
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
    // Dicek lagi setiap pindah halaman, karena login dan logout mengubah klinik aktif
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (clinic.brand) document.title = `${clinic.brand} | Klinik Fisioterapi`;
  }, [clinic.brand]);

  const needsClinic = !PATHS_WITHOUT_CLINIC.some((path) => pathname.startsWith(path));
  if (needsClinic && status === "none") return <ClinicPicker />;

  return <ClinicContext.Provider value={clinic}>{children}</ClinicContext.Provider>;
}

// Alamat utama dibuka tanpa link klinik: pengunjung memilih kliniknya dulu.
function ClinicPicker() {
  const [clinics, setClinics] = useState<PublicClinic[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    publicClinicService
      .listClinics()
      .then(setClinics)
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-[520px]">
        <h1 className="text-[20px] font-semibold tracking-tight text-zinc-900">Pilih klinik</h1>
        <p className="mt-1.5 text-[14px] text-zinc-500">Pilih klinik tempat Anda berobat, atau buka link yang dibagikan klinik.</p>

        {failed && <p className="mt-6 text-[14px] text-red-700">Daftar klinik gagal dimuat. Coba muat ulang halaman.</p>}
        {!failed && clinics === null && <p className="mt-6 text-[14px] text-zinc-500">Memuat…</p>}
        {clinics?.length === 0 && <p className="mt-6 text-[14px] text-zinc-500">Belum ada klinik yang terdaftar.</p>}

        {clinics && clinics.length > 0 && (
          <ul className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {clinics.map((item) => (
              <li key={item.slug}>
                <a href={`/k/${item.slug}`} className="block px-4 py-3 transition-colors hover:bg-zinc-50">
                  <span className="block text-[14px] font-medium text-zinc-900">{item.brand}</span>
                  {item.address && <span className="mt-0.5 block text-[13px] text-zinc-500">{item.address}</span>}
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-[13px] text-zinc-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Masuk
          </Link>
        </p>
        <p className="mt-8 text-[12px] text-zinc-400">Ditenagai oleh {PLATFORM.name}</p>
      </div>
    </div>
  );
}
