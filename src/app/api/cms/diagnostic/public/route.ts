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

export async function GET() {
  try {
    const { data: questions, error } = await supabaseAdmin
      .from('cms_diagnostic_questions')
      .select(Q_SELECT)
      .eq('enabled', true)
      .order('display_order', { ascending: true });

    if (error || !questions || questions.length === 0) {
      return NextResponse.json({ questions: defaultQuestions.questions });
    }

    // Map database rows to storefront DiagnosticQuestion format
    const mapped = questions.map((q: any) => {
      const activeAnswers = (q.cms_diagnostic_answers || [])
        .filter((a: any) => a.enabled !== false)
        .sort((a: any, b: any) => (a.display_order ?? 99) - (b.display_order ?? 99));

      // Match eyebrow headers from default questions if missing
      const fallback = (defaultQuestions.questions as any[]).find(
        (def: any) => def.field === q.question_key
      );

      return {
        field: q.question_key,
        eyebrowFr: fallback?.eyebrowFr || 'ÉVALUATION PERSONNALISÉE',
        eyebrowAr: fallback?.eyebrowAr || 'تقييم شخصي',
        questionFr: q.text_fr || fallback?.questionFr || '',
        questionAr: q.text_ar || fallback?.questionAr || '',
        helperFr: q.subtitle_fr || fallback?.helperFr || '',
        helperAr: q.subtitle_ar || fallback?.helperAr || '',
        options: activeAnswers.map((a: any) => ({
          val: a.value_key,
          labelFr: a.label_fr,
          labelAr: a.label_ar || a.label_fr,
          descFr: a.desc_fr || '',
          descAr: a.desc_ar || '',
          icon: a.icon || 'sparkles',
        })),
      };
    });

    // If Supabase has questions but NO answers have been seeded yet, fall back to static JSON
    const hasAnswers = mapped.some((q: any) => q.options.length > 0);
    if (!hasAnswers) {
      return NextResponse.json({ questions: defaultQuestions.questions });
    }

    return NextResponse.json({ questions: mapped }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (err) {
    console.error("Failed to load public diagnostic questions:", err);
    return NextResponse.json({ questions: defaultQuestions.questions });
  }
}
