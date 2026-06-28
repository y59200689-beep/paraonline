import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Prevent actual file writes during tests
const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

// Import the actual implementation bypass the global mock in setupTests
const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');

describe('Supabase Code Snippets Mock Client', () => {
  let originalDb: any;

  beforeEach(() => {
    const globalForMock = globalThis as any;
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
  });

  afterEach(() => {
    const globalForMock = globalThis as any;
    globalForMock.mockDb = originalDb;
    writeSpy.mockClear();
  });

  it('should retrieve seeded code snippets', async () => {
    const { data: snippets } = await supabase.from('code_snippets').select('*');
    expect(snippets).toBeDefined();
    expect(snippets.length).toBeGreaterThan(0);
    expect(snippets[0]).toHaveProperty('id');
    expect(snippets[0]).toHaveProperty('name');
    expect(snippets[0]).toHaveProperty('code');
    expect(snippets[0]).toHaveProperty('location');
    expect(snippets[0]).toHaveProperty('active');
    expect(snippets[0]).toHaveProperty('trigger_type');
  });

  it('should insert a new client code snippet', async () => {
    const newSnippet = {
      id: 'snip_test_insert',
      name: 'Test script insert',
      code: '<script>console.log("test");</script>',
      location: 'head',
      active: true,
      trigger_type: 'client'
    };

    const { data: inserted } = await supabase.from('code_snippets').insert(newSnippet);
    expect(inserted).toHaveLength(1);
    expect(inserted[0].id).toBe('snip_test_insert');

    const { data: found } = await supabase.from('code_snippets').select('*').eq('id', 'snip_test_insert').single();
    expect(found).not.toBeNull();
    expect(found.name).toBe('Test script insert');
    expect(found.trigger_type).toBe('client');
  });

  it('should insert a new cron scheduled task', async () => {
    const newCron = {
      id: 'cron_test_insert',
      name: 'Test Cron Task',
      code: 'console.log("hello");',
      location: 'head',
      active: true,
      trigger_type: 'cron',
      cron_expression: '*/10 * * * *'
    };

    const { data: inserted } = await supabase.from('code_snippets').insert(newCron);
    expect(inserted).toHaveLength(1);
    expect(inserted[0].id).toBe('cron_test_insert');

    const { data: found } = await supabase.from('code_snippets').select('*').eq('id', 'cron_test_insert').single();
    expect(found.trigger_type).toBe('cron');
    expect(found.cron_expression).toBe('*/10 * * * *');
  });

  it('should update an existing code snippet', async () => {
    const { data: original } = await supabase.from('code_snippets').select('*').eq('id', 'snip_1').single();
    expect(original.active).toBe(true);

    await supabase.from('code_snippets').update({ active: false }).eq('id', 'snip_1');

    const { data: updated } = await supabase.from('code_snippets').select('*').eq('id', 'snip_1').single();
    expect(updated.active).toBe(false);
  });

  it('should update cron execution details', async () => {
    await supabase.from('code_snippets').update({
      last_run: '2026-06-22T00:00:00.000Z',
      last_run_status: 'success',
      last_run_logs: 'Task executed successfully.'
    }).eq('id', 'cron_1');

    const { data: found } = await supabase.from('code_snippets').select('*').eq('id', 'cron_1').single();
    expect(found.last_run_status).toBe('success');
    expect(found.last_run_logs).toBe('Task executed successfully.');
  });

  it('should delete a code snippet', async () => {
    const { data: original } = await supabase.from('code_snippets').select('*').eq('id', 'snip_2').single();
    expect(original).not.toBeNull();

    await supabase.from('code_snippets').delete().eq('id', 'snip_2');

    const { data: deleted } = await supabase.from('code_snippets').select('*').eq('id', 'snip_2').maybeSingle();
    expect(deleted).toBeNull();
  });
});
