export type SupabaseClientConfig = {
  supabaseUrl: string;
  publishableKey?: string;
  isPlaceholder: boolean;
};

export function resolveSupabaseClientConfig(
  supabaseUrl: string | undefined,
  publishableKey: string | undefined,
): SupabaseClientConfig {
  const resolvedUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder');

  // Deliberately accept the key as an opaque string. Modern publishable keys
  // are not JWTs and must never be validated or parsed client-side.
  if (!isPlaceholder && !publishableKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured for Supabase client access.');
  }

  return {
    supabaseUrl: resolvedUrl,
    publishableKey,
    isPlaceholder,
  };
}
