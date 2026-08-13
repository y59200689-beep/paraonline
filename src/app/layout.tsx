import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "../components/ThemeScript";
import { AppProviders } from "../context/AppProviders";
import { AiAssistant } from "../components/AiAssistant";
import { CodeSnippetInjector } from "../components/CodeSnippetInjector";
import { triggerLazyCron } from "@/lib/lazy-cron";
import { getPublicSettings } from "@/lib/get-public-settings";
import { getMergedPublicSettings } from "@/lib/cms-global-settings";
import { toThemeColorVariable } from "@/lib/theme-colors";
import { PublicWebVitals } from "@/components/PublicWebVitals";

// The storefront catalogue response is too large for Vercel ISR. Keep the
// route dynamic, while getPublicSettings remains independently cached.
export const dynamic = 'force-dynamic';

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

const CSS_COLOR_VALUE = /^(?:#[0-9a-f]{3,8}|(?:rgb|hsl|oklch|oklab)\([0-9a-z\s,./%+-]+\)|transparent|currentcolor)$/i;

function isSafeCssColor(value: unknown): value is string {
  return typeof value === 'string' && CSS_COLOR_VALUE.test(value.trim());
}

function getServerThemeVariables(themeColors: unknown) {
  if (!themeColors || typeof themeColors !== 'object') return '';

  const declarations = Object.entries(themeColors as Record<string, unknown>)
    .flatMap(([key, value]) => {
      if (!/^[a-z][a-zA-Z0-9]*$/.test(key) || !isSafeCssColor(value)) return [];
      return `${toThemeColorVariable(key)}:${value.trim()};`;
    });

  return declarations.length ? `:root{${declarations.join('')}}` : '';
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const fallbackMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Parapharmacie et K-Beauty au Maroc`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Découvrez une sélection de soins, maquillage et produits K-Beauty, avec livraison au Maroc et paiement sécurisé.',
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
      'Parapharmacie en ligne au Maroc : dermo-cosmétique, K-Beauty, diagnostic personnalisé et livraison confirmée avant commande.',
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
      'Parapharmacie en ligne au Maroc : dermo-cosmétique, K-Beauty, diagnostic personnalisé et livraison confirmée avant commande.',
    images: ['/og-image.jpg'],
    creator: '@paraofficinal',
    site: '@paraofficinal',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

/** Global CMS SEO overrides are optional; hardcoded metadata remains the safe fallback. */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getMergedPublicSettings();
    const title = settings.seoDefaultTitleFr || (fallbackMetadata.title as { default: string }).default;
    const description = settings.seoDefaultDescFr || fallbackMetadata.description;
    const image = settings.ogDefaultImage || '/og-image.jpg';
    return {
      ...fallbackMetadata,
      title: { default: title, template: `%s | ${SITE_NAME}` },
      description,
      openGraph: { ...fallbackMetadata.openGraph, title, description, images: [{ url: image, width: 1200, height: 630, alt: title }] },
      twitter: { ...fallbackMetadata.twitter, title, description, images: [image] },
    };
  } catch {
    return fallbackMetadata;
  }
}

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
  const serverThemeVariables = getServerThemeVariables(initialSettings.themeColors);

  return (
    <html lang="fr" dir="ltr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {serverThemeVariables ? <style id="server-theme-variables">{serverThemeVariables}</style> : null}
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-primary-dark" suppressHydrationWarning>
        <PublicWebVitals />
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
