'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock3,
  CloudSun,
  Droplet,
  Droplets,
  FlaskConical,
  Heart,
  House,
  Layers3,
  LayoutGrid,
  ListChecks,
  Plus,
  RefreshCw,
  Rows3,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Wind,
  X,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { useProducts } from '@/context/ProductsContext';
import { useUi } from '@/context/UiContext';
import { useSettings } from '@/context/SettingsContext';
import { Product } from '@/lib/data';
import { PoButton } from '@/components/ui/PoButton';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import styles from './SkinDiagnostic.module.css';

interface SkinDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
  experience?: 'client' | 'storefront';
}

type AnswerField =
  | 'skinType'
  | 'concern'
  | 'sensitivity'
  | 'breakoutFrequency'
  | 'sunExposure'
  | 'spfHabit'
  | 'activeTolerance'
  | 'routineDepth';

type DiagnosticAnswers = Record<AnswerField, string>;

type DiagnosticOption = {
  val: string;
  labelFr: string;
  labelAr: string;
  descFr: string;
  descAr: string;
  icon: string;
};

type DiagnosticQuestion = {
  field: AnswerField;
  eyebrowFr: string;
  eyebrowAr: string;
  questionFr: string;
  questionAr: string;
  helperFr: string;
  helperAr: string;
  options: DiagnosticOption[];
};

const QUESTIONS = diagnosticQuestions.questions as DiagnosticQuestion[];
const EMPTY_ANSWERS: DiagnosticAnswers = {
  skinType: '',
  concern: '',
  sensitivity: '',
  breakoutFrequency: '',
  sunExposure: '',
  spfHabit: '',
  activeTolerance: '',
  routineDepth: '',
};

const ICONS: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  'badge-check': BadgeCheck,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  check: Check,
  'circle-dashed': CircleDashed,
  clock: Clock3,
  'cloud-sun': CloudSun,
  droplet: Droplet,
  droplets: Droplets,
  flask: FlaskConical,
  heart: Heart,
  house: House,
  layers: Layers3,
  layout: LayoutGrid,
  list: ListChecks,
  plus: Plus,
  rows: Rows3,
  shield: Shield,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  split: LayoutGrid,
  sprout: Sprout,
  sun: Sun,
  target: Target,
  wind: Wind,
};

const CONCERN_KEYWORDS: Record<string, string[]> = {
  acne: ['acné', 'acne', 'imperfection', 'bouton', 'pore', 'sébum', 'sebum', 'salicylic', 'niacinamide', 'cleansing', 'nettoyant', 'foam', 'gel'],
  spots: ['tache', 'pigment', 'éclat', 'bright', 'vitamin c', 'vitamine c', 'niacinamide', 'serum', 'sérum'],
  wrinkles: ['ride', 'anti-age', 'anti âge', 'fermeté', 'retinol', 'rétinol', 'peptide', 'collagen'],
  dryness: ['hydrat', 'sec', 'dry', 'ceramide', 'céramide', 'hyaluronic', 'baume', 'cream', 'crème', 'lotion'],
  redness: ['rougeur', 'sensible', 'sensitive', 'apais', 'calm', 'centella', 'cica', 'barrière', 'barrier'],
};

const SKIN_TYPE_KEYWORDS: Record<string, string[]> = {
  oily: ['oil control', 'matifiant', 'sébum', 'sebum', 'pore', 'gel', 'foam'],
  dry: ['hydrat', 'nourri', 'baume', 'cream', 'crème', 'ceramide', 'céramide'],
  mixed: ['équilibr', 'balance', 'niacinamide', 'lotion', 'gel'],
  normal: ['daily', 'quotidien', 'gentle', 'doux', 'hydrate'],
};

