import { describe, it, expect, beforeEach } from 'vitest';
import { supabaseAdmin as supabase } from '@/lib/supabase';

describe('Enterprise Marketing Automation Builder Tests', () => {
  
  beforeEach(async () => {
    // Clean mock collections before each test run
    const { data: flows } = await supabase.from('marketing_flows').select('id');
    for (const f of (flows || [])) {
      await supabase.from('marketing_flows').delete().eq('id', f.id);
    }
    const { data: runs } = await supabase.from('marketing_flow_runs').select('id');
    for (const r of (runs || [])) {
      await supabase.from('marketing_flow_runs').delete().eq('id', r.id);
    }
  });

  it('should successfully create, fetch, and delete marketing automation flows', async () => {
    // 1. Create a flow
    const testFlow = {
      id: 'test_flow_123',
      name: 'Reconnection Flow',
      description: 'Reconnect with at-risk customers',
      trigger_type: 'rfm_segment_change',
      filters: { segment: 'risque', skinType: 'dry' },
      actions: [
        { type: 'wait', value: 3, unit: 'days' },
        { type: 'whatsapp', message: 'Hello {NAME}, we miss you!' }
      ],
      active: true
    };

    const { data: insertedList, error: insertError } = await supabase
      .from('marketing_flows')
      .insert(testFlow);

    expect(insertError).toBeNull();
    expect(insertedList).toBeDefined();
    
    const inserted = insertedList[0];
    expect(inserted.name).toBe('Reconnection Flow');
    expect(inserted.actions).toHaveLength(2);

    // 2. Fetch the flow
    const { data: fetched, error: fetchError } = await supabase
      .from('marketing_flows')
      .select('*')
      .eq('id', 'test_flow_123')
      .single();

    expect(fetchError).toBeNull();
    expect(fetched.description).toBe('Reconnect with at-risk customers');

    // 3. Delete the flow
    const { error: deleteError } = await supabase
      .from('marketing_flows')
      .delete()
      .eq('id', 'test_flow_123');

    expect(deleteError).toBeNull();

    // Verify it is gone
    const { data: gone } = await supabase
      .from('marketing_flows')
      .select('*')
      .eq('id', 'test_flow_123')
      .maybeSingle();

    expect(gone).toBeNull();
  });

  it('should successfully enroll customers and advance them through journey steps', async () => {
    // 1. Setup a test customer in customer_profiles
    const customerPhone = '212600112233';
    
    // Clean existing profile if any
    await supabase.from('customer_profiles').delete().eq('phone', customerPhone);
    
    const { error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        phone: customerPhone,
        name: 'Fatima El Fassi',
        skin_type: 'dry',
        points: 250,
        created_at: new Date().toISOString()
      });
    expect(profileError).toBeNull();

    // 2. Insert an active automation flow targeting at-risk dry-skin customers
    const { data: flowList } = await supabase
      .from('marketing_flows')
      .insert({
        id: 'test_flow_456',
        name: 'At Risk Dry Skin Flow',
        trigger_type: 'rfm_segment_change',
        filters: { segment: 'risque', skinType: 'dry' },
        actions: [
          { type: 'wait', value: 1, unit: 'days' },
          { type: 'whatsapp', message: 'Hi {NAME}, you have {POINTS} points. Use code DRY15!' }
        ],
        active: true
      });

    const flow = flowList[0];
    expect(flow).toBeDefined();

    // 3. Create a simulated run for this customer inside the flow starting at step 0
    const { data: runList, error: runError } = await supabase
      .from('marketing_flow_runs')
      .insert({
        id: 'test_run_111',
        flow_id: 'test_flow_456',
        customer_phone: customerPhone,
        customer_name: 'Fatima El Fassi',
        current_step_index: 0,
        next_run_at: new Date().toISOString(),
        status: 'pending',
        logs: []
      });

    expect(runError).toBeNull();
    const run = runList[0];
    expect(run).toBeDefined();
    expect(run.status).toBe('pending');
    expect(run.current_step_index).toBe(0);

    // 4. Simulate executing the first step ('wait' for 1 day)
    const step1 = flow.actions[0];
    expect(step1.type).toBe('wait');

    const nextRunAtDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    
    const { data: updatedRunList } = await supabase
      .from('marketing_flow_runs')
      .update({
        current_step_index: 1,
        next_run_at: nextRunAtDate.toISOString(),
        status: 'pending',
        logs: [{ date: new Date().toISOString(), type: 'wait', message: 'Waiting 1 day' }]
      })
      .eq('id', 'test_run_111');

    const updatedRun = updatedRunList[0];
    expect(updatedRun.current_step_index).toBe(1);
    expect(updatedRun.status).toBe('pending');
    expect(new Date(updatedRun.next_run_at).getDate()).toBe(nextRunAtDate.getDate());

    // 5. Simulate executing the second step ('whatsapp' messaging) and completing the flow
    const step2 = flow.actions[1];
    expect(step2.type).toBe('whatsapp');

    const messageTemplate = step2.message;
    const interpolated = messageTemplate
      .replace('{NAME}', 'Fatima El Fassi')
      .replace('{POINTS}', '250');

    expect(interpolated).toBe('Hi Fatima El Fassi, you have 250 points. Use code DRY15!');

    const { data: finalRunList } = await supabase
      .from('marketing_flow_runs')
      .update({
        current_step_index: 2,
        status: 'completed',
        logs: [...updatedRun.logs, { date: new Date().toISOString(), type: 'whatsapp', message: 'Sent whatsapp message' }]
      })
      .eq('id', 'test_run_111');

    const finalRun = finalRunList[0];
    expect(finalRun.current_step_index).toBe(2);
    expect(finalRun.status).toBe('completed');
  });

});
