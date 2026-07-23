'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { ShopShell } from '@/components/ShopShell';
import { 
  ShieldCheck, 
  FileText, 
  ChevronRight,
  Sparkles,
  MessageSquare,
  Lock,
  Truck,
  CheckCircle2,
  Building2,
  Scale,
  Award
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
    titleAr: 'الشروط العامة للبيع (CGV)',
    subtitleFr: 'Réglementation officielle des commandes, expéditions et transactions Cash-on-Delivery (COD) au Maroc.',
    subtitleAr: 'اللوائح الرسمية للطلبات، الشحنات، والمعاملات عند الدفع والاستلام بالمغرب.',
    icon: <FileText className="w-5 h-5 text-emerald-600" />,
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
    titleFr: 'Politique de Confidentialité & SSL',
    titleAr: 'سياسة الخصوصية وأمان البيانات',
    subtitleFr: 'Transparence absolue sur la sécurité de vos données personnelles et résultats cliniques de l\'IA.',
    subtitleAr: 'شفافية مطلقة حول أمان بياناتكِ الشخصية ونتائج تشخيص البشرة بالذكاء الاصطناعي.',
    icon: <Lock className="w-5 h-5 text-teal-600" />,
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
        titleAr: '3. الأمان والحماية الطبية للبيانات',
        descFr: 'Conformément aux directives CNDP au Maroc et aux standards GDPR internationaux, nous appliquons un protocole de chiffrement SSL 256-bit strict. Aucune information médicale ou personnelle n\'est jamais cédée ou vendue à des tiers.',
        descAr: 'تماشياً مع توجيهات اللجنة الوطنية لحماية المعطيات ذات الطابع الشخصي (CNDP) والمعايير الدولية، نطبق نظام تشفير صارم SSL 256-bit. لا يتم مشاركة أو بيع أي بيانات طبية أو شخصية لأي طرف ثالث نهائياً.'
      },
      {
        titleFr: '4. Vos Droits et Contrôle (CNDP & GDPR)',
        titleAr: '4. حقوقكِ والتحكم بالبيانات',
        descFr: 'Vous bénéficiez d\'un droit permanent d\'accès, de modification et de suppression définitive de vos données. Pour exercer ce droit, contactez simplement notre conciergerie WhatsApp ou notre service client officinal.',
        descAr: 'يحق لكِ في أي وقت طلب الإطلاع، التعديل، أو الحذف النهائي لجميع بياناتكِ المسجلة لدينا. لممارسة هذا الحق، يمكنكِ التواصل مباشرة مع خدمة العملاء عبر الواتساب.'
      }
    ]
  },
  'retours-reclamations': {
    titleFr: 'Politique de Retours & Réclamations',
    titleAr: 'سياسة الإرجاع والشكاوى',
    subtitleFr: 'Procédures d\'échange express, garanties de scellé officinal et remboursements transparents.',
    subtitleAr: 'إجراءات الاستبدال، ضمانات التغليف الصيدلاني، والاسترداد السريع.',
    icon: <ShieldCheck className="w-5 h-5 text-cyan-600" />,
    lastUpdatedFr: 'Dernière mise à jour : 12 Mai 2026',
    lastUpdatedAr: 'آخر تحديث: 12 ماي 2026',
    sections: [
      {
        titleFr: '1. Conditions Strictes d\'Hygiène et Sécurité Officinale',
        titleAr: '1. شروط السلامة والنظافة الصيدلانية',
        descFr: 'Afin d\'assurer une sécurité dermatologique irréprochable à l\'ensemble de nos clientes, seuls les produits non ouverts, conservés dans leur emballage d\'origine scellé et leur film protecteur intact peuvent faire l\'objet d\'un retour sous 7 jours.',
        descAr: 'ضماناً للسلامة الصحية والسريرية لجميع عملائنا، يُقبل إرجاع المنتجات فقط إذا كانت غير مفتوحة، وفي غلافها الأصلي المختوم مع الشريط الواقي دون أي تلف خلال فترة 7 أيام من الاستلام.'
      },
      {
        titleFr: '2. Colis Endommagé ou Produit Non Conforme',
        titleAr: '2. الشحنات المتضررة أو المنتجات غير المطابقة',
        descFr: 'En cas de réception d\'un produit endommagé lors du transport ou d\'une erreur de référence, Para Officinal S.A prend en charge l\'intégralité des frais de réexpédition. Un échange express immédiat est organisé sous 24 à 48h.',
        descAr: 'في حالة استلام منتج متضرر أثناء النقل أو وجود خطأ في نوع المستحضر، تتكفل صيدلية Para Officinal S.A بكافة رسوم الإرجاع والشحن. يتم تنظيم عملية استبدال سريعة فوراً خلال 24 إلى 48 ساعة.'
      },
      {
        titleFr: '3. Procédure Simplifiée via Conciergerie WhatsApp',
        titleAr: '3. خطوات الإرجاع البسيطة عبر الواتساب',
        descFr: 'Pour initier un retour ou déposer une réclamation, envoyez simplement une photo du colis et de la facture à notre conciergerie WhatsApp (+212 6 60 80 80 80). Notre équipe traite votre demande en moins de 30 minutes.',
        descAr: 'لبدء عملية الإرجاع أو تقديم شكوى، يكفي إرسال صورة للشحنة والفاتورة عبر خدمة الواتساب المباشرة (+212 6 60 80 80 80). يقوم فريقنا بمعالجة طلبكِ في أقل من 30 دقيقة.'
      },
      {
        titleFr: '4. Modalités de Remboursement',
        titleAr: '4. طرق الاسترداد المالي',
        descFr: 'Après réception et inspection de conformité par notre pharmacien, le remboursement est effectué selon votre choix : via bon d\'achat immédiat valable sur la boutique, ou par virement bancaire sous 3 à 5 jours ouvrés.',
        descAr: 'بعد استلام الشحنة وفحصها من قبل الصيدلي المختص، يتم الاسترداد المالي حسب اختياركِ: إما عبر قسيمة شراء فورية للاستخدام في المتجر، أو عبر تحويل بنكي خلال 3 إلى 5 أيام عمل.'
      }
    ]
  }
};

