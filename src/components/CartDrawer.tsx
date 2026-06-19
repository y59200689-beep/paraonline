'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import { useTranslation } from '../context/LanguageContext';
import { PRODUCTS_DB, Product } from '../lib/data';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, Plus, Minus, Check, HelpCircle, Truck } from 'lucide-react';

const placeholderSvg = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='100%' height='100%'><rect width='100%' height='100%' fill='#f1f5f9'/><path d='M150 100a40 40 0 1 0 40 40 40 40 0 0 0-40-40zm0 60a20 20 0 1 1 20-20 20 20 0 0 1-20 20z' fill='#94a3b8'/><path d='M180 180h-60a10 10 0 0 0-10 10v10h80v-10a10 10 0 0 0-10-10z' fill='#94a3b8'/><text x='150' y='230' font-family='sans-serif' font-size='12' font-weight='bold' fill='#64748b' text-anchor='middle'>Image Indisponible</text></svg>");

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  onOpenScratchCard
}) => {
  const { t, language } = useTranslation();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    total,
    discountAmount,
    shippingFee,
    isFreeShipping,
    amountNeededForFreeShipping,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    dailyGiftName,
    submitOrder,
    isSubmitting
  } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });

  // Checkout Form fields
  const [formFields, setFormFields] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset steps on opening/closing
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setCouponMessage({ text: '', isError: false });
      setCouponCode('');
    }
  }, [isOpen]);


  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = applyCouponCode(couponCode);
    setCouponMessage({
      text: res.message,
      isError: !res.success
    });

    if (res.success) {
      setCouponCode('');
    }
  };

  // Smart cross-sell checking:
  // Oil is id 15, Foam is id 22.
  const hasOil = cart.some(item => item.product.id === 15);
  const hasFoam = cart.some(item => item.product.id === 22);
  const showDoubleCleanseUpsell = hasOil && !hasFoam;

  // Threshold Maximizer item suggestion (under 200 DH and not currently in the cart)
  const thresholdItems = PRODUCTS_DB.filter(
    p => p.price <= 200 && !cart.some(item => item.product.id === p.id)
  ).slice(0, 3); // Max 3 items

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formFields.name.trim()) errors.name = language === 'FR' ? 'Nom complet requis' : 'الاسم الكامل مطلوب';
    if (!formFields.phone.trim() || formFields.phone.length < 8) errors.phone = language === 'FR' ? 'Téléphone WhatsApp valide requis' : 'رقم واتساب صحيح مطلوب';
    if (!formFields.address.trim()) errors.address = language === 'FR' ? 'Adresse complète requise' : 'العنوان الكامل مطلوب';
    if (!formFields.city) errors.city = language === 'FR' ? 'Veuillez choisir votre ville' : 'يرجى اختيار مدينتكِ';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const res = await submitOrder(formFields);
    if (res.success) {
      // Clear form
      setFormFields({ name: '', phone: '', address: '', city: '' });
      // Redirect to WhatsApp COD flow
      window.open(res.whatsappUrl, '_blank');
      onClose();
    }
  };

  // Moroccan Cities dropdown selection
  const MOROCCAN_CITIES = [
    { value: 'Rabat', label: 'Rabat / الرباط' },
    { value: 'Tanger', label: 'Tanger / طنجة' },
    { value: 'Fès', label: 'Fès / فاس' },
    { value: 'Meknès', label: 'Meknès / مكناس' },
    { value: 'Tétouan', label: 'Tétouan / تطوان' },
    { value: 'Salé', label: 'Salé / سلا' },
    { value: 'Témara', label: 'Témara / تمارة' },
    { value: 'Casablanca', label: 'Casablanca / الدار البيضاء' },
    { value: 'Marrakech', label: 'Marrakech / مراكش' },
    { value: 'Agadir', label: 'Agadir / أكادير' },
    { value: 'Oujda', label: 'Oujda / وجدة' },
    { value: 'Nador', label: 'Nador / الناظور' },
    { value: 'Kénitra', label: 'Kénitra / القنيطرة' },
  ];

  const isRTL = language === 'AR';

  return (
    <div 
      className={`fixed inset-0 bg-black/55 z-50 flex justify-end transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
    >
      
      {/* Background click overlay */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {/* Cart Drawer Panel */}
      <div 
        className={`relative w-full max-w-[460px] h-full bg-white border-l border-border shadow-2xl flex flex-col justify-between z-10 text-slate-800 overflow-hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        
        {/* Header Drawer */}
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-secondary" />
            <h3 className="text-base font-black font-heading text-primary-dark">
              {step === 'cart' ? t('cart_title') : (language === 'FR' ? 'Validation de commande (COD)' : 'تأكيد الطلب عند الاستلام')}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Drawer content body (Cart view or Checkout view) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto" />
              <h4 className="text-sm font-black text-primary-dark">{t('cart_empty')}</h4>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                {language === 'FR' ? 'Faire mes achats' : 'مواصلة التسوق'}
              </button>
            </div>
          ) : step === 'cart' ? (
            // ==========================================
            // STEP 1: SHOPPING BASKET SUMMARY VIEW
            // ==========================================
            <div className="space-y-6">
              
              {/* 1. Free Shipping milestone Threshold tracker */}
              <div className="bg-muted rounded-2xl p-4 border border-accent/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-primary-dark">
                  <Truck className="w-4 h-4 text-secondary" />
                  <span>
                    {isFreeShipping 
                      ? t('shipping_free')
                      : t('shipping_progress').replace('{amount}', amountNeededForFreeShipping.toString())
                    }
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / 600) * 100, 100)}%` }}
                  />
                </div>
                {!dailyGiftName && (
                  <button 
                    onClick={onOpenScratchCard}
                    className="text-[10px] font-black uppercase text-accent hover:text-accent/80 flex items-center gap-1 mt-2 animate-pulse"
                  >
                    🎁 {language === 'FR' ? 'Débloquer mon cadeau du jour gratuit !' : 'افتحي هديتكِ المجانية اليومية الآن!'}
                  </button>
                )}
              </div>

              {/* 2. Items List */}
              <div className="divide-y divide-solid divide-border/20">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.nameFr || item.product.name || item.product.title}
                      className="w-14 h-14 object-cover rounded-md bg-white border border-solid border-border/30 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = placeholderSvg;
                      }}
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 
                        onClick={() => { onSelectProduct(item.product); }}
                        className="text-xs font-bold truncate text-primary-dark hover:text-accent cursor-pointer"
                      >
                        {toTitleCase(item.product.nameFr || item.product.name || item.product.title)}
                      </h4>
                      <span className="text-[10px] text-foreground/75 block">{item.product.vendor}</span>
                      
                      {/* Quantity counters */}
                      <div className="flex items-center border border-border-light rounded-lg px-1.5 w-max bg-background h-8">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-foreground/70 hover:text-primary-dark"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-black min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-foreground/70 hover:text-primary-dark"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between h-14 shrink-0">
                      <span className="text-xs font-black text-primary-dark">
                        {(item.product.price * item.quantity).toFixed(2)} DH
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-foreground/70 hover:text-rose-500 p-1 self-end transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Double Cleanse Dynamic Upsell Component */}
              {showDoubleCleanseUpsell && (
                <div className="bg-muted rounded-2xl p-4 border border-dashed border-accent/25 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-accent tracking-wider block">
                      {t('cro_double_cleanse_title')}
                    </span>
                    <p className="text-[10px] leading-relaxed text-foreground/70">
                      {t('cro_double_cleanse_desc')}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center bg-white p-2.5 rounded-xl border border-border">
                    <img 
                      src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop" 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = placeholderSvg;
                      }}
                    />
                    <div className="flex-grow min-w-0">
                      <h5 className="text-[11px] font-extrabold truncate text-primary-dark">
                        {toTitleCase(PRODUCTS_DB.find(p => p.id === 22)?.nameFr || PRODUCTS_DB.find(p => p.id === 22)?.name || "Anua Heartleaf Mousse Nettoyante Profonde des Pores 150ml")}
                      </h5>
                      <span className="text-[10px] text-accent font-black">179.00 DH</span>
                    </div>
                    <button
                      onClick={() => {
                        const partner = PRODUCTS_DB.find(p => p.id === 22);
                        if (partner) addToCart(partner, 1);
                      }}
                      className="px-3 py-1.5 bg-accent hover:bg-accent/80 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      {t('cro_add_partner_btn')}
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Threshold Maximizer product upsells (Only if subtotal is below free shipping) */}
              {!isFreeShipping && thresholdItems.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 block">
                    🎁 {t('cro_free_shipping_unlock')}
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {thresholdItems.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-background border border-border-light rounded-xl p-2 flex flex-col justify-between items-center text-center text-[10px]"
                      >
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded-md mb-1 bg-white" 
                          onError={(e) => {
                            e.currentTarget.src = placeholderSvg;
                          }}
                        />
                        <span className="font-extrabold truncate w-full text-slate-700">
                          {toTitleCase(item.nameFr || item.name || item.title)}
                        </span>
                        <span className="text-accent font-black mb-2">{item.price} DH</span>
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="w-full py-1 bg-primary text-white font-black uppercase tracking-wider rounded-lg hover:bg-accent text-[9px] transition-colors"
                        >
                          + {language === 'FR' ? 'Ajouter' : 'إضافة'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'FR' ? 'Code promo...' : 'رمز القسيمة...'}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-background border border-border-light rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  {language === 'FR' ? 'Appliquer' : 'تطبيق'}
                </button>
              </form>

              {/* Applied Code indicators */}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-solid border-emerald-500/20 text-emerald-500 px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span>{appliedCoupon.code} (-{appliedCoupon.discountPercent}% Off)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-slate-400 hover:text-rose-500 font-extrabold text-xs">Retirer</button>
                </div>
              )}

              {couponMessage.text && (
                <span className={`text-[10px] font-bold block ${couponMessage.isError ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {couponMessage.text}
                </span>
              )}

            </div>
          ) : (
            // ==========================================
            // STEP 2: SECURE CASH ON DELIVERY FORM
            // ==========================================
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-foreground/75 block">{t('form_name')}</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={formFields.name}
                  onChange={(e) => setFormFields(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-3 bg-background border border-border-light rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                {formErrors.name && <span className="text-[10px] font-bold text-rose-500 block">{formErrors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-foreground/75 block">{t('form_phone')}</label>
                <input
                  type="tel"
                  placeholder="0661234567"
                  value={formFields.phone}
                  onChange={(e) => setFormFields(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-3 bg-background border border-border-light rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                {formErrors.phone && <span className="text-[10px] font-bold text-rose-500 block">{formErrors.phone}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-foreground/75 block">{t('form_city_label')}</label>
                <select
                  value={formFields.city}
                  onChange={(e) => setFormFields(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3.5 py-3 bg-background border border-border-light rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="">{t('form_city')}</option>
                  {MOROCCAN_CITIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {formErrors.city && <span className="text-[10px] font-bold text-rose-500 block">{formErrors.city}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-foreground/75 block">{t('form_address')}</label>
                <textarea
                  rows={3}
                  placeholder="Quartier Riad, Avenue Mohamed VI, Immeuble 12..."
                  value={formFields.address}
                  onChange={(e) => setFormFields(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-3 bg-background border border-border-light rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                {formErrors.address && <span className="text-[10px] font-bold text-rose-500 block">{formErrors.address}</span>}
              </div>

              {/* Clinical Trust Badge COD */}
              <div className="bg-emerald-500/10 border border-solid border-emerald-500/20 text-emerald-500 rounded-xl p-3.5 flex items-start gap-2.5 text-[10px] leading-normal">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">{language === 'FR' ? 'Paiement à la Livraison Garanti' : 'الدفع عند الاستلام مضمون'}</span>
                  <p className="opacity-90">
                    {language === 'FR'
                      ? 'Aucun paiement en ligne requis. Vous inspectez vos produits à la livraison avant de payer le livreur en espèces.'
                      : 'لا يتطلب أي دفع مسبق عبر الإنترنت. يمكنكِ فحص المنتجات عند التسليم قبل دفع المبلغ نقداً للموزع.'
                    }
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t('form_confirm')}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setStep('cart')}
                className="w-full py-2.5 border border-border-light text-foreground/75 hover:text-primary-dark hover:bg-slate-50 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                {t('cart_back')}
              </button>

            </form>
          )}
        </div>

        {/* Footer Summary panel */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-border-light bg-[#f8fafc] space-y-4">
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>{t('cart_subtotal')}</span>
                <span>{subtotal.toFixed(2)} DH</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>{language === 'FR' ? 'Remise' : 'الخصم'}</span>
                  <span>-{discountAmount.toFixed(2)} DH</span>
                </div>
              )}
              {dailyGiftName && (
                <div className="flex justify-between text-accent">
                  <span>{language === 'FR' ? 'Cadeau Gratuit' : 'الهدية المجانية'}</span>
                  <span className="font-black truncate max-w-[200px]">{dailyGiftName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>{language === 'FR' ? 'Frais de livraison' : 'مصاريف الشحن'}</span>
                <span>{shippingFee === 0 ? (language === 'FR' ? 'GRATUIT' : 'مجاني') : `${shippingFee.toFixed(2)} DH`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-primary-dark pt-2 border-t border-border-light">
                <span>Total</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
            </div>

            {step === 'cart' && (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>{t('cart_checkout')}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
