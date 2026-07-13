'use client';

import React, { useState } from 'react';
import { useUi } from '@/context/UiContext';
import { useTranslation } from '@/context/LanguageContext';
import { CheckCircle2, Package, MessageSquare, ShoppingBag, Copy, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const OrderSuccessModal: React.FC = () => {
  const {
    isSuccessModalOpen,
    setSuccessModalOpen,
    successOrderId,
    successWhatsappUrl
  } = useUi();

  const { language } = useTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const isRTL = language === 'AR';

  if (!isSuccessModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(successOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (successWhatsappUrl) {
      window.open(successWhatsappUrl, '_blank');
    }
  };

  const handleClose = () => {
    setSuccessModalOpen(false);
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 transform scale-100 animate-scale-pop"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Checkmark animation */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-25" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Titles */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
            {isRTL ? '🎉 تم تأكيد طلبكِ بنجاح!' : '🎉 Commande Confirmée !'}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-2">
            {isRTL 
              ? 'شكراً لثقتكِ بنا. تم تسجيل طلبكِ بنجاح. فريقنا يقوم حالياً بتجهيز شحنتكِ لتسليمها لشركة التوصيل.'
              : 'Merci pour votre confiance. Votre commande a été enregistrée avec succès. Notre équipe s\'occupe de la préparation de votre colis.'}
          </p>
        </div>

        {/* Order Info Panel */}
        {successOrderId && (
          <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {isRTL ? 'رقم الطلب' : 'Référence Commande'}
                </p>
                <p className="font-mono font-bold text-[12.5px] text-slate-800 dark:text-white leading-none mt-0.5">
                  {successOrderId}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Copier le numéro"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {successWhatsappUrl && (
            <button
              onClick={handleWhatsApp}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-0 outline-none"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRTL ? 'إتمام عبر واتساب' : 'Finaliser sur WhatsApp'}</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-0 outline-none"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRTL ? 'متابعة التسوق' : 'متابعة التسوق'}</span>
          </button>
        </div>

        {/* Small Note */}
        <p className="text-center text-[10px] text-slate-400 mt-4 leading-normal">
          {isRTL 
            ? 'ستتلقين مكالمة هاتفية من خدمة العملاء لتأكيد تفاصيل العنوان قبل الشحن.'
            : 'Vous recevrez un appel de confirmation de notre service client avant l\'expédition.'}
        </p>
      </div>
    </div>
  );
};
