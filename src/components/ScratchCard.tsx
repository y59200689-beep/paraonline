'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Gift, X, Sparkles, Mail, Phone, Lock } from 'lucide-react';

interface ScratchCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const { applyDailyGift, applyCouponCode } = useCart();

  const [step, setStep] = useState(0); // 0: Lead Form, 1: Scratch Area, 2: Reward Applied
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [reward, setReward] = useState({ code: 'GIFTGLOW', name: 'Glow Gift' });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  // List of potential rewards
  const REWARDS = [
    { code: 'GIFTGLOW', name_fr: 'Masque Hydratant Glow Offert 🎁', name_ar: 'قناع مرطب للبشرة هدية مجانية 🎁' },
    { code: 'BEAUTY10', name_fr: 'Remise Exclusive de 10% 💸', name_ar: 'خصم حصري بقيمة 10٪ 💸' },
    { code: 'FREESHIP', name_fr: 'Livraison 100% Gratuite 🚚', name_ar: 'توصيل مجاني 100٪ 🚚' },
  ];

  // Pick a random reward on mounting
  useEffect(() => {
    const selected = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setReward({
      code: selected.code,
      name: language === 'FR' ? selected.name_fr : selected.name_ar,
    });
  }, [language, isOpen]);

  // Canvas context setups when scratch stage starts
  useEffect(() => {
    if (step === 1 && canvasRef.current) {
      initCanvas();
    }
  }, [step]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with modern metallic light pink/lavender luxury coating
    ctx.fillStyle = '#FBCFE8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add luxury branding text inside the coating
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#831843';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      language === 'FR' ? 'GRATTEZ ICI' : 'احكي هنا للكشف',
      canvas.width / 2,
      canvas.height / 2
    );

    // Draw grid border lines
    ctx.strokeStyle = 'rgba(131, 24, 67, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
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

    // Save lead details locally or to database
    try {
      const leads = JSON.parse(localStorage.getItem('leadsBM') || '[]');
      leads.push({ email, phone, date: new Date().toISOString() });
      localStorage.setItem('leadsBM', JSON.stringify(leads));
    } catch (err) {}

    // Advance to scratching page!
    setStep(1);
  };

  // Scratch mouse/touch drawing coordination
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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
        applyCouponCode(reward.code);
      }

      setTimeout(() => {
        setStep(2); // Show success screen
      }, 500);
    }
  };

  if (!isOpen) return null;

  const isRTL = language === 'AR';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      
      {/* Modal Card container */}
      <div 
        className="relative w-full max-w-[420px] bg-white border border-solid border-border/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-800 overflow-hidden"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        
        {/* Floating gold glitter icons */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-muted transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================
           STEP 0: Registration Lead Capture Form
           ======================================================== */}
        {step === 0 && (
          <div className="space-y-6 text-center pt-2">
            <div className="inline-flex p-3 bg-primary/10 border border-solid border-primary/20 rounded-full text-primary mx-auto animate-[pulse_3s_infinite]">
              <Gift className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent block">
                {t('cro_daily_gift_badge')}
              </span>
              <h3 className="text-xl md:text-2xl font-black font-heading text-primary-dark">
                {t('cro_daily_gift_title')}
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed max-w-[280px] mx-auto">
                {t('cro_daily_gift_sub')}
              </p>
            </div>

            {/* Form submission fields */}
            <form onSubmit={handleLeadSubmit} className="space-y-4 pt-2">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
                <input
                  type="email"
                  placeholder={t('cro_lead_placeholder_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-solid border-border/40 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 "
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
                <input
                  type="tel"
                  placeholder={t('cro_lead_placeholder_phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-solid border-border/40 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 "
                />
              </div>

              {formError && (
                <span className="text-[10px] font-bold text-rose-500 block leading-tight">{formError}</span>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {t('cro_scratch_cta')}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-foreground/70 pt-1">
              <Lock className="w-3 h-3 text-accent" />
              <span>{language === 'FR' ? 'Informations 100% sécurisées et confidentielles' : 'معلومات آمنة وسرية 100٪'}</span>
            </div>
          </div>
        )}

        {/* ========================================================
           STEP 1: Interactive Canvas Scratch Card Area
           ======================================================== */}
        {step === 1 && (
          <div className="space-y-6 text-center pt-2">
            <h3 className="text-lg font-black text-primary-dark">
              {language === 'FR' ? 'Grattez pour révéler !' : 'احكي الكشط للفوز !'}
            </h3>
            <p className="text-xs text-foreground/70">
              {t('cro_scratch_instructions')}
            </p>

            {/* Interactive Scratch card frame */}
            <div className="relative w-[280px] h-[160px] mx-auto rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary-dark to-accent flex items-center justify-center border border-solid border-primary">
              
              {/* Prize reward view beneath canvas */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 p-4 text-white z-0 text-center select-none">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                  {language === 'FR' ? 'VOTRE CADEAU EXCLUSIF' : 'هديتكِ الحصرية'}
                </span>
                <span className="text-xs font-black leading-tight max-w-[200px] block">{reward.name}</span>
                <span className="text-[11px] px-2 py-0.5 bg-white/10 rounded font-serif tracking-widest">{reward.code}</span>
              </div>

              {/* HTML5 Canvas surface Layer */}
              <canvas
                ref={canvasRef}
                width={280}
                height={160}
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
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-[200px] mx-auto">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${scratchedPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-foreground/70 block">{language === 'FR' ? `Révélé : ${scratchedPercent}%` : `النسبة المكتشفة: ${scratchedPercent}%`}</span>
          </div>
        )}

        {/* ========================================================
           STEP 2: Reward Applied Success View
           ======================================================== */}
        {step === 2 && (
          <div className="space-y-6 text-center pt-2">
            <div className="inline-flex p-3.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-solid border-emerald-500/20 mx-auto">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-emerald-500">
                {language === 'FR' ? 'Félicitations ! 🎉' : 'تهانينا الحارة ! 🎉'}
              </h3>
              <p className="text-xs text-foreground/70 font-medium">
                {t('cro_gift_applied')}
              </p>
            </div>

            {/* Glowing coupon display box */}
            <div className="p-4 bg-muted rounded-2xl border border-solid border-border/40 max-w-sm mx-auto space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-foreground/70 block">{language === 'FR' ? 'Cadeau débloqué' : 'الهدية المفعلة'}</span>
              <span className="text-sm font-black text-primary-dark block leading-tight">{reward.name}</span>
              <span className="inline-block text-xs font-serif bg-primary text-white px-3 py-1 rounded font-bold uppercase tracking-widest mt-1">
                {reward.code}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-primary-dark hover:bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {language === 'FR' ? 'Continuer mes achats 🛍️' : 'مواصلة التسوق 🛍️'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
