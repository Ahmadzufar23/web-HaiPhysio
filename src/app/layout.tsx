import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ClinicProvider from "@/components/shared/ClinicProvider";
import { PLATFORM } from "@/constants/platform";
import { ACCENT_BOOT_SCRIPT } from "@/lib/accentTheme";

// Plus Jakarta Sans: satu-satunya huruf (dirancang di Jakarta, sangat terbaca untuk semua usia).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  // Nama klinik dipasang ClinicProvider setelah kliniknya diketahui
  title: `Klinik Fisioterapi | ${PLATFORM.name}`,
  description: "Booking fisioterapi, rekam medis, dan program latihan dalam satu tempat.",
  icons: { icon: PLATFORM.logo },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Tandai JS aktif sebelum paint: animasi reveal hanya menyembunyikan konten bila JS jalan */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* Isi skrip konstanta kode sendiri, tanpa masukan pengguna */}
        <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOT_SCRIPT }} />
      </head>
      <body className="flex flex-col h-full min-h-[100dvh] overflow-x-hidden bg-white font-sans text-brand-900">
        <ClinicProvider>
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
          <Footer />
        </ClinicProvider>
      </body>
    </html>
  );
}
