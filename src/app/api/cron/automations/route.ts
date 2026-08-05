import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { cleanPhoneNumber, sendWhatsAppMessage } from '@/lib/whatsapp';
import { requireCronSecret } from '@/lib/cron-auth';

// Helper: Calculate RFM segments server-side for all customers
function computeCrmCustomers(orders: any[], profiles: any[]) {
  const customersMap: Record<string, {
    phone: string;
    name: string;
    successfulOrders: any[];
    totalSpend: number;
    lastOrderDate: Date;
  }> = {};

  const now = new Date();

  // 1. Group orders by customer phone
  orders.forEach(order => {
    const phone = order.phone_number ? order.phone_number.trim() : '';
    if (!phone) return;
    
    const status = (order.status || '').toLowerCase();
    if (status.includes('annul') || status === 'cancelled') {
      return;
    }

    const orderDate = new Date(order.created_at || order.date || now);

    if (!customersMap[phone]) {
      customersMap[phone] = {
        phone,
        name: order.customer_name || 'Client',
        successfulOrders: [],
        totalSpend: 0,
        lastOrderDate: orderDate
      };
    }

    customersMap[phone].successfulOrders.push(order);
    customersMap[phone].totalSpend += Number(order.total || 0);
    
    if (orderDate > customersMap[phone].lastOrderDate) {
      customersMap[phone].lastOrderDate = orderDate;
    }
  });

  // 2. Add profiles that don't have orders (to ensure they are included if they have a phone)
  profiles.forEach(p => {
    const phone = p.phone ? p.phone.trim() : '';
    if (!phone) return;
    
    if (!customersMap[phone]) {
      customersMap[phone] = {
        phone,
        name: p.name || 'Client',
        successfulOrders: [],
        totalSpend: 0,
        lastOrderDate: new Date(p.created_at || now)
      };
    }
  });

  // 3. Compute RFM Scores and Segment
  return Object.values(customersMap).map(c => {
    const ordersCount = c.successfulOrders.length;
    const lastOrderDays = Math.max(0, Math.floor((now.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Recency Score (R)
    let rScore = 1;
    if (lastOrderDays <= 30) rScore = 5;
    else if (lastOrderDays <= 60) rScore = 4;
    else if (lastOrderDays <= 90) rScore = 3;
    else if (lastOrderDays <= 180) rScore = 2;

    // Frequency Score (F)
    let fScore = 1;
    if (ordersCount >= 5) fScore = 5;
    else if (ordersCount === 4) fScore = 4;
    else if (ordersCount === 3) fScore = 3;
    else if (ordersCount === 2) fScore = 2;

    // Monetary Score (M)
    let mScore = 1;
    if (c.totalSpend >= 2000) mScore = 5;
    else if (c.totalSpend >= 1000) mScore = 4;
    else if (c.totalSpend >= 500) mScore = 3;
    else if (c.totalSpend >= 200) mScore = 2;

    const avgScore = (rScore + fScore + mScore) / 3;

    // Segment Rules
    let segment: 'champions' | 'fideles' | 'nouveaux' | 'attention' | 'risque' | 'perdus' = 'perdus';
    if (rScore <= 2 && fScore >= 3) {
      segment = 'risque';
    } else if (rScore <= 2 && fScore <= 2) {
      segment = 'perdus';
    } else if (avgScore >= 4.5) {
      segment = 'champions';
    } else if (avgScore >= 3.5) {
      segment = 'fideles';
    } else if (ordersCount === 1 && lastOrderDays <= 45) {
      segment = 'nouveaux';
    } else if (lastOrderDays > 45 && lastOrderDays <= 90) {
      segment = 'attention';
    }

    // Resolve loyalty points balance
    const profile = profiles.find(p => p.phone && p.phone.trim() === c.phone.trim());
    const points = profile ? Number(profile.points || 0) : 0;

    // Find diagnostics skinType
    const matchedDiag = profile?.diary_logs?.[0] || null; // fallback or from diagnostics table

    return {
      phone: c.phone,
      name: c.name,
      segment,
      points,
      totalSpend: c.totalSpend,
      lastOrderDays,
      skinType: profile?.skin_type || 'any'
    };
  });
}

export async function GET(request: Request) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const forceRunFlowId = searchParams.get('flow_id'); // Allow manual debug run of a specific flow

    // 1. Fetch active marketing automation flows
    let query = supabase.from('marketing_flows').select('*').eq('active', true);
    if (forceRunFlowId) {
      query = query.eq('id', forceRunFlowId);
    }
    const { data: flows, error: flowsError } = await query;
    if (flowsError) throw flowsError;

    if (!flows || flows.length === 0) {
      return NextResponse.json({ success: true, message: 'Aucun flux marketing actif.' });
    }

    // 2. Fetch base data for evaluating customer filters
    const { data: orders } = await supabase.from('orders').select('*');
    const { data: profiles } = await supabase.from('customer_profiles').select('*');
    const { data: diagnostics } = await supabase.from('diagnostics').select('*');
    const { data: settingsRow } = await supabase.from('settings').eq('id', 1).single();
    
    const settings = settingsRow?.value || {};
    const customers = computeCrmCustomers(orders || [], profiles || []);

    const logs: string[] = [];
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    logs.push(`[${timestamp}] Début de l'évaluation des flux marketing automatiques...`);

    // 3. Evaluate each flow's filters and enroll matching customers
    for (const flow of flows) {
      const filters = flow.filters || {};
      const targetSegment = filters.segment; // e.g. 'risque'
      const targetSkinType = filters.skinType; // e.g. 'dry'

      logs.push(`Évaluation du flux "${flow.name}" (Filtres: Segment=${targetSegment || 'Tous'}, SkinType=${targetSkinType || 'Tous'})`);

      // Find matching customers
      const matchingCustomers = customers.filter(cust => {
        if (targetSegment && targetSegment !== 'all' && cust.segment !== targetSegment) {
          return false;
        }
        if (targetSkinType && targetSkinType !== 'all' && cust.skinType !== 'any' && cust.skinType !== targetSkinType) {
          // If profile lists a skin type and it doesn't match the target, skip
          return false;
        }
        return true;
      });

      logs.push(`-> Trouvé ${matchingCustomers.length} client(s) éligible(s).`);

      // Enroll new matching customers who are not already in this flow
      for (const cust of matchingCustomers) {
        // Check if there is an active run for this customer + flow
        const { data: existingRun } = await supabase
          .from('marketing_flow_runs')
          .select('id, status')
          .eq('flow_id', flow.id)
          .eq('customer_phone', cust.phone)
          .eq('status', 'pending')
          .maybeSingle();

        if (!existingRun) {
          // Enroll!
          await supabase.from('marketing_flow_runs').insert({
            flow_id: flow.id,
            customer_phone: cust.phone,
            customer_name: cust.name,
            current_step_index: 0,
            next_run_at: new Date().toISOString(), // Run immediately
            status: 'pending',
            logs: [{ date: new Date().toISOString(), type: 'system', message: `Flux démarré automatiquement.` }]
          });
          logs.push(`   * Client inscrit: ${cust.name} (${cust.phone})`);
        }
      }
    }

    // 4. Process pending runs whose execution time has arrived
    const { data: pendingRuns } = await supabase
      .from('marketing_flow_runs')
      .select('*')
      .eq('status', 'pending')
      .lte('next_run_at', new Date().toISOString());

    logs.push(`Traitement de ${(pendingRuns || []).length} tâche(s) de flux en attente d'exécution...`);

    for (const run of (pendingRuns || [])) {
      const { data: flow } = await supabase
        .from('marketing_flows')
        .select('*')
        .eq('id', run.flow_id)
        .single();

      if (!flow || !flow.active) {
        // Flow deleted or deactivated -> complete the run
        await supabase
          .from('marketing_flow_runs')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', run.id);
        continue;
      }

      const actions = flow.actions || [];
      const currentIdx = run.current_step_index;

      if (currentIdx >= actions.length) {
        // Run has finished all steps
        await supabase
          .from('marketing_flow_runs')
          .update({
            status: 'completed',
            logs: [...(run.logs || []), { date: new Date().toISOString(), type: 'system', message: 'Flux terminé avec succès.' }],
            updated_at: new Date().toISOString()
          })
          .eq('id', run.id);
        continue;
      }

      const step = actions[currentIdx];
      const runLogs = run.logs || [];
      let nextRunAt = new Date().toISOString();
      const newIdx = currentIdx + 1;

      // Variables for interpolations
      const variables: Record<string, string> = {
        NAME: run.customer_name || 'Client',
        PHONE: run.customer_phone,
        POINTS: '0'
      };
      
      const custProfile = customers.find(c => c.phone === run.customer_phone);
      if (custProfile) {
        variables.POINTS = String(custProfile.points);
      }

      if (step.type === 'wait') {
        const value = Number(step.value || 1);
        const unit = step.unit || 'days';
        
        let waitMs = value * 24 * 60 * 60 * 1000; // days
        if (unit === 'hours') waitMs = value * 60 * 60 * 1000;
        if (unit === 'minutes') waitMs = value * 60 * 1000;

        nextRunAt = new Date(Date.now() + waitMs).toISOString();
        runLogs.push({
          date: new Date().toISOString(),
          type: 'wait',
          message: `Attente configurée pour ${value} ${unit}. Prochaine étape à: ${new Date(Date.now() + waitMs).toLocaleString('fr-FR')}`
        });
      } 
      else if (step.type === 'whatsapp') {
        const rawMsg = step.message || '';
        // Interpolate variables
        const messageText = rawMsg.replace(/\{([^{}]+)\}/g, (match: string, key: string) => {
          const val = variables[key.trim()];
          return val !== undefined ? val : match;
        });

        // Send message
        try {
          const result = await sendWhatsAppMessage(run.customer_phone, messageText, settings);
          runLogs.push({
            date: new Date().toISOString(),
            type: 'whatsapp',
            message: `Message WhatsApp envoyé. Mode: ${result.mode}. ${result.warning || ''}`,
            details: messageText
          });
        } catch (err: any) {
          runLogs.push({
            date: new Date().toISOString(),
            type: 'error',
            message: `Échec de l'envoi WhatsApp: ${err.message}`
          });
        }
      } 
      else if (step.type === 'sms') {
        const rawMsg = step.message || '';
        const messageText = rawMsg.replace(/\{([^{}]+)\}/g, (match: string, key: string) => {
          const val = variables[key.trim()];
          return val !== undefined ? val : match;
        });

        // Simulating SMS send
        runLogs.push({
          date: new Date().toISOString(),
          type: 'sms',
          message: `Relance SMS simulée avec succès.`,
          details: messageText
        });
      }

      // Update run details
      const isCompleted = newIdx >= actions.length;
      if (isCompleted) {
        runLogs.push({ date: new Date().toISOString(), type: 'system', message: 'Flux complété.' });
      }

      await supabase
        .from('marketing_flow_runs')
        .update({
          current_step_index: newIdx,
          next_run_at: nextRunAt,
          status: isCompleted ? 'completed' : 'pending',
          logs: runLogs,
          updated_at: new Date().toISOString()
        })
        .eq('id', run.id);
        
      logs.push(`   * Étape ${currentIdx + 1}/${actions.length} exécutée pour ${run.customer_name} (${run.customer_phone}). Type: ${step.type}`);
    }

    logs.push(`[${new Date().toLocaleTimeString('fr-FR')}] Fin de l'exécution des flux.`);

    return NextResponse.json({
      success: true,
      message: `${pendingRuns?.length || 0} tâche(s) de flux exécutée(s).`,
      logs
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
