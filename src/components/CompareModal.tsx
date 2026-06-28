'use client';

import React, { useState, useEffect } from 'react';
import { useCompare } from '@/context/CompareContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { X, Scale, Trash2, AlertCircle, Plus } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';

// Ingredient → clinical benefit mapping (pattern, display name, FR/AR benefit)
const INGREDIENT_BENEFITS_MAP: { pattern: RegExp; name: string; benefit: { FR: string; AR: string } }[] = [
  { pattern: /hyaluronic acid|hyaluronate/i, name: 'Acide Hyaluronique', benefit: { FR: 'Hydratation profonde & repulpage', AR: 'ترطيب عميق وتفعيل البشرة' } },
  { pattern: /glycolic acid/i, name: 'Acide Glycolique', benefit: { FR: 'Taches sombres & exfoliation', AR: 'البقع الداكنة والتقشير' } },
  { pattern: /salicylic acid/i, name: 'Acide Salicylique', benefit: { FR: 'Acné & désobstruction des pores', AR: 'حب الشباب وتنظيف المسام' } },
  { pattern: /lactic acid/i, name: 'Acide Lactique', benefit: { FR: 'Exfoliation douce & éclat', AR: 'تقشير لطيف وإشراق' } },
  { pattern: /niacinamide/i, name: 'Niacinamide', benefit: { FR: 'Pores & teint unifié', AR: 'المسام وتوحيد البشرة' } },
  { pattern: /retinol|retinyl palmitate/i, name: 'Rétinol', benefit: { FR: 'Anti-âge & renouvellement cellulaire', AR: 'مكافحة الشيخوخة وتجديد الخلايا' } },
  { pattern: /ascorbic acid|vitamin c/i, name: 'Vitamine C', benefit: { FR: 'Antioxydant & éclat', AR: 'مضاد الأكسدة والإشراق' } },
  { pattern: /tocopherol|vitamin e/i, name: 'Vitamine E', benefit: { FR: 'Antioxydant & nutrition cutanée', AR: 'مضاد الأكسدة وتغذية البشرة' } },
  { pattern: /zinc oxide/i, name: 'Oxyde de Zinc', benefit: { FR: 'Filtre UV & séborégulation', AR: 'فلتر UV وتنظيم الإفراز الدهني' } },
  { pattern: /titanium dioxide/i, name: 'Dioxyde de Titane', benefit: { FR: 'Protection UVB physique', AR: 'حماية UVB فيزيائية' } },
  { pattern: /ethylhexyl methoxycinnamate|octinoxate/i, name: 'Filtre UVB', benefit: { FR: 'Protection solaire UVB', AR: 'حماية شمسية UVB' } },
  { pattern: /butyl methoxydibenzoylmethane|avobenzone/i, name: 'Filtre UVA', benefit: { FR: 'Protection solaire UVA', AR: 'حماية شمسية UVA' } },
  { pattern: /glycerin/i, name: 'Glycérine', benefit: { FR: 'Barrière cutanée & rétention d\'eau', AR: 'حاجز البشرة واحتباس الماء' } },
  { pattern: /ceramide/i, name: 'Céramides', benefit: { FR: 'Restauration de la barrière cutanée', AR: 'استعادة حاجز البشرة' } },
  { pattern: /allantoin/i, name: 'Allantoïne', benefit: { FR: 'Apaisement & cicatrisation', AR: 'التهدئة والشفاء' } },
  { pattern: /panthenol|pro-vitamin b5/i, name: 'Panthénol (B5)', benefit: { FR: 'Hydratation & réparation tissulaire', AR: 'الترطيب وإصلاح الأنسجة' } },
  { pattern: /collagen/i, name: 'Collagène', benefit: { FR: 'Fermeté & élasticité', AR: 'الشد والمرونة' } },
  { pattern: /caffeine/i, name: 'Caféine', benefit: { FR: 'Anti-poches & microcirculation', AR: 'مكافحة الانتفاخ وتحسين الدورة' } },
  { pattern: /peptide/i, name: 'Peptides', benefit: { FR: 'Anti-âge & signalisation cellulaire', AR: 'مكافحة الشيخوخة وتنشيط الخلايا' } },
  { pattern: /alpha.arbutin/i, name: 'Alpha Arbutin', benefit: { FR: 'Dépigmentation & taches', AR: 'إزالة التصبغ والبقع' } },
  { pattern: /kojic/i, name: 'Acide Kojique', benefit: { FR: 'Éclaircissant & anti-taches', AR: 'مفتح ومضاد للبقع' } },
  { pattern: /alcohol denat/i, name: 'Alcool Dénaturé', benefit: { FR: 'Texture légère & séchage rapide', AR: 'قوام خفيف وجفاف سريع' } },
  { pattern: /dipropylene glycol/i, name: 'Dipropylène Glycol', benefit: { FR: 'Humectant & solvant vecteur', AR: 'مرطب وعامل حامل' } },
  { pattern: /dimethicone|cyclomethicone/i, name: 'Silicone', benefit: { FR: 'Lissant & effet protecteur', AR: 'تنعيم وحماية' } },
  { pattern: /xylitol/i, name: 'Xylitol', benefit: { FR: 'Prébiotique & hydratation', AR: 'بريبايوتيك وترطيب' } },
  { pattern: /aqua|water/i, name: 'Eau (Base)', benefit: { FR: 'Véhicule principal de formule', AR: 'القاعدة الأساسية للتركيبة' } },
];

