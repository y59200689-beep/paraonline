'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Header } from '@/components/Header';
import { useUi } from '@/context/UiContext';
import { CartDrawer } from '@/components/CartDrawer';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { SkinDiagnostic } from '@/components/SkinDiagnostic';
import { ScratchCard } from '@/components/ScratchCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { RoutineBundleDrawer } from '@/components/RoutineBundleDrawer';
import { CompareModal } from '@/components/CompareModal';
import { Product } from '@/lib/data';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PolicySection {
  titleFr: string;
  titleAr: string;
  descFr: string;
  descAr: string;
}

interface PolicyData {
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  icon: React.ReactNode;
  lastUpdatedFr: string;
  lastUpdatedAr: string;
  sections: PolicySection[];
}

const POLICIES_DATA: Record<string, PolicyData> = {
  'conditions-vente': {
    titleFr: 'Conditions Générales de Vente (CGV)',
    titleAr: 'الشروط العامة للبيع',
    subtitleFr: 'Réglementation officielle des commandes, expéditions et transactions Cash-on-Delivery (COD).',
    subtitleAr: 'اللوائح الرسمية للطلبات، الشحنات، والمعاملات عند الدفع والاستلام.',
    icon: <FileText className="w-8 h-8 text-primary" />,
    lastUpdatedFr: 'Dernière mise à jour : 12 Mai 2026',
    lastUpdatedAr: 'آخر تحديث: 12 ماي 2026',
    sections: [
      {
        titleFr: '1. Préambule et Cadre Clinique',
        titleAr: '1. تمهيد وإطار العمل السريري',
        descFr: 'Para Officinal S.A est le distributeur officiel de cosmétiques et produits de parapharmacie certifiés au Maroc. Toutes les transactions effectuées sur ce portail sont soumises à ces termes régulateurs de vente clinique.',
        descAr: 'تعتبر صيدلية Para Officinal S.A الموزع الرسمي المعتمد لمستحضرات التجميل والعناية بالبشرة السريرية في المغرب. تخضع جميع المعاملات على هذا المتجر لشروط البيع التنظيمية المحددة أدناه.'
      },
      {
        titleFr: '2. Validation des Commandes et COD (Paiement à la Livraison)',
        titleAr: '2. تأكيد الطلبات والدفع عند الاستلام',
        descFr: 'Le site fonctionne sous le modèle Cash-on-Delivery (Paiement à la livraison). Toute commande soumise nécessite une validation obligatoire. Notre équipe contactera l\'acheteur par appel téléphonique ou message WhatsApp pour confirmer les informations d\'expédition avant l\'envoi du colis.',
        descAr: 'يعتمد متجرنا نموذج الدفع عند الاستلام (COD). يتطلب كل طلب يتم تقديمه تأكيداً إلزامياً؛ حيث يقوم فريقنا بالتواصل مع المشتري عبر مكالمة هاتفية أو رسالة واتساب لتأكيد بيانات الشحن والمنتجات قبل إرسال الشحنة.'
      },
      {
        titleFr: '3. Tarification, Offres et Monnaies',
        titleAr: '3. الأسعار، العروض والعملة',
        descFr: 'Tous les prix des produits sont affichés en Dirhams Marocains (MAD / DH). Ils incluent les taxes applicables au Maroc. Les réductions offertes (comme les remises suite au diagnostic de peau par IA) sont calculées automatiquement lors du checkout.',
        descAr: 'تعرض جميع أسعار المنتجات بالدرهم المغربي (MAD / DH) وتتضمن الضرائب المعمول بها. تُحتسب التخفيضات المقدمة (مثل خصومات التشخيص الذكي للبشرة) تلقائياً أثناء إتمام عملية الشراء.'
      },
      {
        titleFr: '4. Expédition Rapide et Frais de Livraison',
        titleAr: '4. الشحن السريع ورسوم التوصيل',
        descFr: 'La livraison est gratuite sur l\'ensemble du territoire marocain. Pour la ville de Casablanca, la livraison express est effectuée le jour même sous un délai de 2 à 6 heures. Pour les autres villes du Maroc, le colis est livré sous 24 à 48 heures par notre transporteur partenaire.',
        descAr: 'خدمة التوصيل مجانية بالكامل لجميع أنحاء المغرب. بالنسبة لمدينة الدار البيضاء، يتم التوصيل السريع في نفس اليوم خلال 2 إلى 6 ساعات. أما بالنسبة للمدن المغربية الأخرى، فيتم تسليم الشحنة خلال 24 إلى 48 ساعة عبر شركائنا في خدمات الشحن.'
      },
      {
        titleFr: '5. Droit d\'Annulation et Modification',
        titleAr: '5. حق الإلغاء والتعديل',
        descFr: 'L\'acheteur conserve le droit d\'annuler ou de modifier sa commande sans frais à tout moment avant l\'appel de confirmation ou le départ du colis depuis notre centre de distribution. Une fois expédiée, la commande suit notre politique de retours.',
        descAr: 'يحتفظ المشتري بالحق في إلغاء أو تعديل طلبه مجاناً في أي وقت قبل مكالمة التأكيد أو خروج الشحنة من مركز التوزيع الخاص بنا. بمجرد شحن الطلب، تطبق شروط سياسة الإرجاع.'
      }
    ]
  },
  'confidentialite': {
    titleFr: 'Politique de Confidentialité',
    titleAr: 'سياسة الخصوصية',
    subtitleFr: 'Transparence absolue sur la sécurité de vos données personnelles et résultats cliniques de l\'IA.',
    subtitleAr: 'شفافية مطلقة حول أمان بياناتكِ الشخصية ونتائج تشخيص البشرة بالذكاء الاصطناعي.',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    lastUpdatedFr: 'Dernière mise à jour : 12 Mai 2026',
    lastUpdatedAr: 'آخر تحديث: 12 ماي 2026',
    sections: [
      {
        titleFr: '1. Collecte Intelligente des Données',
        titleAr: '1. جمع البيانات الذكي',
        descFr: 'Nous collectons uniquement les informations indispensables à la gestion de vos livraisons : Nom, Prénom, Numéro WhatsApp, Ville et Adresse. De plus, les données issues de notre Diagnostic Dermatologique IA (Type de peau, préoccupations cutanées) sont stockées pour concevoir des routines sur-mesure.',
        descAr: 'نقوم بجمع المعلومات الأساسية والضرورية فقط لإدارة وتوصيل طلباتكِ: الاسم، اللقب، رقم الواتساب، المدينة، والعنوان. بالإضافة إلى ذلك، يتم حفظ البيانات الناتجة عن تشخيص البشرة بالذكاء الاصطناعي لتصميم روتين علاجي مخصص لبشرتكِ.'
      },
      {
        titleFr: '2. Objectifs du Traitement et Algorithmes IA',
        titleAr: '2. أهداف معالجة البيانات وخوارزميات الذكاء الاصطناعي',
        descFr: 'Vos coordonnées servent exclusivement à la validation téléphonique, au suivi de commande express (COD) et à l\'optimisation de l\'analyse de peau clinique par l\'intelligence artificielle pour vous proposer les actifs les plus ciblés.',
        descAr: 'تستخدم بيانات التواصل الخاصة بكِ حصرياً لتأكيد الطلبات هاتفياً، وتتبع شحن الطرود السريعة، وتحسين دقة تحليل البشرة الذكي لتقديم التوصيات الدقيقة بالمكونات النشطة المناسبة لكِ.'
      },
      {
        titleFr: '3. Sécurité Clinique et Protection des Données',
        titleAr: '3. الأمان الطبي وحماية البيانات',
        descFr: 'Vos données personnelles et médicales ne sont jamais revendues ou partagées avec des tiers à des fins publicitaires. Toutes les connexions sont cryptées de bout en bout et conservées au sein de serveurs hautement sécurisés protégés par pare-feu.',
        descAr: 'لا يتم إطلاقاً بيع أو مشاركة بياناتكِ الشخصية أو الطبية مع أي جهات خارجية لأغراض إعلانية. جميع الاتصالات مشفرة بالكامل ويتم تخزينها في خوادم آمنة للغاية ومحمية بجدران حماية متطورة.'
      },
      {
        titleFr: '4. Vos Droits et Contrôle de vos Informations',
        titleAr: '4. حقوقكِ والتحكم في معلوماتكِ',
        descFr: 'Conformément à la réglementation marocaine en matière de protection des données, vous disposez d\'un droit d\'accès, de modification ou de suppression totale de vos informations personnelles et historique de diagnostic. Contactez-nous simplement sur WhatsApp.',
        descAr: 'وفقاً للقوانين المغربية لحماية البيانات، لكِ الحق الكامل في الوصول إلى معلوماتكِ الشخصية وتعديلها أو طلب حذفها نهائياً مع تاريخ التشخيص الخاص بكِ. يمكنكِ القيام بذلكِ ببساطة بمراسلتنا عبر الواتساب.'
      }
    ]
  },
  'retours-reclamations': {
    titleFr: 'Retours & Réclamations',
    titleAr: 'الإرجاع والشكاوى',
    subtitleFr: 'Modalités de retour sous 7 jours pour préserver la sécurité de vos soins dermatologiques.',
    subtitleAr: 'شروط الإرجاع خلال 7 أيام لضمان سلامة مستحضراتكِ الجلدية الطبية.',
    icon: <RefreshCw className="w-8 h-8 text-primary" />,
    lastUpdatedFr: 'Dernière mise à jour : 12 Mai 2026',
    lastUpdatedAr: 'آخر تحديث: 12 ماي 2026',
    sections: [
      {
        titleFr: '1. Droit de Rétractation de 7 Jours',
        titleAr: '1. حق التراجع خلال 7 أيام',
        descFr: 'Vous disposez d\'un délai légal de 7 jours après réception de votre commande COD pour demander un retour. Pour être éligible, le produit cosmétique doit être rigoureusement intact, non ouvert et conservé dans son film plastique d\'origine scellé pour des raisons évidentes de sécurité clinique et d\'hygiène.',
        descAr: 'لديكِ الحق في طلب إرجاع المنتجات خلال 7 أيام من تاريخ استلام الطلب. لكي يتم قبول المرتجع، يجب أن يكون المستحضر سليماً بالكامل، غير مفتوح، وفي غلافه البلاستيكي الأصلي المغلق، وذلك لأسباب تتعلق بالسلامة الصحية والنظافة السريرية.'
      },
      {
        titleFr: '2. Produit Non Conforme ou Défectueux',
        titleAr: '2. المنتجات التالفة أو غير المطابقة',
        descFr: 'Dans le cas exceptionnel d\'un produit défectueux à l\'ouverture ou d\'une non-conformité de la commande (erreur de flacon), nous procédons à l\'échange immédiat ou au remboursement intégral sans aucun frais supplémentaire. Le transporteur récupérera le colis à votre domicile gratuitement.',
        descAr: 'في حالة استلام مستحضر تالف أو غير مطابق لطلبكِ (خطأ في المنتج)، نقوم فوراً باستبدال المنتج أو استرداد كامل المبلغ دون أي تكلفة إضافية. وسيقوم مندوب الشحن باستلام المنتج من منزلكِ مجاناً.'
      },
      {
        titleFr: '3. Procédure Simplifiée par WhatsApp',
        titleAr: '3. خطوات الإرجاع المبسطة عبر الواتساب',
        descFr: 'Pour initier un retour ou déposer une réclamation, envoyez une photo de votre produit scellé avec votre numéro de commande à notre support client sur WhatsApp. Notre équipe traitera votre demande sous 24 heures.',
        descAr: 'لبدء عملية الإرجاع أو تقديم شكوى، يرجى إرسال صورة للمنتج وهو مغلق مع رقم الطلب إلى خدمة العملاء لدينا عبر الواتساب. وسيقوم فريقنا بمعالجة طلبكِ خلال 24 ساعة.'
      }
    ]
  }
};

