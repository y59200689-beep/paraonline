'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLoyalty, LoyaltyTier } from '@/context/LoyaltyContext';
import { useTranslation } from '@/context/LanguageContext';
import { X, Award, Coins, ArrowRight, Check, ShieldCheck, Clock, Ticket, Copy } from 'lucide-react';

interface BeautyWalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RewardItem {
  id: string;
  cost: number;
  code: string;
  nameFr: string;
  nameAr: string;
  descFr: string;
  descAr: string;
}

export const BeautyWalletDrawer: React.FC<BeautyWalletDrawerProps> = ({ isOpen, onClose }) => {
  const { language } = useTranslation();
  const {
    points,
    totalEarned,
    tier,
    pointsHistory,
    redeemReward,
    tierMultiplier,
    pointsToNextTier
  } = useLoyalty();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mobile Swipe to Dismiss
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isRTL = language === 'AR';

  useEffect(() => {
    if (!isOpen) {
      setSwipeOffset(0);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const rewards: RewardItem[] = [
    {
      id: 'reward-1',
      cost: 200,
      code: 'FREESHIP',
      nameFr: 'Livraison Gratuite',
      nameAr: 'توصيل مجاني',
      descFr: 'Annule les frais de livraison sur votre prochaine commande.',
      descAr: 'يلغي مصاريف الشحن لطلبكِ القادم بدون حد أدنى.'
    },
    {
      id: 'reward-2',
      cost: 300,
      code: 'BEAUTY10',
      nameFr: 'Bon de Réduction −10%',
      nameAr: 'خصم −10% إضافي',
      descFr: 'Bénéficiez de 10% de réduction immédiate à la caisse.',
      descAr: 'احصلي على خصم 10% فوري عند الدفع عند تأكيد الطلب.'
    },
    {
      id: 'reward-3',
      cost: 500,
      code: 'CLINICAL15',
      nameFr: 'Bon de Réduction −15%',
      nameAr: 'خصم −15% إضافي',
      descFr: 'Bénéficiez de 15% de réduction immédiate à la caisse.',
      descAr: 'احصلي على خصم 15% فوري عند الدفع عند تأكيد الطلب.'
    }
  ];

  const handleRedeem = (reward: RewardItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (points < reward.cost) {
      setErrorMessage(
        language === 'FR' 
          ? `Points insuffisants. Il vous manque ${reward.cost - points} points.` 
          : `نقاط غير كافية. يتبقى لكِ ${reward.cost - points} نقطة.`
      );
      return;
    }

    const success = redeemReward(
      reward.cost, 
      reward.code, 
      `Coupon ${reward.nameFr}`, 
      `كوبون ${reward.nameAr}`
    );

    if (success) {
      setSuccessMessage(
        language === 'FR' 
          ? `Succès ! Code ${reward.code} débloqué. Copiez-le ci-dessous.` 
          : `تم بنجاح! تم فتح الرمز ${reward.code}. انسخيه بالأسفل.`
      );
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get color gradient configurations for the dynamic Loyalty Card
  const getCardStyles = (activeTier: LoyaltyTier) => {
    switch (activeTier) {
      case 'Platinum':
        return {
          bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          text: 'text-slate-100',
          badgeBg: 'bg-slate-700/50 border-slate-500/50 text-slate-200',
          shadow: 'shadow-[0_12px_36px_rgba(15,23,42,0.25)]',
          shadowValue: '0 12px 36px rgba(15,23,42,0.35)',
          label: language === 'FR' ? 'Membre Platinum' : 'عضو بلاتيني'
        };
      case 'Gold':
        return {
          bg: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
          text: 'text-amber-50',
          badgeBg: 'bg-amber-800/40 border-amber-500/50 text-amber-200',
          shadow: 'shadow-[0_12px_36px_rgba(217,119,6,0.25)]',
          shadowValue: '0 12px 36px rgba(217,119,6,0.35)',
          label: language === 'FR' ? 'Membre Gold' : 'عضو ذهبي'
        };
      case 'Silver':
        return {
          bg: 'linear-gradient(135deg, #475569 0%, #64748B 50%, #94A3B8 100%)',
          text: 'text-slate-50',
          badgeBg: 'bg-slate-700/30 border-slate-500/30 text-slate-200',
          shadow: 'shadow-[0_12px_36px_rgba(100,116,139,0.25)]',
          shadowValue: '0 12px 36px rgba(100,116,139,0.35)',
          label: language === 'FR' ? 'Membre Silver' : 'عضو فضي'
        };
      default: // Bronze
        return {
          bg: 'linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)',
          text: 'text-amber-50',
          badgeBg: 'bg-amber-900/30 border-amber-700/30 text-amber-200',
          shadow: 'shadow-[0_12px_36px_rgba(146,64,14,0.2)]',
          shadowValue: '0 12px 36px rgba(146,64,14,0.30)',
          label: language === 'FR' ? 'Membre Bronze' : 'عضو برونزي'
        };
    }
  };

  const cardStyle = getCardStyles(tier);

  // Swipe to dismiss calculations
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    const offset = isRTL ? Math.min(0, diff) : Math.max(0, diff);
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    const totalSwipe = Math.abs(touchCurrentX.current - touchStartX.current);
    const isValidSwipe = isRTL 
      ? (touchCurrentX.current - touchStartX.current < -100) 
      : (touchCurrentX.current - touchStartX.current > 100);

    if (isValidSwipe && totalSwipe > 100) {
      onClose();
    }
    setSwipeOffset(0);
  };

  const getDrawerTransformStyle = () => {
    if (!isOpen) {
      return isRTL ? 'translateX(-100%)' : 'translateX(100%)';
    }
    return `translateX(${swipeOffset}px)`;
  };

  return (
    <div
      className={`fixed inset-0 bg-black/55 z-50 flex justify-end ${
        isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'
      }`}
      style={{ transitionProperty: 'opacity', transitionDuration: isOpen ? '300ms' : '220ms', transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      {/* Drawer Container */}
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
        <div className="py-5 px-6 border-b border-slate-200/40 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-black text-slate-800 leading-none">
              {language === 'FR' ? 'Mon Portefeuille Beauté' : 'محفظة الجمال الخاصة بي'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
            className="w-9 h-9 rounded-full hover:bg-slate-100/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 no-scrollbar">
          
          {/* 1. Dynamic Loyalty Card — fully inline styles to avoid Tailwind v4 arbitrary-value generation failures */}
          <div
            style={{
              width: '100%',
              height: '220px',
              borderRadius: '24px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: cardStyle.bg,
              boxShadow: cardStyle.shadowValue,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {/* Decorative background circles */}
            <div style={{ position: 'absolute', right: '-48px', top: '-48px', width: '192px', height: '192px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: '32px', top: '32px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '-48px', bottom: '-64px', width: '208px', height: '208px', borderRadius: '50%', background: 'rgba(0,0,0,0.10)', pointerEvents: 'none' }} />

            {/* Top Row: Card Title & Tier Stamp */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)', lineHeight: 1 }}>
                  BEAUTY CARD
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginTop: '6px', lineHeight: 1, letterSpacing: '0.04em' }}>
                  {language === 'FR' ? 'Para Officinal S.A' : 'مستحضراتنا الرسمية'}
                </span>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.20)', color: 'rgba(255,255,255,0.90)', whiteSpace: 'nowrap' }}>
                {cardStyle.label}
              </span>
            </div>

            {/* Middle Row: Points Balance */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>
                {language === 'FR' ? 'Solde de Points' : 'رصيد النقاط'}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: 'rgba(255,255,255,0.97)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {points}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>pts</span>
              </div>
            </div>

            {/* Bottom Row: Stats */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>
                  {language === 'FR' ? 'Multiplicateur' : 'مضاعف'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginTop: '2px', lineHeight: 1 }}>
                  {tierMultiplier}×
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>
                  {language === 'FR' ? 'Total Accumulé' : 'مجموع النقاط'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginTop: '2px', lineHeight: 1 }}>
                  {totalEarned} pts
                </span>
              </div>
            </div>
          </div>

          {/* 2. Tier Progress Card */}
          {pointsToNextTier > 0 ? (
            <div className="rounded-2xl border border-slate-200/50 bg-white p-4 flex flex-col gap-3 shadow-sm select-none">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent" />
                  <span>{language === 'FR' ? 'Objectif Prochain Niveau' : 'هدفي للمستوى التالي'}</span>
                </span>
                <span className="text-slate-500 font-extrabold">{pointsToNextTier} pts</span>
              </div>
              
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min((totalEarned / (totalEarned + pointsToNextTier)) * 100, 100)}%`
                  }}
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {language === 'FR'
                  ? `Accumulez encore ${pointsToNextTier} points pour débloquer les avantages exclusifs du niveau supérieur.`
                  : `اكتسبي ${pointsToNextTier} نقطة إضافية لفتح مزايا فئة العضوية التالية.`}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#25d366]/20 bg-[#25d366]/5 p-4 flex gap-3 shadow-sm select-none">
              <ShieldCheck className="w-5 h-5 text-[#25d366] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-black text-[#1e7e34] uppercase tracking-wider">
                  {language === 'FR' ? 'TIER MAXIMUM ALTEINT' : 'وصلتِ للفئة القصوى'}
                </span>
                <p className="text-[10px] text-slate-600 leading-relaxed font-medium mt-0.5">
                  {language === 'FR'
                    ? 'Vous bénéficiez du multiplicateur de points maximal (2x) et de tous les avantages VIP Platinum.'
                    : 'أنتِ تستمتعين حالياً بمضاعف النقاط الأقصى (2x) وجميع مزايا عضوية VIP البلاتينية.'}
                </p>
              </div>
            </div>
          )}

          {/* Error and Success messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[10.5px] font-bold text-rose-500 animate-fade-in text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 bg-[#25d366]/5 border border-[#25d366]/20 rounded-xl text-[10.5px] font-bold text-[#1e7e34] animate-fade-in text-center flex flex-col gap-1.5">
              <span>{successMessage}</span>
            </div>
          )}

          {/* 3. Redeemable Rewards Vouchers */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
              {language === 'FR' ? 'BONS DISPONIBLES A DEBLOQUER' : 'كوبونات متاحة للاسترداد'}
            </span>
            
            <div className="flex flex-col gap-3">
              {rewards.map((reward) => {
                const canRedeem = points >= reward.cost;
                return (
                  <div 
                    key={reward.id}
                    className="bg-white border border-slate-200/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.005)]"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Ticket className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs font-black text-slate-800 leading-tight">
                          {language === 'FR' ? reward.nameFr : reward.nameAr}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                          {language === 'FR' ? reward.descFr : reward.descAr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col gap-3 sm:gap-1.5 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-black text-slate-800 px-2 py-1 bg-slate-100 rounded-lg">
                        {reward.cost} pts
                      </span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer ${
                          canRedeem
                            ? 'bg-primary text-white hover:bg-accent'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {language === 'FR' ? 'Utiliser' : 'استرداد'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Points Transaction History */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
              {language === 'FR' ? 'HISTORIQUE DE TRANSACTIONS' : 'سجل العمليات'}
            </span>

            {pointsHistory.length === 0 ? (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-8 text-center text-xs text-slate-400">
                {language === 'FR' ? 'Aucune transaction enregistrée' : 'لا توجد أي معاملات مسجلة بعد'}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/50 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                {pointsHistory.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                      <div className="min-w-0 text-left">
                        <span className="text-[11px] font-bold text-slate-700 block leading-tight">
                          {language === 'FR' ? tx.descriptionFr : tx.descriptionAr}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {new Date(tx.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'ar-MA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-xs font-black shrink-0 ${
                      tx.amount > 0 ? 'text-accent' : 'text-rose-500'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
