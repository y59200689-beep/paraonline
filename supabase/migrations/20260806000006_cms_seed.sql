-- ============================================================
-- CMS: Seed migration — convert hardcoded data to CMS records
-- ============================================================
-- This migration converts existing hardcoded application data into
-- initial CMS records. It is safe to re-run (uses ON CONFLICT DO NOTHING).
-- The public storefront continues to use fallback code paths until
-- the admin explicitly publishes each record.

-- ─── Seed cms_pages ──────────────────────────────────────────
-- Initial page stubs for every managed storefront page.
-- section_order is seeded with the same defaults that page.tsx uses.
INSERT INTO cms_pages (id, slug, page_type, title_fr, title_ar, status, created_by, updated_by, section_order)
VALUES
  ('page-home',            'home',             'home',             'Accueil',                    'الصفحة الرئيسية',         'published', 'system', 'system',
   '[
     {"id":"hero-1","type":"hero","nameFr":"Carrousel Héro","visible":true},
     {"id":"categoryTrack-1","type":"categoryTrack","nameFr":"Barre Catégories","visible":true},
     {"id":"productGrid-1","type":"productGrid","nameFr":"Grille Produits","visible":true},
     {"id":"brandPartners-1","type":"brandPartners","nameFr":"Marques Partenaires","visible":true},
     {"id":"diagnosticBanner-1","type":"diagnosticBanner","nameFr":"Diagnostic Peau IA","visible":false},
     {"id":"summerSale-1","type":"summerSale","nameFr":"Offres Été","visible":true},
     {"id":"dermoCorner-1","type":"dermoCorner","nameFr":"Dermo Corner","visible":true},
     {"id":"customerReviews-1","type":"customerReviews","nameFr":"Avis Clients","visible":true},
     {"id":"triplePromo-1","type":"triplePromo","nameFr":"Bannières Triple","visible":true},
     {"id":"topRated-1","type":"topRated","nameFr":"Produits les Mieux Notés","visible":true},
     {"id":"bestSellers-1","type":"bestSellers","nameFr":"Produits les Plus Vendus","visible":true},
     {"id":"routineVisualizer-1","type":"routineVisualizer","nameFr":"Visualiseur Routine","visible":true},
     {"id":"featuredIngredient-1","type":"featuredIngredient","nameFr":"Marques Vedettes","visible":true},
     {"id":"skincareRoutineSteps-1","type":"skincareRoutineSteps","nameFr":"Étapes Routine","visible":true},
     {"id":"activeIngredients-1","type":"activeIngredients","nameFr":"Ingrédients Actifs","visible":true},
     {"id":"ingredientDictionary-1","type":"ingredientDictionary","nameFr":"Dictionnaire Ingrédients","visible":true},
     {"id":"faq-1","type":"faq","nameFr":"FAQ","visible":true},
     {"id":"officialDistributor-1","type":"officialDistributor","nameFr":"Badge Distributeur","visible":true},
     {"id":"trustBar-1","type":"trustBar","nameFr":"Barre Confiance","visible":true}
   ]'::JSONB),

  ('page-about',           'about',            'about',            'À Propos',                   'من نحن',                  'draft', 'system', 'system', '[]'::JSONB),
  ('page-delivery',        'suivi-commande',   'delivery',         'Suivi de Commande',           'تتبع الطلب',              'draft', 'system', 'system', '[]'::JSONB),
  ('page-checkout-success','checkout-success', 'checkout_success', 'Commande Confirmée',          'تم تأكيد الطلب',          'draft', 'system', 'system', '[]'::JSONB),
  ('page-checkout-failure','checkout-failure', 'checkout_failure', 'Paiement Échoué',             'فشل الدفع',               'draft', 'system', 'system', '[]'::JSONB),
  ('page-policies',        'politiques',       'policies',         'Politiques',                  'السياسات',                'draft', 'system', 'system', '[]'::JSONB),
  ('page-portal',          'customer-portal',  'customer_portal',  'Espace Client',               'حساب العميل',             'draft', 'system', 'system', '[]'::JSONB)

