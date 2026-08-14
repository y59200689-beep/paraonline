import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageDiagnostic, canEditContent } from '@/lib/permissions';
import { authorizeAdminMutation } from '@/lib/admin-authorization';

const DEFAULT_SEED_QUESTIONS = [
  {
    question_key: 'skinType',
    text_fr: 'Comment votre peau se comporte-t-elle en fin de journée ?',
    text_ar: 'كيف تبدو بشرتك في نهاية اليوم؟',
    subtitle_fr: 'Choisissez la description qui vous ressemble le plus.',
    subtitle_ar: 'اختاري الوصف الأقرب إلى بشرتك.',
    question_type: 'single', required: true, enabled: true, display_order: 1,
    answers: [
      { value_key: 'oily', label_fr: 'Grasse', label_ar: 'دهنية', icon: 'droplets', display_order: 1, enabled: true },
      { value_key: 'dry', label_fr: 'Sèche', label_ar: 'جافة', icon: 'wind', display_order: 2, enabled: true },
      { value_key: 'mixed', label_fr: 'Mixte', label_ar: 'مختلطة', icon: 'split', display_order: 3, enabled: true },
      { value_key: 'normal', label_fr: 'Équilibrée', label_ar: 'متوازنة', icon: 'sparkles', display_order: 4, enabled: true },
    ],
  },
  {
    question_key: 'concern',
    text_fr: 'Quel résultat souhaitez-vous cibler en premier ?',
    text_ar: 'ما النتيجة التي ترغبين في استهدافها أولاً؟',
    subtitle_fr: 'La routine sera organisée autour de cette priorité.',
    subtitle_ar: 'سيتم تنظيم الروتين حول هذه الأولوية.',
    question_type: 'single', required: true, enabled: true, display_order: 2,
    answers: [
      { value_key: 'acne', label_fr: 'Imperfections', label_ar: 'الشوائب', icon: 'target', display_order: 1, enabled: true },
      { value_key: 'spots', label_fr: 'Taches et éclat', label_ar: 'البقع والإشراقة', icon: 'sun', display_order: 2, enabled: true },
      { value_key: 'wrinkles', label_fr: "Premiers signes de l'âge", label_ar: 'علامات التقدم في السن', icon: 'clock', display_order: 3, enabled: true },
      { value_key: 'dryness', label_fr: 'Hydratation et confort', label_ar: 'الترطيب والراحة', icon: 'droplet', display_order: 4, enabled: true },
      { value_key: 'redness', label_fr: 'Rougeurs', label_ar: 'الاحمرار', icon: 'heart', display_order: 5, enabled: true },
    ],
  },
  {
    question_key: 'sensitivity',
    text_fr: 'Votre peau réagit-elle facilement aux nouveaux soins ?',
    text_ar: 'هل تتفاعل بشرتك بسهولة مع المنتجات الجديدة؟',
    subtitle_fr: "Cela nous aide à doser les actifs et à privilégier la douceur.",
    subtitle_ar: 'يساعدنا ذلك على اختيار تركيز المكونات والعناية اللطيفة.',
    question_type: 'single', required: true, enabled: true, display_order: 3,
    answers: [
      { value_key: 'high', label_fr: 'Très facilement', label_ar: 'بسهولة كبيرة', icon: 'shield-alert', display_order: 1, enabled: true },
      { value_key: 'medium', label_fr: 'Parfois', label_ar: 'أحياناً', icon: 'shield', display_order: 2, enabled: true },
      { value_key: 'low', label_fr: 'Rarement', label_ar: 'نادراً', icon: 'shield-check', display_order: 3, enabled: true },
    ],
  },
  {
    question_key: 'breakoutFrequency',
    text_fr: 'À quelle fréquence voyez-vous apparaître des imperfections ?',
    text_ar: 'كم مرة تظهر لديك الشوائب؟',
    subtitle_fr: "Même une peau sèche peut présenter des imperfections occasionnelles.",
    subtitle_ar: 'حتى البشرة الجافة قد تظهر عليها شوائب أحياناً.',
    question_type: 'single', required: true, enabled: true, display_order: 4,
    answers: [
      { value_key: 'frequent', label_fr: 'Souvent', label_ar: 'غالباً', icon: 'calendar-days', display_order: 1, enabled: true },
      { value_key: 'occasional', label_fr: 'Occasionnellement', label_ar: 'أحياناً', icon: 'calendar', display_order: 2, enabled: true },
      { value_key: 'rare', label_fr: 'Rarement', label_ar: 'نادراً', icon: 'check', display_order: 3, enabled: true },
    ],
  },
  {
    question_key: 'sunExposure',
    text_fr: 'Combien de temps passez-vous au soleil la plupart des jours ?',
    text_ar: 'كم من الوقت تقضين تحت الشمس في معظم الأيام؟',
    subtitle_fr: "Pensez aux trajets, aux fenêtres et aux activités extérieures.",
    subtitle_ar: 'فكري في التنقل والنوافذ والأنشطة الخارجية.',
    question_type: 'single', required: true, enabled: true, display_order: 5,
    answers: [
      { value_key: 'intense', label_fr: 'Exposition importante', label_ar: 'تعرض مرتفع', icon: 'sun', display_order: 1, enabled: true },
      { value_key: 'moderate', label_fr: 'Exposition modérée', label_ar: 'تعرض متوسط', icon: 'cloud-sun', display_order: 2, enabled: true },
      { value_key: 'low', label_fr: 'Faible exposition', label_ar: 'تعرض منخفض', icon: 'house', display_order: 3, enabled: true },
    ],
  },
  {
    question_key: 'spfHabit',
    text_fr: 'À quelle fréquence appliquez-vous une protection SPF ?',
    text_ar: 'كم مرة تستخدمين واقي الشمس؟',
    subtitle_fr: "Une protection régulière influence l'ordre de priorité de la routine.",
    subtitle_ar: 'الاستعمال المنتظم يؤثر على ترتيب أولويات الروتين.',
    question_type: 'single', required: true, enabled: true, display_order: 6,
    answers: [
      { value_key: 'daily', label_fr: 'Tous les jours', label_ar: 'يومياً', icon: 'badge-check', display_order: 1, enabled: true },
      { value_key: 'sometimes', label_fr: "Quand j'y pense", label_ar: 'عندما أتذكر', icon: 'circle-dashed', display_order: 2, enabled: true },
      { value_key: 'never', label_fr: 'Rarement ou jamais', label_ar: 'نادراً أو أبداً', icon: 'plus', display_order: 3, enabled: true },
    ],
  },
  {
    question_key: 'activeTolerance',
    text_fr: 'Quel est votre niveau avec les actifs concentrés ?',
    text_ar: 'ما مستوى خبرتك مع المكونات الفعالة المركزة؟',
    subtitle_fr: "Par exemple les acides exfoliants, la vitamine C ou le rétinol.",
    subtitle_ar: 'مثل أحماض التقشير أو فيتامين C أو الريتينول.',
    question_type: 'single', required: true, enabled: true, display_order: 7,
    answers: [
      { value_key: 'beginner', label_fr: 'Je débute', label_ar: 'مبتدئة', icon: 'sprout', display_order: 1, enabled: true },
      { value_key: 'intermediate', label_fr: "J'en utilise déjà", label_ar: 'أستخدمها بالفعل', icon: 'flask', display_order: 2, enabled: true },
      { value_key: 'advanced', label_fr: "Je suis habitué(e)", label_ar: 'لدي خبرة', icon: 'layers', display_order: 3, enabled: true },
    ],
  },
  {
    question_key: 'routineDepth',
    text_fr: 'Quel format de routine pourrez-vous suivre régulièrement ?',
    text_ar: 'ما نوع الروتين الذي يمكنك الالتزام به بانتظام؟',
    subtitle_fr: "La meilleure routine reste celle que vous utilisez avec constance.",
    subtitle_ar: 'أفضل روتين هو الذي يمكنك الالتزام به باستمرار.',
    question_type: 'single', required: true, enabled: true, display_order: 8,
    answers: [
      { value_key: 'essential', label_fr: "L'essentiel", label_ar: 'الأساسيات', icon: 'list', display_order: 1, enabled: true },
      { value_key: 'balanced', label_fr: 'Équilibrée', label_ar: 'متوازن', icon: 'layout', display_order: 2, enabled: true },
      { value_key: 'complete', label_fr: 'Complète', label_ar: 'كامل', icon: 'rows', display_order: 3, enabled: true },
    ],
  },
];

