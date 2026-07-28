import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/get-public-settings';

export async function GET() {
  try {
    const settings = await getPublicSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Public settings fetch error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
