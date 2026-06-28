import { writeFileSync } from 'fs';
import { join } from 'path';
import { PRODUCTS_DB } from '../src/lib/data';

// Static seed data matching the mock DB defaults in src/lib/supabase.ts
const SETTINGS_SEED = {
  id: 1,
  value: {
    storeName: "Para Officinal S.A",
    freeShippingThreshold: 600,
    shippingFee: 35,
    quizDiscountPercent: 15,
    coupons: [
      { code: "BEAUTY10", discountPercent: 10, freeShipping: false, isActive: true },
      { code: "CLINICAL15", discountPercent: 15, freeShipping: false, isActive: true },
      { code: "FREESHIP", discountPercent: 0, freeShipping: true, isActive: true },
      { code: "GIFTGLOW", discountPercent: 0, freeShipping: false, giftItem: 'Masque Hydra-Glow Offert', isActive: true }
    ]
  }
};

const ADVICE_ARTICLES = [
  {
    id: "art_1",
    slug: "routine-kbeauty-glass-skin",
    title_fr: "Le Secret du 'Glass Skin' Coréen : Routine Complète Étape par Étape",
    title_ar: "سر البشرة الزجاجية الكورية: روتين كامل خطوة بخطوة",
    summary_fr: "Découvrez comment obtenir une peau ultra-lumineuse, lisse et rebondie grâce aux techniques de superposition d'hydratation de la K-Beauty.",
    summary_ar: "اكتشفي كيفية الحصول على بشرة أرق وأكثر مرونة ونضارة باستخدام تقنيات ترطيب البشرة الكورية المتطورة.",
    content_fr: "La tendance du **Glass Skin** consiste à obtenir une peau si saine, lisse et hydratée qu'elle en devient translucide et lumineuse comme du verre. Ce n'est pas une question de maquillage, mais de santé cutanée.\n\n### Les Étapes Clés de la Routine\n\n1. **Le Double Nettoyage** : Commencez par une huile démaquillante pour dissoudre le sébum, suivie d'un nettoyant aqueux doux pour éliminer les impuretés.\n2. **L'Exfoliation Douce** : Utilisez un exfoliant chimique doux (comme les PHA ou l'acide salicylique) 2 à 3 fois par semaine pour lisser le grain de peau.\n3. **La Superposition d'Hydratation (7 Skin Method)** : Appliquez plusieurs couches fines de toner hydratant sans alcool pour repulper la peau en profondeur.\n4. **L'Essence aux Mucines d'Escargot** : Apportez des nutriments essentiels et favorisez la réparation cutanée avec une essence concentrée.\n5. **Le Sérum Éclat** : Un sérum à la niacinamide ou à l'acide hyaluronique pour cibler l'hyperpigmentation et illuminer.\n6. **L'Hydratation Scellante** : Une crème barrière pour retenir toute l'hydratation accumulée.\n7. **La Protection Solaire (Jour)** : L'étape indispensable pour prévenir le vieillissement prématuré.\n\nAdoptez cette routine quotidiennement pour révéler l'éclat naturel de votre teint !",
    content_ar: "تعتمد صيحة **البشرة الزجاجية (Glass Skin)** على تحقيق بشرة صحية وناعمة ورطبة للغاية لدرجة أنها تبدو شفافة ومشرقة مثل الزجاج. لا يتعلق الأمر بالمكياج، بل بصحة البشرة الفائقة.\n\n### الخطوات الأساسية للروتين:\n\n1. **التنظيف المزدوج**: ابدئي بـ زيت منظم لإذابة الدهون، يليه غسول مائي لطيف لإزالة الشوائب.\n2. **التقشير اللطiff**: استخدمي مقشراً كيميائياً لطيفاً (مثل PHA أو حمض الساليسيليك) مرتين إلى ثلاث مرات في الأسبوع لتنعيم ملمس البشرة.\n3. **طبقات الترطيب المتعددة**: ضعي عدة طبقات خfيفة من التونر المرطب الخالي من الكحول لترطيب البشرة بعمق.\n4. **إيسنس حلزوني**: غذي بشرتكِ بالمواد الأساسية وعززي إصلاح الخلايا باستخدام خلاصة الحلزون المركزة.\n5. **سيروم النضارة**: سيروم النياسيناميد أو حمض الهيالورونيك لاستهداف التصبغات وإضاءة البشرة.\n6. **كريم مرطب واقي**: كريم حاجز للبشرة لحبس كل الترطيب المتراكم.\n7. **واقي الشمس (نهاراً)**: الخطوة الأهم لحماية البشرة من الشيخوخة المبكرة.\n\nاعتمدي هذا الروتين يومياً لتكشفي عن الإشراق الطبيعي لبشرتكِ!",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    category: "kbeauty",
    read_time: 6,
    recommended_products: [1, 2, 3],
    status: "published"
  },
  {
    id: "art_2",
    slug: "combattre-acne-acide-salicylique",
    title_fr: "Comment l'Acide Salicylique Révolutionne le Traitement de l'Acné",
    title_ar: "كيف يعالج حمض الساليسيليك حب الشباب ويمنع ظهوره",
    summary_fr: "Comprendre le fonctionnement du BHA pour désobstruer les pores, réguler le sébum et éliminer les imperfections tenaces sans agresser la barrière cutanée.",
    summary_ar: "تعرفي على كيفية عمل BHA لفتح المسام المسدودة وتنظيم إفراز الدهون والتخلص من العيوب دون الإضرار بحاجز البشرة.",
    content_fr: "L'acide salicylique est un acide bêta-hydroxylé (BHA) liposoluble. Contrairement aux AHA qui travaillent en surface, le BHA pénètre en profondeur dans les pores pour dissoudre l'excès de sébum et les cellules mortes.\n\n### Pourquoi l'utiliser ?\n* **Désobstruction des Pores** : Idéal contre les points noirs et microkystes.\n* **Régulation du Sébum** : Réduit la brillance de la zone T.\n* **Action Anti-inflammatoire** : Calme les rougeurs des boutons actifs.\n\n### Conseils d'Utilisation\nIntégrez-le progressivement (1 à 2 fois par semaine au début) le soir, après le nettoyage et avant vos soins hydratants. N'oubliez jamais d'appliquer une protection solaire le lendemain matin car les acides rendent la peau plus sensible au soleil.",
    content_ar: "حمض الساليسيليك هو حمض بيتا هيدروكسي (BHA) قابل للذوبان في الدهون. على عكس أحماض AHA التي تعمل على السطح، يتغلغل BHA بعمق في المسام لإذابة الدهون الزائدة والخلايا الميتة.\n\n### لماذا يجب استخدامه؟\n* **تنظيف المسام**: مثالي لمحاربة الرؤوس السوداء والدهون المتراكمة.\n* **تنظيم الدهون**: يقلل من لمعان منطقة الـ T-zone.\n* **مضاد للالتهابات**: يهدئ احمرار الحبوب النشطة.\n\n### نصائح الاستخدام:\nأدخلي السيروم تدريجياً (مرة إلى مرتين في الأسبوع في البداية) في روتينكِ المسائي, بعد التنظيف وقبل المرطب. لا تنسي تطبيق واقي الشمس في صباح اليوم التالي لأن الأحماض تزيد من حساسية البشرة للشمس.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    category: "skincare",
    read_time: 4,
    recommended_products: [4, 5],
    status: "published"
  }
];

