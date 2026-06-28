/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { Gift, X, Sparkles, Mail, Phone, Lock } from 'lucide-react';

interface ScratchCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const { applyDailyGift, applyCouponCode } = useCart();

  // t-modal animation states
  const [isVisible, setIsVisible] = useState(false);
  const [modalState, setModalState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const closeMs = 160; // Matches --modal-close-dur

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setModalState('open'));
      });
    } else if (modalState === 'open') {
      setModalState('closing');
      const t = setTimeout(() => {
        setModalState('closed');
        setIsVisible(false);
      }, closeMs);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { settings } = useSettings();
  const [step, setStep] = useState(0); // 0: Lead Form, 1: Scratch Area, 2: Reward Applied
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [reward, setReward] = useState({ code: 'FREESHIP', name: 'Livraison Gratuite' });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  // Dynamically build rewards from settings coupons & daily gift
  const getRewardsList = () => {
    const list = (settings.coupons || []).map(c => ({
      code: c.code,
      name_fr: c.freeShipping 
        ? 'Livraison 100% Gratuite' 
        : `Remise Exclusive de ${c.discountPercent}%`,
      name_ar: c.freeShipping 
        ? 'توصيل مجاني 100%' 
        : `خصم حصري بقيمة ${c.discountPercent}%`
    }));

    if (settings.dailyGiftName) {
      list.push({
        code: 'DAILYGIFT',
        name_fr: `${settings.dailyGiftName} Offert`,
        name_ar: `${settings.dailyGiftName} هدية مجانية`
      });
    }

    return list.length > 0 ? list : [
      { code: 'FREESHIP', name_fr: 'Livraison 100% Gratuite', name_ar: 'توصيل مجاني 100%' }
    ];
  };

  // Pick a random reward on mounting
  useEffect(() => {
    const rewardsPool = getRewardsList();
    const selected = rewardsPool[Math.floor(Math.random() * rewardsPool.length)];
    setReward({
      code: selected.code,
      name: language === 'FR' ? selected.name_fr : selected.name_ar,
    });
  }, [language, isOpen, settings]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create luxurious golden metallic gradient coating
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#D4AF37'); // Metallic Gold
    grad.addColorStop(0.3, '#FFDF73'); // Bright gold highlight
    grad.addColorStop(0.5, '#AA771C'); // Gold shading
    grad.addColorStop(0.8, '#E6C655'); // Soft gold highlight
    grad.addColorStop(1, '#B09B71'); // Sage Gold
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gold luxury diagonal lines texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let i = -canvas.height; i < canvas.width; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
 
    // Add luxury branding text inside the coating
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#101f3d'; // Rich navy contrast text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      language === 'FR' ? 'GRATTEZ ICI POUR RÉVÉLER' : 'احكي هنا للكشف عن هديتكِ',
      canvas.width / 2,
      canvas.height / 2
    );
 
    // Draw elegant inner gold border lines
    ctx.strokeStyle = 'rgba(16, 31, 61, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  };

  // Canvas context setups when scratch stage starts
  useEffect(() => {
    if (step === 1 && canvasRef.current) {
      initCanvas();
    }
  }, [step]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Check basic email or phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPhoneValid = phone.trim().length >= 8; // Morocco numbers are 9-10 digits usually

    if (!isEmailValid && !isPhoneValid) {
      setFormError(t('cro_lead_error'));
      return;
    }

    // Save lead details locally and to the server database
    try {
      // 1. Submit to server API
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      }).catch(err => console.error("Leads API sync error:", err));

      // 2. Client fallback
      const leads = JSON.parse(localStorage.getItem('leadsBM') || '[]');
      leads.push({ email, phone, date: new Date().toISOString() });
      localStorage.setItem('leadsBM', JSON.stringify(leads));
    } catch (err) {
      console.error(err);
    }

    // Advance to scratching page!
    setStep(1);
  };

  // Scratch mouse/touch drawing coordination
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support touch and mouse events
    const touches = 'touches' in e ? e.touches : null;
    const clientX = touches && touches.length > 0 ? touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = touches && touches.length > 0 ? touches[0].clientY : (e as MouseEvent).clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set composition to destination-out which transparently erases the coating layer
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    checkScratchProgress();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  // Calculate scratched area percent to trigger automatic reveals
  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    // Check transparency counts in pixel strides to be highly performant
    for (let i = 0; i < pixels.length; i += 32) {
      if (pixels[i + 3] === 0) {
        transparentCount++;
      }
    }

    const percent = (transparentCount / (pixels.length / 32)) * 100;
    setScratchedPercent(Math.round(percent));

    // Once 50% scratched, reveal completely and register coupon gift state
    if (percent >= 50) {
      // Clear coating
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Hook configurations inside Cart Context
      applyDailyGift(reward.code, reward.name);
      
      // Auto apply coupon if it corresponds to discount or freeship code
      if (reward.code === 'BEAUTY10' || reward.code === 'FREESHIP') {
        void applyCouponCode(reward.code);
      }

      setTimeout(() => {
        setStep(2); // Show success screen
      }, 500);
    }
  };

  if (!isVisible) return null;

  const isRTL = language === 'AR';

  const backdropCls = [
    't-modal-backdrop',
    'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  const modalCls = [
    't-modal',
    'relative w-full max-w-[420px] bg-gradient-to-b from-[#080f1e]/98 to-[#0c1930]/98 border border-solid border-accent/15 rounded-3xl shadow-[0_0_50px_rgba(13,148,136,0.12)] p-6 md:p-8 text-white overflow-hidden',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  return (
    <div className={backdropCls}>
      
      {/* Modal Card container */}
      <div 
        className={modalCls}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        
        {/* Floating ambient glow blobs */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-accent/20 rounded-full blur-3xl pointer-events-none animate-morph-blob" style={{ animationDuration: '8s' }} />

        {/* Header Close button */}
        <button 
          onClick={onClose}
          aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
          className="absolute top-5 right-5 rtl:left-5 rtl:right-auto p-2 text-slate-400/80 hover:text-accent rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer z-20"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* ========================================================
           STEP 0: Registration Lead Capture Form
           ======================================================== */}
        {step === 0 && (
          <div className="space-y-6 text-center pt-2">
            <div className="inline-flex p-3 bg-accent/10 border border-solid border-accent/25 rounded-full text-accent mx-auto shadow-[0_0_15px_rgba(13,148,136,0.15)] animate-[pulse_3s_infinite]">
              <Gift className="w-6.5 h-6.5" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent block">
                {t('cro_daily_gift_badge')}
              </span>
              <h3 className="text-xl md:text-2xl font-black font-heading text-white leading-tight">
                {t('cro_daily_gift_title')}
              </h3>
              <p className="text-xs text-slate-300/80 leading-relaxed max-w-[280px] mx-auto">
                {t('cro_daily_gift_sub')}
              </p>
            </div>

            {/* Form submission fields */}
            <form onSubmit={handleLeadSubmit} className="space-y-4 pt-2">
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 w-4 h-4 text-accent/70" />
                <input
                  type="email"
                  placeholder={t('cro_lead_placeholder_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3.5 bg-white/5 border border-solid border-white/10 rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 hover:border-white/20 transition-all duration-300 text-white placeholder-slate-400"
                />
              </div>

              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 w-4 h-4 text-accent/70" />
                <input
                  type="tel"
                  placeholder={t('cro_lead_placeholder_phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3.5 bg-white/5 border border-solid border-white/10 rounded-xl text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 hover:border-white/20 transition-all duration-300 text-white placeholder-slate-400"
                />
              </div>

              {formError && (
                <span className="text-[10px] font-bold text-rose-500 block leading-tight">{formError}</span>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-accent to-teal-700 hover:from-teal-700 hover:to-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(13,148,136,0.25)] hover:shadow-[0_4px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 active:scale-98 cursor-pointer border-0 outline-none"
              >
                {t('cro_scratch_cta')}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400/80 pt-1">
              <Lock className="w-3 h-3 text-accent" />
              <span>{language === 'FR' ? 'Informations 100% sécurisées et confidentielles' : 'معلومات آمنة وسرية 100%'}</span>
            </div>
          </div>
        )}

        {/* ========================================================
           STEP 1: Interactive Canvas Scratch Card Area
           ======================================================== */}
        {step === 1 && (
          <div className="space-y-6 text-center pt-2">
            <h3 className="text-lg font-black text-white">
              {language === 'FR' ? 'Grattez pour révéler !' : 'احكي الكشط للفوز !'}
            </h3>
            <p className="text-xs text-slate-300/80">
              {t('cro_scratch_instructions')}
            </p>

            {/* Interactive Scratch card frame */}
            <div className="relative w-[300px] h-[180px] mx-auto rounded-2xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#0c1930] to-[#162a50] flex items-center justify-center border border-solid border-accent/30">
              
              {/* Prize reward view beneath canvas */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4 text-white z-0 text-center select-none bg-gradient-to-b from-[#080f1e] to-[#0c1a33] border border-accent/15 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shadow-[0_0_10px_rgba(13,148,136,0.15)] animate-[pulse_2.5s_infinite] mb-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-accent font-black">
                  {language === 'FR' ? 'PRESCRIPTION PRIVILÈGE' : 'الوصفة الحصرية المعتمدة'}
                </span>
                <span className="text-[13px] font-black leading-tight max-w-[240px] block text-white">{reward.name}</span>
                <span className="inline-block text-[11px] font-mono bg-accent/15 text-accent border border-accent/25 px-2.5 py-0.5 rounded tracking-widest uppercase mt-1">
                  {reward.code}
                </span>
              </div>

              {/* HTML5 Canvas surface Layer */}
              <canvas
                ref={canvasRef}
                width={300}
                height={180}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => { setIsScratching(true); const { x, y } = getCoordinates(e); scratch(x, y); }}
                onTouchMove={(e) => { if (!isScratching) return; const { x, y } = getCoordinates(e); scratch(x, y); }}
                onTouchEnd={handleMouseUp}
                className="absolute inset-0 cursor-pointer select-none z-10 touch-none"
              />
            </div>

            {/* Scraping percentage details */}
            <div className="space-y-2">
              <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden max-w-[220px] mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-teal-700 transition-all duration-300 rounded-full"
                  style={{ width: `${scratchedPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">{language === 'FR' ? `Révélé : ${scratchedPercent}%` : `النسبة المكتشفة: ${scratchedPercent}%`}</span>
            </div>
          </div>
        )}

        {/* ========================================================
           STEP 2: Reward Applied Success View
           ======================================================== */}
        {step === 2 && (
          <div className="space-y-6 text-center pt-2">
            <div className="inline-flex p-4 bg-accent/10 text-accent rounded-full border border-solid border-accent/25 mx-auto shadow-[0_0_20px_rgba(13,148,136,0.2)] animate-[pulse_2.5s_infinite]">
              <Sparkles className="w-8 h-8 text-accent animate-[spin_6s_linear_infinite]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-accent font-heading tracking-tight">
                {language === 'FR' ? 'Félicitations !' : 'تهانينا الحارة !'}
              </h3>
              <p className="text-xs text-slate-300/80 font-medium max-w-[280px] mx-auto leading-relaxed">
                {t('cro_gift_applied')}
              </p>
            </div>

            {/* Glowing coupon display box */}
            <div className="p-5 bg-white/5 rounded-2xl border border-solid border-white/10 max-w-[320px] mx-auto space-y-2 shadow-[0_0_30px_rgba(0,0,0,0.25)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent pointer-events-none" />
              <span className="text-[9px] uppercase tracking-widest text-accent font-bold block">{language === 'FR' ? 'Cadeau débloqué' : 'الهدية المفعلة'}</span>
              <span className="text-[13px] font-black text-white block leading-tight">{reward.name}</span>
              <span className="inline-block text-xs font-mono bg-accent text-white px-3.5 py-1 rounded font-bold uppercase tracking-widest mt-1 shadow-[0_2px_10px_rgba(13,148,136,0.3)]">
                {reward.code}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-accent to-teal-700 hover:from-teal-700 hover:to-accent text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(13,148,136,0.2)] hover:-translate-y-0.5 active:scale-98 cursor-pointer border-0 outline-none"
            >
              {language === 'FR' ? 'Continuer mes achats️' : 'مواصلة التسوق️'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