const Q_SELECT = `
  id, question_key, text_fr, text_ar, subtitle_fr, subtitle_ar,
  question_type, required, enabled, display_order,
  cms_diagnostic_answers (
    id, question_id, value_key, label_fr, label_ar, icon, display_order, enabled
  )
`;

async function seedAndFetch() {
  for (const q of DEFAULT_SEED_QUESTIONS) {
    const { answers, ...qRow } = q;
    const { data: inserted } = await supabaseAdmin
      .from('cms_diagnostic_questions')
      .upsert({ ...qRow, created_by: 'system', updated_by: 'system' }, { onConflict: 'question_key' })
      .select('id, question_key')
      .single();

    if (inserted?.id && answers?.length) {
      const answerRows = answers.map(a => ({
        ...a, question_id: inserted.id,
      }));
      await supabaseAdmin
        .from('cms_diagnostic_answers')
        .upsert(answerRows, { onConflict: 'question_id,value_key' });
    }
  }

  const { data } = await supabaseAdmin
    .from('cms_diagnostic_questions')
    .select(Q_SELECT)
    .order('display_order', { ascending: true });
  return data;
}

export async function GET(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditContent(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { data: fetchedQuestions, error } = await supabaseAdmin
      .from('cms_diagnostic_questions')
      .select(Q_SELECT)
      .order('display_order', { ascending: true });
    let questions = fetchedQuestions;

    if (error || !questions || questions.length === 0) {
      questions = await seedAndFetch();
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: DEFAULT_SEED_QUESTIONS });
    }

    const withSortedAnswers = (questions ?? []).map((q: any) => ({
      ...q,
      answers: (q.cms_diagnostic_answers ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    }));

    return NextResponse.json({ questions: withSortedAnswers });
  } catch {
    return NextResponse.json({ questions: DEFAULT_SEED_QUESTIONS });
  }
}

