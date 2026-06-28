'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ShoppingBag,
  MessageSquare,
  Package,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const TRUST_BADGES = [
  { icon: '🚚', label: 'Livraison Rapide', sub: 'Expédié sous 24h' },
  { icon: '🔒', label: 'Paiement Sécurisé', sub: 'SSL 256-bit' },
  { icon: '↩️', label: 'Retours Faciles', sub: '14 jours garantis' },
];

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isFR = language !== 'AR';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleWhatsApp = () => {
    const storeWhatsApp = settings?.storeWhatsApp || '212660808080';
    const msg = isFR
      ? `Bonjour, je viens de finaliser le paiement pour ma commande #${orderId}. Merci !`
      : `مرحباً، لقد أتممتُ الدفع للطلب #${orderId}. شكراً!`;
    window.open(
      `https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)' }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(16,185,129,0.14) 0%, transparent 70%)',
        }}
      />
      {/* Subtle floating orbs */}
      <div
        className="pointer-events-none absolute w-72 h-72 rounded-full"
        style={{
          top: '-6rem',
          left: '-6rem',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
          animation: 'float 7s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute w-56 h-56 rounded-full"
        style={{
          bottom: '-4rem',
          right: '-4rem',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          animation: 'float 9s ease-in-out infinite reverse',
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ring-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70% { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .pop-in { animation: pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ring-pulse { animation: ring-pulse 2s ease-out 0.6s infinite; }
        .fade-up {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-up.show { opacity: 1; transform: translateY(0); }
      `}</style>

      <div
        className={`relative w-full max-w-md mx-auto text-center fade-up ${visible ? 'show' : ''}`}
        style={{ transitionDelay: '0.05s' }}
      >
        {/* Card */}
        <div
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div
              className="relative pop-in ring-pulse w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}
            >
              <CheckCircle2 className="w-9 h-9" style={{ color: '#10b981' }} />
              <Sparkles
                className="absolute -top-1 -right-1 w-4 h-4"
                style={{ color: '#fbbf24' }}
              />
            </div>
          </div>

          {/* Headline */}
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isFR ? '🎉 Paiement Confirmé !' : '🎉 تم تأكيد الدفع!'}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {isFR
                ? 'Votre transaction a été validée. Notre équipe prépare déjà votre commande avec soin.'
                : 'تمت معالجة الدفع بنجاح. فريقنا يجهّز طلبكِ الآن بكل عناية.'}
            </p>
          </div>

          {/* Order ID pill */}
          {orderId && (
            <div
              className="mb-6 flex items-center justify-center gap-3 p-3 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <Package className="w-4 h-4" style={{ color: '#10b981' }} />
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {isFR ? 'Numéro de commande' : 'رقم الطلب'}
                </p>
                <p className="font-black font-mono text-sm text-white">{orderId}</p>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mb-7">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-[9px] font-bold text-white text-center leading-tight">{badge.label}</span>
                <span className="text-[8px] text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* Star row */}
          <div className="flex items-center justify-center gap-0.5 mb-7">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {isFR ? 'Service 5★ garanti' : 'خدمة 5 نجوم مضمونة'}
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isFR ? 'Continuer les achats' : 'متابعة التسوق'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25d366' }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isFR ? 'Suivre sur WhatsApp' : 'المتابعة عبر واتساب'}</span>
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {isFR
            ? 'Un email de confirmation vous a été envoyé. Conservez votre numéro de commande.'
            : 'تم إرسال بريد تأكيد. احتفظ برقم طلبك.'}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xs">Chargement…</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
