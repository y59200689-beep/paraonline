import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// ─── Image manifest ────────────────────────────────────────────────────────
// Maps a stable key → relative path within /public and display metadata.
// Every single image asset in the project is registered here as WebP.

export interface GalleryImage {
  key: string;
  label: string;
  group: 'heroes' | 'concerns' | 'brands' | 'categories' | 'bundles' | 'promo' | 'logo' | 'products';
  /** Path relative to /public */
  filePath: string;
  /** URL path served by Next.js */
  url: string;
  sizeKb?: number;
  width?: number;
  height?: number;
  dimensions?: string;
}

export const IMAGE_MANIFEST: GalleryImage[] = [
  // ── Heroes ──────────────────────────────────────────────────────────────
  { key: 'hero_bestsellers',       label: 'Hero 1 — Best-Sellers (Meilleures Ventes)', group: 'heroes', filePath: 'images/hero_bestsellers.webp', url: '/images/hero_bestsellers.webp' },
  { key: 'hero_summersale',        label: 'Hero 2 — Summer Sale (Offres d\'Été)',     group: 'heroes', filePath: 'images/hero_summersale.webp',  url: '/images/hero_summersale.webp' },
  { key: 'hero_weeklypromo',       label: 'Hero 3 — Promotion De La Semaine',        group: 'heroes', filePath: 'images/hero_weeklypromo_v2.webp', url: '/images/hero_weeklypromo_v2.webp' },
  { key: 'hero_newarrivals',       label: 'Hero 4 — Nouveaux Produits',              group: 'heroes', filePath: 'images/hero_newarrivals.webp', url: '/images/hero_newarrivals.webp' },
  { key: 'lrp_hero_studio',        label: 'Hero — LRP Studio',                       group: 'heroes', filePath: 'images/lrp_hero_studio.webp',   url: '/images/lrp_hero_studio.webp' },

  // ── Concerns ─────────────────────────────────────────────────────────────
  { key: 'concern_acne',           label: 'Problème — Acné & Imperfections',             group: 'concerns',   filePath: 'images/concern_acne.webp',            url: '/images/concern_acne.webp' },
  { key: 'concern_spots',          label: 'Problème — Hyperpigmentation & Taches',       group: 'concerns',   filePath: 'images/concern_spots.webp',           url: '/images/concern_spots.webp' },
  { key: 'concern_wrinkles',       label: 'Problème — Anti-Âge & Rides',                 group: 'concerns',   filePath: 'images/concern_wrinkles.webp',        url: '/images/concern_wrinkles.webp' },
  { key: 'concern_dryness',        label: 'Problème — Hydratation & Peaux Sèches',       group: 'concerns',   filePath: 'images/concern_dryness.webp',         url: '/images/concern_dryness.webp' },
  { key: 'concern_redness',        label: 'Problème — Apaisant & Rougeurs',             group: 'concerns',   filePath: 'images/concern_redness.webp',         url: '/images/concern_redness.webp' },
  { key: 'concern_solaire',        label: 'Problème — Solaire & Protection UV',          group: 'concerns',   filePath: 'images/concern_solaire.webp',         url: '/images/concern_solaire.webp' },

  // ── Brands ───────────────────────────────────────────────────────────────
  { key: 'avene_showcase',         label: 'Marque — Avène Showcase',     group: 'brands',     filePath: 'images/avene_brand_showcase.webp',     url: '/images/avene_brand_showcase.webp' },
  { key: 'bioderma_showcase',      label: 'Marque — Bioderma Showcase',  group: 'brands',     filePath: 'images/bioderma_brand_showcase.webp',  url: '/images/bioderma_brand_showcase.webp' },
  { key: 'cerave_showcase',        label: 'Marque — CeraVe Showcase',    group: 'brands',     filePath: 'images/cerave_showcase_banner.webp',    url: '/images/cerave_showcase_banner.webp' },
  { key: 'eucerin_showcase',       label: 'Marque — Eucerin Showcase',   group: 'brands',     filePath: 'images/eucerin_brand_showcase.webp',   url: '/images/eucerin_brand_showcase.webp' },
  { key: 'lrp_showcase',           label: 'Marque — La Roche-Posay Showcase', group: 'brands', filePath: 'images/larochposay_brand_showcase.webp', url: '/images/larochposay_brand_showcase.webp' },
  { key: 'vichy_showcase',         label: 'Marque — Vichy Showcase',     group: 'brands',     filePath: 'images/vichy_brand_showcase.webp',     url: '/images/vichy_brand_showcase.webp' },
  { key: 'brand_laroche_logo',     label: 'Marque — La Roche-Posay Logo', group: 'brands',    filePath: 'images/brands/laroche.webp',           url: '/images/brands/laroche.webp' },
  { key: 'brand_vichy_logo',       label: 'Marque — Vichy Logo',         group: 'brands',     filePath: 'images/brands/vichy.webp',             url: '/images/brands/vichy.webp' },

  // ── Categories ───────────────────────────────────────────────────────────
  { key: 'cat_all',                 label: 'Catégorie — Grandes Réductions', group: 'categories', filePath: 'images/categories/all.webp',       url: '/images/categories/all.webp' },
  { key: 'cat_offers',              label: 'Catégorie — Meilleures Ventes',  group: 'categories', filePath: 'images/categories/offers.webp',    url: '/images/categories/offers.webp' },
  { key: 'cat_giftbox',             label: 'Catégorie — Coffrets Cadeaux',   group: 'categories', filePath: 'images/categories/giftbox.webp',   url: '/images/categories/giftbox.webp' },
  { key: 'cat_solaire',            label: 'Catégorie — Solaires',           group: 'categories', filePath: 'images/categories/solaire.webp',   url: '/images/categories/solaire.webp' },
  { key: 'cat_visage',             label: 'Catégorie — Visage',             group: 'categories', filePath: 'images/categories/visage.webp',    url: '/images/categories/visage.webp' },
  { key: 'cat_cheveux',            label: 'Catégorie — Cheveux',            group: 'categories', filePath: 'images/categories/cheveux.webp',   url: '/images/categories/cheveux.webp' },
  { key: 'cat_corps',              label: 'Catégorie — Corps',              group: 'categories', filePath: 'images/categories/corps.webp',     url: '/images/categories/corps.webp' },
  { key: 'cat_appareils',          label: 'Catégorie — Accessoires',        group: 'categories', filePath: 'images/categories/appareils.webp', url: '/images/categories/appareils.webp' },
  { key: 'cat_complements',        label: 'Catégorie — Compléments',        group: 'categories', filePath: 'images/categories/complements.webp', url: '/images/categories/complements.webp' },
  { key: 'cat_maquillage',         label: 'Catégorie — Maquillage',         group: 'categories', filePath: 'images/categories/maquillage.webp', url: '/images/categories/maquillage.webp' },
  { key: 'cat_sport',              label: 'Catégorie — Sport',              group: 'categories', filePath: 'images/categories/sport.webp',     url: '/images/categories/sport.webp' },
  { key: 'cat_masques',            label: 'Catégorie — Masques & Patches',  group: 'categories', filePath: 'images/categories/masques.webp',   url: '/images/categories/masques.webp' },
  { key: 'cat_homme',              label: 'Catégorie — Homme',              group: 'categories', filePath: 'images/categories/homme.webp',     url: '/images/categories/homme.webp' },
  { key: 'cat_bebe',               label: 'Catégorie — Maternité & Bébé',   group: 'categories', filePath: 'images/categories/bebe.webp',      url: '/images/categories/bebe.webp' },

  // ── Bundles ──────────────────────────────────────────────────────────────
  { key: 'cicaplast_bundle',       label: 'Bundle — Cicaplast',           group: 'bundles',    filePath: 'images/cicaplast_bundle.webp',        url: '/images/cicaplast_bundle.webp' },
  { key: 'dercos_bundle',          label: 'Bundle — Dercos Shampoo',      group: 'bundles',    filePath: 'images/dercos_shampoo_bundle.webp',   url: '/images/dercos_shampoo_bundle.webp' },
  { key: 'vichy_sunscreen_bundle', label: 'Bundle — Vichy Sunscreen',     group: 'bundles',    filePath: 'images/vichy_sunscreen_bundle.webp',  url: '/images/vichy_sunscreen_bundle.webp' },
  { key: 'flash_sale_product',     label: 'Bundle — Flash Sale',          group: 'bundles',    filePath: 'images/flash_sale_product.webp',      url: '/images/flash_sale_product.webp' },

  // ── Promo ────────────────────────────────────────────────────────────────
  { key: 'anthelios_banner',       label: 'Promo — Anthelios Banner',     group: 'promo',      filePath: 'images/anthelios_banner_card.webp',    url: '/images/anthelios_banner_card.webp' },
  { key: 'anthelios_packshot',     label: 'Promo — Anthelios Packshot',   group: 'promo',      filePath: 'images/anthelios_hero_packshot.webp',  url: '/images/anthelios_hero_packshot.webp' },
  { key: 'effaclar_packshot',      label: 'Promo — Effaclar Packshot',    group: 'promo',      filePath: 'images/effaclar_hero_packshot.webp',   url: '/images/effaclar_hero_packshot.webp' },
  { key: 'cicaplast_packshot',     label: 'Promo — Cicaplast Packshot',   group: 'promo',      filePath: 'images/cicaplast_hero_packshot.webp',  url: '/images/cicaplast_hero_packshot.webp' },
  { key: 'skin_diagnostic_scan',   label: 'Promo — Diagnostic Scan',      group: 'promo',      filePath: 'images/skin_diagnostic_scan.webp',    url: '/images/skin_diagnostic_scan.webp' },
  { key: 'skincare_brand_banner',  label: 'Promo — Brand Banner',         group: 'promo',      filePath: 'images/skincare_brand_banner.webp',   url: '/images/skincare_brand_banner.webp' },
  { key: 'card_antiage',           label: 'Promo Card — Anti-Âge (Fond)', group: 'promo',      filePath: 'images/promo/card_antiage.webp',       url: '/images/promo/card_antiage.webp' },
  { key: 'card_baby',              label: 'Promo Card — Maternité & Bébé (Fond)', group: 'promo', filePath: 'images/promo/card_baby.webp',          url: '/images/promo/card_baby.webp' },
  { key: 'card_sun',               label: 'Promo Card — Solaires (Fond)', group: 'promo',  filePath: 'images/promo/card_sun.webp',           url: '/images/promo/card_sun.webp' },
  { key: 'overlay_baby',           label: 'Promo Produit — Flacon Bébé (Card 1)', group: 'promo', filePath: 'images/promo/overlay_baby.webp', url: '/images/promo/overlay_baby.webp' },
  { key: 'overlay_sun',            label: 'Promo Produit — Tube Solaire (Card 2)', group: 'promo', filePath: 'images/promo/overlay_sun.webp', url: '/images/promo/overlay_sun.webp' },
  { key: 'overlay_serum',          label: 'Promo Produit — Flacon Sérum (Card 3)', group: 'promo', filePath: 'images/promo/overlay_serum.webp', url: '/images/promo/overlay_serum.webp' },

  // ── Logo & Meta ──────────────────────────────────────────────────────────
  { key: 'logo',                   label: 'Logo Principal',               group: 'logo',       filePath: 'images/logo.webp',                   url: '/images/logo.webp' },
  { key: 'og_image',               label: 'OG Image (Social)',            group: 'logo',       filePath: 'og-image.webp',                      url: '/og-image.webp' },
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

interface ImageFileInfo {
  sizeKb: number;
  width: number;
  height: number;
  dimensions: string;
}

async function getImageFileInfo(filePath: string): Promise<ImageFileInfo> {
  try {
    const abs = path.join(process.cwd(), 'public', filePath);
    if (!fs.existsSync(abs)) return { sizeKb: 0, width: 0, height: 0, dimensions: '0 × 0 px' };
    const stat = fs.statSync(abs);
    const sizeKb = Math.round(stat.size / 1024);
    
    const meta = await sharp(abs).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    const dimensions = width && height ? `${width} × ${height} px` : '0 × 0 px';

    return { sizeKb, width, height, dimensions };
  } catch {
    return { sizeKb: 0, width: 0, height: 0, dimensions: '0 × 0 px' };
  }
}

// ─── Helpers for database and file-based gallery overrides ──────────────────
const OVERRIDES_FILE = path.join(process.cwd(), 'gallery-overrides.json');

function readOverrides(): Record<string, string> {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      return JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeOverrides(overrides: Record<string, string>): void {
  try {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), 'utf-8');
  } catch (e) {
    console.error('[gallery] Failed to write gallery-overrides.json:', e);
  }
}

