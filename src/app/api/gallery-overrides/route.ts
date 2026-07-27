import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// ─── Public read-only endpoint: returns per-key URLs with disk-mtime cache busters ──
// No admin auth required — only exposes image keys and their public URLs.
export async function GET() {
  try {
    const overridesPath = path.join(process.cwd(), 'gallery-overrides.json');
    if (!fs.existsSync(overridesPath)) {
      return NextResponse.json({ success: true, overrides: {} });
    }
    const raw = fs.readFileSync(overridesPath, 'utf-8');
    const overrides: Record<string, string> = JSON.parse(raw);
    return NextResponse.json({ success: true, overrides });
  } catch (e: any) {
    return NextResponse.json({ success: false, overrides: {}, error: e.message });
  }
}
