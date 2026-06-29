'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HeroCardConfig {
  tagFr: string;
  tagAr: string;
  titleFr: string;
  titleAr: string;
  descFr?: string;
  descAr?: string;
  ctaFr: string;
  ctaAr: string;
  bgImage: string;
  linkType: 'diagnostic' | 'category' | 'product';
  linkValue: string;
}

export interface DiagnosticRule {
  id: string;
  concern: 'acne' | 'spots' | 'wrinkles' | 'dryness' | 'any';
  skinType: 'oily' | 'dry' | 'mixed' | 'sensitive' | 'any';
  sunExposure: 'intense' | 'moderate' | 'low' | 'any';
  productIds: number[];
  titleFr: string;
  titleAr?: string;
  descriptionFr?: string;
  descriptionAr?: string;
}

export interface GiftRange {
  minAmount: number;
  maxAmount: number;
  productId: number;
  productName: string;
}

export interface CityDeliveryRule {
  /** City name or partial match (case-insensitive contains) */
  city: string;
  /** Min days after order cutoff */
  daysMin: number;
  /** Max days after order cutoff */
  daysMax: number;
}

export interface DeliverySettings {
  /** Hour (0-23) after which an order is treated as next-day dispatch */
  cutoffHour: number;
  /** Default min days when no city rule matches (before cutoff) */
  defaultDaysMin: number;
  /** Default max days when no city rule matches (after cutoff) */
  defaultDaysMax: number;
  /** Per-city overrides */
  cityRules: CityDeliveryRule[];
}

export interface Settings {
  storeName: string;
  storePhone: string;
  storeWhatsApp: string;
  freeShippingThreshold: number;
  shippingFee: number;
  announcementFr: string;
  announcementAr: string;
  quizDiscountPercent: number;
  dailyGiftProductId: number;
  dailyGiftName: string;
  giftRanges?: GiftRange[];
  coupons: { 
    code: string; 
    discountPercent: number; 
    freeShipping: boolean;
    discountType?: 'percent' | 'fixed';
    discountValue?: number;
    minPurchase?: number;
    expiryDate?: string;
    isActive?: boolean;
    startDate?: string;
    usageLimit?: number;
  }[];
  faq: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }[];
  adminPasscode: string;
  shippingRules: { city: string; fee: number; freeThreshold?: number }[];
  whatsappFollowUpRules?: {
    enabled: boolean;
    trigger: 'abandoned_cart' | 'order_delivered' | 'order_shipped';
    delayHours: number;
  }[];
  categories?: string[];
  banners?: HeroCardConfig[];
  loyaltyPointsPerDh?: number;
  loyaltyBronzeMultiplier?: number;
  loyaltySilverMultiplier?: number;
  loyaltyGoldMultiplier?: number;
  loyaltyPlatinumMultiplier?: number;
  courierPartner?: 'yalidine' | 'cathedis';
  courierMode?: 'simulation' | 'production';
  yalidineApiKey?: string;
  yalidineApiId?: string;
  cathedisApiKey?: string;
  lowStockThreshold?: number;
  whatsappProvider?: 'direct_link' | 'twilio' | 'cloud_api';
  whatsappWebhookSecret?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  whatsappCloudAccessToken?: string;
  whatsappCloudPhoneNumberId?: string;
  notificationTemplates?: {
    pendingFr: string;
    pendingAr: string;
    shippedFr: string;
    shippedAr: string;
    deliveredFr: string;
    deliveredAr: string;
    recoveryFr: string;
    recoveryAr: string;
  };
  paymentSettings?: {
    onlinePaymentEnabled: boolean;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    cmiEnabled: boolean;
    cmiMerchantId: string;
    cmiStoreKey: string;
    cmiApiUrl: string;
    testMode: boolean;
  };
  themeColors?: {
    primary: string;
    primaryDark: string;
    secondary: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentBg: string;
    gold: string;
    goldHover: string;
    whatsapp: string;
  };
  mfaEnforcedRoles?: string[];
  diagnosticRules?: DiagnosticRule[];
  deliverySettings?: DeliverySettings;
  homepageSections?: HomepageSectionConfig;
}

