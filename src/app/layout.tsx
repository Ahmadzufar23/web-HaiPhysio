import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";

// Plus Jakarta Sans: huruf utama (dirancang di Jakarta, sangat terbaca untuk semua usia).
// Instrument Serif: aksen editorial pada judul — memberi kesan klinik premium.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hai Physio | Klinik Fisioterapi Efektif & Progresif",
  description: "Klinik Fisioterapi Hai Physio terpercaya di Jakarta Timur. Melayani fisioterapi muskuloskeletal, neuro, dan olahraga untuk pemulihan yang efektif dan progresif.",
  icons: {
    icon: "/fisio_nobg.png", // Ini bakal ngubah ikon bola dunia bawaan Vercel jadi logo klinik
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full ${jakarta.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        {/* Tandai JS aktif sebelum paint: animasi reveal hanya menyembunyikan konten bila JS jalan */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex flex-col h-full min-h-[100dvh] overflow-x-hidden bg-white font-sans text-brand-900">
        <ScrollProgress />
        <Navbar />
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
