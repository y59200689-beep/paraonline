import { createClient } from '@supabase/supabase-js';
import { PRODUCTS_DB } from './data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const isPlaceholder = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

// --- In-Memory Database Mock for Development/Placeholder environments with File Persistence ---
const globalForMock = globalThis as unknown as {
  mockDb: {
    operators: any[];
    settings: any[];
    products: any[];
    orders: any[];
    reviews: any[];
    leads: any[];
    diagnostics: any[];
    audit_logs: any[];
    abandoned_carts: any[];
    loyalty_overrides: any[];
    customer_profiles: any[];
    advice_articles: any[];
    code_snippets: any[];
  }
};

const getDbFilePath = () => {
  if (typeof window === 'undefined') {
    const path = require('path');
    return path.join(process.cwd(), 'supabase-mock-db.json');
  }
  return '';
};

let saveTimeout: NodeJS.Timeout | null = null;
const saveToDisk = () => {
  if (process.env.NODE_ENV === 'test') return;
  if (typeof window === 'undefined' && isPlaceholder && globalForMock.mockDb) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        const fs = require('fs');
        const filePath = getDbFilePath();
        fs.writeFileSync(filePath, JSON.stringify(globalForMock.mockDb, null, 2), 'utf-8');
        saveTimeout = null;
      } catch (err) {
        console.error('Failed to write mock db to disk:', err);
      }
    }, 100);
  }
};

const loadFromDisk = () => {
  if (process.env.NODE_ENV === 'test') return false;
  if (typeof window === 'undefined' && isPlaceholder) {
    if (globalForMock.mockDb) return true;
    try {
      const fs = require('fs');
      const filePath = getDbFilePath();
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        globalForMock.mockDb = JSON.parse(fileContent);
        return true;
      }
    } catch (err) {
      console.error('Failed to read mock db from disk:', err);
    }
  }
  return false;
};

const getInitialProducts = () => {
  return PRODUCTS_DB.map(p => ({
    id: p.id,
    title: p.title,
    name: p.name || null,
    name_fr: p.nameFr || null,
    vendor: p.vendor,
    image: p.image,
    images: p.images || [],
    price: p.price,
    compare_price: p.comparePrice || null,
    category: p.category,
    tags: p.tags || [],
    rating: p.rating || 5,
    reviews: p.reviews || 0,
    description: p.description || null,
    ingredients: p.ingredients || null,
    usage: p.usage || null,
    stock: p.stock || 100,
    sku: p.sku || null,
    buying_cost: p.buyingCost || null,
    points: p.points || 0,
    status: 'live',
    created_at: new Date().toISOString()
  }));
};

