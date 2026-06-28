import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paraofficinal.ma';

  return {
    rules: [
      {
        // Allow Googlebot and all crawlers to index public storefront
        userAgent: '*',
        allow: ['/', '/products', '/politiques'],
        disallow: [
          '/admin',        // Admin panel — never index
          '/api/',         // API routes — not user-facing content
          '/checkout',     // Checkout + success/failure pages
          '/customer',     // Auth-gated customer portal
          '/audit',        // Internal audit log
          '/_next/',       // Next.js internals
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
