import { NextResponse } from 'next/server';
import { verifyAdminSession, generateMfaSecret } from '@/lib/session';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const secret = generateMfaSecret();
    const issuer = 'Para Officinal S.A';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(session.username)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
