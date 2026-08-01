import { NextResponse } from 'next/server';
import { processDueAtlascomOrderExports } from '@/lib/atlascom-orders';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)) return NextResponse.json({ success: false, error: 'Non autorisé.' }, { status: 401 });
  try {
    const results = await processDueAtlascomOrderExports();
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur.' }, { status: 500 });
  }
}
