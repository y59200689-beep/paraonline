'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, Leaf, SlidersHorizontal, FlaskConical, Heart, Sprout, Droplet, RefreshCw } from 'lucide-react';
import styles from './RoutineDiagnosticIntro.module.css';

interface Props { isRTL: boolean; completed: boolean; onStart: () => void; onView: () => void; onRestart: () => void; }

export function RoutineDiagnosticIntro({ isRTL: ar, completed, onStart, onView, onRestart }: Props) {
  const [preview, setPreview] = useState(0);
  const stages = ar ? ['بشرتك', 'احتياجاتك', 'روتينك'] : ['Votre peau', 'Vos besoins', 'Votre routine'];
  const descriptions = ar ? ['أسئلة بسيطة للتعرف على بشرتك.', 'حددي احتياجاتك وعادات العناية اليومية.', 'اقتراحات مبنية على إجاباتك ومعلومات المنتجات.'] : ['Quelques questions pour mieux connaître votre peau.', 'Précisez vos besoins et vos habitudes de soin.', 'Des suggestions selon vos réponses et les informations produit.'];
  const features = [
    { icon: Leaf, title: ar ? 'أسئلة بسيطة عن بشرتك' : 'Questions simples sur votre peau', text: ar ? 'في بضع دقائق فقط' : 'En quelques minutes seulement' },
    { icon: SlidersHorizontal, title: ar ? 'روتين مخصص حسب إجاباتك' : 'Routine personnalisée selon vos réponses', text: ar ? 'اقتراحات تناسب احتياجاتك' : 'Des recommandations sur mesure' },
    { icon: FlaskConical, title: ar ? 'منتجات مقترحة حسب احتياجاتك' : 'Produits proposés selon vos besoins', text: ar ? 'من العلامات المتوفرة في متجرنا' : 'Parmi les marques disponibles dans notre boutique' },
  ];
  return <div className={styles.card} dir={ar ? 'rtl' : 'ltr'}>
    <div className={styles.copy}>
      <span className={styles.badge}><Sparkles size={17} />{completed ? (ar ? 'روتينك المخصص جاهز' : 'Routine personnalisée prête') : (ar ? 'متاح تشخيص الذكاء الاصطناعي' : 'Diagnostic IA disponible')}</span>
      <h2 className="public-section-title">{ar ? <>اكتشفي روتينك المثالي <em>في 3 خطوات</em></> : <>Découvrez votre routine idéale <em>en 3 étapes</em></>}</h2>
      <p className={styles.intro}>{ar ? 'تأخذ أداتنا بعين الاعتبار نوع بشرتك واحتياجاتها وتعرضك للشمس لاقتراح روتين عناية مخصص.' : 'Notre outil prend en compte votre type de peau, vos besoins et votre exposition au soleil pour vous proposer une routine personnalisée, adaptée à votre peau.'}</p>
      <ul className={styles.features}>{features.map(({ icon: Icon, title, text }) => <li key={title}><span><Icon size={23} strokeWidth={1.5} /></span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul>
      <div className={styles.actions}>
        <button type="button" className={`${styles.start} public-cta`} onClick={completed ? onView : onStart}>{completed ? (ar ? 'عرض روتيني' : 'Voir ma routine') : (ar ? 'بدء تشخيص الروتين' : 'Lancer le diagnostic de routine')}<ArrowRight size={21} /></button>
        {completed && <button type="button" className={styles.restart} onClick={onRestart}><RefreshCw size={15} />{ar ? 'إعادة التشخيص' : 'Refaire le diagnostic'}</button>}
      </div>
      <p className={styles.disclaimer}>{ar ? 'أداة للمساعدة على الاختيار، وليست تشخيصاً طبياً.' : 'Un guide pour vos soins, pas un diagnostic médical.'}</p>
    </div>
    <div className={styles.visual}>
      <div className={styles.scene}>
        <div className={styles.botanical} aria-hidden="true"><i /><i /><i /><span /></div>
        <div className={styles.skin} aria-hidden="true"><strong>{ar ? 'بشرتك' : 'Votre peau'}</strong><small>{ar ? 'ما نوع بشرتك؟' : 'Quel est votre type de peau ?'}</small>{(ar ? ['جافة', 'مختلطة', 'دهنية', 'حساسة'] : ['Sèche', 'Mixte', 'Grasse', 'Sensible']).map((type, i) => <span key={type} data-selected={i === 1}><Droplet size={13} />{type}</span>)}</div>
        <div className={styles.products} aria-hidden="true"><strong>{ar ? 'روتينك' : 'Votre routine'}</strong><small>{ar ? 'عناية تناسب احتياجاتك' : 'Des soins adaptés à vos besoins'}</small><div className={styles.bottles}><i /><i /><i /></div><span /><span /></div>
        <div className={styles.console}>
          <span className={styles.spark}><Sparkles size={48} strokeWidth={1.6} /></span>
          <strong className={styles.consoleTitle}>DERMO IA</strong>
          <p className={styles.consoleSubtitle}>{ar ? 'استبيان مخصص' : 'Questionnaire personnalisé'}</p>
          <span className={styles.rule} />
          <div className={styles.preview} aria-live="polite"><strong>{stages[preview]}</strong><p>{descriptions[preview]}</p></div>
          <div className={styles.dots} role="group" aria-label={ar ? 'استعراض مراحل الاستبيان' : 'Aperçu des étapes du questionnaire'}>{stages.map((stage, index) => <button type="button" key={stage} aria-label={stage} aria-pressed={preview === index} onClick={() => setPreview(index)}><span /></button>)}</div>
        </div>
      </div>
      <div className={styles.assurances}><span><Leaf />{ar ? 'اختيارات مدروسة' : 'Des choix éclairés'}</span><span><Heart />{ar ? 'روتين يناسبك' : 'Une routine adaptée à vous'}</span><span><Sprout />{ar ? 'عادات عناية يومية' : 'Des habitudes au quotidien'}</span></div>
    </div>
  </div>;
}
