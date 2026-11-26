import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LangProvider } from "@/i18n/LangProvider";
import { getLang } from "@/i18n/server";
import { ShopProvider } from "@/store/ShopProvider";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VELMOR PERFUMES", template: "%s · VELMOR PERFUMES" },
  description: "VELMOR PERFUMES — ароматы с выбором объёма от 10 до 100 мл. Заказ через Telegram.",
};

export const viewport: Viewport = {
  themeColor: "#10100F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <LangProvider initialLang={lang}>
          <ShopProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
            >
              {lang === "ru" ? "К содержимому" : "Asosiy qismga o‘tish"}
            </a>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </LangProvider>
      </body>
    </html>
  );
}
