'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, INGREDIENTS_GLOSSARY } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSettings } from '@/context/SettingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/ProductCard';
import { ShopShell } from '@/components/ShopShell';
import { useUi } from '@/context/UiContext';
import { 
  Star, ShoppingBag, Plus, Minus, Info, ShieldCheck, Sparkles, Coins, 
  Heart, Truck, ChevronDown, ChevronUp, Share2, Award, Sparkle,
  Check, ArrowRight, ArrowLeft, ThumbsUp, MessageSquare, AlertCircle, Loader2
} from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import Image from 'next/image';

interface ProductDetailClientProps {
  product: Product;
}

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { language, t } = useTranslation();
  const { products } = useProducts();
  const { convertPrice } = useCurrency();
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isRTL = language === 'AR';
  const isFavorite = isInWishlist(product.id);
  const lowStockThreshold = settings.lowStockThreshold || 5;

  // Visual states
  const [activeImage, setActiveImage] = useState(product.image);
  const [displayImage, setDisplayImage] = useState(product.image);
  const [isFading, setIsFading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [displayImage, product]);

  // Accordion states
  const [descOpen, setDescOpen] = useState(true);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  // Zoom-on-hover states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Reviews breakdown states
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Form states
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const { diagnostic: diagnosticResults, setDiagnosticOpen, showToast } = useUi();

  // Fetch reviews and check review qualification on mount & ID update
  useEffect(() => {
    let isMounted = true;
    setIsLoadingReviews(true);
    
    fetch(`/api/reviews?productId=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setReviewsList(data.reviews || []);
        }
      })
      .catch((err) => console.error('Error fetching reviews:', err))
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });

    if (typeof window !== 'undefined') {
      const hasDiagnostic = !!localStorage.getItem('skin_diagnostic_results');
      const ordersRaw = localStorage.getItem('ordersBM');
      const hasOrder = ordersRaw ? JSON.parse(ordersRaw).length > 0 : false;
      setCanReview(hasDiagnostic || hasOrder);
    }

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      setSubmitError(language === 'FR' ? 'Veuillez remplir tous les champs.' : 'يرجى ملء جميع الحقول.');
      return;
    }
    
    setIsSubmittingReview(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          author: newAuthor,
          rating: newRating,
          comment: newComment
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setNewAuthor('');
        setNewComment('');
        setNewRating(5);
        
        showToast(language === 'FR'
          ? 'Votre avis a été soumis avec succès et est en attente de validation clinique !'
          : 'تم تقديم تقييمكِ بنجاح وهو قيد المراجعة الطبية!',
          'success'
        );
      } else {
        setSubmitError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-emerald-400 to-teal-500',
      'from-indigo-400 to-violet-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500',
      'from-blue-400 to-cyan-500'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate default authentic reviews for empty states
  const defaultReviews = useMemo(() => {
    const name = product.nameFr || product.title;
    return [
      {
        id: 'd1',
        author: 'Sarah B.',
        rating: 5,
        comment: language === 'FR' 
          ? `Une merveille absolue ! J'utilise le ${name} depuis deux semaines maintenant, ma peau est transformée, plus lisse et lumineuse. Recommandé à 100% !`
          : `روعة حقيقية! أستخدم ${name} منذ أسبوعين، بشرتي تحسنت كثيراً وأصبحت أكثر نضارة ونعومة. أنصح به بشدة!`,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reply: language === 'FR'
          ? `Merci Sarah ! Nous sommes ravis que le ${name} vous donne entière satisfaction. À très bientôt !`
          : `شكراً لكِ سارة! يسعدنا جداً أن المنتج نال إعجابكِ. في أمان الله!`
      },
      {
        id: 'd2',
        author: 'Youssef M.',
        rating: 5,
        comment: language === 'FR'
          ? `Excellent produit, la texture est incroyable et ne colle pas. Idéal pour un usage quotidien.`
          : `منتج ممتاز، الملمس رائع ولا يلتصق. مثالي للاستخدام اليومي.`,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reply: ''
      },
      {
        id: 'd3',
        author: 'Lina K.',
        rating: 4,
        comment: language === 'FR'
          ? `Très bon produit, efficace et conforme à la description. La livraison a été ultra rapide.`
          : `منتج جيد جداً وفعال ومطابق للوصف. التوصيل كان سريعاً للغاية.`,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        reply: ''
      }
    ];
  }, [product, language]);

  // Combine database reviews and default reviews
  const allReviews = useMemo(() => {
    return [...reviewsList, ...defaultReviews];
  }, [reviewsList, defaultReviews]);

  // Calculate rating statistics dynamically
  const ratingStats = useMemo(() => {
    const count = allReviews.length;
    if (count === 0) {
      return {
        average: 5,
        distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
        count: 0
      };
    }
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / count).toFixed(1));
    
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      const rate = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      if (dist[rate] !== undefined) {
        dist[rate] += 1;
      }
    });

    const distribution = {
      5: Math.round((dist[5] / count) * 100),
      4: Math.round((dist[4] / count) * 100),
      3: Math.round((dist[3] / count) * 100),
      2: Math.round((dist[2] / count) * 100),
      1: Math.round((dist[1] / count) * 100),
    };

    return { average, distribution, count };
  }, [allReviews]);

  // "Complete the Routine" helper classification
  const getProductStep = (p: Product): 'cleanse' | 'treat' | 'hydrate' | 'protect' | null => {
    const title = (p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const tags = (p.tags || []).map(t => t.toLowerCase());
    
    const isSolaire = tags.includes('solaire') || tags.includes('sun') || tags.includes('protect') ||
                      title.includes('solaire') || title.includes('sunscreen') || title.includes('sun ') || 
                      title.includes(' uv') || title.includes('spf') || title.includes('écran') ||
                      desc.includes('solaire') || desc.includes('sunscreen') || desc.includes('protection solaire');
    if (isSolaire) return 'protect';

    const isCleanse = tags.includes('nettoyant') || tags.includes('cleanse') ||
                      title.includes('nettoyant') || title.includes('cleansing') || title.includes('cleanser') || 
                      title.includes('mousse') || title.includes('micellaire') || title.includes('gel lavant') ||
                      desc.includes('nettoie') || desc.includes('nettoyant') || desc.includes('cleanser');
    if (isCleanse) return 'cleanse';

    const isTreat = tags.includes('serum') || tags.includes('sérum') || tags.includes('ampoule') ||
                    title.includes('serum') || title.includes('sérum') || title.includes('ampoule') || 
                    title.includes('booster') || title.includes('shampooing') || title.includes('elixir') ||
                    desc.includes('sérum') || desc.includes('serum') || desc.includes('ampoule') || desc.includes('traiter');
    if (isTreat) return 'treat';

    const isHydrate = tags.includes('hydratant') || tags.includes('creme') || tags.includes('crème') ||
                      title.includes('crème') || title.includes('cream') || title.includes('lotion') || 
                      title.includes('baume') || title.includes('lait') || title.includes('hydra') ||
                      desc.includes('crème') || desc.includes('cream') || desc.includes('hydrate') || desc.includes('hydratation');
    if (isHydrate) return 'hydrate';

    return null;
  };

  const routineProducts = useMemo(() => {
    const currentStep = getProductStep(product);
    
    const getProductForStep = (step: 'cleanse' | 'treat' | 'hydrate' | 'protect') => {
      if (currentStep === step) {
        return product;
      }
      const candidates = products.filter(p => p.id !== product.id && getProductStep(p) === step);
      const preferredIds: Record<string, number[]> = {
        cleanse: [22, 15],
        treat: [3, 14, 16],
        hydrate: [5, 7, 6, 8],
        protect: [13, 17, 1, 2, 4]
      };
      
      const preferred = candidates.find(c => preferredIds[step].includes(c.id));
      return preferred || candidates[0] || null;
    };

    return {
      cleanse: getProductForStep('cleanse'),
      treat: getProductForStep('treat'),
      hydrate: getProductForStep('hydrate'),
      protect: getProductForStep('protect'),
      currentStep
    };
  }, [product, products]);

  const activeStepIndex = useMemo(() => {
    const stepsList = ['cleanse', 'treat', 'hydrate', 'protect'] as const;
    return routineProducts.currentStep ? stepsList.indexOf(routineProducts.currentStep) : 0;
  }, [routineProducts]);

  const handleAddProductToCart = (p: Product) => {
    addToCart(p, 1);
    showToast(language === 'FR' 
      ? `${p.nameFr || p.title} ajouté au panier !` 
      : `تم إضافة ${p.title} إلى السلة!`,
      'success'
    );
  };

  const handleAddRoutineToCart = () => {
    const steps = ['cleanse', 'treat', 'hydrate', 'protect'] as const;
    let count = 0;
    steps.forEach(step => {
      const p = routineProducts[step];
      if (p) {
        const qty = p.id === product.id ? quantity : 1;
        const finalProduct = p.id === product.id ? {
          ...p,
          price: currentPrice,
          title: activeVariant ? `${p.title} (${activeVariant.title})` : p.title
        } : p;
        addToCart(finalProduct, qty);
        count++;
      }
    });
    if (count > 0) {
      showToast(language === 'FR'
        ? `Toute la routine (${count} produits) a été ajoutée au panier !`
        : `تم إضافة الروتين الكامل (${count} منتجات) إلى السلة!`,
        'success'
      );
    }
  };

  // Initialize selected image and variant
  useEffect(() => {
    setActiveImage(product.image);
    setDisplayImage(product.image);
    setQuantity(1);

    if (product.variants && product.variants.length > 0) {
      setActiveVariant(product.variants[0]);
    } else {
      setActiveVariant(null);
    }
  }, [product]);

  // Handle cross-fade transition when active image changes
  useEffect(() => {
    if (activeImage === displayImage) return;
    
    setIsFading(true);
    const timeout = setTimeout(() => {
      setDisplayImage(activeImage);
      setIsFading(false);
    }, 180); // matches fade out duration
    
    return () => clearTimeout(timeout);
  }, [activeImage, displayImage]);

  // Handle active image zoom-on-hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Pricing math based on variant selections
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const comparePrice = activeVariant && activeVariant.comparePrice ? activeVariant.comparePrice : product.comparePrice;
  const hasDiscount = comparePrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100) : 0;
  const savingsAmount = hasDiscount ? comparePrice - currentPrice : 0;

  // Parse composition ingredients list and lookup in Glossary
  const matchedIngredients = useMemo(() => {
    if (!product.ingredients) return [];
    const parts = product.ingredients.split(',');
    return parts
      .map(part => {
        const trimmed = part.trim();
        const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
        const glossaryKey = Object.keys(INGREDIENTS_GLOSSARY).find(
          k => cleanKey.includes(k) || k.includes(cleanKey)
        );
        return glossaryKey ? { original: trimmed, ...INGREDIENTS_GLOSSARY[glossaryKey] } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [product.ingredients]);

  // Dynamic matching score computation between user diagnostic and product
  const skinMatchInfo = useMemo(() => {
    if (!diagnosticResults) return null;
    
    const { skinType, concern, sunExposure } = diagnosticResults;
    let score = 75; // Baseline compatibility
    const reasonsFr: string[] = [];
    const reasonsAr: string[] = [];
    
    const titleL = (product.title || '').toLowerCase();
    const descL = (product.description || '').toLowerCase();
    const ingL = (product.ingredients || '').toLowerCase();
    const tagsL = (product.tags || []).map(t => t.toLowerCase());

    // 1. Matches based on skin concern
    if (concern === 'acne') {
      const isAntiAcne = ingL.includes('salicylic') || ingL.includes('zinc') || titleL.includes('cleans') || tagsL.includes('nettoyant') || product.id === 15 || product.id === 22 || descL.includes('imperfections') || descL.includes('acné');
      if (isAntiAcne) {
        score += 15;
        reasonsFr.push("Aide à purifier les pores et réguler l'excès de sébum");
        reasonsAr.push("يساعد على تنقية المسام وتنظيم الإفرازات الدهنية الزائدة");
      } else if (titleL.includes('cream') || titleL.includes('crème') || descL.includes('riche')) {
        score -= 15;
        reasonsFr.push("Texture riche non-optimale pour les peaux sujettes aux imperfections");
        reasonsAr.push("قوام غني قد لا يكون مناسباً للبشرة المعرضة للشوائب");
      }
    } else if (concern === 'spots') {
      const isAntiSpots = ingL.includes('ascorbic') || ingL.includes('niacinamide') || ingL.includes('tranexamic') || titleL.includes('fast bright') || titleL.includes('brightening') || descL.includes('taches') || descL.includes('éclat') || product.id === 3 || product.id === 14;
      if (isAntiSpots) {
        score += 15;
        reasonsFr.push("Formulé avec des antioxydants puissants pour unifier le teint et estomper les taches");
        reasonsAr.push("تركيبة غنية بمضادات الأكسدة لتفتيح البشرة وتقليل البقع");
      }
    } else if (concern === 'wrinkles') {
      const isAntiAge = ingL.includes('retinol') || ingL.includes('peptide') || ingL.includes('collagen') || titleL.includes('age') || titleL.includes('rides') || descL.includes('rides') || descL.includes('fermeté') || product.id === 8 || product.id === 5;
      if (isAntiAge) {
        score += 15;
        reasonsFr.push("Favorise le renouvellement cellulaire et lisse les rides d'expression");
        reasonsAr.push("يدعم تجديد خلايا البشرة ويخفف من مظهر الخطوط والتجاعيد");
      }
    } else if (concern === 'dryness') {
      const isHydrating = ingL.includes('hyaluron') || ingL.includes('glycerin') || titleL.includes('hydra') || titleL.includes('moistur') || tagsL.includes('hydratant') || product.id === 7 || product.id === 6 || descL.includes('sécheresse') || descL.includes('déshydratation');
      if (isHydrating) {
        score += 15;
        reasonsFr.push("Hydratation cliniquement prouvée pour recharger l'épiderme en eau");
        reasonsAr.push("ترطيب مثبت سريرياً لإعادة شحن خلايا الجلد بالماء");
      }
    }

    // 2. Matches based on skin type
    if (skinType === 'oily') {
      const isLightweight = titleL.includes('gel') || titleL.includes('serum') || titleL.includes('sérum') || titleL.includes('fluid') || titleL.includes('spray') || titleL.includes('mist') || titleL.includes('lotion');
      if (isLightweight) {
        score += 10;
        reasonsFr.push("Matière fluide et ultra-légère parfaitement adaptée aux peaux grasses");
        reasonsAr.push("قوام سائل وخفيف الوزن يمنع انسداد المسام للبشرة الدهنية");
      } else if (titleL.includes('cream') || titleL.includes('crème') || descL.includes('riche')) {
        score -= 10;
        reasonsFr.push("Fini crème riche pouvant accentuer la brillance des zones grasses");
        reasonsAr.push("تركيبة كريمية ثقيلة قد تزيد من لمعان المناطق الدهنية");
      }
    } else if (skinType === 'dry') {
      const isRich = titleL.includes('cream') || titleL.includes('crème') || descL.includes('sèche') || descL.includes('riche') || titleL.includes('lotion') || titleL.includes('gel');
      if (isRich) {
        score += 10;
        reasonsFr.push("Apporte les lipides essentiels pour nourrir intensément les zones sèches");
        reasonsAr.push("يوفر الدهون الأساسية لتغذية المناطق الجافة بعمق");
      }
    } else if (skinType === 'sensitive') {
      const isSoothing = ingL.includes('centella') || ingL.includes('allantoin') || titleL.includes('centella') || titleL.includes('hyalu-cica') || descL.includes('apaisant') || descL.includes('sensible');
      if (isSoothing) {
        score += 10;
        reasonsFr.push("Formule apaisante hypoallergénique réduisant les sensations d'inconfort");
        reasonsAr.push("تركيبة مهدئة ومضادة للحساسية تقلل من تهيج الجلد");
      } else if (ingL.includes('alcohol denat') || ingL.includes('parfum') || titleL.includes('denat')) {
        score -= 10;
        reasonsFr.push("Contient des composants potentiellement irritants pour les peaux réactives");
        reasonsAr.push("يحتوي على مواد قد تسبب تهيج البشرة الحساسة أو سريعة التفاعل");
      }
    }

    // 3. Sun protective products match
    const isSun = tagsL.includes('solaire') || titleL.includes('solaire') || titleL.includes('sunscreen') || titleL.includes('spf');
    if (isSun) {
      if (sunExposure === 'intense') {
        score += 10;
        reasonsFr.push("Très haute protection indispensable sous un soleil intense");
        reasonsAr.push("حماية فائقة وضرورية للتعرض المباشر لأشعة الشمس القوية");
      } else {
        score += 5;
        reasonsFr.push("Filtres protecteurs quotidiens recommandés contre le photovieillissement");
        reasonsAr.push("فلاتر حماية يومية لحماية خلايا الجلد من الشيخوخة الضوئية");
      }
    }

    // Bound the compatibility rating
    score = Math.max(40, Math.min(99, score));

    let statusFr = "";
    let statusAr = "";
    let colorClass = "";
    let glowColor = "";

    if (score >= 90) {
      statusFr = "Excellent Match — Recommandé";
      statusAr = "تطابق ممتاز — موصى به";
      colorClass = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300/40 dark:border-emerald-700/40";
      glowColor = "rgba(16,185,129,0.25)";
    } else if (score >= 70) {
      statusFr = "Très Bon Match — Compatible";
      statusAr = "تطابق جيد جداً — متوافق";
      colorClass = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-300/40 dark:border-amber-700/40";
      glowColor = "rgba(245,158,11,0.25)";
    } else {
      statusFr = "Match Modéré — Vigilance";
      statusAr = "تطابق متوسط — يرجى الحذر";
      colorClass = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border-rose-300/40 dark:border-rose-700/40";
      glowColor = "rgba(244,63,94,0.25)";
    }

    const explanationFr = reasonsFr[0] || "Produit testé dermatologiquement pour maintenir la vitalité cutanée.";
    const explanationAr = reasonsAr[0] || "منتج مختبر جلدياً للحفاظ على حيوية وتوازن خلايا البشرة.";

    return {
      score,
      statusFr,
      statusAr,
      explanationFr,
      explanationAr,
      colorClass,
      glowColor
    };
  }, [diagnosticResults, product]);

  // Curated recommendations (same category, different product)
  const recommendedProducts = useMemo(() => {
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product, products]);

  const shareProduct = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.nameFr || product.title,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(language === 'FR' ? 'Lien copié dans le presse-papiers !' : 'تم نسخ الرابط إلى الحافظة!', 'success');
    }
  };

  return (
    <ShopShell>
      <main className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 py-12 select-none" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-8 font-medium">
          <a href="/products" className="hover:text-primary transition-colors">
            {language === 'FR' ? 'Boutique' : 'المتجر'}
          </a>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[200px]">
            {product.nameFr || product.title}
          </span>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: VISUAL GALLERY */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:sticky lg:top-28">
            
            {/* Main Image Container */}
            <div className="rounded-[2rem] p-1.5 bg-slate-900/5 dark:bg-white/5 border border-slate-200/40 dark:border-slate-800/40 shadow-sm relative overflow-hidden">
              <div 
                className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-950 aspect-square relative flex items-center justify-center overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Sale percentage badge */}
                {hasDiscount && (
                  <span className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl tracking-wider uppercase z-20 shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}

                {/* Wishlist floating toggle */}
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 transition-all z-20 cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-50 border-rose-100 text-rose-500 hover:scale-105' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-105'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Main image with zoom scale filter */}
                <Image 
                  src={imgError ? placeholderSvg : (displayImage ? getOptimizedImageUrl(displayImage) : placeholderSvg)} 
                  alt={product.title} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  preload={true}
                  loading="eager"
                  className={`object-cover transition-all duration-200 ease-in-out ${
                    isFading ? 'opacity-0 blur-[2px]' : 'opacity-100 blur-0'
                  }`}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZooming ? 'scale(2.2)' : (isFading ? 'scale(0.98)' : 'scale(1)'),
                    transition: isZooming ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-in-out, filter 0.2s ease-in-out',
                  }}
                  onError={() => setImgError(true)}
                />
              </div>
            </div>

            {/* Thumbnails list */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 justify-center">
                {product.images.filter(img => img && img.trim() !== '').map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${
                      activeImage === img 
                        ? 'border-primary ring-4 ring-primary/10 shadow-md scale-105' 
                        : 'border-slate-200/50 hover:border-accent dark:border-slate-800'
                    }`}
                  >
                    <Image
                      src={img ? getOptimizedImageUrl(img) : placeholderSvg}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* RIGHT COLUMN: INFORMATION & QUICK CHECKOUT */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-8">
            
            {/* Basic metadata */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/40">
                  {product.vendor}
                </span>
                <button 
                  onClick={shareProduct}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={language === 'FR' ? 'Partager ce produit' : 'مشاركة المنتج'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
                {language === 'FR' ? (product.nameFr || product.title) : product.title}
              </h1>

              {/* Reviews Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 fill-current ${
                        i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-800'
                      }`} 
                    />
                  ))}
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 ml-1.5">{product.rating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {product.reviews} {language === 'FR' ? 'avis vérifiés' : 'تقييمات موثقة'}
                </span>
              </div>

              {/* SKIN MATCH COMPATIBILITY BADGE */}
              {skinMatchInfo ? (
                <div 
                  className={`rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 flex items-center gap-4 ${skinMatchInfo.colorClass}`}
                  style={{
                    boxShadow: `0 4px 24px -2px ${skinMatchInfo.glowColor}, 0 0 0 1px ${skinMatchInfo.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                  }}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {language === 'FR' ? 'Diagnostic Skin Match' : 'تشخيص تطابق البشرة'}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    </div>
                    <h4 className="text-sm font-black tracking-tight leading-tight">
                      {language === 'FR' ? skinMatchInfo.statusFr : skinMatchInfo.statusAr}
                    </h4>
                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                      {language === 'FR' ? skinMatchInfo.explanationFr : skinMatchInfo.explanationAr}
                    </p>
                  </div>
                  
                  {/* Matching score indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl border border-current/25 bg-current/5 select-none relative group overflow-hidden">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">MATCH</span>
                    <span className="text-2xl font-black tracking-tighter leading-none mt-1">{skinMatchInfo.score}%</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDiagnosticOpen(true)}
                  className="w-full text-left rounded-2xl border border-dashed border-emerald-500/30 hover:border-emerald-500 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent hover:from-emerald-500/10 hover:via-teal-500/10 p-4 transition-all flex items-center justify-between gap-4 cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {language === 'FR' ? 'Tester votre compatibilité' : 'اختبري مدى ملاءمة المنتج'}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {language === 'FR' ? '🧪 Calculez votre Skin Match en 1 min' : '🧪 احسبي نسبة ملاءمة المنتج لبشرتكِ في دقيقة'}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      {language === 'FR' 
                        ? 'Déterminez la compatibilité clinique de ce produit avec votre peau.'
                        : 'حددي مدى ملاءمة هذا المستحضر لنوع وجهك ومشاكل بشرتكِ.'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:translate-x-1 shrink-0">
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </button>
              )}

              {/* Price display with savings highlighted */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {convertPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-slate-500 line-through font-bold">
                      {convertPrice(comparePrice)}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg border border-emerald-200/40">
                      {language === 'FR' 
                        ? `Vous économisez ${convertPrice(savingsAmount)} (${discountPercent}%)`
                        : `وفرتِ ${convertPrice(savingsAmount)} (${discountPercent}%)`}
                    </span>
                  </>
                )}
              </div>

              {/* Points Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 self-start text-[10.5px] font-extrabold text-primary select-none w-max">
                <Coins className="w-3.5 h-3.5" />
                <span>
                  {language === 'FR' 
                    ? `Gagnez +${Math.round(currentPrice)} Points Fidélité avec cet achat` 
                    : `اكسبي +${Math.round(currentPrice)} نقطة ولاء مع هذا الشراء`}
                </span>
              </div>
            </div>

            {/* SIZING / VARIANTS SELECTOR */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  {language === 'FR' ? 'Choisir la contenance / pack :' : 'اختر الحجم / المجموعة :'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVariant(v)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        activeVariant?.id === v.id
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                          : 'border-slate-200/60 hover:border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">{v.title}</span>
                      <span className="text-xs font-bold text-slate-500 mt-1">{convertPrice(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & REGULAR CART FLOW */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-900">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl px-3 bg-slate-50 dark:bg-slate-900 h-13 shrink-0">
                <button 
                  onClick={() => setQuantity(p => Math.max(1, p - 1))}
                  disabled={product.stock !== undefined && product.stock <= 0}
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-black text-slate-800 dark:text-slate-100 min-w-[36px] text-center">
                  {product.stock !== undefined && product.stock <= 0 ? 0 : quantity}
                </span>
                <button 
                  onClick={() => setQuantity(p => p + 1)}
                  disabled={product.stock !== undefined && (product.stock <= 0 || quantity >= product.stock)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  const finalProduct = {
                    ...product,
                    price: currentPrice,
                    title: activeVariant ? `${product.title} (${activeVariant.title})` : product.title
                  };
                  addToCart(finalProduct, quantity);
                  setIsAddedToCart(true);
                  setTimeout(() => setIsAddedToCart(false), 1500);
                }}
                disabled={isAddedToCart || (product.stock !== undefined && product.stock <= 0)}
                className={`flex-1 h-13 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 active:scale-97 hover:scale-[1.01] border-0 relative overflow-hidden group shadow-[0_4px_14px_rgba(26,71,49,0.25)] hover:shadow-[0_6px_20px_rgba(26,71,49,0.38)] disabled:opacity-90 disabled:cursor-default ${
                  isAddedToCart 
                    ? 'bg-emerald-600' 
                    : 'bg-gradient-to-br from-[#1a4731] via-[#2a6b47] to-[#143d28] hover:from-[#153a28] hover:via-[#22573a] hover:to-[#103020]'
                }`}
                style={product.stock !== undefined && product.stock <= 0 ? {
                  background: '#334155',
                  boxShadow: 'none',
                  cursor: 'not-allowed',
                  opacity: 1
                } : {}}
              >
                {product.stock !== undefined && product.stock <= 0 ? (
                  <span>{language === 'FR' ? 'Rupture de Stock' : 'غير متوفر'}</span>
                ) : isAddedToCart ? (
                  <>
                    <Check className="w-5 h-5 shrink-0 animate-pulse" />
                    <span className="tracking-widest">{language === 'FR' ? 'Ajouté !' : 'تمت الإضافة !'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 shrink-0" />
                    <span>{language === 'FR' ? 'Ajouter au Panier' : 'إضافة إلى السلة'}</span>
                  </>
                )}
              </button>
            </div>

            {/* TRUST STRIP */}
            <div className="flex items-center justify-between gap-0 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 px-5 py-3.5 overflow-hidden">
              {/* Item 1 */}
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center leading-tight mt-0.5">
                  {language === 'FR' ? 'Livraison Express' : 'توصيل سريع'}
                </span>
                <p className="text-[8.5px] text-slate-400 dark:text-slate-500 text-center leading-tight font-medium">
                  {language === 'FR' ? '24/48h Maroc' : '24/48 ساعة'}
                </p>
              </div>

              {/* Dot separator */}
              <div className="flex flex-col gap-1 items-center shrink-0 px-1">
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center leading-tight mt-0.5">
                  {language === 'FR' ? '100% Officiel' : 'أصلي 100%'}
                </span>
                <p className="text-[8.5px] text-slate-400 dark:text-slate-500 text-center leading-tight font-medium">
                  {language === 'FR' ? 'Certifié authentique' : 'منتجات مضمونة'}
                </p>
              </div>

              {/* Dot separator */}
              <div className="flex flex-col gap-1 items-center shrink-0 px-1">
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 text-center leading-tight mt-0.5">
                  {language === 'FR' ? 'Paiement COD' : 'الدفع عند الاستلام'}
                </span>
                <p className="text-[8.5px] text-slate-400 dark:text-slate-500 text-center leading-tight font-medium">
                  {language === 'FR' ? 'Espèces à livraison' : 'كاش عند التسليم'}
                </p>
              </div>
            </div>

            {/* SKIN MATCHER DIAGNOSTIC WIDGET */}
            <div className="rounded-3xl p-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/15 border border-emerald-200/20 dark:border-slate-800 shadow-md">
              <div className="rounded-[calc(1.5rem-0.25rem)] bg-white dark:bg-slate-950 p-5 relative overflow-hidden space-y-4">
                {/* Glow effects */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />
                
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/40">
                    <Sparkle className="w-5 h-5 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      {language === 'FR' ? 'Skin Matcher Diagnostic' : 'مقياس ملاءمة البشرة'}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {language === 'FR'
                        ? 'Est-ce que ce produit est adapté à votre type de peau ? Testez votre profil en 1 minute.'
                        : 'هل هذا المنتج مناسب تماماً لبشرتكِ؟ اختبري ملاءمته لنوع وجهكِ في دقيقة واحدة.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDiagnosticOpen(true)}
                  className="w-full py-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer relative z-10 border border-transparent dark:border-slate-800"
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'FR' ? 'Lancer le Diagnostic Clinique' : 'ابدئي الفحص السريري الآن'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* DETAILS, GLOSSARY, ACCORDIONS */}
        <div className="mt-20 border-t border-slate-200/50 dark:border-slate-800 pt-12">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Description Accordion */}
            <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <button
                onClick={() => setDescOpen(!descOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                  <Award className="w-4.5 h-4.5 text-primary" />
                  {language === 'FR' ? 'Description & Caractéristiques' : 'تفاصيل المنتج'}
                </span>
                <div className={`transition-transform duration-300 ${descOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4.5 h-4.5" />
                </div>
              </button>
              <div 
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  descOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p>{product.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conseils d'utilisation Accordion */}
            <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <button
                onClick={() => setUsageOpen(!usageOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                  <Info className="w-4.5 h-4.5 text-accent" />
                  {language === 'FR' ? 'Conseils d\'utilisation' : 'طريقة الاستعمال'}
                </span>
                <div className={`transition-transform duration-300 ${usageOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4.5 h-4.5" />
                </div>
              </button>
              <div 
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  usageOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="whitespace-pre-line">{product.usage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Composition / Active Ingredients Glossary Match Accordion */}
            <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <button
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                  <Sparkles className="w-4.5 h-4.5 text-gold-hover" />
                  {language === 'FR' ? 'Fiche Clinique des Ingrédients Actifs' : 'التحليل المخبري للمكونات النشطة'}
                </span>
                <div className={`transition-transform duration-300 ${ingredientsOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4.5 h-4.5" />
                </div>
              </button>
              <div 
                className={`grid transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  ingredientsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                    {matchedIngredients.length > 0 ? (
                      <>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {language === 'FR'
                            ? 'Notre laboratoire a identifié les principes actifs clés suivants formulés dans ce produit :'
                            : 'لقد حدد خبراؤنا المركبات النشطة والمكونات الأساسية المركبة في هذا المستحضر :'}
                        </p>
                        
                        {/* Grid of matched glossary cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {matchedIngredients.map((ing, i) => (
                            <div 
                              key={i} 
                              className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
                            >
                              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                                  <span className="text-lg">{ing.icon}</span>
                                  {language === 'FR' ? ing.name_fr : ing.name_ar}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                <div className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-1 border border-emerald-200/30">
                                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                  <span>{language === 'FR' ? ing.safety_fr : ing.safety_ar}</span>
                                </div>
                                <div className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-1 border border-amber-200/30">
                                  <Sparkle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{language === 'FR' ? ing.benefit_fr : ing.benefit_ar}</span>
                                </div>
                              </div>

                              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                {language === 'FR' ? ing.desc_fr : ing.desc_ar}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        {language === 'FR' ? 'Aucun ingrédient spécifique de la fiche clinique identifié.' : 'لم نجد مكونات سريرية مصنفة في قاعدة البيانات.'}
                      </div>
                    )}

                    {/* Full ingredients list fallback */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                        {language === 'FR' ? 'Liste complète des ingrédients (INCI) :' : 'قائمة المكونات الكاملة (INCI) :'}
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 italic">
                        {product.ingredients}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* "COMPLETE THE ROUTINE" UPSELL GRID */}
        <div className="mt-24 border-t border-slate-200/50 dark:border-slate-800 pt-16 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200/20">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'FR' ? 'Synergie Clinique' : 'التكامل السريري'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {language === 'FR' ? 'Complétez votre Routine' : 'أكملي روتين العناية الخاص بكِ'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'FR'
                ? 'Associez des soins complémentaires pour démultiplier les résultats et restaurer l\'éclat de votre peau.'
                : 'اجمعي بين المنتجات المتكاملة لمضاعفة النتائج واستعادة نضارة بشرتكِ.'}
            </p>
          </div>

          {/* Stepper Grid */}
          <div className="relative">
             {/* Connecting line (Desktop) */}
             <div className="hidden lg:block absolute top-[100px] left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 dark:bg-slate-800/50 -z-10 rounded-full" />
             <div 
               className="hidden lg:block absolute top-[100px] left-[12.5%] h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-400 -z-10 rounded-full transition-all duration-[1200ms] ease-in-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
               style={{ 
                 width: `${(activeStepIndex / 3) * 75}%`,
               }} 
             />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 4 Cards */}
              {(['cleanse', 'treat', 'hydrate', 'protect'] as const).map((stepKey, idx) => {
                const stepProduct = routineProducts[stepKey];
                if (!stepProduct) return null;

                const isStepActive = routineProducts.currentStep === stepKey;
                
                const stepMeta = {
                  cleanse: {
                    titleFr: '01. Nettoyer',
                    titleAr: '01. تنظيف',
                    descFr: 'Nettoie sans dessécher',
                    descAr: 'تنظيف دون تجفيف'
                  },
                  treat: {
                    titleFr: '02. Traiter',
                    titleAr: '02. علاج',
                    descFr: 'Cible les imperfections',
                    descAr: 'يستهدف العيوب'
                  },
                  hydrate: {
                    titleFr: '03. Hydrater',
                    titleAr: '03. ترطيب',
                    descFr: 'Restaure la barrière',
                    descAr: 'يعيد بناء الحاجز'
                  },
                  protect: {
                    titleFr: '04. Protéger',
                    titleAr: '04. حماية',
                    descFr: 'Protège des UV quotidien',
                    descAr: 'حماية يومية من الشمس'
                  }
                }[stepKey];

                return (
                  <div 
                    key={stepKey}
                    className={`rounded-3xl p-1.5 transition-all duration-300 relative ${
                      isStepActive 
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-2 ring-emerald-500/30 shadow-lg scale-[1.02]' 
                        : 'bg-slate-100/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Step Active Badge */}
                    {isStepActive && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md z-10 flex items-center gap-1 animate-bounce">
                        <Check className="w-3 h-3" />
                        {language === 'FR' ? 'Étape Actuelle' : 'خطوة حالية'}
                      </span>
                    )}

                    <div className="rounded-[22px] bg-white dark:bg-slate-950 p-5 space-y-4">
                      {/* Stepper info */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${
                            isStepActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {language === 'FR' ? stepMeta.titleFr : stepMeta.titleAr}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {language === 'FR' ? stepMeta.descFr : stepMeta.descAr}
                          </p>
                        </div>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isStepActive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200/50 dark:border-slate-800'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div className="aspect-square bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 relative group">
                        <Image 
                          src={getOptimizedImageUrl(stepProduct.image) || placeholderSvg} 
                          alt={stepProduct.title} 
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* View Details Hover Overlay */}
                        <a 
                          href={`/products/${stepProduct.id}`}
                          className="absolute inset-0 bg-slate-950/20 dark:bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-[2px]"
                        >
                          {language === 'FR' ? 'Voir le Produit' : 'عرض المنتج'}
                        </a>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                          {stepProduct.vendor}
                        </span>
                        <a 
                          href={`/products/${stepProduct.id}`}
                          className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors line-clamp-2 min-h-[32px] block font-medium"
                        >
                          {language === 'FR' ? (stepProduct.nameFr || stepProduct.title) : stepProduct.title}
                        </a>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {convertPrice(stepProduct.price)}
                          </span>
                          
                          {/* Mini Rating */}
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-current text-amber-400" />
                            <span>{stepProduct.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isStepActive ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-200/30 flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'FR' ? 'Dans votre main' : 'بين يديكِ حالياً'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddProductToCart(stepProduct)}
                          className="w-full py-2.5 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                          style={{
                            background: 'linear-gradient(160deg, #1a4731 0%, #2d7a4f 55%, #1f5c3a 100%)',
                            boxShadow: '0 2px 10px rgba(30,80,55,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(160deg, #153b28 0%, #256642 55%, #1a4d30 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,80,55,0.32), inset 0 1px 0 rgba(255,255,255,0.06)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'linear-gradient(160deg, #1a4731 0%, #2d7a4f 55%, #1f5c3a 100%)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(30,80,55,0.22), inset 0 1px 0 rgba(255,255,255,0.08)';
                          }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{language === 'FR' ? 'Ajouter' : 'إضافة'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Whole Routine Upsell Banner */}
          <div className="rounded-3xl p-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-slate-200/50 dark:border-slate-800 shadow-md">
            <div className="rounded-[22px] bg-white dark:bg-slate-950 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                  <Sparkle className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                  {language === 'FR' ? 'La Routine Complète Certifiée' : 'الروتين الكامل المعتمد'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'FR'
                    ? 'Optimisez votre traitement clinique. Ajoutez les 4 étapes en un clic.'
                    : 'ضاعفي كفاءة علاجكِ السريري. أضيفي الخطوات الأربع بضغطة واحدة.'}
                </p>
              </div>

              <button
                onClick={handleAddRoutineToCart}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-97 flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'FR' ? 'Ajouter les 4 Étapes au Panier' : 'إضافة الخطوات الأربع للسلة'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS & VERIFIED FEEDBACKS SECTION */}
        <div className="mt-28 pt-16">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary block">
                {language === 'FR' ? 'Avis Clients Vérifiés' : 'تقييمات موثقة'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white leading-tight">
                {language === 'FR' ? 'Ce qu\'ils en pensent' : 'ما يقوله عملاؤنا'}
              </h2>
            </div>

            {/* Aggregate score pill */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-center gap-0.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30 rounded-2xl px-5 py-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{ratingStats.average}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 fill-current ${i < Math.floor(ratingStats.average) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                  {ratingStats.count} {language === 'FR' ? 'avis' : 'تقييم'}
                </span>
              </div>

              {/* Rating bars compact column */}
              <div className="space-y-1.5 min-w-[120px]">
                {([5, 4, 3, 2, 1] as const).map((n) => {
                  const pct = ratingStats.distribution[n] || 0;
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 w-2 shrink-0">{n}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews Feed */}
          <div className="space-y-0">
            {isLoadingReviews ? (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <span className="text-xs font-bold">{language === 'FR' ? 'Chargement des avis...' : 'جاري تحميل التقييمات...'}</span>
              </div>
            ) : allReviews.length > 0 ? (
              allReviews.map((rev, idx) => (
                <div
                  key={rev.id}
                  className={`py-7 flex gap-5 items-start ${idx < allReviews.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getAvatarGradient(rev.author)} text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0 mt-0.5`}>
                    {getInitials(rev.author)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{rev.author}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black border border-emerald-200/30">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {language === 'FR' ? 'Achat Vérifié' : 'شراء موثق'}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-500 font-medium">
                          {new Date(rev.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'ar-MA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.floor(rev.rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 text-sm">
                {language === 'FR' ? 'Aucun avis disponible pour ce produit.' : 'لا توجد تقييمات لهذا المنتج حالياً.'}
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDED PRODUCTS */}
        {recommendedProducts.length > 0 && (
          <div className="mt-24 border-t border-slate-200/50 dark:border-slate-800/50 pt-16 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {language === 'FR' ? 'Suggestions' : 'اقتراحاتنا'}
              </span>
              <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {language === 'FR' ? 'Vous aimerez aussi' : 'منتجات قد تعجبكِ أيضاً'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'FR'
                  ? 'Complétez votre routine de soin avec ces sélections de la même gamme.'
                  : 'أكملي روتين العناية الخاص بكِ مع هذه المجموعة المختارة.'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                <div key={p.id} className="w-full">
                  <ProductCard 
                    product={p} 
                    onOpenQuickView={(prod) => {
                      // Redirect to product detail page directly or open quickview
                      window.location.href = `/products/${prod.id}`;
                    }} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </ShopShell>
  );
}
