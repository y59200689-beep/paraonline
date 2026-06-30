'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Star, ShoppingCart, Eye, Heart, Sparkles, Scale, Coins } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useAmPm } from '@/context/AmPmContext';
import { useCompare } from '@/context/CompareContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  className?: string;
  style?: React.CSSProperties;
  customBadge?: string;
  imageOverlay?: React.ReactNode;
  showMatchScore?: boolean;
  searchQuery?: string;
}

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const renderHighlightedTitle = (title: string, query?: string) => {
  if (!query || !query.trim()) return title;
  const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const parts = title.split(new RegExp(`(${escapedQuery})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="bg-teal-500/15 text-teal-800 dark:text-teal-300 font-extrabold rounded px-0.5">{part}</span>
          : part
      )}
    </>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenQuickView,
  className,
  style,
  customBadge,
  imageOverlay,
  showMatchScore = false,
  searchQuery
}) => {
  const { addToCart } = useCart();
  const { language } = useTranslation();
  const { convertPrice } = useCurrency();
  const { settings } = useSettings();
  const lowStockThreshold = settings.lowStockThreshold || 5;
  const { toggleCompare, isInCompare } = useCompare();
  const isCompared = isInCompare(product.id);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const { amPmState } = useAmPm();
  const { diagnostic, triggerFlyToCart, setSelectedProduct } = useUi();

  const [imgError, setImgError] = useState(false);
  const [altImgError, setAltImgError] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  const handleRippleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    setRipples(prev => [...prev, { id: Date.now() + Math.random(), x: x - size / 2, y: y - size / 2, size }]);
  };

  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    const el = cardRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!isVisible) {
    return (
      <div
        ref={cardRef}
        className={`group relative bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all duration-300 flex flex-col h-full ${className || ''}`}
        style={{ ...style, minHeight: '380px' }}
      >
        <div className="relative w-[calc(100%-24px)] aspect-square m-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 animate-pulse" />
        <div className="px-4 pb-4 pt-1 flex flex-col flex-grow space-y-3">
          <div className="h-3 bg-slate-50/60 rounded w-1/3 animate-pulse" />
          <div className="h-5 bg-slate-50/60 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-50/60 rounded w-1/2 animate-pulse" />
          <div className="mt-auto pt-2.5">
            <div className="h-[40px] bg-slate-50/60 rounded-lg w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const getMatchScore = () => {
    if (!diagnostic) return null;
    const { skinType, concern } = diagnostic;
    let score = 76; // Premium base compatibility

    const searchField = `${product.title} ${product.description} ${product.ingredients} ${product.tags.join(' ')}`.toLowerCase();

    // 1. Target skin concerns matching
    if (concern === 'acne') {
      if (searchField.includes('acné') || searchField.includes('imperfection') || searchField.includes('salicylique') || searchField.includes('mousse') || searchField.includes('purifi') || searchField.includes('nettoy')) {
        score += 16;
      }
    } else if (concern === 'spots') {
      if (searchField.includes('tache') || searchField.includes('bright') || searchField.includes('éclat') || searchField.includes('vitamine c') || searchField.includes('tranexamique') || searchField.includes('niacinamide')) {
        score += 18;
      }
    } else if (concern === 'wrinkles') {
      if (searchField.includes('age') || searchField.includes('ridule') || searchField.includes('anti-age') || searchField.includes('retinol') || searchField.includes('collagene') || searchField.includes('fermeté')) {
        score += 15;
      }
    } else if (concern === 'dryness') {
      if (searchField.includes('hydrat') || searchField.includes('hyaluronique') || searchField.includes('sec') || searchField.includes('sèche') || searchField.includes('squalane')) {
        score += 17;
      }
    }

    // 2. Target skin type compatibility
    if (skinType === 'oily') {
      if (searchField.includes('gel') || searchField.includes('fluide') || searchField.includes('léger') || searchField.includes('sans gras') || searchField.includes('matifi')) {
        score += 5;
      } else if (searchField.includes('riche') || searchField.includes('huile de soin') || searchField.includes('crème onctueuse')) {
        score -= 8;
      }
    } else if (skinType === 'dry') {
      if (searchField.includes('crème') || searchField.includes('nourris') || searchField.includes('intense') || searchField.includes('hyaluronique') || searchField.includes('lotion hydratante')) {
        score += 5;
      } else if (searchField.includes('asséchant') || searchField.includes('purifiant fort')) {
        score -= 6;
      }
    } else if (skinType === 'sensitive') {
      if (searchField.includes('centella') || searchField.includes('probiotic') || searchField.includes('apais') || searchField.includes('sensible') || searchField.includes('douceur')) {
        score += 5;
      } else if (searchField.includes('acide fort') || searchField.includes('peeling')) {
        score -= 8;
      }
    }

    return Math.max(68, Math.min(99, score));
  };

  const getMatchReason = () => {
    if (!diagnostic) return '';
    const { skinType, concern } = diagnostic;

    let fr = '';
    let ar = '';

    if (concern === 'acne') {
      fr = 'Régule l\'excès de sébum et purifie les comédons.';
      ar = 'ينظم الدهون الزائدة وينقي البشرة من الشوائب.';
    } else if (concern === 'spots') {
      fr = 'Active l\'éclat et estompe les taches d\'hyperpigmentation.';
      ar = 'ينشط النضارة ويخفف من البقع الداكنة بشكل ملحوظ.';
    } else if (concern === 'wrinkles') {
      fr = 'Stimule la régénération cellulaire et lisse les ridules.';
      ar = 'يحفز تجديد الخلايا وينعم الخطوط الدقيقة.';
    } else {
      fr = 'Hydrate intensément les couches cutanées et scelle l\'eau.';
      ar = 'يرطب طبقات الجلد بعمق ويحبس الرطوبة داخلها.';
    }

    const skinTypeFr = skinType === 'oily' ? 'les peaux grasses' : skinType === 'dry' ? 'les peaux sèches' : skinType === 'sensitive' ? 'les peaux sensibles' : 'les peaux mixtes';
    const skinTypeAr = skinType === 'oily' ? 'البشرة الدهنية' : skinType === 'dry' ? 'البشرة الجافة' : skinType === 'sensitive' ? 'البشرة الحساسة' : 'البشرة المختلطة';

    return language === 'FR' 
      ? `${fr} Parfaitement adapté pour ${skinTypeFr}.` 
      : `${ar} مناسب تماماً ل${skinTypeAr}.`;
  };

  const matchScore = getMatchScore();
  const matchReason = getMatchReason();
  const isRTL = language === 'AR';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;

    triggerFlyToCart(product.image, clientX, clientY);

    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 900);
  };

  const discount = product.comparePrice && product.price && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const vendorLower = (product.vendor || '').toLowerCase();
  const isKBeauty = ['anua', 'beauty of joseon', 'skin1004', 'hada labo tokyo'].includes(vendorLower);
  const isBestSeller = product.rating >= 4.8;
  const isSolaire = product.tags.includes('solaire') || product.nameFr?.toLowerCase().includes('solaire') || product.name?.toLowerCase().includes('sun');

  const highlightTag = isKBeauty 
    ? (language === 'FR' ? 'K-Beauty' : 'جمال كوري')
    : isBestSeller 
      ? (language === 'FR' ? 'Best-Seller' : 'الأكثر مبيعاً')
      : isSolaire
        ? (language === 'FR' ? 'Solaire' : 'واqui شمس')
        : (language === 'FR' ? 'Nouveau' : 'جديد');

  const isUrgent = discount && discount >= 20;
  const isAMState = amPmState === 'am';

  const isDayProduct = isSolaire || product.tags.includes('jour') || product.nameFr?.toLowerCase().includes('jour') || product.nameFr?.toLowerCase().includes('bright') || product.nameFr?.toLowerCase().includes('vitamine c') || product.id === 3 || product.id === 7 || product.id === 14 || product.id === 17 || product.id === 13 || product.id === 1;
  const isNightProduct = product.tags.includes('nuit') || product.nameFr?.toLowerCase().includes('nuit') || product.nameFr?.toLowerCase().includes('night') || product.id === 8 || product.id === 5 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 6;

  const routineLabelFr = isDayProduct && isNightProduct ? 'Jour & Nuit' : isDayProduct ? 'Soin de Jour' : 'Soin de Nuit';
  const routineLabelAr = isDayProduct && isNightProduct ? 'نهاراً وليلاً' : isDayProduct ? 'عناية نهارية' : 'عناية ليلية';

  const isMatchingTime = (isAMState && isDayProduct) || (!isAMState && isNightProduct);

  const getKeyIngredients = () => {
    if (!product.ingredients) return [];
    const actives = [
      'niacinamide', 'centella asiatica', 'retinol', 'vitamine c', 'acide hyaluronique', 
      'acide tranexamique', 'squalane', 'acide salicylique', 'zinc', 'panthenol', 'collagène', 
      'l-lysine', 'ceramides', 'l-proline', 'hyaluronic acid', 'squalene', 'aminexil'
    ];
    const found: string[] = [];
    const ingredientsLower = product.ingredients.toLowerCase();
    
    actives.forEach(act => {
      if (ingredientsLower.includes(act)) {
        if (act === 'acide hyaluronique' || act === 'hyaluronic acid') found.push('Acide Hyaluronique');
        else if (act === 'vitamine c') found.push('Vitamine C');
        else if (act === 'centella asiatica') found.push('Centella');
        else if (act === 'acide tranexamique') found.push('TXA');
        else if (act === 'acide salicylique') found.push('BHA');
        else found.push(act.charAt(0).toUpperCase() + act.slice(1));
      }
    });
    
    return found.slice(0, 2);
  };
  const keyIngredients = getKeyIngredients();

  const getCategoryLabel = () => {
    const cat = product.category.toLowerCase();
    if (cat === 'visage') return language === 'FR' ? 'Soin Visage' : 'العناية بالوجه';
    if (cat === 'solaire') return language === 'FR' ? 'Soin Solaire' : 'واقيات الشمس';
    if (cat === 'cheveux') return language === 'FR' ? 'Soin Capillaire' : 'العناية بالشعر';
    if (cat === 'corps') return language === 'FR' ? 'Soin du Corps' : 'العناية بالجسم';
    if (cat === 'kbeauty') return 'K-Beauty';
    return product.vendor;
  };

  const categoryLabel = getCategoryLabel();

  const cleanTitle = (title: string) => {
    let clean = title;
    const vendorPrefixes = [
      "Hada Labo Tokyo", "Hada Labo", "La Roche-Posay", "La Roche Posay",
      "Vichy", "CeraVe", "Eucerin", "Bioderma", "SVR", "Cetaphil",
      "Avène", "Mixa Bébé", "Mixa", "L'Oréal Paris", "L'Oréal", "L&apos;Oréal",
      "Garnier", "Erborian", "Kérastase", "Dercos Technique", "Dercos",
      "Maybelline", "Beauty of Joseon", "Anua", "Skin1004", "Foreo",
      "BeautyBlender", "Solgar", "Embryolisse", "Nivea Sun", "Nivea"
    ];
    for (const vendor of vendorPrefixes) {
      const regex = new RegExp(`^${vendor}\\s+[-–—]?\\s*`, 'i');
      clean = clean.replace(regex, '');
    }
    return clean;
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_30px_rgba(13,148,136,0.06)] hover:border-teal-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-default ${className || ''}`}
      style={{ ...style }}
    >
      <a
        href={`/products/${product.id}`}
        className="bezel-outer !p-2 bg-[#f8fafc]/90 border border-slate-100/60 block m-3 w-[calc(100%-24px)] aspect-square relative shrink-0 overflow-hidden cursor-pointer rounded-2xl group/img"
      >
        
        {product.stock !== undefined && product.stock <= 0 ? (
          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[9px] font-black rounded-[4px] z-30 uppercase tracking-widest shadow-sm px-2 py-1 select-none">
            {language === 'FR' ? 'Hors Stock' : 'غير متوفر'}
          </span>
        ) : product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold ? (
          <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-black rounded-[4px] z-30 uppercase tracking-widest shadow-sm px-2 py-1 select-none animate-pulse">
            {language === 'FR' ? `Seulement ${product.stock} restants !` : `متبقي ${product.stock} فقط !`}
          </span>
        ) : discount ? (
          <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-black rounded-[4px] z-30 uppercase tracking-widest shadow-sm px-2 py-1 select-none">
            -{discount}%
          </span>
        ) : null}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out active:scale-90 cursor-pointer ${
            isFavorite ? 'text-[#F43F5E] border-rose-100' : 'text-slate-400 hover:text-slate-600'
          }`}
          title={language === 'FR' ? 'Ajouter aux favoris' : 'إضافة للمفضلة'}
          aria-label={language === 'FR' ? 'Ajouter aux favoris' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isFavorite ? 'fill-[#F43F5E] scale-110 text-[#F43F5E]' : ''}`} />
        </button>

        <div className="bezel-inner absolute inset-2 bg-white rounded-xl border-0 flex items-center justify-center overflow-hidden z-0 transition-transform duration-500 ease-out group-hover/img:scale-[1.02]">
          <Image
            src={imgError ? placeholderSvg : getOptimizedImageUrl(product.image)}
            alt={product.nameFr || product.name || product.title}
            width={300}
            height={300}
            className={`w-full h-full object-cover scale-[1.04] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.03)] transition-all duration-700 ease-in-out ${
              product.images && product.images.length > 1 ? 'group-hover:opacity-0' : ''
            }`}
            onError={() => setImgError(true)}
          />
          {product.images && product.images.length > 1 && (
            <Image
              src={altImgError ? placeholderSvg : getOptimizedImageUrl(product.images[1])}
              alt={`${product.nameFr || product.name || product.title} Alternate`}
              width={300}
              height={300}
              className="w-full h-full object-cover scale-[1.04] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.03)] transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
              onError={() => setAltImgError(true)}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-black/6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenQuickView) {
                  onOpenQuickView(product);
                } else {
                  setSelectedProduct(product);
                }
              }}
              className="px-4 py-2 bg-slate-900/90 backdrop-blur-sm hover:bg-primary hover:scale-105 text-white rounded-lg shadow-md transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] select-none"
            >
              <Eye className="w-3.5 h-3.5 text-white" />
              <span className="text-white">{language === 'FR' ? 'Aperçu' : 'عرض'}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(product);
              }}
              className="px-4 py-2 bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800 text-white rounded-lg shadow-md transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] select-none"
            >
              <Scale className={`w-3.5 h-3.5 ${isCompared ? 'text-amber-500' : 'text-white'}`} />
              <span className="text-white">{language === 'FR' ? 'Comparer' : 'مقارنة'}</span>
            </button>
          </div>
        </div>

        {imageOverlay}
      </a>

      <div className="px-4 pb-4 pt-1 flex flex-col flex-grow">
        
        <div className="flex items-center justify-between mb-1 select-none">
          <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider block text-left">
            {categoryLabel}
          </span>
          {showMatchScore && diagnostic && matchScore && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-[9px] font-black uppercase tracking-wider border border-teal-100/50 dark:border-teal-900/30">
              <Sparkles className="w-2.5 h-2.5 fill-current text-teal-500 dark:text-teal-400" />
              {matchScore}% Match
            </span>
          )}
        </div>

        <h3 className="text-[13.5px] font-bold text-slate-800 hover:text-primary line-clamp-2 leading-snug transition-colors duration-300 min-h-[38px] text-left mb-2.5">
          <a href={`/products/${product.id}`} className="cursor-pointer block">
            {renderHighlightedTitle(toTitleCase(cleanTitle(product.nameFr || product.name || product.title)), searchQuery)}
          </a>
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[15px] font-black text-primary tracking-tight whitespace-nowrap">
            {convertPrice(product.price)}
          </span>
          {discount && (
            <span className="text-[11px] text-slate-400 line-through font-semibold whitespace-nowrap">
              {convertPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold && (
          <div className="flex items-center gap-1.5 mb-2.5 select-none justify-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-extrabold text-amber-600 animate-pulse">
              {language === 'FR' ? `Stock limité : plus que ${product.stock} dispo` : `كمية محدودة: متبقي ${product.stock} فقط`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-1 mb-2.5 select-none justify-start">
          <Coins className="w-3.5 h-3.5 text-accent" />
          <span className="text-[9.5px] font-extrabold text-accent">
            {language === 'FR' ? `+${Math.round(product.price)} Points Beauté` : `+${Math.round(product.price)} نقطة جمال`}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-auto select-none">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3.5 h-3.5 fill-current ${
                    star <= Math.round(product.rating) 
                      ? 'text-gold fill-gold'
                      : 'text-slate-200 fill-slate-200'
                  } stroke-none`} 
                />
              ))}
            </div>
            <span className="text-[10.5px] font-bold text-slate-400 mt-0.5">
              ({product.rating.toFixed(1)})
            </span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={isAdding || (product.stock !== undefined && product.stock <= 0)}
          className={`mt-3.5 w-full font-bold text-[11px] sm:text-[11px] lg:text-[12px] uppercase tracking-wide h-[40px] rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 cursor-pointer px-2 ${
            product.stock !== undefined && product.stock <= 0
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed opacity-70'
              : 'btn-gradient'
          }`}
        >
          <ShoppingCart className={`w-3.5 h-3.5 shrink-0 ${isAdding ? 'animate-bounce' : ''}`} style={{ color: '#ffffff', stroke: '#ffffff' }} />
          <span className="whitespace-nowrap" style={{ color: '#ffffff', fontWeight: 800, letterSpacing: '0.02em' }}>
            {product.stock !== undefined && product.stock <= 0
              ? (language === 'FR' ? 'Rupture de Stock' : 'غير متوفر')
              : isAdding
              ? (language === 'FR' ? 'Ajouté !' : 'تم !')
              : (language === 'FR' ? 'Ajouter au panier' : 'أضف إلى السلة')}
          </span>
        </button>

      </div>
    </div>
  );
};
