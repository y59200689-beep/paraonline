import { NextResponse } from 'next/server';

const MIN_CRON_SECRET_LENGTH = 32;

/**
 * Cron routes are privileged server jobs. They must never be callable without
 * the shared secret that Vercel (or the external scheduler) sends for each run.
 */
export function requireCronSecret(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');

  if (!secret || secret.length < MIN_CRON_SECRET_LENGTH || authorization !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, error: 'Non autorise.' },
      { status: 401 }
    );
  }

  return null;
}
