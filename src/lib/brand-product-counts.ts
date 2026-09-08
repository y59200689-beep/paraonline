import { supabaseAdmin } from './supabase';
import { catalogBrandPrefix } from './catalog-brand-match';

/** Read only vendor names, paginated beyond the database's default row cap. */
export async function withBrandProductCounts<T extends { name: string }>(brands: T[]) {
  if (!brands.length) return [];
  const vendors = new Map<string, number>();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin.from('products')
      .select('vendor').eq('status', 'live').order('id').range(offset, offset + 999);
    // Keep brand management usable, but never report a failed count as zero.
    if (error) return brands.map(brand => ({ ...brand, product_count: null }));
    for (const row of data ?? []) {
      if (typeof row.vendor !== 'string') continue;
      const vendor = row.vendor.toLowerCase();
      vendors.set(vendor, (vendors.get(vendor) ?? 0) + 1);
    }
    if (!data || data.length < 1000) break;
  }
  return brands.map(brand => {
    const prefix = catalogBrandPrefix(brand.name).toLowerCase();
    let count = 0;
    for (const [vendor, quantity] of vendors) {
      if (prefix && vendor.startsWith(prefix)) count += quantity;
    }
    return { ...brand, product_count: count };
  });
}
