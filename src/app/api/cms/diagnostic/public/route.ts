import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import defaultQuestions from '@/data/diagnostic-questions.json';

const Q_SELECT = `
  id, question_key, text_fr, text_ar, subtitle_fr, subtitle_ar,
  question_type, required, enabled, display_order,
  cms_diagnostic_answers (
    id, question_id, value_key, label_fr, label_ar, icon, display_order, enabled
  )
`;

function mapQuestions(questions: any[]) {
  return questions.map((q: any) => {
    const activeAnswers = (q.answers || q.cms_diagnostic_answers || [])
      .filter((a: any) => a.enabled !== false)
      .sort((a: any, b: any) => (a.display_order ?? 99) - (b.display_order ?? 99));
    const fallback = (defaultQuestions.questions as any[]).find((def: any) => def.field === q.question_key);
    return {
      field: q.question_key,
      eyebrowFr: fallback?.eyebrowFr || 'ÉVALUATION PERSONNALISÉE',
      eyebrowAr: fallback?.eyebrowAr || 'تقييم شخصي',
      questionFr: q.text_fr || fallback?.questionFr || '',
      questionAr: q.text_ar || fallback?.questionAr || '',
      helperFr: q.subtitle_fr || fallback?.helperFr || '',
      helperAr: q.subtitle_ar || fallback?.helperAr || '',
      options: activeAnswers.map((a: any) => ({
        val: a.value_key, labelFr: a.label_fr, labelAr: a.label_ar || a.label_fr,
        descFr: a.description_fr || a.desc_fr || '', descAr: a.description_ar || a.desc_ar || '', icon: a.icon || 'sparkles',
      })),
    };
  });
}

export async function GET() {
  try {
    // A published snapshot is immutable and is the only version exposed to visitors.
    // If the migration has not been applied yet, the query simply falls through to
    // the existing question tables and then to the checked-in fallback JSON.
    const { data: publishedVersion } = await supabaseAdmin
      .from('cms_diagnostic_versions')
      .select('snapshot')
      .eq('status', 'published')
      .maybeSingle();
    const snapshotQuestions = (publishedVersion?.snapshot as any)?.questions;
    if (Array.isArray(snapshotQuestions) && snapshotQuestions.length) {
      const questions = mapQuestions(snapshotQuestions).filter((q: any) => q.options.length > 0);
      if (questions.length) {
        const { data: excludedRows } = await supabaseAdmin.from('diagnostic_excluded_products').select('product_id');
        return NextResponse.json({ questions, excludedProductIds: (excludedRows || []).map((r: { product_id: number }) => r.product_id) }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
      }
    }
    const { data: questions, error } = await supabaseAdmin
      .from('cms_diagnostic_questions')
      .select(Q_SELECT)
      .eq('enabled', true)
      .order('display_order', { ascending: true });

    if (error || !questions || questions.length === 0) {
      return NextResponse.json({ questions: defaultQuestions.questions });
    }

    // Map database rows to storefront DiagnosticQuestion format
    const mapped = mapQuestions(questions);

    // If Supabase has questions but NO answers have been seeded yet, fall back to static JSON
    const hasAnswers = mapped.some((q: any) => q.options.length > 0);
    if (!hasAnswers) {
      return NextResponse.json({ questions: defaultQuestions.questions });
    }

    // Fetch manually excluded product IDs from admin
    const { data: excludedRows } = await supabaseAdmin
      .from('diagnostic_excluded_products')
      .select('product_id');
    const excludedProductIds = (excludedRows || []).map((r: { product_id: number }) => r.product_id);

    return NextResponse.json({ questions: mapped, excludedProductIds }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (err) {
    console.error("Failed to load public diagnostic questions:", err);
    return NextResponse.json({ questions: defaultQuestions.questions });
  }
}
