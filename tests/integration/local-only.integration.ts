import { describe, expect, it } from 'vitest';
import { requireLocalIntegrationEnvironment } from './local-only';

describe('local integration database safety guard', () => {
  it('accepts an explicit loopback PostgreSQL URL', () => {
    const environment = requireLocalIntegrationEnvironment({
      PHASE6_INTEGRATION_DATABASE_URL: 'postgresql://postgres@127.0.0.1:54322/postgres',
    });

    expect(environment.databaseUrl.hostname).toBe('127.0.0.1');
  });

  it('accepts an optional loopback Supabase API URL', () => {
    const environment = requireLocalIntegrationEnvironment({
      PHASE6_INTEGRATION_DATABASE_URL: 'postgres://postgres@[::1]:54322/postgres',
      PHASE6_INTEGRATION_SUPABASE_URL: 'http://localhost:54321',
    });

    expect(environment.apiUrl?.hostname).toBe('localhost');
  });

  it.each([
    undefined,
    'not a URL',
    'postgresql://postgres@db.example.com:5432/postgres',
    'https://project.supabase.co',
  ])('rejects an absent, malformed, or remote database URL: %s', (databaseUrl) => {
    expect(() =>
      requireLocalIntegrationEnvironment({
        PHASE6_INTEGRATION_DATABASE_URL: databaseUrl,
      }),
    ).toThrow(/Refusing|required|absolute URL/);
  });

  it('rejects a remote optional Supabase API URL', () => {
    expect(() =>
      requireLocalIntegrationEnvironment({
        PHASE6_INTEGRATION_DATABASE_URL: 'postgresql://postgres@localhost:54322/postgres',
        PHASE6_INTEGRATION_SUPABASE_URL: 'https://project.supabase.co',
      }),
    ).toThrow(/Refusing/);
  });
});
