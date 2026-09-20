'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Truck, CreditCard, ShieldCheck, MessageSquare, ArrowRight, Leaf, Heart } from 'lucide-react';
import styles from './MoroccoTrustBar.module.css';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';

export const MoroccoTrustBar: React.FC = () => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  
  const storeWhatsApp = settings?.storeWhatsApp || '212660808080';

  const trustItems = [
    {
      id: 'shipping',
      icon: Truck,
      titleFR: 'Livraison au Maroc',
      titleAR: 'التوصيل داخل المغرب',
      descFR: 'Le délai et les frais sont calculés selon votre ville avant la confirmation de la commande.',
      descAR: 'يتم احتساب المدة والتكلفة حسب مدينتك قبل تأكيد الطلب.',
    },
    {
      id: 'cod',
      icon: CreditCard,
      titleFR: 'Paiement à la livraison',
      titleAR: 'الدفع عند الاستلام',
      descFR: 'Réglez votre commande à la réception lorsque cette option est disponible pour votre zone.',
      descAR: 'يمكنك الدفع عند الاستلام عندما تكون هذه الخدمة متاحة في منطقتك.',
    },
    {
      id: 'authenticity',
      icon: ShieldCheck,
      titleFR: 'Origine et traçabilité',
      titleAR: 'المصدر وإمكانية التتبع',
      descFR: 'Notre équipe peut vous renseigner sur la provenance et les références des produits proposés.',
      descAR: 'يمكن لفريقنا تزويدك بمعلومات حول مصدر المنتجات ومراجعها.',
    },
    {
      id: 'whatsapp',
      icon: MessageSquare,
      titleFR: 'Conseil & Support WhatsApp',
      titleAR: 'دعم و استشارة واتساب',
      descFR: 'Contactez notre équipe pour une question sur un produit, une commande ou une livraison.',
      descAR: 'تواصل مع فريقنا لأي سؤال حول منتج أو طلب أو توصيل.',
    },
  ];

  const isArabic = language === 'AR';
  const supportUrl = buildWhatsAppUrl(storeWhatsApp, isArabic ? 'مرحباً، لدي سؤال قبل تأكيد طلبي.' : 'Bonjour, j’ai une question avant de passer commande.') || '#footer';

  return (
    <section className={styles.section} aria-labelledby="purchase-confidence-title" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className={styles.petals} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrow}><Leaf size={18} strokeWidth={1.5} />{isArabic ? 'راحة بالك تهمنا' : 'Votre sérénité compte'}</div>
          <h2 id="purchase-confidence-title" className={styles.title}>
            {isArabic ? 'معلومات واضحة' : 'Des informations claires'}
            <em>{isArabic ? 'قبل إتمام الشراء' : 'avant votre achat'}</em>
          </h2>
          <p className={styles.intro}>{isArabic
            ? 'نعرض الشروط المطبقة قبل تأكيد الطلب، ويمكنك التواصل مباشرة مع فريقنا لأي سؤال.'
            : 'Les conditions applicables sont présentées avant la validation, avec un accès direct à notre équipe si vous avez une question.'}</p>
        </header>
        <div className={styles.note} aria-hidden="true">
          {isArabic ? 'جمال وثقة كل يوم' : <>Plus qu’une beauté,<br />une confiance au quotidien</>}
          <Heart size={22} strokeWidth={1.2} />
        </div>
        <div className={styles.grid}>
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            const external = index > 1 && supportUrl.startsWith('https://wa.me/');
            const href = index < 2 ? '/politiques/conditions-vente' : supportUrl;
            const label = index < 2
              ? (isArabic ? 'عرض الشروط' : 'Voir les conditions')
              : (isArabic ? 'راسلونا' : 'Nous écrire');
            return (
              <a key={item.id} className={styles.card} href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}>
                <span className={styles.icon} data-tone={index % 2 ? 'teal' : 'pink'}><Icon size={29} strokeWidth={1.6} /></span>
                <h3>{isArabic ? item.titleAR : item.titleFR}</h3>
                <p>{isArabic ? item.descAR : item.descFR}</p>
                <span className={styles.footer}>
                  <span className={styles.accent} aria-hidden="true" />
                  <span className={styles.action}>{label}<ArrowRight size={17} aria-hidden="true" /></span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
