import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "../components/ThemeScript";
import { AppProviders } from "../context/AppProviders";
import { AiAssistant } from "../components/AiAssistant";
import { CodeSnippetInjector } from "../components/CodeSnippetInjector";
import { triggerLazyCron } from "@/lib/lazy-cron";
import { getPublicSettings } from "@/lib/get-public-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';
const SITE_NAME = 'Para Officinal S.A';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Parapharmacie & K-Beauty Officiel au Maroc`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Leader de la K-Beauty et de la Dermo-Cosmétique au Maroc. Diagnostic de peau IA, livraison gratuite le jour même, paiement à la livraison sécurisé.',
  keywords: [
    'parapharmacie maroc',
    'k-beauty maroc',
    'cosmétiques',
    'soin de peau',
    'diagnostic peau ia',
    'dermo-cosmétique',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Parapharmacie & K-Beauty`,
    description:
      'Leader de la K-Beauty et de la Dermo-Cosmétique au Maroc. Diagnostic IA, livraison gratuite, paiement sécurisé.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Parapharmacie & K-Beauty au Maroc`,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Parapharmacie & K-Beauty`,
    description:
      'Leader de la K-Beauty et de la Dermo-Cosmétique au Maroc. Diagnostic IA, livraison gratuite, paiement sécurisé.',
    images: ['/og-image.jpg'],
    creator: '@paraofficinal',
    site: '@paraofficinal',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  triggerLazyCron();

  // Fetch real settings from Supabase server-side.
  // These include galleryOverrides already merged into banners[i].bgImage.
  // Passed to SettingsProvider as initialSettings so the very first HTML
  // the browser receives already has the correct images baked in —
  // no flash, no delay, no localStorage dependency, works on every browser.
  const initialSettings = await getPublicSettings();

  return (
    <html lang="fr" dir="ltr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head />
      <body className="antialiased selection:bg-primary/30 selection:text-primary-dark" suppressHydrationWarning>
        <ThemeScript />
        <AppProviders initialSettings={initialSettings}>
          <CodeSnippetInjector />
          {children}
          <AiAssistant />
        </AppProviders>
      </body>
    </html>
  );
}
