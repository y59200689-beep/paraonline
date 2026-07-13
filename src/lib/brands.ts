export interface BrandConfig {
  name: string; // Must match exactly the `vendor` field in products
  domain: string;
  logoUrl?: string;
  taglineFr: string;
  taglineAr: string;
  descriptionFr: string;
  descriptionAr: string;
}

export const BRANDS_DATA: BrandConfig[] = [
  {
    name: 'La Roche-Posay',
    domain: 'laroche-posay.com',
    logoUrl: '/uploads/1783623589633_jkjd_png.png',
    taglineFr: 'La vie change la peau, nous changeons sa vie',
    taglineAr: 'الحياة تغير البشرة، ونحن نغير حياتها',
    descriptionFr: 'Recommandée par plus de 90 000 dermatologues dans le monde, La Roche-Posay propose des soins formulés à base d\'eau thermale unique pour apaiser et protéger les peaux les plus sensibles et réactives.',
    descriptionAr: 'موصى بها من قبل أكثر من 90,000 طبيب جلدية حول العالم، تقدم لا روش بوزيه حلولاً علاجية للعناية بالبشرة الحساسة والمتهيجة تعتمد على المياه الحرارية الفريدة.',
  },
  {
    name: 'Vichy',
    domain: 'vichyusa.com',
    logoUrl: '/uploads/1783623593877_uh_png.png',
    taglineFr: 'Santé et beauté de la peau active',
    taglineAr: 'صحة وجمال البشرة النشطة',
    descriptionFr: 'Pionnière de l\'exposome et de la santé de la peau, Vichy associe son eau volcanique minéralisante fortifiante à des actifs dermatologiques de pointe pour booster la barrière cutanée.',
    descriptionAr: 'رائدة في دراسة المؤثرات الخارجية وصحة البشرة، تجمع فيشي بين مياهها البركانية المعدنية الغنية بالمعادن والمكونات الجلدية المتقدمة لتقوية دفاعات البشرة.',
  },
  {
    name: 'CeraVe',
    domain: 'cerave.com',
    logoUrl: '/uploads/1783623598712_dfq_png.png',
    taglineFr: 'Développé avec des dermatologues',
    taglineAr: 'تم تطويره مع أطباء الجلدية',
    descriptionFr: 'Soins enrichis en 3 céramides essentiels et acide hyaluronique avec technologie exclusive MVE pour hydrater en continu et restaurer la barrière protectrice de la peau.',
    descriptionAr: 'عناية فائقة غنية بـ 3 سيراميدات أساسية وحمض الهيالورونيك مع تقنية MVE الحصرية لترطيب مستمر واستعادة الحاجز الواقي الطبيعي للبشرة.',
  },
  {
    name: 'Eucerin',
    domain: 'eucerin.com',
    logoUrl: '/uploads/1783623605965_Eucerin_logo_logotype_png.png',
    taglineFr: 'La science d\'une peau visiblement plus saine',
    taglineAr: 'العلم لبشرة أكثر صحة بشكل ملحوظ',
    descriptionFr: 'Depuis plus de 100 ans, Eucerin mène des recherches dermatologiques innovantes pour concevoir des formules hautement efficaces répondant à chaque besoin clinique cutané.',
    descriptionAr: 'منذ أكثر من 100 عام، تقود يوسيرين أبحاثاً جلدية مبتكرة لتطوير تركيبات عالية الفعالية تستجيب لكل الاحتياجات الجلدية السريرية.',
  },
  {
    name: 'Bioderma',
    domain: 'bioderma.com',
    logoUrl: '/uploads/1783623610675_thf_png.png',
    taglineFr: 'La biologie au service de la dermatologie',
    taglineAr: 'البيولوجيا في خدمة طب الجلد',
    descriptionFr: 'Bioderma formule ses produits selon le principe de l\'écobiologie, respectant l\'écosystème cutané pour préserver sa santé et stimuler ses mécanismes naturels.',
    descriptionAr: 'تصمم بيوديرما منتجاتها وفقاً لمبدأ علم البيئة الحيوية للجلد، حيث تحترم النظام البيئي للبشرة للحفاظ على صحتها وتحفيز آلياتها الطبيعية.',
  },
  {
    name: 'SVR',
    domain: 'labo-svr.com',
    logoUrl: '/uploads/1783623616070_svr_png.png',
    taglineFr: 'La dermatologie active hautement concentrée',
    taglineAr: 'العناية الجلدية الفعالة وعالية التركيز',
    descriptionFr: 'Le laboratoire français SVR crée des soins dermo-cosmétiques formulés à des concentrations record d\'actifs dermatologiques pour maximiser les résultats sans compromettre la tolérance.',
    descriptionAr: 'يبتكر مختبر SVR الفرنسي مستحضرات للعناية بالبشرة بتركيزات قياسية من المكونات النشطة لضمان أقصى درجات الفعالية مع الحفاظ على أعلى درجات الأمان والتحمل.',
  },
  {
    name: 'Cetaphil',
    domain: 'cetaphil.com',
    logoUrl: '/uploads/1783623621993_op_png.png',
    taglineFr: 'Douceur cliniquement prouvée pour les peaux sensibles',
    taglineAr: 'نعومة مثبتة سريرياً للبشرة الحساسة',
    descriptionFr: 'Spécialement formulée pour restaurer la barrière cutanée des peaux sensibles, la marque Cetaphil propose des soins quotidiens doux recommandés pour leur haute tolérance.',
    descriptionAr: 'مخصصة للعناية بالبشرة الحساسة والجافة، تقدم سيتافيل منتجات تنظيف وترطيب يومية لطيفة وموصى بها بشدة لسلامة تركيبتها على البشرة.',
  },
  {
    name: 'Avène',
    domain: 'aveneusa.com',
    logoUrl: '/uploads/1783623626820_Avene_Logo_jpg.jpg',
    taglineFr: 'Apaiser la peau, sublimer la vie',
    taglineAr: 'تهدئة البشرة، وتحسين الحياة',
    descriptionFr: 'Au cœur de chaque soin Avène se trouve l\'Eau Thermale d\'Avène, cliniquement reconnue pour ses propriétés apaisantes, anti-irritantes et adoucissantes.',
    descriptionAr: 'في قلب كل مستحضر من أفسين تكمن المياه الحرارية الطبيعية، المعترف بفعاليتها سريرياً في تهدئة وتلطيف البشرة المتهيجة والحساسة.',
  },
  {
    name: 'Mixa',
    domain: 'mixa.fr',
    logoUrl: '/uploads/1783623633547_logo_mixa_jpg.jpg',
    taglineFr: 'L\'expert des peaux sensibles pour toute la famille',
    taglineAr: 'خبير البشرة الحساسة لجميع أفراد الأسرة',
    descriptionFr: 'Née en pharmacie, Mixa répond aux exigences de tolérance et d\'efficacité des peaux délicates à travers des soins réparateurs et protecteurs emblématiques.',
    descriptionAr: 'نشأت ميكسا في الصيدليات لتلبي احتياجات البشرة الحساسة والجافة جداً من خلال تركيبات غنية ومرممة مناسبة لجميع الأعمار.',
  },
  {
    name: "L'Oréal Paris",
    domain: 'loreal-paris.com',
    logoUrl: '/uploads/1783623638829_ikl_png.png',
    taglineFr: 'Parce que vous le valez bien',
    taglineAr: 'لأنك تستحقينه بجدارة',
    descriptionFr: 'Leader mondial de la beauté, L\'Oréal Paris met la science et l\'innovation cosmétique au service de soins anti-âge, capillaires et de maquillage d\'exception.',
    descriptionAr: 'الرائد العالمي في مجال التجميل، تضع لوريال باريس الابتكار العلمي والتكنولوجي في خدمة مستحضرات العناية بمكافحة الشيخوخة والشعر والمكياج الاستثنائي.',
  },
  {
    name: 'Garnier',
    domain: 'garnier.com',
    logoUrl: '/uploads/1783623642984_kl_l_png.png',
    taglineFr: 'Par nature, naturellement',
    taglineAr: 'من الطبيعة، بشكل طبيعي',
    descriptionFr: 'Engagée dans la beauté durable, Garnier extrait le pouvoir des ingrédients naturels combiné à la science pour offrir des soins capillaires et visage sains et efficaces.',
    descriptionAr: 'ملتزمة بالجمال المستدام، تستخلص غارنييه قوة المكونات الطبيعية الممزوجة بالعلم لتقديم روتين صحي وفعال للعناية بالشعر والبشرة.',
  },
  {
    name: 'Hada Labo Tokyo',
    domain: 'hadalabotokyo.com',
    logoUrl: undefined,
    taglineFr: 'Hydratation profonde et pureté japonaise',
    taglineAr: 'ترطيب عميق ونقاء ياباني',
    descriptionFr: 'Marque numéro 1 au Japon, Hada Labo Tokyo infuse ses soins d\'un complexe unique de multiples acides hyaluroniques pour une hydratation intense multicouche de la peau.',
    descriptionAr: 'العلامة التجارية الأولى في اليابان، تغمر هادا لابو طوكيو مستحضراتها بمركب فريد من أحماض الهيالورونيك المتعددة لترطيب مكثف ومتعدد الطبقات للبشرة.',
  },
  {
    name: 'Anua',
    domain: 'anua.store',
    logoUrl: undefined,
    taglineFr: 'La simplicité et le calme pour votre peau',
    taglineAr: 'البساطة والهدوء لبشرتك',
    descriptionFr: 'Marque culte de la K-Beauty, Anua se concentre sur des formules clean à base d\'ingrédients botaniques apaisants comme le Heartleaf pour calmer les peaux sujettes aux rougeurs.',
    descriptionAr: 'علامة كورية شهيرة تركز على تركيبات نقية تعتمد على مكونات نباتية مهدئة مثل نبتة هارتليف لتهدئة البشرة وتقليل تهيجاتها واحمرارها.',
  },
  {
    name: 'Skin1004',
    domain: 'skin1004.com',
    logoUrl: undefined,
    taglineFr: 'La pureté de la Centella Asiatica de Madagascar',
    taglineAr: 'نقاء نبتة السنتيلا الآسيوية من مدغشقر',
    descriptionFr: 'Reconnue pour ses soins minimalistes à base de Centella Asiatica pure récoltée à Madagascar, Skin1004 répare et fortifie la barrière cutanée des peaux fragiles.',
    descriptionAr: 'تشتهر بمنتجاتها البسيطة القائمة على نبتة السنتيلا الآسيوية النقية المقطوفة من مدغشقر، لإصلاح وتقوية حاجز البشرة الحساسة.',
  },
  {
    name: 'Beauty of Joseon',
    domain: 'beautyofjoseon.com',
    logoUrl: undefined,
    taglineFr: 'Sagesse des soins traditionnels coréens Hanbang',
    taglineAr: 'حكمة العناية الكورية التقليدية هانبانغ',
    descriptionFr: 'Inspirée par l\'élégance de la dynastie Joseon, cette marque associe des herbes médicinales orientales (Hanbang) à la science moderne pour révéler l\'éclat naturel du teint.',
    descriptionAr: 'مستوحاة من تقاليد النبلاء في عهد سلالة جوسون، تمزج هذه الماركة بين الأعشاب الطبية الشرقية التقليدية والعلم الحديث لإبراز نضارة البشرة الطبيعية.',
  }
];

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
};

export const getBrandBySlug = (slug: string): BrandConfig | undefined => {
  return BRANDS_DATA.find(brand => slugify(brand.name) === slug);
};
