import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import path from 'path';
import fs from 'fs';

// ─── Image manifest ────────────────────────────────────────────────────────
// Maps a stable key → relative path within /public and display metadata.
// Only files listed here can be replaced. No arbitrary writes.

export interface GalleryImage {
  key: string;
  label: string;
  group: 'heroes' | 'concerns' | 'brands' | 'categories' | 'bundles' | 'promo' | 'logo';
  /** Path relative to /public */
  filePath: string;
  /** URL path served by Next.js */
  url: string;
}

export const IMAGE_MANIFEST: GalleryImage[] = [
  // ── Heroes ──────────────────────────────────────────────────────────────
  { key: 'hero_bestsellers',       label: 'Hero 1 — Best-Sellers (Meilleures Ventes)', group: 'heroes', filePath: 'images/hero_bestsellers.webp', url: '/images/hero_bestsellers.webp' },
  { key: 'hero_summersale',        label: 'Hero 2 — Summer Sale (Offres d\'Été)',     group: 'heroes', filePath: 'images/hero_summersale.webp',  url: '/images/hero_summersale.webp' },
  { key: 'hero_weeklypromo',       label: 'Hero 3 — Promotion De La Semaine',        group: 'heroes', filePath: 'images/hero_weeklypromo_v2.webp', url: '/images/hero_weeklypromo_v2.webp' },
  { key: 'hero_newarrivals',       label: 'Hero 4 — Nouveaux Produits',              group: 'heroes', filePath: 'images/hero_newarrivals.webp', url: '/images/hero_newarrivals.webp' },
  { key: 'hero_hydra_essence',     label: 'Hero — Hydra Essence (Legacy)',           group: 'heroes', filePath: 'images/hero_hydra_essence.webp', url: '/images/hero_hydra_essence.webp' },
  { key: 'hero_rose_cream',        label: 'Hero — Rose Cream (Legacy)',              group: 'heroes', filePath: 'images/hero_rose_cream.webp',   url: '/images/hero_rose_cream.webp' },
  { key: 'hero_serum_dropper',     label: 'Hero — Serum Dropper (Legacy)',           group: 'heroes', filePath: 'images/hero_serum_dropper.webp', url: '/images/hero_serum_dropper.webp' },
  { key: 'hero_skincare_clinic',   label: 'Hero — Skincare Clinic (Legacy)',          group: 'heroes', filePath: 'images/hero_skincare_clinic.webp', url: '/images/hero_skincare_clinic.webp' },
  { key: 'lrp_hero_studio',        label: 'Hero — LRP Studio',                       group: 'heroes', filePath: 'images/lrp_hero_studio.png',    url: '/images/lrp_hero_studio.png' },

  // ── Concerns ─────────────────────────────────────────────────────────────
  { key: 'concern_acne',           label: 'Problème — Acné',             group: 'concerns',   filePath: 'images/concern_acne.webp',            url: '/images/concern_acne.webp' },
  { key: 'concern_dryness',        label: 'Problème — Sécheresse',       group: 'concerns',   filePath: 'images/concern_dryness.webp',         url: '/images/concern_dryness.webp' },
  { key: 'concern_spots',          label: 'Problème — Taches',           group: 'concerns',   filePath: 'images/concern_spots.webp',           url: '/images/concern_spots.webp' },
  { key: 'concern_wrinkles',       label: 'Problème — Rides',            group: 'concerns',   filePath: 'images/concern_wrinkles.webp',        url: '/images/concern_wrinkles.webp' },

  // ── Brands ───────────────────────────────────────────────────────────────
  { key: 'avene_showcase',         label: 'Marque — Avène',              group: 'brands',     filePath: 'images/avene_brand_showcase.png',     url: '/images/avene_brand_showcase.png' },
  { key: 'bioderma_showcase',      label: 'Marque — Bioderma',           group: 'brands',     filePath: 'images/bioderma_brand_showcase.png',  url: '/images/bioderma_brand_showcase.png' },
  { key: 'cerave_showcase',        label: 'Marque — CeraVe',             group: 'brands',     filePath: 'images/cerave_brand_showcase.png',    url: '/images/cerave_brand_showcase.png' },
  { key: 'eucerin_showcase',       label: 'Marque — Eucerin',            group: 'brands',     filePath: 'images/eucerin_brand_showcase.png',   url: '/images/eucerin_brand_showcase.png' },
  { key: 'lrp_showcase',           label: 'Marque — La Roche-Posay',     group: 'brands',     filePath: 'images/larochposay_brand_showcase.png', url: '/images/larochposay_brand_showcase.png' },
  { key: 'vichy_showcase',         label: 'Marque — Vichy',              group: 'brands',     filePath: 'images/vichy_brand_showcase.png',     url: '/images/vichy_brand_showcase.png' },

  // ── Categories ───────────────────────────────────────────────────────────
  { key: 'cat_visage',             label: 'Catégorie — Visage',          group: 'categories', filePath: 'images/categories/visage.webp',       url: '/images/categories/visage.webp' },
  { key: 'cat_corps',              label: 'Catégorie — Corps',            group: 'categories', filePath: 'images/categories/corps.webp',        url: '/images/categories/corps.webp' },
  { key: 'cat_cheveux',            label: 'Catégorie — Cheveux',          group: 'categories', filePath: 'images/categories/cheveux.webp',      url: '/images/categories/cheveux.webp' },
  { key: 'cat_solaire',            label: 'Catégorie — Solaire',          group: 'categories', filePath: 'images/categories/solaire.webp',      url: '/images/categories/solaire.webp' },
  { key: 'cat_bebe',               label: 'Catégorie — Bébé',             group: 'categories', filePath: 'images/categories/bebe.webp',         url: '/images/categories/bebe.webp' },
  { key: 'cat_homme',              label: 'Catégorie — Homme',            group: 'categories', filePath: 'images/categories/homme.webp',        url: '/images/categories/homme.webp' },
  { key: 'cat_maquillage',         label: 'Catégorie — Maquillage',       group: 'categories', filePath: 'images/categories/maquillage.webp',   url: '/images/categories/maquillage.webp' },
  { key: 'cat_complements',        label: 'Catégorie — Compléments',      group: 'categories', filePath: 'images/categories/complements.webp',  url: '/images/categories/complements.webp' },
  { key: 'cat_accessoires',        label: 'Catégorie — Accessoires',      group: 'categories', filePath: 'images/categories/accessoires.webp',  url: '/images/categories/accessoires.webp' },
  { key: 'cat_kbeauty',            label: 'Catégorie — K-Beauty',         group: 'categories', filePath: 'images/categories/kbeauty.webp',      url: '/images/categories/kbeauty.webp' },
  { key: 'cat_masques',            label: 'Catégorie — Masques',           group: 'categories', filePath: 'images/categories/masques.webp',      url: '/images/categories/masques.webp' },
  { key: 'cat_sport',              label: 'Catégorie — Sport',             group: 'categories', filePath: 'images/categories/sport.webp',        url: '/images/categories/sport.webp' },
  { key: 'cat_appareils',          label: 'Catégorie — Appareils',        group: 'categories', filePath: 'images/categories/appareils.webp',    url: '/images/categories/appareils.webp' },

  // ── Bundles ──────────────────────────────────────────────────────────────
  { key: 'cicaplast_bundle',       label: 'Bundle — Cicaplast',           group: 'bundles',    filePath: 'images/cicaplast_bundle.webp',        url: '/images/cicaplast_bundle.webp' },
  { key: 'dercos_bundle',          label: 'Bundle — Dercos Shampoo',      group: 'bundles',    filePath: 'images/dercos_shampoo_bundle.webp',   url: '/images/dercos_shampoo_bundle.webp' },
  { key: 'vichy_sunscreen_bundle', label: 'Bundle — Vichy Sunscreen',     group: 'bundles',    filePath: 'images/vichy_sunscreen_bundle.webp',  url: '/images/vichy_sunscreen_bundle.webp' },
  { key: 'flash_sale_product',     label: 'Bundle — Flash Sale',          group: 'bundles',    filePath: 'images/flash_sale_product.webp',      url: '/images/flash_sale_product.webp' },

  // ── Promo ────────────────────────────────────────────────────────────────
  { key: 'anthelios_banner',       label: 'Promo — Anthelios Banner',     group: 'promo',      filePath: 'images/anthelios_banner_card.png',    url: '/images/anthelios_banner_card.png' },
  { key: 'anthelios_packshot',     label: 'Promo — Anthelios Packshot',   group: 'promo',      filePath: 'images/anthelios_hero_packshot.png',  url: '/images/anthelios_hero_packshot.png' },
  { key: 'effaclar_packshot',      label: 'Promo — Effaclar Packshot',    group: 'promo',      filePath: 'images/effaclar_hero_packshot.png',   url: '/images/effaclar_hero_packshot.png' },
  { key: 'cicaplast_packshot',     label: 'Promo — Cicaplast Packshot',   group: 'promo',      filePath: 'images/cicaplast_hero_packshot.png',  url: '/images/cicaplast_hero_packshot.png' },
  { key: 'skin_diagnostic_scan',   label: 'Promo — Diagnostic Scan',      group: 'promo',      filePath: 'images/skin_diagnostic_scan.webp',    url: '/images/skin_diagnostic_scan.webp' },
  { key: 'skincare_brand_banner',  label: 'Promo — Brand Banner',         group: 'promo',      filePath: 'images/skincare_brand_banner.webp',   url: '/images/skincare_brand_banner.webp' },

  // ── Logo ─────────────────────────────────────────────────────────────────
  { key: 'logo',                   label: 'Logo Principal',               group: 'logo',       filePath: 'images/logo.webp',                   url: '/images/logo.webp' },
  { key: 'og_image',               label: 'OG Image (Social)',            group: 'logo',       filePath: 'images/og-image.jpg',                url: '/images/og-image.jpg' },
];

