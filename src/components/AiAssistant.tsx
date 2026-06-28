'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Sparkles, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useUi } from '@/context/UiContext';

interface Message {
  sender: 'user' | 'ai';
  textFr: string;
  textAr: string;
  type?: 'text' | 'card' | 'order_collect' | 'order_confirm';
  cardData?: {
    titleFr: string;
    titleAr: string;
    pointsFr: string[];
    pointsAr: string[];
    tagFr: string;
    tagAr: string;
    status: 'success' | 'warning' | 'info';
  };
  orderData?: {
    items: Array<{ productId: number; quantity: number }>;
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
}

export const AiAssistant: React.FC = () => {
  const pathname = usePathname();
  const { language } = useTranslation();
  
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const { products } = useProducts();
  const { showToast } = useUi();

  const [activeOrderForm, setActiveOrderForm] = useState<{
    customerName: string;
    phone: string;
    address: string;
    city: string;
    items: Array<{ productId: number; quantity: number }>;
  } | null>(null);

  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string>('');

  const handleUpdateQty = (productId: number, diff: number) => {
    if (!activeOrderForm) return;
    const updatedItems = activeOrderForm.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + diff) };
      }
      return item;
    });
    setActiveOrderForm(prev => prev ? { ...prev, items: updatedItems } : null);
  };

  const handlePlaceAiOrder = async (form: typeof activeOrderForm) => {
    if (!form || form.items.length === 0) return;
    setIsOrderSubmitting(true);
    try {
      const orderItems = form.items.map((item) => {
        const prod = products.find(p => p.id === item.productId);
        return {
          id: item.productId,
          title: prod ? prod.title : 'Produit',
          price: prod ? prod.price : 0,
          quantity: item.quantity
        };
      });

      const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const shippingFee = subtotal >= 600 ? 0 : 35;
      const total = subtotal + shippingFee;

      const body = {
        orderData: {
          name: form.customerName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          note: "Ai Chat - Commande passée par l'Assistant IA"
        },
        items: orderItems,
        subtotal,
        discountAmount: 0,
        total,
        paymentMethod: 'cod',
        paymentStatus: 'unpaid'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success && data.orderId) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          textFr: `Votre commande a été enregistrée avec succès. Numéro de commande : ${data.orderId}.`,
          textAr: `تم تسجيل طلبكِ بنجاح. رقم الطلب : ${data.orderId}.`,
          type: 'text'
        }]);
        setLastPlacedOrderId(data.orderId);
        setVerificationToken(data.verificationToken || '');
        setActiveOrderForm(null);
        showToast("Commande enregistrée !", 'success');
      } else {
        showToast(data.error || "Erreur lors de la validation", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur est survenue lors de la commande", 'error');
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  const isRTL = language === 'AR';

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>( [
    {
      sender: 'ai',
      textFr: "Bonjour ! Je suis votre conseillère dermo-cosmétique digitale. Posez-moi une question sur vos ingrédients actifs ou sur la compatibilité de vos soins.",
      textAr: "مرحباً ! أنا مستشارتكِ الجلدية الرقمية. اسأليني عن المكونات النشطة أو مدى توافق مستحضرات العناية ببشرتكِ."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const PRESETS = [
    {
      id: 'vitc_retinol',
      qFr: "🧴 Mélanger Vitamine C & Rétinol ?",
      qAr: "🧴 خلط فيتامين سي والريتينول ؟",
      responseFr: "La Vitamine C et le Rétinol sont deux actifs puissants, mais ils ne doivent pas être appliqués au même moment pour éviter les irritations.",
      responseAr: "فيتامين سي والريتينول مكونان قويان للغاية، لكن لا يجب تطبيقهما في نفس الوقت لتفادي تهيج واحمرار البشرة.",
      hasCard: true,
      cardData: {
        titleFr: "Règles d'Or d'Association Clinique",
        titleAr: "القواعد الذهبية للدمج العلاجي",
        tagFr: "Conseil de Pharmacienne",
        tagAr: "نصيحة الصيدلية",
        status: 'warning' as const,
        pointsFr: [
          "☀️ Matin : Appliquez la Vitamine C pour illuminer et protéger contre le stress oxydatif.",
          "🌙 Soir : Appliquez le Rétinol pour régénérer et stimuler le collagène en profondeur.",
          "⚠️ Ne les superposez jamais directement (risque d'altération du pH cutané)."
        ],
        pointsAr: [
          "☀️ صباحاً: ضعي فيتامين سي لإشراق البشرة وحمايتها من الأكسدة.",
          "🌙 مساءً: ضعي الريتينول لتجديد الخلايا وتحفيز الكولاجين بعمق.",
          "⚠️ لا تدمجيهما معاً في نفس الوقت أبداً (لتفادي خلل درجة حموضة الجلد)."
        ]
      }
    },
    {
      id: 'oily_skin',
      qFr: "🎯 Routine idéale pour Peau Grasse ?",
      qAr: "🎯 الروتين المثالي للبشرة الدهنية ؟",
      responseFr: "Pour les peaux grasses à tendance acnéique, l'objectif est de réguler le sébum sans altérer le film hydrolipidique protecteur.",
      responseAr: "بالنسبة للبشرة الدهنية المعرضة لحب الشباب، الهدف الأساسي هو تنظيم الدهون الزائدة دون إتلاف الحاجز الطبيعي الواقي.",
      hasCard: true,
      cardData: {
        titleFr: "Ordonnance Clinique Recommandée",
        titleAr: "الوصفة العلاجية الموصى بها",
        tagFr: "Expertise Peau Grasse",
        tagAr: "خبرة البشرة الدهنية",
        status: 'success' as const,
        pointsFr: [
          "1️⃣ Nettoyage : Utilisez la Mousse Active Sébiaclear de SVR ou le gel nettoyant Anua.",
          "2️⃣ Traitement : Appliquez un sérum Niacinamide + Acide Salicylique (BHA).",
          "3️⃣ Protection : Utilisez l'écran solaire Eucerin Oil Control SPF50+ au fini mat longue durée."
        ],
        pointsAr: [
          "1️⃣ التنظيف: استخدمي رغوة سيبياكلير من SVR أو جل منظف أنوا المطهر.",
          "2️⃣ العلاج: طبقي سيروم النياسيناميد مع حمض الساليسيليك (BHA).",
          "3️⃣ الحماية: استخدمي واقي شمس يوسرين مطفي ومضاد للمظهر الدهني SPF 50+."
        ]
      }
    },
    {
      id: 'shipping',
      qFr: "🚚 Livraison & Délais au Maroc ?",
      qAr: "🚚 التوصيل والمدة في المغرب ؟",
      responseFr: "Nous livrons dans toutes les villes du Maroc de manière sécurisée avec option de Paiement à la Livraison (Cash on Delivery).",
      responseAr: "نوفر التوصيل السريع والآمن إلى جميع مدن المغرب مع ميزة الدفع عند الاستلام نقداً بكل أريحية.",
      hasCard: true,
      cardData: {
        titleFr: "Détails d'Expédition",
        titleAr: "تفاصيل الشحن والتسليم",
        tagFr: "Livraison Sécurisée",
        tagAr: "شحن سريع آمن",
        status: 'info' as const,
        pointsFr: [
          "⚡ Casablanca / Rabat : Livraison express en 24h ouvrées.",
          "📍 Autres Villes (Marrakech, Tanger, Agadir, Fès...) : Livraison sous 48h à 72h.",
          "💸 Gratuite : Dès 600 DH d'achat (sinon forfait de seulement 29 DH)."
        ],
        pointsAr: [
          "⚡ الدار البيضاء / الرباط: توصيل سريع للغاية خلال 24 ساعة فقط.",
          "📍 المدن الأخرى (مراکش، طنجة، أكادير، فاس...): التوصيل خلال 48 إلى 72 ساعة.",
          "💸 شحن مجاني: عند شرائكِ بـ 600 درهم أو أكثر (وإلا بقيمة 29 درهم فقط)."
        ]
      }
    }
  ];

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    // Add user message
    const userMsg: Message = {
      sender: 'user',
      textFr: preset.qFr,
      textAr: preset.qAr
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        sender: 'ai',
        textFr: preset.responseFr,
        textAr: preset.responseAr,
        type: preset.hasCard ? 'card' : 'text',
        cardData: preset.cardData
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1800);
  };

  const handleFallback = (query: string) => {
    const qLower = query.toLowerCase();
    
    // Check if query matches vitc_retinol keywords
    if (
      (qLower.includes('vitamine c') || qLower.includes('vitamin c') || qLower.includes('فيتامين سي') || qLower.includes('فيتامين c')) &&
      (qLower.includes('retinol') || qLower.includes('rétinol') || qLower.includes('ريتينول'))
    ) {
      const preset = PRESETS.find(p => p.id === 'vitc_retinol')!;
      setMessages(prev => [...prev, {
        sender: 'ai',
        textFr: preset.responseFr,
        textAr: preset.responseAr,
        type: preset.hasCard ? 'card' : 'text',
        cardData: preset.cardData
      }]);
      return;
    }

    // Check if query matches oily_skin keywords
    if (
      qLower.includes('grasse') || qLower.includes('gras') || qLower.includes('acne') || qLower.includes('acné') || 
      qLower.includes('دهنية') || qLower.includes('دهنيه') || qLower.includes('حب الشباب')
    ) {
      const preset = PRESETS.find(p => p.id === 'oily_skin')!;
      setMessages(prev => [...prev, {
        sender: 'ai',
        textFr: preset.responseFr,
        textAr: preset.responseAr,
        type: preset.hasCard ? 'card' : 'text',
        cardData: preset.cardData
      }]);
      return;
    }

    // Check if query matches shipping keywords
    if (
      qLower.includes('livraison') || qLower.includes('delai') || qLower.includes('délai') || qLower.includes('frais') ||
      qLower.includes('توصيل') || qLower.includes('شحن') || qLower.includes('مدة') || qLower.includes('المغرب')
    ) {
      const preset = PRESETS.find(p => p.id === 'shipping')!;
      setMessages(prev => [...prev, {
        sender: 'ai',
        textFr: preset.responseFr,
        textAr: preset.responseAr,
        type: preset.hasCard ? 'card' : 'text',
        cardData: preset.cardData
      }]);
      return;
    }

    // Generic friendly offline message
    setMessages(prev => [...prev, {
      sender: 'ai',
      textFr: "Je suis désolée, je rencontre des difficultés de connexion. Vous pouvez cliquer sur l'une des consultations fréquentes ci-dessus pour obtenir des réponses immédiates.",
      textAr: "أعتذر، أواجه مشكلة في الاتصال حالياً. يمكنكِ النقر على أحد الأزرار المتاحة أعلاه للحصول على إجابات فورية."
    }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const queryText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      sender: 'user',
      textFr: queryText,
      textAr: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          language
        })
      });

      const data = await response.json();
      
      if (data.success && data.message) {
        const hasOrderData = !!data.message.orderData;
        const msgType = data.message.type;
        
        if (hasOrderData && (msgType === 'order_collect' || msgType === 'order_confirm')) {
          setActiveOrderForm(prev => {
            const currentItems = data.message.orderData.items || prev?.items || [];
            return {
              customerName: data.message.orderData.customerName || prev?.customerName || '',
              phone: data.message.orderData.phone || prev?.phone || '',
              address: data.message.orderData.address || prev?.address || '',
              city: data.message.orderData.city || prev?.city || '',
              items: currentItems
            };
          });
        }

        setMessages(prev => [...prev, {
          sender: 'ai',
          textFr: data.message.textFr,
          textAr: data.message.textAr,
          type: data.message.type,
          cardData: data.message.cardData,
          orderData: data.message.orderData
        }]);
      } else {
        handleFallback(queryText);
      }
    } catch (err) {
      console.error("Chat API call error, triggering fallback:", err);
      handleFallback(queryText);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* ─── CHAT PANEL ─── */}
      {isOpen && (
        <div 
          className={`w-[360px] sm:w-[380px] h-[520px] rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right scale-100 ${
            isRTL ? 'text-right' : 'text-left'
          }`}
          style={{ 
            boxShadow: '0 24px 60px -15px rgba(26, 37, 93, 0.15), 0 0 40px rgba(197, 168, 128, 0.05)'
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between border-b border-white/5 relative overflow-hidden shrink-0"
            style={{ backgroundColor: 'var(--color-primary-dark)' }}
          >
            {/* Elegant glass blur circle in header */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-accent/20 blur-xl pointer-events-none" />
            
            <div className={`flex items-center gap-3 relative z-10 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4 text-accent fill-accent animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-black text-white text-[13.5px] leading-tight select-none">
                  {language === 'FR' ? 'Pharmacienne Digitale IA' : 'الصيدلانية الرقمية الذكية'}
                </h4>
                <span className="text-[9px] font-black uppercase text-accent tracking-widest block mt-0.5 select-none">
                  {language === 'FR' ? 'Consultation Clinique' : 'مستشارة العناية بالبشرة'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              aria-label={language === 'FR' ? 'Fermer' : 'إغلاق'}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer border-0 outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div 
            ref={scrollRef}
            className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar bg-slate-50/40"
            style={{ scrollBehavior: 'smooth' }}
          >
            {lastPlacedOrderId && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2.5 text-center text-xs font-semibold text-emerald-800 animate-fade-in relative">
                <p className="m-0 leading-normal">
                  {language === 'FR'
                    ? `Félicitations ! Votre commande #${lastPlacedOrderId} a été enregistrée avec succès. Veuillez la valider via le lien ci-dessous.`
                    : `تهانينا ! تم تسجيل طلبكِ رقم #${lastPlacedOrderId} بنجاح. يرجى تأكيد طلبكِ عبر الرابط أدناه.`}
                </p>
                {verificationToken && (
                  <a
                    href={`https://wa.me/212600000000?text=${encodeURIComponent(`Bonjour, je souhaite confirmer ma commande #${lastPlacedOrderId} passée via l'Assistant IA. Lien : https://paraofficinal.ma/api/orders/verify?token=${verificationToken}&action=confirm`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition active:scale-95 border-0 outline-none w-full text-center"
                  >
                    Confirmer via WhatsApp
                  </a>
                )}
                <button
                  onClick={() => {
                    setLastPlacedOrderId(null);
                    setVerificationToken('');
                  }}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 border-0 outline-none bg-transparent cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isAi = msg.sender === 'ai';
              return (
                <div 
                  key={idx}
                  className={`flex ${isAi ? 'justify-start' : 'justify-end'} ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                      isAi 
                        ? 'bg-white border border-slate-100/50 text-[#1E293B] rounded-tl-sm' 
                        : 'text-white rounded-tr-sm'
                    }`}
                    style={!isAi ? { backgroundColor: 'var(--color-primary-dark)' } : undefined}
                  >
                    {/* Text block */}
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {language === 'FR' ? msg.textFr : msg.textAr}
                    </p>
 
                    {/* Card display inside message */}
                    {msg.type === 'card' && msg.cardData && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[8px] font-black uppercase tracking-wider text-accent">
                            {language === 'FR' ? msg.cardData.tagFr : msg.cardData.tagAr}
                          </span>
                          {msg.cardData.status === 'warning' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : msg.cardData.status === 'success' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
 
                        <h5 className="font-extrabold text-[12px] text-primary-dark text-left rtl:text-right">
                          {language === 'FR' ? msg.cardData.titleFr : msg.cardData.titleAr}
                        </h5>
 
                        <div className="flex flex-col gap-1.5 text-left rtl:text-right" style={{ fontSize: '11px' }}>
                          {(language === 'FR' ? msg.cardData.pointsFr : msg.cardData.pointsAr).map((pt, pIdx) => (
                            <div key={pIdx} className="font-semibold text-slate-600 leading-normal">
                              {pt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversational Ordering Form */}
                    {(msg.type === 'order_collect' || msg.type === 'order_confirm') && activeOrderForm && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                        <span className="text-[10px] font-black uppercase text-accent tracking-wider block">
                          {language === 'FR' ? 'Formulaire de Commande Express' : 'استمارة الطلب السريع'}
                        </span>
                        
                        {/* Products summary */}
                        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100">
                          {activeOrderForm.items.map((item, itemIdx) => {
                            const prod = products.find(p => p.id === item.productId);
                            if (!prod) return null;
                            return (
                              <div key={itemIdx} className="flex items-center justify-between gap-2 text-[11px] font-bold">
                                <span className="truncate flex-1">{prod.title}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.productId, -1)}
                                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-350 flex items-center justify-center font-bold border-0 outline-none text-[10px] cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.productId, 1)}
                                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-355 flex items-center justify-center font-bold border-0 outline-none text-[10px] cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-mono shrink-0 text-emerald-600">{(prod.price * item.quantity).toFixed(2)} DH</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Customer Form Inputs */}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder={language === 'FR' ? "Nom Complet" : "الاسم الكامل"}
                            value={activeOrderForm.customerName}
                            onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, customerName: e.target.value } : null)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-primary-dark"
                          />
                          <input
                            type="text"
                            placeholder={language === 'FR' ? "Numéro de Téléphone" : "رقم الهاتف"}
                            value={activeOrderForm.phone}
                            onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, phone: e.target.value } : null)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-primary-dark"
                          />
                          <input
                            type="text"
                            placeholder={language === 'FR' ? "Adresse de livraison" : "عنوان التوصيل"}
                            value={activeOrderForm.address}
                            onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, address: e.target.value } : null)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-primary-dark"
                          />
                          <input
                            type="text"
                            placeholder={language === 'FR' ? "Ville" : "المدينة"}
                            value={activeOrderForm.city}
                            onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, city: e.target.value } : null)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-primary-dark"
                          />
                        </div>

                        {/* Action buttons */}
                        <button
                          type="button"
                          disabled={isOrderSubmitting || !activeOrderForm.customerName || !activeOrderForm.phone || !activeOrderForm.address || !activeOrderForm.city || activeOrderForm.items.length === 0}
                          onClick={() => handlePlaceAiOrder(activeOrderForm)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition active:scale-95 border-0 outline-none text-center"
                        >
                          {isOrderSubmitting
                            ? (language === 'FR' ? 'Enregistrement...' : 'جاري تسجيل الطلب...')
                            : (language === 'FR' ? 'Confirmer ma Commande' : 'تأكيد الطلب الآن')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated Typing State */}
            {isTyping && (
              <div className={`flex justify-start ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="bg-white border border-slate-100/50 rounded-2xl rounded-tl-sm p-3.5 shadow-sm text-xs text-foreground/50 flex items-center gap-1.5 font-bold">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  <span>
                    {language === 'FR' ? "L'assistant analyse la formulation active..." : "تجري الصيدلانية تحليلاً للمركبات..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick presets (Pills zone) */}
          <div className="p-3 border-t border-slate-100 bg-white shrink-0 flex flex-col gap-2 select-none">
            <span className={`text-[8.5px] font-black uppercase tracking-wider text-slate-400 block ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'FR' ? 'Consultations Fréquentes :' : 'الاستشارات الشائعة :'}
            </span>
            <div className="flex flex-wrap gap-2 justify-start max-h-[110px] overflow-y-auto no-scrollbar">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isTyping}
                  className="px-3 py-2 bg-slate-50 hover:bg-primary-dark border border-slate-200 rounded-lg text-[10.5px] font-extrabold text-primary-dark hover:text-white transition-all cursor-pointer leading-tight active:scale-[0.98] outline-none shrink-0"
                >
                  {language === 'FR' ? preset.qFr : preset.qAr}
                </button>
              ))}
            </div>
          </div>

          {/* Input Zone */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder={language === 'FR' ? "Posez votre question clinique..." : "اسألي سؤالكِ الطبي..."}
              className={`flex-grow px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-dark disabled:opacity-50 ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              aria-label={language === 'FR' ? 'Envoyer' : 'إرسال'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-all cursor-pointer border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ backgroundColor: 'var(--color-primary-dark)' }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ─── TRIGGER BUTTON ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-2xl relative group transition-all duration-300 active:scale-95 border-none outline-none cursor-pointer"
        style={{
          backgroundColor: isHovered ? 'var(--color-primary)' : 'var(--color-primary-dark)',
          boxShadow: '0 12px 32px rgba(26, 37, 93, 0.35), 0 0 10px rgba(197, 168, 128, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
        aria-label="Clinical AI Assistant"
      >
        {/* Pulsing glow ring around the button */}
        <div className="absolute inset-0 rounded-full border border-accent opacity-20 group-hover:scale-125 transition-transform duration-700 animate-ping pointer-events-none" />
        
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span 
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" 
              style={{ border: '2px solid var(--color-primary-dark)' }} 
            />
          </div>
        )}
      </button>

    </div>
  );
};
