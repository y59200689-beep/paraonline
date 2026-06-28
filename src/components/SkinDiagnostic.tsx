/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useLoyalty } from '@/context/LoyaltyContext';
import { Product } from '@/lib/data';
import { useProducts } from '@/context/ProductsContext';
import { X, Sparkles, Camera, ShieldAlert, Award, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useUi } from '@/context/UiContext';
import diagnosticQuestions from '@/data/diagnostic-questions.json';
import { useSettings } from '@/context/SettingsContext';

interface SkinDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const SkinDiagnostic: React.FC<SkinDiagnosticProps> = ({ isOpen, onClose, onOpenCart }) => {
  const { t, language } = useTranslation();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { earnPoints } = useLoyalty();
  const { setDiagnostic } = useUi();
  const { settings } = useSettings();
  const [matchedRule, setMatchedRule] = useState<any>(null);

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
  
  const [step, setStep] = useState(0); // 0: Intro, 1: Skin Type, 2: Concern, 3: Sun, 4: Camera Scan, 5: Results
  const [answers, setAnswers] = useState({
    skinType: '',
    concern: '',
    sunExposure: '',
  });
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (video) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw mirrored video frame
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
          
          // Apply clinical blue tint filter
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            data[i] = Math.max(0, Math.min(255, gray * 0.4 + 10));     // R
            data[i+1] = Math.max(0, Math.min(255, gray * 0.65 + 35));   // G
            data[i+2] = Math.max(0, Math.min(255, gray * 0.85 + 75));   // B
          }
          ctx.putImageData(imgData, 0, 0);
          
          // HUD grid overlay
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 40; x < canvas.width; x += 40) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
          }
          for (let y = 40; y < canvas.height; y += 40) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
          }
          ctx.stroke();
          
          // HUD targets
          ctx.strokeStyle = 'rgba(13, 148, 136, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(canvas.width / 4, canvas.height / 5, canvas.width / 2, canvas.height * 3/5);
          
          // Labels
          ctx.fillStyle = '#38BDF8';
          ctx.font = '10px monospace';
          ctx.fillText('BIOMETRIC: CALIBRATED', 20, 25);
          ctx.fillText(`SEBUM: ${scores.sebum}%`, 20, 40);
          ctx.fillText(`HYDRATION: ${scores.hydration}%`, 20, 55);
          ctx.fillText('SCAN COMPLETE: 100%', 20, 70);
          ctx.fillText('DERMO-IA SCANNER v2', canvas.width - 140, canvas.height - 15);
          
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedSnapshot(dataUrl);
        }
      } catch (err) {
        console.error("Failed to capture scanner frame:", err);
      }
    }
  };

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Routine results state
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

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
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError(language === 'FR' ? 'Accès à la caméra refusé ou non disponible.' : 'تعذر الوصول إلى الكاميرا.');
    }
  };

  // AI Diagnostic Algorithm - Dynamic routine generator matching PRODUCTS_DB items
  const generateRecommendations = () => {
    const concern = answers.concern || 'dryness';
    const skinType = answers.skinType || 'mixed';
    const sunExposure = answers.sunExposure || 'moderate';
    
    const rules = settings?.diagnosticRules || [];
    let bestRule: any = null;
    let highestScore = -1;

    for (const rule of rules) {
      const matchConcern = rule.concern === 'any' || rule.concern === concern;
      const matchSkinType = rule.skinType === 'any' || rule.skinType === skinType;
      const matchSunExposure = rule.sunExposure === 'any' || rule.sunExposure === sunExposure;

      if (matchConcern && matchSkinType && matchSunExposure) {
        let score = 0;
        if (rule.concern !== 'any') score += 1;
        if (rule.skinType !== 'any') score += 1;
        if (rule.sunExposure !== 'any') score += 1;

        if (score > highestScore) {
          highestScore = score;
          bestRule = rule;
        }
      }
    }

    setMatchedRule(bestRule);

    let recs: Product[] = [];
    if (bestRule && bestRule.productIds && bestRule.productIds.length > 0) {
      recs = products.filter(p => bestRule.productIds.includes(p.id));
    } else {
      // Find custom matches based on key concern
      if (concern === 'acne') {
        // Anua Cleansing foam (id 22) and Anua Cleansing Oil (id 15)
        recs = products.filter(p => p.id === 15 || p.id === 22);
      } else if (concern === 'spots') {
        // Garnier Vitamin C serum (id 3) and Anua TXA Serum (id 14)
        recs = products.filter(p => p.id === 3 || p.id === 14);
      } else if (concern === 'wrinkles') {
        // Hada Labo Anti age (id 8) and Hada Labo moisturizing cream (id 5)
        recs = products.filter(p => p.id === 8 || p.id === 5);
      } else {
        // Dry skin / Dehydration: Hada Labo 7XHA lotion (id 7) and Skin-Plump Gel (id 6)
        recs = products.filter(p => p.id === 7 || p.id === 6);
      }
    }

    setRecommendedProducts(recs);

    // Save to LocalStorage and server database for skin profiling
    try {
      // 1. Submit to server API
      fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skinType, concern, sunExposure })
      }).catch(err => console.error("Diagnostics API sync error:", err));

      // 2. Context sync (handles localStorage write under the hood)
      setDiagnostic({
        skinType,
        concern,
        sunExposure
      });

      // Award loyalty points for skin diagnostic completion
      earnPoints(100, "Diagnostic de peau IA", "تشخيص البشرة بالذكاء الاصطناعي");
    } catch (e) {
      console.error('LocalStorage not supported or blocked:', e);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep(0);
      setAnswers({ skinType: '', concern: '', sunExposure: '' });
      setScanProgress(0);
      setIsScanning(false);
      setCapturedSnapshot(null);
    }
  }, [isOpen]);

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
            
            // Capture snapshot immediately before stopping camera
            captureSnapshot();
            
            stopCamera();
            setIsAnalyzing(true);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [step, cameraStream, isScanning]);

  // Cinematic Analysis Stages Effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisStage(0);
      timeout = setTimeout(() => {
        setAnalysisStage(1);
        timeout = setTimeout(() => {
          setAnalysisStage(2);
          timeout = setTimeout(() => {
            setIsAnalyzing(false);
            generateRecommendations();
            setStep(5);
          }, 1000);
        }, 1000);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isAnalyzing]);

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

  const handleReset = () => {
    setStep(0);
    setAnswers({
      skinType: '',
      concern: '',
      sunExposure: '',
    });
    setScanProgress(0);
    setIsScanning(false);
  };

  if (!isVisible) return null;

  const isRTL = language === 'AR';

  const backdropCls = [
    't-modal-backdrop',
    'fixed inset-0 bg-[#0c0a09]/45 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-hidden',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  const modalCls = [
    't-modal',
    'relative w-full max-w-[580px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl border border-white/20 dark:border-stone-800 rounded-3xl shadow-[0_24px_80px_rgba(27,20,16,0.12),inset_0_1px_2px_rgba(255,255,255,0.4)] flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-stone-100',
    modalState === 'open' ? 'is-open' : modalState === 'closing' ? 'is-closing' : '',
  ].join(' ');

  return (
    <div className={backdropCls}>
      
      {/* Cinematic ambient glow backdrops */}
      <div className="absolute top-[15%] left-[15%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Modal Container: Double-Bezel layout shell */}
      <div 
        className={modalCls}
        style={{ 
          direction: isRTL ? 'rtl' : 'ltr'
        }}
      >
        
        {/* ==========================================
           FIXED HEADER
           ========================================== */}
        <div 
          className="flex items-center justify-between border-b border-[#eedfd2]/15 bg-white/40 dark:bg-stone-900/40 backdrop-blur-md shrink-0 z-20"
          style={{
            paddingTop: '32px',
            paddingBottom: '20px',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="rounded-lg text-primary shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-105"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'rgba(37, 115, 163, 0.1)',
              }}
            >
              <Sparkles className="w-4 h-4 fill-primary" />
            </div>
            <div className="text-left flex flex-col gap-1">
              <span className="text-[11.5px] font-black uppercase tracking-[0.2em] text-primary-dark dark:text-emerald-400 block leading-none">
                Dermo-IA Diagnostic
              </span>
              <span className="text-[8.5px] text-slate-500 dark:text-slate-450 font-extrabold tracking-wider uppercase block leading-none">
                Clinical Skin Profiling
              </span>
            </div>
          </div>

          {/* Close button */}
          <button 
            onClick={onClose}
            aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full transition-all duration-300 active:scale-90 cursor-pointer shrink-0 flex items-center justify-center"
            style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'rgba(238, 223, 210, 0.15)',
            }}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Step Progress Line inside Header for steps 1-3 */}
        {step >= 1 && step <= 3 && (
          <div className="w-full h-1 bg-[#eedfd2]/30 shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* ==========================================
           SCROLLABLE BODY
           ========================================== */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 no-scrollbar"
          style={{
            paddingTop: '16px',
            paddingBottom: '16px',
          }}
        >

          {/* STEP 0: Welcome / Introduction */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-4 py-2 animate-fade-in text-center">
              <div 
                className="inline-flex p-3 bg-primary/10 rounded-full border border-solid border-primary/20 text-primary mx-auto shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] transition-all duration-500 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(236, 72, 153, 0.08)',
                  borderColor: 'rgba(236, 72, 153, 0.15)',
                }}
              >
                <Award className="w-5.5 h-5.5" />
              </div>
              
              <div className="flex flex-col gap-1.5 px-4">
                <h2 className="text-xl md:text-2xl font-extrabold font-heading tracking-tight text-[#3a2218] leading-tight max-w-sm mx-auto">
                  {t('quiz_title')}
                </h2>
                <p className="text-[11px] text-[#705e55] font-semibold max-w-xs mx-auto leading-relaxed opacity-90">
                  {t('quiz_subtitle')}
                </p>
              </div>

              {/* Redesigned structured Clinical steps details - Horizontal Premium Bento Layout */}
              <div 
                className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mx-auto"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
              >
                {[
                  { 
                    num: '01', 
                    title: language === 'FR' ? 'Questionnaire' : 'الاستبيان', 
                    desc: language === 'FR' ? '3 questions cliniques de base ciblées.' : '3 أسئلة سريرية سريعة وموجهة.' 
                  },
                  { 
                    num: '02', 
                    title: language === 'FR' ? 'Scan Direct' : 'مسح مباشر', 
                    desc: language === 'FR' ? 'Scanner intelligent IA par caméra.' : 'مسح كاميرا ذكي بالذكاء الاصطناعي.' 
                  },
                  { 
                    num: '03', 
                    title: language === 'FR' ? 'Ordonnance' : 'روتين مخصص', 
                    desc: language === 'FR' ? 'Votre pack personnalisé à -15% !' : 'روتينك المخصص وخصم 15% عند الطلب !' 
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center gap-3 bg-white/40 dark:bg-stone-800/20 rounded-2xl border border-stone-250/20 dark:border-stone-800 hover:border-primary/25 hover:bg-white/60 dark:hover:bg-stone-800/30 transition-all duration-500 shadow-sm text-center group hover:-translate-y-0.5 p-4"
                  >
                    <div 
                      className="w-8 h-8 rounded-full bg-stone-105/50 text-primary-dark dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 border border-stone-200/40 dark:border-stone-850 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    >
                      {item.num}
                    </div>
                    <div className="flex flex-col gap-1 justify-center items-center">
                      <h4 className="text-[10.5px] font-black text-primary-dark dark:text-slate-200 uppercase tracking-wider leading-none">{item.title}</h4>
                      <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium leading-normal mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
 
              {/* Commencer l'analyse button merged directly into the welcome screen */}
              <button
                onClick={handleNextStep}
                className="group w-full bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_8px_24px_rgba(26,37,93,0.25)] active:scale-98 flex items-center justify-between cursor-pointer mt-4 pl-6 pr-2 py-2"
                style={{
                  borderRadius: '9999px',
                }}
              >
                <span className="py-2">{language === 'FR' ? "Commencer l'analyse" : 'ابدئي التحليل الآن'}</span>
                {/* Nested icon pill — button-in-button pattern */}
                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 shrink-0">
                  <ArrowRight className={`w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                </span>
              </button>
            </div>
          )}

          {/* STEPS 1, 2, 3: Questionnaire */}
          {step >= 1 && step <= 3 && (() => {
            const currentQuestion = diagnosticQuestions.questions.find(q => q.step === step);
            if (!currentQuestion) return null;
            return (
              <div className="flex flex-col gap-6 pt-2 animate-fade-in">
                {/* Header Step Description indicator */}
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#705e55]">
                  <span>
                    {language === 'FR' ? currentQuestion.stepLabelFr : currentQuestion.stepLabelAr}
                  </span>
                  <span>
                    {t('quiz_step_of').replace('{current}', step.toString()).replace('{total}', '3')}
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  <h3 className="text-xl md:text-2xl font-black font-heading text-slate-800 dark:text-white tracking-tight text-center leading-snug">
                    {t(currentQuestion.translationKey)}
                  </h3>
                  <div className={`grid gap-4 ${currentQuestion.step === 3 ? 'grid-cols-1 gap-3.5' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {currentQuestion.options.map(opt => {
                      const isSelected = answers[currentQuestion.field as 'skinType' | 'concern' | 'sunExposure'] === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => selectAnswer(currentQuestion.field as 'skinType' | 'concern' | 'sunExposure', opt.val)}
                          className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                            isSelected 
                              ? 'bg-white/90 dark:bg-stone-900/90 border-primary shadow-[0_8px_30px_rgba(236,72,153,0.12)] ring-2 ring-primary/20 scale-[1.01]' 
                              : 'bg-white/40 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/80 hover:bg-white/70 dark:hover:bg-stone-900/70 hover:scale-[1.01]'
                          }`}
                          style={{ textAlign: isRTL ? 'right' : 'left' }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform ${
                            isSelected ? 'bg-primary/10 text-primary scale-105' : 'bg-stone-100 dark:bg-stone-850 text-stone-500 dark:text-stone-400'
                          }`}>
                            {opt.emoji}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className={`block text-xs font-black leading-tight ${isSelected ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                              {t(opt.labelKey)}
                            </span>
                            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-normal">
                              {language === 'FR' ? opt.descFr : opt.descAr}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 4: WebRTC Camera Scanning Live Mirror */}
          {step === 4 && (
            <div className="space-y-6 pt-2 text-center animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black font-heading text-slate-800 dark:text-white tracking-tight leading-snug">
                  {language === 'FR' ? 'Analyse Spectrale en Direct' : 'تحليل طيف البشرة المباشر'}
                </h3>
                <p className="text-xs text-[#705e55] font-medium max-w-sm mx-auto">
                  {language === 'FR'
                    ? 'Alignez votre visage dans le cadre pour calibrer le teint et détecter la sensibilité.'
                    : 'قومي بمحاذاة وجهكِ في الإطار لتعديل لون البشرة وتحديد الحساسية.'
                  }
                </p>
              </div>

              {/* Viewport Frame */}
              <div className="p-1.5 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl shadow-xl max-w-[280px] aspect-[3/4] mx-auto overflow-hidden">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0c0a09] border-2 border-solid border-[#FDFBF7]">
                  
                  {/* Cinematic AI Analysis Screen overlay */}
                  {isAnalyzing ? (
                    <div className="absolute inset-0 bg-[#080d19] flex flex-col justify-between items-center p-5 font-mono text-[#38BDF8] z-40 animate-fade-in">
                      <div className="w-full flex items-center justify-between text-[7px] text-[#38BDF8]/60 uppercase tracking-widest">
                        <span>SYS: RUNNING_ANALYZE</span>
                        <span>NODE_D4</span>
                      </div>
                      
                      {/* Biometric Scan Circle HUD */}
                      <div className="relative w-28 h-28 flex items-center justify-center my-4 shrink-0">
                        <svg viewBox="0 0 100 100" className="absolute w-full h-full text-[#38BDF8]/20 animate-spin-slow">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" fill="none" />
                        </svg>
                        <svg viewBox="0 0 100 100" className="absolute w-[80%] h-[80%] text-[#10B981]/25 animate-spin-reverse">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" fill="none" />
                        </svg>
                        <div className="w-12 h-12 rounded-full border border-dashed border-[#38BDF8] flex items-center justify-center animate-pulse">
                          <Sparkles className="w-5 h-5 text-[#38BDF8]" />
                        </div>
                      </div>

                      {/* Analysis readout log messages */}
                      <div className="w-full bg-black/60 border border-slate-800/80 rounded-lg p-2.5 text-[8.5px] text-left space-y-1.5 h-20 overflow-hidden select-none">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>[STAGE 01] CALIBRATION TEINT: OK</span>
                        </div>
                        {analysisStage >= 1 && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>[STAGE 02] DETECT SEBUM LEVEL: OK</span>
                          </div>
                        )}
                        {analysisStage >= 2 && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                            <span>[STAGE 03] FORMULATE ROUTINE REC: RUN</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[7.5px] text-[#38BDF8]/55 uppercase tracking-[0.25em] animate-pulse">
                        {language === 'FR' ? 'Analyse Dermo-IA en cours...' : 'جاري تحليل خلايا الجلد...'}
                      </div>
                    </div>
                  ) : cameraStream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]" // Mirror display
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 text-slate-400">
                      <Camera className="w-12 h-12 text-primary animate-pulse" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#705e55]">{language === 'FR' ? 'Démarrage caméra...' : 'جاري تشغيل الكاميرا...'}</span>
                    </div>
                  )}

                  {/* HUD Corner Frames */}
                  <div className="absolute inset-4 border border-dashed border-primary/30 rounded-[10px] pointer-events-none z-10 animate-pulse" />
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl z-10 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr z-10 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl z-10 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br z-10 pointer-events-none" />

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
                    </svg>
                  )}

                  {/* Active biometric scanner points */}
                  {isScanning && (
                    <>
                      {/* Forehead */}
                      <div className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                        <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap tracking-wider">T-ZONE</span>
                      </div>
                      {/* Left Cheek */}
                      <div className="absolute top-[52%] left-[38%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                        <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap tracking-wider">HYDRATION</span>
                      </div>
                      {/* Right Cheek */}
                      <div className="absolute top-[52%] left-[62%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                        <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap tracking-wider">BARRIER</span>
                      </div>
                      {/* Chin */}
                      <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-ping absolute" />
                        <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                        <span className="text-[7px] text-white font-black bg-black/60 px-1 py-0.5 rounded mt-1 scale-75 whitespace-nowrap tracking-wider">SEBUM</span>
                      </div>
                    </>
                  )}

                  {/* Bottom Ticker Text Log console */}
                  {isScanning && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm border border-white/10 p-2 rounded-[8px] z-20 text-[8px] text-left font-mono text-emerald-400 space-y-0.5 overflow-hidden h-9 flex flex-col justify-center">
                      <span className="animate-pulse">● DIAGNOSTIC EN COURS...</span>
                      <span className="truncate">
                        {scanProgress < 25 && (language === 'FR' ? 'Spectrophotométrie mélanine...' : 'تحليل صبغة الميلانين...')}
                        {scanProgress >= 25 && scanProgress < 50 && (language === 'FR' ? 'Cartographie lipidique T-Zone...' : 'رسم الخرائط الدهنية...')}
                        {scanProgress >= 50 && scanProgress < 75 && (language === 'FR' ? 'Calcul taux d\'hydratation dermique...' : 'قياس رطوبة الجلد...')}
                        {scanProgress >= 75 && (language === 'FR' ? 'Analyse finale tolérance cutanée...' : 'التحليل النهائي لمقاومة البشرة...')}
                      </span>
                    </div>
                  )}

                  {/* Scanning neon golden/pink grid lines */}
                  {isScanning && (
                    <>
                      <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_12px_var(--color-primary)] animate-scan z-20" />
                      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-10 backdrop-brightness-110">
                        <span className="text-white text-xs font-black tracking-widest bg-black/55 px-3 py-1 rounded-full">{scanProgress}%</span>
                      </div>
                    </>
                  )}
 
                  {cameraError && (
                    <div className="absolute inset-0 bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center text-xs space-y-4 z-30">
                      <ShieldAlert className="w-10 h-10 text-rose-500" />
                      <span className="font-extrabold text-primary-dark">{cameraError}</span>
                      <button 
                        onClick={() => { generateRecommendations(); setStep(5); }}
                        className="underline text-primary hover:text-primary-dark font-bold cursor-pointer"
                      >
                        {language === 'FR' ? "Passer l'étape et voir mes résultats" : 'تخطي وعرض روتيني'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparency Disclaimer */}
              <p className="text-[10px] text-[#705e55]/70 italic max-w-xs mx-auto leading-normal mt-4">
                {language === 'FR'
                  ? "*Le scan caméra sert d'assistance visuelle pour calibrer l'éclairage. L'ordonnance finale est déterminée par vos réponses cliniques."
                  : "*يعمل مسح الكاميرا كمساعدة بصرية لضبط الإضاءة. يتم تحديد روتينك النهائي بناءً على إجاباتك السريرية."
                }
              </p>
            </div>
          )}

          {/* STEP 5: Clinical Results & Recommendations */}
          {step === 5 && (
            <div className="flex flex-col gap-6 pt-2 animate-fade-in">
              
              {/* Header Success Badge */}
              <div className="text-center flex flex-col gap-2">
                <div className="inline-flex p-2 bg-[#25d366]/10 text-[#25d366] rounded-full border border-solid border-[#25d366]/20 mx-auto shadow-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-black font-heading text-slate-800 dark:text-white tracking-tight leading-tight">
                  {matchedRule ? (language === 'AR' && matchedRule.titleAr ? matchedRule.titleAr : matchedRule.titleFr) : t('quiz_recommendations')}
                </h3>
                {matchedRule && (
                  <p className="text-[11.5px] text-[#705e55] font-semibold max-w-sm mx-auto leading-relaxed -mt-0.5">
                    {language === 'AR' && matchedRule.descriptionAr ? matchedRule.descriptionAr : matchedRule.descriptionFr}
                  </p>
                )}
                <div className="inline-flex px-3 py-1 rounded-full bg-[#25d366]/10 border border-[#25d366]/20 text-xs text-[#1e7e34] font-black tracking-wide mx-auto w-fit"> {t('quiz_discount_applied')} (-15%)
                </div>
              </div>

              {capturedSnapshot && (
                <div className="relative mx-auto rounded-2xl overflow-hidden max-w-[200px] aspect-[3/4] border border-[#eedfd2]/60 shadow-md">
                   <img src={capturedSnapshot} alt="Face scan" className="w-full h-full object-cover" />
                </div>
              )}

              <div 
                className="bg-[#f8ede3]/40 rounded-[10px] border border-[#eedfd2]/60 shadow-sm text-left flex flex-col gap-4"
                style={{ padding: '24px' }}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark block text-center border-b border-[#eedfd2]/30 pb-2">
                  {language === 'FR' ? 'Rapport Biométrique Dermo-IA' : 'تقرير المقاييس الحيوية للبشرة'}
                </span>
                <div className="flex flex-col gap-3.5">
                  {/* 1. Hydration */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-black text-primary-dark">
                      <span>
                        {language === 'FR' ? 'HYDRATATION CLINIQUE' : 'الرطوبة السريرية'}
                      </span>
                      <span className={scores.hydration < 40 ? 'text-rose-500 animate-pulse' : 'text-primary'}>{scores.hydration}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#eedfd2]/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${scores.hydration < 40 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-primary-dark to-primary'}`}
                        style={{ width: `${scores.hydration}%` }}
                      />
                    </div>
                  </div>
 
                  {/* 2. Sebum Regulation */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-black text-primary-dark">
                      <span>
                        {language === 'FR' ? 'RÉGULATION DU SÉBUM' : 'توازن إفراز الدهون'}
                      </span>
                      <span className={scores.sebum < 45 ? 'text-amber-600' : 'text-primary'}>
                        {scores.sebum}% {scores.sebum < 45 && (language === 'FR' ? '(EXCÈS)' : '(فرط)')}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#eedfd2]/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${scores.sebum < 45 ? 'bg-amber-500' : 'bg-gradient-to-r from-primary-dark to-primary'}`}
                        style={{ width: `${scores.sebum}%` }}
                      />
                    </div>
                  </div>
 
                  {/* 3. Skin Barrier */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-black text-primary-dark">
                      <span>
                        {language === 'FR' ? '️ INTÉGRITÉ BARRIÈRE' : '️ قوة حاجز البشرة'}
                      </span>
                      <span className={scores.barrier < 50 ? 'text-rose-500 animate-pulse' : 'text-primary'}>{scores.barrier}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#eedfd2]/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${scores.barrier < 50 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-primary-dark to-primary'}`}
                        style={{ width: `${scores.barrier}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products routines split layout */}
              <div className="flex flex-col gap-4 pr-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#705e55] block text-center">
                  {language === 'FR' ? 'Votre Ordonnance Personnalisée' : 'روتين العناية المقترح'}
                </span>
                {recommendedProducts.map((product, idx) => (
                  <div 
                    key={product.id}
                    className="flex gap-4 bg-[#f8ede3]/30 border border-[#eedfd2]/40 rounded-xl items-center hover:border-primary/20 transition-all duration-300 shadow-sm"
                    style={{ padding: '16px 20px' }}
                  >
                    {/* Step Routine badge label */}
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      {idx === 0 ? '1' : '2'}
                    </span>

                    {/* Product Thumbnail with double bezel */}
                    <div className="p-0.5 bg-[#eedfd2]/60 rounded-[6px] shrink-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-md bg-white"
                      />
                    </div>

                    {/* Product routine details */}
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-[9px] font-black uppercase text-accent tracking-widest block leading-none">
                        {idx === 0 
                          ? (language === 'FR' ? 'Étape 1 : Nettoyer / Préparer' : 'الخطوة 1 : تنظيف / تحضير')
                          : (language === 'FR' ? 'Étape 2 : Traiter / Protéger' : 'الخطوة 2 : معالجة / حماية')
                        }
                      </span>
                      <h4 className="text-xs font-black truncate text-[#3a2218] leading-tight mt-1">{product.title}</h4>
                      <span className="text-[10px] text-[#705e55] block mt-0.5">{product.vendor}</span>
                    </div>

                    {/* Pricing Discount show */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-primary block">{Math.round(product.price * 0.85)} DH</span>
                      <span className="text-[10px] text-[#705e55]/60 line-through block">{product.price} DH</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
           FIXED FOOTER
           ========================================== */}
        {step >= 1 && (
          <div 
            className="px-8 border-t border-stone-100 bg-white shrink-0 z-20 flex flex-col gap-3"
            style={{
              paddingTop: '16px',
              paddingBottom: '16px',
            }}
          >

            {/* Steps 1, 2, 3 Footer buttons */}
            {step >= 1 && step <= 3 && (
              <div className="flex gap-4">
                <button 
                  onClick={handlePrevStep} 
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#705e55] transition-all duration-300 cursor-pointer active:scale-95"
                  style={{
                    padding: '12px 0',
                    borderRadius: '4px',
                    border: '1px solid rgba(238, 223, 210, 0.8)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248, 237, 227, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  <span>{t('quiz_prev')}</span>
                </button>
              </div>
            )}

            {/* Step 4 Footer buttons */}
            {step === 4 && !isAnalyzing && (
              <div className="flex flex-col gap-2.5">
                {!isScanning && cameraStream && (
                  <button
                    onClick={startAnalysis}
                    className="w-full bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest transition-all duration-500 shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
                    style={{
                      padding: '14px 0',
                      borderRadius: '4px',
                    }}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === 'FR' ? 'Analyser mon visage' : 'ابدئي مسح الوجه'}</span>
                  </button>
                )}
                
                {!isScanning && (
                  <button 
                    onClick={() => { generateRecommendations(); setStep(5); }}
                    className="w-full text-xs font-bold text-[#705e55] transition-all duration-300 cursor-pointer active:scale-95"
                    style={{
                      padding: '12px 0',
                      borderRadius: '4px',
                      border: '1px solid rgba(238, 223, 210, 0.6)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248, 237, 227, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {language === 'FR' ? 'Ignorer le scan et voir les résultats' : 'تخطي المسح وعرض روتيني'}
                  </button>
                )}
              </div>
            )}
 
            {/* Step 5 Footer buttons */}
            {step === 5 && (
              <div className="space-y-2.5">
                <button
                  onClick={handleAddRoutineToCart}
                  className="group w-full bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-widest transition-all duration-500 shadow-[0_8px_24px_rgba(26,37,93,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    padding: '14px 0',
                    borderRadius: '4px',
                  }}
                >
                  <Sparkles className="w-4 h-4 fill-white animate-pulse" />
                  <span>{t('quiz_add_routine')}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full text-xs font-bold text-[#705e55] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  style={{
                    padding: '12px 0',
                    borderRadius: '4px',
                    border: '1px solid rgba(238, 223, 210, 0.65)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248, 237, 227, 0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'FR' ? 'Recommencer le diagnostic' : 'إعادة إجراء التشخيص'}</span>
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
