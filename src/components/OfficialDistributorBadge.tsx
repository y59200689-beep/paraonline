'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { ShieldCheck, Leaf, Diamond, PackageCheck, Truck, ArrowUpRight } from 'lucide-react';
import styles from './OfficialDistributorBadge.module.css';

const brands = ['CERAVE', 'BIODERMA', 'VICHY', 'EUCERIN', 'LA ROCHE-POSAY'];

export const OfficialDistributorBadge: React.FC = () => {
  const { language } = useTranslation();
  const ar = language === 'AR';
  return (
    <section className={styles.section} aria-labelledby="brand-selection-title" dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.decoration} aria-hidden="true"><i /><i /><i /><span /></div>
      <div className={styles.container}>
        <div className={styles.identity}>
          <div className={styles.seal} aria-hidden="true"><ShieldCheck strokeWidth={1.25} /></div>
          <div>
            <span className={styles.eyebrow}><Leaf size={17} aria-hidden="true" />{ar ? 'منتجات مختارة بعناية' : 'Sélection soignée'}</span>
            <h2 id="brand-selection-title" className={styles.title}>{ar ? 'علامات معروفة،' : 'Des marques reconnues,'}<span>{ar ? 'مختارة بعناية' : 'choisies avec soin'}</span></h2>
            <span className={styles.accent} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.details}>
          <p>{ar ? 'نختار منتجات العناية بالبشرة والـ K-Beauty من موردين وعلامات تجارية معروفة.' : 'Nous sélectionnons des soins et produits K-Beauty auprès de fournisseurs et de marques reconnus.'}</p>
          <ul className={styles.benefits}>
            <li><span aria-hidden="true"><Diamond size={24} strokeWidth={1.5} /></span>{ar ? 'علامات معروفة' : 'Marques reconnues'}</li>
            <li><span aria-hidden="true"><PackageCheck size={24} strokeWidth={1.5} /></span>{ar ? 'تغليف آمن' : 'Emballage soigné'}</li>
            <li><span aria-hidden="true"><Truck size={24} strokeWidth={1.5} /></span><Link href="/suivi-commande">{ar ? 'متابعة الطلب' : 'Suivi de commande'}<ArrowUpRight size={15} aria-hidden="true" /></Link></li>
          </ul>
        </div>
        <div className={styles.selection}>
          <nav className={styles.brands} aria-label={ar ? 'علامات مختارة' : 'Marques sélectionnées'}>
            <h3>{ar ? 'علامات مختارة' : 'Marques sélectionnées'}</h3>
            <span className={styles.accent} aria-hidden="true" />
            <div className={styles.pills}>{brands.map(brand => <Link key={brand} href={'/products?brand=' + encodeURIComponent(brand)} prefetch={false}>{brand}</Link>)}</div>
          </nav>
          <p className={styles.signature}>{ar ? 'بشرة جميلة، وثقة أكبر' : 'Belle peau, meilleure confiance'}</p>
        </div>
      </div>
    </section>
  );
};
