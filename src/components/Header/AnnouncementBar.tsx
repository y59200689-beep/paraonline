import Link from 'next/link';
import { ChevronRight, Gift, Tag, Truck } from 'lucide-react';
import styles from './AnnouncementBar.module.css';

export function AnnouncementBar({ language }: { language: string }) {
  const isArabic = language === 'AR';

  return (
    <aside
      className={styles.bar}
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label={isArabic ? 'عروض بلاك فرايدي' : 'Offres Black Friday'}
    >
      <div className={styles.inner}>
        <span className={styles.campaign}><Tag aria-hidden="true" />{isArabic ? 'بلاك فرايدي' : 'Black Friday'}</span>
        <p className={styles.message}>{isArabic ? 'عروض استثنائية على ماركاتكم المفضلة' : 'Des offres exceptionnelles sur vos marques préférées'}</p>
        <span className={styles.benefit}><Truck aria-hidden="true" />{isArabic ? 'توصيل إلى المنزل' : 'Livraison à domicile'}</span>
        <span className={`${styles.benefit} ${styles.stock}`}><Gift aria-hidden="true" />{isArabic ? 'كميات محدودة' : 'Stocks limités'}</span>
        <Link className={styles.cta} href="/products?category=offers">
          {isArabic ? 'تصفح العروض' : 'Voir les offres'}<ChevronRight aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
