'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { X, ShieldCheck, Flame, ShoppingBag, Gift } from 'lucide-react';

interface NotificationItem {
  icon: React.ReactNode;
  textFr: string;
  textAr: string;
  type: 'purchase' | 'stock' | 'diagnostic' | 'shipping';
}

export const ClinicalUrgencyFeed: React.FC = () => {
  const { language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const NOTIFICATIONS: NotificationItem[] = [
    {
      icon: <ShoppingBag className="w-4 h-4 text-primary" />,
      textFr: "Khadija de Rabat vient de commander son Pack Routine Anti-Taches 🛍️",
      textAr: "خديجة من الرباط طلبت للتو باقة الروتين المضاد للبقع 🛍️",
      type: 'purchase'
    },
    {
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      textFr: "Plus que 3 pièces de 'Garnier cooling gel SPF50' en stock à Casablanca 🚨",
      textAr: "متبقي 3 قطع فقط من 'Garnier cooling gel SPF50' في كازابلانكا 🚨",
      type: 'stock'
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      textFr: "Imane de Fès a complété son Diagnostic de Peau Grasse 🧬",
      textAr: "إيمان من فاس أكملت للتو تشخيص البشرة الدهنية 🧬",
      type: 'diagnostic'
    },
    {
      icon: <Gift className="w-4 h-4 text-amber-500" />,
      textFr: "Un cadeau 'Bandeau Spa' débloqué sur la dernière commande à Tanger 🎁",
      textAr: "تم فتح هدية 'رباط شعر السبا' في الطلب الأخير بمدينة طنجة 🎁",
      type: 'shipping'
    },
    {
      icon: <ShoppingBag className="w-4 h-4 text-primary" />,
      textFr: "Fatima de Marrakech a commandé la Mousse Active Nettoyante Anua 🧼",
      textAr: "فاطمة من مراكش طلبت للتو رغوة تنظيف المسام النشطة من أنوا 🧼",
      type: 'purchase'
    },
    {
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      textFr: "Forte demande sur le Sérum Niacinamide TXA d'Anua au dépôt de Rabat ⚡",
      textAr: "طلب مرتفع جداً على سيروم النياسيناميد من أنوا في مستودع الرباط ⚡",
      type: 'stock'
    }
  ];

  useEffect(() => {
    if (isDismissed) return;

    // Initial delay before showing first notification
    const startTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    const interval = setInterval(() => {
      setIsVisible(false);
      // Fluid delay for slide-out transition before loading next item
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
        setIsVisible(true);
      }, 500);
    }, 16000);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = NOTIFICATIONS[currentIndex];
  const isRTL = language === 'AR';

  return (
    <div 
      className={`fixed z-50 max-w-[360px] w-[calc(100%-32px)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-6 opacity-0 pointer-events-none'
      } ${
        isRTL
          ? 'left-4 md:left-auto md:right-6 bottom-20 md:bottom-6'
          : 'left-4 md:left-6 bottom-20 md:bottom-6'
      }`}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="relative bg-white/95 backdrop-blur-md border border-border/50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-start gap-3 select-none">
        
        {/* Verification pulse dot */}
        <div className="relative flex h-2 w-2 shrink-0 mt-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>

        {/* Dynamic Icon Wrapper */}
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
          {current.icon}
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0 pr-6">
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 block">
            {language === 'FR' ? 'Verified Live Activity' : 'نشاط مباشر مؤكد'}
          </span>
          <p className="text-[10.5px] font-bold text-primary-dark leading-relaxed mt-0.5">
            {language === 'FR' ? current.textFr : current.textAr}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => setIsDismissed(true), 500);
          }}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
