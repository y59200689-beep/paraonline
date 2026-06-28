import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Allowed image MIME types (browser-provided — first-pass check)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

// Magic bytes for image formats (server-side verification — cannot be spoofed)
const MAGIC_BYTES: { magic: number[]; mask?: number[]; mime: string }[] = [
  { magic: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png' },
  { magic: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  { magic: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' }, // RIFF header (WebP also has WEBP at offset 8)
];

function detectMimeFromBuffer(buf: Buffer): string | null {
  for (const entry of MAGIC_BYTES) {
    const slice = buf.subarray(0, entry.magic.length);
    if (entry.magic.every((byte, i) => slice[i] === byte)) return entry.mime;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // --- Security: File size limit (5 MB) ---
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large (max 5 MB)' }, { status: 400 });
    }

    // --- Security: MIME type allowlist (browser-reported) ---
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed. Only images (JPEG, PNG, WebP, GIF, AVIF) are accepted.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- Security: Magic byte check (server-side, cannot be spoofed by renaming) ---
    const detectedMime = detectMimeFromBuffer(buffer);
    // AVIF has no simple magic byte pattern — skip magic check for AVIF but enforce extension
    const isAvif = file.type === 'image/avif';
    if (!isAvif && !detectedMime) {
      return NextResponse.json({ success: false, error: 'File content does not match an allowed image format.' }, { status: 400 });
    }

    // Use the detected MIME (not the user-provided one) as the content type
    const contentType = detectedMime || file.type;

    // Sanitize filename and force an image extension
    const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
    const filename = `${Date.now()}_${cleanFileName}.${ext}`;

    // Upload to Supabase bucket 'products'
    const { error } = await supabase.storage
      .from('products')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000',
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
