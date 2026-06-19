'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../lib/data';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LanguageContext';
import { Star, ShoppingBag, Eye, Heart, Sparkles } from 'lucide-react';
import { useAmPm } from '../context/AmPmContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  className?: string;
  style?: React.CSSProperties;
  customBadge?: string;
  imageOverlay?: React.ReactNode;
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

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenQuickView,
  className,
  style,
  customBadge,
  imageOverlay
}) => {
  const { addToCart } = useCart();
  const { language } = useTranslation();

  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // persistent diagnostic match score state
  const [diagnostic, setDiagnostic] = useState<{ skinType: string; concern: string; sunExposure: string } | null>(null);

  useEffect(() => {
    const loadDiagnostic = () => {
      try {
        const stored = localStorage.getItem('skin_diagnostic_results');
        if (stored) {
          setDiagnostic(JSON.parse(stored));
        } else {
          setDiagnostic(null);
        }
      } catch (e) {
        console.error('LocalStorage blocked/unavailable:', e);
      }
    };

    loadDiagnostic();

    // Listen to custom diagnostic events
    window.addEventListener('skin_diagnostic_completed', loadDiagnostic);
    window.addEventListener('skin_diagnostic_reset', loadDiagnostic);

    return () => {
      window.removeEventListener('skin_diagnostic_completed', loadDiagnostic);
      window.removeEventListener('skin_diagnostic_reset', loadDiagnostic);
    };
  }, []);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const angleX = -(y - height / 2) / 20;
    const angleY = (x - width / 2) / 20;
    card.style.transform = `perspective(900px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.015)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 70%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;

    window.dispatchEvent(
      new CustomEvent('product_added_to_cart', {
        detail: {
          image: product.image,
          clientX,
          clientY
        }
      })
    );

    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 900);
  };


  const discount = product.comparePrice && product.price && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  // Dynamic Premium Tag extraction
  const vendorLower = product.vendor.toLowerCase();
  const isKBeauty = ['anua', 'beauty of joseon', 'skin1004', 'hada labo tokyo'].includes(vendorLower);
  const isBestSeller = product.rating >= 4.8;
  const isSolaire = product.tags.includes('solaire') || product.nameFr?.toLowerCase().includes('solaire') || product.name?.toLowerCase().includes('sun');

  const highlightTag = isKBeauty 
    ? (language === 'FR' ? 'K-Beauty' : 'جمال كوري')
    : isBestSeller 
      ? (language === 'FR' ? 'Best-Seller' : 'الأكثر مبيعاً')
      : isSolaire
        ? (language === 'FR' ? 'Solaire' : 'واقي شمس')
        : (language === 'FR' ? 'Nouveau' : 'جديد');

  const isUrgent = discount && discount >= 20;

  // AM/PM Daytime/Nighttime Routine properties
  const { amPmState } = useAmPm();
  const isAMState = amPmState === 'am';

  const isDayProduct = isSolaire || product.tags.includes('jour') || product.nameFr?.toLowerCase().includes('jour') || product.nameFr?.toLowerCase().includes('bright') || product.nameFr?.toLowerCase().includes('vitamine c') || product.id === 3 || product.id === 7 || product.id === 14 || product.id === 17 || product.id === 13 || product.id === 1;
  const isNightProduct = product.tags.includes('nuit') || product.nameFr?.toLowerCase().includes('nuit') || product.nameFr?.toLowerCase().includes('night') || product.id === 8 || product.id === 5 || product.id === 22 || product.id === 15 || product.id === 16 || product.id === 6;

  const routineLabelFr = isDayProduct && isNightProduct ? 'Jour & Nuit' : isDayProduct ? 'Soin de Jour ☀️' : 'Soin de Nuit 🌙';
  const routineLabelAr = isDayProduct && isNightProduct ? 'نهاراً وليلاً' : isDayProduct ? 'عناية نهارية ☀️' : 'عناية ليلية 🌙';

  const isMatchingTime = (isAMState && isDayProduct) || (!isAMState && isNightProduct);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 flex flex-col cursor-default bg-clip-padding ${
        isMatchingTime
          ? isAMState
            ? 'border-amber-200/50 shadow-[0_4px_20px_rgba(245,158,11,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)]'
            : 'border-indigo-200/50 shadow-[0_4px_20px_rgba(99,102,241,0.04)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.08)]'
          : 'border-slate-100 hover:shadow-[0_20px_40px_rgba(131,24,67,0.03)]'
      } hover:border-accent/20 ${className || ''}`}
      style={{ transformStyle: 'preserve-3d', ...style }}
    >
      {/* Glare effect */}
      <div ref={glareRef} className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300" />

      {/* Floating Inset Image Container */}
      <div className="relative aspect-square m-3 rounded-xl overflow-hidden bg-slate-50 shrink-0">
        {discount && (
          <span
            className="absolute top-0 left-0 bg-primary text-white text-[10px] font-black rounded-br-xl z-30 uppercase tracking-widest shadow-sm inline-flex items-center justify-center px-3.5 py-1.5"
          >
            -{discount}%
          </span>
        )}

        {/* Interactive floating heart wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer shadow-sm ${
            isFavorite
              ? 'bg-white text-[#F43F5E] hover:bg-[#FFF1F2]'
              : 'bg-white/95 text-slate-500 hover:text-slate-800 hover:bg-white'
          }`}
          title={language === 'FR' ? 'Ajouter aux favoris' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isFavorite ? 'fill-[#F43F5E] scale-110 text-[#F43F5E]' : ''}`} />
        </button>

        <div className="absolute inset-0 w-full h-full z-0">
          {/* Main Image */}
          <img
            src={product.image}
            alt={product.nameFr || product.name || product.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              product.images && product.images.length > 1 ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.currentTarget.src = placeholderSvg;
            }}
            loading="lazy"
          />
          {/* Secondary Image (Hover Swap) */}
          {product.images && product.images.length > 1 && (
            <img
              src={product.images[1]}
              alt={`${product.nameFr || product.name || product.title} Alternate`}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1) opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
              onError={(e) => {
                e.currentTarget.src = placeholderSvg;
              }}
              loading="lazy"
            />
          )}
        </div>
        {/* Hover Quick View action overlay */}
        <div className="absolute inset-0 bg-[#0F172A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <button
            onClick={() => onOpenQuickView?.(product)}
            className="px-4 py-2 bg-white hover:bg-primary hover:text-white text-[#1E293B] rounded-lg shadow-md transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] translate-y-3 group-hover:translate-y-0 active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
            title="Aperçu rapide"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'Aperçu' : 'عرض'}</span>
          </button>
        </div>

        {/* Custom Image Overlay */}
        {imageOverlay}
      </div>

      {/* Spacious Card Body */}
      <div className="pt-2 flex flex-col flex-grow px-5 pb-5">
        {/* Brand & Star Rating Row */}
        <div className="flex items-center justify-between gap-2 mb-2 mt-2">
          <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest">{product.vendor}</span>
          <div
            className="flex items-center gap-0.5 bg-amber-50 rounded-lg text-amber-700 font-extrabold text-[9px] px-2.5 py-0.5"
          >
            <Star className="w-2.5 h-2.5 fill-amber-500 stroke-none" />
            <span>{product.rating}</span>
            <span
              className="text-amber-800/60 font-normal ml-1"
            >
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Clean, Refined Product Title */}
        <h3
          onClick={() => onOpenQuickView?.(product)}
          className="text-[13px] font-bold text-[#1E293B] hover:text-primary cursor-pointer line-clamp-2 leading-snug transition-colors duration-300 min-h-[38px] mb-2"
        >
          {toTitleCase(product.nameFr || product.name || product.title)}
        </h3>

        {/* Dynamic Highlight Benefit Tag & Stock Row */}
        <div className="flex items-center justify-between mt-1 mb-3.5 select-none relative">
          {/* Benefit Badge or AI Match Score */}
          {matchScore ? (
            <div className="relative group/tooltip">
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-50/80 text-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.05)] flex items-center gap-1.5 cursor-help">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>🧬 {matchScore}% Match</span>
              </span>
              
              {/* Luxury Clinical Micro-Tooltip */}
              <div 
                className="absolute bottom-full mb-2 left-0 w-[240px] bg-[#0b0f19]/95 backdrop-blur-md text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-300 pointer-events-none z-50 origin-bottom-left leading-relaxed border border-slate-800"
                style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className="font-extrabold text-[8px] uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-emerald-400 stroke-none" />
                  <span>{language === 'FR' ? 'Analyse Clinique IA' : 'تحليل المختبر الذكي'}</span>
                </div>
                <div className="font-medium text-slate-300">{matchReason}</div>
                {/* Arrow */}
                <div className="absolute top-full left-4 -translate-y-[1px] w-2 h-2 bg-[#0b0f19] border-r border-b border-slate-800 rotate-45" />
              </div>
            </div>
          ) : (
            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-300 ${
              isMatchingTime
                ? isAMState
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 shadow-sm'
                : customBadge
                  ? 'bg-[#FDF2F8] text-[#DB2777]'
                  : highlightTag === 'K-Beauty' || highlightTag === 'جمال كوري'
                    ? 'bg-sky-50/80 text-sky-700'
                    : highlightTag === 'Best-Seller' || highlightTag === 'الأكثر مبيعاً'
                      ? 'bg-amber-50/80 text-amber-700'
                      : highlightTag === 'Solaire' || highlightTag === 'واقي شمس'
                        ? 'bg-rose-50/80 text-rose-700'
                        : 'bg-emerald-50/80 text-emerald-700'
            }`}>
              {customBadge || (isMatchingTime ? (language === 'FR' ? routineLabelFr : routineLabelAr) : highlightTag)}
            </span>
          )}

          {/* Premium Urgency/Stock status indicator */}
          <div className="flex items-center text-[10px] font-bold">
            {isUrgent ? (
              <span className="text-[#DC2626] flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DC2626]"></span>
                </span>
                <span>{language === 'FR' ? 'Dernières pièces' : 'القطع الأخيرة'}</span>
              </span>
            ) : (
              <span className="text-[#059669] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0" />
                <span>{language === 'FR' ? 'En stock' : 'متوفر'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price & Full-width elegant Button */}
        <div className="mt-auto border-t border-slate-100 flex flex-col gap-3 pt-3">
          <div className="flex items-baseline gap-1.5 px-0.5">
            <span className="text-[16px] font-black text-primary-dark tracking-tight">
              {product.price.toFixed(2)} <span className="text-[10px] font-extrabold uppercase">DH</span>
            </span>
            {discount && (
              <span className="text-[11px] text-[#94A3B8] line-through font-semibold">
                {product.comparePrice.toFixed(2)} DH
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-dark hover:bg-primary text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-dark/15 active:scale-[0.97] disabled:opacity-80 cursor-pointer mt-1"
          >
            <ShoppingBag className={`w-3.5 h-3.5 ${isAdding ? 'animate-bounce' : ''}`} style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff', fontWeight: 900 }}>
              {isAdding
                ? (language === 'FR' ? 'Ajouté !' : 'تم !')
                : (language === 'FR' ? 'Ajouter au panier' : 'أضف إلى السلة')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
