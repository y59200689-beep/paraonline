const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export type LocalIntegrationEnvironment = {
  databaseUrl: URL;
  apiUrl?: URL;
};

function requireLoopbackUrl(
  value: string | undefined,
  variableName: string,
  allowedProtocols: readonly string[],
): URL {
  if (!value) {
    throw new Error(
      `${variableName} is required for local integration tests. Refusing to run without an explicit local endpoint.`,
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be an absolute URL. Refusing to run integration tests.`);
  }

  if (!allowedProtocols.includes(url.protocol)) {
    throw new Error(
      `${variableName} must use one of: ${allowedProtocols.join(', ')}. Refusing to run integration tests.`,
    );
  }

  if (!LOOPBACK_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error(
      `${variableName} must target localhost, 127.0.0.1, or ::1. Refusing to run against ${url.hostname}.`,
    );
  }

  return url;
}

/**
 * Validates the only endpoints that the Phase 6 integration suite may use.
 * This intentionally accepts URLs only, not libpq keyword strings, so the
 * target hostname is always unambiguous before a client can connect.
 */
export function requireLocalIntegrationEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): LocalIntegrationEnvironment {
  const databaseUrl = requireLoopbackUrl(
    environment.PHASE6_INTEGRATION_DATABASE_URL,
    'PHASE6_INTEGRATION_DATABASE_URL',
    ['postgres:', 'postgresql:'],
  );

  const configuredApiUrl = environment.PHASE6_INTEGRATION_SUPABASE_URL;
  const apiUrl = configuredApiUrl
    ? requireLoopbackUrl(
        configuredApiUrl,
        'PHASE6_INTEGRATION_SUPABASE_URL',
        ['http:', 'https:'],
      )
    : undefined;

  return { databaseUrl, apiUrl };
}
