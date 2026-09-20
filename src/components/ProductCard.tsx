'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductCard.module.css';
import { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Star, ShoppingCart, Eye, Heart, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useGalleryOverrides } from '@/lib/useGalleryOverrides';
import { useAmPm } from '@/context/AmPmContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { isDiagnosticProductEligible } from '@/lib/diagnostic-eligibility';
import { PRODUCT_IMAGE_FALLBACK, shouldBypassNextImageOptimization } from '@/lib/public-images';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  className?: string;
  style?: React.CSSProperties;
  customBadge?: string;
  imageOverlay?: React.ReactNode;
  showMatchScore?: boolean;
  searchQuery?: string;
  singleImage?: boolean;
  priority?: boolean;
  compact?: boolean;
  ingredientLayout?: boolean;
  galleryKeyPrefix?: string;
}

const placeholderSvg = PRODUCT_IMAGE_FALLBACK;

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
  searchQuery,
  singleImage = false,
  priority = false,
  compact = false,
  ingredientLayout = false,
  galleryKeyPrefix,
}) => {
  const { addToCart } = useCart();
  const { language } = useTranslation();
  const { convertPrice } = useCurrency();
  const { settings } = useSettings();
  const { getDisplayImage } = useGalleryOverrides();
  const lowStockThreshold = settings.lowStockThreshold || 5;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const { amPmState } = useAmPm();
  const { diagnostic, triggerFlyToCart, setSelectedProduct } = useUi();

  const [imgError, setImgError] = useState(false);
  const [altImgError, setAltImgError] = useState(false);
  const [shouldLoadAlternateImage, setShouldLoadAlternateImage] = useState(false);

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

  const cardRef = useRef<HTMLDivElement>(null);

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
  const canShowMatchScore = showMatchScore && isDiagnosticProductEligible(product);
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

  const primaryImageSrc = (!product.image || imgError)
    ? placeholderSvg
    : galleryKeyPrefix
      ? getDisplayImage(product.image, `${galleryKeyPrefix}_catalog_${product.id}_primary`)
      : getOptimizedImageUrl(product.image);
  const alternateImageSrc = (!product.images?.[1] || altImgError)
    ? placeholderSvg
    : galleryKeyPrefix
      ? getDisplayImage(product.images[1], `${galleryKeyPrefix}_catalog_${product.id}_secondary`)
      : getOptimizedImageUrl(product.images[1]);

  const cleanTitle = (title: string) => {
    let clean = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
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
      className={`group ${styles.card} ${compact ? styles.compact : ''} ${ingredientLayout ? styles.ingredient : ''} ${className || ''}`}
      style={{ ...style }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-pressed={isFavorite}
        title={language === 'FR' ? (isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris') : (isFavorite ? 'حذف من المفضلة' : 'إضافة للمفضلة')}
        aria-label={language === 'FR' ? (isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris') : (isFavorite ? 'حذف من المفضلة' : 'إضافة للمفضلة')}
        className={styles.wishlist}
      >
        <Heart aria-hidden="true" />
      </button>
      <a
        href={`/products/${product.id}`}
        onMouseEnter={() => setShouldLoadAlternateImage(true)}
        onFocus={() => setShouldLoadAlternateImage(true)}
        className={`${styles.imageLink} group/img`}
      >
        
        {product.stock !== undefined && product.stock <= 0 ? (
          <span className={`${styles.badge} ${styles.soldOut}`}>
            {language === 'FR' ? 'Hors Stock' : 'غير متوفر'}
          </span>
        ) : discount ? (
          <span className={styles.badge}>
            -{discount}%
          </span>
        ) : null}

        <div className={styles.imageStage}>
          <Image
            src={primaryImageSrc}
            alt={product.nameFr || product.name || product.title}
            width={300}
            height={300}
            priority={priority}
            unoptimized={shouldBypassNextImageOptimization(primaryImageSrc)}
            className={`${styles.image} ${
              shouldLoadAlternateImage && !singleImage && product.images && product.images.length > 1 ? 'group-hover:opacity-0 group-hover:blur-[1.5px]' : ''
            }`}
            onError={() => setImgError(true)}
          />
          {shouldLoadAlternateImage && !singleImage && product.images && product.images.length > 1 && (
            <Image
              src={alternateImageSrc}
              alt={`${product.nameFr || product.name || product.title} Alternate`}
              width={300}
              height={300}
              unoptimized={shouldBypassNextImageOptimization(alternateImageSrc)}
              className={`${styles.image} opacity-0 group-hover:opacity-100`}
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
          </div>
        </div>

        {imageOverlay}
      </a>

      <div className={styles.content}>
        <div data-product-brand className={styles.vendor}>{product.vendor}</div>
        
        {canShowMatchScore && diagnostic && matchScore && (
          <div className="flex items-center mb-1 select-none">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-[9px] font-black uppercase tracking-wider border border-teal-100/50 dark:border-teal-900/30">
              <Sparkles className="w-2.5 h-2.5 fill-current text-teal-500 dark:text-teal-400" />
              {language === 'FR' ? `Compatibilité ${matchScore}%` : `التوافق ${matchScore}%`}
            </span>
          </div>
        )}

        <h3 className={styles.title}>
          <a href={`/products/${product.id}`} className="cursor-pointer block">
            {renderHighlightedTitle(toTitleCase(cleanTitle(product.nameFr || product.name || product.title)), searchQuery)}
          </a>
        </h3>

        <div data-product-rating className={styles.rating}>
          {product.reviews > 0 && product.rating > 0 ? <div className="flex items-center gap-1" aria-label={`${product.rating.toFixed(1)} sur 5, ${product.reviews} avis`}>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} fill-current ${
                    star <= Math.round(product.rating) 
                      ? 'text-gold fill-gold'
                      : 'text-slate-200 fill-slate-200'
                  } stroke-none`} 
                />
              ))}
            </div>
            <span className={`${compact ? 'text-[8.5px]' : 'text-[10.5px]'} font-bold text-slate-600 mt-0.5`}>
              ({product.reviews})
            </span>
          </div> : <span className={`${compact ? 'text-[8.5px]' : 'text-[10.5px]'} font-semibold text-slate-600`}>
            {language === 'FR' ? 'Pas encore d’avis' : 'لا توجد تقييمات بعد'}
          </span>}
        </div>

        <div className={styles.purchase}>
          <div className={styles.prices}>
            <span className={styles.price}>{convertPrice(product.price)}</span>
            {discount && <span className={styles.oldPrice}>{convertPrice(product.comparePrice)}</span>}
          </div>
        <button
          onClick={handleAdd}
          disabled={isAdding || (product.stock !== undefined && product.stock <= 0)}
          className={`${styles.add} public-cta`}
          data-adding={isAdding}
          aria-label={language === 'FR' ? `Ajouter au panier : ${product.nameFr || product.name || product.title}` : `أضف إلى السلة: ${product.title}`}
        >
          <ShoppingCart className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5'} shrink-0 ${isAdding ? 'animate-bounce' : ''}`} style={{ color: 'inherit', stroke: 'currentColor' }} />
          <span className="whitespace-nowrap text-center" style={{ color: 'inherit', fontWeight: 800, letterSpacing: '0.01em' }}>
            {product.stock !== undefined && product.stock <= 0
              ? (language === 'FR' ? 'Rupture' : 'غير متوفر')
              : isAdding
              ? (language === 'FR' ? 'Ajouté !' : 'تم !')
              : (language === 'FR' ? 'Ajouter' : 'أضف')}
          </span>
        </button>
        </div>

      </div>
    </div>
  );
};
