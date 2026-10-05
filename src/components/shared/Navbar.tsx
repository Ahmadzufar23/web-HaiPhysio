"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { List, X, UserCircle, ClockCounterClockwise, ArrowRight, CaretDown } from "@phosphor-icons/react";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const navItems = [
  { label: "Beranda", path: "/" },
  { label: "Tentang Kami", path: "/tentang-kami" },
  { label: "Layanan", path: "/layanan" },
  { label: "Kontak Kami", path: "/kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cek sesi login ulang tiap pindah halaman
  const { isLoggedIn, fullName, appointmentHref } = useAuthStatus([pathname]);

  // Navbar berubah jadi "kaca" setelah halaman di-scroll sedikit
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu saat pindah halaman (disesuaikan saat render, bukan lewat effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }

  // Tutup dropdown profil saat klik di luar / tekan Escape
  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setIsProfileDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsProfileDropdownOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isProfileDropdownOpen]);

  // Early return WAJIB di bawah semua hooks (Rules of Hooks)
  if (pathname.startsWith("/admin")) return null;

  const solid = isScrolled || isMobileMenuOpen;
  const firstName = fullName?.split(" ")[0];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        solid
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgb(26_24_20/0.06),0_12px_32px_-18px_rgb(26_24_20/0.25)]"
          : "bg-white"
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-10 xl:px-[80px] transition-[height] duration-500 ${
          isScrolled ? "h-[72px] md:h-[78px]" : "h-[84px] md:h-[96px]"
        }`}
      >
        {/* LOGO */}
        <Link href="/" aria-label="Hai Physio — Beranda" className="relative flex w-[104px] md:w-[118px] items-center transition-transform duration-500 hover:scale-[1.03]">
          <Image
            src="/fisio_nobg.png"
            alt="Logo Hai Physio"
            width={125}
            height={80}
            priority
            className="h-auto w-full object-contain object-left"
          />
        </Link>

        {/* MENU NAVIGASI DESKTOP */}
        <ul className="hidden lg:flex items-center gap-1 rounded-full border border-brand-900/[0.07] bg-white/60 p-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative block rounded-full px-5 py-2.5 text-[14.5px] font-medium transition-colors duration-300 ${
                    isActive ? "bg-brand-900 text-white" : "text-brand-900/70 hover:bg-brand-50 hover:text-brand-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* TOMBOL CTA / PROFIL DESKTOP */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProfileDropdownOpen}
                onClick={() => setIsProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-brand-900/10 py-1 pl-1 pr-3 transition-colors hover:border-brand-900/25 hover:bg-brand-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-gold-700">
                  <UserCircle size={26} weight="fill" />
                </span>
                <span className="max-w-[110px] truncate text-[14px] font-semibold text-brand-900">{firstName}</span>
                <CaretDown size={14} weight="bold" className={`text-brand-900/60 transition-transform duration-300 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isProfileDropdownOpen && (
                <div role="menu" className="animate-menu-in absolute right-0 mt-3 w-[240px] overflow-hidden rounded-2xl border border-brand-900/[0.08] bg-white p-1.5 shadow-[0_24px_48px_-16px_rgb(26_24_20/0.3)]">
                  <div className="px-3.5 pb-2 pt-2.5">
                    <p className="text-[12px] text-brand-900/50">Masuk sebagai</p>
                    <p className="truncate text-[14px] font-semibold text-brand-900">{fullName}</p>
                  </div>
                  <div className="my-1 h-px bg-brand-900/[0.06]" />
                  <Link
                    role="menuitem"
                    href="/profil"
                    className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium text-brand-900 transition-colors hover:bg-brand-50"
                  >
                    <UserCircle size={20} className="text-brand-900/40 transition-colors group-hover:text-gold-700" />
                    Pengaturan Profil
                  </Link>
                  <Link
                    role="menuitem"
                    href="/riwayat-booking"
                    className="group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium text-brand-900 transition-colors hover:bg-brand-50"
                  >
                    <ClockCounterClockwise size={20} className="text-brand-900/40 transition-colors group-hover:text-gold-700" />
                    Riwayat Booking
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href={appointmentHref} className="btn btn-primary btn-sm">
            Buat Janji Temu
            <ArrowRight size={16} weight="bold" className="btn-arrow" />
          </Link>
        </div>

        {/* HAMBURGER BUTTON (Mobile Only) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-900/10 text-brand-900 transition-colors hover:bg-brand-50 lg:hidden"
        >
          {isMobileMenuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </nav>

      {/* DROPDOWN MOBILE MENU */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 top-full z-50 flex max-h-[calc(100dvh-72px)] w-full flex-col overflow-y-auto border-t border-brand-900/[0.06] bg-white px-5 pb-8 pt-4 shadow-[0_24px_48px_-16px_rgb(26_24_20/0.3)] lg:hidden"
        >
          {isLoggedIn && (
            <div className="animate-menu-in mb-4 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gold-700">
                <UserCircle size={30} weight="fill" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-bold text-brand-900">{fullName || "Akun Saya"}</span>
                <span className="text-[12px] font-medium text-gold-700">Pasien Terdaftar</span>
              </div>
            </div>
          )}

          <ul className="flex flex-col">
            {navItems.map((item, i) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path} className="animate-menu-in" style={{ animationDelay: `${60 + i * 50}ms` }}>
                  <Link
                    href={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className="flex items-center justify-between border-b border-brand-900/[0.06] py-4"
                  >
                    <span className={`font-display text-[28px] leading-none ${isActive ? "italic text-gold-700" : "text-brand-900"}`}>
                      {item.label}
                    </span>
                    <ArrowRight size={18} className={isActive ? "text-gold-700" : "text-brand-900/30"} />
                  </Link>
                </li>
              );
            })}
          </ul>

          {isLoggedIn && (
            <div className="animate-menu-in mt-4 flex flex-col" style={{ animationDelay: "280ms" }}>
              <Link href="/profil" className="flex items-center gap-3 py-3 text-[15px] font-medium text-brand-900">
                <UserCircle size={20} className="text-brand-900/40" /> Pengaturan Profil
              </Link>
              <Link href="/riwayat-booking" className="flex items-center gap-3 py-3 text-[15px] font-medium text-brand-900">
                <ClockCounterClockwise size={20} className="text-brand-900/40" /> Riwayat Booking
              </Link>
            </div>
          )}

          <Link href={appointmentHref} className="animate-menu-in btn btn-primary mt-6 w-full" style={{ animationDelay: "320ms" }}>
            Buat Janji Temu
            <ArrowRight size={18} weight="bold" className="btn-arrow" />
          </Link>
        </div>
      )}
    </header>
  );
}
