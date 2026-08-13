'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Sparkles, ShieldAlert, CheckCircle, HelpCircle, Search, ShoppingBag, Plus, Minus, MapPin } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useUi } from '@/context/UiContext';
import { useCart } from '@/context/CartContext';
import { isValidMoroccanPhone, MOROCCAN_PHONE_MAX_DIGITS, normalizeMoroccanPhoneInput } from '@/lib/moroccan-phone';
import { getCustomerAccessToken } from '@/lib/customer-session';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import Image from 'next/image';
import { safePublicImage } from '@/lib/public-images';

interface Message {
  sender: 'user' | 'ai';
  textFr: string;
  textAr: string;
  type?: 'text' | 'card' | 'order_collect' | 'order_confirm';
  products?: Array<{
    productId: number;
    title: string;
    price: number;
    reasonFr: string;
    reasonAr: string;
    image?: string;
  }>;
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

interface PublicChatConfig {
  welcome_fr?: string;
  welcome_ar?: string;
  suggested_prompts?: Array<{ id?: string; label_fr?: string; label_ar?: string; prompt_fr?: string; prompt_ar?: string }>;
  fallback_replies?: Array<{ text_fr?: string; text_ar?: string }>;
  whatsapp_link?: string;
}

export const AiAssistant: React.FC = () => {
  const pathname = usePathname();
  const { language } = useTranslation();
  const { isCartOpen } = useCart();
  const { showToast, isDiagnosticOpen, isScratchCardOpen } = useUi();

  const shouldHideAssistant =
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/customer') ||
    pathname?.startsWith('/checkout') || 
    isCartOpen || 
    isDiagnosticOpen || 
    isScratchCardOpen;
  const isProductDetailRoute = /^\/products\/[^/]+\/?$/.test(pathname || '');

  const { products } = useProducts();

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
  const [activeOrderMessageIndex, setActiveOrderMessageIndex] = useState<number | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const normalizedOrderSearch = orderSearch.trim().toLocaleLowerCase('fr');
  const safeFormatPrice = (val: any) => {
    const num = Number(val);
    return (isNaN(num) ? 0 : num).toFixed(2);
  };

  const safeProductsList = Array.isArray(products) ? products : [];
  const orderSearchResults = safeProductsList
    .filter(product => product && product.status !== 'draft' && Number(product.stock ?? 100) > 0)
    .filter(product => !normalizedOrderSearch || [product.title, product.nameFr, product.vendor, product.sku]
      .filter(Boolean)
      .some(value => String(value).toLocaleLowerCase('fr').includes(normalizedOrderSearch)))
    .slice(0, 5);

  const getProductDetails = (productId: number) => {
    const catalogProd = safeProductsList.find(p => p && p.id === productId);
    if (catalogProd) {
      return {
        ...catalogProd,
        price: typeof catalogProd.price === 'number' && !isNaN(catalogProd.price) ? catalogProd.price : 0
      };
    }

    for (const m of (messages || [])) {
      if (m && Array.isArray(m.products)) {
        const match = m.products.find(p => p && p.productId === productId);
        if (match) {
          return {
            id: match.productId,
            title: match.title || `Produit #${productId}`,
            price: typeof match.price === 'number' && !isNaN(match.price) ? match.price : 0,
            image: match.image || '',
            vendor: '',
            category: ''
          };
        }
      }
    }
    return {
      id: productId,
      title: `Produit #${productId}`,
      price: 0,
      image: '',
      vendor: '',
      category: ''
    };
  };

  const orderSubtotal = activeOrderForm?.items.reduce((total, item) => {
    const product = getProductDetails(item.productId);
    return total + (product ? (Number(product.price) || 0) * item.quantity : 0);
  }, 0) || 0;
  const orderShippingEstimate = orderSubtotal >= 600 ? 0 : 35;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>( [
    {
      sender: 'ai',
      textFr: "Bonjour ! Je suis votre conseillère dermo-cosmétique digitale. Posez-moi une question sur vos ingrédients actifs ou sur la compatibilité de vos soins.",
      textAr: "مرحباً ! أنا مستشارتكِ الجلدية الرقمية. اسأليني عن المكونات النشطة أو مدى توافق مستحضرات العناية ببشرتكِ."
    }
  ]);
  const [chatConfig, setChatConfig] = useState<PublicChatConfig>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const assistantDialogRef = useModalAccessibility<HTMLDivElement>(isOpen && !shouldHideAssistant, () => setIsOpen(false));

  useEffect(() => {
    let active = true;
    fetch('/api/cms/chat/public')
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (!active || !payload?.config) return;
        const config = payload.config as PublicChatConfig;
        setChatConfig(config);
        if (config.welcome_fr || config.welcome_ar) {
          setMessages(prev => prev.length === 1 && prev[0].sender === 'ai'
            ? [{ ...prev[0], textFr: config.welcome_fr || prev[0].textFr, textAr: config.welcome_ar || prev[0].textAr }]
            : prev);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (shouldHideAssistant) {
    return null;
  }

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

  const handleRemoveOrderItem = (productId: number) => {
    setActiveOrderForm(prev => prev
      ? { ...prev, items: prev.items.filter(item => item.productId !== productId) }
      : null
    );
  };

  const startChatOrder = (initialProductId?: number) => {
    const initialItems = initialProductId ? [{ productId: initialProductId, quantity: 1 }] : [];
    setActiveOrderForm({ customerName: '', phone: '', address: '', city: '', items: initialItems });
    setOrderSearch('');
    setShowProductSearch(!initialProductId);
    setLastPlacedOrderId(null);
    setVerificationToken('');
    setActiveOrderMessageIndex(messages.length);

    const initialProduct = initialProductId ? getProductDetails(initialProductId) : null;
    const introFr = initialProduct
      ? `Produit "${initialProduct.title}" sélectionné. Renseignez vos coordonnées de livraison ci-dessous pour valider votre commande.`
      : 'Je vous accompagne pour finaliser votre commande. Choisissez vos produits puis renseignez votre livraison ci-dessous.';
    const introAr = initialProduct
      ? `تم اختيار المنتج "${initialProduct.title}". أكملي بيانات التوصيل أدناه لتأكيد طلبكِ.`
      : 'سأرافقكِ لإتمام طلبكِ. اختاري منتجاتكِ ثم أضيفي بيانات التوصيل أدناه.';

    setMessages(prev => [...prev, {
      sender: 'ai',
      textFr: introFr,
      textAr: introAr,
      type: 'order_collect',
      orderData: { items: initialItems }
    }]);
  };

  const addOrderProduct = (productId: number) => {
    setActiveOrderForm(prev => {
      if (!prev) return prev;
      const existing = prev.items.find(item => item.productId === productId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(item => item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item),
        };
      }
      return { ...prev, items: [...prev.items, { productId, quantity: 1 }] };
    });
  };

  const handlePlaceAiOrder = async (form: typeof activeOrderForm) => {
    if (!form || form.items.length === 0) return;
    if (!isValidMoroccanPhone(form.phone)) {
      showToast(language === 'FR' ? 'Saisissez un numéro marocain de 9 à 10 chiffres.' : 'أدخل رقم هاتف مغربي من 9 إلى 10 أرقام.', 'error');
      return;
    }
    setIsOrderSubmitting(true);
    try {
      const orderItems = form.items.map((item) => {
        const prod = getProductDetails(item.productId);
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

      let accessToken: string | null = null;
      try {
        accessToken = await getCustomerAccessToken();
      } catch (sessionError) {
        console.warn('Customer session unavailable during AI order:', sessionError);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
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
        setActiveOrderMessageIndex(null);
        if (data.trackingToken) {
          sessionStorage.setItem(`orderTrackingToken:${data.orderId}`, data.trackingToken);
          localStorage.setItem(`orderTrackingToken:${data.orderId}`, data.trackingToken);
        }
        localStorage.setItem('admin:orders-updated', String(Date.now()));
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

  const PRESETS = [
    {
      id: 'vitc_retinol',
      qFr: "🧴 Mélanger Vitamine C & Rétinol ?",
      qAr: "🧴 خلط فيتامين سي والريتينول ؟",
      responseFr: "La Vitamine C et le Rétinol sont deux actifs puissants, mais ils ne doivent pas être appliqués au même moment pour éviter les irritations.",
      responseAr: "فيتامين سي والريتينول مكونان قويان للغاية، لكن لا يجب تطبيقهما في نفس الوقت لتفادي تهيج واحمرار البشرة.",
      hasCard: true,
      cardData: {
        titleFr: "Conseils pour associer vos soins",
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
        titleFr: "Routine recommandée",
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
      textFr: chatConfig.fallback_replies?.[0]?.text_fr || "Je suis désolée, je rencontre des difficultés de connexion. Vous pouvez réessayer ou contacter notre équipe.",
      textAr: chatConfig.fallback_replies?.[0]?.text_ar || "أعتذر، أواجه مشكلة في الاتصال حالياً. يمكنك إعادة المحاولة أو التواصل مع فريقنا."
    }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const queryText = inputText.trim();
    setInputText('');
    const nextAssistantMessageIndex = messages.length + 1;

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
          setActiveOrderMessageIndex(nextAssistantMessageIndex);
        }

        setMessages(prev => [...prev, {
          sender: 'ai',
          textFr: data.message.textFr,
          textAr: data.message.textAr,
          type: data.message.type,
          products: data.message.products,
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
    <div className={`fixed right-4 sm:right-6 z-50 flex flex-col items-end font-sans ${
      isProductDetailRoute ? 'bottom-[9.75rem] lg:bottom-6' : 'bottom-20 lg:bottom-6'
    }`}>
      
      {/* ─── CHAT PANEL ─── */}
      {isOpen && (
        <div 
          ref={assistantDialogRef}
          id="public-ai-assistant"
          role="dialog"
          aria-modal="true"
          aria-labelledby="public-ai-assistant-title"
          tabIndex={-1}
          className={`w-[calc(100vw-2rem)] sm:w-[400px] h-[min(720px,calc(100dvh-7rem))] rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right scale-100 ${
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
                <h4 id="public-ai-assistant-title" className="font-heading font-black text-white text-[13.5px] leading-tight select-none">
                  {language === 'FR' ? 'Pharmacienne Digitale IA' : 'الصيدلانية الرقمية الذكية'}
                </h4>
                <span className="text-[9px] font-black uppercase text-accent tracking-widest block mt-0.5 select-none">
                  {language === 'FR' ? 'Conseil beauté' : 'مستشارة العناية بالبشرة'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              data-autofocus
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
                    href={`${chatConfig.whatsapp_link || 'https://wa.me/212600000000'}?text=${encodeURIComponent(`Bonjour, je souhaite confirmer ma commande #${lastPlacedOrderId} passée via l'Assistant IA. Lien : https://paraofficinal.ma/api/orders/verify?token=${verificationToken}&action=confirm`)}`}
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
 
                    {/* Recommended Products Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">
                          {language === 'FR' ? 'Produits Recommandés :' : 'المنتجات الموصى بها :'}
                        </span>
                        {msg.products.map((item, pIdx) => {
                          const catalogProduct = products.find(p => p.id === item.productId);
                          const imageUrl = item.image || catalogProduct?.image;
                          return (
                            <div key={pIdx} className="p-2 bg-slate-50/90 border border-slate-200/75 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Image
                                  src={safePublicImage(imageUrl)}
                                  alt={item.title}
                                  width={36}
                                  height={36}
                                  className="h-9 w-9 shrink-0 rounded-md border border-slate-100 bg-white object-contain p-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-[10.5px] text-slate-800 truncate m-0">{item.title}</p>
                                  <p className="text-[9.5px] text-slate-500 m-0 leading-tight truncate">
                                    {language === 'FR' ? item.reasonFr : item.reasonAr}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                <span className="font-mono text-[10.5px] font-bold text-emerald-700">{item.price} DH</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeOrderForm && activeOrderMessageIndex !== null) {
                                      addOrderProduct(item.productId);
                                    } else {
                                      startChatOrder(item.productId);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] rounded-md transition border-0 cursor-pointer shadow-xs active:scale-95"
                                >
                                  {language === 'FR' ? 'Commander' : 'طلب'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

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
                          {(Array.isArray(language === 'FR' ? msg.cardData.pointsFr : msg.cardData.pointsAr) ? (language === 'FR' ? msg.cardData.pointsFr : msg.cardData.pointsAr) : []).map((pt, pIdx) => (
                            <div key={pIdx} className="font-semibold text-slate-600 leading-normal">
                              {pt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversational Ordering Form */}
                    {(msg.type === 'order_collect' || msg.type === 'order_confirm') && activeOrderForm && activeOrderMessageIndex === idx && (
                      <section className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_12px_28px_rgba(15,118,110,0.08)]">
                        <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/80 px-3.5 py-2.5">
                          <div className="flex items-center gap-2 text-emerald-900">
                            <ShoppingBag className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.12em]">{language === 'FR' ? 'Commande via le chat' : 'الطلب عبر المحادثة'}</span>
                          </div>
                          <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-100">{language === 'FR' ? 'Paiement à la livraison' : 'الدفع عند الاستلام'}</span>
                        </div>
                        <div className="flex flex-col gap-3.5 p-3.5">
                          {/* 1. Selected Products Section */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                                {language === 'FR' ? '1. Produit(s) sélectionné(s)' : '١. المنتجات المختارة'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowProductSearch(prev => !prev)}
                                className="text-[9.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200/60 transition"
                              >
                                <Plus className="h-3 w-3" />
                                {language === 'FR' ? 'Ajouter un autre produit' : 'إضافة منتج آخر'}
                              </button>
                            </div>

                            {activeOrderForm.items.length > 0 ? (
                              <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                                {activeOrderForm.items.map((item, itemIdx) => {
                                  const prod = getProductDetails(item.productId);
                                  if (!prod) return null;
                                  return (
                                    <div key={itemIdx} className="flex items-center justify-between gap-2.5 p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                                      <Image
                                        src={safePublicImage(prod.image)}
                                        alt={prod.title}
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 shrink-0 rounded bg-slate-50 object-contain p-0.5"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-[10.5px] font-bold text-slate-800 m-0">{prod.title}</p>
                                        <p className="text-[9.5px] font-bold text-emerald-700 m-0">{safeFormatPrice(prod.price)} DH</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => item.quantity === 1 ? handleRemoveOrderItem(item.productId) : handleUpdateQty(item.productId, -1)}
                                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold border-0 outline-none text-[11px] text-slate-700 cursor-pointer transition"
                                        >
                                          -
                                        </button>
                                        <span className="font-mono text-[11px] font-bold px-1">{item.quantity}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateQty(item.productId, 1)}
                                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold border-0 outline-none text-[11px] text-slate-700 cursor-pointer transition"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-center">
                                <p className="text-[10.5px] font-bold text-amber-800 m-0">
                                  {language === 'FR' ? 'Aucun produit sélectionné. Cliquez ci-dessous pour rechercher un produit.' : 'لم يتم اختيار أي منتج. اضغطي أدناه للبحث عن منتج.'}
                                </p>
                              </div>
                            )}

                            {/* Collapsible Product Search Box */}
                            {(showProductSearch || activeOrderForm.items.length === 0) && (
                              <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 focus-within:border-emerald-400">
                                  <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <input
                                    type="search"
                                    value={orderSearch}
                                    onChange={(event) => setOrderSearch(event.target.value)}
                                    placeholder={language === 'FR' ? 'Rechercher un produit ou une marque...' : 'ابحثي عن منتج أو علامة تجارية...'}
                                    className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                                  />
                                </div>
                                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                                  {orderSearchResults.map(product => (
                                    <div key={product.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2">
                                      <Image
                                        src={safePublicImage(product.image)}
                                        alt={product.title}
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 shrink-0 rounded bg-slate-50 object-contain p-0.5"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-[10px] font-bold text-slate-800">{product.title}</p>
                                        <p className="mt-0.5 text-[9px] font-semibold text-slate-400">{product.vendor} · {safeFormatPrice(product.price)} DH</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          addOrderProduct(product.id);
                                        }}
                                        className="flex h-6 px-2 shrink-0 items-center justify-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] transition cursor-pointer border-0"
                                      >
                                        <Plus className="h-3 w-3" />
                                        {language === 'FR' ? 'Ajouter' : 'إضافة'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Customer Delivery Information Section */}
                          {activeOrderForm.items.length > 0 && (
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800 block">
                                {language === 'FR' ? '2. Coordonnées de livraison' : '٢. بيانات التوصيل'}
                              </span>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder={language === 'FR' ? "Nom Complet" : "الاسم الكامل"}
                                  value={activeOrderForm.customerName}
                                  onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, customerName: e.target.value } : null)}
                                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-500"
                                />
                                <input
                                  type="tel"
                                  placeholder={language === 'FR' ? "Numéro de Téléphone (ex: 0612345678)" : "رقم الهاتف"}
                                  value={activeOrderForm.phone}
                                  onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, phone: normalizeMoroccanPhoneInput(e.target.value) } : null)}
                                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-500"
                                  inputMode="numeric"
                                  maxLength={MOROCCAN_PHONE_MAX_DIGITS}
                                />
                                <input
                                  type="text"
                                  placeholder={language === 'FR' ? "Adresse de livraison" : "عنوان التوصيل"}
                                  value={activeOrderForm.address}
                                  onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, address: e.target.value } : null)}
                                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-500"
                                />
                                <input
                                  type="text"
                                  placeholder={language === 'FR' ? "Ville (ex: Casablanca, Rabat...)" : "المدينة"}
                                  value={activeOrderForm.city}
                                  onChange={(e) => setActiveOrderForm(prev => prev ? { ...prev, city: e.target.value } : null)}
                                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              {/* Pricing summary */}
                              <div className="rounded-xl bg-slate-950 px-3 py-2.5 text-white">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-white/70">
                                  <span>{language === 'FR' ? 'Livraison estimée' : 'تقدير التوصيل'}</span>
                                  <span>{orderShippingEstimate === 0 ? (language === 'FR' ? 'Offerte' : 'مجانية') : `${safeFormatPrice(orderShippingEstimate)} DH`}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-xs font-black">
                                  <span>{language === 'FR' ? 'Total estimé' : 'المجموع التقديري'}</span>
                                  <span>{safeFormatPrice(orderSubtotal + orderShippingEstimate)} DH</span>
                                </div>
                              </div>

                              {/* Confirm Button */}
                              <button
                                type="button"
                                disabled={isOrderSubmitting || !activeOrderForm.customerName || !isValidMoroccanPhone(activeOrderForm.phone) || !activeOrderForm.address || !activeOrderForm.city || activeOrderForm.items.length === 0}
                                onClick={() => handlePlaceAiOrder(activeOrderForm)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-[0.1em] rounded-xl shadow-[0_10px_20px_rgba(5,150,105,0.22)] transition active:scale-95 border-0 outline-none text-center cursor-pointer"
                              >
                                {isOrderSubmitting
                                  ? (language === 'FR' ? 'Enregistrement...' : 'جاري تسجيل الطلب...')
                                  : (language === 'FR' ? 'Confirmer ma Commande' : 'تأكيد الطلب الآن')}
                              </button>
                              <p className="flex items-start gap-1.5 text-[9px] leading-relaxed text-slate-400">
                                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                {language === 'FR' ? 'Le stock, les frais et le total final sont vérifiés en temps réel avant la création.' : 'يتم التحقق من المخزون ورسوم الشحن والمجموع النهائي مباشرةً قبل إنشاء الطلب.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </section>
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

          {chatConfig.suggested_prompts?.length && messages.length === 1 ? (
            <div className="flex flex-wrap gap-2 px-3 pb-3 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
              {chatConfig.suggested_prompts.slice(0, 4).map((prompt, index) => (
                <button key={prompt.id ?? index} type="button" onClick={() => setInputText(isRTL ? (prompt.prompt_ar || prompt.prompt_fr || '') : (prompt.prompt_fr || prompt.prompt_ar || ''))} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition">
                  {isRTL ? (prompt.label_ar || prompt.label_fr) : (prompt.label_fr || prompt.label_ar)}
                </button>
              ))}
            </div>
          ) : null}



          {/* Input Zone */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder={language === 'FR' ? "Posez votre question..." : "اطرحي سؤالكِ..."}
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
        aria-controls="public-ai-assistant"
        aria-expanded={isOpen}
        aria-label={language === 'FR' ? (isOpen ? 'Fermer l’assistant conseil' : 'Ouvrir l’assistant conseil') : (isOpen ? 'إغلاق مساعد الاستشارة' : 'فتح مساعد الاستشارة')}
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