export const CompareModal: React.FC = () => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { convertPrice } = useCurrency();
  const {
    compareProducts,
    removeFromCompare,
    clearCompare,
    isOpenModal,
    setIsOpenModal,
    alertMessage,
    setAlertMessage,
    addToCompare,
  } = useCompare();

  // Search local states for slots
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [isSearching1, setIsSearching1] = useState(false);
  const [isSearching2, setIsSearching2] = useState(false);

  // t-modal animation state
  const [isVisible, setIsVisible] = useState(false);   // controls DOM presence
  const [modalState, setModalState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const closeMs = 160; // must match --modal-close-dur

  // t-modal open/close lifecycle
  useEffect(() => {
    if (isOpenModal) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setModalState('open'));
      });
    } else if (modalState === 'open') {
      setModalState('closing');
      const t = setTimeout(() => {
        setModalState('closed');
        setIsVisible(false);
      }, closeMs);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal]);

  if (!isVisible) return null;

  const isRTL = language === 'AR';

  // Helper to resolve routine badge
  const getRoutineLabel = (tags: string[], nameFr: string, nameEn: string, id: number) => {
    const isDay = tags.includes('solaire') || tags.includes('jour') || nameFr?.toLowerCase().includes('solaire') || nameEn?.toLowerCase().includes('sun') || id === 3 || id === 7 || id === 14 || id === 17 || id === 13 || id === 1;
    const isNight = tags.includes('nuit') || nameFr?.toLowerCase().includes('nuit') || nameEn?.toLowerCase().includes('night') || id === 8 || id === 5 || id === 22 || id === 15 || id === 16 || id === 6;

    if (isDay && isNight) return language === 'FR' ? 'Jour & Nuit️' : 'نهاراً وليلاً️';
    if (isDay) return language === 'FR' ? 'Soin de Jour️' : 'عناية نهارية️';
    return language === 'FR' ? 'Soin de Nuit' : 'عناية ليلية';
  };

  // Helper to extract active ingredients list
  const getActiveIngredientsLabel = (ingredients: string) => {
    if (!ingredients) return '-';
    const parts = ingredients.split(',').slice(0, 3).map(p => p.trim());
    return parts.join(', ') + (ingredients.split(',').length > 3 ? '...' : '');
  };

  // Option A: Auto-generate "Parfait pour" profile from product data
  const getProfileIdeal = (product: Product): string => {
    const tags = product.tags || [];
    const desc = (product.description || '').toLowerCase();
    const ing = (product.ingredients || '').toLowerCase();
    const nameFr = (product.nameFr || product.title || '').toLowerCase();
    const isSolar = tags.includes('solaire') || nameFr.includes('solaire') || nameFr.includes('spf') || nameFr.includes('sun');
    const isHydrating = ing.includes('hyaluronic') || ing.includes('glycerin') || tags.includes('hydratant') || desc.includes('hydrat');
    const isAntiAge = desc.includes('rides') || desc.includes('anti-age') || tags.includes('anti-age') || desc.includes('ridules');
    const isOily = tags.includes('mixte') || tags.includes('grasse') || desc.includes('mixte') || desc.includes('mat');
    if (isSolar && isOily) return language === 'FR'
      ? 'Peau mixte à grasse exposée au soleil, cherche une protection invisible à fini mat'
      : 'بشرة مختلطة دهنية معرضة للشمس، تبحث عن حماية خفية بنعومة مطفأة';
    if (isSolar) return language === 'FR'
      ? 'Toute peau cherchant une protection solaire haute, confortable et légère'
      : 'كل أنواع البشرة التي تبحث عن حماية شمسية عالية ومريحة';
    if (isAntiAge) return language === 'FR'
      ? 'Peau mature cherchant à repulper et estomper les rides'
      : 'بشرة ناضجة تبحث عن تجديد وتقليل التجاعيد';
    if (isHydrating) return language === 'FR'
      ? 'Peau sèche ou déshydratée cherchant une hydratation multi-couches intense'
      : 'بشرة جافة تبحث عن ترطيب عميق ومكثف متعدد الطبقات';
    return language === 'FR'
      ? 'Peau normale à mixte cherchant équilibre et confort quotidien'
      : 'بشرة عادية تبحث عن توازن ورعاية يومية';
  };

  // Option B: Determine row winner for per-attribute advantage badges
  const getRowWinner = (p1: Product, p2: Product, type: string): 'left' | 'right' | 'tie' => {
    if (type === 'actifs') {
      const c1 = (p1.ingredients || '').split(',').filter(i => i.trim()).length;
      const c2 = (p2.ingredients || '').split(',').filter(i => i.trim()).length;
      if (c1 > c2 + 2) return 'left';
      if (c2 > c1 + 2) return 'right';
      return 'tie';
    }
    if (type === 'note') {
      if ((p1.rating || 0) > (p2.rating || 0) + 0.1) return 'left';
      if ((p2.rating || 0) > (p1.rating || 0) + 0.1) return 'right';
      if ((p1.reviews || 0) > (p2.reviews || 0) * 1.5) return 'left';
      if ((p2.reviews || 0) > (p1.reviews || 0) * 1.5) return 'right';
      return 'tie';
    }
    if (type === 'prix') {
      if (p1.price < p2.price) return 'left';
      if (p2.price < p1.price) return 'right';
      return 'tie';
    }
    return 'tie';
  };

  // Option C: Generate contextual editorial verdict from product data
  const getVerdict = (p1: Product, p2: Product): string => {
    const p1Name = (p1.nameFr || p1.title).split(' ').slice(0, 3).join(' ');
    const p2Name = (p2.nameFr || p2.title).split(' ').slice(0, 3).join(' ');
    const isSolar1 = (p1.tags || []).includes('solaire') || (p1.nameFr || p1.title || '').toLowerCase().includes('spf') || (p1.nameFr || p1.title || '').toLowerCase().includes('solaire');
    const isSolar2 = (p2.tags || []).includes('solaire') || (p2.nameFr || p2.title || '').toLowerCase().includes('spf') || (p2.nameFr || p2.title || '').toLowerCase().includes('solaire');
    const hasHyaluronic1 = (p1.ingredients || '').toLowerCase().includes('hyaluronic');
    const hasHyaluronic2 = (p2.ingredients || '').toLowerCase().includes('hyaluronic');
    if (isSolar1 && !isSolar2) return language === 'FR'
      ? `Choisissez ${p1Name} si vous êtes exposé au soleil ou avez une peau mixte à grasse. Optez pour ${p2Name} si vous cherchez un soin hydratant profond ou une routine du soir.`
      : `اختر ${p1Name} إذا كنت معرضاً للشمس أو لديك بشرة مختلطة. اختر ${p2Name} لترطيب عميق أو روتين المساء.`;
    if (isSolar2 && !isSolar1) return language === 'FR'
      ? `Optez pour ${p1Name} si vous cherchez un soin hydratant profond ou votre routine du soir. Choisissez ${p2Name} si vous êtes exposé au soleil ou avez la peau mixte.`
      : `اختر ${p1Name} لترطيب عميق أو روتين المساء. اختر ${p2Name} للحماية الشمسية أو البشرة المختلطة.`;
    if (hasHyaluronic1 && hasHyaluronic2) return language === 'FR'
      ? `Les deux soins hydratent intensément. Préférez ${p1Name} pour une texture légère au quotidien, ${p2Name} pour un soin plus enveloppant et repulpant.`
      : `كلا المنتجين يرطبان بشدة. فضل ${p1Name} للاستخدام اليومي الخفيف، و${p2Name} للعناية الأكثر ثراءً وعمقاً.`;
    if (p1.price < p2.price) return language === 'FR'
      ? `${p1Name} est le choix malin — efficace et accessible. ${p2Name} est l'investissement beauté pour une efficacité clinique maximale.`
      : `${p1Name} هو الاختيار الذكي — فعّال وبسعر معقول. ${p2Name} هو الاستثمار الجمالي للكفاءة القصوى.`;
    return language === 'FR'
      ? `${p1Name} et ${p2Name} répondent à des besoins complémentaires — comparez vos priorités cutanées pour choisir le bon soin.`
      : `${p1Name} و${p2Name} يلبيان احتياجات تكاملية — قارن أولوياتك للبشرة لاختيار العناية المثالية.`;
  };

  // Ingredient benefit extractor (parses ingredient list and returns matched clinical benefits)
  const getIngredientBenefits = (ingredients: string): { name: string; benefit: string }[] => {
    if (!ingredients) return [];
    const found: { name: string; benefit: string }[] = [];
    const seen = new Set<string>();
    for (const item of INGREDIENT_BENEFITS_MAP) {
      // Skip water/base when other items found
      if (item.name === 'Eau (Base)' && found.length > 0) continue;
      if (item.pattern.test(ingredients) && !seen.has(item.name)) {
        seen.add(item.name);
        found.push({ name: item.name, benefit: language === 'FR' ? item.benefit.FR : item.benefit.AR });
        if (found.length >= 3) break;
      }
    }
    return found;
  };

  // Detect skin type compatibility from product data
  const getSkinTypes = (product: Product): { label: string; emoji: string }[] => {
    const tags = product.tags || [];
    const desc = (product.description || '').toLowerCase();
    const ing = (product.ingredients || '').toLowerCase();
    const name = (product.nameFr || product.title || '').toLowerCase();
    const types: { label: string; emoji: string }[] = [];

    const isOily = tags.includes('grasse') || tags.includes('mixte') || desc.includes('grasse') || desc.includes('mat') || desc.includes('mixte') || ing.includes('salicylic') || ing.includes('alcohol denat') || ing.includes('zinc oxide');
    const isDry = tags.includes('seche') || tags.includes('sèche') || desc.includes('seche') || desc.includes('sèche') || desc.includes('déshydrat') || ing.includes('hyaluronic') || ing.includes('ceramide') || ing.includes('collagen');
    const isSensitive = tags.includes('sensible') || desc.includes('sensible') || ing.includes('allantoin') || ing.includes('panthenol') || ing.includes('madecassoside');
    const isCombination = tags.includes('mixte') || desc.includes('mixte');
    const isAllTypes = tags.includes('tous types') || name.includes('spf') || name.includes('solaire') || (isOily && isDry);

    if (isAllTypes) {
      return [{ label: language === 'FR' ? 'Tous Types' : 'كل أنواع البشرة', emoji: '' }];
    }
    if (isCombination) types.push({ label: language === 'FR' ? 'Peau Mixte' : 'بشرة مختلطة', emoji: '◑' });
    else if (isOily) types.push({ label: language === 'FR' ? 'Peau Grasse' : 'بشرة دهنية', emoji: '' });
    if (isDry && !isCombination) types.push({ label: language === 'FR' ? 'Peau Sèche' : 'بشرة جافة', emoji: '' });
    if (isSensitive) types.push({ label: language === 'FR' ? 'Peau Sensible' : 'بشرة حساسة', emoji: '' });
    if (types.length === 0) types.push({ label: language === 'FR' ? 'Peau Normale' : 'بشرة عادية', emoji: '●' });
    return types;
  };

  // Filter products for search slots
  const getFilteredProducts = (query: string, otherProduct: Product | undefined) => {
    const cleanQuery = query.toLowerCase().trim();
    // Exclude the product that is already in the other slot to avoid duplicate comparison
    const pool = products.filter(p => !otherProduct || p.id !== otherProduct.id);

    if (!cleanQuery) {
      // Recommend first 5 products by default
      return pool.slice(0, 5);
    }

    return pool.filter(p => 
      p.title.toLowerCase().includes(cleanQuery) ||
      (p.nameFr && p.nameFr.toLowerCase().includes(cleanQuery)) ||
      (p.vendor || '').toLowerCase().includes(cleanQuery)
    );
  };

  const renderProductSlot = (
    product: Product | undefined,
    isSearching: boolean,
    setIsSearching: (val: boolean) => void,
    query: string,
    setQuery: (val: string) => void,
    otherProduct: Product | undefined
  ) => {

    // Case 1: Slot has a product bound
    if (product) {
      return (
        <div 
          className="relative border border-slate-100 rounded-[8px] bg-white shadow-sm flex flex-col justify-between animate-[scale-up_0.3s_ease-out] pt-5 px-6 pb-6 min-h-[200px] box-border"
        >
          <button
            onClick={() => {
              removeFromCompare(product.id);
              setIsSearching(false);
              setQuery('');
            }}
            className="absolute z-20 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-[6px] transition-all cursor-pointer shadow-sm top-4 right-4 p-2 bg-slate-100 flex items-center justify-center border border-slate-200/20"
            title={language === 'FR' ? 'Retirer' : 'إزالة'}
            aria-label={language === 'FR' ? 'Retirer' : 'إزالة'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div>
            <div 
              className="rounded-[6px] overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative group h-[180px] w-full p-3 mb-4 box-border"
            >
              <img
                src={getOptimizedImageUrl(product.image)}
                alt={product.title}
                className="group-hover:scale-105 transition-transform duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] max-h-full max-w-full object-contain"
              />
            </div>
            <div className={isRTL ? 'pr-3' : 'pl-3'}>
              <span className="text-[9px] font-extrabold text-teal-700 uppercase tracking-widest block">
                {product.vendor}
              </span>
              <h4 
                className="text-xs font-black text-primary-dark line-clamp-2 leading-snug mt-1.5"
              >
                {product.nameFr || product.title}
              </h4>
            </div>
          </div>


        </div>
      );
    }

    // Case 2: Slot is empty and active search mode is open
    if (isSearching) {
      const filtered = getFilteredProducts(query, otherProduct);
      return (
        <div 
          className="relative border border-slate-200 bg-white rounded-[10px] shadow-md flex flex-col min-h-[360px] animate-[scale-up_0.25s_ease-out] pt-[18px] px-4 pb-5"
        >
          <div 
            className="flex items-center justify-between mb-6 gap-2"
          >
            <span className="text-[9px] font-black text-primary-dark uppercase tracking-widest">
              {language === 'FR' ? 'Rechercher un soin' : 'البحث عن مستحضر'}
            </span>
            <button 
              onClick={() => {
                setIsSearching(false);
                setQuery('');
              }}
              className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors"
            >
              {language === 'FR' ? 'ANNULER' : 'إلغاء'}
            </button>
          </div>
          
          <div className="relative mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'FR' ? 'Rechercher un produit ou marque...' : 'ابحث عن منتج أو ماركة...'}
              className="w-full h-10 border border-slate-200 rounded-[6px] text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50 px-4"
              autoFocus
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            />
          </div>
          
          <div 
            className="overflow-y-auto flex-grow pr-1 no-scrollbar flex flex-col max-h-[220px] gap-2"
          >
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                {language === 'FR' ? 'Aucun soin trouvé' : 'لم يتم العثور على أي منتج'}
              </div>
            ) : (
              filtered.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => {
                    addToCompare(prod);
                    setIsSearching(false);
                    setQuery('');
                  }}
                  className="flex items-center rounded-[6px] border border-slate-50 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all duration-200 p-2.5 gap-3"
                >
                  <div 
                    className="rounded-[4px] overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 w-10 h-10 p-1 box-border"
                  >
                    <img
                      src={getOptimizedImageUrl(prod.image)}
                      alt={prod.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[8px] font-extrabold text-teal-700 uppercase tracking-wider block">
                      {prod.vendor}
                    </span>
                    <h5 className="text-[11px] font-bold text-primary-dark line-clamp-1 leading-tight mt-0.5">
                      {prod.nameFr || prod.title}
                    </h5>
                    <span className="text-[10px] font-black text-primary-dark mt-0.5 block">
                      {convertPrice(prod.price)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Case 3: Slot is empty (Blank default state)
    return (
      <div 
        onClick={() => setIsSearching(true)}
        className="border-2 border-dashed border-slate-200 hover:border-primary/30 rounded-[10px] bg-slate-50/30 hover:bg-slate-50/70 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group relative p-8 min-h-[360px] box-border"
      >
        <div 
          className="rounded-[8px] bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-105 transition-transform duration-300 w-16 h-16"
        >
          <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
        <div 
          className="space-y-1.5 my-6"
        >
          <p className="text-[10px] text-slate-400 max-w-[220px] leading-relaxed mx-auto">
            {language === 'FR'
              ? 'Cliquez pour rechercher et sélectionner un soin de notre boutique.'
              : 'اضغطي للبحث واختيار مستحضر لمقارنته.'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSearching(true);
          }}
          className="btn-primary py-2.5 px-6 text-[10px] gap-1.5 shadow-[0_1px_4px_rgba(26,37,93,0.15)]"
        >
          <span>{language === 'FR' ? 'Rechercher' : 'بحث'}</span>
        </button>
      </div>
    );
  };

  const backdropCls = [
    't-modal-backdrop',
    'fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  const modalCls = [
    't-modal',
    'relative w-full max-w-[850px] bg-white border border-slate-200/50 rounded-[10px] shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  return (
    <div className={backdropCls}>
      
      {/* Dynamic Dermo-Alert Overlay (Limit Breach) */}
      {alertMessage && (
        <div className="absolute inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm bg-white border border-amber-200 rounded-[10px] p-6 shadow-2xl space-y-4 animate-scale-up"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-[6px] text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-primary-dark">
                  {language === 'FR' ? 'Limite Atteinte' : 'تم الوصول للحد الأقصى'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {alertMessage}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertMessage(null)}
                className="px-4 py-2 bg-primary-dark hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer"
              >
                {language === 'FR' ? 'D' : ''}accord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Compare Modal Container */}
      <div
        className={modalCls}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        
        {/* Header Block */}
        <div 
          className="flex items-center justify-between border-b border-slate-100 shrink-0 py-6 px-8"
        >
          <div className="flex items-center text-primary-dark gap-2">
            <Scale className="w-5 h-5 shrink-0" />
            <h2 className="text-sm font-black uppercase tracking-wider m-0">
              {language === 'FR' ? 'Comparateur Clinique' : 'المقارن المخبري'}
            </h2>
            <span 
              className="text-[10px] font-bold bg-primary/10 text-accent rounded-[4px] px-2 py-0.5 inline-block"
            >
              {compareProducts.length} / 2
            </span>
          </div>

          <div className="flex items-center gap-4">
            {compareProducts.length > 0 && (
              <button
                onClick={() => {
                  clearCompare();
                  setIsSearching1(false);
                  setIsSearching2(false);
                  setSearchQuery1('');
                  setSearchQuery2('');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center cursor-pointer gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'FR' ? 'Vider' : 'إفراغ'}</span>
              </button>
            )}
            <button
              onClick={() => setIsOpenModal(false)}
              aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-[6px] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-grow py-10 px-8">
          
          <div>
            
            {/* Product Slots Grid Selector */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 relative gap-8"
            >
              
              {/* Slot 1 */}
              {renderProductSlot(
                compareProducts[0],
                isSearching1,
                setIsSearching1,
                searchQuery1,
                setSearchQuery1,
                compareProducts[1]
              )}

              {/* Central VS Separator (Desktop) */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center pointer-events-none w-9 h-9"
              >
                <div 
                  className="rounded-[6px] bg-primary-dark text-white border-2 border-white flex items-center justify-center shadow-md font-black text-[10px] tracking-widest w-full h-full"
                >
                  VS
                </div>
              </div>

              {/* Slot 2 */}
              {renderProductSlot(
                compareProducts[1],
                isSearching2,
                setIsSearching2,
                searchQuery2,
                setSearchQuery2,
                compareProducts[0]
              )}
            </div>

            {/* Specification Comparison Matrix (Only when both slots are fully selected) */}
            {compareProducts.length === 2 ? (
              <div 
                className="border border-slate-100 rounded-[10px] overflow-hidden bg-white shadow-sm animate-[slide-up-fade_0.4s_ease-out] mt-8"
              >
                {/* Helper: winner badge */}
                {(() => {
                  const WinBadge = ({ side, winner }: { side: 'left' | 'right', winner: 'left' | 'right' | 'tie' }) => {
                    if (winner !== side) return null;
                    return (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 rounded-[3px] px-1.5 py-0.5 ml-1.5 align-middle">
                        {language === 'FR' ? 'Avantage' : 'أفضل'}
                      </span>
                    );
                  };

                  const activifsWinner = getRowWinner(compareProducts[0], compareProducts[1], 'actifs');
                  const noteWinner = getRowWinner(compareProducts[0], compareProducts[1], 'note');
                  const prixWinner = getRowWinner(compareProducts[0], compareProducts[1], 'prix');

                  return (
                    <>
                      {/* Row: Active Ingredients */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Actifs Clés' : 'المكونات الفعالة'}
                        </div>
                        <div 
                          className={`border-r border-slate-100 font-bold text-slate-700 leading-relaxed p-5 ${
                            activifsWinner === 'left' ? 'bg-emerald-100/25' : 'bg-transparent'
                          }`}
                        >
                          {getActiveIngredientsLabel(compareProducts[0].ingredients)}
                          <WinBadge side="left" winner={activifsWinner} />
                        </div>
                        <div 
                          className={`font-bold text-slate-700 leading-relaxed p-5 ${
                            activifsWinner === 'right' ? 'bg-emerald-100/25' : 'bg-transparent'
                          }`}
                        >
                          {getActiveIngredientsLabel(compareProducts[1].ingredients)}
                          <WinBadge side="right" winner={activifsWinner} />
                        </div>
                      </div>

                      {/* Row: Ingredient Benefits */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-start bg-slate-50/50 p-5"
                        >
                          <div>
                            <div>{language === 'FR' ? 'Ce que font les actifs' : 'ماذا تفعل المكونات'}</div>
                            <div className="text-[9px] font-medium text-slate-400 mt-1 leading-snug">
                              {language === 'FR' ? 'Basé sur la liste INCI' : 'بناءً على قائمة INCI'}
                            </div>
                          </div>
                        </div>
                        <div 
                          className="border-r border-slate-100 p-5"
                        >
                          <div className="flex flex-col gap-1.5">
                            {getIngredientBenefits(compareProducts[0].ingredients).map((item, i) => (
                              <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-black text-primary-dark shrink-0 max-w-[90px] leading-snug">{item.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">→</span>
                                <span className="text-[9px] font-semibold text-primary leading-snug">{item.benefit}</span>
                              </div>
                            ))}
                            {getIngredientBenefits(compareProducts[0].ingredients).length === 0 && (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-col gap-1.5">
                            {getIngredientBenefits(compareProducts[1].ingredients).map((item, i) => (
                              <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-black text-primary-dark shrink-0 max-w-[90px] leading-snug">{item.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">→</span>
                                <span className="text-[9px] font-semibold text-primary leading-snug">{item.benefit}</span>
                              </div>
                            ))}
                            {getIngredientBenefits(compareProducts[1].ingredients).length === 0 && (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row: Skin Targeted Concern */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Cible Dermatologique' : 'الهدف الجلدي'}
                        </div>
                        <div 
                          className="border-r border-slate-100 font-semibold text-slate-700 p-5"
                        >
                          <span 
                            className="rounded-[4px] border text-[9px] font-black tracking-wider uppercase bg-sky-50 text-sky-700 border-sky-100 px-2.5 py-1 inline-block"
                          >
                            {compareProducts[0].tags.includes('solaire') ? (language === 'FR' ? 'Soin Solaire' : 'عناية شمسية') : (language === 'FR' ? 'Hydratation Clinique' : 'ترطيب مخبري')}
                          </span>
                        </div>
                        <div 
                          className="font-semibold text-slate-700 p-5"
                        >
                          <span 
                            className="rounded-[4px] border text-[9px] font-black tracking-wider uppercase bg-sky-50 text-sky-700 border-sky-100 px-2.5 py-1 inline-block"
                          >
                            {compareProducts[1].tags.includes('solaire') ? (language === 'FR' ? 'Soin Solaire' : 'عناية شمسية') : (language === 'FR' ? 'Hydratation Clinique' : 'ترطيب مخبري')}
                          </span>
                        </div>
                      </div>

                      {/* Row: Routine timing matching */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? "Moment d'Application" : 'وقت الاستعمال'}
                        </div>
                        <div 
                          className="border-r border-slate-100 font-bold text-slate-700 p-5"
                        >
                          {getRoutineLabel(compareProducts[0].tags, compareProducts[0].nameFr || '', compareProducts[0].title, compareProducts[0].id)}
                        </div>
                        <div 
                          className="font-bold text-slate-700 p-5"
                        >
                          {getRoutineLabel(compareProducts[1].tags, compareProducts[1].nameFr || '', compareProducts[1].title, compareProducts[1].id)}
                        </div>
                      </div>

                      {/* Row: Type de Peau */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Type de Peau' : 'نوع البشرة'}
                        </div>
                        <div 
                          className="border-r border-slate-100 p-5"
                        >
                          <div className="flex flex-col gap-1.5">
                            {getSkinTypes(compareProducts[0]).map((t, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 bg-indigo-50 rounded-[4px] px-2 py-1 self-start">
                                <span>{t.emoji}</span>
                                <span>{t.label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-col gap-1.5">
                            {getSkinTypes(compareProducts[1]).map((t, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 bg-indigo-50 rounded-[4px] px-2 py-1 self-start">
                                <span>{t.emoji}</span>
                                <span>{t.label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Row: Prix */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Prix' : 'السعر'}
                        </div>
                        <div 
                          className={`border-r border-slate-100 font-bold text-primary-dark p-5 ${
                            prixWinner === 'left' ? 'bg-emerald-100/25' : 'bg-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-black text-primary-dark">{convertPrice(compareProducts[0].price)}</span>
                            {compareProducts[0].comparePrice > compareProducts[0].price && (
                              <span className="text-[10px] text-slate-400 line-through font-semibold">{convertPrice(compareProducts[0].comparePrice)}</span>
                            )}
                            <WinBadge side="left" winner={prixWinner} />
                          </span>
                        </div>
                        <div 
                          className={`font-bold text-primary-dark p-5 ${
                            prixWinner === 'right' ? 'bg-emerald-100/25' : 'bg-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-black text-primary-dark">{convertPrice(compareProducts[1].price)}</span>
                            {compareProducts[1].comparePrice > compareProducts[1].price && (
                              <span className="text-[10px] text-slate-400 line-through font-semibold">{convertPrice(compareProducts[1].comparePrice)}</span>
                            )}
                            <WinBadge side="right" winner={prixWinner} />
                          </span>
                        </div>
                      </div>

                      {/* Row: Stock Status */}
                      <div className="grid grid-cols-3 border-b border-slate-100 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Disponibilité' : 'الحالة'}
                        </div>
                        <div 
                          className="border-r border-slate-100 font-bold p-5"
                        >
                          <span className="text-emerald-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-[1px] bg-emerald-600" />
                            <span>{language === 'FR' ? 'En stock' : 'متوفر'}</span>
                          </span>
                        </div>
                        <div 
                          className="font-bold p-5"
                        >
                          <span className="text-emerald-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-[1px] bg-emerald-600" />
                            <span>{language === 'FR' ? 'En stock' : 'متوفر'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Row: Clinical Purpose/Description */}
                      <div className="grid grid-cols-3 text-xs">
                        <div 
                          className="border-r border-slate-100 font-extrabold text-primary-dark flex items-center bg-slate-50/50 p-5"
                        >
                          {language === 'FR' ? 'Formulation & Profil' : 'خصائص التركيبة'}
                        </div>
                        <div 
                          className="border-r border-slate-100 font-medium text-slate-500 leading-relaxed p-5"
                        >
                          {(() => { const d = compareProducts[0].description || ''; const s = d.split(/\.\s/)[0]; return s.length > 90 ? s.slice(0, 90) + '…' : s; })()}
                        </div>
                        <div 
                          className="font-medium text-slate-500 leading-relaxed p-5"
                        >
                          {(() => { const d = compareProducts[1].description || ''; const s = d.split(/\.\s/)[0]; return s.length > 90 ? s.slice(0, 90) + '…' : s; })()}
                        </div>
                      </div>

                      {/* Option C: Editorial Verdict Banner */}
                      <div className="p-5 flex items-start gap-3.5 bg-gradient-to-br from-primary-dark to-primary">
                        <div className="shrink-0 w-7 h-7 bg-white/10 rounded flex items-center justify-center text-sm">💡</div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/50 mb-1.5">
                            {language === 'FR' ? 'Notre conseil clinique' : 'نصيحتنا السريرية'}
                          </span>
                          <p className="text-[11px] font-semibold text-white/90 leading-relaxed m-0">
                            {getVerdict(compareProducts[0], compareProducts[1])}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              // Helpful empty prompt layout to motivate filling Slot 02
              <div 
                className="text-center p-6 bg-slate-50/40 rounded-[10px] border border-slate-100 animate-pulse mt-8"
              >
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {language === 'FR'
                    ? 'Sélectionnez un second soin pour révéler le comparatif clinique side-by-side'
                    : 'اختري منتجاً ثانياً لإظهار مقارنة التركيبة والخصائص الطبية'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
