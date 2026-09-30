import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';

const sendToOpenAI = process.argv.includes('--send-to-openai');
const apiKey = process.env.OPENAI_API_KEY;
if (sendToOpenAI && !apiKey) throw new Error('OPENAI_API_KEY is required');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const searches = [
  { step: 'cleanser', terms: ['%NETTOYANT%VISAGE%', '%GEL NETTOYANT%', '%TOLERIANE%NETTOY%'] },
  { step: 'treatment', terms: ['%SERUM%ANTI TACH%', '%MELASCREEN%SERUM%', '%PIGMENT%SERUM%'] },
  { step: 'moisturizer', terms: ['%CREME%HYDRATANTE%VISAGE%', '%TOLERIANE%CREME%', '%CERAVE%VISAGE%'] },
  { step: 'sunscreen', terms: ['%ANTHELIOS%ECRAN%', '%ECRAN%VISAGE%SPF%', '%PHOTODERM%SPF%'] },
];

const candidates = new Map();
for (const { step, terms } of searches) {
  for (const term of terms) {
    const { data, error } = await supabase.from('products')
      .select('id,title,vendor,category,stock,description,ingredients,usage')
      .eq('status', 'live').gt('stock', 0).ilike('title', term)
      .order('stock', { ascending: false }).limit(8);
    if (error) throw error;
    for (const product of data || []) {
      candidates.set(product.id, {
        id: product.id,
        stepHint: step,
        title: product.title,
        vendor: product.vendor,
        category: product.category,
        description: (product.description || '').slice(0, 600),
        ingredients: (product.ingredients || '').slice(0, 400),
        usage: (product.usage || '').slice(0, 400),
      });
    }
  }
}

const inputProducts = [...candidates.values()];
await writeFile('artifacts/diagnostic-review-candidates.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  profile: { skinType: 'dry', concern: 'spots', sensitivity: 'medium', routineDepth: 'balanced' },
  products: inputProducts,
}, null, 2));

if (!sendToOpenAI) {
  console.log(JSON.stringify({ candidateCount: inputProducts.length, byStep: Object.fromEntries(searches.map(({ step }) => [step, inputProducts.filter(product => product.stepHint === step).length])) }));
  process.exit(0);
}

const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-5-mini',
    store: false,
    instructions: 'You assist a cosmetic product reviewer. Use only the supplied catalogue data. Do not invent ingredients, SPF ratings, suitability, or product IDs. This is a product shortlist for human review, not a medical diagnosis. If title and metadata do not support compatibility, mark it needs_verification. Reject body-only, baby, or clearly oily-skin mattifying products for this profile. Return concise French reasons.',
    input: JSON.stringify({ profile: { skinType: 'dry', concern: 'spots', sensitivity: 'medium', routineDepth: 'balanced' }, products: inputProducts }),
    text: { format: {
      type: 'json_schema', name: 'diagnostic_product_review', strict: true,
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          selections: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
            step: { type: 'string', enum: ['cleanser', 'treatment', 'moisturizer', 'sunscreen'] },
            productId: { type: 'integer' },
            verdict: { type: 'string', enum: ['plausible', 'needs_verification', 'reject'] },
            reason: { type: 'string' },
            missingEvidence: { type: 'string' },
          }, required: ['step', 'productId', 'verdict', 'reason', 'missingEvidence'] } },
        }, required: ['selections'],
      },
    } },
  }),
});

const result = await response.json();
if (!response.ok) throw new Error(`OpenAI request failed (${response.status}): ${result.error?.type || 'unknown'}`);
const outputText = (result.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('');
const parsed = JSON.parse(outputText);
const validIds = new Set(inputProducts.map(product => product.id));
const selections = parsed.selections.filter(item => validIds.has(item.productId));
const report = {
  generatedAt: new Date().toISOString(),
  model: 'gpt-5-mini',
  profile: { skinType: 'dry', concern: 'spots', sensitivity: 'medium', routineDepth: 'balanced' },
  candidateCount: inputProducts.length,
  selections: selections.map(item => ({ ...item, product: inputProducts.find(product => product.id === item.productId) })),
  note: 'AI-assisted shortlist only. Product suitability and diagnostic tags require independent review before publication.',
};
await writeFile('artifacts/diagnostic-ai-review.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ candidateCount: report.candidateCount, selections: selections.map(({ step, productId, verdict }) => ({ step, productId, verdict })) }));
