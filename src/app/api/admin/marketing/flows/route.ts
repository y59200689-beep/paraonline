import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/session';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data: flows, error } = await supabase
      .from('marketing_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, flows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await authorizeAdminMutation();
    if (!authorization.authorized) return authorization.response;

    const { name, description, trigger_type, filters, actions, active } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Le nom du flux est requis.' }, { status: 400 });
    }

    const flowId = String(Date.now() + Math.floor(Math.random() * 1000));
    const newFlow = {
      id: flowId,
      name,
      description,
      trigger_type: trigger_type || 'rfm_segment_change',
      filters: filters || {},
      actions: actions || [],
      active: active !== undefined ? active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('marketing_flows')
      .insert(newFlow);

    if (error) throw error;

    return NextResponse.json({ success: true, flow: newFlow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