const CODE_SNIPPETS = [
  {
    id: "snip_1",
    name: "Exemple: Google Analytics & Tag Manager (Mock)",
    code: "<!-- Global site tag (gtag.js) - Google Analytics -->\n<script>\n  console.log('[Mock Google Analytics] Script initialisé.');\n</script>",
    location: "head",
    active: true,
    trigger_type: "client",
    cron_expression: null
  },
  {
    id: "snip_2",
    name: "Exemple: Pixel Facebook (Mock)",
    code: "<!-- Facebook Pixel Code -->\n<script>\n  console.log('[Mock Facebook Pixel] Événement PageView enregistré.');\n</script>",
    location: "body_start",
    active: false,
    trigger_type: "client",
    cron_expression: null
  },
  {
    id: "cron_1",
    name: "Exemple Cron: Archivage Automatique des Logs",
    code: "console.log('Début de l\\'archivage automatique des logs...');\n// Simulation d'une tâche de maintenance sur la base de données\nconsole.log('Nettoyage des anciens logs d\\'audit terminé avec succès.');",
    location: "head",
    active: true,
    trigger_type: "cron",
    cron_expression: "*/5 * * * *"
  }
];

function escapeSqlString(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function escapeSqlArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "'{}'::TEXT[]";
  const elements = arr.map(e => `"${e.replace(/"/g, '\\"')}"`).join(',');
  return `'` + `{${elements}}` + `'::TEXT[]`;
}

