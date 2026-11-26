import { supabaseAdmin } from '@/lib/supabase-server';
import { DEFAULT_PIXELS, PIXEL_PROVIDERS, readPixelInput, type PixelConfig, type PixelProvider } from '@/lib/pixels';

export const PIXEL_SETTINGS_ID = 97;

export async function getPixels(): Promise<PixelConfig> {
  const { data, error } = await supabaseAdmin.from('settings').select('value').eq('id', PIXEL_SETTINGS_ID).maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_PIXELS;
  const pixels: PixelConfig = {};
  for (const provider of Object.keys(PIXEL_PROVIDERS) as PixelProvider[]) {
    const value = data.value?.[provider];
    const id = typeof value === 'string' ? readPixelInput(provider, value) : undefined;
    if (id) pixels[provider] = id;
  }
  return pixels;
}
