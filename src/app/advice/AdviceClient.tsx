'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { ShopShell } from '@/components/ShopShell';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Tag, Sparkles, AlertCircle } from 'lucide-react';

interface AdviceClientProps {
  initialArticles: any[];
}

export default function AdviceClient({ initialArticles }: AdviceClientProps) {
  const { language } = useTranslation();
  const isRTL = language === 'AR';

  const [category, setCategory] = useState('all');

  const filteredArticles = category === 'all'
    ? initialArticles
    : initialArticles.filter((art) => art.category === category);

  const categories = [
    { id: 'all', labelFr: "Tous les conseils", labelAr: "كل النصائح" },
    { id: 'skincare', labelFr: "Soin de Peau", labelAr: "العناية بالبشرة" },
    { id: 'kbeauty', labelFr: "K-Beauty Coréenne", labelAr: "الجمال الكوري" },
    { id: 'routine', labelFr: "Routine & Conseils", labelAr: "روتين ونصائح" },
  ];

  return (
    <ShopShell>
      {/* Visual background decorations */}
      <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[550px] h-[550px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-8 select-none">
          <Link href="/" className="hover:text-primary transition">
            {isRTL ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-black">
            {isRTL ? 'مجلة العناية والجمال' : 'Conseils & K-Beauty'}
          </span>
        </div>

        {/* Premium Title Section */}
        <div className="max-w-3xl space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-wider text-primary animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRTL ? 'نصائح الخبراء والصيادلة' : 'Conseils Cliniques & K-Beauty'}</span>
          </div>
          <h1 className="text-3.5xl sm:text-5xl font-black text-slate-800 tracking-tight font-heading leading-tight">
            {isRTL 
              ? 'دليلكِ العلمي لبشرة صحية ومشرقة' 
              : 'Votre Guide Clinique pour une Peau Saine & Radieuse'}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
            {isRTL 
              ? 'اكتشفي أسرار روتين العناية الكوري ومكونات مستحضرات الجلد الطبية المعتمدة من قبل أطباء الجلد.' 
              : 'Découvrez les rituels de soin de la K-Beauty et les décryptages d\'actifs dermatologiques rédigés par nos pharmaciens experts.'}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          {categories.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition duration-300 cursor-pointer active:scale-95 border ${
                  isActive 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white/70 border-slate-200/80 text-slate-500 hover:text-slate-850 hover:bg-white'
                }`}
              >
                {isRTL ? cat.labelAr : cat.labelFr}
              </button>
            );
          })}
        </div>

        {/* Articles Feed list */}
        {filteredArticles.length === 0 ? (
          <div className="border border-slate-200/60 rounded-3xl bg-white/70 backdrop-blur-md p-16 text-center max-w-xl mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-heading font-black text-slate-700 text-lg">
              {isRTL ? 'لا توجد مقالات متوفرة' : 'Aucun conseil disponible'}
            </h3>
            <p className="text-slate-400 text-xs">
              {isRTL 
                ? 'لم يتم نشر أي مقال في هذا القسم بعد. يرجى مراجعة الموقع لاحقاً.' 
                : 'Nous rédigeons actuellement de nouveaux guides de soin pour vous. Revenez très bientôt.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => {
              const title = isRTL ? art.title_ar : art.title_fr;
              const summary = isRTL ? art.summary_ar : art.summary_fr;
              const readLabel = isRTL ? 'اقرئي المقال' : 'Lire le guide';

              return (
                <article 
                  key={art.id} 
                  className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_15px_30px_rgba(26,37,93,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                >
                  <div className="p-3">
                    {/* Cover image wrapper */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={art.image} 
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      {/* Read time badge */}
                      <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-white/95 backdrop-blur-md py-1 px-2.5 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1.5 shadow-sm`}>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{art.read_time} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="px-6 pb-6 pt-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Category tag */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{art.category === 'kbeauty' ? 'K-Beauty' : art.category === 'skincare' ? 'Soin' : art.category}</span>
                      </span>

                      {/* Title */}
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary transition-colors duration-300 font-heading">
                        <Link href={`/advice/${art.slug}`} className="focus:outline-none">
                          {title}
                        </Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold line-clamp-3">
                        {summary}
                      </p>
                    </div>

                    {/* CTA Link */}
                    <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                      <Link 
                        href={`/advice/${art.slug}`}
                        className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-primary transition duration-300 flex items-center gap-1.5"
                      >
                        <span>{readLabel}</span>
                        {isRTL ? (
                          <ArrowRight className="w-3.5 h-3.5 rotate-180 transition-transform group-hover:-translate-x-1" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        )}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </ShopShell>
  );
}