interface PolicyClientProps {
  slug: string;
}

export const PolicyClient: React.FC<PolicyClientProps> = ({ slug }) => {
  const { language } = useTranslation();
  const isRTL = language === 'AR';

  // Fallback to conditions-vente if the slug is not matching
  const currentSlug = POLICIES_DATA[slug] ? slug : 'conditions-vente';
  const policy = POLICIES_DATA[currentSlug];

  return (
    <ShopShell>
      <div 
        className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Subtle Ambient Radial Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,rgba(14,165,233,0.03)_45%,transparent_70%)] pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold select-none pt-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <Link href="/" className="hover:text-emerald-600 transition-colors duration-200">
              {isRTL ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-slate-800 font-bold">
              {isRTL ? policy.titleAr : policy.titleFr}
            </span>
          </div>

          {/* ──────────────── 1. HERO BANNER CARD ──────────────── */}
          <div 
            className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6 relative overflow-hidden"
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold tracking-widest uppercase rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? 'وثيقة قانونية رسمية' : 'CHARTE & ENGAGEMENTS JURIDIQUES'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-semibold bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isRTL ? policy.lastUpdatedAr : policy.lastUpdatedFr}</span>
              </div>
            </div>

            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight leading-tight">
                {isRTL ? policy.titleAr : policy.titleFr}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {isRTL ? policy.subtitleAr : policy.subtitleFr}
              </p>
            </div>

            {/* 3 Quick Guarantee Micro-Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{isRTL ? 'حماية CNDP & SSL' : 'Protection CNDP & SSL'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{isRTL ? 'تشفير عالي الأمان 256-bit' : 'Chiffrement strict 256-bit'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                  <Truck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{isRTL ? 'توصيل محكم وسريع' : 'Livraison Scellée Maroc'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{isRTL ? 'تغليف طبي ضد الصدمات' : 'Emballage isotherme COD'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-600 shrink-0 shadow-sm">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{isRTL ? 'دعم الواتساب الفوري' : 'Conciergerie WhatsApp'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{isRTL ? 'رد خلال 30 دقيقة' : 'Assistance en 30 minutes'}</p>
                </div>
              </div>
            </div>
          </div>


          {/* ──────────────── 2. MAIN CONTENT DECK WITH SIDEBAR ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Sidebar Navigation (Col-span 4) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block border-b border-slate-100 pb-3" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? 'جميع الوثائق القانونية' : 'DOCUMENTATION OFFICIELLE'}
                </span>

                <nav className="flex flex-col gap-2.5">
                  {Object.keys(POLICIES_DATA).map((key) => {
                    const isActive = currentSlug === key;
                    const item = POLICIES_DATA[key];
                    return (
                      <Link
                        key={key}
                        href={`/politiques/${key}`}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 group cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-300 text-slate-900 font-bold shadow-sm'
                            : 'bg-slate-50/70 border-slate-200/70 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-900'
                        }`}
                        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', textAlign: isRTL ? 'right' : 'left' }}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-white border-emerald-200 text-emerald-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 group-hover:text-slate-800'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold font-heading block truncate">
                            {isRTL ? item.titleAr : item.titleFr}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {isRTL ? 'موثق رسمياً S.A' : 'Réglementation Officielle'}
                          </span>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Concierge Widget */}
              <div 
                className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800 relative overflow-hidden"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-xs font-bold" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>{isRTL ? 'خدمة العملاء متواجدة الآن' : 'CONCIERGERIE EN LIGNE'}</span>
                </div>

                <h4 className="text-base font-bold font-heading text-white">
                  {isRTL ? 'هل لديكِ استفسار حول طلبكِ؟' : 'Besoin d\'Assistance Immédiate ?'}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {isRTL 
                    ? 'فريق الاستشارة الصيدلانية متواجد للإجابة على جميع استفساراتكِ ومتابعة الشحنات.'
                    : 'Notre équipe dermo-conseil réponds à toutes vos questions sur les commandes, retours ou remboursements.'}
                </p>

                <a
                  href="https://wa.me/212660808080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition duration-300 w-full flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  <span>{isRTL ? 'مراسلة الواتساب الفورية' : 'Contact WhatsApp Direct'}</span>
                </a>
              </div>
            </aside>

            {/* Article Sections (Col-span 8) */}
            <article className="lg:col-span-8 space-y-6">
              {policy.sections.map((sec, index) => (
                <div 
                  key={index}
                  className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-emerald-500/30 transition duration-300 space-y-4 group relative overflow-hidden"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {/* Number Badge */}
                  <div className="flex items-center justify-between" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                      SECTION 0{index + 1}
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-80" />
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight group-hover:text-emerald-700 transition duration-200">
                    {isRTL ? sec.titleAr : sec.titleFr}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1 border-t border-slate-100">
                    {isRTL ? sec.descAr : sec.descFr}
                  </p>
                </div>
              ))}

              {/* Official Clinical Sign-off Box */}
              <div className="p-8 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-sm">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 font-heading">
                      {isRTL ? 'إثبات الاعتماد والصحة الصيدلانية' : 'CERTIFICATION OFFICINALE CONFORME'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isRTL ? 'موزع رسمي معتمد بالمملكة المغربية — CNDP & GDPR' : 'Distributeur Dermo-Cosmétique Agréé au Maroc (CNDP)'}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">ÉDITEUR LÉGAL</p>
                  <p className="text-sm font-black text-slate-900 font-heading">PARA OFFICINAL S.A</p>
                  <p className="text-[10px] text-slate-500">Maarif, Casablanca</p>
                </div>
              </div>

            </article>

          </div>

        </div>
      </div>
    </ShopShell>
  );
};
