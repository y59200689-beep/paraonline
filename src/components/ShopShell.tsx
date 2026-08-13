'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUi } from '@/context/UiContext';
import { useSettings } from '@/context/SettingsContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { usePathname, useRouter } from 'next/navigation';
import { Product } from '@/lib/data';
import Link from 'next/link';
import { ShoppingBag, Home as HomeIcon, Store, Sparkles, Mail, Send, ShieldCheck, Truck, MessageSquare, Lock, CheckCircle2, Award, Package, Crown, FlaskConical, Building2, Coins, CreditCard, Scale } from 'lucide-react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image-optimizer';

// Component Imports
import dynamic from 'next/dynamic';

// Component Imports
import { Header } from './Header';
import { CartBubbleCoordinator } from './CartBubbleCoordinator';
import { OrderSuccessModal } from './OrderSuccessModal';

const CartDrawer = dynamic(() => import('./CartDrawer').then(m => m.CartDrawer), { ssr: false });
const WishlistDrawer = dynamic(() => import('./WishlistDrawer').then(m => m.WishlistDrawer), { ssr: false });
const SkinDiagnostic = dynamic(() => import('./SkinDiagnostic').then(m => m.SkinDiagnostic), { ssr: false });
const ScratchCard = dynamic(() => import('./ScratchCard').then(m => m.ScratchCard), { ssr: false });
const QuickViewModal = dynamic(() => import('./QuickViewModal').then(m => m.QuickViewModal), { ssr: false });
const RoutineBundleDrawer = dynamic(() => import('./RoutineBundleDrawer').then(m => m.RoutineBundleDrawer), { ssr: false });

interface ShopShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideMobileNav?: boolean;
}

