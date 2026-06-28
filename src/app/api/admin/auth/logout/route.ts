import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });
  
  // Set expired session cookie to clear it
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  return response;
}
