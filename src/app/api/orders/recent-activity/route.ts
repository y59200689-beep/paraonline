import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch last 10 non-cancelled orders
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, city, items, created_at')
      .not('status', 'eq', 'Cancelled')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const recentOrders = (data || [])
      .filter((order: any) => {
        const name = (order.customer_name || '').toLowerCase();
        if (name.includes('test')) return false;

        const diffMs = Date.now() - new Date(order.created_at).getTime();
        return diffMs < 24 * 60 * 60 * 1000; // Only show orders from the last 24 hours
      })
      .map((order: any) => {
        // Anonymize name (take first word/name, or fallback to 'Un client')
        const firstName = order.customer_name 
          ? order.customer_name.trim().split(' ')[0] 
          : 'Un client';

        // Get first item name
        const firstItem = order.items && order.items[0] 
          ? order.items[0].title 
          : 'un produit';

        // Compute relative time string (e.g., "il y a 5 min")
        const diffMs = Date.now() - new Date(order.created_at).getTime();
        const diffMins = Math.max(1, Math.floor(diffMs / 60000));
        let timeFr = `il y a ${diffMins} min`;
        let timeAr = `منذ ${diffMins} دقيقة`;
        
        if (diffMins >= 60) {
          const diffHours = Math.floor(diffMins / 60);
          timeFr = `il y a ${diffHours} h`;
          timeAr = `منذ ${diffHours} ساعة`;
        }

        return {
          name: firstName,
          city: order.city || 'Maroc',
          product: firstItem,
          timeFr,
          timeAr
        };
      });

    return NextResponse.json({ success: true, orders: recentOrders });
  } catch (error: any) {
    console.error("Recent activity error:", error);
    return NextResponse.json({ success: false, orders: [] });
  }
}
