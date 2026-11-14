import { NextResponse } from 'next/server';
import { requireCronSecret } from '@/lib/cron-auth';
import { importWooImages } from '@/lib/woocommerce-image-sync';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;
  if (process.env.WOOCOMMERCE_IMAGE_SYNC_ENABLED !== 'true') {
    return NextResponse.json({ success: true, disabled: true });
  }
  try {
    const result = await importWooImages();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch {
    return NextResponse.json({ success: false, error: 'Import WooCommerce indisponible. Consultez les journaux.' }, { status: 503 });
  }
}