async function fetchDbOverrides(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 1)
      .single();
    return data?.value?.galleryOverrides || {};
  } catch (e) {
    return {};
  }
}

async function saveDbOverride(key: string, url: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 1)
      .single();
    const currentVal = data?.value || {};
    const galleryOverrides = { ...(currentVal.galleryOverrides || {}), [key]: url };
    await supabase
      .from('settings')
      .upsert({ id: 1, value: { ...currentVal, galleryOverrides } }, { onConflict: 'id' });
  } catch (e) {
    console.error('[gallery] Failed to update DB settings:', e);
  }
}

// ─── GET — return manifest with live file sizes & dimensions ──────────────────
export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
  }

  // Combine DB overrides (Vercel cloud) and file overrides (local dev)
  const dbOverrides = await fetchDbOverrides();
  const fileOverrides = readOverrides();
  const mergedOverrides = { ...dbOverrides, ...fileOverrides };

  const manifestImages = await Promise.all(
    IMAGE_MANIFEST.map(async (img) => {
      const info = await getImageFileInfo(img.filePath);
      // Override takes priority (saved by POST). Fall back to manifest URL.
      let imgUrl = mergedOverrides[img.key] || img.url;

      // If local file exists and URL is relative, append disk mtime as cache buster
      // so the browser always fetches the newest version after a replacement.
      if (info.sizeKb > 0 && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
        const abs = path.join(process.cwd(), 'public', img.filePath);
        try {
          const stat = fs.statSync(abs);
          const cleanUrl = imgUrl.split('?')[0];
          imgUrl = `${cleanUrl}?v=${Math.round(stat.mtimeMs)}`;
        } catch {}
      }

      return {
        ...img,
        url: imgUrl,
        sizeKb: info.sizeKb,
        width: info.width,
        height: info.height,
        dimensions: info.dimensions,
      };
    })
  );

  // Dynamically scan public/uploads/ for catalog product uploads
  let uploadImages: GalleryImage[] = [];
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadFiles = fs.readdirSync(uploadsDir);
      uploadImages = await Promise.all(
        uploadFiles
          .filter(f => !f.startsWith('.') && /\.(webp|png|jpg|jpeg)$/i.test(f))
          .map(async f => {
            const relPath = `uploads/${f}`;
            const info = await getImageFileInfo(relPath);
            const cleanName = f
              .replace(/^\d+_/, '')
              .replace(/_[a-f0-9-]{8,}.*/, '')
              .replace(/_/g, ' ')
              .replace(/\.(webp|png|jpg|jpeg)$/i, '')
              .trim();
            const abs = path.join(process.cwd(), 'public', relPath);
            let mtime = Date.now();
            try { mtime = Math.round(fs.statSync(abs).mtimeMs); } catch {}
            return {
              key: `upload_${f}`,
              label: `Produit — ${cleanName || f}`,
              group: 'products' as const,
              filePath: relPath,
              url: `/${relPath}?v=${mtime}`,
              sizeKb: info.sizeKb,
              width: info.width,
              height: info.height,
              dimensions: info.dimensions,
            };
          })
      );
    }
  } catch (e) {
    console.warn('[gallery] Failed to scan public/uploads:', e);
  }

  return NextResponse.json({ success: true, images: [...manifestImages, ...uploadImages] });
}

