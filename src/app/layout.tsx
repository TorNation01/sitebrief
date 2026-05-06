import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConditionalMarketingShell } from "@/components/layout/conditional-marketing-shell";
import { getBrandCssVars, getPublicBrand } from "@/lib/sitebrief/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brand = getPublicBrand();

export const metadata: Metadata = {
  metadataBase:
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
  title: {
    default: `${brand.appName} — Line up your next website build · ${brand.studioDisplayName}`,
    template: `%s · ${brand.appName}`,
  },
  description: brand.metaDescription,
  applicationName: brand.appName,
  referrer: "origin-when-cross-origin",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url:
      typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
      process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
        ? process.env.NEXT_PUBLIC_SITE_URL
        : undefined,
    siteName: brand.appName,
    title: `${brand.appName} — Your build-ready website brief`,
    description: brand.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.appName} · ${brand.studioDisplayName}`,
    description: brand.metaDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accentOverrides = getBrandCssVars();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-surface)] font-sans text-white flex flex-col">
        {accentOverrides ? (
          <style
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `:root{${accentOverrides}}`,
            }}
          />
        ) : null}
        <ConditionalMarketingShell>{children}</ConditionalMarketingShell>
        <Analytics />
      </body>
    </html>
  );
}
