'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ShieldCheck, Lock, Mail, User, Phone, ArrowRight,
  Eye, EyeOff, CheckCircle2, PackageCheck, Award, HeartHandshake, KeyRound
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface CustomerAuthPortalProps {
  authView: 'login' | 'signup';
  setAuthView: (view: 'login' | 'signup') => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (pass: string) => void;
  authName: string;
  setAuthName: (name: string) => void;
  authPhone: string;
  setAuthPhone: (phone: string) => void;
  authError: string | null;
  authLoading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CustomerAuthPortal: React.FC<CustomerAuthPortalProps> = ({
  authView,
  setAuthView,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authPhone,
  setAuthPhone,
  authError,
  authLoading,
  handleLogin,
  handleSignup,
  onClose,
  isModal = false,
}) => {
  const { language } = useTranslation();
  const isRTL = language === 'AR';
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setForgotPasswordMode(false);
    }, 4000);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Outer Doppelrand Hardware Shell */}
      <div className="bg-slate-900/90 p-2 sm:p-3 rounded-[2.5rem] border border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Ambient Radial Mesh Gradient */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Inner Core Enclosure */}
        <div className="bg-slate-950/95 rounded-[calc(2.5rem-0.5rem)] border border-slate-800/80 p-6 sm:p-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Editorial Concierge Brand Showcase (5 cols on lg) ── */}
          <div className="lg:col-span-5 space-y-6 lg:border-r border-slate-800/80 lg:pr-8 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
            
            {/* Top Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isRTL ? 'بوابة العميل الخاصة' : 'ESPACE CLIENT PRIVILÈGE'}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-tight">
                {isRTL ? 'مرحباً بكِ في حسابكِ الخاص' : 'Votre Portail Privé Para Officinal'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {isRTL 
                  ? 'سجلي الدخول لتتبع طلباتكِ في الوقت الحقيقي، كسب النقاط، ومتابعة مفكرة بشرتكِ.'
                  : 'Accédez à votre espace sécurisé pour suivre vos expéditions, accumuler votre cashback fidélité et consulter vos diagnostics dermatologiques.'}
              </p>
            </div>

            {/* 3 VIP Concierge Privileges Cards */}
            <div className="space-y-3 pt-2">
              
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 transition-all hover:border-slate-700">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isRTL ? 'تتبع مباشر ودقيق للطلبيات' : 'Suivi Colis en Temps Réel'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {isRTL ? 'خريطة رادار 5 مراحل ومتابعة مباشرة لشحنتكِ' : 'Visualisez le statut exact et la géolocalisation de chaque livraison.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 transition-all hover:border-slate-700">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isRTL ? 'كسب النقاط والكوبونات' : 'Cagnotte & CashBack Exclusif'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {isRTL ? 'كسب نقاط على كل طلبية واستبدالها بهدايا وتوصيل مجاني' : 'Cumulez des points sur chaque achat et débloquez des codes promo immédiats.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 transition-all hover:border-slate-700">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isRTL ? 'مفكرة البشرة وخدمة الواتساب' : 'Assistance Concierge 7j/7'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {isRTL ? 'حفظ روتينكِ اليومي والدعم المباشر عبر الواتساب' : 'Synchronisez votre journal de soin et profitez d\'un support prioritaire.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Trust Footer Badges */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isRTL ? 'تشفير 256-bit آمن' : 'Cryptage Sécurisé 256-bit'}
              </span>
              <span className="text-slate-400">•</span>
              <span>{isRTL ? 'منتجات أصلية 100%' : '100% Authentique'}</span>
            </div>

          </div>

          {/* ── Right Form Command Center (7 cols on lg) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Form Header Tabs */}
            <div className="space-y-4">
              
              {/* Segmented Doppelrand Tab Switcher */}
              <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-1 select-none">
                <button
                  type="button"
                  onClick={() => { setAuthView('login'); setForgotPasswordMode(false); }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0 ${
                    authView === 'login' && !forgotPasswordMode
                      ? 'bg-slate-800 text-white shadow-lg shadow-black/40 ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isRTL ? 'تسجيل الدخول' : 'Se Connecter'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthView('signup'); setForgotPasswordMode(false); }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0 ${
                    authView === 'signup' && !forgotPasswordMode
                      ? 'bg-slate-800 text-white shadow-lg shadow-black/40 ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-200 bg-transparent'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRTL ? 'إنشاء حساب جديد' : 'Créer un Compte'}</span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <h3 className="text-lg font-bold text-white">
                  {forgotPasswordMode
                    ? (isRTL ? 'إعادة تعيين كلمة المرور' : 'Réinitialisation de Mot de passe')
                    : authView === 'login'
                    ? (isRTL ? 'دخول إلى حسابكِ' : 'Connexion à votre Espace Privé')
                    : (isRTL ? 'إنشاء حساب جديد في ثوانٍ' : 'Création de votre Compte Privilège')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {forgotPasswordMode
                    ? (isRTL ? 'أدخلي بريدكِ الإلكتروني لتلقي رابط إعادة التعيين.' : 'Entrez votre adresse email pour recevoir un lien de réinitialisation.')
                    : authView === 'login'
                    ? (isRTL ? 'أدخلي البريد الإلكتروني وكلمة المرور للمتابعة.' : 'Saisissez vos identifiants pour vous connecter à votre compte.')
                    : (isRTL ? 'أنشئي حسابكِ مجاناً للاستفادة من جميع المزايا.' : 'Remplissez le formulaire ci-dessous pour ouvrir votre compte client.')}
                </p>
              </div>

            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Reset Sent Success Notice */}
            {resetSent && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>{isRTL ? 'تم إرسال تعليمات إعادة التعيين إلى بريدكِ الإلكتروني!' : 'Un email contenant le lien de réinitialisation vous a été envoyé !'}</span>
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {forgotPasswordMode ? (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      placeholder="exemple@email.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer border-0"
                  >
                    <span>{isRTL ? 'إرسال رابط التعيين' : 'Envoyer le lien de réinitialisation'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(false)}
                    className="py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    {isRTL ? 'إلغاء' : 'Annuler'}
                  </button>
                </div>
              </form>
            ) : authView === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      placeholder="exemple@email.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      {isRTL ? 'كلمة المرور' : 'Mot de passe'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer bg-transparent border-0"
                    >
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 bg-transparent border-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] cursor-pointer border-0 disabled:opacity-60"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRTL ? 'دخول إلى حسابي' : 'Se Connecter à mon Espace'}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
                        <ArrowRight className={`w-3.5 h-3.5 text-slate-950 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </>
                  )}
                </button>

              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignup} className="space-y-4">
                
                {/* Full Name */}
                <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    {isRTL ? 'الاسم الكامل' : 'Nom Complet'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                      placeholder={isRTL ? 'فاطمة الزهراء' : 'Sara Mansouri'}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Phone Number */}
                  <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      {isRTL ? 'رقم الهاتف' : 'Téléphone'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="0661234567"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      {isRTL ? 'البريد الإلكتروني' : 'Adresse Email'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                        placeholder="exemple@email.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                </div>

                {/* Password */}
                <div className="space-y-1 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    {isRTL ? 'كلمة المرور (6 أحرف على الأقل)' : 'Mot de Passe (6 car. min)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 bg-transparent border-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Signup Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.99] cursor-pointer border-0 disabled:opacity-60"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRTL ? 'تأكيد وإنشاء حسابي' : 'Créer mon Compte Privilège'}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
                        <ArrowRight className={`w-3.5 h-3.5 text-slate-950 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Quick Demo Login Option */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthEmail('client.demo@para.ma');
                  setAuthPassword('demo123456');
                }}
                className="text-[11px] font-mono text-slate-500 hover:text-emerald-400 transition-colors bg-transparent border-0 cursor-pointer underline"
              >
                {isRTL ? '⚡ ملء تلقائي لتجربة الحساب (Demo)' : '⚡ Remplissage rapide pour tester le compte (Demo)'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
