/** Bounded autocomplete buckets: exact name, available, then unavailable.
 * Each query is freshly built so PostgREST's mutable builders cannot leak filters.
 */
export async function searchStockResults(buildQuery: () => any, name: string, limit: number) {
  const exactName = name.trim().replace(/\s+/g, ' ').slice(0, 240);
  // Quoted PostgREST values preserve punctuation without allowing filter injection.
  const value = JSON.stringify(exactName.replace(/[\\%_*]/g, '\\$&'));
  const exactFilter = ['title', 'name', 'name_fr'].map(field => `${field}.ilike.${value}`).join(',');
  const ordered = (query: any) => query.order('title', { ascending: true }).order('id', { ascending: true }).range(0, limit - 1);
  const batches = await Promise.all([
    ordered(buildQuery().or(exactFilter)),
    ordered(buildQuery().gt('stock', 0)),
    ordered(buildQuery().or('stock.lte.0,stock.is.null')),
  ]);
  for (const batch of batches) {
    if (batch.error || !batch.data) throw batch.error || new Error('Search unavailable');
  }
  const seen = new Set<number>();
  const rows: Record<string, unknown>[] = [];
  for (const batch of batches) {
    for (const row of batch.data) {
      if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); }
    }
  }
  return rows.slice(0, limit);
}
