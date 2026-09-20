'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard } from 'lucide-react';
import type { FaqText } from './translations';
import styles from './InteractiveFaq.module.css';

export function PaymentsTab({ isRTL }: { text: FaqText; isRTL: boolean }) {
  return <div className={styles.guidance}>
    <h4><CreditCard size={22} aria-hidden="true" /> {isRTL ? 'قبل تأكيد طلبك' : 'Avant de confirmer votre commande'}</h4>
    <p>{isRTL ? 'تُعرض وسائل الدفع المتاحة عند إتمام الطلب، مع أسعار المنتجات ورسوم التوصيل والتخفيضات والمجموع النهائي بالدرهم.' : 'Les moyens de paiement disponibles sont présentés à la commande, avec les produits, les frais de livraison, les remises et le total en DH.'}</p>
    <p>{isRTL ? 'إذا اخترت الدفع عند الاستلام، يتم تسديد المبلغ عند تسليم الطلب. لا ترسل بيانات بطاقتك عبر الدردشة أو واتساب.' : 'Si vous choisissez le paiement à la livraison, le règlement se fait à la réception. Ne transmettez jamais vos coordonnées bancaires par chat ou WhatsApp.'}</p>
    <Link className={styles.policy} href="/politiques/conditions-vente">{isRTL ? 'شروط الدفع والبيع' : 'Consulter les conditions de paiement'}<ArrowRight size={17} /></Link>
  </div>;
}
