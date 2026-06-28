'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  XCircle,
  ShoppingBag,
  RefreshCw,
  ShieldAlert,
  CreditCard,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const RECOVERY_TIPS_FR = [
  { icon: CreditCard, text: 'Vérifiez les informations de votre carte' },
  { icon: ShieldAlert, text: 'Assurez-vous que votre banque a autorisé le paiement en ligne' },
  { icon: HelpCircle, text: 'Essayez avec une autre carte ou contactez votre banque' },
];
const RECOVERY_TIPS_AR = [
  { icon: CreditCard, text: 'تحقق من بيانات بطاقتك' },
  { icon: ShieldAlert, text: 'تأكد من أن بنكك أجاز الدفع الإلكتروني' },
  { icon: HelpCircle, text: 'جرّب بطاقة أخرى أو تواصل مع بنكك' },
];

function FailurePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isFR = language !== 'AR';
  const [visible, setVisible] = useState(false);
  const tips = isFR ? RECOVERY_TIPS_FR : RECOVERY_TIPS_AR;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    // Navigate back to checkout; the cart should still be intact.
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const storeWhatsApp = settings?.storeWhatsApp || '212660808080';
    const msg = isFR
      ? `Bonjour, j'ai rencontré un problème de paiement pour la commande #${orderId}. Pouvez-vous m'aider ?`
      : `مرحباً، واجهتُ مشكلة في الدفع للطلب #${orderId}. هل يمكنكم مساعدتي؟`;
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
      {/* Radial glow — rose */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute w-72 h-72 rounded-full"
        style={{
          top: '-6rem',
          right: '-6rem',
          background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .pop-in { animation: pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .shake-once { animation: shake 0.5s ease-in-out 0.7s both; }
        .fade-up {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-up.show { opacity: 1; transform: translateY(0); }
      `}</style>

      <div
        className={`relative w-full max-w-md mx-auto text-center fade-up ${visible ? 'show' : ''}`}
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
          {/* Error icon */}
          <div className="flex justify-center mb-6">
            <div
              className="pop-in shake-once w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)' }}
            >
              <XCircle className="w-9 h-9" style={{ color: '#ef4444' }} />
            </div>
          </div>

          {/* Headline */}
          <div className="mb-5 space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isFR ? 'Paiement Refusé' : 'فشل الدفع'}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {isFR
                ? "Votre paiement n'a pas pu être traité. Votre panier est toujours sauvegardé — réessayez en toute sécurité."
                : 'لم نتمكن من معالجة دفعتك. سلّة مشترياتك محفوظة — يمكنك المحاولة مجدداً بأمان.'}
            </p>
          </div>

          {/* Order ID if present */}
          {orderId && (
            <div
              className="mb-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isFR ? 'Référence' : 'المرجع'}:
              </span>
              <span className="font-black font-mono text-sm text-white">{orderId}</span>
            </div>
          )}

          {/* Recovery tips */}
          <div className="mb-7 space-y-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isFR ? 'Que faire ?' : 'ماذا تفعل؟'}
            </p>
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <tip.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>{tip.text}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleRetry}
              className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isFR ? 'Réessayer le paiement' : 'إعادة المحاولة'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25d366' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>{isFR ? 'Besoin d\'aide ? WhatsApp' : 'تحتاج مساعدة؟ واتساب'}</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isFR ? 'Retourner à la boutique' : 'العودة للمتجر'}</span>
            </button>
          </div>
        </div>

        {/* Footer note — cart recovery reassurance */}
        <p className="mt-5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {isFR
            ? '🛒 Votre panier est intact. Aucun montant n\'a été débité de votre compte.'
            : '🛒 سلّتك لا تزال محفوظة. لم يُخصم أي مبلغ من حسابك.'}
        </p>
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xs">Chargement…</div>}>
      <FailurePageContent />
    </Suspense>
  );
}