ON CONFLICT (slug) DO NOTHING;

-- ─── Seed cms_brands from hardcoded BRANDS_DATA ──────────────
-- All 15 brands from src/lib/brands.ts migrated as published records.
INSERT INTO cms_brands (name, slug, domain, logo_url, tagline_fr, tagline_ar, description_fr, description_ar, status, display_order, created_by, updated_by)
VALUES
  ('La Roche-Posay',    'la-roche-posay',    'laroche-posay.com',   '/uploads/1783623589633_jkjd_png.png',
   'La vie change la peau, nous changeons sa vie',
   'الحياة تغير البشرة، ونحن نغير حياتها',
   'Recommandée par plus de 90 000 dermatologues dans le monde, La Roche-Posay propose des soins formulés à base d''eau thermale unique pour apaiser et protéger les peaux les plus sensibles et réactives.',
   'موصى بها من قبل أكثر من 90,000 طبيب جلدية حول العالم، تقدم لا روش بوزيه حلولاً علاجية للعناية بالبشرة الحساسة.',
   'published', 1, 'system', 'system'),

  ('Vichy',             'vichy',             'vichyusa.com',        '/uploads/1783623593877_uh_png.png',
   'Santé et beauté de la peau active',
   'صحة وجمال البشرة النشطة',
   'Pionnière de l''exposome et de la santé de la peau, Vichy associe son eau volcanique minéralisante fortifiante à des actifs dermatologiques de pointe pour booster la barrière cutanée.',
   'رائدة في دراسة المؤثرات الخارجية وصحة البشرة، تجمع فيشي بين مياهها البركانية المعدنية والمكونات الجلدية المتقدمة.',
   'published', 2, 'system', 'system'),

  ('CeraVe',            'cerave',            'cerave.com',          '/uploads/1783623598712_dfq_png.png',
   'Développé avec des dermatologues',
   'تم تطويره مع أطباء الجلدية',
   'Soins enrichis en 3 céramides essentiels et acide hyaluronique avec technologie exclusive MVE pour hydrater en continu et restaurer la barrière protectrice de la peau.',
   'عناية فائقة غنية بـ 3 سيراميدات أساسية وحمض الهيالورونيك مع تقنية MVE الحصرية لترطيب مستمر.',
   'published', 3, 'system', 'system'),

  ('Eucerin',           'eucerin',           'eucerin.com',         '/uploads/1783623605965_Eucerin_logo_logotype_png.png',
   'La science d''une peau visiblement plus saine',
   'العلم لبشرة أكثر صحة بشكل ملحوظ',
   'Depuis plus de 100 ans, Eucerin mène des recherches dermatologiques innovantes pour concevoir des formules hautement efficaces répondant à chaque besoin clinique cutané.',
   'منذ أكثر من 100 عام، تقود يوسيرين أبحاثاً جلدية مبتكرة لتطوير تركيبات عالية الفعالية.',
   'published', 4, 'system', 'system'),

  ('Bioderma',          'bioderma',          'bioderma.com',        '/uploads/1783623610675_thf_png.png',
   'La biologie au service de la dermatologie',
   'البيولوجيا في خدمة طب الجلد',
   'Bioderma formule ses produits selon le principe de l''écobiologie, respectant l''écosystème cutané pour préserver sa santé et stimuler ses mécanismes naturels.',
   'تصمم بيوديرما منتجاتها وفقاً لمبدأ علم البيئة الحيوية للجلد.',
   'published', 5, 'system', 'system'),

  ('SVR',               'svr',               'labo-svr.com',        '/uploads/1783623616070_svr_png.png',
   'La dermatologie active hautement concentrée',
   'العناية الجلدية الفعالة وعالية التركيز',
   'Le laboratoire français SVR crée des soins dermo-cosmétiques formulés à des concentrations record d''actifs dermatologiques pour maximiser les résultats sans compromettre la tolérance.',
   'يبتكر مختبر SVR الفرنسي مستحضرات بتركيزات قياسية من المكونات النشطة.',
   'published', 6, 'system', 'system'),

  ('Cetaphil',          'cetaphil',          'cetaphil.com',        '/uploads/1783623621993_op_png.png',
   'Douceur cliniquement prouvée pour les peaux sensibles',
   'نعومة مثبتة سريرياً للبشرة الحساسة',
   'Spécialement formulée pour restaurer la barrière cutanée des peaux sensibles, la marque Cetaphil propose des soins quotidiens doux recommandés pour leur haute tolérance.',
   'مخصصة للعناية بالبشرة الحساسة والجافة، تقدم سيتافيل منتجات تنظيف وترطيب يومية لطيفة.',
   'published', 7, 'system', 'system'),

  ('Avène',             'avene',             'aveneusa.com',        '/uploads/1783623626820_Avene_Logo_jpg.jpg',
   'Apaiser la peau, sublimer la vie',
   'تهدئة البشرة، وتحسين الحياة',
   'Au cœur de chaque soin Avène se trouve l''Eau Thermale d''Avène, cliniquement reconnue pour ses propriétés apaisantes, anti-irritantes et adoucissantes.',
   'في قلب كل مستحضر من أفسين تكمن المياه الحرارية الطبيعية المعترف بفعاليتها سريرياً.',
   'published', 8, 'system', 'system'),

  ('Mixa',              'mixa',              'mixa.fr',             '/uploads/1783623633547_logo_mixa_jpg.jpg',
   'L''expert des peaux sensibles pour toute la famille',
   'خبير البشرة الحساسة لجميع أفراد الأسرة',
   'Née en pharmacie, Mixa répond aux exigences de tolérance et d''efficacité des peaux délicates à travers des soins réparateurs et protecteurs emblématiques.',
   'نشأت ميكسا في الصيدليات لتلبي احتياجات البشرة الحساسة والجافة جداً.',
   'published', 9, 'system', 'system'),

  ('L''Oréal Paris',    'loreal-paris',      'loreal-paris.com',    '/uploads/1783623638829_ikl_png.png',
   'Parce que vous le valez bien',
   'لأنك تستحقينه بجدارة',
   'Leader mondial de la beauté, L''Oréal Paris met la science et l''innovation cosmétique au service de soins anti-âge, capillaires et de maquillage d''exception.',
   'الرائد العالمي في مجال التجميل، تضع لوريال باريس الابتكار العلمي في خدمة مستحضرات العناية.',
   'published', 10, 'system', 'system'),

  ('Garnier',           'garnier',           'garnier.com',         '/uploads/1783623642984_kl_l_png.png',
   'Par nature, naturellement',
   'من الطبيعة، بشكل طبيعي',
   'Engagée dans la beauté durable, Garnier extrait le pouvoir des ingrédients naturels combiné à la science pour offrir des soins capillaires et visage sains et efficaces.',
   'ملتزمة بالجمال المستدام، تستخلص غارنييه قوة المكونات الطبيعية لتقديم روتين صحي وفعال.',
   'published', 11, 'system', 'system'),

  ('Hada Labo Tokyo',   'hada-labo-tokyo',   'hadalabotokyo.com',   NULL,
   'Hydratation profonde et pureté japonaise',
   'ترطيب عميق ونقاء ياباني',
   'Marque numéro 1 au Japon, Hada Labo Tokyo infuse ses soins d''un complexe unique de multiples acides hyaluroniques pour une hydratation intense multicouche de la peau.',
   'العلامة التجارية الأولى في اليابان، تغمر هادا لابو طوكيو مستحضراتها بمركب فريد من أحماض الهيالورونيك.',
   'published', 12, 'system', 'system'),

  ('Anua',              'anua',              'anua.store',          NULL,
   'La simplicité et le calme pour votre peau',
   'البساطة والهدوء لبشرتك',
   'Marque culte de la K-Beauty, Anua se concentre sur des formules clean à base d''ingrédients botaniques apaisants comme le Heartleaf pour calmer les peaux sujettes aux rougeurs.',
   'علامة كورية شهيرة تركز على تركيبات نقية تعتمد على مكونات نباتية مهدئة مثل نبتة هارتليف.',
   'published', 13, 'system', 'system'),

  ('Skin1004',          'skin1004',          'skin1004.com',        NULL,
   'La pureté de la Centella Asiatica de Madagascar',
   'نقاء نبتة السنتيلا الآسيوية من مدغشقر',
   'Reconnue pour ses soins minimalistes à base de Centella Asiatica pure récoltée à Madagascar, Skin1004 répare et fortifie la barrière cutanée des peaux fragiles.',
   'تشتهر بمنتجاتها البسيطة القائمة على نبتة السنتيلا الآسيوية النقية المقطوفة من مدغشقر.',
   'published', 14, 'system', 'system'),

  ('Beauty of Joseon',  'beauty-of-joseon',  'beautyofjoseon.com',  NULL,
   'Sagesse des soins traditionnels coréens Hanbang',
   'حكمة العناية الكورية التقليدية هانبانغ',
   'Inspirée par l''élégance de la dynastie Joseon, cette marque associe des herbes médicinales orientales (Hanbang) à la science moderne pour révéler l''éclat naturel du teint.',
   'مستوحاة من تقاليد النبلاء في عهد سلالة جوسون، تمزج بين الأعشاب الطبية الشرقية والعلم الحديث.',
   'published', 15, 'system', 'system')

