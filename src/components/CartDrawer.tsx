'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { Product, MOROCCAN_CITIES } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import {
  X, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus,
  Truck, ArrowLeft, AlertTriangle, CreditCard, Sparkles, Gift
} from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Sub-components
import { CartItemList } from './cart/CartItemList';
import { CartUpsells } from './cart/CartUpsells';
import { CouponSection } from './cart/CouponSection';
import { CheckoutForm } from './cart/CheckoutForm';
import { CartFooter } from './cart/CartFooter';

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenScratchCard: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenScratchCard,
}) => {
  const { t, language } = useTranslation();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { earnPoints, tierMultiplier, points: loyaltyPoints, tier } = useLoyalty();
  const {
    cart, clearCart, addToCart, removeFromCart, updateQuantity,
    subtotal, total, discountAmount, shippingFee, isFreeShipping,
    amountNeededForFreeShipping, appliedCoupon, applyCouponCode, removeCoupon,
    submitOrder, isSubmitting, setShippingCity, dailyGiftName,
    activeGiftRange, paymentMethod, setPaymentMethod,
  } = useCart();

  // Look up the full product object for the active gift range
  const activeGiftProduct = activeGiftRange
    ? products.find(p => p.id === activeGiftRange.productId) ?? null
    : null;
  const { showToast } = useUi();

  // ── Step & form state ────────────────────────────────────────────────────
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [checkoutSubStep, setCheckoutSubStep] = useState<'info' | 'delivery' | 'payment'>('info');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });
  const [formFields, setFormFields] = useState({ name: '', phone: '', address: '', city: '', note: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Stripe state ─────────────────────────────────────────────────────────
  const [clientSecret, setClientSecret] = useState('');
  const [stripeOrderId, setStripeOrderId] = useState('');
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    if (settings?.paymentSettings?.stripePublishableKey) {
      setStripePromise(loadStripe(settings.paymentSettings.stripePublishableKey));
    }
  }, [settings?.paymentSettings?.stripePublishableKey]);

  // ── Swipe-to-dismiss gesture ─────────────────────────────────────────────
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isRTL = language === 'AR';

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setCheckoutSubStep('info');
      setCouponMessage({ text: '', isError: false });
      setCouponCode('');
      setSwipeOffset(0);
      setClientSecret('');
      setStripeOrderId('');
      setPaymentMethod('cod');
    }
  }, [isOpen, setPaymentMethod]);

  // ── Derived cart state ───────────────────────────────────────────────────
  const hasOil = cart.some(item => item.product.id === 15);
  const hasFoam = cart.some(item => item.product.id === 22);
  const showDoubleCleanseUpsell = hasOil && !hasFoam;

  const thresholdItems = products.filter(
    p => p.price <= 200 && !cart.some(item => item.product.id === p.id)
  ).slice(0, 3);

  // ── Calculate Total Savings ───────────────────────────────────────────────
  const getSavingsDetails = () => {
    const couponSavings = discountAmount;
    let shippingSavings = 0;
    if (isFreeShipping && subtotal > 0) {
      if (formFields.city && settings?.shippingRules) {
        const cityRule = settings.shippingRules.find(
          r => r.city.toLowerCase() === formFields.city.toLowerCase()
        );
        shippingSavings = cityRule ? cityRule.fee : (settings.shippingFee ?? 35);
      } else {
        shippingSavings = settings?.shippingFee ?? 35;
      }
    }
    const giftSavings = activeGiftProduct ? activeGiftProduct.price : 0;
    return couponSavings + shippingSavings + giftSavings;
  };

  const totalSavings = getSavingsDetails();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCouponCode(couponCode);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponCode('');
  };

  // ── Merged single-step handler (replaces proceedToDelivery + handleCheckoutSubmit) ──
  const handleMergedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};

    // Validate all fields in one pass
    if (!formFields.name.trim())
      errors.name = language === 'FR' ? 'Nom complet requis' : 'الاسم الكامل مطلوب';
    if (!formFields.phone.trim() || formFields.phone.length < 8)
      errors.phone = language === 'FR' ? 'Téléphone WhatsApp valide requis' : 'رقم واتساب صحيح مطلوب';
    if (!formFields.city)
      errors.city = language === 'FR' ? 'Veuillez choisir votre ville' : 'يرجى اختيار مدينتكِ';
    if (!formFields.address.trim())
      errors.address = language === 'FR' ? 'Adresse complète requise' : 'العنوان الكامل مطلوب';

    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    // Capture abandoned cart
    fetch('/api/admin/abandoned-carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formFields.name, phone: formFields.phone,
        items: cart.map(i => ({ id: i.product.id, title: i.product.title, quantity: i.quantity, price: i.product.price })),
        total, date: new Date().toISOString(),
      }),
    }).catch(err => console.error('Failed to sync abandoned cart:', err));

    if (settings.paymentSettings?.onlinePaymentEnabled) {
      setCheckoutSubStep('payment');
    } else {
      const orderTotal = total;
      const res = await submitOrder(formFields);
      if (res.success) {
        earnPoints(Math.round(orderTotal), 'Nouvelle commande', 'طلب جديد');
        setFormFields({ name: '', phone: '', address: '', city: '', note: '' });
        window.open(res.whatsappUrl, '_blank');
        onClose();
      }
    }
  };

  // Keep these as no-ops so CheckoutForm prop types are satisfied
  const proceedToDelivery = () => {};
  const handleCheckoutSubmit = async (e: React.FormEvent) => { e.preventDefault(); };

  const handleCmiPayment = async (orderId: string) => {
    try {
      const res = await fetch('/api/payment/cmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId, customerName: formFields.name, phone: formFields.phone }),
      });
      const data = await res.json();
      if (data.success && data.apiUrl && data.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.apiUrl;
        Object.entries(data.params).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(val);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        showToast(data.error || "Une erreur est survenue lors de l'initialisation du paiement CMI.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la connexion à la passerelle CMI.', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'cod') {
      const orderTotal = total;
      const res = await submitOrder(formFields);
      if (res.success) {
        earnPoints(Math.round(orderTotal), 'Nouvelle commande', 'طلب جديد');
        setFormFields({ name: '', phone: '', address: '', city: '', note: '' });
        setCheckoutSubStep('info');
        setStep('cart');
        window.open(res.whatsappUrl, '_blank');
        onClose();
      }
    } else if (paymentMethod === 'stripe') {
      setIsInitializingStripe(true);
      try {
        const orderRes = await submitOrder(formFields);
        if (orderRes.success && orderRes.orderId) {
          setStripeOrderId(orderRes.orderId);
          const res = await fetch('/api/payment/stripe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total, orderId: orderRes.orderId }),
          });
          const data = await res.json();
          if (data.success && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            showToast("Impossible d'obtenir la clé de paiement Stripe.", 'error');
          }
        }
      } catch (err) {
        console.error(err);
        showToast("Une erreur est survenue lors de l'appel Stripe.", 'error');
      } finally {
        setIsInitializingStripe(false);
      }
    } else if (paymentMethod === 'cmi') {
      const orderRes = await submitOrder(formFields);
      if (orderRes.success && orderRes.orderId) {
        await handleCmiPayment(orderRes.orderId);
      }
    }
  };

  // ── Swipe gesture ────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    setSwipeOffset(isRTL ? Math.min(0, diff) : Math.max(0, diff));
  };
  const handleTouchEnd = () => {
    const totalSwipe = Math.abs(touchCurrentX.current - touchStartX.current);
    const isValidSwipe = isRTL
      ? (touchCurrentX.current - touchStartX.current < -100)
      : (touchCurrentX.current - touchStartX.current > 100);
    if (isValidSwipe && totalSwipe > 100) onClose();
    setSwipeOffset(0);
  };

  const getDrawerTransformStyle = () => {
    if (!isOpen) return isRTL ? 'translateX(-100%)' : 'translateX(100%)';
    return `translateX(${swipeOffset}px)`;
  };

  // ── Stripe success handler ────────────────────────────────────────────────
  const handleStripeSuccess = () => {
    earnPoints(Math.round(total), 'Paiement en ligne réussi', 'دفع ناجح عبر الإنترنت');
    clearCart();
    setShippingCity('');
    setFormFields({ name: '', phone: '', address: '', city: '', note: '' });
    setCheckoutSubStep('info');
    setStep('cart');
    setClientSecret('');
    onClose();
    showToast(
      language === 'FR'
        ? '🎉 Paiement réussi ! Votre commande a été enregistrée avec succès.'
        : '🎉 تم الدفع بنجاح! تم تسجيل طلبك بنجاح.',
      'success',
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black/55 z-50 flex justify-end ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        transitionProperty: 'opacity, backdrop-filter',
        transitionDuration: isOpen ? '400ms' : '300ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        backdropFilter: isOpen ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'blur(0px)',
      }}
    >
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-[460px] h-full bg-[#FAF9F6] border-l border-slate-200/50 shadow-2xl flex flex-col z-10 overflow-hidden"
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          transform: getDrawerTransformStyle(),
          transition: `transform ${isOpen ? '420ms' : '320ms'} cubic-bezier(0.22, 1, 0.36, 1)`,
          willChange: 'transform',
        }}
      >
        {/* Header */}
        <div className="py-5 px-6 border-b border-slate-200/40 bg-white flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-heading font-extrabold text-primary-dark leading-none">
              {step === 'cart' ? t('cart_title') : (language === 'FR' ? 'Validation de commande' : 'تأكيد الطلب')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
            className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary-dark transition-all duration-300"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 no-scrollbar">
          {cart.length === 0 ? (
            /* ── Empty State ─────────────────────────────────────────────── */
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <ShoppingBag className="w-16 h-16 text-slate-200" />
              <h4 className="text-sm font-black text-slate-700">{t('cart_empty')}</h4>
              <button
                onClick={onClose}
                className="px-6 py-3.5 bg-primary-dark text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-md shadow-primary-dark/10"
              >
                {language === 'FR' ? 'Faire mes achats' : 'مواصلة التسوق'}
              </button>
            </div>

          ) : step === 'cart' ? (
            /* ── Cart Step ───────────────────────────────────────────────── */
            <>
              {/* 1. Cart Items */}
              <CartItemList
                cart={cart}
                language={language}
                onSelectProduct={onSelectProduct}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                lowStockThreshold={settings?.lowStockThreshold ?? 5}
                isOpen={isOpen}
              />

              {/* 1b. Active Gift Range Card */}
              {activeGiftRange && (
                <div 
                  className={`relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white shadow-[0_4px_24px_rgba(16,185,129,0.10)] ${
                    isOpen ? 'animate-slide-up' : 'opacity-0'
                  }`}
                  style={isOpen ? { animationDelay: `${cart.length * 55 + 50}ms` } : undefined}
                >
                  {/* Glow orb */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-teal-400/15 blur-xl pointer-events-none" />

                  <div className="relative flex items-center gap-4 px-4 py-4">
                    {/* Gift product image or icon */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl border-2 border-emerald-400/40 bg-white shadow-md overflow-hidden flex items-center justify-center">
                        {activeGiftProduct?.image ? (
                          <Image
                            src={getOptimizedImageUrl(activeGiftProduct.image) || placeholderSvg}
                            alt={activeGiftProduct.nameFr || activeGiftProduct.title}
                            width={56}
                            height={56}
                            className="object-contain p-1"
                          />
                        ) : (
                          <Gift className="w-6 h-6 text-emerald-500" />
                        )}
                      </div>
                      {/* Unlocked badge */}
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600">
                          {language === 'FR' ? '🎁 Cadeau offert' : '🎁 هدية مجانية'}
                        </span>
                      </div>
                      <p className="text-[12px] font-bold text-slate-800 leading-tight line-clamp-2">
                        {activeGiftRange.productName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {language === 'FR'
                          ? `Offert pour toute commande de ${activeGiftRange.minAmount}–${activeGiftRange.maxAmount} DH`
                          : `مهداة لكل طلب من ${activeGiftRange.minAmount} إلى ${activeGiftRange.maxAmount} درهم`}
                      </p>
                    </div>

                    {/* OFFERT tag */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {activeGiftProduct && (
                        <span className="text-[9px] font-bold text-slate-400 line-through">
                          {activeGiftProduct.price} DH
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        {language === 'FR' ? 'Offert' : 'مجانًا'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom shimmer strip */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                </div>
              )}

              <div 
                className={`rounded-2xl border p-4 flex flex-col gap-3.5 transition-all duration-500 ${
                  isFreeShipping 
                    ? 'border-emerald-500/20 bg-emerald-50/30 shadow-[0_4px_16px_rgba(16,185,129,0.04)]' 
                    : 'border-slate-200/40 bg-white shadow-[0_4px_12px_rgba(26,37,93,0.02)]'
                } ${isOpen ? 'animate-slide-up' : 'opacity-0'}`}
                style={isOpen ? { animationDelay: `${cart.length * 55 + 100}ms` } : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isFreeShipping 
                      ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                      : 'bg-primary/5 border-primary/10 text-primary'
                  }`}>
                    <Truck className="w-4.5 h-4.5 animate-[pulse_3s_infinite]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[12px] font-bold leading-tight flex items-center gap-1.5 transition-colors duration-500 ${isFreeShipping ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {isFreeShipping && <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />}
                      <span>
                        {isFreeShipping
                          ? (language === 'FR' ? 'Livraison Gratuite Débloquée !' : 'تم تفعيل التوصيل المجاني!')
                          : (language === 'FR' 
                              ? `Plus que ${(amountNeededForFreeShipping as number).toFixed(2)} DH pour la livraison gratuite` 
                              : `متبقي ${(amountNeededForFreeShipping as number).toFixed(2)} درهم للاستفادة من التوصيل المجاني`)}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {isFreeShipping 
                        ? (language === 'FR' ? 'Votre commande sera livrée sans frais.' : 'سيتم توصيل طلبكِ مجاناً بالكامل.')
                        : (language === 'FR' 
                            ? `Seuil de livraison gratuite : ${settings?.freeShippingThreshold || 600} DH` 
                            : `حد التوصيل المجاني: ${settings?.freeShippingThreshold || 600} درهم`)}
                    </span>
                  </div>
                </div>
                
                <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isFreeShipping 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                        : 'bg-gradient-to-r from-primary-dark to-primary shadow-[0_0_12px_rgba(37,115,163,0.2)]'
                    }`}
                    style={{ width: `${Math.min((subtotal / (settings?.freeShippingThreshold || 600)) * 100, 100)}%` }}
                  />
                </div>

                {!dailyGiftName && (
                  <button
                    onClick={onOpenScratchCard}
                    className="text-[11px] font-extrabold uppercase tracking-wider text-accent flex items-center gap-1.5 self-start hover:text-teal-700 transition-colors duration-200"
                  >
                    <Gift className="w-3.5 h-3.5 animate-bounce text-accent" />
                    <span>{language === 'FR' ? 'Débloquer mon cadeau gratuit !' : 'افتحي هديتكِ المجانية اليومية!'}</span>
                  </button>
                )}
              </div>

              {/* 3. Coupon */}
              <div
                className={isOpen ? 'animate-slide-up' : 'opacity-0'}
                style={isOpen ? { animationDelay: `${cart.length * 55 + 150}ms` } : undefined}
              >
                <CouponSection
                  language={language}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  couponMessage={couponMessage}
                  appliedCoupon={appliedCoupon}
                  onApply={handleApplyCoupon}
                  onRemove={removeCoupon}
                />
              </div>

              {/* 4. Loyalty Points Preview */}
              {(() => {
                const pointsPerDh = settings?.loyaltyPointsPerDh ?? 1.0;
                const pointsToEarn = Math.round(Math.round(subtotal * pointsPerDh) * tierMultiplier);
                if (pointsToEarn <= 0) return null;
                const tierColors: Record<string, string> = {
                  Bronze:   'text-amber-700  bg-amber-50   border-amber-200/70',
                  Silver:   'text-slate-600  bg-slate-50   border-slate-200/70',
                  Gold:     'text-yellow-700 bg-yellow-50  border-yellow-200/70',
                  Platinum: 'text-violet-700 bg-violet-50  border-violet-200/70',
                };
                const tierBadge = tierColors[tier] ?? tierColors.Bronze;
                return (
                  <div 
                    className={`relative rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white shadow-[0_4px_20px_rgba(245,158,11,0.06)] px-4 py-3.5 flex items-center gap-3.5 ${
                      isOpen ? 'animate-slide-up' : 'opacity-0'
                    }`}
                    style={isOpen ? { animationDelay: `${cart.length * 55 + 200}ms` } : undefined}
                  >
                    {/* Ambient glow — contained, no negative positioning so no clipping */}
                    <div className="absolute inset-0 rounded-2xl bg-amber-300/5 pointer-events-none" />

                    {/* Flame icon */}
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-100 border border-amber-200/60 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-500" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">
                        {language === 'FR'
                          ? <>Vous allez gagner <span className="text-amber-600">+{pointsToEarn} pts</span> avec cette commande</>
                          : <>ستكسبين <span className="text-amber-600">+{pointsToEarn} نقطة</span> من هذا الطلب</>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {language === 'FR'
                          ? `Solde actuel : ${loyaltyPoints} pts`
                          : `رصيدك الحالي : ${loyaltyPoints} نقطة`}
                      </p>
                    </div>

                    {/* Tier + multiplier badge */}
                    <div className={`shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border text-center ${tierBadge}`}>
                      <span className="text-[9px] font-black uppercase tracking-wider">{tier}</span>
                      {tierMultiplier > 1 && (
                        <span className="text-[8px] font-bold opacity-70">×{tierMultiplier}</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 5. Upsells */}
              <div
                className={isOpen ? 'animate-slide-up' : 'opacity-0'}
                style={isOpen ? { animationDelay: `${cart.length * 55 + 250}ms` } : undefined}
              >
                <CartUpsells
                  showDoubleCleanseUpsell={showDoubleCleanseUpsell}
                  thresholdItems={thresholdItems}
                  isFreeShipping={isFreeShipping}
                  products={products}
                  addToCart={addToCart}
                />
              </div>
            </>
          ) : (
            <CheckoutForm
              language={language}
              isRTL={isRTL}
              checkoutSubStep={checkoutSubStep}
              setCheckoutSubStep={setCheckoutSubStep}
              setStep={setStep}
              formFields={formFields}
              setFormFields={setFormFields}
              formErrors={formErrors}
              setShippingCity={setShippingCity}
              isSubmitting={isSubmitting}
              isInitializingStripe={isInitializingStripe}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              stripeOrderId={stripeOrderId}
              stripePromise={stripePromise}
              total={total}
              onlinePaymentEnabled={!!settings.paymentSettings?.onlinePaymentEnabled}
              testMode={!!settings.paymentSettings?.testMode}
              stripeEnabled={!!settings.paymentSettings?.stripeEnabled}
              cmiEnabled={!!settings.paymentSettings?.cmiEnabled}
              proceedToDelivery={proceedToDelivery}
              handleCheckoutSubmit={handleMergedSubmit}
              handleConfirmOrder={handleConfirmPayment}
              onStripeSuccess={handleStripeSuccess}
              t={t}
            />
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <CartFooter
            subtotal={subtotal}
            discountAmount={discountAmount}
            dailyGiftName={dailyGiftName}
            shippingFee={shippingFee}
            total={total}
            language={language}
            isRTL={isRTL}
            step={step}
            onCheckout={() => setStep('checkout')}
            t={t}
            showShipping={step === 'checkout' && formFields.address.trim() !== '' && formFields.city !== ''}
            shippingCity={formFields.city}
            totalSavings={totalSavings}
            deliverySettings={settings?.deliverySettings}
          />
        )}
      </div>
    </div>
  );
};
