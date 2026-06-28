'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, ShieldCheck, AlertTriangle,
  CreditCard, User, Phone, MapPin, ChevronDown, Search,
  MessageSquare, CheckCircle2, X,
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { MOROCCAN_CITIES } from '@/lib/data';
import { StripeCheckoutForm } from './StripeCheckoutForm';

interface FormFields {
  name: string;
  phone: string;
  address: string;
  city: string;
  note: string;
}

interface CheckoutFormProps {
  language: string;
  isRTL: boolean;
  checkoutSubStep: 'info' | 'delivery' | 'payment';
  setCheckoutSubStep: (s: 'info' | 'delivery' | 'payment') => void;
  setStep: (s: 'cart' | 'checkout') => void;
  formFields: FormFields;
  setFormFields: React.Dispatch<React.SetStateAction<FormFields>>;
  formErrors: Record<string, string>;
  setShippingCity: (city: string) => void;
  isSubmitting: boolean;
  isInitializingStripe: boolean;
  paymentMethod: 'cod' | 'stripe' | 'cmi';
  setPaymentMethod: (m: 'cod' | 'stripe' | 'cmi') => void;
  clientSecret: string;
  setClientSecret: (s: string) => void;
  stripeOrderId: string;
  stripePromise: any;
  total: number;
  onlinePaymentEnabled: boolean;
  testMode: boolean;
  stripeEnabled: boolean;
  cmiEnabled: boolean;
  proceedToDelivery: () => void;
  handleCheckoutSubmit: (e: React.FormEvent) => void;
  handleConfirmOrder: () => void;
  onStripeSuccess: () => void;
  t: (key: string) => string;
}

/* ── Searchable City Combobox ──────────────────────────────────────────── */
interface CityComboboxProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
  isRTL: boolean;
  hasError: boolean;
  placeholder: string;
}