export interface HomepageSectionItem {
  id: string;
  type: string;
  nameFr: string;
  visible: boolean;
  settings?: {
    titleFr?: string;
    titleAr?: string;
    descFr?: string;
    descAr?: string;
    ctaTextFr?: string;
    ctaTextAr?: string;
    ctaLink?: string;
    bgColor?: string;
    textColor?: string;
    html?: string;
    productIds?: number[];
    brands?: { name: string; domain: string; logoUrl?: string }[];
    discountPercent?: number;
    bgImage?: string;
    overlayImage?: string;
    promoCards?: {
      tagFr: string;
      tagAr: string;
      titleFr: string;
      titleAr: string;
      price: string;
      bgImage: string;
      overlayImage: string;
      category: string;
    }[];
    concerns?: {
      key: string;
      titleFr: string;
      titleAr: string;
      subtitleFr: string;
      subtitleAr: string;
      image: string;
    }[];
    reviews?: {
      author: string;
      authorAr?: string;
      role?: string;
      roleAr?: string;
      rating: number;
      textFr: string;
      textAr: string;
      date?: string;
      avatar?: string;
    }[];
  };
}

export interface HomepageSectionConfig {
  showHero?: boolean;
  showCategoryTrack?: boolean;
  showProductGrid?: boolean;
  showBrandPartners?: boolean;
  showDiagnosticBanner?: boolean;
  showSummerSale?: boolean;
  showSkinConcerns?: boolean;
  showFlashSale?: boolean;
  showHorizontalPromo?: boolean;
  showTrustBar?: boolean;
  showCustomerReviews?: boolean;
  showTriplePromo?: boolean;
  showTopRated?: boolean;
  showBestSellers?: boolean;
  showWeeklySales?: boolean;
  showRoutineVisualizer?: boolean;
  showFeaturedIngredient?: boolean;
  showIngredientDictionary?: boolean;
  showFaq?: boolean;

  topRatedTitleFr?: string;
  topRatedTitleAr?: string;
  topRatedProductIds?: number[];
  
  bestSellersTitleFr?: string;
  bestSellersTitleAr?: string;
  bestSellersProductIds?: number[];
  
  weeklySalesTitleFr?: string;
  weeklySalesTitleAr?: string;
  weeklySalesProductIds?: number[];

  summerSaleProductIds?: number[];

  /** IDs of products to pin in the Produits Vedettes grid (first 15 slots on page 1) */
  featuredProductIds?: number[];
  
  sectionOrder?: HomepageSectionItem[];
}

