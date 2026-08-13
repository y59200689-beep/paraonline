import { NextResponse } from 'next/server';
import { getMergedPublicSettings } from '@/lib/cms-global-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Server error';
}

export async function GET() {
  try {
    const settings = await getMergedPublicSettings();
    return NextResponse.json(
      { success: true, settings },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: unknown) {
    console.error('Public settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
