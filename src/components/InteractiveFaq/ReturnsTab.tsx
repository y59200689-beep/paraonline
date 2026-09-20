'use client';

import type { FaqText } from './translations';
import { ArrowRight } from 'lucide-react';
import styles from './InteractiveFaq.module.css';

export function ReturnsTab({ isRTL, support }: { text: FaqText; isRTL: boolean; support: string }) {
  return <div className={styles.guidance}>
    <h4>{isRTL ? 'تحضير طلب الإرجاع' : 'Préparer votre demande de retour'}</h4>
    <p>{isRTL ? 'جهّز رقم الطلب وتاريخ الاستلام واسم المنتج وسبب الطلب. أضف صوراً إذا كان المنتج تالفاً أو مختلفاً عن طلبك.' : 'Préparez votre numéro de commande, la date de réception, le produit concerné et le motif. Ajoutez des photos si le produit est endommagé ou ne correspond pas à votre commande.'}</p>
    <p>{isRTL ? 'يتحقق فريقنا من الشروط المطبقة ويشرح لك الخطوات قبل إرسال المنتج.' : 'Notre équipe vérifie les conditions applicables et vous indique la marche à suivre avant tout renvoi.'}</p>
    <a className={`${styles.cta} public-cta`} href={support} target="_blank" rel="noopener noreferrer">{isRTL ? 'طلب إرجاع أو الإبلاغ عن مشكلة' : 'Demander un retour ou signaler un problème'}<ArrowRight size={17} /></a>
  </div>;
}