const getInitialAdviceArticles = () => {
  return [
    {
      id: "art_1",
      slug: "routine-kbeauty-glass-skin",
      title_fr: "Le Secret du 'Glass Skin' Coréen : Routine Complète Étape par Étape",
      title_ar: "سر البشرة الزجاجية الكورية: روتين كامل خطوة بخطوة",
      summary_fr: "Découvrez comment obtenir une peau ultra-lumineuse, lisse et rebondie grâce aux techniques de superposition d'hydratation de la K-Beauty.",
      summary_ar: "اكتشفي كيفية الحصول على بشرة أرق وأكثر مرونة ونضارة باستخدام تقنيات ترطيب البشرة الكورية المتطورة.",
      content_fr: "La tendance du **Glass Skin** consiste à obtenir une peau si saine, lisse et hydratée qu'elle en devient translucide et lumineuse comme du verre. Ce n'est pas une question de maquillage, mais de santé cutanée.\n\n### Les Étapes Clés de la Routine\n\n1. **Le Double Nettoyage** : Commencez par une huile démaquillante pour dissoudre le sébum, suivie d'un nettoyant aqueux doux pour éliminer les impuretés.\n2. **L'Exfoliation Douce** : Utilisez un exfoliant chimique doux (comme les PHA ou l'acide salicylique) 2 à 3 fois par semaine pour lisser le grain de peau.\n3. **La Superposition d'Hydratation (7 Skin Method)** : Appliquez plusieurs couches fines de toner hydratant sans alcool pour repulper la peau en profondeur.\n4. **L'Essence aux Mucines d'Escargot** : Apportez des nutriments essentiels et favorisez la réparation cutanée avec une essence concentrée.\n5. **Le Sérum Éclat** : Un sérum à la niacinamide ou à l'acide hyaluronique pour cibler l'hyperpigmentation et illuminer.\n6. **L'Hydratation Scellante** : Une crème barrière pour retenir toute l'hydratation accumulée.\n7. **La Protection Solaire (Jour)** : L'étape indispensable pour prévenir le vieillissement prématuré.\n\nAdoptez cette routine quotidiennement pour révéler l'éclat naturel de votre teint !",
      content_ar: "تعتمد صيحة **البشرة الزجاجية (Glass Skin)** على تحقيق بشرة صحية وناعمة ورطبة للغاية لدرجة أنها تبدو شفافة ومشرقة مثل الزجاج. لا يتعلق الأمر بالمكياج، بل بصحة البشرة الفائقة.\n\n### الخطوات الأساسية للروتين:\n\n1. **التنظيف المزدوج**: ابدئي بـ زيت منظم لإذابة الدهون، يليه غسول مائي لطيف لإزالة الشوائب.\n2. **التقشير اللطيف**: استخدمي مقشراً كيميائياً لطيفاً (مثل PHA أو حمض الساليسيليك) مرتين إلى ثلاث مرات في الأسبوع لتنعيم ملمس البشرة.\n3. **طبقات الترطيب المتعددة**: ضعي عدة طبقات خفيفة من التونر المرطب الخالي من الكحول لترطيب البشرة بعمق.\n4. **إيسنس حلزوني**: غذي بشرتكِ بالمواد الأساسية وعززي إصلاح الخلايا باستخدام خلاصة الحلزون المركزة.\n5. **سيروم النضارة**: سيروم النياسيناميد أو حمض الهيالورونيك لاستهداف التصبغات وإضاءة البشرة.\n6. **كريم مرطب واقي**: كريم حاجز للبشرة لحبس كل الترطيب المتراكم.\n7. **واقي الشمس (نهاراً)**: الخطوة الأهم لحماية البشرة من الشيخوخة المبكرة.\n\nاعتمدي هذا الروتين يومياً لتكشفي عن الإشراق الطبيعي لبشرتكِ!",
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
      content_fr: "L'acide salicylique est un acide bêta-hydroxylé (BHA) liposoluble. Contrairement aux AHA qui travaillent en surface, le BHA pénètre en profondeur dans les pores pour dissoudre l'excès de sébum et les cellules mortes.\n\n### Pourquoi l'utiliser ?\n* **Désobstruction des Pores** : Idéal contre les points noirs et microkystes.\n* **Régulation du Sébum** : Réduit la brillance de la zone T.\n* **Action Anti-inflammatoire** : Calme les rougeurs des boutons actifs.\n\n### Conseils d'Utilisation\nIntégrez-le progressivement (1 à 2 fois par semaine au début) le soir, après le nettoyage et avant vos soins hydratants. N'oubliez jamais d'appliquer une protection solaire le lendemain matin car les acides rendent la peau plus sensible au soleil.",
      content_ar: "حمض الساليسيليك هو حمض بيتا هيدروكسي (BHA) قابل للذوبان في الدهون. على عكس أحماض AHA التي تعمل على السطح، يتغلغل BHA بعمق في المسام لإذابة الدهون الزائدة والخلايا الميتة.\n\n### لماذا يجب استخدامه؟\n* **تنظيف المسام**: مثالي لمحاربة الرؤوس السوداء والدهون المتراكمة.\n* **تنظيم الدهون**: يقلل من لمعان منطقة الـ T-zone.\n* **مضاد للالتهابات**: يهدئ احمرار الحبوب النشطة.\n\n### نصائح الاستخدام:\nأدخلي السيروم تدريجياً (مرة إلى مرتين في الأسبوع في البداية) في روتينكِ المسائي، بعد التنظيف وقبل المرطب. لا تنسي تطبيق واقي الشمس في صباح اليوم التالي لأن الأحماض تزيد من حساسية البشرة للشمس.",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
      category: "skincare",
      read_time: 4,
      recommended_products: [4, 5],
      status: "published",
      created_at: new Date().toISOString()
    }
  ];
};

