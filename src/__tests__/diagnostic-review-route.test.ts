import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const rows = [
  { id: 1, title: 'Gel nettoyant doux visage', category: 'visage', status: 'live', stock: 5, routine_roles: ['cleanser'], suitable_skin_types: ['dry'], suitable_concerns: ['dryness'], sensitivity_levels: ['medium'], active_strength: 'gentle', time_of_day: ['morning', 'evening'] },
  { id: 2, title: 'Crème lavante hydratante visage', category: 'visage', status: 'live', stock: 3, routine_roles: ['cleanser'], suitable_skin_types: ['dry'], suitable_concerns: ['dryness'], sensitivity_levels: ['medium'], active_strength: 'gentle', time_of_day: ['morning', 'evening'] },
  { id: 3, title: 'Gel nettoyant épuisé', category: 'visage', status: 'live', stock: 0, routine_roles: ['cleanser'], suitable_skin_types: ['dry'], suitable_concerns: ['dryness'], sensitivity_levels: ['medium'], active_strength: 'gentle', time_of_day: ['morning', 'evening'] },
];

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: (table: string) => ({
      select: () => ({
        in: async (_column: string, ids: number[]) => ({
          data: table === 'products' ? rows.filter(row => ids.includes(row.id)) : [],
          error: null,
        }),
      }),
    }),
  },
}));
vi.mock('@/lib/rateLimit', () => ({
  getClientIp: () => 'test',
  rateLimit: async () => ({ allowed: true, remaining: 9, resetAt: Date.now() + 1000 }),
}));

import { POST } from '@/app/api/diagnostic/review/route';

const answers = {
  skinType: 'dry', concern: 'dryness', sensitivity: 'medium', breakoutFrequency: 'rare',
  sunExposure: 'moderate', spfHabit: 'daily', activeTolerance: 'beginner', routineDepth: 'essential',
};
const body = {
  answers,
  baseline: [{ step: 'cleanser', productId: 1 }],
  candidates: [{ step: 'cleanser', productId: 1 }, { step: 'cleanser', productId: 2 }],
};

function request() {
  return new Request('http://localhost/api/diagnostic/review', {
    method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
  });
}

function modelResult(productId: number | null) {
  return { ok: true, json: async () => ({
    output: [{ content: [{ type: 'output_text', text: JSON.stringify({ selections: [{ step: 'cleanser', productId, reason: 'Routine compatible' }] }) }] }],
  }) } as Response;
}

describe('GPT diagnostic review endpoint', () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousEnabled = process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED;
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED = 'true';
  });
  afterEach(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousEnabled === undefined) delete process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED;
    else process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED = previousEnabled;
    vi.unstubAllGlobals();
  });

  it('accepts an eligible alternative from the shortlist', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => modelResult(2)));
    const result = await POST(request());
    const data = await result.json();
    expect(data.reviewed).toBe(true);
    expect(data.routine.map((item: { product: { id: number } }) => item.product.id)).toEqual([2]);
  });

  it('rejects a model-selected product outside the validated shortlist', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => modelResult(999)));
    const result = await POST(request());
    const data = await result.json();
    expect(data.reviewed).toBe(false);
    expect(data.routine.map((item: { product: { id: number } }) => item.product.id)).toEqual([1]);
  });

  it('rejects an out-of-stock product even when the browser includes it', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => modelResult(3)));
    const unsafeRequest = new Request('http://localhost/api/diagnostic/review', {
      method: 'POST',
      body: JSON.stringify({ ...body, candidates: [...body.candidates, { step: 'cleanser', productId: 3 }] }),
    });
    const result = await POST(unsafeRequest);
    const data = await result.json();
    expect(data.reviewed).toBe(false);
    expect(data.routine.map((item: { product: { id: number } }) => item.product.id)).toEqual([1]);
  });

  it('keeps the rules-only routine when the model is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 429, json: async () => ({ error: { code: 'test_unavailable' } }) } as Response)));
    const result = await POST(request());
    const data = await result.json();
    expect(data.reviewed).toBe(false);
    expect(data.routine.map((item: { product: { id: number } }) => item.product.id)).toEqual([1]);
  });

  it('does not contact OpenAI while review is disabled', async () => {
    process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED = 'false';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await POST(request());
    const data = await result.json();
    expect(data.reviewed).toBe(false);
    expect(data.routine.map((item: { product: { id: number } }) => item.product.id)).toEqual([1]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
