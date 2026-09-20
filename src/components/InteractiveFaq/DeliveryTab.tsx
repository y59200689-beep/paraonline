'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { MapPin, Check, Package, Truck, Home, Info, ArrowRight } from 'lucide-react';
import { MOROCCAN_CITIES } from '@/lib/data';
import type { FaqText } from './translations';
import styles from './InteractiveFaq.module.css';
import { useSettings } from '@/context/SettingsContext';
import { calculateShippingFee, FREE_SHIPPING_SUBTOTAL_DH } from '@/lib/pricing';
import { formatPriceDH } from '@/lib/format-price';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';

export const DeliveryTab: React.FC<{ text: FaqText; language: string; isRTL: boolean }> = ({ text, language, isRTL }) => {
  const [city, setCity] = useState(MOROCCAN_CITIES.find(c => c.value.toLowerCase() === 'casablanca')?.value || MOROCCAN_CITIES[0]?.value || '');
  const cityName = MOROCCAN_CITIES.find(c => c.value === city);
  const { settings } = useSettings();
  const delivery = settings.deliverySettings;
  const cityLower = city.toLowerCase();
  const rule = cityLower ? delivery?.cityRules?.find(r => r.city.trim() && (cityLower.includes(r.city.toLowerCase()) || r.city.toLowerCase().includes(cityLower))) : undefined;
  const daysMin = rule?.daysMin ?? delivery?.defaultDaysMin;
  const daysMax = rule?.daysMax ?? delivery?.defaultDaysMax;
  const hasEstimate = typeof daysMin === 'number' && typeof daysMax === 'number' && daysMin >= 0 && daysMax >= daysMin;
  const support = buildWhatsAppUrl(settings.storeWhatsApp || '212660808080') || '#footer';
  const steps = [
    { icon: Check, title: text.delStep1, sub: isRTL ? 'تأكيد طلبك' : 'Votre commande est confirmée' },
    { icon: Package, title: text.delStep2, sub: text.delLabLabel },
    { icon: Truck, title: text.delStep3, sub: isRTL ? 'الطرد في الطريق' : 'Votre colis est en route' },
    { icon: Home, title: text.delStep4, sub: isRTL ? 'إلى العنوان المحدد' : 'À l’adresse indiquée' },
  ];
  return <div className={styles.delivery}>
    <div><label htmlFor="faq-city">{text.delCityLabel}</label><div className={styles.selectWrap}><MapPin size={19} /><select id="faq-city" aria-describedby="faq-delivery-estimate" value={city} onChange={e => setCity(e.target.value)}>{MOROCCAN_CITIES.map(c => <option key={c.value} value={c.value}>{language === 'FR' ? c.labelFr : c.labelAr}</option>)}<option value="">{isRTL ? 'مدينتي غير موجودة' : 'Ma ville n’est pas dans la liste'}</option></select></div></div>
    <div id="faq-delivery-estimate" className={styles.estimate} role="status" aria-live="polite" aria-atomic="true">
      <h4>{cityName ? (isRTL ? `تقدير التوصيل إلى ${cityName.labelAr}` : `Estimation pour ${cityName.labelFr}`) : (isRTL ? 'لنؤكد عنوانك معاً' : 'Vérifions votre adresse ensemble')}</h4>
      {cityName ? <>
        <dl className={styles.estimateDetails}>
          <div><dt>{isRTL ? 'رسوم التوصيل' : 'Frais de livraison'}</dt><dd>{formatPriceDH(calculateShippingFee(0, city, settings))}</dd></div>
          <div><dt>{isRTL ? 'المدة التقديرية' : 'Délai indicatif'}</dt><dd>{hasEstimate ? `${daysMin}–${daysMax} ${isRTL ? 'أيام' : 'jours'}` : (isRTL ? 'يؤكدها فريقنا' : 'À confirmer avec notre équipe')}</dd></div>
        </dl>
        <p>{isRTL ? `التوصيل مجاني ابتداءً من ${formatPriceDH(FREE_SHIPPING_SUBTOTAL_DH)} من المنتجات.` : `Livraison offerte dès ${formatPriceDH(FREE_SHIPPING_SUBTOTAL_DH)} de produits.`}</p>
        <p>{isRTL ? 'المدة تقديرية حسب تأكيد الطلب وتوفر المنتجات وأيام عمل الناقل. يتم تأكيد العنوان والمبلغ النهائي قبل إتمام الطلب.' : 'Le délai reste indicatif : il dépend de la confirmation, du stock et des jours de passage du transporteur. L’adresse et le montant final sont confirmés avant validation.'}</p>
      </> : <p>{isRTL ? 'تواصل معنا للتحقق من التغطية والمدة والرسوم لعنوانك.' : 'Contactez-nous pour vérifier la couverture, le délai et les frais pour votre adresse.'}</p>}
      <a href={support} target="_blank" rel="noopener noreferrer" className={styles.policy}>{isRTL ? 'تأكيد التوصيل إلى عنواني' : 'Confirmer la livraison à mon adresse'}<ArrowRight size={16} /></a>
    </div>
    <div className={styles.notice}><span className={styles.icon}><Package size={23} /></span><div><strong>{text.delNoticeTitle}</strong><p>{text.delNoticeDesc}</p></div></div>
    <div className={styles.journey}><h4>{isRTL ? 'مراحل التوصيل' : 'Suivi de votre livraison'}</h4><p>{isRTL ? 'من التأكيد إلى الاستلام، هذه هي المراحل.' : 'De la validation à la réception, voici les différentes étapes.'}</p><ol className={styles.steps}>{steps.map(({ icon: Icon, title, sub }) => <li key={title}><span className={styles.icon}><Icon size={24} /></span><strong>{title}</strong><p>{sub}</p></li>)}</ol></div>
    <div className={styles.deliveryNote}><Info size={20} /><p role="status">{isRTL ? 'يتم تأكيد مدة التوصيل والتكلفة قبل إتمام الطلب' : 'Délai et frais confirmés avant validation'}{cityName ? ' · ' + (isRTL ? cityName.labelAr : cityName.labelFr) : ''}.</p><Link href="/politiques/conditions-vente">{isRTL ? 'شروط التوصيل' : 'Conditions de livraison'}<ArrowRight size={16} /></Link></div>
  </div>;
};
