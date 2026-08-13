import { supabaseAdmin } from '@/lib/supabase';

export type CmsPreviewEntity = 'page' | 'brand' | 'section';

/**
 * Resolve a short-lived preview token on the server. Draft data never enters
 * the normal public query path; it is only returned when the token, entity,
 * and expiry all match.
 */
export async function getCmsPreviewSnapshot<T = Record<string, unknown>>(
  token: string | undefined,
  entityType: CmsPreviewEntity,
  entityId: string,
): Promise<T | null> {
  if (!token || !/^[a-f0-9]{32,128}$/i.test(token)) return null;

  const { data, error } = await supabaseAdmin
    .from('cms_preview_tokens')
    .select('entity_type,entity_id,snapshot,expires_at')
    .eq('token', token)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();

  if (error || !data || new Date(data.expires_at).getTime() <= Date.now()) return null;
  return (data.snapshot ?? null) as T | null;
}
