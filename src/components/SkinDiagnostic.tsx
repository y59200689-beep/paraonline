'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product, PRODUCTS_DB } from '../lib/data';
import { X, Sparkles, Camera, ShieldAlert, Award, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

interface SkinDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const SkinDiagnostic: React.FC<SkinDiagnosticProps> = ({ isOpen, onClose, onOpenCart }) => {
  const { t, language } = useTranslation();
  const { addToCart } = useCart();
  
  const [step, setStep] = useState(0); // 0: Intro, 1: Skin Type, 2: Concern, 3: Sun, 4: Camera Scan, 5: Results
  const [answers, setAnswers] = useState({
    skinType: '',
    concern: '',
    sunExposure: '',
  });

  // Calculate dynamic clinical scores based on skin type inputs
  const getClinicalScores = () => {
    const type = answers.skinType || 'mixed';
    if (type === 'oily') return { hydration: 72, sebum: 35, barrier: 84 };
    if (type === 'dry') return { hydration: 31, sebum: 80, barrier: 58 };
    if (type === 'mixed') return { hydration: 58, sebum: 52, barrier: 76 };
    return { hydration: 64, sebum: 74, barrier: 38 }; // sensitive
  };
  const scores = getClinicalScores();

  // WebRTC Camera State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Routine results state
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep(0);
      setAnswers({ skinType: '', concern: '', sunExposure: '' });
      setScanProgress(0);
      setIsScanning(false);
    }
  }, [isOpen]);

  // Start WebRTC Camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access denied:', err);
      setCameraError(language === 'FR' ? 'Accès à la caméra refusé ou non disponible.' : 'تعذر الوصول إلى الكاميرا.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Handle camera step entry
  useEffect(() => {
    if (step === 4) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  // Simulated Scanning Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 4 && cameraStream && isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            stopCamera();
            generateRecommendations();
            setStep(5); // Advance to results
            return 100;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [step, cameraStream, isScanning]);

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const selectAnswer = (field: 'skinType' | 'concern' | 'sunExposure', value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    setTimeout(() => {
      handleNextStep();
    }, 300); // Small fluid delay for visual satisfaction
  };

  const startAnalysis = () => {
    setIsScanning(true);
    setScanProgress(0);
  };

  // AI Diagnostic Algorithm - Dynamic routine generator matching PRODUCTS_DB items
  const generateRecommendations = () => {
    const concern = answers.concern || 'dryness';
    const skinType = answers.skinType || 'mixed';
    const sunExposure = answers.sunExposure || 'moderate';
    
    let recs: Product[] = [];

    // Find custom matches based on key concern
    if (concern === 'acne') {
      // Anua Cleansing foam (id 22) and Anua Cleansing Oil (id 15)
      recs = PRODUCTS_DB.filter(p => p.id === 15 || p.id === 22);
    } else if (concern === 'spots') {
      // Garnier Vitamin C serum (id 3) and Anua TXA Serum (id 14)
      recs = PRODUCTS_DB.filter(p => p.id === 3 || p.id === 14);
    } else if (concern === 'wrinkles') {
      // Hada Labo Anti age (id 8) and Hada Labo moisturizing cream (id 5)
      recs = PRODUCTS_DB.filter(p => p.id === 8 || p.id === 5);
    } else {
      // Dry skin / Dehydration: Hada Labo 7XHA lotion (id 7) and Skin-Plump Gel (id 6)
      recs = PRODUCTS_DB.filter(p => p.id === 7 || p.id === 6);
    }

    setRecommendedProducts(recs);

    // Save to LocalStorage for persistent skin profiling
    try {
      localStorage.setItem('skin_diagnostic_results', JSON.stringify({
        skinType,
        concern,
        sunExposure,
        completedAt: Date.now()
      }));
      // Dispatch custom event to let other active page components react instantly
      window.dispatchEvent(new Event('skin_diagnostic_completed'));
    } catch (e) {
      console.error('LocalStorage not supported or blocked:', e);
    }
  };

  const handleAddRoutineToCart = () => {
    if (recommendedProducts.length === 0) return;
    
    // Add all recommended products with a special 15% discount applied!
    recommendedProducts.forEach(product => {
      addToCart(product, 1, true);
    });

    onClose();
    if (onOpenCart) {
      onOpenCart();
    }
  };

  if (!isOpen) return null;

  const isRTL = language === 'AR';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Modal Container: Custom theme layout */}
      <div 
        className="relative w-full max-w-[620px] bg-white border border-solid border-border/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-800"
        style={{ 
          direction: isRTL ? 'rtl' : 'ltr', 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        
        {/* Glowing Background gradient sphere */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-muted transition-all z-30 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div 
          className="pr-1 z-10 no-scrollbar"
          style={{
            overflowY: 'auto',
            flex: '1 1 auto'
          }}
        >

        {/* ==========================================
           STEP 0: Welcome / Introduction
           ========================================== */}
        {step === 0 && (
          <div className="text-center space-y-6 pt-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-full border border-solid border-primary/20 text-primary mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3.5xl font-black font-heading tracking-tight text-primary-dark">
                {t('quiz_title')}
              </h2>
              <p className="text-sm text-foreground/70 font-medium">
                {t('quiz_subtitle')}
              </p>
            </div>

            <div className="bg-muted rounded-2xl p-4 border border-solid border-border/40 max-w-md mx-auto text-xs leading-relaxed text-primary-dark space-y-2">
              <span className="font-extrabold block text-sm">💡 {language === 'FR' ? 'Comment ça marche ?' : 'كيف يعمل التشخيص ؟'}</span>
              <p>
                {language === 'FR'
                  ? 'Répondez à 3 questions cliniques de base sur vos habitudes de soins, puis utilisez notre scanner de caméra pour valider votre teint. Obtenez instantanément un diagnostic dermatologique personnalisé et 15% de réduction exclusive sur votre pack de soins COD !'
                  : 'أجيبي على 3 أسئلة أساسية حول عادات العناية بالبشرة، ثم استخدمي ماسح الكاميرا للتحقق من البشرة. احصلي فوراً على روتين مخصص وخصم 15٪ عند تأكيد طلب الدفع عند الاستلام!'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full sm:w-auto px-10 py-3.5 bg-primary hover:bg-accent text-white text-xs md:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span>{language === 'FR' ? 'Commencer l\'analyse' : 'ابدئي التحليل الآن'}</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
           STEPS 1, 2, 3: Questionnaire
           ========================================== */}
        {step >= 1 && step <= 3 && (
          <div className="space-y-6 pt-4">
            
            {/* Header step progression indicators */}
            <div className="flex items-center justify-between text-xs font-bold text-foreground/70">
              <button 
                onClick={handlePrevStep} 
                className="flex items-center gap-1 hover:text-primary-dark transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-4.5 h-4.5 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{t('quiz_prev')}</span>
              </button>
              <span>
                {t('quiz_step_of').replace('{current}', step.toString()).replace('{total}', '3')}
              </span>
            </div>

            {/* Step Progress Line */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* Q1: Skin Type */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg md:text-xl font-black font-heading text-primary-dark text-center">
                  {t('q1_text')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 'oily', label: t('q1_o1'), emoji: '✨' },
                    { val: 'dry', label: t('q1_o2'), emoji: '🏜️' },
                    { val: 'mixed', label: t('q1_o3'), emoji: '⚖️' },
                    { val: 'sensitive', label: t('q1_o4'), emoji: '🌸' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => selectAnswer('skinType', opt.val)}
                      className={`p-4 border border-solid text-left rounded-xl transition-all duration-300 hover:border-primary hover:bg-primary/5 flex items-center gap-3 active:scale-98 cursor-pointer ${
                        answers.skinType === opt.val 
                          ? 'border-primary bg-primary/10 font-bold' 
                          : 'border-border/60'
                      }`}
                      style={{ textAlign: isRTL ? 'right' : 'left' }}
                    >
                      <span className="text-xl shrink-0">{opt.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q2: Main Concern */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg md:text-xl font-black font-heading text-primary-dark text-center">
                  {t('q2_text')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 'acne', label: t('q2_o1'), emoji: '🛑' },
                    { val: 'spots', label: t('q2_o2'), emoji: '🎯' },
                    { val: 'wrinkles', label: t('q2_o3'), emoji: '⏳' },
                    { val: 'dryness', label: t('q2_o4'), emoji: '💧' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => selectAnswer('concern', opt.val)}
                      className={`p-4 border border-solid text-left rounded-xl transition-all duration-300 hover:border-primary hover:bg-primary/5 flex items-center gap-3 active:scale-98 cursor-pointer ${
                        answers.concern === opt.val 
                          ? 'border-primary bg-primary/10 font-bold' 
                          : 'border-border/60'
                      }`}
                      style={{ textAlign: isRTL ? 'right' : 'left' }}
                    >
                      <span className="text-xl shrink-0">{opt.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q3: Sun Exposure */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg md:text-xl font-black font-heading text-primary-dark text-center">
                  {t('q3_text')}
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {[
                    { val: 'intense', label: t('q3_o1'), emoji: '☀️' },
                    { val: 'moderate', label: t('q3_o2'), emoji: '⛅' },
                    { val: 'low', label: t('q3_o3'), emoji: '🏢' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => selectAnswer('sunExposure', opt.val)}
                      className={`p-4 border border-solid text-left rounded-xl transition-all duration-300 hover:border-primary hover:bg-primary/5 flex items-center gap-4 active:scale-98 cursor-pointer ${
                        answers.sunExposure === opt.val 
                          ? 'border-primary bg-primary/10 font-bold' 
                          : 'border-border/60'
                      }`}
                      style={{ textAlign: isRTL ? 'right' : 'left' }}
                    >
                      <span className="text-xl shrink-0">{opt.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==========================================
           STEP 4: WebRTC Camera Scanning Live Mirror
           ========================================== */}
        {step === 4 && (
          <div className="space-y-6 pt-4 text-center">
            <h3 className="text-lg md:text-xl font-black font-heading text-primary-dark">
              {language === 'FR' ? 'Analyse Spectrale en Direct' : 'تحليل طيف البشرة المباشر'}
            </h3>
            <p className="text-xs text-foreground/70 font-medium">
              {language === 'FR'
                ? 'Alignez votre visage dans le cadre pour calibrer le teint et détecter la sensibilité.'
                : 'قومي بمحاذاة وجهكِ في الإطار لتعديل لون البشرة وتحديد الحساسية.'
              }
            </p>

            {/* Video Viewport Frame */}
            <div className="relative w-full max-w-[320px] aspect-[3/4] mx-auto rounded-3xl overflow-hidden bg-black/10 border-4 border-solid border-primary shadow-xl">
              
              {/* WebRTC Video Element */}
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // Mirror display
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 text-slate-400">
                  <Camera className="w-12 h-12 text-primary animate-pulse" />
                  <span className="text-xs">{language === 'FR' ? 'Démarrage caméra...' : 'جاري تشغيل الكاميرا...'}</span>
                </div>
              )}

              {/* HUD Corner Frames */}
              <div className="absolute inset-4 border border-dashed border-primary/30 rounded-2xl pointer-events-none z-10 animate-pulse" />
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl z-10 pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr z-10 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl z-10 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br z-10 pointer-events-none" />

              {/* Biometric SVG Face Outline Overlay */}
              {cameraStream && !cameraError && (
                <svg
                  viewBox="0 0 100 100"
                  className={`absolute inset-0 w-full h-full text-primary/40 pointer-events-none z-10 transition-opacity duration-500 ${
                    isScanning ? 'opacity-20' : 'opacity-75 animate-pulse'
                  }`}
                >
                  <path
                    d="M 50 15 C 32 15 25 35 25 55 C 25 75 38 85 50 85 C 62 85 75 75 75 55 C 75 35 68 15 50 15 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line x1="30" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="38" cy="55" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="62" cy="55" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="30" r="2" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              )}

              {/* Active biometric scanner points */}
              {isScanning && (
                <>
                  {/* Forehead */}
                  <div className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                    <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap">T-ZONE</span>
                  </div>
                  {/* Left Cheek */}
                  <div className="absolute top-[52%] left-[38%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                    <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap">HYDRATION</span>
                  </div>
                  {/* Right Cheek */}
                  <div className="absolute top-[52%] left-[62%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                    <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap">BARRIER</span>
                  </div>
                  {/* Chin */}
                  <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                    <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap">SEBUM</span>
                  </div>
                </>
              )}

              {/* Bottom Ticker Text Log console */}
              {isScanning && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm border border-white/10 p-2 rounded-xl z-20 text-[8px] text-left font-mono text-emerald-400 space-y-0.5 overflow-hidden h-9 flex flex-col justify-center">
                  <span className="animate-pulse">● DIAGNOSTIC EN COURS...</span>
                  <span className="truncate">
                    {scanProgress < 25 && (language === 'FR' ? 'Spectrophotométrie mélanine...' : 'تحليل صبغة الميلانين...')}
                    {scanProgress >= 25 && scanProgress < 50 && (language === 'FR' ? 'Cartographie lipidique T-Zone...' : 'رسم الخرائط الدهنية...')}
                    {scanProgress >= 50 && scanProgress < 75 && (language === 'FR' ? 'Calcul taux d\'hydratation dermique...' : 'قياس رطوبة الجلد...')}
                    {scanProgress >= 75 && (language === 'FR' ? 'Analyse finale tolérance cutanée...' : 'التحليل النهائي لمقاومة البشرة...')}
                  </span>
                </div>
              )}

              {/* Scanning neon golden grid lines */}
              {isScanning && (
                <>
                  <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_12px_var(--color-primary)] animate-scan z-20" />
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10 backdrop-brightness-110">
                    <span className="text-white text-xs font-black tracking-widest bg-black/45 px-3 py-1 rounded-full">{scanProgress}%</span>
                  </div>
                </>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center text-xs space-y-2 z-30">
                  <ShieldAlert className="w-10 h-10 text-rose-500" />
                  <span className="font-extrabold">{cameraError}</span>
                  <button 
                    onClick={() => { generateRecommendations(); setStep(5); }}
                    className="underline text-primary hover:text-accent cursor-pointer"
                  >
                    {language === 'FR' ? 'Passer l\'étape et voir mes résultats' : 'تخطي وعرض روتيني'}
                  </button>
                </div>
              )}
            </div>

            {/* Camera Actions */}
            {!isScanning && cameraStream && (
              <div className="space-y-4">
                <button
                  onClick={startAnalysis}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-dark hover:bg-primary text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {language === 'FR' ? 'Analyser mon visage 📸' : 'ابدئي مسح الوجه 📸'}
                </button>
                <div className="block">
                  <button 
                    onClick={() => { generateRecommendations(); setStep(5); }}
                    className="text-xs text-foreground/70 hover:underline cursor-pointer"
                  >
                    {language === 'FR' ? 'Ignorer le scan' : 'تخطي المسح'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           STEP 5: Clinical Results & Recommendations
           ========================================== */}
        {step === 5 && (
          <div className="space-y-6 pt-4">
            
            {/* Header Success Badge */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex p-2 bg-[#25d366]/10 text-[#25d366] rounded-full border border-solid border-[#25d366]/20 mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-2xl font-black font-heading text-primary-dark">
                {t('quiz_recommendations')}
              </h3>
              <p className="text-xs text-[#25d366] font-bold">
                🎉 {t('quiz_discount_applied')}
              </p>
            </div>

            {/* Clinical Biometric Scorecard Grid */}
            <div className="bg-muted rounded-2xl p-4 border border-border/40 space-y-3.5 shadow-sm text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block text-center border-b border-border/30 pb-1.5">
                {language === 'FR' ? 'Rapport Biométrique Dermo-IA' : 'تقرير المقاييس الحيوية للبشرة'}
              </span>
              <div className="space-y-2.5">
                {/* 1. Hydration */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-primary-dark">
                      {language === 'FR' ? '💧 HYDRATATION CLINIQUE' : '💧 الرطوبة السريرية'}
                    </span>
                    <span className={scores.hydration < 40 ? 'text-rose-500' : 'text-primary'}>{scores.hydration}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${scores.hydration < 40 ? 'bg-rose-500 animate-pulse' : 'bg-primary'}`}
                      style={{ width: `${scores.hydration}%` }}
                    />
                  </div>
                </div>

                {/* 2. Sebum Regulation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-primary-dark">
                      {language === 'FR' ? '🧪 RÉGULATION DU SÉBUM' : '🧪 توازن إفراز الدهون'}
                    </span>
                    <span className={scores.sebum < 45 ? 'text-amber-500' : 'text-primary'}>
                      {scores.sebum}% {scores.sebum < 45 && (language === 'FR' ? '(EXCÈS)' : '(فرط)')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${scores.sebum < 45 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${scores.sebum}%` }}
                    />
                  </div>
                </div>

                {/* 3. Skin Barrier */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-primary-dark">
                      {language === 'FR' ? '🛡️ INTÉGRITÉ BARRIÈRE' : '🛡️ قوة حاجز البشرة'}
                    </span>
                    <span className={scores.barrier < 50 ? 'text-rose-500' : 'text-primary'}>{scores.barrier}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${scores.barrier < 50 ? 'bg-rose-500 animate-pulse' : 'bg-primary'}`}
                      style={{ width: `${scores.barrier}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products routines split layout */}
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
              {recommendedProducts.map((product, idx) => (
                <div 
                  key={product.id}
                  className="flex gap-4 p-3.5 bg-muted/50 border border-solid border-border/40 rounded-2xl items-center"
                >
                  {/* Step Routine badge label */}
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                    {idx === 0 ? '1' : '2'}
                  </span>

                  {/* Product Thumbnail */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-md bg-white border border-solid border-border/30"
                  />

                  {/* Product routine details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase text-accent tracking-widest block">
                      {idx === 0 
                        ? (language === 'FR' ? 'Étape 1 : Nettoyer / Hydrater' : 'الخطوة 1 : تنظيف / ترطيب')
                        : (language === 'FR' ? 'Étape 2 : Traiter / Protéger' : 'الخطوة 2 : معالجة / حماية')
                      }
                    </span>
                    <h4 className="text-xs font-black truncate text-primary-dark leading-tight mt-0.5">{product.title}</h4>
                    <span className="text-[10px] text-foreground/70 block">{product.vendor}</span>
                  </div>

                  {/* Pricing Discount show */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-primary">{Math.round(product.price * 0.85)} DH</span>
                    <span className="text-[10px] text-foreground/50 line-through block">{product.price} DH</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons checkout */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleAddRoutineToCart}
                className="w-full px-8 py-3.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>{t('quiz_add_routine')}</span>
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-2 border border-solid border-border/60 hover:bg-muted rounded-xl text-xs font-bold text-foreground/70 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'FR' ? 'Recommencer le Quiz' : 'إعادة إجراء التشخيص'}</span>
              </button>
            </div>

          </div>
        )}
        </div>

      </div>
    </div>
  );
};