export const DEFAULT_SETTINGS: Settings = {
  mfaEnforcedRoles: [],
  homepageSections: {
    showHero: true,
    showCategoryTrack: true,
    showProductGrid: true,
    showBrandPartners: true,
    showDiagnosticBanner: true,
    showSummerSale: true,
    showSkinConcerns: true,
    showFlashSale: true,
    showHorizontalPromo: true,
    showTrustBar: true,
    showCustomerReviews: true,
    showTriplePromo: true,
    showTopRated: true,
    showBestSellers: true,
    showWeeklySales: true,
    showRoutineVisualizer: true,
    showFeaturedIngredient: true,
    showIngredientDictionary: true,
    showFaq: true,

    topRatedTitleFr: "Produits les Mieux Notés",
    topRatedTitleAr: "المنتجات الأعلى تقييماً",
    topRatedProductIds: [],
    bestSellersTitleFr: "Produits les Plus Vendus",
    bestSellersTitleAr: "المنتجات الأكثر مبيعاً",
    bestSellersProductIds: [],
    weeklySalesTitleFr: "Meilleures Ventes de la Semaine",
    weeklySalesTitleAr: "أفضل المنتجات مبيعاً",
    weeklySalesProductIds: [],
    summerSaleProductIds: [],
    featuredProductIds: [],
    sectionOrder: [
      { id: 'hero-1', type: 'hero', nameFr: 'Carrousel Héro & Diaporama', visible: true },
      { id: 'categoryTrack-1', type: 'categoryTrack', nameFr: 'Barre de Défilement des Catégories', visible: true },
      { id: 'productGrid-1', type: 'productGrid', nameFr: 'Grille Principale des Produits', visible: true },
      { id: 'brandPartners-1', type: 'brandPartners', nameFr: 'Marques Partenaires', visible: true },
      { id: 'diagnosticBanner-1', type: 'diagnosticBanner', nameFr: 'Diagnostic de Peau IA', visible: true },
      { id: 'summerSale-1', type: 'summerSale', nameFr: "Offres d'Été (Summer Sale)", visible: true },
      { id: 'skinConcerns-1', type: 'skinConcerns', nameFr: 'Bento de Préoccupations Cutanées', visible: true },
      { id: 'flashSale-1', type: 'flashSale', nameFr: 'Bannière de Vente Flash', visible: true },
      { id: 'horizontalPromo-1', type: 'horizontalPromo', nameFr: 'Bannière Promotionnelle Horizontale', visible: true },
      { id: 'trustBar-1', type: 'trustBar', nameFr: 'Barre de Confiance Maroc', visible: true },
      { id: 'customerReviews-1', type: 'customerReviews', nameFr: 'Témoignages & Avis Clients', visible: true },
      { id: 'triplePromo-1', type: 'triplePromo', nameFr: 'Bannières Triple Promotionnelles', visible: true },
      { id: 'topRated-1', type: 'topRated', nameFr: 'Produits les Mieux Notés', visible: true },
      { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Produits les Plus Vendus', visible: true },
      { id: 'routineVisualizer-1', type: 'routineVisualizer', nameFr: 'Visualiseur de Routine de Soins', visible: true },
      { id: 'featuredIngredient-1', type: 'featuredIngredient', nameFr: 'Ingrédient Focus de la Semaine', visible: true },
      { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: true },
      { id: 'faq-1', type: 'faq', nameFr: 'Foire Aux Questions (FAQ)', visible: true }
    ]
  },
  storeName: "Para Officinal S.A",
  storePhone: "+212 5 22 20 20 20",
  storeWhatsApp: "212660808080",
  freeShippingThreshold: 600,
  shippingFee: 35,
  announcementFr: "LIVRAISON GRATUITE LE JOUR MÊME — Commandes avant midi à Tanger, Tétouan, Rabat, Salé, Témara, Fès, Meknès & Ifrane.",
  announcementAr: "شحن مجاني في نفس اليوم — الطلبات قبل الظهر في طنجة، تطوان، الرباط، سلا، تمارة، فاس، مكناس وإيفران.",
  quizDiscountPercent: 15,
  dailyGiftProductId: 22,
  dailyGiftName: "Anua Heartleaf Mousse Nettoyante",
  giftRanges: [],
  categories: ['visage', 'kbeauty', 'garnier', 'hadalabo', 'offers'],
  banners: [
    {
      tagFr: "DIAGNOSTIC DERMATOLOGIQUE PAR IA",
      tagAr: "تشخيص جلدي بالذكاء الاصطناعي",
      titleFr: "Votre Routine Clinique Sur-Mesure",
      titleAr: "روتينك الجلدي المخصص بدقة",
      descFr: "Notre algorithme clinique analyse votre type de peau et formule une routine matin/soir recommandée par nos pharmaciens avec 15% de réduction exclusive !",
      descAr: "خوارزميتنا السريرية تحلل بشرتكِ وتركّب روتيناً موصى به من صيادلتنا مع خصم حصري 15%!",
      ctaFr: "Démarrer mon Diagnostic (-15%)",
      ctaAr: "ابدئي التشخيص (خصم 15%-)",
      bgImage: "/images/hero_skincare_clinic.png",
      linkType: "diagnostic",
      linkValue: ""
    },
    {
      tagFr: "SOIN CIBLE",
      tagAr: "مكونات نشطة",
      titleFr: "Botanical Hydrating Serum",
      titleAr: "سيروم الترطيب النباتي الفاخر",
      ctaFr: "Découvrir la gamme",
      ctaAr: "اكتشفي المجموعة",
      bgImage: "/images/hero_serum_dropper.png",
      linkType: "category",
      linkValue: "visage"
    },
    {
      tagFr: "SOIN ANTI-ÂGE",
      tagAr: "مكافحة الشيخوخة",
      titleFr: "Jeunesse Rétinol",
      titleAr: "روتين الشباب والريتينول",
      ctaFr: "Acheter Rétinol",
      ctaAr: "تسوقي الريتينول",
      bgImage: "/images/hero_rose_cream.png",
      linkType: "category",
      linkValue: "visage"
    },
    {
      tagFr: "HYDRATATION INTENSE",
      tagAr: "ترطيب مكثف",
      titleFr: "Glow Acide Hyaluronique",
      titleAr: "توهج حمض الهيالورونيك",
      ctaFr: "Découvrir la gamme",
      ctaAr: "اكتشفي المجموعة",
      bgImage: "/images/hero_hydra_essence.png",
      linkType: "category",
      linkValue: "visage"
    }
  ],
  coupons: [
    { code: "BEAUTY10", discountPercent: 10, freeShipping: false, discountType: 'percent', discountValue: 10, minPurchase: 0, expiryDate: '2026-12-31', isActive: true },
    { code: "CLINICAL15", discountPercent: 15, freeShipping: false, discountType: 'percent', discountValue: 15, minPurchase: 0, expiryDate: '2026-12-31', isActive: true },
    { code: "FREESHIP", discountPercent: 0, freeShipping: true, discountType: 'percent', discountValue: 0, minPurchase: 300, expiryDate: '2026-12-31', isActive: true }
  ],
  faq: [
    {
      q_fr: "Les produits sont-ils authentiques ?",
      a_fr: "Absolument. Tous nos soins proviennent directement de laboratoires pharmaceutiques agréés et de distributeurs officiels de confiance au Maroc.",
      q_ar: "هل المنتجات أصلية؟",
      a_ar: "بالتأكيد. جميع منتجات العناية لدينا تأتي مباشرة من المختبرات الصيدلانية المعتمدة والموزعين الرسميين الموثوقين في المغرب."
    },
    {
      q_fr: "Quel est le délai de livraison ?",
      a_fr: "Pour les grandes villes (Casablanca, Rabat, Tanger, Marrakech, etc.), vous êtes livrés le jour même pour toute commande passée avant midi. Pour les autres villes, comptez 24 à 48 heures maximum.",
      q_ar: "ما هي مدة التوصيل؟",
      a_ar: "بالنسبة للمدن الكبرى، يتم التوصيل في نفس اليوم للطلبات قبل الظهر. بالنسبة للمدن الأخرى، يستغرق الأمر من 24 إلى 48 ساعة كحد أopsى."
    },
    {
      q_fr: "Comment fonctionne le paiement ?",
      a_fr: "Nous fonctionnons exclusivement en Paiement à la Livraison (Cash on Delivery). Vous payez en espèces auprès du livreur uniquement après avoir reçu et inspecté vos produits.",
      q_ar: "كيف تعمل عملية الدفع؟",
      a_ar: "نحن نعمل حصرياً بالدفع عند الاستلام. أنت تدفع نقداً للموزع فقط بعد استلام منتجاتك وفحصها."
    }
  ],
  adminPasscode: "",
  shippingRules: [
    { city: "Casablanca", fee: 20, freeThreshold: 300 },
    { city: "Rabat", fee: 20, freeThreshold: 300 },
    { city: "Salé", fee: 20, freeThreshold: 300 },
    { city: "Mohammedia", fee: 20, freeThreshold: 300 },
    { city: "Tanger", fee: 25, freeThreshold: 400 },
    { city: "Marrakech", fee: 30, freeThreshold: 500 }
  ],
  whatsappFollowUpRules: [
    { enabled: true, trigger: 'abandoned_cart', delayHours: 2 },
    { enabled: false, trigger: 'order_shipped', delayHours: 24 },
    { enabled: true, trigger: 'order_delivered', delayHours: 120 }
  ],
  loyaltyPointsPerDh: 1.0,
  loyaltyBronzeMultiplier: 1.0,
  loyaltySilverMultiplier: 1.2,
  loyaltyGoldMultiplier: 1.5,
  loyaltyPlatinumMultiplier: 2.0,
  courierPartner: "yalidine",
  courierMode: "simulation",
  yalidineApiKey: "",
  yalidineApiId: "",
  cathedisApiKey: "",
  lowStockThreshold: 5,
  whatsappProvider: "direct_link",
  whatsappWebhookSecret: "whsec_wa_default_secret_key_123456",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioFromNumber: "",
  whatsappCloudAccessToken: "",
  whatsappCloudPhoneNumberId: "",
  notificationTemplates: {
    pendingFr: "Bonjour {customer_name} 👋 Votre commande Para Officinal #{order_id} a bien été reçue et est en cours de traitement. Nous vous contacterons très bientôt. Merci de votre confiance ! 🌿",
    pendingAr: "مرحباً {customer_name} 👋 تم استلام طلبك #{order_id} في Para Officinal وهو قيد المعالجة. سنتواصل معك قريباً. شكراً لثقتك! 🌿",
    shippedFr: "Bonjour {customer_name} 🚚 Excellente nouvelle ! Votre commande #{order_id} vient d'être expédiée. Numéro de suivi : {tracking_link}. Livraison estimée : 24-48h. À très bientôt ! 📦",
    shippedAr: "مرحباً {customer_name} 🚚 أخبار رائعة! تم شحن طلبك #{order_id}. رقم التتبع: {tracking_link}. التسليم المتوقع خلال 24-48 ساعة. نراكم قريباً! 📦",
    deliveredFr: "Bonjour {customer_name} ✅ Nous espérons que votre commande #{order_id} vous a bien été livrée et que vous êtes satisfait(e). N'hésitez pas à nous laisser votre avis. Merci pour votre fidélité ! 💚",
    deliveredAr: "مرحباً {customer_name} ✅ نأمل أن يكون طلبك #{order_id} قد وصلك بسلامة وأنك راضٍ عنه. لا تتردد في مشاركة تقييمك. شكراً لولائك! 💚",
    recoveryFr: "Bonjour {customer_name} 🛒 Vous avez laissé des articles dans votre panier chez Para Officinal ! Votre panier ({cart_items}) d'une valeur de {cart_total} DH vous attend. Utilisez le code {discount_code} pour bénéficier d'une réduction. Finalisez votre commande ici : {recovery_link} ✨",
    recoveryAr: "مرحباً {customer_name} 🛒 لقد تركتِ منتجات في سلة التسوق في Para Officinal! سلتك ({cart_items}) بقيمة {cart_total} درهم تنتظرك. استخدمي كود {discount_code} للحصول على خصم. أكملي طلبك من هنا: {recovery_link} ✨"
  },
  paymentSettings: {
    onlinePaymentEnabled: false,
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    cmiEnabled: false,
    cmiMerchantId: "",
    cmiStoreKey: "",
    cmiApiUrl: "https://testpayment.cmi.co.ma/fim/est3Dgate",
    testMode: true
  },
  themeColors: {
    primary: "#2573a3",
    primaryDark: "#1a255d",
    secondary: "#ffffff",
    bg: "#ffffff",
    text: "#111827",
    textMuted: "rgba(17, 24, 39, 0.7)",
    border: "#e2e8f0",
    accent: "#0d9488",
    accentBg: "#f0fdfa",
    gold: "#B09B71",
    goldHover: "#98845E",
    whatsapp: "#25d366"
  },
  diagnosticRules: [
    { id: "r1", concern: "acne", skinType: "any", sunExposure: "any", productIds: [15, 22], titleFr: "Routine Anti-Imperfections & Pureté", titleAr: "روتين مكافحة الشوائب والنقاء", descriptionFr: "Conçue pour purifier en profondeur, réguler le sébum et éliminer les imperfections.", descriptionAr: "مصمم لتنظيف البشرة بعمق، تنظيم الدهون وإزالة الشوائب." },
    { id: "r2", concern: "spots", skinType: "any", sunExposure: "any", productIds: [3, 14], titleFr: "Routine Anti-Taches & Éclat", titleAr: "روتين مكافحة البقع والنضارة", descriptionFr: "Idéale pour atténuer l'hyperpigmentation et redonner un éclat naturel.", descriptionAr: "مثالي للحد من التصبغات الجلدية واستعادة نضارة البشرة الطبيعية." },
    { id: "r3", concern: "wrinkles", skinType: "any", sunExposure: "any", productIds: [8, 5], titleFr: "Routine Jeunesse & Fermeté", titleAr: "روتين الشباب والشد", descriptionFr: "Formulée pour lisser les rides, raffermir et stimuler le renouvellement cellulaire.", descriptionAr: "مركب لتنعيم التجاعيد، شد البشرة وتحفيز تجديد الخلايا." },
    { id: "r4", concern: "dryness", skinType: "any", sunExposure: "any", productIds: [7, 6], titleFr: "Routine Hydratation Intense", titleAr: "روتين الترطيب المكثف", descriptionFr: "Repulpe, nourrit et renforce la barrière cutanée déshydratée.", descriptionAr: "يعيد حيوية البشرة، يغذيها ويقوي حاجز البشرة الجاف." }
  ],
  deliverySettings: {
    cutoffHour: 14,
    defaultDaysMin: 1,
    defaultDaysMax: 2,
    cityRules: []
  }
};

interface SettingsContextProps {
  settings: Settings;
  loadSettings: (force?: boolean) => Promise<void>;
  saveSettings: (newSettings: Settings) => Promise<boolean>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

let settingsCache: Settings | null = null;
let lastFetchedTime: number = 0;
const CACHE_EXPIRY = 60000; // 60 seconds cache

export class SettingsErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("SettingsErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-center my-4 max-w-md mx-auto" style={{ fontFamily: 'sans-serif' }}>
          <h3 className="font-bold text-sm">Système de Configuration Indisponible</h3>
          <p className="text-xs mt-1">L'application a rencontré une erreur lors du chargement des préférences. Veuillez rafraîchir la page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async (force: boolean = false) => {
    const now = Date.now();
    if (!force && settingsCache && (now - lastFetchedTime < CACHE_EXPIRY)) {
      setSettings(settingsCache);
      setIsLoading(false);
      return;
    }

    try {
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
      const endpoint = isAdmin ? '/api/settings' : '/api/settings/public';
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && data.settings) {
        const merged = { ...DEFAULT_SETTINGS, ...data.settings };
        if (!merged.banners || merged.banners.length === 0) {
          merged.banners = DEFAULT_SETTINGS.banners;
        }
        if (!merged.notificationTemplates) {
          merged.notificationTemplates = DEFAULT_SETTINGS.notificationTemplates;
        }
        if (!merged.paymentSettings) {
          merged.paymentSettings = DEFAULT_SETTINGS.paymentSettings;
        } else {
          merged.paymentSettings = { ...DEFAULT_SETTINGS.paymentSettings, ...merged.paymentSettings };
        }
        if (!merged.themeColors) {
          merged.themeColors = DEFAULT_SETTINGS.themeColors;
        } else {
          merged.themeColors = { ...DEFAULT_SETTINGS.themeColors, ...merged.themeColors };
        }
        if (!merged.diagnosticRules || merged.diagnosticRules.length === 0) {
          merged.diagnosticRules = DEFAULT_SETTINGS.diagnosticRules;
        }
        setSettings(merged);
        settingsCache = merged;
        lastFetchedTime = Date.now();
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
      if (settingsCache) {
        setSettings(settingsCache);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      const data = await res.json();
      if (data.success) {
        setSettings(newSettings);
        settingsCache = newSettings;
        lastFetchedTime = Date.now();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Dynamic CSS custom properties injection
  useEffect(() => {
    if (typeof window !== 'undefined' && settings?.themeColors) {
      const root = document.documentElement;
      Object.entries(settings.themeColors).forEach(([key, val]) => {
        if (val) {
          // Convert camelCase key to kebab-case CSS variable
          const cssKey = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssKey, val);
        }
      });
    }
  }, [settings?.themeColors]);

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loadSettings, saveSettings, isLoading }}>
      <SettingsErrorBoundary>
        {children}
      </SettingsErrorBoundary>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
