import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, any>;
const state = vi.hoisted(() => ({
  products: [] as Row[], articles: '', writes: [] as Row[], logs: '',
  brokenPage: -1, reportedCount: null as number | null, active: 0, peak: 0, ordered: [] as unknown[][],
}));
vi.mock('@/lib/cron-auth', () => ({ requireCronSecret: () => null }));
vi.mock('@/lib/atlascom-request', () => ({ fetchAtlascomXml: vi.fn(async (_url, options) =>
  options.headers.SOAPAction.endsWith('generateTOKEN') ? '<generateTOKENResult>fixture</generateTOKENResult>' : state.articles) }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: (table: string) => {
  let from = 0; let to = 999; let write: Row[] | undefined; let log: Row | undefined;
  const q: any = {};
  q.select = () => q;
  q.order = (...args: unknown[]) => { state.ordered.push(args); return q; };
  q.range = (start: number, end: number) => { from = start; to = end; return q; };
  q.upsert = (rows: Row[]) => { write = rows; return q; };
  q.update = (row: Row) => { log = row; return q; };
  q.eq = () => q;
  q.abortSignal = async () => {
    if (table === 'code_snippets') { state.logs = log?.last_run_logs || ''; return { error: null }; }
    if (write) { state.writes.push(...write); return { error: null }; }
    state.active++; state.peak = Math.max(state.peak, state.active);
    await new Promise(resolve => setTimeout(resolve, 2));
    state.active--;
    if (from === state.brokenPage) return { data: null, error: { code: 'FIXTURE_FAILURE' } };
    return { data: state.products.slice(from, to + 1), count: state.reportedCount ?? state.products.length, error: null };
  };
  return q;
} } }));

import { GET } from '@/app/api/cron/atlascom-sync/route';

const product = (id: number): Row => ({ id, sku: `SKU-${id}`, title: `Name ${id}`, name: `Name ${id}`, name_fr: `Name ${id}`, price: 99, compare_price: 99, stock: 3, vendor: '', status: 'live', image: 'curated.webp', description: 'Keep manual content', categories: ['corps'] });
const article = (id: number, stock = 3, price = 99) => `<Article><codeArticle>SKU-${id}</codeArticle><libelle>Name ${id}</libelle><qteStock>${stock}</qteStock><prix>${price}</prix></Article>`;
const run = () => GET(new Request('http://localhost/api/cron/atlascom-sync'));

beforeEach(() => {
  vi.stubEnv('ATLASCOM_EMPLOYEE_CODE', 'fixture'); vi.stubEnv('ATLASCOM_PASSWORD', 'fixture');
  state.products = []; state.articles = ''; state.writes = []; state.logs = '';
  state.brokenPage = -1; state.reportedCount = null; state.active = 0; state.peak = 0; state.ordered = [];
});

describe('full-catalog Atlascom checks with changed-row writes', () => {
  it('checks all feed rows but only writes changed and new products, preserving manual content', async () => {
    state.products = [product(1), product(2)];
    state.articles = article(1) + article(2, 5) + article(3, 7, 125);
    const response = await run();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ processed: 3, updated: 1, inserted: 1, skipped: 1, written: 2 });
    expect(state.writes.map(row => row.id)).toEqual([2, 3]);
    expect(state.writes[0]).toEqual({ ...product(2), stock: 5 });
    expect(state.writes[1]).toMatchObject({ sku: 'SKU-3', price: 125, stock: 7, status: 'draft' });
    expect(state.logs).toContain('Inchangés vérifiés : 1');
  });
  it('makes no product writes when the entire feed is unchanged', async () => {
    state.products = [product(1), product(2)]; state.articles = article(1) + article(2);
    expect(await (await run()).json()).toMatchObject({ processed: 2, skipped: 2, written: 0, updated: 0 });
    expect(state.writes).toEqual([]);
  });
  it('still writes null-to-zero stock cleanup instead of treating unknown stock as unchanged', async () => {
    state.products = [{ ...product(1), stock: null, vendor: null }]; state.articles = article(1, 0);
    expect(await (await run()).json()).toMatchObject({ updated: 1, skipped: 0, written: 1 });
    expect(state.writes[0]).toMatchObject({ stock: 0, vendor: '' });
    expect(state.logs).toContain('Stock : non renseigné → 0');
  });
  it('does not round away a supplier price change', async () => {
    state.products = [product(1)]; state.articles = article(1, 3, 98.986);
    await run(); expect(state.writes[0].price).toBe(98.986);
  });
  it('does not write or infer new products from a failed catalog page', async () => {
    state.products = Array.from({ length: 1001 }, (_, i) => product(i + 1));
    state.articles = article(1001); state.brokenPage = 1000;
    expect((await run()).status).toBe(500); expect(state.writes).toEqual([]);
  });
  it('rejects incomplete pagination before writing anything', async () => {
    state.products = [product(1)]; state.reportedCount = 2; state.articles = article(2);
    expect((await run()).status).toBe(500); expect(state.writes).toEqual([]);
  });
  it('reads the complete existing catalog with stable ordering and at most four concurrent pages', async () => {
    state.products = Array.from({ length: 6001 }, (_, i) => product(i + 1)); state.articles = article(6001);
    expect(await (await run()).json()).toMatchObject({ processed: 1, skipped: 1, inserted: 0, written: 0 });
    expect(state.peak).toBe(4);
    expect(state.ordered).toHaveLength(7);
    expect(state.ordered.every(args => args[0] === 'id' && (args[1] as any).ascending)).toBe(true);
  });
});
