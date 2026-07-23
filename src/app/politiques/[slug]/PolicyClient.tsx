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
    subtitleFr: 'Procédures d\'échange, garanties de scellé officinal et remboursements rapides.',
    subtitleAr: 'إجراءات الاستبدال، ضمانات التغليف الصيدلاني، والاسترداد السريع.',
    icon: <ShieldCheck className="w-8 h-8 text-accent" />,
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
        className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Film grain/noise overlay */}
        <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.015] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] mix-blend-overlay" />

        {/* Main Section */}
        <main className="flex-1 section-ivory aurora-bg pt-12 pb-24 relative overflow-hidden">
          
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
                            <span className="text-xs font-bold font-heading block truncate">
                              {isRTL ? item.titleAr : item.titleFr}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {isRTL ? 'موثق' : 'Certifié S.A'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Direct Concierge Contact Widget */}
                <div 
                  className="rounded-[20px] p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-primary-dark text-white space-y-4 shadow-xl border border-slate-800/80 relative overflow-hidden mt-8"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-accent">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider font-heading text-accent">
                      {isRTL ? 'هل تحتاجين لمساعدة؟' : 'Une Question Légale ?'}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1 font-normal">
                      {isRTL 
                        ? 'تواصل مع مستشارينا عبر الواتساب للحصول على استجابة فورية وتوجيه مخصص.' 
                        : 'Notre conciergerie est à votre disposition pour toute précision sur vos commandes ou retours.'}
                    </p>
                  </div>
                  <a
                    href="https://wa.me/212660808080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition duration-300 w-full justify-center shadow-lg cursor-pointer"
                  >
                    <span>{isRTL ? 'تواصل عبر الواتساب' : 'Concierge WhatsApp'}</span>
                  </a>
                </div>
              </aside>

              {/* Main Content Article */}
              <article className="space-y-8 min-w-0">
                
                {/* Header Banner */}
                <div 
                  className="rounded-[28px] p-8 sm:p-12 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-6 relative overflow-hidden"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  <div className="flex items-center gap-4 flex-wrap justify-between">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono font-bold tracking-wider uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'وثيقة رسمية معتمدة' : 'DOCUMENT OFFICIEL RÉGLEMENTÉ'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">
                      {isRTL ? policy.lastUpdatedAr : policy.lastUpdatedFr}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight leading-tight">
                      {isRTL ? policy.titleAr : policy.titleFr}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl">
                      {isRTL ? policy.subtitleAr : policy.subtitleFr}
                    </p>
                  </div>
                </div>

                {/* Sections List */}
                <div className="space-y-6">
                  {policy.sections.map((sec, index) => (
                    <div 
                      key={index}
                      className="p-8 rounded-[24px] bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 hover:border-accent/30 group"
                      style={{ textAlign: isRTL ? 'right' : 'left' }}
                    >
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading group-hover:text-primary-dark transition-colors duration-300">
                        {isRTL ? sec.titleAr : sec.titleFr}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {isRTL ? sec.descAr : sec.descFr}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Official Sign-off Box */}
                <div className="p-6 rounded-[20px] bg-emerald-50/50 border border-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-emerald-800" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[11px] leading-tight font-bold">
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

              </article>

            </div>

          </div>
        </main>
      </div>
    </ShopShell>
  );
};