function generateSeed() {
  const sqlLines: string[] = [];

  sqlLines.push('-- ============================================================');
  sqlLines.push('-- Supabase Database Seed File');
  sqlLines.push('-- Generated on: ' + new Date().toISOString());
  sqlLines.push('-- ============================================================');
  sqlLines.push('');

  // 1. Seed Settings
  sqlLines.push('-- ─── settings seed ──────────────────────────────────────────');
  const settingsJson = JSON.stringify(SETTINGS_SEED.value);
  sqlLines.push(`INSERT INTO settings (id, value)`);
  sqlLines.push(`VALUES (1, ${escapeSqlString(settingsJson)})`);
  sqlLines.push(`ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;`);
  sqlLines.push('');

  // 2. Seed Products
  sqlLines.push('-- ─── products seed ──────────────────────────────────────────');
  for (const p of PRODUCTS_DB) {
    const imagesArr = p.images && p.images.length > 0 ? p.images : [p.image];
    const tagsArr = p.tags || [];
    
    sqlLines.push(`INSERT INTO products (id, title, name, name_fr, vendor, image, images, price, compare_price, category, tags, rating, reviews, description, ingredients, usage, stock, sku, buying_cost, points, status)`);
    sqlLines.push(`VALUES (`);
    sqlLines.push(`  ${p.id},`);
    sqlLines.push(`  ${escapeSqlString(p.title)},`);
    sqlLines.push(`  ${escapeSqlString(p.name)},`);
    sqlLines.push(`  ${escapeSqlString(p.nameFr)},`);
    sqlLines.push(`  ${escapeSqlString(p.vendor)},`);
    sqlLines.push(`  ${escapeSqlString(p.image)},`);
    sqlLines.push(`  ${escapeSqlArray(imagesArr)},`);
    sqlLines.push(`  ${p.price.toFixed(2)},`);
    sqlLines.push(`  ${(p.comparePrice || p.price).toFixed(2)},`);
    sqlLines.push(`  ${escapeSqlString(p.category)},`);
    sqlLines.push(`  ${escapeSqlArray(tagsArr)},`);
    sqlLines.push(`  ${p.rating || 5},`);
    sqlLines.push(`  ${p.reviews || 0},`);
    sqlLines.push(`  ${escapeSqlString(p.description)},`);
    sqlLines.push(`  ${escapeSqlString(p.ingredients)},`);
    sqlLines.push(`  ${escapeSqlString(p.usage)},`);
    sqlLines.push(`  ${p.stock !== undefined ? p.stock : 100},`);
    sqlLines.push(`  ${escapeSqlString(p.sku || null)},`);
    sqlLines.push(`  ${p.buyingCost !== undefined ? p.buyingCost : 'NULL'},`);
    sqlLines.push(`  ${p.points !== undefined ? p.points : 0},`);
    sqlLines.push(`  'live'`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET`);
    sqlLines.push(`  title = EXCLUDED.title,`);
    sqlLines.push(`  name = EXCLUDED.name,`);
    sqlLines.push(`  name_fr = EXCLUDED.name_fr,`);
    sqlLines.push(`  vendor = EXCLUDED.vendor,`);
    sqlLines.push(`  image = EXCLUDED.image,`);
    sqlLines.push(`  images = EXCLUDED.images,`);
    sqlLines.push(`  price = EXCLUDED.price,`);
    sqlLines.push(`  compare_price = EXCLUDED.compare_price,`);
    sqlLines.push(`  category = EXCLUDED.category,`);
    sqlLines.push(`  tags = EXCLUDED.tags,`);
    sqlLines.push(`  description = EXCLUDED.description,`);
    sqlLines.push(`  ingredients = EXCLUDED.ingredients,`);
    sqlLines.push(`  usage = EXCLUDED.usage,`);
    sqlLines.push(`  sku = EXCLUDED.sku,`);
    sqlLines.push(`  buying_cost = EXCLUDED.buying_cost,`);
    sqlLines.push(`  points = EXCLUDED.points;`);
  }
  sqlLines.push('');

  // 3. Seed Advice Articles
  sqlLines.push('-- ─── advice articles seed ──────────────────────────────────');
  for (const art of ADVICE_ARTICLES) {
    const recommendedStr = art.recommended_products ? `'[${art.recommended_products.join(',')}]'::JSONB` : "'[]'::JSONB";
    sqlLines.push(`INSERT INTO advice_articles (id, slug, title_fr, title_ar, summary_fr, summary_ar, content_fr, content_ar, image, category, read_time, recommended_products, status)`);
    sqlLines.push(`VALUES (`);
    sqlLines.push(`  ${escapeSqlString(art.id)},`);
    sqlLines.push(`  ${escapeSqlString(art.slug)},`);
    sqlLines.push(`  ${escapeSqlString(art.title_fr)},`);
    sqlLines.push(`  ${escapeSqlString(art.title_ar)},`);
    sqlLines.push(`  ${escapeSqlString(art.summary_fr)},`);
    sqlLines.push(`  ${escapeSqlString(art.summary_ar)},`);
    sqlLines.push(`  ${escapeSqlString(art.content_fr)},`);
    sqlLines.push(`  ${escapeSqlString(art.content_ar)},`);
    sqlLines.push(`  ${escapeSqlString(art.image)},`);
    sqlLines.push(`  ${escapeSqlString(art.category)},`);
    sqlLines.push(`  ${art.read_time || 5},`);
    sqlLines.push(`  ${recommendedStr},`);
    sqlLines.push(`  ${escapeSqlString(art.status)}`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET`);
    sqlLines.push(`  slug = EXCLUDED.slug,`);
    sqlLines.push(`  title_fr = EXCLUDED.title_fr,`);
    sqlLines.push(`  title_ar = EXCLUDED.title_ar,`);
    sqlLines.push(`  summary_fr = EXCLUDED.summary_fr,`);
    sqlLines.push(`  summary_ar = EXCLUDED.summary_ar,`);
    sqlLines.push(`  content_fr = EXCLUDED.content_fr,`);
    sqlLines.push(`  content_ar = EXCLUDED.content_ar,`);
    sqlLines.push(`  image = EXCLUDED.image,`);
    sqlLines.push(`  category = EXCLUDED.category,`);
    sqlLines.push(`  read_time = EXCLUDED.read_time,`);
    sqlLines.push(`  recommended_products = EXCLUDED.recommended_products,`);
    sqlLines.push(`  status = EXCLUDED.status;`);
  }
  sqlLines.push('');

  // 4. Seed Code Snippets
  sqlLines.push('-- ─── code snippets seed ─────────────────────────────────────');
  for (const snip of CODE_SNIPPETS) {
    sqlLines.push(`INSERT INTO code_snippets (id, name, code, location, active, trigger_type, cron_expression)`);
    sqlLines.push(`VALUES (`);
    sqlLines.push(`  ${escapeSqlString(snip.id)},`);
    sqlLines.push(`  ${escapeSqlString(snip.name)},`);
    sqlLines.push(`  ${escapeSqlString(snip.code)},`);
    sqlLines.push(`  ${escapeSqlString(snip.location)},`);
    sqlLines.push(`  ${snip.active},`);
    sqlLines.push(`  ${escapeSqlString(snip.trigger_type)},`);
    sqlLines.push(`  ${escapeSqlString(snip.cron_expression)}`);
    sqlLines.push(`) ON CONFLICT (id) DO UPDATE SET`);
    sqlLines.push(`  name = EXCLUDED.name,`);
    sqlLines.push(`  code = EXCLUDED.code,`);
    sqlLines.push(`  location = EXCLUDED.location,`);
    sqlLines.push(`  active = EXCLUDED.active,`);
    sqlLines.push(`  trigger_type = EXCLUDED.trigger_type,`);
    sqlLines.push(`  cron_expression = EXCLUDED.cron_expression;`);
  }
  sqlLines.push('');

  const destPath = join(__dirname, '../supabase/seed.sql');
  writeFileSync(destPath, sqlLines.join('\n'), 'utf8');
  console.log(`Successfully generated seed SQL at ${destPath}`);
}

generateSeed();
