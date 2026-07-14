import { NextResponse } from 'next/server';
import { trackError } from '@/lib/telemetry';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limit: 20 telemetry reports per IP per minute to prevent database flooding
    const ip = getClientIp(request);
    const { allowed } = await rateLimit(`telemetry:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many reports' }, { status: 429 });
    }

    const body = await request.json();
    const { message, error, context } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const mergedContext = {
      ...(context || {}),
      userAgent: request.headers.get('user-agent'),
      ip,
    };

    await trackError(message, error, mergedContext);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Telemetry API endpoint error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
