import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Veuillez vous connecter.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const offsetDays = parseInt(searchParams.get('days') || '45'); // Default target refilling offset

    const now = new Date();
    const minDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago max
    const maxDate = new Date(now.getTime() - (offsetDays - 5) * 24 * 60 * 60 * 1000); // target date minus 5 days buffer

    // Fetch all non-cancelled orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !orders) {
      throw error || new Error('Failed to query orders');
    }

    // Filter orders locally to ensure edge-compatibility and mock-DB support
    const filteredOrders = orders.filter((o: any) => {
      const status = (o.status || '').toLowerCase();
      if (status.includes('annul') || status === 'cancelled' || status === 'failed') return false;
      const orderDate = new Date(o.created_at || o.date || Date.now());
      return orderDate >= minDate && orderDate <= maxDate;
    });

    // Parse order items and map them to users needing restocks
    const remindersMap: Record<string, {
      customerName: string;
      phone: string;
      productId: number;
      productTitle: string;
      orderDate: string;
      daysElapsed: number;
      suggestedExhaustionDays: number;
    }> = {};

    filteredOrders.forEach((order: any) => {
      const customerName = order.customer_name;
      const phone = order.phone_number;
      const orderDate = new Date(order.created_at || order.date || Date.now());
      const daysElapsed = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      (order.items || []).forEach((item: any) => {
        const itemCategory = (item.category || '').toLowerCase();
        // Determine recommended replenishment duration
        let targetExhaustion = 45; // default
        if (itemCategory.includes('protect') || itemCategory.includes('solaire') || itemCategory.includes('sun')) {
          targetExhaustion = 30; // Sunscreens run out faster
        } else if (itemCategory.includes('cleanse') || itemCategory.includes('nettoyant')) {
          targetExhaustion = 60; // Cleansers last longer
        }

        // Check if elapsed days is in the buffer zone (targetExhaustion - 5 to targetExhaustion + 15)
        if (daysElapsed >= (targetExhaustion - 5) && daysElapsed <= (targetExhaustion + 15)) {
          const key = `${phone}_${item.id}`;
          if (!remindersMap[key]) {
            remindersMap[key] = {
              customerName,
              phone,
              productId: item.id,
              productTitle: item.title,
              orderDate: orderDate.toISOString(),
              daysElapsed,
              suggestedExhaustionDays: targetExhaustion
            };
          }
        }
      });
    });

    const remindersList = Object.values(remindersMap).sort((a, b) => b.daysElapsed - a.daysElapsed);

    return NextResponse.json({
      success: true,
      reminders: remindersList
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