ON CONFLICT (slug) DO NOTHING;

-- ─── Seed cms_diagnostic_groups ──────────────────────────────
INSERT INTO cms_diagnostic_groups (key, label_fr, label_ar, display_order)
VALUES
  ('skin_type',   'Type de peau',        'نوع البشرة',      1),
  ('concern',     'Préoccupations',      'المخاوف',         2),
  ('sensitivity', 'Sensibilité',         'الحساسية',        3),
  ('routine',     'Routine actuelle',    'الروتين الحالي',  4),
  ('sun',         'Protection solaire',  'الحماية من الشمس', 5)
ON CONFLICT (key) DO NOTHING;

-- ─── Seed cms_diagnostic_questions ───────────────────────────
-- Mirrors the DiagnosticAnswerField type from diagnostic-routine.ts
INSERT INTO cms_diagnostic_questions (question_key, text_fr, text_ar, question_type, required, display_order, created_by, updated_by)
VALUES
  ('skinType',          'Quel est votre type de peau ?',                       'ما هو نوع بشرتك؟',                        'single', true,  1, 'system', 'system'),
  ('concern',           'Quelle est votre principale préoccupation cutanée ?', 'ما هو أبرز قلق لديك بشأن بشرتك؟',          'single', true,  2, 'system', 'system'),
  ('sensitivity',       'Votre peau est-elle sensible ?',                      'هل بشرتك حساسة؟',                         'single', true,  3, 'system', 'system'),
  ('breakoutFrequency', 'À quelle fréquence avez-vous des boutons ?',          'كم مرة تظهر لديك حبوب؟',                   'single', false, 4, 'system', 'system'),
  ('sunExposure',       'Quel est votre niveau d''exposition au soleil ?',      'ما مدى تعرضك لأشعة الشمس؟',               'single', true,  5, 'system', 'system'),
  ('spfHabit',          'Utilisez-vous de la crème solaire quotidiennement ?', 'هل تستخدم واقي الشمس يومياً؟',             'single', true,  6, 'system', 'system'),
  ('activeTolerance',   'Votre peau tolère-t-elle les actifs forts ?',         'هل تتحمل بشرتك المكونات الفعالة القوية؟',   'single', false, 7, 'system', 'system'),
  ('routineDepth',      'Quelle est la complexité de votre routine souhaitée ?','ما مدى تعقيد الروتين الذي تريده؟',         'single', false, 8, 'system', 'system')
ON CONFLICT (question_key) DO NOTHING;
