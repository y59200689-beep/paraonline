'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { Truck, Package, CreditCard, MessageSquare, ArrowRight, ChevronRight, FileText, FlaskConical, BookOpen, Heart, Headphones, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { buildWhatsAppUrl } from '@/lib/whatsapp-link';
import { translations } from './InteractiveFaq/translations';
import { DeliveryTab } from './InteractiveFaq/DeliveryTab';
import { ReturnsTab } from './InteractiveFaq/ReturnsTab';
import { PaymentsTab } from './InteractiveFaq/PaymentsTab';
import styles from './InteractiveFaq/InteractiveFaq.module.css';

export const InteractiveFaq: React.FC = () => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const ar = language === 'AR';
  const text = translations[ar ? 'AR' : 'FR'];
  const [active, setActive] = useState(0);
  const [question, setQuestion] = useState<number | null>(null);
  const support = buildWhatsAppUrl(settings.storeWhatsApp || '212660808080') || '#footer';
  const topics = [
    { icon: Truck, title: text.tabDelivery, sub: ar ? 'المناطق وتتبع الشحن' : 'Délais, zones et suivi', heading: text.delTitle, desc: ar ? 'اختر مدينتك وتعرف على مراحل توصيل طلبك. يتم تأكيد المدة والتكلفة قبل إتمام الطلب.' : 'Sélectionnez votre ville et découvrez les étapes de votre livraison. Le délai et les frais sont confirmés avant validation.' },
    { icon: Package, title: text.tabReturns, sub: ar ? 'الاستبدال والاسترجاع' : 'Échanges et remboursements', heading: text.retTitle, desc: text.retDesc },
    { icon: CreditCard, title: text.tabPayments, sub: ar ? 'وسائل الدفع' : 'Moyens de paiement', heading: text.payTitle, desc: text.payDesc },
    { icon: FileText, title: ar ? 'الطلب' : 'Commande', sub: ar ? 'التتبع والتعديل' : 'Suivi et modification', heading: ar ? 'متابعة طلبك' : 'Votre commande, étape par étape', desc: ar ? 'تابع طلبك أو تواصل معنا لتعديله.' : 'Consultez votre suivi ou contactez notre équipe pour une modification.' },
    { icon: FlaskConical, title: ar ? 'المنتجات' : 'Produits', sub: ar ? 'التوفر والنصائح' : 'Disponibilité et conseils', heading: ar ? 'مساعدة لاختيار منتجاتك' : 'Un conseil pour choisir vos soins ?', desc: ar ? 'فريقنا يجيب عن أسئلتك حول المنتجات وتوفرها.' : 'Notre équipe vous renseigne sur les références, leur disponibilité et votre routine.' },
  ];
  const questions = ar ? [
    ['ما مدة التوصيل؟', 'تختلف المدة والتكلفة حسب المدينة وتوفر المنتجات، ويتم تأكيدهما قبل إتمام الطلب.'],
    ['هل توصلون إلى مدينتي؟', 'اختر مدينتك في قسم التوصيل. للشروط الدقيقة تواصل مع فريقنا.'],
    ['كيف أتابع طلبي؟', 'افتح صفحة تتبع الطلب وأدخل المعلومات المطلوبة.'],
    ['ماذا أفعل إذا كنت غائباً؟', 'تواصل مع الفريق مع رقم طلبك لترتيب الخطوة التالية.'],
    ['هل يمكن تعديل عنواني؟', 'تواصل معنا في أقرب وقت. يعتمد التعديل على مرحلة تجهيز الطلب.'],
  ] : [
    ['Quels sont les délais de livraison ?', 'Le délai et les frais dépendent de votre ville et de la disponibilité des produits. Ils sont confirmés avant la validation de votre commande.'],
    ['Livrez-vous dans ma ville ?', 'Consultez le sélecteur de ville dans la rubrique Livraison. Notre équipe peut confirmer les conditions pour votre adresse.'],
    ['Comment suivre ma commande ?', 'Ouvrez la page de suivi de commande et renseignez les informations demandées pour consulter son avancement.'],
    ['Que faire en cas d’absence ?', 'Contactez notre équipe avec votre numéro de commande pour organiser la suite de votre livraison.'],
    ['Puis-je modifier mon adresse ?', 'Prévenez-nous dès que possible. La possibilité de modification dépend de l’avancement de votre commande.'],
  ];
  const Icon = topics[active].icon;
  return (
    <section id="interactive-faq-protocol" className={styles.section} dir={ar ? 'rtl' : 'ltr'} aria-labelledby="faq-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.badge}>{text.sectionBadge}</span>
          <h2 id="faq-heading" className="public-section-title">{ar ? 'الأسئلة الشائعة' : text.sectionTitle}</h2>
          <p>{text.sectionDesc}</p>
        </header>
        <div className={styles.layout}>
          <aside className={styles.left}>
            <nav className={styles.topics} aria-label={ar ? 'مواضيع المساعدة' : 'Rubriques d’aide'}>
              {topics.map((topic, i) => {
                const TopicIcon = topic.icon;
                return <button type="button" key={topic.title} className={styles.topic} aria-pressed={active === i} aria-controls="faq-content" onClick={() => setActive(i)}>
                  <span className={styles.icon}><TopicIcon size={23} strokeWidth={1.7} /></span>
                  <span className={styles.number}>0{i + 1}</span>
                  <span className={styles.topicText}><strong>{topic.title}</strong><small>{topic.sub}</small></span>
                  <ChevronRight size={16} className={styles.chevron} />
                </button>;
              })}
            </nav>
            <div className={styles.help}>
              <div className={styles.helpHeading}><MessageSquare size={25} /><div><h3>{ar ? 'تحتاج للمساعدة؟' : 'Besoin d’aide ?'}</h3><p>{text.supDesc}</p></div></div>
              <a className={`${styles.cta} public-cta`} href={support} target={support.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer">{text.supButton}<ArrowRight size={17} /></a>
            </div>
          </aside>
          <div id="faq-content" className={styles.panel} role="region" aria-labelledby="faq-panel-title">
            <div className={styles.panelHeading}><span className={styles.icon}><Icon size={26} strokeWidth={1.6} /></span><div><h3 id="faq-panel-title">{topics[active].heading}</h3><p>{topics[active].desc}</p></div></div>
            <div className={styles.content}>
              <div hidden={active !== 0}><DeliveryTab text={text} language={language} isRTL={ar} /></div>
              {active === 1 && <ReturnsTab text={text} isRTL={ar} support={support} />}
              {active === 2 && <PaymentsTab text={text} isRTL={ar} />}
              {active >= 3 && <div className={styles.guidance}>
                <h4>{ar ? 'كيف يمكننا مساعدتك؟' : active === 3 ? 'Retrouvez les informations de votre commande' : 'Des réponses adaptées à vos besoins'}</h4>
                <p>{ar ? 'أرسل لنا رقم طلبك أو اسم المنتج لنتمكن من مساعدتك.' : active === 3 ? 'Gardez votre numéro de commande à portée de main. Pour changer une adresse ou un article, contactez-nous avant l’expédition.' : 'Envoyez-nous le nom du produit qui vous intéresse. Nous vous aiderons à vérifier sa disponibilité et ses références.'}</p>
                <a className={`${styles.cta} public-cta`} href={active === 3 ? '/suivi-commande' : support}>{ar ? 'متابعة' : active === 3 ? 'Suivre ma commande' : 'Demander un conseil'}<ArrowRight size={17} /></a>
              </div>}
            </div>
            {active === 1 && <Link className={styles.policy} href="/politiques/retours-reclamations">{ar ? 'شروط الإرجاع' : 'Consulter les conditions de retour'}<ArrowRight size={16} /></Link>}
          </div>
          <aside className={styles.right}>
            <div className={styles.popular}>
              <h3><BookOpen size={21} />{ar ? 'أسئلة متكررة' : 'Articles populaires'}</h3>
              {questions.map(([title, answer], i) => <div className={styles.question} key={title}>
                <button type="button" aria-expanded={question === i} aria-controls={'faq-answer-' + i} onClick={() => setQuestion(question === i ? null : i)}>{title}<ChevronRight size={16} /></button>
                <div id={'faq-answer-' + i} hidden={question !== i}><p>{answer}</p>{i === 2 && <Link href="/suivi-commande">{ar ? 'تتبع الطلب' : 'Suivre ma commande'} →</Link>}{i === 1 && <button type="button" onClick={() => { setActive(0); requestAnimationFrame(() => document.getElementById('faq-city')?.focus()); }}>{ar ? 'اختيار المدينة' : 'Choisir ma ville'} →</button>}</div>
              </div>)}
            </div>
            <div className={styles.commitment}>
              <h3><Heart size={21} />{ar ? 'التزامنا' : 'Notre engagement'}</h3>
              {[{ icon: Truck, title: ar ? 'توصيل إلى المنزل' : 'Livraison à domicile', sub: ar ? 'حسب مدينتك' : 'Selon votre ville de destination' }, { icon: ShieldCheck, title: ar ? 'شروط واضحة' : 'Des conditions claires', sub: ar ? 'قبل تأكيد الطلب' : 'Avant de confirmer votre commande' }, { icon: Headphones, title: ar ? 'فريق يستمع إليك' : 'Une équipe à votre écoute', sub: ar ? 'قبل وبعد الطلب' : 'Avant et après votre commande' }].map(item => <div className={styles.promise} key={item.title}><span className={styles.icon}><item.icon size={23} /></span><div><strong>{item.title}</strong><p>{item.sub}</p></div></div>)}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