interface PolicyClientProps {
  slug: string;
}

export const PolicyClient: React.FC<PolicyClientProps> = ({ slug }) => {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const { wishlistCount } = useWishlist();
  const { isCartOpen, setIsCartOpen } = useCart();
  const {
    isWishlistOpen, setWishlistOpen,
    isDiagnosticOpen, setDiagnosticOpen,
    isScratchCardOpen, setScratchCardOpen,
    selectedProduct, setSelectedProduct
  } = useUi();
  
  // Overlay States
  const [isBundleDrawerOpen, setIsBundleDrawerOpen] = useState(false);

  const isRTL = language === 'AR';

  // Fallback to conditions-vente if the slug is not matching
  const currentSlug = POLICIES_DATA[slug] ? slug : 'conditions-vente';
  const policy = POLICIES_DATA[currentSlug];

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Film grain/noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] mix-blend-overlay" />

      {/* Header */}
      <Header />

      {/* Main Section */}
      <main className="flex-1 section-ivory aurora-bg pt-32 pb-24 relative overflow-hidden">
        
        {/* Soft Ambient Background Orbs */}
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] rounded-full glow-orb glow-orb-teal opacity-25 animate-float-slow" />
        <div className="absolute bottom-[15%] right-[-5%] w-[550px] h-[550px] rounded-full glow-orb glow-orb-gold opacity-20 animate-float-slow" />
        <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] rounded-full glow-orb glow-orb-indigo opacity-15" />

        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-12 select-none">
            <Link href="/" className="hover:text-primary transition-colors duration-300">
              {isRTL ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight className={`w-3 h-3 text-slate-300 ${isRTL ? 'rotate-180' : ''}`} strokeWidth={2} />
            <span className="text-slate-600 font-black">
              {isRTL ? policy.titleAr : policy.titleFr}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] items-start gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:sticky lg:top-36 space-y-4 shrink-0 z-20">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-5">
                {isRTL ? 'الوثائق القانونية' : 'Documents Légaux'}
              </span>
              <nav className="flex flex-col gap-3.5">
                {Object.keys(POLICIES_DATA).map((key) => {
                  const isActive = currentSlug === key;
                  const item = POLICIES_DATA[key];
                  return (
                    <Link
                      key={key}
                      href={`/politiques/${key}`}
                      className={`group w-full rounded-[18px] p-[2px] transition-all duration-500 active:scale-[0.98] cursor-pointer block ${
                        isActive 
                          ? 'bg-gradient-to-tr from-accent/20 via-primary/10 to-gold/20 shadow-[0_8px_24px_rgba(13,148,136,0.06)]' 
                          : 'bg-transparent hover:bg-slate-200/30'
                      }`}
                    >
                      <div 
                        className={`rounded-[16px] p-4 flex items-center gap-3.5 border transition-all duration-300 ${
                          isActive
                            ? 'bg-white border-slate-200/50 text-primary-dark font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)]'
                            : 'bg-white/50 border-slate-100/50 text-slate-500 group-hover:bg-white/80 group-hover:border-slate-200/60'
                        }`}
                        style={{ 
                          direction: isRTL ? 'rtl' : 'ltr', 
                          textAlign: isRTL ? 'right' : 'left' 
                        }}
                      >
                        <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                          isActive 
                            ? 'bg-accent/5 border-accent/10 text-accent' 
                            : 'bg-slate-50/80 border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                        }`}>
                          {React.cloneElement(item.icon as React.ReactElement<{ strokeWidth?: number; className?: string }>, { strokeWidth: 1.25, className: 'w-5 h-5' })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[13px] leading-snug truncate tracking-tight font-medium">
                            {isRTL ? item.titleAr : item.titleFr}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                            {isRTL ? 'تصفح الوثيقة' : 'Consulter'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Help Box with Double-Bezel */}
              <div className="bezel-outer bg-gradient-to-tr from-accent/5 via-white/40 to-gold/5 border-slate-200/40 p-[3px] rounded-3xl mt-8 shadow-[var(--shadow-md)]">
                <div className="bezel-inner rounded-[21px] bg-white/85 p-6 border border-slate-100/40 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none" />
                  
                  <div className="w-9 h-9 rounded-[12px] bg-accent/5 border border-accent/10 flex items-center justify-center text-accent mb-4">
                    <HelpCircle className="w-5 h-5" strokeWidth={1.25} />
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-1 font-heading">
                    {isRTL ? 'هل لديكِ سؤال؟' : 'Besoin d\'assistance ?'}
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed mb-5">
                    {isRTL 
                      ? 'فريق الدعم الفني والصيادلة لدينا متواجدون لمساعدتكِ فوراً.' 
                      : 'Nos pharmaciens conseils sont à votre entière disposition.'}
                  </p>
                  
                  {/* Button-in-Button Trailing Icon CTA */}
                  <a
                    href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                    className="group w-full py-3 bg-primary text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl flex items-center justify-between px-4 shadow-[var(--shadow-glow-teal)] hover:bg-accent active:scale-[0.97] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{isRTL ? 'راصلينا الآن' : 'Contact Direct'}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all duration-300">
                      {isRTL ? (
                        <ArrowLeft className="w-3 h-3 text-white transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2} />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-white transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
                      )}
                    </div>
                  </a>
                </div>
              </div>
            </aside>

            {/* Content Display Card using Double-Bezel */}
            <article className="p-2 sm:p-3 bg-gradient-to-br from-white/90 via-slate-50/40 to-slate-200/20 border border-slate-200/40 rounded-[32px] shadow-[var(--shadow-xl)] backdrop-blur-lg">
              <div className="bg-white rounded-[26px] border border-slate-100/50 p-6 sm:p-10 md:p-14 lg:p-16 overflow-hidden relative">
                
                {/* Brand Line Accent */}
                <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-accent via-gold to-primary" />
                
                {/* Header Title Block */}
                <div className="border-b border-slate-100 pb-10 mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="eyebrow-tag eyebrow-tag-gold font-bold">
                        <Sparkles className="w-3 h-3 text-gold anim-badge-pulse" strokeWidth={1.5} />
                        <span>{isRTL ? 'الشفافية القانونية' : 'Charte de Transparence'}</span>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/30 rounded-full text-[10px] font-bold text-emerald-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>{isRTL ? 'مستند ساري المفعول' : 'Document à jour'}</span>
                      </div>
                    </div>

                    <h1 className="text-3xl sm:text-4.5xl md:text-5xl font-black text-slate-800 tracking-tight font-heading leading-[1.15]">
                      {isRTL ? policy.titleAr : policy.titleFr}
                    </h1>
                    <p className="text-[13.5px] sm:text-base text-slate-500 font-medium leading-relaxed max-w-3xl">
                      {isRTL ? policy.subtitleAr : policy.subtitleFr}
                    </p>
                  </div>

                  <div className="shrink-0 text-left md:text-right self-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                      <span>{isRTL ? policy.lastUpdatedAr : policy.lastUpdatedFr}</span>
                    </span>
                  </div>
                </div>

                {/* Sections list with elegant cards & stagger entry */}
                <div className="space-y-6 t-stagger is-shown">
                  {policy.sections.map((sec, idx) => (
                    <section 
                      key={idx} 
                      style={{
                        animationDelay: `${idx * 85}ms`,
                      }}
                      className="t-stagger-line p-6 sm:p-8 bg-slate-50/40 hover:bg-slate-50/80 border border-slate-100/60 rounded-2xl group transition-all duration-500 hover:shadow-[var(--shadow-md)] relative overflow-hidden"
                    >
                      {/* Active highlight line on hover */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-accent/20 group-hover:bg-accent transition-all duration-500"
                        style={{
                          left: isRTL ? 'auto' : '0px',
                          right: isRTL ? '0px' : 'auto',
                          height: '100%',
                        }}
                      />

                      {/* Watermark Section Number */}
                      <div 
                        className="absolute bottom-2 watermark-num font-heading text-slate-200 select-none pointer-events-none text-7xl sm:text-8xl font-black"
                        style={{
                          left: isRTL ? '1.5rem' : 'auto',
                          right: isRTL ? 'auto' : '1.5rem'
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-snug font-heading group-hover:text-primary transition-colors duration-300">
                        {isRTL ? sec.titleAr : sec.titleFr}
                      </h3>
                      <p className="text-xs sm:text-[13.5px] text-slate-500 leading-relaxed font-semibold max-w-2xl mt-2.5">
                        {isRTL ? sec.descAr : sec.descFr}
                      </p>
                    </section>
                  ))}
                </div>

                {/* Verification Stamp at the bottom */}
                <div className="border-t border-slate-100 pt-10 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl px-5 py-3.5 text-emerald-700 font-extrabold select-none shadow-[var(--shadow-sm)]">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                    <div>
                      <span className="block text-[11px] leading-tight">
                        {isRTL ? 'موقع موثق ومعتمد' : 'Officinal certifié et réglementé'}
                      </span>
                      <span className="block text-[9px] text-emerald-600/70 font-semibold tracking-wider uppercase mt-0.5">
                        {isRTL ? 'صيدلية مرخصة رسمياً' : 'Parapharmacie Agréée au Maroc'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {isRTL ? 'الجهة المصدقة' : 'Éditeur Légal'}
                    </span>
                    <span className="text-sm font-black text-slate-700 font-heading">
                      Para Officinal S.A
                    </span>
                  </div>
                </div>

              </div>
            </article>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden text-white mt-auto" style={{ background: 'linear-gradient(135deg, #080f1e 0%, #0f1f3d 40%, #111a3a 100%)' }}>
        
        {/* Subtle background grid + orbs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div className="absolute -top-20 left-1/4 w-[520px] h-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,115,163,0.09) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-10 right-1/5 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,37,93,0.15) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand column */}
            <div className="md:col-span-4 flex flex-col gap-5 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <Image src="/images/logo.png" alt="Para Officinal S.A"
                width={140}
                height={40}
                className="object-contain self-start"
                style={{ filter: 'brightness(0) invert(1) opacity(0.88)' }} />
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-xs">
                {isRTL 
                  ? 'الرائد الرسمي في الصيدلة الإكلينيكية والعناية بالبشرة الطبية في المغرب. مركب لإحياء حيوية بشرتكِ.' 
                  : 'Leader officiel de la parapharmacie clinique et des soins dermatologiques au Maroc. Formulé pour révéler la vitalité de votre peau.'}
              </p>
              <div className="flex gap-2 flex-wrap mt-1 justify-start">
                <span className="text-[10px] font-semibold border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-400 rounded-full tracking-widest uppercase">CMI CERTIFIED</span>
                <span className="text-[10px] font-semibold border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-400 rounded-full tracking-widest uppercase">COD MOROCCO</span>
              </div>
            </div>

            {/* Politiques column */}
            <div className="md:col-span-2 flex flex-col gap-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                {isRTL ? 'السياسات والوثائق' : 'Politiques'}
              </span>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/politiques/conditions-vente" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {isRTL ? 'الشروط العامة للبيع' : 'Conditions de Vente'}
                  </Link>
                </li>
                <li>
                  <Link href="/politiques/confidentialite" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {isRTL ? 'سياسة الخصوصية' : 'Confidentialité'}
                  </Link>
                </li>
                <li>
                  <Link href="/politiques/retours-reclamations" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {isRTL ? 'الإرجاع والشكاوى' : 'Retours & Réclamations'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portails column */}
            <div className="md:col-span-2 flex flex-col gap-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Portails</span>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link href="/customer" className="text-[13px] text-emerald-400 hover:text-white transition-colors duration-300 anim-underline">
                    {isRTL ? 'تتبع طلبي' : 'Suivi Commande'}
                  </Link>
                </li>
                <li>
                  <Link href="/#boutique-grid" className="text-[13px] text-slate-400 hover:text-white transition-colors duration-300 anim-underline">
                    {isRTL ? 'متجرنا' : 'Notre Boutique'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact column */}
            <div className="md:col-span-4 flex flex-col gap-4 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Contact</span>
              <a
                href={`https://wa.me/${settings.storeWhatsApp || '212660808080'}`}
                className="group flex items-center gap-3 text-[13px] text-slate-400 hover:text-white transition-colors duration-300 w-fit"
              >
                <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-400/30 transition-all duration-300 shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-400">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                {settings.storePhone}
              </a>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                {isRTL ? 'من الاثنين إلى السبت،' : 'Du lundi au samedi,'}<br />09h00 – 18h00 (GMT+1)
              </p>
            </div>
          </div>

          <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)' }} />

          <div className="flex flex-col md:flex-row items-center justify-center text-center gap-4">
            <span className="text-[11px] text-slate-400 tracking-wider">
              © {new Date().getFullYear()} PARA OFFICINAL S.A. — {isRTL ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </span>
          </div>

        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onSelectProduct={(p) => { setSelectedProduct(p); setIsCartOpen(false); }}
        onOpenScratchCard={() => { setScratchCardOpen(true); setIsCartOpen(false); }}
      />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
      <SkinDiagnostic isOpen={isDiagnosticOpen} onClose={() => setDiagnosticOpen(false)} onOpenCart={() => setIsCartOpen(true)} />
      <ScratchCard isOpen={isScratchCardOpen} onClose={() => setScratchCardOpen(false)} />
      <QuickViewModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />
      <RoutineBundleDrawer isOpen={isBundleDrawerOpen} onClose={() => setIsBundleDrawerOpen(false)} />
      <CompareModal />
    </div>
  );
};
