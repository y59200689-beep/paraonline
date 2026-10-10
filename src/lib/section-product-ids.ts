/** Collect only explicitly configured product references, never arbitrary numeric settings. */
export function sectionProductIds(value: unknown): number[] {
  const ids = new Set<number>();
  const add = (id: unknown) => { if (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) ids.add(id); };
  const visit = (node: unknown, routine = false) => {
    if (!node || typeof node !== 'object') return;
    for (const [key, child] of Object.entries(node)) {
      if ((/productIds$/i.test(key) || (routine && ['cleanse', 'treat', 'protect'].includes(key))) && Array.isArray(child)) child.forEach(add);
      else if (/productId$/i.test(key)) add(child);
      else if (typeof child === 'object') visit(child, key === 'routineProductIds');
    }
  };
  visit(value);
  return [...ids].sort((a, b) => a - b);
}
