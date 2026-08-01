import { NextResponse } from 'next/server';
import { processDueAtlascomOrderExports } from '@/lib/atlascom-orders';
import { requireCronSecret } from '@/lib/cron-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;
  try {
    const results = await processDueAtlascomOrderExports();
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur.' }, { status: 500 });
  }
}
