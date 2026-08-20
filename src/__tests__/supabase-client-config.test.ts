import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolveSupabaseClientConfig } from '@/lib/supabase-client-config';

describe('Supabase public-key configuration', () => {
  it('uses the modern publishable key as an opaque browser client credential', () => {
    expect(resolveSupabaseClientConfig(
      'https://example.supabase.co',
      'opaque-public-key-for-test',
    )).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      publishableKey: 'opaque-public-key-for-test',
      isPlaceholder: false,
    });
  });

  it('rejects a configured URL without a publishable key, regardless of legacy-key availability', () => {
    expect(() => resolveSupabaseClientConfig(
      'https://example.supabase.co',
      undefined,
    )).toThrow(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured',
    );
  });

  it('keeps the service-role credential out of the public client configuration', () => {
    const config = resolveSupabaseClientConfig(
      'https://example.supabase.co',
      'opaque-public-key-for-test',
    );

    expect(Object.values(config)).not.toContain('opaque-server-key-for-test');
  });

  it('routes LoyaltyContext through the shared Supabase configuration', async () => {
    const source = await readFile('src/context/LoyaltyContext.tsx', 'utf8');
    const supabaseSource = await readFile('src/lib/supabase.ts', 'utf8');

    expect(source).toContain("import { isSupabaseConfigured, supabase } from '@/lib/supabase';");
    expect(source).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(source).not.toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    expect(supabaseSource).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    expect(supabaseSource).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(supabaseSource).toContain('const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;');
  });
});
