import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { canManageBrands } from '@/lib/permissions';
import { slugify } from '@/lib/brands';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAGIC_BYTES: { magic: number[]; mime: string }[] = [
  { magic: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png' },
  { magic: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  { magic: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' },
];

function detectMime(buf: Buffer): string | null {
  for (const entry of MAGIC_BYTES) {
    if (entry.magic.every((byte, i) => buf[i] === byte)) return entry.mime;
  }
  return null;
}

export async function POST(req: NextRequest) {
  // --- Auth ---
  const authorization = await authorizeAdminMutation({ allow: canManageBrands });
  if (!authorization.authorized) return authorization.response;
  const operator = authorization.operator;

  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  // --- Load brands that have NO logo ---
  const { data: brandsWithoutLogo, error: dbErr } = await supabaseAdmin
    .from('cms_brands')
    .select('id, name, slug, logo_url')
    .or('logo_url.is.null,logo_url.eq.');

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Build slug → brand map (only brands without a logo)
  const brandMap = new Map<string, { id: string; name: string }>();
  for (const brand of brandsWithoutLogo ?? []) {
    brandMap.set(brand.slug, { id: brand.id, name: brand.name });
  }

  const updated: string[] = [];
  const skipped: string[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const file of files) {
    // Derive slug from filename stem
    const stem = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    const slug = slugify(stem);
    const brand = brandMap.get(slug);

    if (!brand) {
      skipped.push(file.name);
      continue;
    }

    // Security: size limit 10 MB
    if (file.size > 10 * 1024 * 1024) {
      errors.push({ name: file.name, error: 'Fichier trop volumineux (max 10 Mo).' });
      continue;
    }

    // Security: MIME allowlist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      errors.push({ name: file.name, error: 'Type de fichier non autorisé.' });
      continue;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Security: magic bytes
    const isAvif = file.type === 'image/avif';
    if (!isAvif && !detectMime(buffer)) {
      errors.push({ name: file.name, error: 'Contenu du fichier invalide.' });
      continue;
    }

    // Convert to WebP
    let uploadBuffer = buffer;
    let contentType = 'image/webp';
    let ext = 'webp';
    try {
      uploadBuffer = await sharp(buffer).webp({ quality: 82, effort: 4 }).toBuffer();
    } catch {
      const detected = detectMime(buffer) || file.type;
      contentType = detected;
      ext = detected.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    }

    const cleanStem = stem.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
    const filename = `${Date.now()}_${cleanStem}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('products')
      .upload(filename, uploadBuffer, { contentType, upsert: true, cacheControl: '31536000' });

    if (uploadErr) {
      errors.push({ name: file.name, error: uploadErr.message });
      continue;
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('products').getPublicUrl(filename);
    const logoUrl = publicUrlData.publicUrl;

    // PATCH brand
    const { error: patchErr } = await supabaseAdmin
      .from('cms_brands')
      .update({ logo_url: logoUrl, updated_by: operator.username })
      .eq('id', brand.id);

    if (patchErr) {
      errors.push({ name: file.name, error: patchErr.message });
      continue;
    }

    updated.push(brand.name);
  }

  return NextResponse.json({ updated, skipped, errors });
}
