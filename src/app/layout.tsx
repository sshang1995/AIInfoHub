import type { Metadata } from "next";
import { Spectral, JetBrains_Mono, Libre_Franklin, Noto_Sans_SC } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LangProvider } from "@/components/layout/LangProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AIInfoHub — Curated AI Intelligence for Developers",
    template: "%s | AIInfoHub",
  },
  description:
    "Curated AI trends, model releases, and developer best practices. Daily newsletter included.",
  keywords: ["AI news", "developer AI", "LLM", "machine learning", "AI tools"],
  openGraph: {
    type: "website",
    siteName: "AIInfoHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${jetbrainsMono.variable} ${libreFranklin.variable} ${notoSansSC.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <LangProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LangProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
