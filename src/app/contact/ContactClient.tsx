'use client';

import Link from 'next/link';
import { ArrowRight, Headset, Mail, MessageCircle, Truck } from 'lucide-react';
import { ShopShell } from '@/components/ShopShell';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/context/LanguageContext';
import { buildWhatsAppUrl, formatWhatsAppNumber } from '@/lib/whatsapp-link';
import { SITE_CONTACT_EMAIL } from '@/lib/site-contact';

export function ContactClient() {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const ar = language === 'AR';
  const number = formatWhatsAppNumber(settings.storeWhatsApp || '212660808080');
  const whatsapp = buildWhatsAppUrl(number);

  return (
    <ShopShell>
      <main className="min-h-[70vh] bg-[#FAF9F6] px-4 pb-24 pt-16 text-[#17313b] sm:px-6 lg:px-8 lg:pt-24" dir={ar ? 'rtl' : 'ltr'}>
        <div className="mx-auto w-full">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#123b42] px-6 py-14 text-white shadow-[0_24px_70px_rgba(20,55,61,.15)] sm:px-10 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/10 bg-[#2a929a]/20 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-[#c5eded]"><Headset size={16} /> Para Divine</span>
              <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{ar ? 'تواصلوا معنا' : 'Contactez-nous'}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{ar ? 'فريقنا هنا للإجابة عن أسئلتكم ومرافقتكم قبل الطلب وبعده.' : 'Une question sur un soin, votre commande ou son suivi ? Notre équipe est là pour vous accompagner avant et après votre achat.'}</p>
            </div>
          </div>

          <div className="relative -mt-8 grid gap-5 px-2 md:grid-cols-3 lg:gap-6 lg:px-8">
            <section className="rounded-3xl border border-[#dcebea] bg-white p-6 shadow-[0_18px_45px_rgba(24,62,67,.09)] sm:p-8">
              <div className="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7f5] text-[#238b91]"><MessageCircle size={24} /></div>
              <h2 className="font-heading text-xl font-bold">{ar ? 'تحدثوا مع فريقنا' : 'Parlez à notre équipe'}</h2>
              <p className="mt-3 min-h-20 leading-7 text-slate-600">{ar ? 'للنصائح المتعلقة بالمنتجات ومساعدتكم في اختياراتكم.' : 'Pour un conseil produit ou une aide personnalisée dans vos choix.'}</p>
              {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#b94e60] px-5 font-bold !text-white transition hover:bg-[#a93e51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b94e60]">WhatsApp <ArrowRight size={18} aria-hidden="true" /></a>}
              {number && <p className="mt-4 text-sm font-semibold text-slate-500" dir="ltr">+{number}</p>}
            </section>

            <section className="rounded-3xl border border-[#dcebea] bg-white p-6 shadow-[0_18px_45px_rgba(24,62,67,.09)] sm:p-8">
              <div className="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7f5] text-[#238b91]"><Truck size={24} /></div>
              <h2 className="font-heading text-xl font-bold">{ar ? 'متابعة الطلب' : 'Suivi de commande'}</h2>
              <p className="mt-3 min-h-20 leading-7 text-slate-600">{ar ? 'اطلعوا على حالة طلبكم ومعلومات التوصيل.' : 'Retrouvez l’état de votre commande et les informations de livraison.'}</p>
              <Link href="/suivi-commande" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#2b858d] px-5 font-bold text-[#246f76] transition hover:bg-[#edf8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b858d]">{ar ? 'تتبع الطلب' : 'Suivre ma commande'} <ArrowRight size={18} aria-hidden="true" /></Link>
            </section>

            <section className="rounded-3xl border border-[#dcebea] bg-white p-6 shadow-[0_18px_45px_rgba(24,62,67,.09)] sm:p-8">
              <div className="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f7f5] text-[#238b91]"><Mail size={24} /></div>
              <h2 className="font-heading text-xl font-bold">{ar ? 'راسلونا عبر البريد' : 'Écrivez-nous'}</h2>
              <p className="mt-3 min-h-20 leading-7 text-slate-600">{ar ? 'لأسئلتكم وطلباتكم، يمكنكم مراسلة فريقنا مباشرة.' : 'Pour vos questions ou demandes, écrivez directement à notre équipe.'}</p>
              <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#2b858d] px-5 font-bold text-[#246f76] transition hover:bg-[#edf8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b858d]">{ar ? 'إرسال بريد إلكتروني' : 'Envoyer un e-mail'} <ArrowRight size={18} aria-hidden="true" /></a>
              <p className="mt-4 break-all text-sm font-semibold text-slate-500" dir="ltr">{SITE_CONTACT_EMAIL}</p>
            </section>
          </div>
          <p className="mt-9 text-center text-sm text-slate-500">{ar ? 'من الاثنين إلى السبت: 09:00 – 18:00' : 'Du lundi au samedi : 09h00 – 18h00 (GMT+1)'}</p>
        </div>
      </main>
    </ShopShell>
  );
}
