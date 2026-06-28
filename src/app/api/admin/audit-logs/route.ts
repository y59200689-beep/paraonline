import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, logs: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { action, details } = await request.json();
    if (!action || !details) {
      return NextResponse.json({ success: false, error: 'action and details are required' }, { status: 400 });
    }

    const newLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      action,
      details,
      date: new Date().toISOString()
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        id: newLog.id,
        action: newLog.action,
        details: newLog.details,
        date: newLog.date
      });

    if (error) throw error;

    return NextResponse.json({ success: true, log: newLog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
