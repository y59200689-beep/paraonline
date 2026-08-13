'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ShopShell } from '@/components/ShopShell';
import { useCart } from '@/context/CartContext';
import { useUi } from '@/context/UiContext';
import Link from 'next/link';
import { 
  Clock, 
  Tag, 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  Calendar, 
  Share2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ArticleDetailClientProps {
  article: any;
  initialRecommendedProducts: any[];
}

export default function ArticleDetailClient({ article, initialRecommendedProducts }: ArticleDetailClientProps) {
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { showToast, setSelectedProduct } = useUi();
  const isRTL = language === 'AR';

  const [copied, setCopied] = useState(false);

  // Simple Markdown parser
  const parseMarkdownToReact = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-4" />;
      
      // Headers
      if (cleanLine.startsWith('### ')) {
        return <h3 key={idx} className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 font-heading mt-6 mb-3">{parseBold(cleanLine.slice(4))}</h3>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h2 key={idx} className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-heading mt-8 mb-4">{parseBold(cleanLine.slice(3))}</h2>;
      }
      if (cleanLine.startsWith('# ')) {
        return <h1 key={idx} className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-heading mt-10 mb-5">{parseBold(cleanLine.slice(2))}</h1>;
      }

      // Unordered Lists
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        return (
          <li key={idx} className={`text-slate-600 dark:text-slate-300 list-disc text-sm sm:text-base leading-relaxed py-1 ${isRTL ? 'mr-6 ml-0' : 'ml-6 mr-0'}`}>
            {parseBold(cleanLine.slice(2))}
          </li>
        );
      }

      // Numbered lists
      const numMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className={`text-slate-600 dark:text-slate-300 list-decimal text-sm sm:text-base leading-relaxed py-1 ${isRTL ? 'mr-6 ml-0' : 'ml-6 mr-0'}`}>
            {parseBold(numMatch[2])}
          </li>
        );
      }

      // Blockquotes
      if (cleanLine.startsWith('> ')) {
        return (
          <blockquote key={idx} className={`border-primary pl-4 py-2.5 italic text-slate-500 my-5 text-sm sm:text-base bg-slate-50/50 dark:bg-slate-900/40 rounded-r-lg ${isRTL ? 'border-r-4 border-l-0 pr-4 pl-0' : 'border-l-4'}`}>
            {parseBold(cleanLine.slice(2))}
          </blockquote>
        );
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  // Share action
  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast(isRTL ? "تم نسخ رابط المقال !" : "Lien de l'article copié !", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(isRTL ? "تمت إضافة المنتج إلى السلة !" : "Produit ajouté au panier !", 'success');
  };

  const title = isRTL ? article.title_ar : article.title_fr;
  const content = isRTL ? article.content_ar : article.content_fr;
  const categoryLabel = article.category === 'kbeauty' ? (isRTL ? 'الجمال الكوري' : 'K-Beauty') : (isRTL ? 'العناية بالبشرة' : 'Soin');
  const publicationDate = article.updated_at || article.created_at;
  const dateFormatted = new Date(publicationDate).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <ShopShell>
      <main className="public-page max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-24 relative z-10" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/advice"
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition"
          >
            {isRTL ? (
              <>
                <ArrowLeft className="w-4 h-4 rotate-180 transition group-hover:translate-x-1" />
                <span>العودة للمقالات</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 transition group-hover:-translate-x-1" />
                <span>Retour aux articles</span>
              </>
            )}
          </Link>

          <button
            onClick={handleShare}
            className="p-2 border border-slate-200 hover:border-primary/30 rounded-full hover:bg-slate-50 transition cursor-pointer text-slate-500 hover:text-primary flex items-center justify-center"
            title={isRTL ? 'مشاركة' : 'Partager'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <nav aria-label={isRTL ? 'مسار التنقل' : 'Fil d’Ariane'} className="mb-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[var(--public-action)]">{isRTL ? 'الرئيسية' : 'Accueil'}</Link>
          <span aria-hidden="true">/</span>
          <Link href="/advice" className="hover:text-[var(--public-action)]">{isRTL ? 'النصائح' : 'Conseils'}</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-700" aria-current="page">{title}</span>
        </nav>

        {/* Article Header block */}
        <header className="space-y-6 mb-10 text-center md:text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">
              <Tag className="w-3.5 h-3.5" />
              <span>{categoryLabel}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>{dateFormatted}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4.5xl md:text-5xl font-black text-slate-800 tracking-tight font-heading leading-tight">
            {title}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-1 select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.read_time} min {isRTL ? 'قراءة' : 'de lecture'}</span>
            </span>
            <span className="text-xs text-slate-500">{isRTL ? `تم التحديث ${dateFormatted}` : `Mis à jour le ${dateFormatted}`}</span>
            <span className="text-xs text-slate-500">{isRTL ? 'فريق التحرير' : 'Équipe éditoriale'}</span>
          </div>
        </header>

        {/* Cover image banner */}
        <div className="relative aspect-[16/8] rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200/50 mb-12 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={article.image} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop';
            }}
          />
        </div>

        {/* Article Body Content */}
        <article className="prose prose-slate max-w-none mb-20 bg-white/70 backdrop-blur-md p-6 sm:p-10 md:p-12 border border-slate-200/60 rounded-[32px] shadow-sm">
          {parseMarkdownToReact(content)}
        </article>

        <aside className="public-card mb-14 border-l-4 border-l-[var(--public-action)] p-5 text-sm leading-relaxed text-slate-600" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <p className="font-bold text-slate-900">{isRTL ? 'ملاحظة مهمة' : 'À savoir'}</p>
          <p className="mt-1">{isRTL ? 'هذا المقال يقدم معلومات تجميلية عامة ولا يغني عن استشارة مختص طبي عند الحاجة.' : 'Cet article propose des informations cosmétiques générales. Il ne remplace pas l’avis d’un professionnel de santé.'}</p>
        </aside>

        <section className="public-card mb-14 p-6" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 className="text-base font-bold text-slate-900">{isRTL ? 'المصادر والمراجع' : 'Sources et références'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{isRTL ? 'راجعوا وصف المنتج وقائمة المكونات وتعليمات الاستخدام قبل الاستعمال. المراجع الخاصة بهذا الدليل يتم عرضها عند توفرها.' : 'Consultez toujours la fiche produit, la liste d’ingrédients et les conseils d’utilisation. Les références spécifiques à ce guide sont affichées lorsqu’elles sont disponibles.'}</p>
        </section>

        {/* Recommended products footer scroller */}
        {initialRecommendedProducts.length > 0 && (
          <section className="space-y-8 pt-10 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent anim-badge-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-heading tracking-tight">
                {isRTL ? 'المنتجات الموصى بها في هذا المقال' : 'Produits Recommandés dans ce Guide'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {initialRecommendedProducts.map((p) => {
                const isPromo = p.comparePrice && p.comparePrice > p.price;
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    className="bg-white border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between hover:shadow-md transition duration-300 group cursor-pointer h-full relative"
                  >
                    {/* Badge Promo */}
                    {isPromo && (
                      <span className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-10 bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                        PROMO
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Thumbnail image */}
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.image} 
                          alt={p.name || p.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">
                          {p.vendor}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition">
                          {p.name || p.title}
                        </h4>
                        
                        {/* Star Rating */}
                        {p.reviews > 0 && p.rating > 0 ? <div className="flex items-center gap-1" aria-label={`${p.rating.toFixed(1)} sur 5, ${p.reviews} avis`}>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= Math.round(p.rating) ? 'fill-current' : 'text-slate-200'}`} aria-hidden="true" />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">({p.reviews})</span>
                        </div> : null}
                      </div>
                    </div>

                    {/* Price & Add to Cart footer */}
                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="font-mono">
                        <span className="text-sm font-black text-slate-800">{p.price.toFixed(0)} DH</span>
                        {isPromo && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">{p.comparePrice.toFixed(0)} DH</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, p)}
                        className="p-2 bg-primary hover:bg-accent text-white rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                        title={isRTL ? 'أضف إلى السلة' : 'Ajouter au panier'}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </ShopShell>
  );
}