const CityCombobox: React.FC<CityComboboxProps> = ({
  value, onChange, language, isRTL, hasError, placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const isFR = language === 'FR';

  // Filter cities based on query matching either FR or AR label
  const filtered = query.trim().length === 0
    ? MOROCCAN_CITIES
    : MOROCCAN_CITIES.filter(c => {
        const q = query.toLowerCase();
        return (
          c.labelFr.toLowerCase().includes(q) ||
          c.labelAr.includes(query) ||
          c.value.toLowerCase().includes(q)
        );
      });

  // Selected city display label
  const selectedCity = MOROCCAN_CITIES.find(c => c.value === value);
  const displayLabel = selectedCity
    ? (isFR ? selectedCity.labelFr : selectedCity.labelAr)
    : '';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleOpen = () => {
    setOpen(true);
    setQuery('');
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (cityValue: string) => {
    onChange(cityValue);
    setOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`
          w-full flex items-center justify-between px-4 py-3.5 rounded-xl
          bg-white border transition-all duration-200 text-left
          focus:outline-none
          ${hasError
            ? 'border-rose-400/70 ring-2 ring-rose-400/15'
            : open
              ? 'border-[#B09B71] ring-2 ring-[#B09B71]/15 shadow-sm'
              : 'border-[#E5DCC5] hover:border-[#C8B78A]'
          }
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MapPin className={`w-4 h-4 shrink-0 ${value ? 'text-[#B09B71]' : 'text-slate-300'}`} />
          <span className={`text-xs truncate ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
            {displayLabel || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 bg-white border border-[#E5DCC5] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          style={{ maxHeight: '260px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Search input */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-slate-100 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setHighlightedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder={isFR ? 'Rechercher une ville...' : 'ابحث عن مدينة...'}
              className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setHighlightedIndex(-1); inputRef.current?.focus(); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City list */}
          <ul ref={listRef} className="overflow-y-auto overscroll-contain" style={{ maxHeight: '200px' }}>
            {filtered.length === 0 ? (
              <li className="py-6 text-center text-[11px] text-slate-400 font-medium">
                {isFR ? 'Aucune ville trouvée' : 'لا توجد مدينة مطابقة'}
              </li>
            ) : (
              filtered.map((city, idx) => (
                <li
                  key={city.value}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={() => handleSelect(city.value)}
                  className={`
                    flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-100
                    ${highlightedIndex === idx ? 'bg-[#FAF6EE]' : 'hover:bg-slate-50/80'}
                    ${value === city.value ? 'bg-[#FBF7EF]' : ''}
                  `}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[12px] font-semibold ${value === city.value ? 'text-[#B09B71]' : 'text-slate-800'}`}>
                      {city.labelFr}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{city.labelAr}</span>
                  </div>
                  {value === city.value && (
                    <CheckCircle2 className="w-4 h-4 text-[#B09B71] shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ── Premium Field Wrapper ──────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, error, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
      <span className="text-[#B09B71]">{icon}</span>
      <span>{label}</span>
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 mt-0.5">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        {error}
      </span>
    )}
  </div>
);

/* ── Input base class ──────────────────────────────────────────────────── */
const inputClass = (hasError?: boolean) => `
  w-full px-4 py-3.5 bg-white border rounded-xl text-xs text-slate-800
  placeholder:text-slate-400 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.025)]
  focus:outline-none transition-all duration-200
  ${hasError
    ? 'border-rose-400/70 ring-2 ring-rose-400/15'
    : 'border-[#E5DCC5] hover:border-[#C8B78A] focus:border-[#B09B71] focus:ring-2 focus:ring-[#B09B71]/15'
  }
`;

/* ── Step Pill ─────────────────────────────────────────────────────────── */
interface StepPillProps {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}
const StepPill: React.FC<StepPillProps> = ({ number, label, active, done }) => (
  <div className="flex items-center gap-1.5">
    <div className={`
      w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300
      ${done
        ? 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
        : active
          ? 'bg-primary-dark text-white shadow-[0_2px_8px_rgba(26,37,93,0.15)]'
          : 'bg-slate-100 text-slate-400'
      }
    `}>
      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : number}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 ${active ? 'text-primary-dark' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

/* ── Divider ───────────────────────────────────────────────────────────── */
const StepDivider = () => (
  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-slate-100 mx-2" />
);

/* ── Main Component ────────────────────────────────────────────────────── */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  language,
  isRTL,
  checkoutSubStep,
  setCheckoutSubStep,
  setStep,
  formFields,
  setFormFields,
  formErrors,
  setShippingCity,
  isSubmitting,
  isInitializingStripe,
  paymentMethod,
  setPaymentMethod,
  clientSecret,
  setClientSecret,
  stripeOrderId,
  stripePromise,
  total,
  onlinePaymentEnabled,
  testMode,
  stripeEnabled,
  cmiEnabled,
  proceedToDelivery,
  handleCheckoutSubmit,
  handleConfirmOrder,
  onStripeSuccess,
  t,
}) => {
  const isFR = language === 'FR';

  // Steps for indicator
  const steps = onlinePaymentEnabled
    ? [
        { key: 'info', labelFr: 'Coordonnées', labelAr: 'معلوماتكِ', step: 1 },
        { key: 'payment', labelFr: 'Paiement', labelAr: 'الدفع', step: 2 },
      ]
    : [
        { key: 'info', labelFr: 'Coordonnées', labelAr: 'معلوماتكِ', step: 1 },
        { key: 'done', labelFr: 'Confirmation', labelAr: 'التأكيد', step: 2 },
      ];

  const currentStepIndex = checkoutSubStep === 'payment' ? 1 : 0;



  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Step progress indicator ──────────────────────────────────── */}
      <div className="flex items-center justify-between py-3 px-4 bg-slate-50/60 rounded-2xl border border-slate-100">
        <StepPill
          number={1}
          label={isFR ? 'Coordonnées' : 'معلوماتكِ'}
          active={checkoutSubStep === 'info'}
          done={checkoutSubStep === 'payment'}
        />
        <StepDivider />
        {onlinePaymentEnabled ? (
          <StepPill
            number={2}
            label={isFR ? 'Paiement' : 'الدفع'}
            active={checkoutSubStep === 'payment'}
            done={false}
          />
        ) : (
          <StepPill
            number={2}
            label={isFR ? 'Confirmation' : 'التأكيد'}
            active={false}
            done={false}
          />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MERGED STEP: Personal info + Delivery details (single form)
      ══════════════════════════════════════════════════════════════════ */}
      {(checkoutSubStep === 'info' || checkoutSubStep === 'delivery') && (
        <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4" noValidate>

          {/* ── Section header ──────────────────────────── */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-primary-dark/8 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary-dark" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary-dark">
              {isFR ? 'Vos informations de livraison' : 'معلومات التوصيل'}
            </p>
          </div>

          {/* ── Name ──────────────────────────────────────────────────── */}
          <Field
            label={isFR ? 'Nom complet' : 'الاسم الكامل'}
            icon={<User className="w-3.5 h-3.5" />}
            error={formErrors.name}
            required
          >
            <input
              type="text"
              placeholder={isFR ? 'Ex: Khadija Alami' : 'مثال: خديجة العلمي'}
              value={formFields.name}
              onChange={(e) => setFormFields(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass(!!formErrors.name)}
              autoComplete="name"
            />
          </Field>

          {/* ── Phone ─────────────────────────────────────────────────── */}
          <Field
            label={isFR ? 'Téléphone WhatsApp' : 'هاتف واتساب'}
            icon={<Phone className="w-3.5 h-3.5" />}
            error={formErrors.phone}
            required
          >
            <div className="relative">
              <div className={`
                absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5
                pointer-events-none
              `}>
                <span className="text-base leading-none">🇲🇦</span>
                <span className="text-[11px] font-bold text-slate-400">+212</span>
                <div className="w-px h-3.5 bg-slate-200" />
              </div>
              <input
                type="tel"
                placeholder="0661234567"
                value={formFields.phone}
                onChange={(e) => setFormFields(prev => ({ ...prev, phone: e.target.value }))}
                className={`${inputClass(!!formErrors.phone)} pl-[90px]`}
                autoComplete="tel"
                dir="ltr"
              />
            </div>
          </Field>

          {/* ── Separator ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-slate-100" />
            <div className="flex items-center gap-1.5 px-2">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">
                {isFR ? 'Adresse de livraison' : 'عنوان التوصيل'}
              </span>
            </div>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* ── City (searchable) ─────────────────────────────────────── */}
          <Field
            label={isFR ? 'Ville' : 'المدينة'}
            icon={<MapPin className="w-3.5 h-3.5" />}
            error={formErrors.city}
            required
          >
            <CityCombobox
              value={formFields.city}
              onChange={(val) => {
                setFormFields(prev => ({ ...prev, city: val }));
                setShippingCity(val);
              }}
              language={language}
              isRTL={isRTL}
              hasError={!!formErrors.city}
              placeholder={isFR ? 'Choisir votre ville...' : 'اختاري مدينتكِ...'}
            />
          </Field>

          {/* ── Address ───────────────────────────────────────────────── */}
          <Field
            label={isFR ? 'Adresse complète' : 'العنوان الكامل'}
            icon={<MapPin className="w-3.5 h-3.5" />}
            error={formErrors.address}
            required
          >
            <textarea
              rows={2}
              placeholder={
                isFR
                  ? 'Ex: Bd Anfa, Imm. 5, Appt 4, Casablanca'
                  : 'مثال: شارع الأنفا، عمارة 5، شقة 4، الدار البيضاء'
              }
              value={formFields.address}
              onChange={(e) => setFormFields(prev => ({ ...prev, address: e.target.value }))}
              className={`${inputClass(!!formErrors.address)} resize-none leading-relaxed`}
              autoComplete="street-address"
            />
          </Field>

          {/* ── Order note (optional) ─────────────────────────────────── */}
          <Field
            label={isFR ? 'Note de commande (optionnel)' : 'ملاحظة للطلب (اختياري)'}
            icon={<MessageSquare className="w-3.5 h-3.5" />}
          >
            <textarea
              rows={2}
              placeholder={
                isFR
                  ? 'Ex: Laissez le colis au gardien, appeler avant...'
                  : 'مثال: تركوا الطرد عند الحارس، اتصلوا قبل المجيء...'
              }
              value={formFields.note || ''}
              onChange={(e) => setFormFields(prev => ({ ...prev, note: e.target.value }))}
              className={`${inputClass(false)} resize-none leading-relaxed`}
            />
          </Field>

          {/* ── Trust banner ──────────────────────────────────────────── */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-primary-dark/4 border border-primary-dark/8">
            <ShieldCheck className="w-4.5 h-4.5 text-primary-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-[10.5px] font-extrabold text-primary-dark leading-tight">
                {isFR ? 'Livraison Rapide & Sécurisée' : 'توصيل سريع وآمن'}
              </p>
              <p className="text-[9.5px] text-primary-dark/60 font-medium mt-0.5 leading-relaxed">
                {isFR
                  ? 'Expédiés sous 24h · Suivi en temps réel · Retour gratuit sous 7 jours'
                  : 'شحن خلال 24 ساعة · تتبع مباشر · إرجاع مجاني خلال 7 أيام'}
              </p>
            </div>
          </div>

          {/* ── Submit ────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full py-4 mt-1
              bg-gradient-to-r from-primary-dark to-primary
              text-white text-[11px] font-black uppercase tracking-widest
              rounded-2xl shadow-[0_6px_20px_rgba(26,37,93,0.15)]
              hover:shadow-[0_8px_28px_rgba(26,37,93,0.22)]
              hover:-translate-y-0.5 active:scale-[0.98]
              transition-all duration-300
              flex items-center justify-center gap-2
              disabled:opacity-60 disabled:pointer-events-none
            "
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {isFR ? 'Traitement...' : 'جاري المعالجة...'}
              </span>
            ) : (
              <>
                <span>
                  {onlinePaymentEnabled
                    ? (isFR ? 'Continuer vers le paiement' : 'المتابعة للدفع')
                    : t('form_confirm')}
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Back to cart */}
          <button
            type="button"
            onClick={() => { setStep('cart'); setClientSecret(''); }}
            className="w-full py-2.5 text-slate-400 hover:text-slate-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('cart_back')}</span>
          </button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT STEP (unchanged)
      ══════════════════════════════════════════════════════════════════ */}
      {checkoutSubStep === 'payment' && (
        <div className="space-y-4">
          {testMode && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] py-2 px-3 rounded-lg font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isFR ? 'Mode Test (Simulation)' : 'وضع تجريبي / محاكاة'}</span>
            </div>
          )}

          {clientSecret ? (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                {isFR ? 'Saisir les coordonnées de carte' : 'أدخل بيانات البطاقة'}
              </h4>
              {stripePromise && (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, locale: isFR ? 'fr' : 'ar' }}
                >
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    orderId={stripeOrderId}
                    amount={total}
                    onSuccess={onStripeSuccess}
                    onCancel={() => setClientSecret('')}
                    adminTheme="light"
                  />
                </Elements>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-[10.5px] font-black uppercase text-slate-700 block">
                  {isFR ? 'Choisir le mode de paiement' : 'اختر طريقة الدفع'}
                </label>

                {/* Stripe */}
                {stripeEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'stripe'
                        ? 'border-primary bg-primary/5 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold block">
                          {isFR ? 'Payer par Carte Bancaire' : 'الدفع بالبطاقة البنكية'}
                        </span>
                        <span className="text-[9.5px] text-slate-500 block font-light">
                          Visa, Mastercard, AMEX
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'stripe' ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                      {paymentMethod === 'stripe' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )}

                {/* CMI */}
                {cmiEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cmi')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'cmi'
                        ? 'border-primary bg-primary/5 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg shrink-0">🇲🇦</span>
                      <div>
                        <span className="text-xs font-extrabold block">
                          {isFR ? 'Cartes Nationales CMI / CIB' : 'بطاقات CMI / CIB الوطنية'}
                        </span>
                        <span className="text-[9.5px] text-slate-500 block font-light">
                          Cartes bancaires marocaines
                        </span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cmi' ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                      {paymentMethod === 'cmi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )}

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold block">
                        {isFR ? 'Paiement à la Livraison' : 'الدفع عند الاستلام'}
                      </span>
                      <span className="text-[9.5px] text-slate-500 block font-light">
                        {isFR ? 'Payer en espèces au livreur' : 'الدفع نقداً للموزع عند الاستلام'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting || isInitializingStripe}
                  onClick={handleConfirmOrder}
                  className="w-full py-4 bg-gradient-to-r from-primary-dark to-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-[0_6px_20px_rgba(26,37,93,0.15)] hover:shadow-[0_8px_28px_rgba(26,37,93,0.22)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isInitializingStripe ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {isFR ? 'Initialisation...' : 'جاري التحميل...'}
                    </span>
                  ) : (
                    <>
                      <span>{isFR ? 'Confirmer la commande' : 'تأكيد الطلب'}</span>
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutSubStep('info')}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{isFR ? 'Retour' : 'رجوع'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
