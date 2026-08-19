import { Client, Pool, type PoolClient } from 'pg';
import { requireLocalIntegrationEnvironment } from './local-only';

export function createLocalPostgresPool() {
  const { databaseUrl } = requireLocalIntegrationEnvironment();
  return new Pool({
    connectionString: databaseUrl.toString(),
    max: 10,
  });
}

export function createIndependentLocalPostgresClient() {
  const { databaseUrl } = requireLocalIntegrationEnvironment();
  return new Client({ connectionString: databaseUrl.toString() });
}

const supportedRoles = new Set(['anon', 'authenticated', 'service_role']);

export async function queryAsLocalSupabaseRole<T extends PoolClient | Client>(
  client: T,
  role: 'anon' | 'authenticated' | 'service_role',
  query: string,
  values?: unknown[],
) {
  if (!supportedRoles.has(role)) {
    throw new Error(`Unsupported local Supabase role: ${role}`);
  }

  await client.query(`SET ROLE ${role}`);
  try {
    return await client.query(query, values);
  } finally {
    await client.query('RESET ROLE');
  }
}
