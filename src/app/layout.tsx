import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonIQ | Enterprise Carbon Footprint Analytics Platform",
  description:
    "Track, analyze, and reduce your carbon emissions with CarbonIQ. AI-powered sustainability coaching, interactive dashboards, and gamified progress — built for smart cities, ESG programs, and organizations.",
  keywords: [
    "carbon footprint",
    "sustainability analytics",
    "climate change",
    "CO2 emissions calculator",
    "ESG tracker",
    "enterprise carbon platform",
    "CarbonIQ",
  ],
  authors: [{ name: "CarbonIQ Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
            {children}
          </main>

          <footer className="w-full py-8 text-center text-xs text-slate-600 border-t border-slate-800/50 bg-slate-950/20 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-slate-500">
                © {new Date().getFullYear()}{" "}
                <span className="text-indigo-400 font-semibold">CarbonIQ</span>.
                Enterprise-grade carbon footprint analytics.
              </p>
              <p className="mt-1 text-slate-700">
                Built for Smart Cities · ESG Programs · Corporate Sustainability · Government Initiatives
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
