import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { buildDiagnosticRoutine, getSelectedConcerns, isRelevantComplement, type DiagnosticAnswers, type RoutineRecommendation, type RoutineStep } from '@/lib/diagnostic-routine';
import { isInDiagnosticPool, mapDiagnosticProduct } from '@/lib/diagnostic-catalogue';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import type { Product } from '@/lib/data';
import diagnosticQuestions from '@/data/diagnostic-questions.json';

export const dynamic = 'force-dynamic';

const steps: RoutineStep[] = ['cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen'];
const answerFields = ['skinType', 'concern', 'sensitivity', 'breakoutFrequency', 'sunExposure', 'spfHabit', 'activeTolerance', 'routineDepth'] as const;
const allowedAnswers = new Map(diagnosticQuestions.questions.map(question => [question.field, new Set(question.options.map(option => option.val))]));
type Candidate = { slot: number; step: RoutineStep; productId: number };

function parseInput(value: unknown): { answers: DiagnosticAnswers; candidates: Candidate[]; baseline: Candidate[] } | null {
  if (!value || typeof value !== 'object') return null;
  const body = value as Record<string, unknown>;
  if (!body.answers || typeof body.answers !== 'object') return null;
  const rawAnswers = body.answers as Record<string, unknown>;
  if (!answerFields.every(field => {
    if (typeof rawAnswers[field] !== 'string') return false;
    if (field !== 'concern') return allowedAnswers.get(field)?.has(rawAnswers[field] as string);
    const concerns = getSelectedConcerns(rawAnswers.concern as string);
    return concerns.length >= 1 && concerns.length <= 6
      && (rawAnswers.concern as string) === concerns.join(',')
      && concerns.every(concern => allowedAnswers.get('concern')?.has(concern));
  })) return null;
  const parseCandidates = (input: unknown, max: number): Candidate[] | null => {
    if (!Array.isArray(input) || input.length > max) return null;
    const parsed: Candidate[] = [];
    for (const item of input) {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Record<string, unknown>;
      if (!Number.isSafeInteger(candidate.slot) || Number(candidate.slot) < 0 || Number(candidate.slot) > 7
        || !steps.includes(candidate.step as RoutineStep) || !Number.isSafeInteger(candidate.productId) || Number(candidate.productId) <= 0) return null;
      parsed.push({ slot: Number(candidate.slot), step: candidate.step as RoutineStep, productId: Number(candidate.productId) });
    }
    return parsed;
  };
  const candidates = parseCandidates(body.candidates, 24);
  const baseline = parseCandidates(body.baseline, 8);
  if (!candidates || !baseline || new Set(baseline.map(item => item.slot)).size !== baseline.length
    || baseline.some(item => candidates.some(candidate => candidate.slot === item.slot && candidate.step !== item.step))) return null;
  return { answers: rawAnswers as DiagnosticAnswers, candidates, baseline };
}

