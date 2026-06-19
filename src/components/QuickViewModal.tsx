'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, INGREDIENTS_GLOSSARY } from '../lib/data';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/LanguageContext';
import { X, Star, ShoppingBag, Plus, Minus, Info, ShieldCheck, Sparkles } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { language } = useTranslation();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage'>('desc');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<string | null>(null);
  const [glossaryPosition, setGlossaryPosition] = useState({ top: 0, left: 0 });
  const glossaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setActiveTab('desc');
      setQuantity(1);
      setActiveGlossaryTerm(null);
    }
  }, [product]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (glossaryRef.current && !glossaryRef.current.contains(e.target as Node)) setActiveGlossaryTerm(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => { addToCart(product, quantity); onClose(); };

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
  const hasDiscount = product.comparePrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="modal-container relative w-full max-w-[850px] bg-white border border-border/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all z-40 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {/* Image panel */}
        <div className="w-full md:w-1/2 p-6 bg-muted/30 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-border/40 overflow-y-auto">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-border/40 shadow-sm flex items-center justify-center">
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase z-20">
                -{discountPercent}% OFF
              </span>
            )}
            <img src={activeImage} alt={product.title} className="w-full h-full object-contain p-4 transition-all duration-300" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${activeImage === img ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border/40 hover:border-accent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gold font-black uppercase tracking-widest">{product.vendor}</span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                <span>{product.rating}</span>
                <span className="text-foreground/60 font-medium">({product.reviews} reviews)</span>
              </div>
            </div>

            <h3 className="text-lg md:text-xl font-black font-heading text-primary-dark leading-tight">
              {product.title}
            </h3>

            <div className="flex items-baseline gap-3 border-b border-border/30 pb-4">
              <span className="text-xl font-black text-primary-dark">{product.price.toFixed(2)} DH</span>
              {hasDiscount && <span className="text-sm text-foreground/50 line-through font-bold">{product.comparePrice.toFixed(2)} DH</span>}
            </div>

            {/* Tabs */}
            <div className="space-y-3">
              <div className="flex border-b border-border/40 text-xs font-black uppercase tracking-wider gap-6">
                {(['desc', 'ingredients', 'usage'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-foreground/60 hover:text-primary-dark'}`}
                  >
                    {tab === 'desc' ? (language === 'FR' ? 'Description' : 'الوصف') : tab === 'ingredients' ? (language === 'FR' ? 'Ingrédients' : 'المكونات') : (language === 'FR' ? 'Utilisation' : 'الاستعمال')}
                  </button>
                ))}
              </div>

              <div className="min-h-[120px] max-h-[180px] overflow-y-auto no-scrollbar text-xs leading-relaxed text-slate-700">
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
              </div>
            </div>
          </div>

          {/* Glossary tooltip */}
          {activeGlossaryTerm && INGREDIENTS_GLOSSARY[activeGlossaryTerm] && (
            <div
              ref={glossaryRef}
              className="absolute bg-white border border-gold rounded-2xl shadow-2xl p-4 w-[280px] z-50 space-y-2 animate-fade-in"
              style={{ top: `${glossaryPosition.top}px`, left: `${glossaryPosition.left}px` }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5 font-black text-xs text-primary-dark">
                  <span>{INGREDIENTS_GLOSSARY[activeGlossaryTerm].icon}</span>
                  <span>{language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].name_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].name_ar}</span>
                </div>
                <button onClick={() => setActiveGlossaryTerm(null)} className="cursor-pointer"><X className="w-3 h-3 text-foreground/60" /></button>
              </div>
              <div className="space-y-1.5 text-[10px] leading-relaxed">
                <div>
                  <span className="font-extrabold text-foreground/60 block">{language === 'FR' ? 'Sécurité' : 'مستوى الأمان'}</span>
                  <span className="font-black text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {language === 'FR' ? INGREDIENTS_GLOSSARY[activeGlossaryTerm].safety_fr : INGREDIENTS_GLOSSARY[activeGlossaryTerm].safety_ar}
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-foreground/60 block">{language === 'FR' ? 'Bénéfice' : 'الفائدة'}</span>
                  <span className="font-bold text-gold flex items-center gap-1">
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
            <div className="flex items-center border border-border/40 rounded-xl px-2 bg-muted/30 h-11 shrink-0">
              <button onClick={() => setQuantity(p => Math.max(1, p - 1))} className="p-1.5 text-foreground/60 hover:text-primary-dark cursor-pointer">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3.5 text-xs font-black text-primary-dark min-w-[32px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(p => p + 1)} className="p-1.5 text-foreground/60 hover:text-primary-dark cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 h-11 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'FR' ? 'Ajouter au Panier' : 'إضافة إلى السلة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