const getInitialCodeSnippets = () => {
  return [
    {
      id: "snip_1",
      name: "Exemple: Google Analytics & Tag Manager (Mock)",
      code: "<!-- Global site tag (gtag.js) - Google Analytics -->\n<script>\n  console.log('[Mock Google Analytics] Script initialisé.');\n</script>",
      location: "head",
      active: true,
      trigger_type: "client",
      cron_expression: null,
      last_run: null,
      last_run_status: null,
      last_run_logs: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "snip_2",
      name: "Exemple: Pixel Facebook (Mock)",
      code: "<!-- Facebook Pixel Code -->\n<script>\n  console.log('[Mock Facebook Pixel] Événement PageView enregistré.');\n</script>",
      location: "body_start",
      active: false,
      trigger_type: "client",
      cron_expression: null,
      last_run: null,
      last_run_status: null,
      last_run_logs: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "cron_1",
      name: "Exemple Cron: Archivage Automatique des Logs",
      code: "console.log('Début de l\\'archivage automatique des logs...');\n// Simulation d'une tâche de maintenance sur la base de données\nconsole.log('Nettoyage des anciens logs d\\'audit terminé avec succès.');",
      location: "head",
      active: true,
      trigger_type: "cron",
      cron_expression: "*/5 * * * *",
      last_run: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      last_run_status: "success",
      last_run_logs: "Début de l'archivage automatique des logs...\nNettoyage des anciens logs d'audit terminé avec succès.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

if (isPlaceholder) {
  const loaded = loadFromDisk();
  if (!loaded && !globalForMock.mockDb) {
    globalForMock.mockDb = {
      operators: [
        {
          id: "1",
          username: "admin",
          // WARNING: dev-only seed. Replace with a bcrypt/argon2 hash via env var before any production deploy.
          // Set MOCK_ADMIN_PASSWORD_HASH in .env.local to override this default.
          password: process.env.MOCK_ADMIN_PASSWORD_HASH ?? "6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6",
          role: "owner",
          name: "Youssef Mahir",
          is_active: true,
          mfa_enabled: false,
          created_at: new Date().toISOString()
        }
      ],
      settings: [
        {
          id: 1,
          value: {
            storeName: "Para Officinal S.A",
            freeShippingThreshold: 600,
            shippingFee: 35,
            quizDiscountPercent: 15,
            coupons: [
              { code: "BEAUTY10", discountPercent: 10, freeShipping: false, isActive: true },
              { code: "CLINICAL15", discountPercent: 15, freeShipping: false, isActive: true },
              { code: "FREESHIP", discountPercent: 0, freeShipping: true, isActive: true }
            ]
          },
          created_at: new Date().toISOString()
        }
      ],
      products: getInitialProducts(),
      orders: [],
      reviews: [],
      leads: [],
      diagnostics: [],
      audit_logs: [],
      abandoned_carts: [],
      loyalty_overrides: [],
      customer_profiles: [],
      advice_articles: getInitialAdviceArticles(),
      code_snippets: getInitialCodeSnippets()
    };
    saveToDisk();
  } else if (loaded && globalForMock.mockDb) {
    let mutated = false;
    if (globalForMock.mockDb.products) {
      globalForMock.mockDb.products = globalForMock.mockDb.products.map((p: any) => {
        if (!p.status) {
          p.status = 'live';
          mutated = true;
        }
        return p;
      });
    }
    if (!globalForMock.mockDb.advice_articles) {
      globalForMock.mockDb.advice_articles = getInitialAdviceArticles();
      mutated = true;
    }
    if (!globalForMock.mockDb.code_snippets) {
      globalForMock.mockDb.code_snippets = getInitialCodeSnippets();
      mutated = true;
    } else {
      // Migrate existing mock snippets to include new fields if missing
      globalForMock.mockDb.code_snippets = globalForMock.mockDb.code_snippets.map((s: any) => {
        if (!s.trigger_type) {
          s.trigger_type = 'client';
          s.cron_expression = null;
          s.last_run = null;
          s.last_run_status = null;
          s.last_run_logs = null;
          mutated = true;
        }
        return s;
      });
      // Seed default cron_1 if not present
      if (!globalForMock.mockDb.code_snippets.some((s: any) => s.id === 'cron_1')) {
        const initial = getInitialCodeSnippets();
        const cronItem = initial.find(s => s.id === 'cron_1');
        if (cronItem) {
          globalForMock.mockDb.code_snippets.push(cronItem);
          mutated = true;
        }
      }
    }
    if (mutated) {
      saveToDisk();
    }
  } else if (!loaded && globalForMock.mockDb) {
    saveToDisk();
  }
}

class MockSupabaseQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;
  private actionType: 'select' | 'update' | 'delete' = 'select';
  private actionData: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: any) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      const itemVal = item[column];
      if (typeof value === 'string' && typeof itemVal === 'string') {
        return itemVal.toLowerCase() === value.toLowerCase();
      }
      return itemVal == value;
    });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) > Number(value));
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) < Number(value));
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) <= Number(value));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) >= Number(value));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => {
      const itemVal = item[column];
      return values.map(String).includes(String(itemVal));
    });
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'in') {
      const ids = value.replace(/[()]/g, '').split(',').map((x: string) => x.trim());
      this.filters.push((item) => !ids.includes(String(item[column])));
    } else if (operator === 'eq') {
      this.filters.push((item) => item[column] !== value);
    }
    return this;
  }

  or(filterStr: string) {
    this.filters.push((item) => {
      const conditions = filterStr.split(',');
      return conditions.some(cond => {
        if (cond.includes('.ilike.')) {
          const [col, valWithPercents] = cond.split('.ilike.');
          const searchTerm = valWithPercents.replace(/%/g, '').toLowerCase();
          return String(item[col] || '').toLowerCase().includes(searchTerm);
        }
        if (cond.includes('.eq.')) {
          const [col, val] = cond.split('.eq.');
          return String(item[col] || '').toLowerCase() === val.toLowerCase();
        }
        if (cond.includes('.is.null')) {
          const col = cond.split('.is.null')[0];
          return item[col] === null || item[col] === undefined || item[col] === '';
        }
        if (cond.includes('.cs.')) {
          const [col, val] = cond.split('.cs.');
          const cleanVal = val.replace(/[{""}]/g, '').toLowerCase();
          const arr = item[col] || [];
          return Array.isArray(arr) && arr.some(x => String(x).toLowerCase().includes(cleanVal));
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  range(from: number, to: number) {
    this.rangeStart = from;
    this.rangeEnd = to;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async insert(data: any) {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const records = Array.isArray(data) ? data : [data];
    
    let nextNumId = this.table === 'products'
      ? Math.max(0, ...list.map((x: any) => Number(x.id)).filter((x: any) => !isNaN(x))) + 1
      : 0;

    const inserted = records.map(r => {
      let idToUse = r.id;
      if (idToUse === undefined || idToUse === null) {
        if (this.table === 'products') {
          idToUse = nextNumId++;
        } else {
          idToUse = String(Math.random().toString(36).substring(2, 11));
        }
      } else if (this.table === 'products') {
        idToUse = Number(idToUse);
      }
      return {
        id: idToUse,
        created_at: new Date().toISOString(),
        ...r
      };
    });
    list.push(...inserted);
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = list;
    saveToDisk();
    return { data: inserted, error: null };
  }

  async upsert(data: any, options?: any) {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const records = Array.isArray(data) ? data : [data];

    let nextNumId = this.table === 'products'
      ? Math.max(0, ...list.map((x: any) => Number(x.id)).filter((x: any) => !isNaN(x))) + 1
      : 0;

    const upserted = records.map(r => {
      const hasId = r.id !== undefined && r.id !== null;
      const existingIdx = hasId ? list.findIndex((x: any) => String(x.id) === String(r.id)) : -1;
      
      let idToUse = r.id;
      if (!hasId) {
        if (this.table === 'products') {
          idToUse = nextNumId++;
        } else {
          idToUse = String(Math.random().toString(36).substring(2, 11));
        }
      } else if (this.table === 'products') {
        idToUse = Number(idToUse);
      }

      const newRec = {
        created_at: new Date().toISOString(),
        ...r,
        id: idToUse
      };

      if (existingIdx !== -1) {
        const originalCreatedAt = list[existingIdx].created_at || newRec.created_at;
        list[existingIdx] = { 
          ...list[existingIdx], 
          ...r,
          id: idToUse,
          created_at: originalCreatedAt
        };
      } else {
        list.push(newRec);
      }
      return newRec;
    });
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = list;
    saveToDisk();
    return { data: upserted, error: null };
  }

  update(data: any) {
    this.actionType = 'update';
    this.actionData = data;
    return this;
  }

  delete() {
    this.actionType = 'delete';
    return this;
  }

  private execute() {
    let list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];

    if (this.actionType === 'delete') {
      const itemsToKeep = list.filter(item => !this.filters.every(f => f(item)));
      const deletedItems = list.filter(item => this.filters.every(f => f(item)));
      globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = itemsToKeep;
      saveToDisk();
      return { data: deletedItems, error: null, count: deletedItems.length };
    }

    if (this.actionType === 'update') {
      const updatedList = list.map((item: any) => {
        if (this.filters.every(f => f(item))) {
          return { ...item, ...this.actionData };
        }
        return item;
      });
      globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = updatedList;
      saveToDisk();
      const updatedItems = updatedList.filter(item => this.filters.every(f => f(item)));
      return { data: updatedItems, error: null, count: updatedItems.length };
    }

    // Default select
    let filteredList = list.filter(item => this.filters.every(f => f(item)));
    const totalCount = filteredList.length;
    
    if (this.orderCol) {
      filteredList = [...filteredList].sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    if (this.rangeStart !== null && this.rangeEnd !== null) {
      filteredList = filteredList.slice(this.rangeStart, this.rangeEnd + 1);
    } else if (this.limitCount !== null) {
      filteredList = filteredList.slice(0, this.limitCount);
    }

    return { data: filteredList, error: null, count: totalCount };
  }

  async single() {
    const { data } = this.execute();
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'Not found', code: 'PGRST116' } };
    }
    return { data: data[0], error: null };
  }

  async maybeSingle() {
    const { data } = this.execute();
    return { data: (data && data[0]) || null, error: null };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const { data, count, error } = this.execute();
    return Promise.resolve({ data, count, error }).then(onfulfilled, onrejected);
  }
}

const mockAuth = {
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } }
  }),
  getSession: async () => ({ data: { session: null } }),
  signInWithPassword: async () => ({ data: { user: null }, error: null }),
  signUp: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
};

const mockSupabaseClient = {
  auth: mockAuth,
  from: (table: string) => new MockSupabaseQueryBuilder(table),
  rpc: async (fn: string, args: any) => {
    if (fn === 'decrement_product_stock') {
      const { product_id, qty } = args;
      const idNum = Number(product_id);
      const qtyNum = Number(qty);
      const list = globalForMock.mockDb.products || [];
      const idx = list.findIndex((p: any) => p.id === idNum);
      if (idx !== -1) {
        list[idx].stock = Math.max(0, (list[idx].stock || 0) - qtyNum);
      }
      globalForMock.mockDb.products = list;
      saveToDisk();
      return { data: null, error: null };
    }
    return { data: null, error: { message: `Function ${fn} not mocked` } };
  }
} as any;

// --- Expose Mock or Real client depending on env keys ---
export const supabase = isPlaceholder 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, supabaseAnonKey);

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = isPlaceholder 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