function response(routine: RoutineRecommendation[], reviewed: boolean) {
  return NextResponse.json({ routine, reviewed }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const limit = await rateLimit(`diagnostic-review:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });

  let input: ReturnType<typeof parseInput>;
  try {
    const raw = await request.text();
    if (raw.length > 6000) return NextResponse.json({ error: 'Requête trop longue' }, { status: 413 });
    input = parseInput(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  if (!input) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });

  const { answers, candidates, baseline } = input;
  const ids = [...new Set(candidates.map(item => item.productId))];
  if (!ids.length) return response([], false);

  try {
    const [productRows, exclusionRows] = await Promise.all([
      supabaseAdmin.from('products').select('*').in('id', ids),
      supabaseAdmin.from('diagnostic_excluded_products').select('product_id').in('product_id', ids),
    ]);
    if (productRows.error) throw productRows.error;
    if (exclusionRows.error) throw exclusionRows.error;
    const excludedIds = new Set<number>((exclusionRows.data || []).map((row: { product_id: number }) => Number(row.product_id)));
    const products = new Map<number, Product>((productRows.data || [])
      .map((row: Record<string, unknown>) => mapDiagnosticProduct(row))
      .filter((product: Product) => isInDiagnosticPool(product, excludedIds))
      .map((product: Product) => [product.id, product]));

    // Rebuild each candidate with the server's current catalogue data. The browser
    // cannot add a product to GPT's shortlist by submitting an arbitrary ID.
    const firstSlotByStep = new Map<RoutineStep, number>();
    for (const item of baseline) {
      if (!firstSlotByStep.has(item.step)) firstSlotByStep.set(item.step, item.slot);
    }
    const valid = candidates.filter(candidate => {
      const product = products.get(candidate.productId);
      return product && baseline.some(item => item.slot === candidate.slot && item.step === candidate.step)
        && buildDiagnosticRoutine([product], answers).some(item => item.step === candidate.step)
        && (firstSlotByStep.get(candidate.step) === candidate.slot || isRelevantComplement(product, answers, candidate.step));
    });
    const validKeys = new Set(valid.map(item => `${item.slot}:${item.step}:${item.productId}`));
    const safeBaseline = baseline
      .filter(item => validKeys.has(`${item.slot}:${item.step}:${item.productId}`));
    const fallbackRoutine = safeBaseline.map(item => ({ step: item.step, product: products.get(item.productId)!, score: 0 }));
    if (!valid.length || !process.env.OPENAI_API_KEY || process.env.OPENAI_DIAGNOSTIC_REVIEW_ENABLED !== 'true') {
      return response(fallbackRoutine, false);
    }

    const shortlist = valid.map(({ slot, step, productId }) => {
      const product = products.get(productId)!;
      return {
        slot, step, productId, name: product.title, brand: product.vendor,
        roles: product.routineRoles || [], skinTypes: product.suitableSkinTypes || [],
        concerns: product.suitableConcerns || [], sensitivity: product.sensitivityLevels || [],
        activeStrength: product.activeStrength || 'none', timeOfDay: product.timeOfDay || [],
        ingredients: (product.ingredients || '').slice(0, 500), usage: (product.usage || '').slice(0, 300),
      };
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let modelResponse: Response;
    try {
      modelResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_DIAGNOSTIC_MODEL || 'gpt-4o-mini',
          store: false,
          instructions: 'Review a cosmetic skincare routine. Select only from the supplied product IDs for each numbered slot. Several slots may share a routine step, but complementary products must serve the stated skin concern and should not duplicate the same function without a reason. You may reject a slot by returning null. Do not diagnose disease, invent products, or override suitability, ingredient, or usage restrictions. Prefer conservative choices when evidence is incomplete. Return one selection for every baseline slot.',
          input: JSON.stringify({ answers, baseline, candidates: shortlist }),
          text: { format: { type: 'json_schema', name: 'routine_review', strict: true, schema: {
            type: 'object', additionalProperties: false, required: ['selections'], properties: {
              selections: { type: 'array', items: { type: 'object', additionalProperties: false,
                required: ['slot', 'productId', 'reason'], properties: {
                  slot: { type: 'integer' }, productId: { type: ['integer', 'null'] }, reason: { type: 'string' },
                },
              } },
            },
          } } },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!modelResponse.ok) {
      const providerError = await modelResponse.json().catch(() => null);
      console.warn('Diagnostic GPT review failed:', modelResponse.status, providerError?.error?.code || providerError?.error?.type || 'unknown');
      return response(fallbackRoutine, false);
    }
    const modelData = await modelResponse.json();
    const outputText = modelData.output?.flatMap((item: { content?: Array<{ type: string; text?: string }> }) => item.content || [])
      .find((item: { type: string }) => item.type === 'output_text')?.text;
    if (!outputText) return response(fallbackRoutine, false);
    const selections = JSON.parse(outputText).selections;
    if (!Array.isArray(selections) || selections.length !== safeBaseline.length) return response(fallbackRoutine, false);
    const selectedIds = new Set<number>();
    const reviewed: RoutineRecommendation[] = [];
    for (const { slot, step } of safeBaseline) {
      const matches = selections.filter((item: { slot: number }) => item.slot === slot);
      if (matches.length !== 1) return response(fallbackRoutine, false);
      const id = matches[0].productId;
      if (id === null) continue;
      if (!Number.isSafeInteger(id) || !validKeys.has(`${slot}:${step}:${id}`) || selectedIds.has(id)) return response(fallbackRoutine, false);
      selectedIds.add(id);
      reviewed.push({ step, product: products.get(id)!, score: 0 });
    }
    return response(reviewed, true);
  } catch (error) {
    console.error('Diagnostic review unavailable:', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Vérification indisponible' }, { status: 503 });
  }
}