export const ShopShell: React.FC<ShopShellProps> = ({ children, hideHeader, hideFooter, hideMobileNav = false }) => {
  const { t, language } = useTranslation();
  const { settings } = useSettings();
  const { clientUser } = useLoyalty();
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pathname = usePathname();
  const router = useRouter();

  const {
    isWishlistOpen, setWishlistOpen,
    isDiagnosticOpen, setDiagnosticOpen,
    isScratchCardOpen, setScratchCardOpen,
    selectedProduct, setSelectedProduct
  } = useUi();

  const [isBundleDrawerOpen, setIsBundleDrawerOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const openCart = () => {
    setWishlistOpen(false);
    setDiagnosticOpen(false);
    setScratchCardOpen(false);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 5000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Scroll Listener for Mobile Bottom Navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const boutiqueEl = document.getElementById('boutique-grid');
      const boutiqueOffset = boutiqueEl ? boutiqueEl.offsetTop - 200 : 800;

      if (scrollPos < 300) {
        setActiveMobileTab('home');
      } else if (scrollPos >= 300 && scrollPos < boutiqueOffset + 400) {
        setActiveMobileTab('boutique');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isRTL = language === 'AR';
  const whatsappNumber = String(settings.storeWhatsApp || '212660808080').replace(/\D/g, '');

  return (
    <div
      className={`public-page page-entry-animate min-h-screen bg-background text-foreground flex flex-col ${hideMobileNav ? 'pb-0' : 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <a href="#main-content" className="public-skip-link">
        {language === 'AR' ? 'انتقل إلى المحتوى الرئيسي' : 'Aller au contenu principal'}
      </a>
      {/* Editorial Noise Overlay */}
      <div className="editorial-noise" />

      {/* Header */}
      {!hideHeader && <Header />}

      {/* Main page content */}
      <div id="main-content" tabIndex={-1} className="flex-grow scroll-mt-32">
        {children}
      </div>

      {/* ── FLAGSHIP LUXURY FOOTER ─────────────────────────────────────── */}
      {!hideFooter && (
        <footer id="footer" className="relative overflow-hidden text-slate-100 bg-[#080F1E] border-t border-slate-800/80 font-sans">
          {/* Subtle background grid & ambient light mesh */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.06)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* ── 1. VIP Newsletter & Privilege Banner Card ── */}
            <div className="pt-12 lg:pt-16 pb-12 border-b border-slate-800/80">
              <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center lg:text-left max-w-xl" style={{ textAlign: isRTL ? 'right' : undefined }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{language === 'AR' ? 'نصائح وعروض' : 'CONSEILS ET OFFRES'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                    {language === 'AR'
                      ? 'اكتشفي نصائحنا وعروضنا'
                      : 'Recevez nos conseils et nos offres'}
                  </h3>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    {language === 'AR'
                      ? 'اشتركي لتصلك نصائح العناية، المستجدات والعروض الخاصة.'
                      : 'Recevez nos conseils beauté, nos nouveautés et nos offres.'}
                  </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
                  {newsletterSubscribed ? (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'AR' ? 'تم الاشتراك بنجاح. شكراً لانضمامكِ.' : 'Merci, votre inscription est enregistrée.'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                        <label htmlFor="storefront-newsletter-email" className="sr-only">
                          {language === 'AR' ? 'البريد الإلكتروني للاشتراك' : 'Adresse e-mail pour la newsletter'}
                        </label>
                        <input
                          id="storefront-newsletter-email"
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder={language === 'AR' ? 'أدخلي بريدكِ الإلكتروني...' : 'Votre adresse email...'}
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                        />
                      </div>
                      <button
                        type="submit"
                        className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 shrink-0"
                      >
                        <span>{language === 'AR' ? 'اشتركي الآن' : 'S\'inscrire'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2 text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {language === 'AR' ? 'نستخدم بريدك فقط لإرسال الرسائل التي اشتركتِ فيها.' : 'Votre adresse sert uniquement aux communications auxquelles vous vous inscrivez.'}
                  </p>
                </form>
              </div>
            </div>

            {/* ── 2. Guarantee micro-pills grid ── */}
            <div className="py-8 border-b border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left" style={{ textAlign: isRTL ? 'right' : undefined }}>
              {(settings.trustBadges?.length ? settings.trustBadges.map((badge, index) => ({
                titleFr: badge.label_fr || '', titleAr: badge.label_ar || '', descFr: '', descAr: '', icon: index === 1 ? Truck : ShieldCheck, color: index === 1 ? 'text-teal-400' : 'text-emerald-400'
              })) : [
                {
                  titleFr: 'Produits sélectionnés',
                  titleAr: 'منتجات مختارة',
                  descFr: 'Des marques reconnues',
                  descAr: 'من علامات تجارية معروفة',
                  icon: ShieldCheck,
                  color: 'text-emerald-400'
                },
                {
                  titleFr: 'Livraison au Maroc',
                  titleAr: 'التوصيل في المغرب',
                  descFr: 'Selon les délais indiqués à la commande',
                  descAr: 'حسب المواعيد المعروضة عند الطلب',
                  icon: Truck,
                  color: 'text-teal-400'
                },
                {
                  titleFr: 'Conseil WhatsApp',
                  titleAr: 'نصيحة عبر واتساب',
                  descFr: 'Notre équipe vous accompagne',
                  descAr: 'فريقنا يرافقك',
                  icon: MessageSquare,
                  color: 'text-cyan-400'
                },
                {
                  titleFr: 'Paiement sécurisé',
                  titleAr: 'دفع آمن',
                  descFr: 'En ligne ou à la livraison',
                  descAr: 'عبر الإنترنت أو عند التسليم',
                  icon: Lock,
                  color: 'text-amber-400'
                }
              ]).map((pill, idx) => {
                const PillIcon = pill.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <PillIcon className={`w-4 h-4 ${pill.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white font-heading leading-tight truncate">
                        {language === 'AR' ? pill.titleAr : pill.titleFr}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                        {language === 'AR' ? pill.descAr : pill.descFr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 3. Main 5-Column Navigation Deck ── */}
            {settings.footerColumns?.length ? <div className="py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-left" style={{ textAlign: isRTL ? 'right' : undefined }}>
              {settings.footerColumns.map((column, index) => <div key={column.id ?? index} className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">{language === 'AR' ? column.heading_ar : column.heading_fr}</h4>
                <ul className="space-y-2.5 text-xs text-slate-400">{(column.links ?? []).map((link, linkIndex) => <li key={`${link.href}-${linkIndex}`}><Link href={link.href} className="hover:text-white transition-colors duration-200">{language === 'AR' ? link.label_ar : link.label_fr}</Link></li>)}</ul>
              </div>)}
            </div> : null}
            <div className={`${settings.footerColumns?.length ? 'hidden' : ''} py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8 text-left`} style={{ textAlign: isRTL ? 'right' : undefined }}>
              
              {/* Column 1: Brand Thesis & Corporate Badges (Col-span 4) */}
              <div className="lg:col-span-4 space-y-5">
                <Link href="/" className="inline-block">
                  <Image
                    src={getOptimizedImageUrl("/images/logo.png")}
                    alt="Para Officinal S.A"
                    width={933}
                    height={257}
                    className="object-contain"
                    style={{ width: '150px', height: 'auto', filter: 'brightness(0) invert(1) opacity(0.92)' }}
                  />
                </Link>

                <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
                  {language === 'AR'
                    ? 'متجركم للعناية بالبشرة والجمال في المغرب.'
                    : 'Votre boutique de parapharmacie et de soins beauté au Maroc.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    PAIEMENT SÉCURISÉ
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <Truck className="w-3 h-3 text-teal-400" />
                    PAIEMENT À LA LIVRAISON
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    <Award className="w-3 h-3 text-amber-400" />
                    BOUTIQUE EN LIGNE
                  </span>
                </div>
              </div>

              {/* Column 2: Univers & Soins (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">
                  {language === 'AR' ? 'عالم العناية' : 'Univers & Soins'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/products?category=Anti-Âge" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'مقاومة التجاعيد والشباب' : 'Anti-Âge & Sérums'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Protection Solaire" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الحماية من الشمس' : 'Protection Solaire'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Anti-Taches" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'علاج التصبغات والبقع' : 'Anti-Taches & Éclat'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=Hydratation" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'ترطيب البشرة الجافة' : 'Peaux Sensibles & Acné'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'العناية بالشعر والجسم' : 'Soins Corps & Cheveux'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/products" className="text-emerald-400 hover:text-emerald-300 font-bold block pt-1">
                      {language === 'AR' ? 'جميع الكتالوج →' : 'Tous nos Soins →'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Portails & Services (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400 font-mono">
                  {language === 'AR' ? 'الخدمات والبوابات' : 'Services Client'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/suivi-commande" className="hover:text-white transition-colors duration-200 flex items-center gap-2 font-semibold text-slate-200">
                      <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'AR' ? 'تتبع طلبكِ المباشر' : 'Suivi de Commande'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/customer" className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{language === 'AR' ? 'حسابي ونادي المكافآت' : 'Espace VIP & Wallet'}</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => setDiagnosticOpen(true)} className="hover:text-white transition-colors duration-200 text-left cursor-pointer bg-transparent border-0 p-0 text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{language === 'AR' ? 'تشخيص البشرة الذكي' : 'Dermo-Diagnostic IA'}</span>
                    </button>
                  </li>
                  <li>
                    <Link href="/a-propos" className="hover:text-white transition-colors duration-200 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{language === 'AR' ? 'من نحن وعن الصيدلية' : 'À propos de nous'}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Politiques Légales (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-mono">
                  {language === 'AR' ? 'السياسات والقانون' : 'Politiques'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li>
                    <Link href="/politiques/conditions-vente" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الشروط العامة للبيع' : 'Conditions de Vente'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/politiques/confidentialite" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'سياسة الخصوصية' : 'Confidentialité & SSL'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/politiques/retours-reclamations" className="hover:text-white transition-colors duration-200 block">
                      {language === 'AR' ? 'الإرجاع والشكاوى' : 'Retours & Réclamations'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 5: Conciergerie Directe (Col-span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-mono">
                  {language === 'AR' ? 'تواصل معنا' : 'Contactez-nous'}
                </h4>
                <div className="space-y-3 text-xs">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-2.5 group font-mono font-bold"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] uppercase tracking-wider">WhatsApp · +{whatsappNumber}</span>
                  </a>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                    {language === 'AR' ? 'من الإثنين إلى السبت: 09:00 – 18:00' : 'Du lundi au samedi: 09h00 – 18h00 (GMT+1)'}
                  </p>


                </div>
              </div>

            </div>

            {/* ── 4. Bottom Divider & Copyright / Payment Seals ── */}
            <div className="pt-8 pb-12 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <p className="text-[11px] text-slate-400 tracking-wide font-normal">
                © {new Date().getFullYear()} <strong className="text-white font-bold">PARA OFFICINAL S.A.</strong> — Tous droits réservés.
              </p>

              {/* Payment Methods Badges */}
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap justify-center">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" /> Cash sur Livraison (COD)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-400" /> Carte Bancaire CMI
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Connexion chiffrée
                </span>
              </div>
            </div>

          </div>
        </footer>
      )}

      {/* ── Mobile Bottom Navigation ─────────────────────────────────── */}
      {mounted && !hideMobileNav && (
        <nav
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 flex items-center justify-around pt-2.5 px-3"
        >
          {/* Home Link */}
          <button
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/');
              }
              setActiveMobileTab('home');
            }}
            aria-current={activeMobileTab === 'home' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'home' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HomeIcon className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'home' ? 'scale-110' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'home' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'الرئيسية' : 'Accueil'}
            </span>
          </button>

          {/* Boutique Link */}
          <button
            onClick={() => {
              if (pathname === '/') {
                const el = document.getElementById('boutique-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                router.push('/products');
              }
              setActiveMobileTab('boutique');
            }}
            aria-current={activeMobileTab === 'boutique' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'boutique' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Store className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'boutique' ? 'scale-110' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'boutique' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'المتجر' : 'Boutique'}
            </span>
          </button>

          {/* Diagnostic Link */}
          <button
            onClick={() => {
              setDiagnosticOpen(true);
              setActiveMobileTab('diagnostic');
            }}
            aria-current={activeMobileTab === 'diagnostic' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 ${
              activeMobileTab === 'diagnostic' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'diagnostic' ? 'scale-110 text-accent animate-pulse' : ''}`} />
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'diagnostic' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'تشخيص' : 'Diagnostic'}
            </span>
          </button>

          {/* Cart Link */}
          <button
            onClick={() => {
              openCart();
              setActiveMobileTab('cart');
            }}
            aria-current={activeMobileTab === 'cart' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 w-full py-1 transition-all duration-300 relative ${
              activeMobileTab === 'cart' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${activeMobileTab === 'cart' ? 'scale-110' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-wider uppercase font-heading ${activeMobileTab === 'cart' ? 'font-black text-primary-dark' : 'font-semibold text-slate-600'}`}>
              {language === 'AR' ? 'السلة' : 'Panier'}
            </span>
          </button>
        </nav>
      )}

      {/* Drawers & Modals */}
      {isCartOpen && (
        <CartDrawer
          isOpen
          onClose={() => setIsCartOpen(false)}
          onSelectProduct={(p) => { setSelectedProduct(p); setIsCartOpen(false); }}
          onOpenScratchCard={() => { setScratchCardOpen(true); setIsCartOpen(false); }}
        />
      )}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
      <SkinDiagnostic
        isOpen={isDiagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        onOpenCart={openCart}
        experience="client"
      />
      <ScratchCard isOpen={isScratchCardOpen} onClose={() => setScratchCardOpen(false)} />
      <QuickViewModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />
      
      <RoutineBundleDrawer isOpen={isBundleDrawerOpen} onClose={() => setIsBundleDrawerOpen(false)} />

      <CartBubbleCoordinator />
      <OrderSuccessModal />

    </div>
  );
};
