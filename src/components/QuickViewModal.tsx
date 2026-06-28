/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, INGREDIENTS_GLOSSARY } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { X, Star, ShoppingBag, Plus, Minus, Info, ShieldCheck, Sparkles, Coins } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { convertPrice } = useCurrency();
  const { settings } = useSettings();
  const lowStockThreshold = settings.lowStockThreshold || 5;

  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'reviews'>('desc');
  const [activeImage, setActiveImage] = useState('');
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  // t-modal animation state
  const [isVisible, setIsVisible] = useState(false);   // controls DOM presence
  const [modalState, setModalState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const closeMs = 160; // must match --modal-close-dur

  const [liveProduct, setLiveProduct] = useState<Product | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Reviews states and functions
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const orders = localStorage.getItem('ordersBM');
        const loyaltyHistory = localStorage.getItem('loyalty_history');
        const diagnostic = localStorage.getItem('skin_diagnostic_results');
        
        const hasLocalOrders = orders && JSON.parse(orders).length > 0;
        const hasLoyalty = loyaltyHistory && JSON.parse(loyaltyHistory).length > 0;
        
        if (hasLocalOrders || hasLoyalty || diagnostic) {
          setHasAccount(true);
        }

        // Prefill author name from last order
        if (orders) {
          const parsed = JSON.parse(orders);
          if (parsed.length > 0 && parsed[0].name) {
            setNewReviewAuthor(parsed[0].name);
          }
        }
      } catch (e) {
        console.error("Error reading account details:", e);
      }
    }
  }, []);

  const fetchReviews = async () => {
    if (!product) return;
    setIsReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews' && product) {
      fetchReviews();
    }
  }, [activeTab, product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewAuthor.trim() || !newReviewComment.trim()) return;
    setIsSubmittingReview(true);
    setReviewSuccessMessage('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          author: newReviewAuthor,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccessMessage(language === 'FR' ? 'Merci ! Votre avis a été soumis pour modération.' : 'شكراً لك! تم إرسال تقييمك للمراجعة.');
        setNewReviewAuthor('');
        setNewReviewComment('');
        setNewReviewRating(5);
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
  const [glossaryPosition, setGlossaryPosition] = useState({ top: 0, left: 0 });
  const glossaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setActiveTab('desc');
      setQuantity(1);
      setActiveGlossaryTerm(null);

      setLiveProduct(product);
      setIsLiveLoading(true);
      fetch(`/api/products?id=${product.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            setLiveProduct(data.product);
          }
        })
        .catch(err => {
          console.error("Failed to fetch live stock for product:", err);
        })
        .finally(() => {
          setIsLiveLoading(false);
        });
    } else {
      setLiveProduct(null);
    }
  }, [product]);

  useEffect(() => {
    setImgError(false);
  }, [activeImage, product]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (glossaryRef.current && !glossaryRef.current.contains(e.target as Node)) setActiveGlossaryTerm(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // t-modal open/close lifecycle
  useEffect(() => {
    if (isOpen && product) {
      setIsVisible(true);
      // allow DOM to paint before adding .is-open so the opening transition plays
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
  }, [isOpen, product]);

  if (!isVisible || !product) return null;

  const currentProduct = liveProduct || product;
  const liveStock = currentProduct.stock !== undefined ? currentProduct.stock : 100;

  const handleAddToCart = () => { addToCart(currentProduct, quantity); onClose(); };

  const renderIngredientsWithGlossary = () => {
    const parts = product.ingredients.split(',');
    return (
      <div className="flex flex-wrap gap-x-1.5 gap-y-2 text-xs leading-relaxed text-slate-700">
        {parts.map((part, idx) => {
          const trimmed = part.trim();
          const cleanKey = trimmed.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
          const glossaryKey = Object.keys(INGREDIENTS_GLOSSARY).find(k => cleanKey.includes(k) || k.includes(cleanKey));

          if (glossaryKey) return (
            <span key={idx} className="inline-block">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const modalEl = e.currentTarget.closest('.modal-container');
                  const modalRect = modalEl?.getBoundingClientRect();
                  setGlossaryPosition({ top: rect.bottom - (modalRect?.top || 0) + 5, left: rect.left - (modalRect?.left || 0) - 20 });
                  setActiveGlossaryTerm(glossaryKey);
                }}
                className="text-accent hover:text-primary underline font-extrabold cursor-help bg-muted px-1.5 py-0.5 rounded-md hover:bg-border/30 transition-colors"
              >
                {trimmed}
              </button>
              {idx < parts.length - 1 && ', '}
            </span>
          );
          return <span key={idx}>{trimmed}{idx < parts.length - 1 && ', '}</span>;
        })}
      </div>
    );
  };

  const isRTL = language === 'AR';
  const hasDiscount = currentProduct.comparePrice > currentProduct.price;
  const discountPercent = hasDiscount ? Math.round(((currentProduct.comparePrice - currentProduct.price) / currentProduct.comparePrice) * 100) : 0;

  const backdropCls = [
    't-modal-backdrop',
    'fixed inset-0 bg-black/55 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  const modalCls = [
    't-modal',
    'modal-container relative w-full max-w-[850px] bg-white border border-border/40 rounded-[10px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  return (
    <div className={backdropCls}>
      <div
        className={modalCls}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Close */}
        <button 
          onClick={onClose} 
          aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all z-40 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image panel */}
        <div className="w-full md:w-1/2 p-6 bg-muted/30 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-border/40 overflow-y-auto">
          {(() => {
            const imageToRender = activeImage || product.image;
            return (
              <>
                <div className="relative aspect-square w-full rounded-[10px] overflow-hidden bg-white border border-border/40 shadow-sm flex items-center justify-center">
                  {hasDiscount && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase z-20">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  <Image
                    src={imgError ? placeholderSvg : (imageToRender ? getOptimizedImageUrl(imageToRender) : placeholderSvg)}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-4 transition-all duration-300"
                    loading="eager"
                    onError={() => setImgError(true)}
                  />
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 justify-center">
                    {product.images.filter(img => img && img.trim() !== '').map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        aria-label={`Image ${i + 1}`}
                        className={`w-14 h-14 rounded-[6px] overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${imageToRender === img ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border/40 hover:border-accent'}`}
                      >
                        <Image
                          src={img ? getOptimizedImageUrl(img) : placeholderSvg}
                          alt=""
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Details panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-4">
            {/* t-stagger: vendor + title reveal each time product changes */}
            <div className={`t-stagger ${modalState === 'open' ? 'is-shown' : ''}`}>
              <div className="t-stagger-line t-stagger-line--1 flex items-center justify-between text-xs">
                <span className="text-accent font-black uppercase tracking-widest">{product.vendor}</span>
                <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                  <span>{product.rating}</span>
                  <span className="text-foreground/60 font-medium">({product.reviews} reviews)</span>
                </div>
              </div>

              <h3 className="t-stagger-line t-stagger-line--2 text-lg md:text-xl font-black font-heading text-primary-dark leading-tight hover:text-primary transition-colors mt-2">
                <a href={`/products/${product.id}`} onClick={onClose} className="cursor-pointer">
                  {product.title}
                </a>
              </h3>
            </div>

            <div className="flex items-center gap-3 border-b border-border/30 pb-4 flex-wrap">
              <span className="text-xl font-black text-primary-dark">{convertPrice(currentProduct.price)}</span>
              {hasDiscount && <span className="text-sm text-foreground/50 line-through font-bold">{convertPrice(currentProduct.comparePrice)}</span>}
              {liveStock <= 0 ? (
                <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                  {language === 'FR' ? 'Rupture de Stock' : 'نفدت الكمية'}
                </span>
              ) : liveStock <= lowStockThreshold ? (
                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  <span>
                    {language === 'FR' ? `Plus que ${liveStock} en stock !` : `متبقي ${liveStock} فقط في المخزن !`}
                  </span>
                </span>
              ) : null}
            </div>

            {/* Loyalty Points Earning Badge */}
            <div className="flex items-center gap-1.5 select-none justify-start -mt-2 mb-2">
              <Coins className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-extrabold text-accent">
                {language === 'FR' ? `+${Math.round(product.price)} Points Beauté` : `+${Math.round(product.price)} نقطة جمال`}
              </span>
            </div>

            {/* Tabs */}
            <div className="space-y-3">
              <div className="flex border-b border-border/40 text-xs font-black uppercase tracking-wider gap-4 sm:gap-6 flex-wrap">
                {(['desc', 'ingredients', 'usage', 'reviews'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-foreground/60 hover:text-primary-dark'}`}
                  >
                    {tab === 'desc' ? (language === 'FR' ? 'Description' : 'الوصف') : 
                     tab === 'ingredients' ? (language === 'FR' ? 'Ingrédients' : 'المكونات') : 
                     tab === 'usage' ? (language === 'FR' ? 'Utilisation' : 'الاستعمال') : 
                     (language === 'FR' ? 'Avis' : 'الآراء')}
                  </button>
                ))}
              </div>

              <div className="min-h-[140px] max-h-[220px] overflow-y-auto no-scrollbar text-xs leading-relaxed text-slate-700">
                {activeTab === 'desc' && <p>{product.description}</p>}
                {activeTab === 'ingredients' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-foreground/60 font-extrabold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-accent" />
                      {language === 'FR' ? 'Cliquez sur les ingrédients en gras pour leur fiche clinique.' : 'انقري على المكونات لعرض خصائصها.'}
                    </p>
                    {renderIngredientsWithGlossary()}
                  </div>
                )}
                {activeTab === 'usage' && <p>{product.usage}</p>}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Reviews List */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                        {language === 'FR' ? 'Avis Clients' : 'آراء العملاء'} ({reviews.length})
                      </h4>
                      {isReviewsLoading ? (
                        <div className="text-center py-4 text-foreground/60">{language === 'FR' ? 'Chargement des avis...' : 'جari تحميل الآراء...'}</div>
                      ) : reviews.length === 0 ? (
                        <p className="text-foreground/50 italic">{language === 'FR' ? 'Aucun avis pour le moment. Soyez le premier à donner votre avis !' : 'لا توجد تقييمات بعد. كن أول من يكتب تقييماً !'}</p>
                      ) : (
                        <div className="space-y-3">
                          {reviews.map((rev) => {
                            const authorName = rev.author || '?';
                            const firstLetter = authorName.trim().charAt(0).toUpperCase();
                            const charCode = firstLetter.charCodeAt(0) || 0;
                            const schemes = [
                              { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent" },
                              { bg: "bg-gold/15", border: "border-gold/30", text: "text-gold-hover" },
                              { bg: "bg-primary/10", border: "border-primary/20", text: "text-primary" },
                              { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600" },
                              { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" }
                            ];
                            const scheme = schemes[charCode % schemes.length];

                            return (
                              <div key={rev.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex gap-3 items-start">
                                {/* Stylized Initials Avatar */}
                                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black border text-xs uppercase tracking-wider shadow-sm select-none ${scheme.bg} ${scheme.border} ${scheme.text}`}>
                                  {firstLetter}
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-extrabold text-slate-800">{rev.author}</span>
                                    <span className="text-slate-400 font-mono">{new Date(rev.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex gap-0.5 my-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 fill-current ${i < rev.rating ? 'text-amber-400' : 'text-slate-200'}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{rev.comment}</p>
                                  {rev.reply && (
                                    <div className={`mt-2 ${isRTL ? 'pr-3 border-r-2 pl-0' : 'pl-3 border-l-2 pr-0'} border-primary/20 bg-primary/5 p-2 rounded text-[10.5px]`}>
                                      <span className="font-extrabold text-primary-dark block mb-0.5">
                                        {language === 'FR' ? 'Réponse de Para Officinal' : 'رد الصيدلية'}
                                      </span>
                                      <p className="text-slate-600 leading-relaxed">{rev.reply}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Review Form / Account Check */}
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">
                        {language === 'FR' ? 'Laisser un avis' : 'أضف تقييماً'}
                      </h4>
                      {!hasAccount ? (
                        <div className="p-3 bg-amber-50/50 border border-amber-200 text-amber-800 rounded-lg text-[10.5px] leading-relaxed font-bold">
                          {language === 'FR' 
                            ? "🔒 Vous devez avoir un compte client (avoir déjà effectué une commande ou un diagnostic de peau) pour pouvoir publier un avis." 
                            : "🔒 يجب أن يكون لديكِ حساب عميل (بإجراء طلب أو تشخيص للبشرة مسبقاً) لتتمكني من إضافة تقييم."}
                        </div>
                      ) : reviewSuccessMessage ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10.5px] font-extrabold animate-fade-in">
                          {reviewSuccessMessage}
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-3 animate-fade-in">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">{language === 'FR' ? 'Votre note :' : 'تقييمك :'}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewReviewRating(star)}
                                  aria-label={`Note ${star} sur 5`}
                                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                >
                                  <Star
                                    className={`w-4 h-4 fill-current ${star <= newReviewRating ? 'text-amber-400' : 'text-slate-200'}`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            <input
                              type="text"
                              required
                              placeholder={language === 'FR' ? 'Votre nom complet' : 'الاسم الكامل'}
                              value={newReviewAuthor}
                              onChange={(e) => setNewReviewAuthor(e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs outline-none focus:border-slate-400"
                            />
                            <textarea
                              required
                              rows={2}
                              placeholder={language === 'FR' ? 'Partagez votre expérience sur ce produit...' : 'اكتب تعليقك هنا...'}
                              value={newReviewComment}
                              onChange={(e) => setNewReviewComment(e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs outline-none focus:border-slate-400"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer"
                          >
                            {isSubmittingReview ? (language === 'FR' ? 'Envoi...' : 'جاري الإرسال...') : (language === 'FR' ? 'Envoyer mon avis' : 'إرسال التقييم')}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Glossary tooltip */}
          {activeGlossaryTerm && INGREDIENTS_GLOSSARY[activeGlossaryTerm] && (
            <div
              ref={glossaryRef}
              className="t-dropdown is-open absolute bg-white border border-accent/40 rounded-[10px] shadow-2xl p-4 w-[280px] z-50 space-y-2"
              data-origin="top-left"
              style={{ top: `${glossaryPosition.top}px`, left: `${glossaryPosition.left}px` }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5 font-black text-xs text-primary-dark">
                  <span>{INGREDIENTS_GLOSSARY[activeGlossaryTerm].icon}</span>
                  <span>{language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].name_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].name_ar}</span>
                </div>
                <button onClick={() => setActiveGlossaryTerm(null)} aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'} className="cursor-pointer"><X className="w-3 h-3 text-foreground/60" /></button>
              </div>
              <div className="space-y-1.5 text-[10px] leading-relaxed">
                <div>
                  <span className="font-extrabold text-foreground/60 block">{language === 'FR' ? 'Sécurité' : 'مستوى الأمان'}</span>
                  <span className="font-black text-primary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].safety_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].safety_ar}
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-foreground/60 block">{language === 'FR' ? 'Bénéfice' : 'الفائدة'}</span>
                  <span className="font-bold text-accent flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    {language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].benefit_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].benefit_ar}
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-foreground/60 block">{language === 'FR' ? 'Propriété dermatologique' : 'الخصائص الجلدية'}</span>
                  <p className="text-slate-600">{language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].desc_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].desc_ar}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="pt-4 border-t border-border/30 flex items-center gap-4 mt-auto">
            <div className="flex items-center border border-border/40 rounded-[8px] px-2 bg-muted/30 h-11 shrink-0">
              <button 
                onClick={() => setQuantity(p => Math.max(1, p - 1))} 
                disabled={liveStock <= 0}
                aria-label={language === 'FR' ? 'Diminuer la quantité' : 'تقليل الكمية'}
                className="p-1.5 text-foreground/60 hover:text-primary-dark cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3.5 text-xs font-black text-primary-dark min-w-[32px] text-center">
                {liveStock <= 0 ? 0 : quantity}
              </span>
              <button 
                onClick={() => setQuantity(p => p + 1)} 
                disabled={liveStock <= 0 || quantity >= liveStock}
                aria-label={language === 'FR' ? 'Augmenter la quantité' : 'زيادة الكمية'}
                className="p-1.5 text-foreground/60 hover:text-primary-dark cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title={quantity >= liveStock ? (language === 'FR' ? 'Stock maximum atteint' : 'تم الوصول للحد الأقصى للمخزون') : ''}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              onMouseDown={handleRippleClick}
              disabled={liveStock <= 0}
              className="btn-gradient flex-1 h-11 text-xs rounded-[8px] relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={liveStock <= 0 ? { background: '#334155', boxShadow: 'none' } : undefined}
            >
              {ripples.map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                  }}
                />
              ))}
              <ShoppingBag className="w-4 h-4 relative z-10" />
              <span className="relative z-10">
                {liveStock <= 0
                  ? (language === 'FR' ? 'Rupture de Stock' : 'غير متوفر')
                  : (language === 'FR' ? 'Ajouter au Panier' : 'إضافة إلى السلة')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
