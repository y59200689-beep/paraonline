import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';
import { canManageAdvice } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

const DEFAULT_ADVICE_ARTICLES = [
  {
    id: "art_1",
    slug: "routine-kbeauty-glass-skin",
    title_fr: "Le Secret du 'Glass Skin' Coréen : Routine Complète Étape par Étape",
    title_ar: "سر البشرة الزجاجية الكورية: روتين كامل خطوة بخطوة",
    summary_fr: "Découvrez comment obtenir une peau ultra-lumineuse, lisse et rebondie grâce aux techniques de superposition d'hydratation de la K-Beauty.",
    summary_ar: "اكتشفي كيفية الحصول على بشرة أرق وأكثر مرونة ونضارة باستخدام تقنيات ترطيب البشرة الكورية المتطورة.",
    content_fr: "La tendance du **Glass Skin** consiste à obtenir une peau si saine, lisse et hydratée qu'elle en devient translucide et lumineuse comme du verre. Ce n'est pas une question de maquillage, mais de santé cutanée.\n\n### Les Étapes Clés de la Routine\n\n1. **Le Double Nettoyage** : Commencez par une huile démaquillante pour dissoudre le sébum, suivie d'un nettoyant aqueux doux pour éliminer les impuretés.\n2. **L'Exfoliation Douce** : Utilisez un exfoliant chimique doux (comme les PHA ou l'acide salicylique) 2 à 3 fois par semaine pour lisser le grain de peau.\n3. **La Superposition d'Hydratation (7 Skin Method)** : Appliquez plusieurs couches fines de toner hydratant sans alcool pour repulper la peau en profondeur.\n4. **L'Essence aux Mucines d'Escargot** : Apportez des nutriments essentiels et favorisez la réparation cutanée avec une essence concentrée.\n5. **Le Sérum Éclat** : Un sérum à la niacinamide ou à l'acide hyaluronique pour cibler l'hyperpigmentation et illuminer.\n6. **L'Hydratation Scellante** : Une crème barrière pour retenir toute l'hydratation accumulée.\n7. **La Protection Solaire (Jour)** : L'étape indispensable pour prévenir le vieillissement prématuré.\n\nAdoptez cette routine quotidiennement pour révéler l'éclat naturel de votre teint !",
    content_ar: "تعتمد صيحة **البشرة الزجاجية (Glass Skin)** على تحقيق بشرة صحية وناعمة ورطبة للغاية لدرجة أنها تبدو شفافة ومشرقة مثل الزجاج. لا يتعلق الأمر بالمكياج، بل بصحة البشرة الفائقة.\n\n### الخطوات الأساسية للروتين:\n\n1. **التنظيف المزدوج**: ابدئي بـ زيت منظم لإذابة الدهون، يليه غسول مائي لطيف لإزالة الشوائب.\n2. **التقشير اللطيف**: استخدمي مقشراً كيميائياً لطيفاً (مثل PHA أو حمض الساليسيليك) مرتين إلى ثلاث مرات في الأسبوع لتنعيم ملمس البشرة.\n3. **طبقات الترطيب المتعددة**: ضعي عدة طبقات خفيفة من التونر المرطب الخالي من الكحول لترطيب البشرة بعمق.\n4. **إيسنس حلزوني**: غذي بشرتكِ بالمواد الأساسية وعززي إصلاح الخلايا باستخدام خلاصة الحلزون المركزة.\n5. **سيروم النضارة**: سيروم النياسيناميد أو حمض الهيالورونيك لاستهداف التصبغات وإضاءة البشرة.\n6. **كريم مرطب واقي**: كريم حاجز للبشرة لحبس كل الترطيب المتراكم.\n7. **واقي الشمس (نهاراً)**: الخطوة الأهم لحماية البشرة من الشمس.\n\nاعتمدي هذا الروتين يومياً لتكشفي عن الإشراق الطبيعي لبشرتكِ!",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    category: "kbeauty",
    read_time: 6,
    recommended_products: [1, 2, 3],
    status: "published",
    created_at: new Date().toISOString()
  },
  {
    id: "art_2",
    slug: "combattre-acne-acide-salicylique",
    title_fr: "Comment l'Acide Salicylique Révolutionne le Traitement de l'Acné",
    title_ar: "كيف يعالج حمض الساليسيليك حب الشباب ويمنع ظهوره",
    summary_fr: "Comprendre le fonctionnement du BHA pour désobstruer les pores, réguler le sébum et éliminer les imperfections tenaces sans agresser la barrière cutanée.",
    summary_ar: "تعرفي على كيفية عمل BHA لفتح المسام المسدودة وتنظيم إفراز الدهون والتخلص من العيوب دون الإضرار بحاجز البشرة.",
    content_fr: "L'acide salicylique est un acide bêta-hydroxylé (BHA) liposoluble. Contrairement aux AHA qui travaillent en surface, le BHA pénètre en profondeur dans les pores pour dissoudre l'excès de sébum et les cellules mortes.\n\n### Pourquoi l'utiliser ?\n* **Désobstruction des Pores** : Idéal contre les points noirs et microkystes.\n* **Régulation du Sébum** : Réduit la brillance de la zone T.\n* **Action Anti-inflambatoire** : Calme les rougeurs des boutons actifs.\n\n### Conseils d'Utilisation\nIntégrez-le progressivement (1 à 2 fois par semaine au début) le soir, après le nettoyage et avant vos soins hydratants. N'oubliez jamais d'appliquer une protection solaire le lendemain matin car les acides rendent la peau plus sensible au soleil.",
    content_ar: "حمض الساليسيليك هو حمض بيتا هيدروكسي (BHA) قابل للذوبان في الدهون. على عكس أحماض AHA التي تعمل على السطح، يتغلغل BHA بعمق في المسام لإذابة الدهون الزائدة والخلايا الميتة.\n\n### لماذا يجب استخدامه؟\n* **تنظيف المسام**: مثالي لمحاربة الرؤوس السوداء والدهون المتراكمة.\n* **تنظيم الدهون**: يقلل من لمعان منطقة الـ T-zone.\n* **مضاد للالتهابات**: يهدئ احمرار الحبوب النشطة.\n\n### نصائح الاستخدام:\nأدخلي السيروم تدريجياً (مرة إلى مرتين في الأسبوع في البداية) في روتينكِ المسائي، بعد التنظيف وقبل المرطب. لا تنسي تطبيق واقي الشمس في صباح اليوم التالي لأن الأحماض تزيد من حساسية البشرة للشمس.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    category: "skincare",
    read_time: 4,
    recommended_products: [4, 5],
    status: "published",
    created_at: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    const { data: fetchedArticles, error } = await supabase
      .from('advice_articles')
      .select('*')
      .order('created_at', { ascending: false });
    let articles = fetchedArticles;

    // Seed default articles if empty or table missing
    if (error || !articles || articles.length === 0) {
      try {
        await supabase.from('advice_articles').upsert(DEFAULT_ADVICE_ARTICLES, { onConflict: 'id' });
        const { data: seeded } = await supabase
          .from('advice_articles')
          .select('*')
          .order('created_at', { ascending: false });
        articles = seeded || DEFAULT_ADVICE_ARTICLES;
      } catch {
        articles = DEFAULT_ADVICE_ARTICLES;
      }
    }

    return NextResponse.json({ success: true, articles: articles || DEFAULT_ADVICE_ARTICLES });
  } catch (error: any) {
    return NextResponse.json({ success: true, articles: DEFAULT_ADVICE_ARTICLES });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 401 });
    }

    if (!canManageAdvice(session.role)) {
      return NextResponse.json({ success: false, error: 'Accès refusé. Droits insuffisants.' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      slug, title_fr, title_ar, content_fr, content_ar, 
      summary_fr, summary_ar, image, category, read_time, 
      recommended_products, status 
    } = body;

    if (!slug || !title_fr || !title_ar || !content_fr || !content_ar || !summary_fr || !summary_ar || !image || !category) {
      return NextResponse.json({ success: false, error: 'Tous les champs requis sont obligatoires.' }, { status: 400 });
    }

    const articleId = `art_${Date.now()}`;
    const newArticle = {
      id: articleId,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      title_fr,
      title_ar,
      content_fr,
      content_ar,
      summary_fr,
      summary_ar,
      image,
      category,
      read_time: Number(read_time || 5),
      recommended_products: recommended_products || [],
      status: status || 'draft',
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('advice_articles')
      .insert(newArticle);

    if (insertError) throw insertError;

    // Log administrative action
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    await supabase.from('audit_logs').insert({
      id: logId,
      action: "Création d'Article",
      details: `L'article "${title_fr}" (${category}) a été créé par l'administrateur "${session.username || session.name || 'admin'}".`,
      date: new Date().toISOString()
    });

    revalidatePath('/advice');
    revalidatePath(`/advice/${newArticle.slug}`);
    revalidatePath('/');

    return NextResponse.json({ success: true, article: newArticle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
