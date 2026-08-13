'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  LoaderCircle,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { ShopShell } from '@/components/ShopShell';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/context/LanguageContext';

type CompletionMode = 'success' | 'failure';

type SafeOrder = {
  order_id: string;
  customer_name?: string | null;
  total?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  status?: string | null;
  estimated_delivery?: string | null;
  created_at?: string | null;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; order: SafeOrder; token: string };

const paymentLabels: Record<string, { fr: string; ar: string }> = {
  cod: { fr: 'Paiement à la livraison', ar: 'الدفع عند الاستلام' },
  stripe: { fr: 'Carte bancaire', ar: 'بطاقة بنكية' },
  cmi: { fr: 'Carte bancaire (CMI)', ar: 'بطاقة بنكية (CMI)' },
};

function numericOrderId(orderId: string) {
  const digits = orderId.replace(/\D/g, '');
  return digits || orderId;
}

function estimatedDelivery(order: SafeOrder, isFrench: boolean) {
  if (order.estimated_delivery) {
    const date = new Date(order.estimated_delivery);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(isFrench ? 'fr-MA' : 'ar-MA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
    return order.estimated_delivery;
  }

  const created = order.created_at ? new Date(order.created_at) : new Date();
  const fallback = Number.isNaN(created.getTime()) ? new Date() : created;
  fallback.setDate(fallback.getDate() + 2);
  if (fallback.getDay() === 0) fallback.setDate(fallback.getDate() + 1);
  return fallback.toLocaleDateString(isFrench ? 'fr-MA' : 'ar-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function OrderCompletionClient({
  mode,
  orderId,
  initialToken,
}: {
  mode: CompletionMode;
  orderId: string;
  initialToken: string;
}) {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isFrench = language !== 'AR';
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!orderId) {
      setLoadState({ status: 'missing' });
      return;
    }

    const savedToken =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(`orderTrackingToken:${orderId}`) ||
          localStorage.getItem(`orderTrackingToken:${orderId}`) ||
          ''
        : '';
    const token = initialToken || savedToken;
    if (!token) {
      setLoadState({ status: 'missing' });
      return;
    }

    const controller = new AbortController();
    setLoadState({ status: 'loading' });
    fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || (isFrench ? 'Impossible de vérifier cette commande.' : 'تعذر التحقق من هذا الطلب.'));
        }
        const order = payload.orders?.[0] as SafeOrder | undefined;
        if (!order) {
          setLoadState({ status: 'missing' });
          return;
        }
        setLoadState({ status: 'ready', order, token });
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setLoadState({ status: 'error', message: error?.message || 'Erreur de vérification.' });
      });

    return () => controller.abort();
  }, [initialToken, isFrench, orderId]);

  const order = loadState.status === 'ready' ? loadState.order : null;
  const token = loadState.status === 'ready' ? loadState.token : initialToken;
  const trackingHref = order
    ? `/suivi-commande?order=${encodeURIComponent(order.order_id)}&token=${encodeURIComponent(token)}`
    : '/suivi-commande';
  const whatsappHref = useMemo(() => {
    const number = settings?.storeWhatsApp || '212660808080';
    const message = isFrench
      ? `Bonjour, j’ai besoin d’aide concernant ma commande ${order ? numericOrderId(order.order_id) : orderId}.`
      : `مرحباً، أحتاج إلى مساعدة بخصوص طلبي ${order ? numericOrderId(order.order_id) : orderId}.`;
    return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }, [isFrench, order, orderId, settings?.storeWhatsApp]);

  const isSuccess = mode === 'success';

  return (
    <ShopShell>
      <main className="min-h-[calc(100vh-90px)] bg-[linear-gradient(180deg,#f7faf9_0%,#ffffff_48%,#f7fafc_100%)] px-4 py-10 sm:px-6 sm:py-14">
        <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className={`relative overflow-hidden px-6 py-9 sm:px-10 sm:py-12 ${isSuccess ? 'bg-[#073d32]' : 'bg-[#26161a]'}`}>
              <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_10%,rgba(52,211,153,0.22),transparent_32%),radial-gradient(circle_at_90%_85%,rgba(255,255,255,0.10),transparent_35%)]" />
              <div className="relative">
                <div className={`mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border ${isSuccess ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-200' : 'border-rose-300/30 bg-rose-300/15 text-rose-200'}`}>
                  {isSuccess ? <Check className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                  {isSuccess
                    ? isFrench ? 'Commande enregistrée' : 'تم تسجيل الطلب'
                    : isFrench ? 'Paiement interrompu' : 'توقف الدفع'}
                </p>
                <h1 className="mt-3 max-w-md text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                  {isSuccess
                    ? isFrench ? 'Merci, votre commande est confirmée.' : 'شكراً، تم تأكيد طلبك.'
                    : isFrench ? 'Votre panier est conservé.' : 'تم الاحتفاظ بسلة مشترياتك.'}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
                  {isSuccess
                    ? isFrench
                      ? 'Nous vérifions chaque article avant la préparation. Vous pouvez suivre l’avancement avec votre lien sécurisé.'
                      : 'نتحقق من كل منتج قبل التحضير. يمكنك متابعة التقدم عبر رابطك الآمن.'
                    : isFrench
                      ? 'Aucun nouvel achat n’a été débité depuis cette page. Vérifiez votre moyen de paiement puis réessayez.'
                      : 'لم يتم خصم أي عملية شراء جديدة من هذه الصفحة. تحقق من وسيلة الدفع ثم حاول مجدداً.'}
                </p>
              </div>
            </div>

            <div className="px-5 py-7 sm:px-9 sm:py-10">
              {loadState.status === 'loading' && (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center" role="status">
                  <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    {isFrench ? 'Vérification sécurisée de la commande…' : 'جارٍ التحقق الآمن من الطلب…'}
                  </p>
                </div>
              )}

              {loadState.status === 'missing' && (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <PackageCheck className="h-9 w-9 text-slate-300" />
                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    {isFrench ? 'Référence sécurisée requise' : 'المرجع الآمن مطلوب'}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {isFrench
                      ? 'Ouvrez le lien reçu après votre commande ou utilisez la page de suivi avec votre code sécurisé.'
                      : 'افتح الرابط الذي وصلك بعد الطلب أو استخدم صفحة التتبع مع الرمز الآمن.'}
                  </p>
                  <Link href="/suivi-commande" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
                    <Truck className="h-4 w-4" />
                    {isFrench ? 'Ouvrir le suivi' : 'فتح التتبع'}
                  </Link>
                </div>
              )}

              {loadState.status === 'error' && (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <AlertCircle className="h-9 w-9 text-rose-500" />
                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    {isFrench ? 'Vérification impossible' : 'تعذر التحقق'}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{loadState.message}</p>
                  <button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
                    <RefreshCw className="h-4 w-4" />
                    {isFrench ? 'Réessayer' : 'إعادة المحاولة'}
                  </button>
                </div>
              )}

              {order && (
                <div>
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {isFrench ? 'Numéro de commande' : 'رقم الطلب'}
                      </p>
                      <p className="mt-1 font-mono text-2xl font-black tracking-[-0.03em] text-slate-950">
                        {numericOrderId(order.order_id)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isSuccess ? isFrench ? 'Confirmée' : 'مؤكد' : isFrench ? 'À reprendre' : 'يتطلب المتابعة'}
                    </span>
                  </div>

                  <dl className="grid gap-3 py-5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><PackageCheck className="h-4 w-4" />{isFrench ? 'Client' : 'العميل'}</dt>
                      <dd className="mt-2 truncate text-sm font-bold text-slate-900">{order.customer_name || (isFrench ? 'Client Para Officinal' : 'عميل Para Officinal')}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CreditCard className="h-4 w-4" />{isFrench ? 'Paiement' : 'الدفع'}</dt>
                      <dd className="mt-2 text-sm font-bold text-slate-900">{paymentLabels[order.payment_method || 'cod']?.[isFrench ? 'fr' : 'ar'] || order.payment_method || '—'}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isFrench ? 'Total' : 'الإجمالي'}</dt>
                      <dd className="mt-2 text-xl font-black text-slate-950">{Number(order.total || 0).toFixed(2)} DH</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CalendarDays className="h-4 w-4" />{isFrench ? 'Livraison estimée' : 'التوصيل المتوقع'}</dt>
                      <dd className="mt-2 text-sm font-bold capitalize text-slate-900">{estimatedDelivery(order, isFrench)}</dd>
                    </div>
                  </dl>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Link href={trackingHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,0.20)] hover:bg-emerald-700">
                      <Truck className="h-4 w-4" />
                      {isFrench ? 'Suivre ma commande' : 'تتبع طلبي'}
                    </Link>
                    <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </div>
                  <Link href={isSuccess ? '/products' : '/checkout'} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950">
                    {isSuccess ? <ShoppingBag className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    {isSuccess
                      ? isFrench ? 'Retour à la boutique' : 'العودة إلى المتجر'
                      : isFrench ? 'Reprendre le paiement' : 'متابعة الدفع'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </ShopShell>
  );
}
