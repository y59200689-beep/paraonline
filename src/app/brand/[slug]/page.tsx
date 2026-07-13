import { PRODUCTS_DB, Product } from '@/lib/data';
import { BRANDS_DATA, slugify, getBrandBySlug } from '@/lib/brands';
import BrandClient from './BrandClient';

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  return BRANDS_DATA.map((brand) => ({
    slug: slugify(brand.name),
  }));
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
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