// ─── Allowed image MIME types ────────────────────────────────────────────────
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const MAGIC_BYTES: { magic: number[]; mime: string }[] = [
  { magic: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png' },
  { magic: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  { magic: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' },
];

function detectMime(buf: Buffer): string | null {
  for (const entry of MAGIC_BYTES) {
    if (entry.magic.every((b, i) => buf[i] === b)) return entry.mime;
  }
  return null;
}

function getFileSizeKb(filePath: string): number {
  try {
    const abs = path.join(process.cwd(), 'public', filePath);
    const stat = fs.statSync(abs);
    return Math.round(stat.size / 1024);
  } catch {
    return 0;
  }
}

// ─── GET — return manifest with live file sizes ──────────────────────────────
export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
  }

  const images = IMAGE_MANIFEST.map(img => ({
    ...img,
    sizeKb: getFileSizeKb(img.filePath),
  }));

  return NextResponse.json({ success: true, images });
}

// ─── POST — replace a file by key ────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const key = formData.get('key') as string;
    const file = formData.get('file') as File;

    if (!key || !file) {
      return NextResponse.json({ success: false, error: 'key and file are required' }, { status: 400 });
    }

    // Resolve the whitelisted entry
    const entry = IMAGE_MANIFEST.find(img => img.key === key);
    if (!entry) {
      return NextResponse.json({ success: false, error: `Unknown image key: ${key}` }, { status: 400 });
    }

    // Size limit: 8 MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Fichier trop volumineux (max 8 Mo)' }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Format non autorisé. Utilisez JPEG, PNG, WebP, GIF ou AVIF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isAvif = file.type === 'image/avif';
    const detectedMime = detectMime(buffer);
    if (!isAvif && !detectedMime) {
      return NextResponse.json({ success: false, error: 'Le contenu du fichier ne correspond pas à un format image valide.' }, { status: 400 });
    }

    // Write to the whitelisted path (overwrite in place)
    const absPath = path.join(process.cwd(), 'public', entry.filePath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, buffer);

    return NextResponse.json({
      success: true,
      url: entry.url,
      sizeKb: Math.round(buffer.length / 1024),
    });
  } catch (err: any) {
    console.error('[gallery] replace error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
