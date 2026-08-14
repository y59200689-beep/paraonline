import { NextResponse } from 'next/server';
import { authorizeAdminMutation } from '@/lib/admin-authorization';
import { supabaseAdmin as supabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authorization = await authorizeAdminMutation();
    if (!authorization.authorized) return authorization.response;

    const { id } = await context.params;
    const body = await request.json();
    
    const { name, description, trigger_type, filters, actions, active } = body;

    const { error } = await supabase
      .from('marketing_flows')
      .update({
        name,
        description,
        trigger_type,
        filters,
        actions,
        active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    const { data: updatedFlow } = await supabase
      .from('marketing_flows')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json({ success: true, flow: updatedFlow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authorization = await authorizeAdminMutation();
    if (!authorization.authorized) return authorization.response;

    const { id } = await context.params;

    const { error } = await supabase
      .from('marketing_flows')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