function productSearchText(product: Product) {
  return [
    product.title,
    product.nameFr,
    product.description,
    product.ingredients,
    product.category,
    product.vendor,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreProduct(product: Product, answers: DiagnosticAnswers) {
  const text = productSearchText(product);
  let score = 0;

  for (const keyword of CONCERN_KEYWORDS[answers.concern] || []) {
    if (text.includes(keyword)) score += 7;
  }
  for (const keyword of SKIN_TYPE_KEYWORDS[answers.skinType] || []) {
    if (text.includes(keyword)) score += 3;
  }

  if (answers.breakoutFrequency === 'frequent' && /salicylic|niacinamide|zinc|gel|foam/.test(text)) score += 4;
  if (answers.sensitivity === 'high' && /centella|cica|apais|gentle|doux|barrier|barrière|ceramide|céramide/.test(text)) score += 7;
  if (answers.sensitivity === 'high' && /peel|aha|bha|retinol|rétinol|glycolic/.test(text)) score -= 8;
  if (answers.activeTolerance === 'beginner' && /peel|aha|bha|retinol|rétinol/.test(text)) score -= 5;
  if (answers.activeTolerance === 'advanced' && /vitamin c|vitamine c|retinol|rétinol|peptide|acid|acide/.test(text)) score += 3;
  if ((answers.spfHabit !== 'daily' || answers.sunExposure === 'intense') && /spf|solaire|sunscreen|sun cream/.test(text)) score += 10;

  return score;
}

function optionFor(field: AnswerField, value: string) {
  return QUESTIONS.find((question) => question.field === field)?.options.find((option) => option.val === value);
}

export const SkinDiagnostic: React.FC<SkinDiagnosticProps> = ({ isOpen, onClose, onOpenCart, experience = 'storefront' }) => {
  const { language } = useTranslation();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { earnPoints } = useLoyalty();
  const { setDiagnostic } = useUi();
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [modalState, setModalState] = useState<'closed' | 'open' | 'closing'>('closed');
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<DiagnosticAnswers>(EMPTY_ANSWERS);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [matchedRule, setMatchedRule] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isRTL = language === 'AR';
  const isClientExperience = experience === 'client';
  const isIntro = questionIndex === -1;
  const isResults = questionIndex === QUESTIONS.length;
  const currentQuestion = !isIntro && !isResults ? QUESTIONS[questionIndex] : null;
  const progress = isIntro ? 0 : isResults ? 100 : Math.round(((questionIndex + 1) / QUESTIONS.length) * 100);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setModalState('open'));
      document.body.style.overflow = 'hidden';
    } else if (isVisible) {
      setModalState('closing');
      const timer = window.setTimeout(() => {
        setModalState('closed');
        setIsVisible(false);
      }, 160);
      document.body.style.overflow = '';
      return () => window.clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isVisible]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');

      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuestionIndex(-1);
      setAnswers(EMPTY_ANSWERS);
      setRecommendedProducts([]);
      setMatchedRule(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const answerSummary = useMemo(() => {
    return (['skinType', 'concern', 'sensitivity', 'routineDepth'] as AnswerField[]).map((field) => ({
      field,
      option: optionFor(field, answers[field]),
    }));
  }, [answers]);

  const buildRecommendations = () => {
    const rules = settings?.diagnosticRules || [];
    let bestRule: any = null;
    let highestRuleScore = -1;

    for (const rule of rules) {
      const matchConcern = rule.concern === 'any' || rule.concern === answers.concern;
      const matchSkinType = rule.skinType === 'any' || rule.skinType === answers.skinType;
      const matchSunExposure = rule.sunExposure === 'any' || rule.sunExposure === answers.sunExposure;
      if (!matchConcern || !matchSkinType || !matchSunExposure) continue;

      const ruleScore = Number(rule.concern !== 'any') + Number(rule.skinType !== 'any') + Number(rule.sunExposure !== 'any');
      if (ruleScore > highestRuleScore) {
        highestRuleScore = ruleScore;
        bestRule = rule;
      }
    }

    setMatchedRule(bestRule);

    const customConcern = (settings.customConcerns || []).find((concern: any) => concern.id === answers.concern);
    const configuredIds: number[] = bestRule?.productIds?.length
      ? bestRule.productIds
      : customConcern?.productIds || [];
    const configured = configuredIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
    const configuredSet = new Set(configured.map((product) => product.id));
    const ranked = products
      .filter((product) => !configuredSet.has(product.id))
      .map((product) => ({ product, score: scoreProduct(product, answers) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
      .map((item) => item.product);
    const routineSize = answers.routineDepth === 'essential' ? 3 : answers.routineDepth === 'complete' ? 5 : 4;
    const recommendations = [...configured, ...ranked].slice(0, routineSize);
    setRecommendedProducts(recommendations.length ? recommendations : products.slice(0, routineSize));

    fetch('/api/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    }).catch((error) => console.error('Diagnostics API sync error:', error));

    setDiagnostic(answers);
    earnPoints(100, 'Diagnostic de peau IA', 'تشخيص البشرة بالذكاء الاصطناعي');
  };

  const handleContinue = () => {
    if (!currentQuestion || !answers[currentQuestion.field]) return;
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    setIsGenerating(true);
    window.setTimeout(() => {
      buildRecommendations();
      setQuestionIndex(QUESTIONS.length);
      setIsGenerating(false);
    }, 360);
  };

  const handleReset = () => {
    setQuestionIndex(-1);
    setAnswers(EMPTY_ANSWERS);
    setRecommendedProducts([]);
    setMatchedRule(null);
  };

  const handleAddRoutineToCart = () => {
    if (!recommendedProducts.length) return;
    recommendedProducts.forEach((product) => addToCart(product, 1, true));
    onClose();
    onOpenCart?.();
  };

  if (!isVisible) return null;

  return (
    <div
      data-app-area="diagnostic"
      className={`t-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6 ${isClientExperience ? styles.backdropClient : 'bg-slate-950/55 backdrop-blur-sm'} ${modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={`t-modal relative flex flex-col overflow-hidden ${isClientExperience ? styles.dialogClient : 'max-h-[92dvh] w-full max-w-[980px] rounded-2xl border border-slate-200 bg-[#fbfdfc] text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.24)]'} ${modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-title"
        aria-describedby="diagnostic-subtitle"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <header className={`flex shrink-0 items-center justify-between gap-4 ${isClientExperience ? styles.headerClient : 'border-b border-slate-200 bg-white px-5 py-4 sm:px-7'}`}>
          {isClientExperience ? (
            <div className="flex min-w-0 items-center gap-3.5">
              <span className={styles.brandIcon} aria-hidden="true"><Sparkles className="h-6 w-6" /></span>
              <div className="min-w-0">
                <h2 id="diagnostic-title" className={styles.brandName}>DERMO•IA</h2>
                <p id="diagnostic-subtitle" className={styles.brandSubtitle}>
                  {isRTL ? 'روتين عناية مخصص بالبشرة' : 'Routine skincare personnalisée'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p id="diagnostic-subtitle" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {isRTL ? 'تقييم شخصي' : 'Évaluation personnalisée'}
                </p>
                <h2 id="diagnostic-title" className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                  {isRTL ? 'روتين البشرة Para Officinal' : 'Diagnostic routine Para Officinal'}
                </h2>
              </div>
            </div>
          )}
          {isClientExperience ? (
            <button type="button" className={styles.closeClient} aria-label={isRTL ? 'إغلاق تشخيص البشرة' : 'Fermer le diagnostic de peau'} onClick={onClose}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <PoButton
              variant="neutral"
              size="md"
              iconOnly
              leftIcon={<X />}
              aria-label={isRTL ? 'إغلاق التشخيص' : 'Fermer le diagnostic'}
              onClick={onClose}
            />
          )}
        </header>

        {!isIntro && !isResults && (
          <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3 sm:px-7">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
              <span className="text-slate-600">
                {isRTL ? `السؤال ${questionIndex + 1} من ${QUESTIONS.length}` : `Question ${questionIndex + 1} sur ${QUESTIONS.length}`}
              </span>
              <span className="font-mono text-emerald-700 tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isIntro && (
            isClientExperience ? (
              <div className={styles.entry}>
                <section className={styles.visual} aria-labelledby="diagnostic-entry-title">
                  <Image
                    src="/images/diagnostic/dermo-research-still-life.png"
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 767px) 100vw, (max-width: 1099px) 40vw, 520px"
                    className={styles.visualImage}
                  />
                  <span className={styles.visualVeil} aria-hidden="true" />
                  <div className={styles.visualCopy}>
                    <h3 id="diagnostic-entry-title" className={styles.visualTitle}>
                      {isRTL ? (
                        <>بشرتك تستحق روتيناً <span className={styles.visualTitleAccent}>مناسباً حقاً.</span></>
                      ) : (
                        <>
                          <span className={styles.visualTitleLine}>Votre peau</span>
                          <span className={styles.visualTitleLine}>mérite une routine</span>
                          <span className={`${styles.visualTitleLine} ${styles.visualTitleAccent}`}>vraiment adaptée.</span>
                        </>
                      )}
                    </h3>
                    <p className={styles.visualDescription}>
                      {isRTL
                        ? 'أجيبي عن بعض الأسئلة حول بشرتك وعاداتك وأهدافك لنقترح روتيناً مبنياً على مراجع جلدية معترف بها.'
                        : 'Répondez à quelques questions sur votre peau, vos habitudes et vos objectifs. Notre moteur de recommandation s’appuie sur des références dermatologiques reconnues.'}
                    </p>
                  </div>
                  <div className={styles.researchCard}>
                    <span className={styles.researchCardIcon} aria-hidden="true"><FlaskConical className="h-5 w-5" /></span>
                    <div>
                      <strong>{isRTL ? 'توصيات مبنية على البحث' : 'Recommandations fondées sur la recherche'}</strong>
                      <p>{isRTL ? 'روتين مبني على إجاباتك ومراجع جلدية معترف بها.' : 'Une routine construite à partir de vos réponses et de références dermatologiques reconnues.'}</p>
                    </div>
                  </div>
                </section>

                <section className={styles.content} aria-label={isRTL ? 'مراحل التقييم' : 'Fonctionnement du diagnostic'}>
                  <span className={styles.eyebrow}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {isRTL ? 'روتينك المخصص في 3 مراحل' : 'VOTRE ROUTINE SUR MESURE EN 3 ÉTAPES'}
                  </span>
                  <h3 className={styles.contentHeading}>{isRTL ? 'كيف يعمل التقييم؟' : 'Comment ça fonctionne ?'}</h3>
                  <p className={styles.contentDescription}>
                    {isRTL
                      ? 'ثمانية أسئلة قصيرة تساعدنا على فهم بشرتك وبناء اقتراح تجميلي واضح وقابل للتطبيق.'
                      : 'Huit questions courtes nous permettent de comprendre votre peau et de construire une recommandation claire, réaliste et personnalisée.'}
                  </p>

                  <ol className={styles.journey}>
                    {[
                      {
                        number: '01',
                        icon: ListChecks,
                        tone: styles.stepMint,
                        title: isRTL ? 'أجيبي عن الاستبيان' : 'Répondez au questionnaire',
                        description: isRTL ? 'أسئلة بسيطة حول نوع بشرتك واهتماماتك وروتينك الحالي وأهدافك.' : 'Quelques questions simples sur votre type de peau, vos préoccupations, votre routine actuelle et vos objectifs.',
                        time: isRTL ? '2–3 دقائق' : '2–3 min',
                      },
                      {
                        number: '02',
                        icon: FlaskConical,
                        tone: styles.stepBlue,
                        title: isRTL ? 'تحليل مخصص' : 'Analyse personnalisée',
                        description: isRTL ? 'تُحلل إجاباتك وفق معايير جلدية وتوصيات مستمدة من المراجع العلمية.' : 'Vos réponses sont analysées selon des critères dermatologiques et des recommandations issues de la littérature scientifique.',
                        time: isRTL ? 'بضع ثوانٍ' : 'Quelques secondes',
                      },
                      {
                        number: '03',
                        icon: Sprout,
                        tone: styles.stepAmber,
                        title: isRTL ? 'احصلي على روتينك' : 'Recevez votre routine',
                        description: isRTL ? 'اكتشفي الخطوات والمكونات والمنتجات الأنسب لاحتياجاتك مع نصائح استعمال واضحة.' : 'Découvrez les étapes, actifs et produits les plus adaptés à vos besoins, avec des conseils d’utilisation clairs.',
                        time: isRTL ? 'فوري' : 'Immédiat',
                      },
                    ].map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <li key={step.number} className={`${styles.step} ${step.tone}`}>
                          <span className={styles.stepIcon} aria-hidden="true">
                            <StepIcon className="h-6 w-6" />
                            <span className={styles.stepNumber}>{step.number}</span>
                          </span>
                          <div className={styles.stepCopy}>
                            <strong>{step.title}</strong>
                            <p>{step.description}</p>
                          </div>
                          <span className={styles.timeBadge}><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{step.time}</span>
                        </li>
                      );
                    })}
                  </ol>

                  <button type="button" className={styles.cta} onClick={() => setQuestionIndex(0)}>
                    <span className={styles.ctaIcon} aria-hidden="true"><Sparkles className="h-5 w-5" /></span>
                    <span>
                      <span className={styles.ctaLabel}>{isRTL ? 'ابدئي تشخيص بشرتك' : 'COMMENCER MON DIAGNOSTIC'}</span>
                      <span className={styles.ctaSubline}>{isRTL ? 'مجاني • بدون صورة • حوالي 3 دقائق' : 'Gratuit • Sans photo • Environ 3 minutes'}</span>
                    </span>
                    <span className={styles.ctaArrow} aria-hidden="true">{isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}</span>
                  </button>
                  <p className={styles.privacy}><ShieldCheck className="h-4 w-4" aria-hidden="true" />{isRTL ? 'تبقى إجاباتك سرية وتُستخدم فقط لتخصيص روتينك.' : 'Vos réponses restent confidentielles et servent uniquement à personnaliser votre routine.'}</p>
                </section>

                <div className={styles.trustStrip} aria-label={isRTL ? 'مزايا التشخيص' : 'Garanties du diagnostic'}>
                  {[
                    [CheckCircle2, isRTL ? 'استبيان سريع' : 'Questionnaire rapide', isRTL ? 'بضع دقائق فقط' : 'Quelques minutes seulement'],
                    [FlaskConical, isRTL ? 'مقاربة قائمة على البحث' : 'Approche fondée sur la recherche', isRTL ? 'مراجع جلدية معترف بها' : 'Références dermatologiques reconnues'],
                    [Sprout, isRTL ? 'روتين مخصص' : 'Routine personnalisée', isRTL ? 'مناسب لإجاباتك وأهدافك' : 'Adaptée à vos réponses et objectifs'],
                    [ShieldCheck, isRTL ? 'بيانات سرية' : 'Données confidentielles', isRTL ? 'لا حاجة إلى صورة' : 'Aucune photo requise'],
                  ].map(([Icon, title, description]) => {
                    const TrustIcon = Icon as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
                    return (
                      <div key={String(title)} className={styles.trustItem}>
                        <span className={styles.trustIcon} aria-hidden="true"><TrustIcon className="h-4 w-4" /></span>
                        <div><strong>{String(title)}</strong><span>{String(description)}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="grid min-h-[610px] lg:grid-cols-[1.08fr_0.92fr]">
              <div className="flex flex-col justify-between bg-slate-950 px-6 py-8 text-slate-100 sm:px-10 sm:py-10">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    {isRTL ? 'بدون كاميرا أو صورة' : 'Sans caméra, sans photo'}
                  </span>
                  <h3 className="mt-7 max-w-xl text-3xl font-bold leading-[1.12] tracking-[-0.035em] text-slate-50 sm:text-4xl">
                    {isRTL ? 'روتين أدق، مبني على ما تحتاجه بشرتك فعلاً.' : 'Une routine plus juste, construite autour de votre peau.'}
                  </h3>
                  <p className="mt-5 max-w-[58ch] text-sm leading-6 text-slate-300 sm:text-[15px]">
                    {isRTL
                      ? 'ثمانية أسئلة قصيرة تساعدنا على فهم نوع البشرة، حساسيتها، أولوياتها وعادات الحماية اليومية.'
                      : 'Huit questions courtes nous aident à comprendre votre type de peau, sa tolérance, vos priorités et vos habitudes de protection.'}
                  </p>
                </div>

                <div className="mt-10 border-t border-slate-800 pt-6">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong className="block text-lg text-slate-50">8</strong><span className="text-xs text-slate-400">{isRTL ? 'أسئلة' : 'questions'}</span></div>
                    <div><strong className="block text-lg text-slate-50">2 min</strong><span className="text-xs text-slate-400">{isRTL ? 'تقريباً' : 'environ'}</span></div>
                    <div><strong className="block text-lg text-slate-50">0</strong><span className="text-xs text-slate-400">{isRTL ? 'صور مطلوبة' : 'photo requise'}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {isRTL ? 'ما سنأخذه بعين الاعتبار' : 'Ce que nous allons prendre en compte'}
                </p>
                <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                  {[
                    [Droplets, isRTL ? 'طبيعة البشرة وراحتها' : 'Nature et confort de la peau'],
                    [Target, isRTL ? 'الهدف الرئيسي' : 'Priorité principale'],
                    [ShieldCheck, isRTL ? 'الحساسية وتحمل المكونات' : 'Sensibilité et tolérance des actifs'],
                    [Sun, isRTL ? 'التعرض والحماية من الشمس' : 'Exposition et protection solaire'],
                    [ListChecks, isRTL ? 'روتين واقعي يمكنك اتباعه' : 'Un rythme de routine réaliste'],
                  ].map(([Icon, label]) => {
                    const ItemIcon = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={String(label)} className="flex items-center gap-3 py-3.5 text-sm font-medium text-slate-700">
                        <ItemIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{String(label)}</span>
                      </div>
                    );
                  })}
                </div>
                <PoButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-7"
                  rightIcon={isRTL ? <ArrowLeft /> : <ArrowRight />}
                  onClick={() => setQuestionIndex(0)}
                >
                  {isRTL ? 'بدء التقييم' : 'Commencer le diagnostic'}
                </PoButton>
                <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
                  {isRTL ? 'هذه توصيات تجميلية ولا تستبدل استشارة طبيب الجلد.' : 'Ces conseils cosmétiques ne remplacent pas l’avis d’un dermatologue.'}
                </p>
              </div>
            </div>
            )
          )}

          {currentQuestion && (
            <div className="grid min-h-[570px] lg:grid-cols-[250px_1fr]">
              <aside className="hidden border-e border-slate-200 bg-slate-50/80 p-6 lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {isRTL ? 'مسار التقييم' : 'Votre parcours'}
                </p>
                <ol className="mt-5 space-y-1.5">
                  {QUESTIONS.map((question, index) => {
                    const complete = Boolean(answers[question.field]);
                    const active = index === questionIndex;
                    return (
                      <li key={question.field} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium ${active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : complete ? 'text-emerald-700' : 'text-slate-500'}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${complete ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <span className="truncate">{isRTL ? question.eyebrowAr : question.eyebrowFr}</span>
                      </li>
                    );
                  })}
                </ol>
              </aside>

              <main key={currentQuestion.field} className="animate-in fade-in slide-in-from-right-2 px-5 py-7 duration-200 sm:px-8 sm:py-9">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {isRTL ? currentQuestion.eyebrowAr : currentQuestion.eyebrowFr}
                </p>
                <h3 className="mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[30px]">
                  {isRTL ? currentQuestion.questionAr : currentQuestion.questionFr}
                </h3>
                <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-500">
                  {isRTL ? currentQuestion.helperAr : currentQuestion.helperFr}
                </p>

                <div className={`mt-7 grid gap-3 ${currentQuestion.options.length >= 4 ? 'sm:grid-cols-2' : ''}`} role="radiogroup" aria-label={isRTL ? currentQuestion.questionAr : currentQuestion.questionFr}>
                  {currentQuestion.options.map((option) => {
                    const selected = answers[currentQuestion.field] === option.val;
                    const OptionIcon = ICONS[option.icon] || Sparkles;
                    return (
                      <button
                        key={option.val}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.field]: option.val }))}
                        className={`group flex min-h-[92px] items-start gap-3 rounded-xl border p-4 text-start transition-[border-color,background-color,box-shadow,transform] duration-160 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${selected ? 'border-emerald-500 bg-emerald-50/80 shadow-[0_4px_12px_rgba(5,150,105,0.10)]' : 'border-slate-200 bg-white hover:-translate-y-px hover:border-slate-300 hover:shadow-sm'}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${selected ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:text-slate-700'}`}>
                          <OptionIcon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block text-sm font-semibold text-slate-900">{isRTL ? option.labelAr : option.labelFr}</strong>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{isRTL ? option.descAr : option.descFr}</span>
                        </span>
                        <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'}`}>
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </main>
            </div>
          )}

          {isResults && (
            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {isRTL ? 'اكتمل ملف بشرتك' : 'Votre profil est prêt'}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                    {matchedRule
                      ? (isRTL && matchedRule.titleAr ? matchedRule.titleAr : matchedRule.titleFr)
                      : (isRTL ? 'روتين مختار حسب إجاباتك' : 'Une routine sélectionnée selon vos réponses')}
                  </h3>
                  <p className="mt-3 max-w-[65ch] text-sm leading-6 text-slate-600">
                    {matchedRule
                      ? (isRTL && matchedRule.descriptionAr ? matchedRule.descriptionAr : matchedRule.descriptionFr)
                      : (isRTL
                        ? 'تم ترتيب المنتجات حسب أولويتك، تحمل بشرتك، تعرضك للشمس والروتين الذي يمكنك اتباعه.'
                        : 'Les produits sont classés selon votre priorité, la tolérance de votre peau, votre exposition et le rythme que vous pourrez suivre.')}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  {isRTL ? 'خصم الروتين مطبق: 15٪' : 'Avantage routine appliqué : -15 %'}
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
                <aside>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{isRTL ? 'ملخص الملف' : 'Synthèse du profil'}</p>
                  <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                    {answerSummary.map(({ field, option }) => option && (
                      <div key={field} className="py-3">
                        <dt className="text-[11px] text-slate-500">{isRTL ? QUESTIONS.find((question) => question.field === field)?.eyebrowAr : QUESTIONS.find((question) => question.field === field)?.eyebrowFr}</dt>
                        <dd className="mt-1 text-sm font-semibold text-slate-900">{isRTL ? option.labelAr : option.labelFr}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-200">
                    {isRTL ? 'هذا ملف تجميلي مبني على إجاباتك، وليس تشخيصاً طبياً.' : 'Profil cosmétique basé sur vos réponses, il ne constitue pas un diagnostic médical.'}
                  </p>
                </aside>

                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{isRTL ? 'روتينك المقترح' : 'Routine recommandée'}</p>
                      <h4 className="mt-1 text-lg font-bold text-slate-950">{isRTL ? `${recommendedProducts.length} خطوات مختارة` : `${recommendedProducts.length} étapes sélectionnées`}</h4>
                    </div>
                  </div>
                  <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {recommendedProducts.map((product, index) => (
                      <article key={product.id} className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950 font-mono text-xs font-bold text-white">{index + 1}</span>
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <Image src={product.image} alt={product.title} width={56} height={56} unoptimized className="h-full w-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{product.vendor || product.category}</p>
                        </div>
                        <div className="shrink-0 text-end">
                          <strong className="block text-sm text-emerald-700">{Math.round(product.price * 0.85)} DH</strong>
                          <span className="text-[11px] text-slate-400 line-through">{product.price} DH</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isIntro && (
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <PoButton
              variant="neutral"
              size="md"
              leftIcon={isResults ? <RefreshCw /> : (isRTL ? <ArrowRight /> : <ArrowLeft />)}
              onClick={isResults ? handleReset : () => setQuestionIndex((current) => Math.max(-1, current - 1))}
            >
              {isResults ? (isRTL ? 'إعادة التقييم' : 'Recommencer') : (isRTL ? 'السابق' : 'Précédent')}
            </PoButton>

            {currentQuestion && (
              <PoButton
                variant="primary"
                size="md"
                loading={isGenerating}
                loadingText={isRTL ? 'جارٍ إعداد الروتين...' : 'Création de la routine...'}
                disabled={!answers[currentQuestion.field]}
                rightIcon={isRTL ? <ArrowLeft /> : <ArrowRight />}
                onClick={handleContinue}
              >
                {questionIndex === QUESTIONS.length - 1
                  ? (isRTL ? 'عرض روتيني' : 'Voir ma routine')
                  : (isRTL ? 'متابعة' : 'Continuer')}
              </PoButton>
            )}

            {isResults && (
              <PoButton
                variant="primary"
                size="lg"
                leftIcon={<Plus />}
                disabled={!recommendedProducts.length}
                onClick={handleAddRoutineToCart}
              >
                {isRTL ? 'إضافة الروتين إلى السلة' : 'Ajouter la routine au panier'}
              </PoButton>
            )}
          </footer>
        )}
      </section>
    </div>
  );
};
