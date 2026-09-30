import { describe, expect, it, vi } from 'vitest';

const productRows = Array.from({ length: 1001 }, (_, index) => ({
  id: index + 1,
  title: index === 1000 ? 'Solaire SPF50+' : `Produit ${index + 1}`,
  category: 'visage',
  status: 'live',
  stock: 5,
  routine_roles: index === 1000 ? ['sunscreen'] : [],
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: (table: string) => table === 'diagnostic_excluded_products'
      ? { select: async () => ({ data: [], error: null }) }
      : {
          select: () => ({
            eq: () => ({
              order: () => ({
                range: async (from: number, to: number) => ({ data: productRows.slice(from, to + 1), error: null }),
              }),
            }),
          }),
        },
  },
}));

import { GET } from '@/app/api/diagnostic/catalogue/route';

describe('diagnostic catalogue endpoint', () => {
  it('checks every page and returns eligible products beyond the first thousand', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.products.map((product: { id: number }) => product.id)).toEqual([1001]);
  });
});
