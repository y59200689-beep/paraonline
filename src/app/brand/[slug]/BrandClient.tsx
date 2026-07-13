'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { ShopShell } from '@/components/ShopShell';
import { BrandConfig } from '@/lib/brands';
import { Search, SlidersHorizontal, Check, ArrowUpDown, X, Sparkles, ShieldCheck, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BrandClientProps {
  brand: BrandConfig;
  /** Optional seed products for instant first paint */
  initialProducts?: Product[];
}

const CONCERNS = [
  { id: 'acne', labelFR: 'Acné & Imperfections', labelAR: 'حب الشباب والشوائب' },
  { id: 'spots', labelFR: 'Taches Brunes & Éclat', labelAR: 'البقع الداكنة والنضارة' },
  { id: 'dryness', labelFR: 'Sécheresse & Hydratation', labelAR: 'الجفاف والترطيب' },
  { id: 'wrinkles', labelFR: 'Rides & Anti-Âge', labelAR: 'التجاعيد ومكافحة الشيخوخة' },
  { id: 'redness', labelFR: 'Rougeurs & Peau Sensible', labelAR: 'الاحمرار والبشرة الحساسة' }
];

const CATEGORIES = [
  { id: 'all', labelFR: 'Toutes catégories', labelAR: 'جميع الفئات' },
  { id: 'visage', labelFR: 'Visage & Peau', labelAR: 'الوجه والبشرة' },
  { id: 'solaire', labelFR: 'Protection Solaire', labelAR: 'واقيات الشمس' },
  { id: 'cheveux', labelFR: 'Soin Capillaire', labelAR: 'العناية بالشعر' },
  { id: 'kbeauty', labelFR: 'K-Beauty Coréenne', labelAR: 'الجمال الكوري' },
  { id: 'offers', labelFR: 'Offres & Coffrets', labelAR: 'العروض والمجموعات' }
];

export default function BrandClient({ brand, initialProducts = [] }: BrandClientProps) {
  const { language } = useTranslation();
  const isRtl = language === 'AR';

  // Brand-specific product fetch — queries vendor directly so we get all products
  // regardless of how many total products exist in the DB
  const [brandProducts, setBrandProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    // Fetch all pages for this brand's vendor
    const fetchBrandProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?vendor=${encodeURIComponent(brand.name)}&limit=500&page=1`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.products)) {
          setBrandProducts(data.products);
        }
      } catch (err) {
        console.warn('[BrandClient] Failed to load brand products:', err);
        // Keep seed products if fetch fails
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBrandProducts();
    return () => { cancelled = true; };
  }, [brand.name]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortOption, setSortOption] = useState('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dynamic calculations based on filters
  const filteredProducts = useMemo(() => {
    return brandProducts.filter(product => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const matchesCategory = product.category === selectedCategory || product.tags.includes(selectedCategory);
        if (!matchesCategory) return false;
      }

      // 2. Concerns Filter (logical OR if multiple selected)
      if (selectedConcerns.length > 0) {
        const productText = `${product.title} ${product.description} ${product.ingredients} ${product.tags.join(' ')}`.toLowerCase();
        const matchesAnyConcern = selectedConcerns.some(concernId => {
          if (concernId === 'acne') {
            return productText.includes('acné') || productText.includes('imperfection') || productText.includes('bouton') || product.ingredients.toLowerCase().includes('salicylic');
          }
          if (concernId === 'spots') {
            return productText.includes('tache') || productText.includes('éclat') || productText.includes('bright') || productText.includes('vitamine c');
          }
          if (concernId === 'dryness') {
            return productText.includes('déshydrat') || productText.includes('sec') || productText.includes('hydrat') || product.ingredients.toLowerCase().includes('hyaluronic');
          }
          if (concernId === 'wrinkles') {
            return productText.includes('ridule') || productText.includes('âge') || productText.includes('anti-aging') || product.ingredients.toLowerCase().includes('retinol');
          }
          if (concernId === 'redness') {
            return productText.includes('rougeur') || productText.includes('apais') || productText.includes('sensible') || product.ingredients.toLowerCase().includes('centella');
          }
          return true;
        });
        if (!matchesAnyConcern) return false;
      }

      // 3. Price Filter
      if (product.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating') return (b.rating || 5) - (a.rating || 5);
      return (b.reviews || 0) - (a.reviews || 0); // popular default
    });
  }, [brandProducts, selectedCategory, selectedConcerns, maxPrice, sortOption]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = brandProducts.length;
      } else {
        counts[cat.id] = brandProducts.filter(p => p.category === cat.id || p.tags.includes(cat.id)).length;
      }
    });
    return counts;
  }, [brandProducts]);

  const concernCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CONCERNS.forEach(c => {
      counts[c.id] = brandProducts.filter(product => {
        const productText = `${product.title} ${product.description} ${product.ingredients} ${product.tags.join(' ')}`.toLowerCase();
        if (c.id === 'acne') {
          return productText.includes('acné') || productText.includes('imperfection') || productText.includes('bouton') || product.ingredients.toLowerCase().includes('salicylic');
        }
        if (c.id === 'spots') {
          return productText.includes('tache') || productText.includes('éclat') || productText.includes('bright') || productText.includes('vitamine c');
        }
        if (c.id === 'dryness') {
          return productText.includes('déshydrat') || productText.includes('sec') || productText.includes('hydrat') || product.ingredients.toLowerCase().includes('hyaluronic');
        }
        if (c.id === 'wrinkles') {
          return productText.includes('ridule') || productText.includes('âge') || productText.includes('anti-aging') || product.ingredients.toLowerCase().includes('retinol');
        }
        if (c.id === 'redness') {
          return productText.includes('rougeur') || productText.includes('apais') || productText.includes('sensible') || product.ingredients.toLowerCase().includes('centella');
        }
        return true;
      }).length;
    });
    return counts;
  }, [brandProducts]);

  const toggleConcern = (id: string) => {
    if (selectedConcerns.includes(id)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== id));
    } else {
      setSelectedConcerns([...selectedConcerns, id]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedConcerns([]);
    setMaxPrice(1500);
    setSortOption('popular');
  };

  const brandLogoUrl = brand.logoUrl || `https://logos.hunter.io/${brand.domain}`;

  return (
    <ShopShell>
      <main className="min-h-screen bg-slate-50/50 pb-16 pt-4 dark:bg-slate-950/20 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 select-none">
            <Link href="/" className="hover:text-primary transition-colors">
              {isRtl ? 'الرئيسية' : 'Accueil'}
            </Link>
            <span>/</span>
            <span className="text-slate-500 dark:text-slate-300">{brand.name}</span>
          </nav>

          {/* Premium Editorial Brand Header */}
          <div className="bg-white dark:bg-slate-900/60 rounded-[32px] border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)] backdrop-blur-md relative overflow-hidden mb-10 select-none">
            
            {/* Header background accents */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-accent/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
              
              {/* Brand Logo Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] bg-white border border-slate-100 dark:border-slate-800 flex items-center justify-center p-4 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <img 
                  src={brandLogoUrl} 
                  alt={brand.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text initials if logo fails
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const textFallback = document.createElement('span');
                      textFallback.className = "text-xl font-black text-slate-400 tracking-wider";
                      textFallback.innerText = brand.name.slice(0, 2).toUpperCase();
                      parent.appendChild(textFallback);
                    }
                  }}
                />
              </div>

              {/* Brand details and bio */}
              <div className="flex-1 text-center md:text-left rtl:md:text-right space-y-4">
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                    {brand.name}
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold italic text-accent font-sans">
                    &ldquo;{isRtl ? brand.taglineAr : brand.taglineFr}&rdquo;
                  </p>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[85ch]">
                  {isRtl ? brand.descriptionAr : brand.descriptionFr}
                </p>

                {/* Brand metadata tags */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-full text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 select-none">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isRtl ? 'منتجات أصلية 100%' : '100% Authentique'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none">
                    <Globe className="w-3.5 h-3.5" />
                    {brand.domain}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/20 border border-teal-100/50 dark:border-teal-900/30 rounded-full text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 select-none">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isRtl ? 'موصى به طبيا' : 'Conseil Dermatologique'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and products section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] select-none">
              
              {/* Sidebar Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-250 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-accent" />
                  {isRtl ? 'تصفيات' : 'Filtres'}
                </span>
                {(selectedCategory !== 'all' || selectedConcerns.length > 0 || maxPrice < 1500) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    {isRtl ? 'مسح الكل' : 'Effacer'}
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isRtl ? 'الفئة' : 'Catégorie'}
                </h3>
                <div className="space-y-1.5">
                  {CATEGORIES.map(cat => {
                    const count = categoryCounts[cat.id] || 0;
                    if (count === 0 && cat.id !== 'all') return null;
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left rtl:text-right ${
                          active
                            ? 'bg-accent/10 text-accent font-bold'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950/60'
                        }`}
                      >
                        <span>{isRtl ? cat.labelAR : cat.labelFR}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          active ? 'bg-accent/20 text-accent' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Concerns Filter */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isRtl ? 'نوع المشكلة' : 'Préoccupation'}
                </h3>
                <div className="space-y-1.5">
                  {CONCERNS.map(c => {
                    const count = concernCounts[c.id] || 0;
                    if (count === 0) return null;
                    const active = selectedConcerns.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleConcern(c.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left rtl:text-right ${
                          active
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-950/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            active ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <span>{isRtl ? c.labelAR : c.labelFR}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {isRtl ? 'السعر الأقصى' : 'Prix maximum'}
                  </h3>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                    {maxPrice} DH
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={1500}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

            </aside>

            {/* Catalog Grid & Mobile Filters */}
            <section className="lg:col-span-3 space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] select-none">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isRtl 
                    ? `تم العثور على ${filteredProducts.length} منتجات` 
                    : `${filteredProducts.length} produits trouvés`
                  }
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  
                  {/* Mobile Filters Toggle */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="flex lg:hidden flex-1 items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 transition cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    <span>{isRtl ? 'تصفيات' : 'Filtres'}</span>
                  </button>

                  {/* Sorting dropdown */}
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full sm:w-48 px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl outline-none focus:border-accent/60 transition cursor-pointer appearance-none pr-8 rtl:pl-8 rtl:pr-3.5"
                    >
                      <option value="popular">{isRtl ? 'الأكثر شعبية' : 'Popularité'}</option>
                      <option value="price-asc">{isRtl ? 'السعر: من الأقل إلى الأعلى' : 'Prix croissant'}</option>
                      <option value="price-desc">{isRtl ? 'السعر: من الأعلى إلى الأقل' : 'Prix décroissant'}</option>
                      <option value="rating">{isRtl ? 'أفضل التقييمات' : 'Meilleures notes'}</option>
                    </select>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none rtl:left-3 rtl:right-auto" />
                  </div>

                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-12 text-center select-none shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-950/60 flex items-center justify-center text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                      {isRtl ? 'لم يتم العثور على نتائج' : 'Aucun produit trouvé'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isRtl 
                        ? 'يرجى تجربة تعديل تصفيات البحث الخاصة بك للحصول على نتائج.' 
                        : 'Veuillez modifier vos filtres de recherche ou essayer un budget différent.'
                      }
                    </p>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 px-5 py-2.5 bg-accent hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-accent/10 hover:shadow-lg transition cursor-pointer"
                  >
                    {isRtl ? 'إعادة ضبط التصفية' : 'Réinitialiser les filtres'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

            </section>
          </div>

        </div>

        {/* Mobile Filters Drawer Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm cursor-pointer"
            />
            
            {/* Drawer */}
            <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-350 z-50">
              
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-accent" />
                    {isRtl ? 'تصفيات' : 'Filtres'}
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {isRtl ? 'الفئة' : 'Catégorie'}
                  </h3>
                  <div className="space-y-1.5">
                    {CATEGORIES.map(cat => {
                      const count = categoryCounts[cat.id] || 0;
                      if (count === 0 && cat.id !== 'all') return null;
                      const active = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left rtl:text-right ${
                            active
                              ? 'bg-accent/10 text-accent font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                          }`}
                        >
                          <span>{isRtl ? cat.labelAR : cat.labelFR}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-accent/20 text-accent' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Concerns */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {isRtl ? 'نوع المشكلة' : 'Préoccupation'}
                  </h3>
                  <div className="space-y-1.5">
                    {CONCERNS.map(c => {
                      const count = concernCounts[c.id] || 0;
                      if (count === 0) return null;
                      const active = selectedConcerns.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleConcern(c.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left rtl:text-right ${
                            active
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              active ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span>{isRtl ? c.labelAR : c.labelFR}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {isRtl ? 'السعر الأقصى' : 'Prix maximum'}
                    </h3>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                      {maxPrice} DH
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1500}
                    step={10}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

              </div>

              {/* Sticky actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex gap-3">
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  {isRtl ? 'مسح الكل' : 'Effacer'}
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-accent hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                >
                  {isRtl ? 'تطبيق' : 'Appliquer'}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </ShopShell>
  );
}
