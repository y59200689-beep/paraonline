import { NextResponse } from 'next/server';
import { getPixels } from '@/lib/get-pixels';

export async function GET() {
  try {
    return NextResponse.json({ pixels: await getPixels() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Pixels unavailable' }, { status: 503 });
  }
}
