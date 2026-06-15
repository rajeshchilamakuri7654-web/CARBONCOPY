/**
 * @file src/app/layout.tsx
 * @description Root application layout.
 * Includes accessibility infrastructure (SkipNav), SEO metadata,
 * error boundary, and session provider.
 */

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { SkipNav } from "@/components/ui/SkipNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Viewport configuration — controls mobile rendering and theme color */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10b981",
};

/** SEO metadata for the application root */
export const metadata: Metadata = {
  title: {
    template: "%s | CarbonIQ",
    default: "CarbonIQ | Enterprise Carbon Footprint Analytics Platform",
  },
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
    "net zero",
    "greenhouse gas",
  ],
  authors: [{ name: "CarbonIQ Team" }],
  creator: "CarbonIQ",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CarbonIQ",
    title: "CarbonIQ | Enterprise Carbon Footprint Analytics",
    description:
      "Measure, monitor, and reduce your carbon footprint with AI-powered analytics and gamified sustainability tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonIQ | Carbon Footprint Analytics",
    description: "Track and reduce your carbon emissions with CarbonIQ.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Skip navigation — first focusable element for keyboard users */}
        <SkipNav />

        <Providers>
          <Navbar />

          {/* Main content landmark — targeted by SkipNav */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 focus:outline-none"
          >
            {children}
          </main>

          <footer
            role="contentinfo"
            className="w-full py-8 text-center text-xs text-slate-600 border-t border-slate-200 bg-slate-50/50 backdrop-blur-sm mt-auto"
          >
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-slate-500">
                © {new Date().getFullYear()}{" "}
                <span className="text-emerald-600 font-semibold">CarbonIQ</span>.
                Enterprise-grade carbon footprint analytics.
              </p>
              <p className="mt-1 text-slate-400">
                Built for Smart Cities · ESG Programs · Corporate Sustainability · Government Initiatives
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