export async function POST(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageDiagnostic });
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;

  const body = await req.json();
  const { question_key, text_fr, text_ar, subtitle_fr, subtitle_ar, question_type, required, display_order } = body;
  if (!question_key || !text_fr) return NextResponse.json({ error: 'question_key and text_fr are required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cms_diagnostic_questions')
    .insert({
      question_key, text_fr, text_ar: text_ar || '', subtitle_fr: subtitle_fr || null, subtitle_ar: subtitle_ar || null,
      question_type: question_type || 'single', required: required ?? true,
      enabled: true, display_order: display_order ?? 999,
      created_by: session.username, updated_by: session.username,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'diagnostic', entity_id: data.id, entity_label: text_fr,
    action: 'create', previous: null, next_state: data, changed_by: session.username,
  }).then(() => {});

  return NextResponse.json({ question: { ...data, answers: [] } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageDiagnostic });
  if (!authorization.authorized) return authorization.response;
  const session = authorization.operator;

  const body = await req.json();
  const { id, type, ...fields } = body;

  // Bulk reorder: { type: 'reorder', items: [{id, display_order}] }
  if (type === 'reorder') {
    const items: { id: string; display_order: number }[] = body.items ?? [];
    await Promise.all(
      items.map(item =>
        supabaseAdmin.from('cms_diagnostic_questions').update({ display_order: item.display_order, updated_by: session.username }).eq('id', item.id)
      )
    );
    return NextResponse.json({ ok: true });
  }

  // Answer operations: { type: 'answer_add' | 'answer_update' | 'answer_delete', ... }
  if (type === 'answer_add') {
    const { question_id, value_key, label_fr, label_ar, icon, display_order: aOrder } = body;
    if (!question_id || !value_key || !label_fr) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('cms_diagnostic_answers')
      .insert({ question_id, value_key, label_fr, label_ar: label_ar || '', icon: icon || null, display_order: aOrder ?? 999, enabled: true })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ answer: data }, { status: 201 });
  }

  if (type === 'answer_update') {
    const { answer_id, ...aFields } = body;
    if (!answer_id) return NextResponse.json({ error: 'Missing answer_id' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('cms_diagnostic_answers')
      .update({ ...aFields, updated_by: session.username }).eq('id', answer_id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ answer: data });
  }

  if (type === 'answer_delete') {
    const { answer_id } = body;
    if (!answer_id) return NextResponse.json({ error: 'Missing answer_id' }, { status: 400 });
    await supabaseAdmin.from('cms_diagnostic_answers').delete().eq('id', answer_id);
    return NextResponse.json({ ok: true });
  }

  // Default: update question fields
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('cms_diagnostic_questions')
    .update({ ...fields, updated_by: session.username })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('cms_change_log').insert({
    entity_type: 'diagnostic', entity_id: id, entity_label: data?.text_fr ?? data?.question_key,
    action: 'update', previous: null, next_state: data, changed_by: session.username,
  }).then(() => {});

  return NextResponse.json({ question: data });
}

export async function DELETE(req: NextRequest) {
  const authorization = await authorizeAdminMutation({ allow: canManageDiagnostic });
  if (!authorization.authorized) return authorization.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await supabaseAdmin.from('cms_diagnostic_answers').delete().eq('question_id', id);
  await supabaseAdmin.from('cms_diagnostic_questions').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
