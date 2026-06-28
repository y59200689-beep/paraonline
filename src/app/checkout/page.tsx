'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { useUi } from '@/context/UiContext';
import { useCurrency } from '@/context/CurrencyContext';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { ShopShell } from '@/components/ShopShell';
import { loadStripe } from '@stripe/stripe-js';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Gift
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <ShopShell>
      <CheckoutPageContent />
    </ShopShell>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const { earnPoints } = useLoyalty();
  const { showToast } = useUi();
  const { convertPrice, currentCurrency } = useCurrency();
  const {
    cart, clearCart, removeFromCart, updateQuantity,
    subtotal, total, discountAmount, shippingFee, isFreeShipping,
    amountNeededForFreeShipping, appliedCoupon, applyCouponCode, removeCoupon,
    submitOrder, isSubmitting, setShippingCity,
    paymentMethod, setPaymentMethod,
  } = useCart();

  const isRTL = language === 'AR';

  // ── Step & form state ────────────────────────────────────────────────────
  const [step, setStep] = useState<'cart' | 'checkout'>('checkout');
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

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCouponCode(couponCode);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponCode('');
  };

  const proceedToDelivery = () => {
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formFields.name.trim())
      errors.name = language === 'FR' ? 'Nom complet requis' : 'الاسم الكامل مطلوب';
    if (!formFields.phone.trim() || formFields.phone.length < 8)
      errors.phone = language === 'FR' ? 'Téléphone WhatsApp valide requis' : 'رقم واتساب صحيح مطلوب';
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

    setCheckoutSubStep('delivery');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formFields.address.trim())
      errors.address = language === 'FR' ? 'Adresse complète requise' : 'العنوان الكامل مطلوب';
    if (!formFields.city)
      errors.city = language === 'FR' ? 'Veuillez choisir votre ville' : 'يرجى اختيار مدينتكِ';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    if (settings.paymentSettings?.onlinePaymentEnabled) {
      setCheckoutSubStep('payment');
    } else {
      const orderTotal = total;
      const res = await submitOrder(formFields);
      if (res.success) {
        earnPoints(Math.round(orderTotal), 'Nouvelle commande', 'طلب جديد');
        setFormFields({ name: '', phone: '', address: '', city: '', note: '' });
        setCheckoutSubStep('info');
        window.open(res.whatsappUrl, '_blank');
        router.push(`/checkout/success?orderId=${res.orderId}`);
        clearCart();
      }
    }
  };

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
        window.open(res.whatsappUrl, '_blank');
        router.push(`/checkout/success?orderId=${res.orderId}`);
        clearCart();
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

  const handleStripeSuccess = () => {
    const savedOrderId = stripeOrderId;
    earnPoints(Math.round(total), 'Paiement en ligne réussi', 'دفع ناجح عبر الإنترنت');
    clearCart();
    setShippingCity('');
    setFormFields({ name: '', phone: '', address: '', city: '', note: '' });
    setCheckoutSubStep('info');
    setClientSecret('');
    router.push(`/checkout/success?orderId=${savedOrderId}`);
    showToast(
      language === 'FR'
        ? `Commande confirmée ! Votre ID: ${savedOrderId}`
        : `تم تأكيد الطلب! رقم الطلب: ${savedOrderId}`,
      'success'
    );
  };

  const handleSetStep = (s: 'cart' | 'checkout') => {
    if (s === 'cart') {
      router.push('/');
    }
  };

  // ── Render States ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center select-none">
        <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-6 shadow-inner">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-black font-heading text-slate-800 tracking-tight leading-none mb-3">
          {language === 'FR' ? 'Votre panier est vide' : 'سلتكِ فارغة حالياً'}
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
          {language === 'FR' 
            ? 'Ajoutez des rituels de soin K-Beauty cliniques avant de procéder à la validation de commande.' 
            : 'أضيفي بعض منتجات العناية بالبشرة الكورية الفاخرة إلى سلتكِ أولاً لتتمكني من إتمام الطلب.'}
        </p>
        <Link 
          href="/" 
          className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-98"
        >
          {language === 'FR' ? 'Continuer mes achats' : 'العودة للمتجر'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 md:py-20">
      
      {/* Page Title */}
      <div className="mb-10 text-center md:text-left select-none font-sans">
        <h1 className="text-2xl md:text-[32px] font-black text-slate-800 tracking-tight leading-none mb-3">
          {language === 'FR' ? 'Paiement Sécurisé' : 'إتمام الطلب بأمان'}
        </h1>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
          {language === 'FR'
            ? 'Finalisez votre protocole de soin K-Beauty officiel en toute sécurité.'
            : 'أكملي بروتوكول العناية بالبشرة الكوري الرسمي بكل أمان وخصوصية.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
          <CheckoutForm
            language={language}
            isRTL={isRTL}
            checkoutSubStep={checkoutSubStep}
            setCheckoutSubStep={setCheckoutSubStep}
            setStep={handleSetStep}
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
            handleCheckoutSubmit={handleCheckoutSubmit}
            handleConfirmOrder={handleConfirmPayment}
            onStripeSuccess={handleStripeSuccess}
            t={t}
          />
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-200/50 pb-4 mb-6 uppercase tracking-wider select-none text-left">
              {language === 'FR' ? 'Résumé de la commande' : 'ملخص الطلب'}
            </h2>

            {/* Free Shipping Progress bar */}
            {settings.freeShippingThreshold && (
              <div className="mb-6 p-4 bg-white border border-slate-200/40 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] select-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 text-[11px]">
                    {isFreeShipping ? (
                      <span className="font-extrabold text-primary uppercase tracking-wide block">
                        {language === 'FR' ? 'Livraison Gratuite Offerte !' : 'توصيل مجاني متوفر لطلبكِ !'}
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700 leading-none">
                          {language === 'FR' ? 'Plus que ' : 'متبقي '}
                          <span className="font-black text-primary">{convertPrice(typeof amountNeededForFreeShipping === 'number' ? amountNeededForFreeShipping : 0)}</span>
                          {language === 'FR' ? ' pour la livraison gratuite !' : ' لتفعيل التوصيل المجاني !'}
                        </span>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar mb-6">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-4 items-center bg-white border border-slate-100 rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)] group relative">
                  <div className="w-16 h-16 rounded-xl border border-slate-100 bg-[#f8fafc] overflow-hidden relative shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-grow min-w-0 text-left">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                      {item.product.vendor}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mb-1 leading-snug">
                      {language === 'FR' ? item.product.nameFr || item.product.title : item.product.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary">
                      <span>{convertPrice(item.product.price)}</span>
                      {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                        <span className="text-[9.5px] text-slate-400 line-through font-normal">
                          {convertPrice(item.product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity and Delete Controls */}
                  <div className="flex flex-col items-end gap-2.5">
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-rose-50"
                      title={language === 'FR' ? 'Supprimer' : 'حذف'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-slate-200 bg-[#FDFBF7] rounded-lg p-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-[11px] font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Promo Code Input */}
            <div className="border-t border-slate-200/50 pt-5 mb-5 select-none">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs text-primary font-bold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                    <span>
                      {language === 'FR' ? 'Code appliqué :' : 'الكوبون المفعل :'} {appliedCoupon.code}
                    </span>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-[10px] uppercase font-black tracking-wider text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    {language === 'FR' ? 'Retirer' : 'إلغاء'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'FR' ? 'Code promo / coupon' : 'رمز الخصم الكوبون'}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-slate-800 uppercase placeholder-slate-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-wider px-5 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 border-none"
                  >
                    {language === 'FR' ? 'Appliquer' : 'تطبيق'}
                  </button>
                </form>
              )}
              {couponMessage.text && (
                <span className={`text-[10.5px] mt-2 block font-semibold ${couponMessage.isError ? 'text-rose-500' : 'text-primary'}`}>
                  {couponMessage.text}
                </span>
              )}
            </div>

            {/* Pricing breakdown summary */}
            <div className="border-t border-slate-200/50 pt-5 space-y-3 select-none">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>{language === 'FR' ? 'Sous-total' : 'المجموع الفرعي'}</span>
                <span className="font-mono text-slate-700">{convertPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-primary">
                  <span>{language === 'FR' ? 'Remise appliquée' : 'الخصم الكوبون'}</span>
                  <span className="font-mono">- {convertPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>{language === 'FR' ? 'Livraison' : 'مصاريف التوصيل'}</span>
                <span className="font-mono text-slate-700">
                  {shippingFee === 0 
                    ? (language === 'FR' ? 'Gratuite' : 'مجاني') 
                    : convertPrice(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200/50 pt-4 text-sm font-black text-slate-800">
                <span>Total</span>
                <span className="font-mono text-primary text-base">
                  {convertPrice(total)}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
