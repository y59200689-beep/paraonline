'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Send, Lock, Check, Truck, MessageCircle, Diamond, Package, Crown, Sparkles, Building2, ArrowRight, ArrowUp, Heart } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';
import styles from './StorefrontFooter.module.css';

export const StorefrontFooter = ({ onDiagnostic }: { onDiagnostic: () => void }) => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const ar = language === 'AR';
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(false);
  const number = String(settings.storeWhatsApp || '212660808080').replace(/\D/g, '');
  const whatsapp = buildWhatsAppUrl(number);
  const socials = (settings.socialLinks || []).filter(item => /^https?:\/\//i.test(item.url));
  const benefits = settings.trustBadges?.length ? settings.trustBadges.map((item, i) => ({
    title: ar ? item.label_ar : item.label_fr, desc: '', icon: [Diamond, Truck, MessageCircle, Lock][i % 4],
  })) : [
    { title: ar ? 'منتجات مختارة' : 'Produits sélectionnés', desc: ar ? 'من علامات تجارية معروفة' : 'Des marques reconnues pour votre bien-être', icon: Diamond },
    { title: ar ? 'التوصيل في المغرب' : 'Livraison au Maroc', desc: ar ? 'حسب المواعيد المعروضة عند الطلب' : 'Selon les délais indiqués à la commande', icon: Truck },
    { title: ar ? 'نصيحة عبر واتساب' : 'Conseil WhatsApp', desc: ar ? 'فريقنا يرافقك في اختياراتك' : 'Notre équipe vous accompagne dans vos choix', icon: MessageCircle },
    { title: ar ? 'دفع آمن' : 'Paiement sécurisé', desc: ar ? 'عبر الإنترنت أو عند التسليم' : 'En ligne ou à la livraison', icon: Lock },
  ];
  const careLinks = [
    ['/products?category=Anti-Âge', 'Anti-Âge & Sérums', 'مقاومة التجاعيد والشباب'],
    ['/products?category=Protection Solaire', 'Protection Solaire', 'الحماية من الشمس'],
    ['/products?category=Anti-Taches', 'Anti-Taches & Éclat', 'علاج التصبغات والبقع'],
    ['/products?category=Hydratation', 'Peaux Sensibles & Acné', 'ترطيب البشرة الجافة'],
    ['/products', 'Soins Corps & Cheveux', 'العناية بالشعر والجسم'],
  ];
  return <footer id="footer" className={styles.footer} dir={ar ? 'rtl' : 'ltr'}>
    <div className={styles.botanical} aria-hidden="true"><i /><i /><i /><i /></div>
    <div className={styles.container}>
      <section className={styles.newsletter} aria-labelledby="footer-newsletter-title">
        <div>
          <span className={styles.badge}><Mail size={17} />{ar ? 'نصائح وعروض حصرية' : 'Conseils et offres exclusives'}</span>
          <h2 id="footer-newsletter-title">{ar ? 'اكتشفي نصائحنا وعروضنا' : <>Recevez <em>nos conseils</em> et <span>nos offres</span></>}</h2>
          <p>{ar ? 'الجمال والعناية والمستجدات في بريدك الإلكتروني.' : 'Beauté, bien-être et nouveautés directement dans votre boîte email.'}</p>
          <p className={styles.secondary}>{ar ? 'انضمي إلى مجتمعنا لتكتشفي جديدنا.' : 'Rejoignez notre communauté et découvrez nos actualités.'}</p>
          <ul className={styles.perks}>{(ar ? ['نصائح الجمال', 'المستجدات', 'عروض حصرية'] : ['Conseils beauté', 'Nouveautés', 'Offres exclusives']).map(label => <li key={label}><Check size={14} />{label}</li>)}</ul>
        </div>
        <form onSubmit={e => { e.preventDefault(); setNotice(true); }} className={styles.form}>
          <p className={styles.signature}>{ar ? 'نعتني بك كل يوم' : 'Prendre soin de vous, chaque jour'}<Heart size={22} strokeWidth={1.3} /></p>
          <div className={styles.formRow}>
            <div className={styles.inputWrap}><Mail size={21} aria-hidden="true" /><label htmlFor="storefront-newsletter-email" className={styles.srOnly}>{ar ? 'البريد الإلكتروني للاشتراك' : 'Adresse e-mail pour la newsletter'}</label><input id="storefront-newsletter-email" type="email" autoComplete="email" required value={email} onChange={e => { setEmail(e.target.value); setNotice(false); }} placeholder={ar ? 'بريدك الإلكتروني…' : 'Votre adresse email…'} /></div>
            <button className="public-cta" type="submit">{ar ? 'اشتركي الآن' : "S’inscrire"}<Send size={20} /></button>
          </div>
          {notice && <p className={styles.notice} role="status">{ar ? 'الاشتراك بالبريد غير متاح حالياً. تواصل معنا عبر واتساب.' : 'L’inscription par email n’est pas encore disponible. Contactez-nous sur WhatsApp pour nos actualités.'}</p>}
          <p className={styles.privacy}><Lock size={15} /><span>{ar ? 'نستخدم بريدك فقط لإرسال الرسائل التي اشتركت فيها.' : 'Votre adresse email est uniquement utilisée pour nos communications.'}<br />{ar ? 'يمكنك إلغاء الاشتراك في أي وقت.' : 'Vous pouvez vous désinscrire à tout moment.'}</span></p>
        </form>
      </section>
      <div className={styles.benefits}>{benefits.map((item, i) => <div className={styles.benefit} key={i}><span className={styles.benefitIcon}><item.icon size={29} strokeWidth={1.6} /></span><div><h3>{item.title}</h3>{item.desc && <p>{item.desc}</p>}</div></div>)}</div>
      <div className={styles.navigation}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label={ar ? 'بارا ديفاين — الرئيسية' : 'Para Divine — Accueil'}><Image src="/para-divine-footer-logo.png" alt="Para Divine" width={1920} height={522} /></Link>
          <p>{ar ? 'متجركم للعناية بالبشرة والجمال في المغرب.' : 'Votre boutique de parapharmacie et de soins beauté au Maroc.'}</p>
          <p className={styles.secondary}>{ar ? 'عناية يومية لجمالك وراحتك.' : 'Des soins pour révéler votre beauté naturelle et prendre soin de vous au quotidien.'}</p>
          {socials.length > 0 && <div className={styles.socials}>{socials.map(item => { return <a key={item.platform} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.platform}><span>{item.platform}</span></a>; })}</div>}
          <p className={styles.brandNote}>{ar ? 'الجمال والثقة كل يوم' : 'Plus qu’une beauté, une confiance au quotidien'} ♡</p>
        </div>
        {settings.footerColumns?.length ? <div className={styles.customColumns}>{settings.footerColumns.map((column, i) => <nav className={styles.column} key={column.id || i} aria-label={ar ? column.heading_ar : column.heading_fr}><h3>{ar ? column.heading_ar : column.heading_fr}</h3><ul>{(column.links || []).map((link, j) => <li key={j}><Link href={link.href}>{ar ? link.label_ar : link.label_fr}</Link></li>)}</ul></nav>)}</div> : <>
          <nav className={styles.column} aria-label={ar ? 'عالم العناية' : 'Univers & soins'}><h3>{ar ? 'عالم العناية' : 'Univers & soins'}</h3><ul>{careLinks.map(([href, fr, arabic]) => <li key={fr}><Link href={href}>{ar ? arabic : fr}</Link></li>)}<li><Link href="/products">{ar ? 'جميع المنتجات' : 'Tous nos soins'} <ArrowRight size={14} /></Link></li></ul></nav>
          <nav className={styles.column} aria-label={ar ? 'خدمات العملاء' : 'Services client'}><h3>{ar ? 'خدمات العملاء' : 'Services client'}</h3><ul>
            <li><Link href="/suivi-commande"><Package size={18} />{ar ? 'تتبع طلبك' : 'Suivi de Commande'}</Link></li>
            <li><Link href="/customer"><Crown size={18} />{ar ? 'حسابي والمكافآت' : 'Espace VIP & Wallet'}</Link></li>
            <li><button type="button" onClick={onDiagnostic}><Sparkles size={18} />{ar ? 'تشخيص البشرة الذكي' : 'Dermo-Diagnostic IA'}</button></li>
            <li><Link href="/a-propos"><Building2 size={18} />{ar ? 'من نحن' : 'À propos de nous'}</Link></li>
          </ul></nav>
          <nav className={styles.column} aria-label={ar ? 'السياسات' : 'Politiques'}><h3>{ar ? 'السياسات' : 'Politiques'}</h3><ul>
            <li><Link href="/politiques/conditions-vente">{ar ? 'الشروط العامة للبيع' : 'Conditions de Vente'}</Link></li>
            <li><Link href="/politiques/confidentialite">{ar ? 'سياسة الخصوصية' : 'Confidentialité & SSL'}</Link></li>
            <li><Link href="/politiques/retours-reclamations">{ar ? 'الإرجاع والشكاوى' : 'Retours & Réclamations'}</Link></li>
          </ul></nav>
        </>}
        <div className={styles.column}><h3>{ar ? 'تواصل معنا' : 'Contactez-nous'}</h3>
          {whatsapp && <a className={styles.whatsapp} href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={28} /><span><strong>WhatsApp</strong><b dir="ltr">+{number}</b></span><ArrowRight size={18} /></a>}
          <p className={styles.hours}>{ar ? 'من الإثنين إلى السبت: 09:00 – 18:00' : 'Du lundi au samedi : 09h00 – 18h00 (GMT+1)'}</p>
          <p className={styles.brandNote}>{ar ? 'فريقنا هنا لمساعدتك' : 'Notre équipe est là pour vous'} ♡</p>
        </div>
      </div>
      <div className={styles.bottom}><p>© {new Date().getFullYear()} Para Divine. {ar ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p><span>{ar ? 'صحة · جمال · راحة · ثقة' : 'Santé · Beauté · Bien-être · Confiance'}</span><button type="button" onClick={() => window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}>{ar ? 'أعلى الصفحة' : 'Haut de page'}<ArrowUp size={17} /></button></div>
    </div>
  </footer>;
};
