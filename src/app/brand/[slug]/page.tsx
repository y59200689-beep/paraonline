import { PRODUCTS_DB, Product } from '@/lib/data';
import { BRANDS_DATA, slugify, getBrandBySlug } from '@/lib/brands';
import BrandClient from './BrandClient';
import LaRochePosayCustomPage from '@/components/LaRochePosayCustomPage';
import type { Metadata } from 'next';

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  return BRANDS_DATA.map((brand) => ({
    slug: slugify(brand.name),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  const name = brand?.name || slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const description = slug === 'la-roche-posay'
    ? 'Découvrez les gammes La Roche-Posay par préoccupation et trouvez les soins disponibles chez Para Officinal au Maroc.'
    : brand?.descriptionFr || `Découvrez les produits ${name} disponibles chez Para Officinal.`;

  return {
    title: name,
    description,
    alternates: { canonical: `/brand/${slug}` },
    openGraph: {
      title: `${name} — soins disponibles au Maroc`,
      description,
      images: slug === 'la-roche-posay' ? ['/images/larochposay_brand_showcase.webp'] : undefined,
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ── Custom branded pages ──────────────────────────────────────────────
  if (slug === 'la-roche-posay') {
    return <LaRochePosayCustomPage />;
  }

  // ── Generic brand page ────────────────────────────────────────────────
  // Resolve the brand config
  let brand = getBrandBySlug(slug);
  
  // If not pre-configured, build a fallback dynamically so the page doesn't 404
  if (!brand) {
    const displayName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    brand = {
      name: displayName,
      domain: `${slug}.com`,
      taglineFr: `Soins dermatologiques professionnels par ${displayName}`,
      taglineAr: `العناية المهنية بالبشرة من ${displayName}`,
      descriptionFr: `Découvrez la gamme complète de soins professionnels conçue par ${displayName} pour répondre aux besoins spécifiques de votre peau.`,
      descriptionAr: `اكتشفوا المجموعة الكاملة من مستحضرات العناية بالبشرة المطورة من ${displayName} لتلبية احتياجات بشرتكم الخاصة.`,
    };
  }

  // Provide static seed products so the page isn't empty on first paint.
  // BrandClient will replace these with live Supabase data once mounted.
  const seedProducts: Product[] = PRODUCTS_DB.filter((p: Product) => {
    if (!p.vendor) return false;
    const v = p.vendor.toLowerCase();
    const bName = brand!.name.toLowerCase();
    if (v === bName) return true;
    if (slugify(p.vendor) === slug) return true;
    if (v.startsWith(bName)) return true;
    return false;
  });

  return <BrandClient brand={brand} initialProducts={seedProducts} />;
}