// ─── POST — replace a file by key with automatic WebP conversion & dimension extraction ───
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

    // Resolve the entry from manifest or dynamic upload scanner
    let entry = IMAGE_MANIFEST.find(img => img.key === key);
    if (!entry && key.startsWith('upload_')) {
      const filename = key.replace('upload_', '');
      const relPath = `uploads/${filename}`;
      entry = {
        key,
        label: `Produit — ${filename}`,
        group: 'products',
        filePath: relPath,
        url: `/${relPath}`,
      };
    }

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

    // Automatically convert ANY incoming uploaded image to WebP using Sharp
    let uploadBuffer = buffer;
    try {
      uploadBuffer = await sharp(buffer)
        .webp({ quality: 90, effort: 4 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn('[gallery] Sharp WebP conversion failed, using original buffer:', sharpErr);
    }

    let finalUrl = `/${entry.filePath}?v=${Date.now()}`;

    // 1. Attempt local filesystem write (works in local dev & persistent servers)
    try {
      const absPath = path.join(process.cwd(), 'public', entry.filePath);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, uploadBuffer);
      finalUrl = `/${entry.filePath}?v=${Date.now()}`;
    } catch (fsErr: any) {
      console.warn('[gallery] Local filesystem is read-only (e.g. Vercel deployment). Falling back to cloud storage/Data URL:', fsErr?.message);
      
      // 2. Fallback for serverless read-only platforms (Vercel): Supabase Storage or Base64 Data URL
      try {
        const storagePath = `gallery_${entry.key}.webp`;
        const { error: sbErr } = await supabase.storage
          .from('products')
          .upload(storagePath, uploadBuffer, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: '3600',
          });

        if (!sbErr) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            finalUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
          }
        } else {
          console.warn('[gallery] Supabase fallback upload error:', sbErr);
          finalUrl = `data:image/webp;base64,${uploadBuffer.toString('base64')}`;
        }
      } catch {
        finalUrl = `data:image/webp;base64,${uploadBuffer.toString('base64')}`;
      }
    }

    // Persist override to both Supabase DB (for Vercel serverless) and gallery-overrides.json (for local dev)
    try {
      const overrides = readOverrides();
      overrides[entry.key] = finalUrl;
      writeOverrides(overrides);
    } catch (fileErr: any) {
      console.error('[gallery POST] Failed to write gallery-overrides.json:', fileErr?.message || fileErr);
    }

    try {
      await saveDbOverride(entry.key, finalUrl);
    } catch (dbErr: any) {
      console.error('[gallery POST] Failed to write DB override:', dbErr?.message || dbErr);
    }

    // Extract metadata of saved WebP image
    let width = 0;
    let height = 0;
    try {
      const meta = await sharp(uploadBuffer).metadata();
      width = meta.width || 0;
      height = meta.height || 0;
    } catch {}
    const dimensions = width && height ? `${width} × ${height} px` : '0 × 0 px';

    return NextResponse.json({
      success: true,
      url: finalUrl,
      sizeKb: Math.round(uploadBuffer.length / 1024),
      width,
      height,
      dimensions,
    });
  } catch (err: any) {
    console.error('[gallery] replace error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
