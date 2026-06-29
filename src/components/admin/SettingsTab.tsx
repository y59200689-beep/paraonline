'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Percent, 
  Truck, 
  Star, 
  HelpCircle, 
  FileText, 
  Bell, 
  Users, 
  AlertTriangle, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Upload, 
  Calendar,
  CreditCard,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  ArrowRight,
  Layout,
  Layers,
  Package,
  Terminal,
  Search,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Zap,
  BookOpen,
  Heart,
  Activity,
  Gift,
  Eye
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useSettings, HeroCardConfig } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import { useProducts } from '@/context/ProductsContext';

export default function SettingsTab() {
  const { settings, saveSettings } = useSettings();
  const { showToast } = useUi();
  const {
    adminTheme,
    currentUser,
    auditLogs,
    dashboardStats,
    operatorsList,
    handleSaveCoupon,
    handleDeleteCoupon,
    handleToggleCouponActive,
    handleSaveBanner,
    handleMoveBanner,
    handleAddFaq,
    handleDeleteFaq,
    handleCreateOperator,
    handleToggleOperatorStatus,
    handleSaveGeneralSettings,
    handleSaveCourierSettings,
    handleSaveLoyaltySettings,
    handleSavePaymentSettings,
    handleSaveNotificationTemplates,
  } = useAdmin();

  const { products } = useProducts();
  const {
    activeSettingsSubTab,
    setActiveSettingsSubTab,
    isAddingCoupon,
    setIsAddingCoupon
  } = useAdminUI();

  // Layout Builder State
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [saveHomepageState, setSaveHomepageState] = useState<'idle'|'saving'|'success'>('idle');

  // Search dropdown states (generic product picker states)
  const [trSearch, setTrSearch] = useState("");
  const [trOpen, setTrOpen] = useState(false);

  // MFA / Security states
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isMfaSetupOpen, setIsMfaSetupOpen] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  
  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Owner reset password states
  const [resettingOperatorId, setResettingOperatorId] = useState<string | null>(null);
  const [resettingOperatorName, setResettingOperatorName] = useState('');
  const [ownerResetPasswordVal, setOwnerResetPasswordVal] = useState('');
  const [ownerResetError, setOwnerResetError] = useState('');
  const [ownerResetSuccess, setOwnerResetSuccess] = useState('');

  // Sync settings and products for homepage sections
  useEffect(() => {
    if (settings?.homepageSections) {
      const hp = settings.homepageSections;

      // Initialize Section Order
      const defaultOrder = [
        { id: 'hero-1', type: 'hero', nameFr: 'Carrousel Héro & Diaporama', visible: hp.showHero ?? true },
        { id: 'categoryTrack-1', type: 'categoryTrack', nameFr: 'Barre de Défilement des Catégories', visible: hp.showCategoryTrack ?? true },
        { id: 'productGrid-1', type: 'productGrid', nameFr: 'Grille Principale des Produits', visible: hp.showProductGrid ?? true },
        { id: 'brandPartners-1', type: 'brandPartners', nameFr: 'Marques Partenaires', visible: hp.showBrandPartners ?? true },
        { id: 'diagnosticBanner-1', type: 'diagnosticBanner', nameFr: 'Diagnostic de Peau IA', visible: hp.showDiagnosticBanner ?? true },
        { id: 'summerSale-1', type: 'summerSale', nameFr: "Offres d'Été (Summer Sale)", visible: hp.showSummerSale ?? true, settings: { productIds: hp.summerSaleProductIds || [] } },
        { id: 'skinConcerns-1', type: 'skinConcerns', nameFr: 'Bento de Préoccupations Cutanées', visible: hp.showSkinConcerns ?? true },
        { id: 'flashSale-1', type: 'flashSale', nameFr: 'Bannière de Vente Flash', visible: hp.showFlashSale ?? true },
        { id: 'horizontalPromo-1', type: 'horizontalPromo', nameFr: 'Bannière Promotionnelle Horizontale', visible: hp.showHorizontalPromo ?? true },
        { id: 'trustBar-1', type: 'trustBar', nameFr: 'Barre de Confiance Maroc', visible: hp.showTrustBar ?? true },
        { id: 'customerReviews-1', type: 'customerReviews', nameFr: 'Témoignages & Avis Clients', visible: hp.showCustomerReviews ?? true },
        { id: 'triplePromo-1', type: 'triplePromo', nameFr: 'Bannières Triple Promotionnelles', visible: hp.showTriplePromo ?? true },
        { id: 'topRated-1', type: 'topRated', nameFr: 'Produits les Mieux Notés', visible: hp.showTopRated ?? true, settings: { titleFr: hp.topRatedTitleFr, titleAr: hp.topRatedTitleAr, productIds: hp.topRatedProductIds || [] } },
        { id: 'bestSellers-1', type: 'bestSellers', nameFr: 'Produits les Plus Vendus', visible: hp.showBestSellers ?? true, settings: { titleFr: hp.bestSellersTitleFr, titleAr: hp.bestSellersTitleAr, productIds: hp.bestSellersProductIds || [] } },
        { id: 'weeklySales-1', type: 'weeklySales', nameFr: 'Meilleures Ventes de la Semaine', visible: hp.showWeeklySales ?? true, settings: { titleFr: hp.weeklySalesTitleFr, titleAr: hp.weeklySalesTitleAr, productIds: hp.weeklySalesProductIds || [] } },
        { id: 'routineVisualizer-1', type: 'routineVisualizer', nameFr: 'Visualiseur de Routine de Soins', visible: hp.showRoutineVisualizer ?? true },
        { id: 'featuredIngredient-1', type: 'featuredIngredient', nameFr: 'Ingrédient Focus de la Semaine', visible: hp.showFeaturedIngredient ?? true },
        { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: hp.showIngredientDictionary ?? true },
        { id: 'faq-1', type: 'faq', nameFr: 'Foire Aux Questions (FAQ)', visible: hp.showFaq ?? true }
      ];
      setSectionsList(hp.sectionOrder && hp.sectionOrder.length > 0 ? hp.sectionOrder : defaultOrder);
    }
  }, [settings, products]);

  // Save homepage settings
  const handleSaveHomepageSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const findVisible = (type: string) => sectionsList.find(s => s.type === type)?.visible ?? false;
    const findSettings = (type: string) => sectionsList.find(s => s.type === type)?.settings || {};

    const topRatedSec = findSettings('topRated');
    const bestSellersSec = findSettings('bestSellers');
    const weeklySalesSec = findSettings('weeklySales');
    const summerSaleSec = findSettings('summerSale');

    const updated = {
      ...settings,
      homepageSections: {
        showHero: findVisible('hero'),
        showCategoryTrack: findVisible('categoryTrack'),
        showProductGrid: findVisible('productGrid'),
        showBrandPartners: findVisible('brandPartners'),
        showDiagnosticBanner: findVisible('diagnosticBanner'),
        showSummerSale: findVisible('summerSale'),
        showSkinConcerns: findVisible('skinConcerns'),
        showFlashSale: findVisible('flashSale'),
        showHorizontalPromo: findVisible('horizontalPromo'),
        showTrustBar: findVisible('trustBar'),
        showCustomerReviews: findVisible('customerReviews'),
        showTriplePromo: findVisible('triplePromo'),
        showTopRated: findVisible('topRated'),
        showBestSellers: findVisible('bestSellers'),
        showWeeklySales: findVisible('weeklySales'),
        showRoutineVisualizer: findVisible('routineVisualizer'),
        showFeaturedIngredient: findVisible('featuredIngredient'),
        showIngredientDictionary: findVisible('ingredientDictionary'),
        showFaq: findVisible('faq'),

        topRatedTitleFr: topRatedSec.titleFr || '',
        topRatedTitleAr: topRatedSec.titleAr || '',
        topRatedProductIds: topRatedSec.productIds || [],

        bestSellersTitleFr: bestSellersSec.titleFr || '',
        bestSellersTitleAr: bestSellersSec.titleAr || '',
        bestSellersProductIds: bestSellersSec.productIds || [],

        weeklySalesTitleFr: weeklySalesSec.titleFr || '',
        weeklySalesTitleAr: weeklySalesSec.titleAr || '',
        weeklySalesProductIds: weeklySalesSec.productIds || [],

        summerSaleProductIds: summerSaleSec.productIds || [],
        featuredProductIds: settings.homepageSections?.featuredProductIds || [],
        
        sectionOrder: sectionsList
      }
    };

    setSaveHomepageState('saving');
    const success = await saveSettings(updated);
    if (success) {
      setSaveHomepageState('success');
      showToast("Mise en page de l'accueil sauvegardée !", 'success');
      setTimeout(() => setSaveHomepageState('idle'), 3000);
    } else {
      setSaveHomepageState('idle');
      showToast("Erreur lors de la sauvegarde.", 'error');
    }
  };

  // Fetch current user MFA state
  useEffect(() => {
    if (activeSettingsSubTab === 'security' && currentUser) {
      const fetchMfaStatus = async () => {
        try {
          const res = await fetch('/api/admin/auth/me');
          const data = await res.json();
          if (data.success && data.user) {
            setIsMfaEnabled(data.user.mfaEnabled === true);
          }
        } catch (e) {
          console.error("Error fetching MFA status:", e);
        }
      };
      fetchMfaStatus();
    }
  }, [activeSettingsSubTab, currentUser]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    minPurchase: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    freeShipping: false,
    isActive: true
  });
  
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<HeroCardConfig>({
    tagFr: '', tagAr: '', titleFr: '', titleAr: '', descFr: '', descAr: '', ctaFr: '', ctaAr: '', bgImage: '', linkType: 'category', linkValue: ''
  });
  
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [faqForm, setFaqForm] = useState({ q_fr: '', a_fr: '', q_ar: '', a_ar: '' });
  
  const [isAddingOperator, setIsAddingOperator] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [notifTemplates, setNotifTemplates] = useState<Record<string, string>>({});
  const [isSavingNotifTemplates, setIsSavingNotifTemplates] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    onlinePaymentEnabled: false,
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    cmiEnabled: false,
    cmiMerchantId: '',
    cmiStoreKey: '',
    cmiApiUrl: 'https://testpayment.cmi.co.ma/fim/est3Dgate',
    testMode: true,
  });
  
  const [automationQueue, setAutomationQueue] = useState<any[]>([
    { id: 'aq_1', type: 'abandoned_cart', clientName: 'Fatima Zohra', phone: '+212 661-492815', scheduledAt: new Date(Date.now() + 3600000 * 1.5).toLocaleString('fr-FR'), status: 'pending' },
    { id: 'aq_2', type: 'order_delivered', clientName: 'Yassine Alami', phone: '+212 654-889102', scheduledAt: new Date(Date.now() + 3600000 * 24 * 3).toLocaleString('fr-FR'), status: 'pending' },
    { id: 'aq_3', type: 'order_shipped', clientName: 'Meriem Bensalah', phone: '+212 613-228954', scheduledAt: new Date(Date.now() + 3600000 * 5).toLocaleString('fr-FR'), status: 'pending' }
  ]);

  // Sync notifications templates with settings when mounted or changed
  useEffect(() => {
    if (settings?.notificationTemplates) {
      setNotifTemplates({
        pendingFr: settings.notificationTemplates.pendingFr || '',
        pendingAr: settings.notificationTemplates.pendingAr || '',
        shippedFr: settings.notificationTemplates.shippedFr || '',
        shippedAr: settings.notificationTemplates.shippedAr || '',
        deliveredFr: settings.notificationTemplates.deliveredFr || '',
        deliveredAr: settings.notificationTemplates.deliveredAr || '',
        recoveryFr: settings.notificationTemplates.recoveryFr || '',
        recoveryAr: settings.notificationTemplates.recoveryAr || ''
      });
    }
  }, [settings]);

  // Sync payment settings when settings change
  useEffect(() => {
    if (settings?.paymentSettings) {
      setPaymentForm({
        onlinePaymentEnabled: settings.paymentSettings.onlinePaymentEnabled || false,
        stripeEnabled: settings.paymentSettings.stripeEnabled || false,
        stripePublishableKey: settings.paymentSettings.stripePublishableKey || '',
        stripeSecretKey: settings.paymentSettings.stripeSecretKey || '',
        stripeWebhookSecret: settings.paymentSettings.stripeWebhookSecret || '',
        cmiEnabled: settings.paymentSettings.cmiEnabled || false,
        cmiMerchantId: settings.paymentSettings.cmiMerchantId || '',
        cmiStoreKey: settings.paymentSettings.cmiStoreKey || '',
        cmiApiUrl: settings.paymentSettings.cmiApiUrl || 'https://testpayment.cmi.co.ma/fim/est3Dgate',
        testMode: settings.paymentSettings.testMode ?? true,
      });
    }
  }, [settings]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (target === 'banner') {
          setBannerForm(prev => ({ ...prev, bgImage: data.url }));
        }
        showToast('Image téléversée avec succès !', 'success');
      } else {
        showToast('Échec du téléversement: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Erreur réseau lors du téléversement.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Form submit handlers wrapper
  const onSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);

    const values = {
      storeName: String(formData.get('storeName')),
      storePhone: String(formData.get('storePhone')),
      storeWhatsApp: String(formData.get('storeWhatsApp')),
      freeShippingThreshold: Number(formData.get('freeShippingThreshold')) || 600,
      shippingFee: Number(formData.get('shippingFee')) || 35,
      announcementFr: String(formData.get('announcementFr')),
      announcementAr: String(formData.get('announcementAr')),
      quizDiscountPercent: Number(formData.get('quizDiscountPercent')) || 15,
      lowStockThreshold: Number(formData.get('lowStockThreshold')) || 5,
      adminPasscode: String(formData.get('adminPasscode') ?? '')
    };

    const success = await handleSaveGeneralSettings(values);
    if (success) {
      showToast("Paramètres généraux sauvegardés avec succès !", 'success');
    } else {
      showToast("Échec de la sauvegarde.", 'error');
    }
  };

  const onSaveCourierSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);

    const values = {
      courierPartner: (formData.get('courierPartner') as any) || 'yalidine',
      courierMode: (formData.get('courierMode') as any) || 'simulation',
      yalidineApiKey: String(formData.get('yalidineApiKey')),
      yalidineApiId: String(formData.get('yalidineApiId')),
      cathedisApiKey: String(formData.get('cathedisApiKey')),
      courierApiKey: String(formData.get('yalidineApiKey') || formData.get('cathedisApiKey'))
    };

    const success = await handleSaveCourierSettings(values);
    if (success) {
      showToast("Paramètres d'expéditions sauvegardés !", 'success');
    } else {
      showToast("Échec de la sauvegarde.", 'error');
    }
  };

  const onSaveLoyaltySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);

    const values = {
      loyaltyPointsPerDh: Number(formData.get('loyaltyPointsPerDh')) || 1.0,
      loyaltyBronzeMultiplier: Number(formData.get('loyaltyBronzeMultiplier')) || 1.0,
      loyaltySilverMultiplier: Number(formData.get('loyaltySilverMultiplier')) || 1.2,
      loyaltyGoldMultiplier: Number(formData.get('loyaltyGoldMultiplier')) || 1.5,
      loyaltyPlatinumMultiplier: Number(formData.get('loyaltyPlatinumMultiplier')) || 2.0
    };

    const success = await handleSaveLoyaltySettings(values);
    if (success) {
      showToast("Règles du programme fidélité enregistrées !", 'success');
    } else {
      showToast("Échec de la sauvegarde.", 'error');
    }
  };

  const onSaveNotificationTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifTemplates(true);
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);

    const formSettings = {
      whatsappProvider: String(formData.get('whatsappProvider')),
      twilioAccountSid: String(formData.get('twilioAccountSid')),
      twilioAuthToken: String(formData.get('twilioAuthToken')),
      twilioFromNumber: String(formData.get('twilioFromNumber')),
      whatsappCloudPhoneNumberId: String(formData.get('whatsappCloudPhoneNumberId')),
      whatsappCloudAccessToken: String(formData.get('whatsappCloudAccessToken'))
    };

    const success = await handleSaveNotificationTemplates(formSettings, notifTemplates);
    setIsSavingNotifTemplates(false);
    if (success) {
      showToast("Modèles de notifications sauvegardés avec succès !", 'success');
    } else {
      showToast("Échec de l'enregistrement des modèles.", 'error');
    }
  };

  const handleOpenBannerEdit = (index: number) => {
    if (!settings.banners || !settings.banners[index]) return;
    setSelectedBannerIndex(index);
    setBannerForm(settings.banners[index]);
  };

  const onSaveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBannerIndex === null) return;
    const success = await handleSaveBanner(selectedBannerIndex, bannerForm);
    if (success) {
      setSelectedBannerIndex(null);
      showToast("Bannière modifiée avec succès !", 'success');
    } else {
      showToast("Erreur lors de la sauvegarde de la bannière.", 'error');
    }
  };

  const onSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSaveCoupon(couponForm);
    if (success) {
      setIsAddingCoupon(false);
      setCouponForm({
        code: '',
        discountType: 'percent',
        discountValue: 10,
        minPurchase: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        freeShipping: false,
        isActive: true
      });
      showToast("Coupon sauvegardé avec succès !", 'success');
    } else {
      showToast("Erreur lors de la sauvegarde du coupon.", 'error');
    }
  };

  const onDeleteCouponClick = async (code: string) => {
    if (!confirm(`Voulez-vous supprimer le code promo ${code} ?`)) return;
    const success = await handleDeleteCoupon(code);
    if (success) {
      showToast("Coupon supprimé.", 'success');
    } else {
      showToast("Erreur lors de la suppression.", 'error');
    }
  };

  const onAddFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleAddFaq(faqForm);
    if (success) {
      setIsAddingFaq(false);
      setFaqForm({ q_fr: '', a_fr: '', q_ar: '', a_ar: '' });
      showToast("Question FAQ ajoutée !", 'success');
    } else {
      showToast("Erreur lors de l'ajout.", 'error');
    }
  };

  const onDeleteFaqClick = async (index: number) => {
    if (!confirm("Voulez-vous supprimer cette question de FAQ ?")) return;
    const success = await handleDeleteFaq(index);
    if (success) {
      showToast("Question FAQ supprimée.", 'success');
    } else {
      showToast("Erreur lors de la suppression.", 'error');
    }
  };

  const onCreateOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const formData = new FormData(target);
    const formValues = {
      name: String(formData.get('name')),
      username: String(formData.get('username')),
      password: String(formData.get('password')),
      role: String(formData.get('role'))
    };

    const success = await handleCreateOperator(formValues);
    if (success) {
      setIsAddingOperator(false);
      target.reset();
      showToast("Opérateur créé avec succès !", 'success');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      
      {/* Settings submenus (Horizontal Tab Bar) */}
      <nav className={`p-2 rounded-2xl border flex flex-row overflow-x-auto gap-2 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'}`}>
        {[
          { id: 'general', label: 'Paramètres Généraux', icon: Sliders },
          { id: 'homepage', label: 'Mise en Page de l\'Accueil', icon: Layout },
          { id: 'banners', label: 'Bannières Diaporama', icon: Sliders },
          { id: 'coupons', label: 'Codes Promo', icon: Percent },
          { id: 'shipping', label: 'Expéditions / Livreurs', icon: Truck },
          { id: 'payment', label: 'Configuration Paiements', icon: CreditCard },
          { id: 'loyalty', label: 'Programme Fidélité', icon: Star },
          { id: 'faq', label: 'Gestion de la FAQ', icon: HelpCircle },
          { id: 'logs', label: 'Logs d\'Audit', icon: FileText },
          { id: 'notifications', label: 'Notifications WhatsApp', icon: Bell },
          { id: 'security', label: 'Sécurité & 2FA', icon: Lock },
          ...(currentUser?.role === 'owner' ? [{ id: 'operators', label: 'Gestion des Opérateurs', icon: Users }] : [])
        ].map(sub => {
          const Icon = sub.icon;
          const isSubActive = activeSettingsSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setActiveSettingsSubTab(sub.id as any);
                setIsAddingCoupon(false);
                setSelectedBannerIndex(null);
                setIsAddingFaq(false);
              }}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 ${
                isSubActive
                  ? (adminTheme === 'light'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40 shadow-sm'
                      : 'bg-slate-950 text-emerald-400 border-slate-800 shadow-sm')
                  : (adminTheme === 'light'
                      ? 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/20')
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition ${isSubActive ? (adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400') : 'text-slate-500'}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sub-tab main workspace */}
      <div className="w-full">
        {currentUser?.role !== 'owner' && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs px-4 py-3 rounded-2xl mb-4 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Mode Lecture Seule : Vous n&apos;avez pas les permissions d&apos;administrateur principal (Owner) pour modifier la configuration de la boutique.</span>
          </div>
        )}

        {/* A. GENERAL STORE SETTINGS */}
        {activeSettingsSubTab === 'general' && (
          <form onSubmit={onSaveGeneralSettings} className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                Paramètres généraux de la boutique
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Variables globales de marque et d&apos;administration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Nom du site de e-commerce', name: 'storeName', defaultValue: settings.storeName, type: 'text' },
                { label: 'Code d\'accès Administrateur', name: 'adminPasscode', defaultValue: settings.adminPasscode, type: 'text', font: 'font-mono' },
                { label: 'Téléphone Magasin', name: 'storePhone', defaultValue: settings.storePhone, type: 'text' },
                { label: 'WhatsApp Numéro (International format)', name: 'storeWhatsApp', defaultValue: settings.storeWhatsApp, type: 'text', font: 'font-mono' },
                { label: 'Livraison Gratuite à partir de (DH)', name: 'freeShippingThreshold', defaultValue: settings.freeShippingThreshold, type: 'number', align: 'text-right' },
                { label: 'Frais de livraison de base (DH)', name: 'shippingFee', defaultValue: settings.shippingFee, type: 'number', align: 'text-right' },
                { label: 'Discount Diagnostic IA (%)', name: 'quizDiscountPercent', defaultValue: settings.quizDiscountPercent, type: 'number', align: 'text-right' },
                { label: 'Seuil d\'alerte Stock Bas (Pièces)', name: 'lowStockThreshold', defaultValue: settings.lowStockThreshold ?? 5, type: 'number', align: 'text-right' },
              ].map((inp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>{inp.label}</label>
                  <input
                    type={inp.type}
                    name={inp.name}
                    defaultValue={inp.defaultValue}
                    className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${inp.font || ''} ${inp.align || ''} ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                    }`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Bandeau d&apos;annonce (Français)</label>
                <textarea
                  name="announcementFr"
                  defaultValue={settings.announcementFr}
                  rows={2}
                  className={`w-full text-xs transition outline-none rounded-xl p-3 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Bandeau d&apos;annonce (Arabe)</label>
                <textarea
                  name="announcementAr"
                  defaultValue={settings.announcementAr}
                  rows={2}
                  className={`w-full text-xs transition outline-none rounded-xl p-3 border text-right ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                  }`}
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <div className={`pt-4 border-t flex justify-end ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </form>
        )}

        {/* C. HOMEPAGE VISUAL LAYOUT CUSTOMIZER */}
        {activeSettingsSubTab === 'homepage' && (() => {
          const SECTION_METADATA: Record<string, { nameFr: string; descFr: string; icon: any; color: string }> = {
            hero: { nameFr: 'Carrousel Héro & Diaporama', descFr: 'Bannière animée rotative au sommet de la page.', icon: Layout, color: 'from-blue-500 to-indigo-500' },
            categoryTrack: { nameFr: 'Barre de Défilement des Catégories', descFr: 'Curseur horizontal de catégories.', icon: Layers, color: 'from-purple-500 to-pink-500' },
            productGrid: { nameFr: 'Grille Principale des Produits', descFr: 'Grille d\'affichage des produits vedettes.', icon: Package, color: 'from-amber-500 to-orange-500' },
            brandPartners: { nameFr: 'Marques Partenaires', descFr: 'Bandeau des logos des laboratoires.', icon: Users, color: 'from-teal-500 to-emerald-500' },
            diagnosticBanner: { nameFr: 'Diagnostic de Peau IA', descFr: 'Bannière d\'incitation au diagnostic IA.', icon: Activity, color: 'from-indigo-500 to-blue-500' },
            summerSale: { nameFr: 'Offres d\'Été (Summer Sale)', descFr: 'Deal Box d\'été avec compte à rebours.', icon: Gift, color: 'from-orange-500 to-red-500' },
            skinConcerns: { nameFr: 'Bento Préoccupations Cutanées', descFr: 'Sélecteur interactif de type de peau.', icon: Sliders, color: 'from-violet-500 to-purple-500' },
            flashSale: { nameFr: 'Bannière de Vente Flash', descFr: 'Bannière promotionnelle flash animée.', icon: Zap, color: 'from-yellow-500 to-orange-500' },
            horizontalPromo: { nameFr: 'Bannière Horizontale', descFr: 'Bannière publicitaire épurée.', icon: FileText, color: 'from-emerald-500 to-teal-500' },
            trustBar: { nameFr: 'Barre de Confiance Maroc', descFr: 'Indicateurs de réassurance client.', icon: Truck, color: 'from-cyan-500 to-blue-500' },
            customerReviews: { nameFr: 'Témoignages & Avis Clients', descFr: 'Carrousel des avis et témoignages.', icon: Star, color: 'from-amber-400 to-yellow-500' },
            triplePromo: { nameFr: 'Bannières Triple Promotionnelles', descFr: 'Grille de 3 bannières de saison.', icon: Layers, color: 'from-pink-500 to-rose-500' },
            topRated: { nameFr: 'Produits les Mieux Notés', descFr: 'Mise en page asymétrique des produits favoris.', icon: Star, color: 'from-emerald-500 to-teal-500' },
            bestSellers: { nameFr: 'Produits les Plus Vendus', descFr: 'Grille des produits les plus vendus.', icon: Sliders, color: 'from-indigo-500 to-purple-500' },
            weeklySales: { nameFr: 'Meilleures Ventes de la Semaine', descFr: 'Sélection de produits hebdomadaires.', icon: Sliders, color: 'from-pink-500 to-purple-500' },
            routineVisualizer: { nameFr: 'Visualiseur de Routine de Soins', descFr: 'Parcours interactif de soins matin/soir.', icon: Activity, color: 'from-teal-500 to-cyan-500' },
            featuredIngredient: { nameFr: 'Ingrédient Focus de la Semaine', descFr: 'Section focus sur un ingrédient.', icon: Star, color: 'from-purple-500 to-indigo-500' },
            ingredientDictionary: { nameFr: 'Dictionnaire des Ingrédients', descFr: 'Encyclopédie clinique des ingrédients.', icon: BookOpen, color: 'from-blue-500 to-teal-500' },
            faq: { nameFr: 'Foire Aux Questions (FAQ)', descFr: 'FAQ et centre d\'aide interactif.', icon: HelpCircle, color: 'from-emerald-500 to-blue-500' },
            customHtml: { nameFr: 'Code HTML Personnalisé', descFr: 'Bloc de code HTML ou scripts embeds libre.', icon: Terminal, color: 'from-slate-700 to-slate-900' },
            richText: { nameFr: 'Texte Enrichi & CTA', descFr: 'Bannière de texte avec titre, description et bouton.', icon: FileText, color: 'from-rose-500 to-amber-500' }
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Sections Tree */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`border rounded-3xl p-6 transition-all duration-200 space-y-4 ${
                  adminTheme === 'light'
                    ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                    : 'bg-slate-900/30 border-slate-900 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b pb-4 border-slate-100/55 dark:border-slate-800/40">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                          Arborescence de la Page
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Triez et gérez l&apos;affichage de vos sections
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {sectionsList.map((sec, idx) => {
                      const meta = SECTION_METADATA[sec.type] || { nameFr: sec.nameFr, descFr: '', icon: Layout, color: 'from-slate-500 to-slate-600' };
                      const IconComp = meta.icon;
                      const isEditing = editingSectionId === sec.id;

                      return (
                        <div
                          key={sec.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                            isEditing
                              ? adminTheme === 'light'
                                ? 'border-indigo-400 bg-indigo-50/50 shadow-md'
                                : 'border-indigo-700 bg-indigo-950/20 shadow-md'
                              : sec.visible
                                ? adminTheme === 'light'
                                  ? 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                : adminTheme === 'light'
                                  ? 'bg-slate-50 border-slate-100 opacity-60'
                                  : 'bg-slate-950/30 border-slate-900 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Reorder arrows */}
                            <div className="flex flex-col items-center shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const newList = [...sectionsList];
                                  const temp = newList[idx];
                                  newList[idx] = newList[idx - 1];
                                  newList[idx - 1] = temp;
                                  setSectionsList(newList);
                                }}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 transition"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === sectionsList.length - 1}
                                onClick={() => {
                                  const newList = [...sectionsList];
                                  const temp = newList[idx];
                                  newList[idx] = newList[idx + 1];
                                  newList[idx + 1] = temp;
                                  setSectionsList(newList);
                                }}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 transition"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Section Icon */}
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} p-2 text-white shadow-sm shrink-0 flex items-center justify-center`}>
                              <IconComp className="w-4 h-4" />
                            </div>

                            {/* Name */}
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${
                                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                              }`}>
                                {sec.settings?.titleFr || meta.nameFr}
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5 lowercase">
                                {sec.type}
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {/* Toggle visibility */}
                            <button
                              type="button"
                              onClick={() => {
                                const newList = sectionsList.map(s => s.id === sec.id ? { ...s, visible: !s.visible } : s);
                                setSectionsList(newList);
                              }}
                              className={`p-1.5 rounded-lg border transition-all duration-150 ${
                                sec.visible
                                  ? adminTheme === 'light'
                                    ? 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                    : 'text-emerald-400 bg-emerald-900/10 border-emerald-900/30'
                                  : adminTheme === 'light'
                                    ? 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    : 'text-slate-500 bg-slate-955 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Select for edit */}
                            <button
                              type="button"
                              onClick={() => setEditingSectionId(sec.id)}
                              className={`p-1.5 rounded-lg border transition-all duration-150 ${
                                isEditing
                                  ? adminTheme === 'light'
                                    ? 'text-indigo-500 bg-indigo-50 border-indigo-100'
                                    : 'text-indigo-400 bg-indigo-900/10 border-indigo-900/30'
                                  : adminTheme === 'light'
                                    ? 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    : 'text-slate-500 bg-slate-955 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => {
                                const newList = sectionsList.filter(s => s.id !== sec.id);
                                setSectionsList(newList);
                                if (editingSectionId === sec.id) setEditingSectionId(null);
                                showToast("Section supprimée.", 'info');
                              }}
                              className={`p-1.5 rounded-lg border transition-all duration-150 ${
                                adminTheme === 'light'
                                  ? 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'
                                  : 'text-red-400 bg-red-950/20 border-red-900/30 hover:bg-red-955/40'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Section dropdown */}
                  <div className="pt-2 relative">
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(!isAddingSection)}
                      className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 border-dashed transition-all duration-200 text-xs font-bold ${
                        adminTheme === 'light'
                          ? 'border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-650 hover:bg-indigo-50/5'
                          : 'border-slate-800 text-slate-550 hover:border-indigo-700 hover:text-indigo-404 hover:bg-indigo-950/10'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une section
                    </button>

                    {isAddingSection && (
                      <div className={`absolute left-0 right-0 bottom-full mb-2.5 z-40 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl p-2 space-y-1 ${
                        adminTheme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="text-[9px] font-black uppercase text-slate-455 px-3 py-1.5 border-b border-slate-100/50 dark:border-slate-800/40">
                          Sélectionnez la section à créer
                        </div>
                        {Object.entries(SECTION_METADATA).map(([type, meta]) => (
                          <button
                            type="button"
                            key={`add-type-${type}`}
                            onClick={() => {
                              const newId = `${type}-${Date.now()}`;
                              const newSection = {
                                id: newId,
                                type,
                                nameFr: meta.nameFr,
                                visible: true,
                                settings: type === 'topRated' || type === 'bestSellers' || type === 'weeklySales' || type === 'summerSale'
                                  ? { titleFr: meta.nameFr, titleAr: '', productIds: [] }
                                  : type === 'richText'
                                    ? { titleFr: 'Titre de la section', titleAr: '', descFr: 'Ajoutez une description ici...', descAr: '', ctaTextFr: 'En savoir plus', ctaLink: '#', bgColor: '#f9fafb', textColor: '#111827' }
                                    : type === 'customHtml'
                                      ? { html: '<!-- Insérez votre code HTML ou scripts embeds ici -->' }
                                      : {}
                              };
                              setSectionsList([...sectionsList, newSection]);
                              setEditingSectionId(newId);
                              setIsAddingSection(false);
                              showToast(`Section "${meta.nameFr}" ajoutée !`, 'success');
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-xl transition text-xs ${
                              adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${meta.color} p-1.5 text-white flex items-center justify-center shrink-0`}>
                              <meta.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold truncate">{meta.nameFr}</div>
                              <div className="text-[9px] text-slate-400 truncate max-w-[200px]">{meta.descFr}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save modifications */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveHomepageSettings}
                    disabled={saveHomepageState === 'saving'}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-650 text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:from-indigo-600 hover:to-indigo-750 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saveHomepageState === 'saving' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : saveHomepageState === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Modifications Enregistrées !
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Enregistrer la mise en page
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Contextual Section Settings */}
              <div className="lg:col-span-7">
                {editingSectionId === null ? (
                  <div className={`border rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4 ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                      : 'bg-slate-900/30 border-slate-900 shadow-xl'
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                      adminTheme === 'light' ? 'bg-indigo-50 text-indigo-500' : 'bg-indigo-950/20 text-indigo-400'
                    }`}>
                      <Layout className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-202'}`}>
                        Aucune section sélectionnée
                      </h3>
                      <p className="text-xs text-slate-505 max-w-xs mt-1 leading-relaxed">
                        Sélectionnez une section dans l&apos;arborescence de gauche à l&apos;aide du bouton <Sliders className="inline w-3 h-3 mx-0.5 text-slate-400" /> pour commencer à l&apos;éditer.
                      </p>
                    </div>
                  </div>
                ) : (() => {
                  const activeSectionIndex = sectionsList.findIndex(s => s.id === editingSectionId);
                  if (activeSectionIndex === -1) {
                    setEditingSectionId(null);
                    return null;
                  }
                  const activeSection = sectionsList[activeSectionIndex];
                  const meta = SECTION_METADATA[activeSection.type] || { nameFr: activeSection.nameFr, descFr: '', icon: Layout, color: 'from-slate-500 to-slate-600' };

                  const updateActiveSectionSettings = (newSettings: any) => {
                    const newList = [...sectionsList];
                    newList[activeSectionIndex] = {
                      ...newList[activeSectionIndex],
                      settings: {
                        ...newList[activeSectionIndex].settings,
                        ...newSettings
                      }
                    };
                    setSectionsList(newList);
                  };

                  const activeProductIds = activeSection.settings?.productIds || [];

                  return (
                    <div className={`border rounded-3xl p-6 transition-all duration-200 space-y-6 ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                        : 'bg-slate-900/30 border-slate-900 shadow-xl'
                    }`}>
                      {/* Section Info Header */}
                      <div className={`flex items-center justify-between border-b pb-4 ${
                        adminTheme === 'light' ? 'border-slate-100' : 'border-slate-850'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.color} p-2 text-white flex items-center justify-center shrink-0`}>
                            <meta.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className={`text-sm font-extrabold truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-202'}`}>
                              Édition: {activeSection.settings?.titleFr || meta.nameFr}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              ID: <span className="font-mono">{activeSection.id}</span> · Type: <span className="font-mono">{activeSection.type}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingSectionId(null)}
                          className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {/* Fields */}
                      <div className="space-y-5">
                        {/* Custom HTML editor */}
                        {activeSection.type === 'customHtml' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Code HTML / JavaScript / Embed
                              </label>
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-mono">HTML</span>
                            </div>
                            <textarea
                              rows={15}
                              value={activeSection.settings?.html || ''}
                              onChange={(e) => updateActiveSectionSettings({ html: e.target.value })}
                              className="w-full text-[11px] font-mono transition outline-none rounded-xl p-3 border bg-slate-950 border-slate-900 text-emerald-400 shadow-inner"
                              placeholder="<div>\n  <p>Votre bloc de code HTML...</p>\n</div>"
                            />
                            <p className="text-[9.5px] text-slate-400 leading-relaxed italic">
                              * Vous pouvez injecter des iframes Google Maps, des embeds de réseaux sociaux, des lecteurs vidéo tiers ou du code CSS/JS personnalisé.
                            </p>
                          </div>
                        )}

                        {/* Rich Text editor */}
                        {activeSection.type === 'richText' && (
                          <div className="space-y-4">
                            {/* Titles */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Titre (FR)</label>
                                <input
                                  type="text"
                                  value={activeSection.settings?.titleFr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ titleFr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Titre (AR)</label>
                                <input
                                  type="text"
                                  value={activeSection.settings?.titleAr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ titleAr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* Descriptions */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Description (FR)</label>
                                <textarea
                                  rows={4}
                                  value={activeSection.settings?.descFr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ descFr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Description (AR)</label>
                                <textarea
                                  rows={4}
                                  value={activeSection.settings?.descAr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ descAr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* CTA block */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-505">Texte du Bouton (FR)</label>
                                <input
                                  type="text"
                                  value={activeSection.settings?.ctaTextFr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ ctaTextFr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                  placeholder="Découvrir"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-505">Texte du Bouton (AR)</label>
                                <input
                                  type="text"
                                  value={activeSection.settings?.ctaTextAr || ''}
                                  onChange={(e) => updateActiveSectionSettings({ ctaTextAr: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                  placeholder="تسوقي الآن"
                                  dir="rtl"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Lien de redirection</label>
                                <input
                                  type="text"
                                  value={activeSection.settings?.ctaLink || ''}
                                  onChange={(e) => updateActiveSectionSettings({ ctaLink: e.target.value })}
                                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                                    adminTheme === 'light' ? 'bg-slate-55 border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-900 text-slate-202'
                                  }`}
                                  placeholder="/products or link"
                                />
                              </div>
                            </div>

                            {/* Styles */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Arrière-plan</label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="color"
                                    value={activeSection.settings?.bgColor || '#f9fafb'}
                                    onChange={(e) => updateActiveSectionSettings({ bgColor: e.target.value })}
                                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 p-0 shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={activeSection.settings?.bgColor || '#f9fafb'}
                                    onChange={(e) => updateActiveSectionSettings({ bgColor: e.target.value })}
                                    className={`flex-1 text-xs font-mono px-3 py-1.5 rounded-xl border ${
                                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-955 border-slate-900 text-slate-202'
                                    }`}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Couleur du texte</label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="color"
                                    value={activeSection.settings?.textColor || '#111827'}
                                    onChange={(e) => updateActiveSectionSettings({ textColor: e.target.value })}
                                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 p-0 shrink-0"
                                  />
                                  <input
                                    type="text"
                                    value={activeSection.settings?.textColor || '#111827'}
                                    onChange={(e) => updateActiveSectionSettings({ textColor: e.target.value })}
                                    className={`flex-1 text-xs font-mono px-3 py-1.5 rounded-xl border ${
                                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-805' : 'bg-slate-955 border-slate-900 text-slate-202'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Product list editor (topRated, bestSellers, weeklySales, summerSale, productGrid) */}
                        {(activeSection.type === 'topRated' || activeSection.type === 'bestSellers' || activeSection.type === 'weeklySales' || activeSection.type === 'summerSale' || activeSection.type === 'productGrid') && (
                          <div className="space-y-4">
                            {/* Titles (If not SummerSale which doesn't display heading) */}
                            {activeSection.type !== 'summerSale' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Titre de section (FR)</label>
                                  <input
                                    type="text"
                                    value={activeSection.settings?.titleFr || ''}
                                    onChange={(e) => updateActiveSectionSettings({ titleFr: e.target.value })}
                                    className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-955 border-slate-900 text-slate-202'
                                    }`}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Titre de section (AR)</label>
                                  <input
                                    type="text"
                                    value={activeSection.settings?.titleAr || ''}
                                    onChange={(e) => updateActiveSectionSettings({ titleAr: e.target.value })}
                                    className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right ${
                                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-955 border-slate-900 text-slate-202'
                                    }`}
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Section Selected Products List */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Produits Liés</label>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  activeProductIds.length === 0
                                    ? 'bg-amber-100 text-amber-700'
                                    : adminTheme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {activeProductIds.length} sélectionnés
                                </span>
                              </div>

                              {activeProductIds.length === 0 && (
                                <div className={`py-8 rounded-2xl border-2 border-dashed text-center ${
                                  adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'
                                }`}>
                                  <Package className="w-7 h-7 mx-auto mb-2 text-slate-300 opacity-70" />
                                  <p className="text-xs font-semibold text-slate-400">Aucun produit configuré</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 opacity-75">
                                    Les produits les mieux notés/vendus s&apos;afficheront automatiquement
                                  </p>
                                </div>
                              )}

                              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {activeProductIds.map((id: number, pIdx: number) => {
                                  const prod = products.find(p => p.id === id);
                                  if (!prod) return null;
                                  return (
                                    <div
                                      key={`sec-p-item-${id}-${pIdx}`}
                                      className={`flex items-center justify-between p-2 rounded-xl border transition ${
                                        adminTheme === 'light'
                                          ? 'bg-white border-slate-100 hover:border-slate-250 shadow-sm'
                                          : 'bg-slate-900/60 border-slate-850 hover:border-slate-750'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        {/* Sort arrows */}
                                        <div className="flex flex-col items-center shrink-0">
                                          <button
                                            type="button"
                                            disabled={pIdx === 0}
                                            onClick={() => {
                                              const newIds = [...activeProductIds];
                                              const temp = newIds[pIdx];
                                              newIds[pIdx] = newIds[pIdx - 1];
                                              newIds[pIdx - 1] = temp;
                                              updateActiveSectionSettings({ productIds: newIds });
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-slate-650 disabled:opacity-20"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={pIdx === activeProductIds.length - 1}
                                            onClick={() => {
                                              const newIds = [...activeProductIds];
                                              const temp = newIds[pIdx];
                                              newIds[pIdx] = newIds[pIdx + 1];
                                              newIds[pIdx + 1] = temp;
                                              updateActiveSectionSettings({ productIds: newIds });
                                            }}
                                            className="p-0.5 text-slate-400 hover:text-slate-650 disabled:opacity-20"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 ring-1 ring-black/5">
                                          {prod.image && <img src={prod.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className={`text-xs font-bold truncate ${adminTheme === 'light' ? 'text-slate-850' : 'text-slate-200'}`}>
                                            {prod.nameFr || prod.title}
                                          </p>
                                          <p className="text-[9.5px] text-slate-400 mt-0.5">
                                            {prod.price} DH · Stock: {prod.stock ?? 0}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newIds = activeProductIds.filter((pId: number) => pId !== id);
                                          updateActiveSectionSettings({ productIds: newIds });
                                        }}
                                        className={`p-1.5 rounded-lg border transition ${
                                          adminTheme === 'light'
                                            ? 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'
                                            : 'text-red-400 bg-red-950/20 border-red-900/30 hover:bg-red-955/40'
                                        }`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Dropdown product search selector */}
                              <div className="relative pt-1.5">
                                {!trOpen ? (
                                  <button
                                    type="button"
                                    onClick={() => setTrOpen(true)}
                                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed text-xs font-bold ${
                                      adminTheme === 'light'
                                        ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-350 bg-slate-50/50'
                                        : 'border-slate-805 text-slate-550 hover:text-slate-400 hover:border-slate-700 bg-slate-950/20'
                                    }`}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Associer un produit à la section
                                  </button>
                                ) : (
                                  <div className={`rounded-xl border shadow-xl overflow-hidden ${
                                    adminTheme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'
                                  }`}>
                                    <div className={`flex items-center gap-2 px-3 py-2 border-b ${
                                      adminTheme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-850 bg-slate-950/30'
                                    }`}>
                                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <input
                                        type="text"
                                        autoFocus
                                        value={trSearch}
                                        onChange={(e) => setTrSearch(e.target.value)}
                                        placeholder="Rechercher par nom..."
                                        className={`flex-1 bg-transparent outline-none text-xs font-semibold ${
                                          adminTheme === 'light' ? 'text-slate-850 placeholder-slate-400' : 'text-slate-200 placeholder-slate-550'
                                        }`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => { setTrOpen(false); setTrSearch(''); }}
                                        className="text-slate-400 hover:text-slate-650"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                      {products
                                        .filter(p => {
                                          const name = (p.nameFr || p.title || '').toLowerCase();
                                          const q = trSearch.toLowerCase();
                                          return !activeProductIds.includes(p.id) && (!q || name.includes(q));
                                        })
                                        .slice(0, 10)
                                        .map(p => (
                                          <button
                                            type="button"
                                            key={`add-p-opt-${p.id}`}
                                            onClick={() => {
                                              updateActiveSectionSettings({ productIds: [...activeProductIds, p.id] });
                                              setTrOpen(false);
                                              setTrSearch('');
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left border-b last:border-0 text-xs transition ${
                                              adminTheme === 'light'
                                                ? 'border-slate-50 hover:bg-slate-50 text-slate-700'
                                                : 'border-slate-850/50 hover:bg-slate-800/65 text-slate-300'
                                            }`}
                                          >
                                            <div className="w-8 h-8 rounded overflow-hidden bg-slate-100 shrink-0">
                                              {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <span className="flex-1 truncate font-medium">{p.nameFr || p.title}</span>
                                            <span className="text-[10px] font-bold text-slate-455 shrink-0">{p.price} DH</span>
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Standard section global warning / Specialized editors */}
                        {activeSection.type === 'hero' && (
                          <div className="space-y-6">
                            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                              <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-355'}`}>
                                Diapositives du Carrousel Héro
                              </h4>
                              <p className="text-[10px] text-slate-505 mt-1">
                                Sélectionnez une diapositive ci-dessous pour la modifier.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {settings.banners?.map((banner, index) => (
                                <div 
                                  key={index}
                                  onClick={() => handleOpenBannerEdit(index)}
                                  className={`relative h-28 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-end p-3 border ${
                                    selectedBannerIndex === index
                                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                      : adminTheme === 'light'
                                        ? 'border-slate-200 bg-white hover:border-indigo-500/50 hover:shadow-sm'
                                        : 'border-slate-805 bg-slate-950 hover:border-indigo-500/50'
                                  }`}
                                >
                                  <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1000ms] group-hover:scale-105"
                                    style={{ backgroundImage: `url(${banner.bgImage})` }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
                                  
                                  <div className="relative z-10 space-y-0.5 keep-light">
                                    <span className="text-[7.5px] font-bold text-emerald-400 uppercase tracking-widest block bg-emerald-950/60 border border-emerald-900/50 rounded px-1.5 py-0.5 w-fit">
                                      Diapositive #{index + 1} • {banner.tagFr}
                                    </span>
                                    <h4 className="font-extrabold text-[11px] text-slate-100 truncate">{banner.titleFr}</h4>
                                    <span className="text-[8.5px] text-slate-400 font-mono block truncate">Lien: {banner.linkType} &rarr; {banner.linkValue || 'Aucun'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {selectedBannerIndex !== null && (
                              <div className={`border rounded-2xl p-4 mt-2 space-y-4 ${
                                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'
                              }`}>
                                <div className="flex justify-between items-center border-b pb-2 border-slate-200/50 dark:border-slate-800/40">
                                  <h4 className="text-xs font-black uppercase text-indigo-500">
                                    Modifier la Diapositive #{selectedBannerIndex + 1}
                                  </h4>
                                  <button type="button" onClick={() => setSelectedBannerIndex(null)} className="text-slate-400 hover:text-slate-200">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Tag (FR)</label>
                                    <input
                                      type="text"
                                      value={bannerForm.tagFr || ''}
                                      onChange={(e) => setBannerForm({ ...bannerForm, tagFr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Tag (AR)</label>
                                    <input
                                      type="text"
                                      value={bannerForm.tagAr || ''}
                                      onChange={(e) => setBannerForm({ ...bannerForm, tagAr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border text-right ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Titre (FR)</label>
                                    <input
                                      type="text"
                                      value={bannerForm.titleFr || ''}
                                      onChange={(e) => setBannerForm({ ...bannerForm, titleFr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Titre (AR)</label>
                                    <input
                                      type="text"
                                      value={bannerForm.titleAr || ''}
                                      onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border text-right ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Image de fond (URL)</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={bannerForm.bgImage || ''}
                                        onChange={(e) => setBannerForm({ ...bannerForm, bgImage: e.target.value })}
                                        className={`flex-1 text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-850 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      />
                                      <label className="px-3 py-1.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-50 font-bold text-[10px] rounded-xl cursor-pointer flex items-center justify-center border border-transparent">
                                        Importer
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, 'banner')}
                                          className="hidden"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Type de redirection</label>
                                    <select
                                      value={bannerForm.linkType || 'diagnostic'}
                                      onChange={(e) => setBannerForm({ ...bannerForm, linkType: e.target.value as any })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                    >
                                      <option value="diagnostic">Diagnostic IA</option>
                                      <option value="category">Catégorie</option>
                                      <option value="product">Produit unique</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Valeur de redirection</label>
                                    <input
                                      type="text"
                                      placeholder="Nom catégorie ou ID produit"
                                      value={bannerForm.linkValue || ''}
                                      onChange={(e) => setBannerForm({ ...bannerForm, linkValue: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBannerIndex(null)}
                                    className="px-3.5 py-2 border rounded-xl text-[10px] uppercase font-bold text-slate-455 hover:bg-slate-100 dark:hover:bg-slate-900/40"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={onSaveBannerSubmit}
                                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[10px] uppercase font-black"
                                  >
                                    Enregistrer la Diapo
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeSection.type === 'faq' && (
                          <div className="space-y-4">
                            <div className={`border-b pb-3 flex justify-between items-center ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                              <div>
                                <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-355'}`}>
                                  Questions de la FAQ d&apos;Accueil
                                </h4>
                                <p className="text-[10px] text-slate-505 mt-0.5">
                                  Gérez les questions et réponses affichées sur la page d&apos;accueil.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsAddingFaq(!isAddingFaq)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                              >
                                {isAddingFaq ? 'Annuler' : 'Ajouter'}
                              </button>
                            </div>

                            {/* Add FAQ Form inline */}
                            {isAddingFaq && (
                              <form onSubmit={onAddFaqSubmit} className={`border rounded-2xl p-4 space-y-4 ${
                                adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950 border-slate-900 font-sans'
                              }`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Question (FR)</label>
                                    <input
                                      type="text"
                                      value={faqForm.q_fr}
                                      onChange={(e) => setFaqForm({ ...faqForm, q_fr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Question (AR)</label>
                                    <input
                                      type="text"
                                      value={faqForm.q_ar}
                                      onChange={(e) => setFaqForm({ ...faqForm, q_ar: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border text-right ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      dir="rtl"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Réponse (FR)</label>
                                    <textarea
                                      value={faqForm.a_fr}
                                      onChange={(e) => setFaqForm({ ...faqForm, a_fr: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      rows={2}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Réponse (AR)</label>
                                    <textarea
                                      value={faqForm.a_ar}
                                      onChange={(e) => setFaqForm({ ...faqForm, a_ar: e.target.value })}
                                      className={`w-full text-xs rounded-xl px-2.5 py-1.5 border text-right ${adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-900 text-slate-200 border-slate-800'}`}
                                      rows={2}
                                      dir="rtl"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[10px] uppercase font-black"
                                  >
                                    Ajouter la Question
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* List FAQ items */}
                            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                              {(settings.faq || []).map((faqItem, index) => (
                                <div 
                                  key={index}
                                  className={`p-3 rounded-xl border flex justify-between items-start gap-4 transition hover:shadow-sm ${
                                    adminTheme === 'light' ? 'bg-white border-slate-150' : 'bg-slate-900/60 border-slate-850'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0 text-xs space-y-1">
                                    <div className="border-b border-slate-100 dark:border-slate-850 pb-1.5 mb-1.5 flex justify-between text-[9px] font-bold text-slate-400">
                                      <span>FRANÇAIS</span>
                                      <span className="text-right" dir="rtl">العربية</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-0.5">
                                        <strong className="block font-extrabold text-slate-700 dark:text-slate-300">{faqItem.q_fr}</strong>
                                        <p className="text-[11px] text-slate-505 font-medium leading-relaxed">{faqItem.a_fr}</p>
                                      </div>
                                      <div className="space-y-0.5 text-right" dir="rtl">
                                        <strong className="block font-extrabold text-slate-700 dark:text-slate-300">{faqItem.q_ar}</strong>
                                        <p className="text-[11px] text-slate-550 font-medium leading-relaxed">{faqItem.a_ar}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteFaqClick(index)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeSection.type === 'diagnosticBanner' && (
                          <div className="space-y-4">
                            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                              <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-355'}`}>
                                Diagnostic Intelligent IA
                              </h4>
                              <p className="text-[10px] text-slate-505 mt-0.5">
                                Configurez les récompenses du quiz de diagnostic intelligent de la peau.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                                Pourcentage de réduction de récompense (%)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={settings.quizDiscountPercent || 15}
                                  onChange={async (e) => {
                                    const val = Number(e.target.value);
                                    await saveSettings({ ...settings, quizDiscountPercent: val });
                                  }}
                                  className={`w-28 text-xs font-bold rounded-xl px-3 py-2 border ${adminTheme === 'light' ? 'bg-white text-slate-805 border-slate-200' : 'bg-slate-900 text-slate-202 border-slate-800'}`}
                                />
                                <span className="text-[11px] font-semibold text-slate-450">
                                  offert aux clients après la finalisation du diagnostic cutané.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeSection.type === 'trustBar' && (
                          <div className="space-y-4">
                            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                              <h4 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-355'}`}>
                                Barre de Confiance Maroc
                              </h4>
                              <p className="text-[10px] text-slate-505 mt-0.5">
                                Ajustez le numéro WhatsApp de contact pour la barre de réassurance d&apos;accueil.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                                Numéro WhatsApp d&apos;assistance (format international sans + ou 00)
                              </label>
                              <input
                                type="text"
                                value={settings.storeWhatsApp || ''}
                                onChange={async (e) => {
                                  await saveSettings({ ...settings, storeWhatsApp: e.target.value });
                                }}
                                className={`w-full text-xs font-bold rounded-xl px-3 py-2 border ${adminTheme === 'light' ? 'bg-white text-slate-850 border-slate-200' : 'bg-slate-900 text-slate-202 border-slate-800'}`}
                                placeholder="Ex: 212660808080"
                              />
                            </div>
                          </div>
                        )}

                        {/* Fallback for other standard sections */}
                        {activeSection.type !== 'customHtml' && 
                         activeSection.type !== 'richText' && 
                         activeSection.type !== 'topRated' && 
                         activeSection.type !== 'bestSellers' && 
                         activeSection.type !== 'weeklySales' && 
                         activeSection.type !== 'summerSale' && 
                         activeSection.type !== 'hero' && 
                         activeSection.type !== 'faq' && 
                         activeSection.type !== 'diagnosticBanner' && 
                         activeSection.type !== 'trustBar' && (
                          <div className="space-y-4 py-8 text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                              adminTheme === 'light' ? 'bg-slate-50 text-slate-400' : 'bg-slate-850 text-slate-550'
                            }`}>
                              <meta.icon className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <p className={`text-xs font-bold ${adminTheme === 'light' ? 'text-slate-750' : 'text-slate-200'}`}>
                                {meta.nameFr}
                              </p>
                              <p className="text-[10.5px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                                {meta.descFr || "Cette section s'affiche automatiquement en fonction des données globales de la boutique."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

        {/* B. HERO DIAPORAMA SLIDESHOW MANAGER */}
        {activeSettingsSubTab === 'banners' && (
          <div className="space-y-6">
            <div className={`border rounded-3xl p-6 transition-all duration-200 space-y-6 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                : 'bg-slate-900/30 border-slate-900 shadow-xl'
            }`}>
              <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Gestionnaire du Diaporama d&apos;Accueil
                </h3>
                <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Visualisez et modifiez les 4 bannières de la grille Hero principale de la boutique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.banners?.map((banner, index) => (
                  <div 
                    key={index}
                    onClick={() => handleOpenBannerEdit(index)}
                    className={`relative h-44 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-end p-4 border ${
                      adminTheme === 'light'
                        ? 'border-slate-200 bg-white hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)]'
                        : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:shadow-lg'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[1000ms] group-hover:scale-105"
                      style={{ backgroundImage: `url(${banner.bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
                    
                    <div className="absolute top-3 right-3 z-20 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleMoveBanner(index, 'up');
                            if (!success) showToast("Erreur lors du déplacement de la bannière.", 'error');
                          }}
                          title="Déplacer vers le haut"
                          className="p-1.5 bg-slate-950/80 hover:bg-emerald-500 border border-slate-800 hover:border-emerald-400 text-slate-300 hover:text-slate-950 rounded-lg transition shadow cursor-pointer"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {index < (settings.banners?.length || 0) - 1 && (
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleMoveBanner(index, 'down');
                            if (!success) showToast("Erreur lors du déplacement de la bannière.", 'error');
                          }}
                          title="Déplacer vers le bas"
                          className="p-1.5 bg-slate-950/80 hover:bg-emerald-500 border border-slate-800 hover:border-emerald-400 text-slate-300 hover:text-slate-950 rounded-lg transition shadow cursor-pointer"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1 keep-light">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block bg-emerald-950/60 border border-emerald-900/50 rounded px-1.5 py-0.5 w-fit">
                        Diapositive #{index + 1} • {banner.tagFr}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-100">{banner.titleFr}</h4>
                      <span className="text-[9px] text-slate-400 font-mono block">Lien: {banner.linkType} &rarr; {banner.linkValue || 'Aucun'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EDIT DIAPOSITIVE MODAL/DRAWER */}
            {selectedBannerIndex !== null && (
              <form onSubmit={onSaveBannerSubmit} className={`border rounded-3xl p-6 transition-all duration-200 space-y-6 ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                  : 'bg-slate-900/30 border-emerald-500/20 shadow-xl'
              }`}>
                <div className={`flex justify-between items-center border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      Modifier la Diapositive #{selectedBannerIndex + 1}
                    </h3>
                    <span className={`text-[10px] font-light block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {bannerForm.titleFr}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedBannerIndex(null)} className={`transition-colors ${adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Tag (Français)', value: bannerForm.tagFr, key: 'tagFr', dir: 'ltr' },
                    { label: 'Tag (Arabe)', value: bannerForm.tagAr, key: 'tagAr', dir: 'rtl' },
                    { label: 'Titre (Français)', value: bannerForm.titleFr, key: 'titleFr', dir: 'ltr' },
                    { label: 'Titre (Arabe)', value: bannerForm.titleAr, key: 'titleAr', dir: 'rtl' },
                    { label: 'CTA Bouton (Français)', value: bannerForm.ctaFr, key: 'ctaFr', dir: 'ltr' },
                    { label: 'CTA Bouton (Arabe)', value: bannerForm.ctaAr, key: 'ctaAr', dir: 'rtl' }
                  ].map((fld) => (
                    <div key={fld.key} className="space-y-1">
                      <label className={`text-[9px] font-bold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>{fld.label}</label>
                      <input
                        type="text"
                        value={fld.value}
                        onChange={(e) => setBannerForm({...bannerForm, [fld.key]: e.target.value})}
                        dir={fld.dir}
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                          fld.dir === 'rtl' ? 'text-right font-sans' : ''
                        } ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                        required
                      />
                    </div>
                  ))}

                  {selectedBannerIndex === 0 && (
                    <>
                      <div className="space-y-1">
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>Description (Français)</label>
                        <textarea
                          value={bannerForm.descFr || ''}
                          onChange={(e) => setBannerForm({...bannerForm, descFr: e.target.value})}
                          className={`w-full text-xs transition outline-none rounded-xl p-3 border ${
                            adminTheme === 'light'
                              ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                              : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                          }`}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>Description (Arabe)</label>
                        <textarea
                          value={bannerForm.descAr || ''}
                          onChange={(e) => setBannerForm({...bannerForm, descAr: e.target.value})}
                          className={`w-full text-xs transition outline-none rounded-xl p-3 border text-right ${
                            adminTheme === 'light'
                              ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                              : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                          }`}
                          rows={2}
                          dir="rtl"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Type de Cible</label>
                    <select 
                      value={bannerForm.linkType} 
                      onChange={(e) => setBannerForm({...bannerForm, linkType: e.target.value as any})}
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                    >
                      <option value="diagnostic">Diagnostic IA</option>
                      <option value="category">Catégorie spécifique</option>
                      <option value="product">Produit spécifique</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-bold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Valeur de la cible (Slug catégorie / ID Produit)</label>
                    <input
                      type="text"
                      value={bannerForm.linkValue}
                      onChange={(e) => setBannerForm({...bannerForm, linkValue: e.target.value})}
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                      placeholder="Ex: visage, hadalabo ou ID 15"
                      disabled={bannerForm.linkType === 'diagnostic'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[9px] font-bold uppercase tracking-wider block ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Arrière-Plan Image URL</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={bannerForm.bgImage}
                      onChange={(e) => setBannerForm({...bannerForm, bgImage: e.target.value})}
                      className={`flex-1 text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                      required
                    />
                    
                    <label 
                      htmlFor="banner-file-input"
                      className={`px-3 py-2 border font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1 transition-all ${
                        adminTheme === 'light'
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Chargement...' : 'Téléverser'}
                    </label>
                    <input 
                      id="banner-file-input"
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'banner')} 
                      className="hidden" 
                    />
                  </div>
                </div>

                <div className={`pt-4 border-t flex justify-end gap-2 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedBannerIndex(null)}
                    className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    Enregistrer la Diapositive
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* C. VISUAL DISCOUNT & COUPONS MANAGER */}
        {activeSettingsSubTab === 'coupons' && (
          <div className="space-y-6">
            
            {/* Coupon Creation Card form toggle */}
            <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-slate-900/30 border-slate-900'
            }`}>
              <span className={`text-xs font-semibold font-mono ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {(settings.coupons || []).length} codes enregistrés
              </span>
              <button
                onClick={() => setIsAddingCoupon(!isAddingCoupon)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
              >
                {isAddingCoupon ? 'Fermer le formulaire' : 'Créer un Code Promo'}
              </button>
            </div>

            {/* Create New Coupon Form */}
            {isAddingCoupon && (
              <form onSubmit={onSaveCouponSubmit} className={`border rounded-3xl p-6 transition-all duration-200 space-y-6 ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                  : 'bg-slate-900/30 border-emerald-500/20 shadow-xl'
              }`}>
                <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Nouveau coupon de réduction
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Code Promo (Saisi en majuscules)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: SPECIAL20"
                      value={couponForm.code} 
                      onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} 
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono font-bold ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                      }`}
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Type de réduction</label>
                    <select 
                      value={couponForm.discountType} 
                      onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as any})}
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                    >
                      <option value="percent">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (DH)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Valeur de la réduction</label>
                    <input 
                      type="number" 
                      value={couponForm.discountValue} 
                      onChange={(e) => setCouponForm({...couponForm, discountValue: Number(e.target.value)})} 
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono text-right ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Achat minimum requis (DH)</label>
                    <input 
                      type="number" 
                      value={couponForm.minPurchase} 
                      onChange={(e) => setCouponForm({...couponForm, minPurchase: Number(e.target.value)})} 
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono text-right ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Date d&apos;expiration</label>
                    <input 
                      type="date" 
                      value={couponForm.expiryDate} 
                      onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})} 
                      className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                          : 'bg-slate-950 border-slate-900 text-slate-200'
                      }`}
                      required 
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-6">
                    <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={couponForm.freeShipping} 
                        onChange={(e) => setCouponForm({...couponForm, freeShipping: e.target.checked})} 
                        className={`rounded text-emerald-500 focus:ring-emerald-500 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-900'
                        }`} 
                      />
                      Livraison Gratuite
                    </label>

                    <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        checked={couponForm.isActive} 
                        onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})} 
                        className={`rounded text-emerald-500 focus:ring-emerald-500 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-900'
                        }`} 
                      />
                      Actif Immédiatement
                    </label>
                  </div>
                </div>

                <div className={`pt-4 border-t flex justify-end gap-2 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <button
                    type="button"
                    onClick={() => setIsAddingCoupon(false)}
                    className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
                  >
                    Sauvegarder le Coupon
                  </button>
                </div>
              </form>
            )}

            {/* List of Coupon Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(settings.coupons || []).map((coupon) => {
                const discountTypeStr = coupon.discountType || 'percent';
                const discountValueNum = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discountPercent;
                const hasExpired = coupon.expiryDate ? new Date(coupon.expiryDate).getTime() < new Date().setHours(0,0,0,0) : false;
                const usageStat = dashboardStats?.couponUsageStats?.[coupon.code.toUpperCase()] || { count: 0, totalDiscount: 0 };

                return (
                  <div 
                    key={coupon.code} 
                    className={`border rounded-2xl p-5 space-y-4 hover:scale-[1.005] transition-all duration-300 relative flex flex-col justify-between ${
                      coupon.isActive === false
                        ? 'opacity-65 border-slate-200/50 bg-slate-50/50'
                        : (adminTheme === 'light'
                            ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md text-slate-800'
                            : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-200')
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className={`font-extrabold text-sm tracking-wider font-mono uppercase rounded px-2.5 py-1 border transition ${
                          adminTheme === 'light'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-100/80'
                            : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                        }`}>
                          {coupon.code}
                        </span>

                        <div className="flex gap-1.5 items-center">
                          {hasExpired && (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Expiré</span>
                          )}
                          <button 
                            onClick={() => handleToggleCouponActive(coupon.code)}
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                              coupon.isActive !== false 
                                ? (adminTheme === 'light'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/20')
                                : (adminTheme === 'light'
                                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                    : 'bg-slate-950 text-slate-500 border-slate-900 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/20')
                            }`}
                          >
                            {coupon.isActive !== false ? 'Actif' : 'Inactif'}
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-1 font-mono text-[10px] ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        <div className="flex justify-between">
                          <span>Valeur Réduction:</span>
                          <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                            {discountValueNum} {discountTypeStr === 'percent' ? '%' : 'DH'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Achat Minimum:</span>
                          <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{coupon.minPurchase || 0} DH</span>
                        </div>
                        {coupon.expiryDate && (
                          <div className="flex justify-between">
                            <span>Date Limite:</span>
                            <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{coupon.expiryDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Livraison Gratuite:</span>
                          <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{coupon.freeShipping ? 'OUI' : 'NON'}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`pt-3.5 border-t flex justify-between items-center ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-950/80'}`}>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Usage: {usageStat.count}x (-{usageStat.totalDiscount.toFixed(0)} DH)
                      </span>
                      <button
                        onClick={() => onDeleteCouponClick(coupon.code)}
                        className={`font-black uppercase tracking-wider text-[9px] flex items-center gap-0.5 cursor-pointer ${
                          adminTheme === 'light' ? 'text-rose-600 hover:text-rose-700' : 'text-rose-400 hover:text-rose-300'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* D. MOROCCAN COURIER INTEGRATION CONFIGS */}
        {activeSettingsSubTab === 'shipping' && (
          <>
          <form onSubmit={onSaveCourierSettings} className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                Intégration d&apos;API de Messageries Marocaines
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Configurer les transporteurs nationaux pour automatiser l&apos;expédition en 1 clic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Transporteur Marocain Partenaire</label>
                <select 
                  name="courierPartner" 
                  defaultValue={settings.courierPartner || 'yalidine'} 
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}
                >
                  <option value="yalidine">YALIDINE EXPRESS (Morocco)</option>
                  <option value="cathedis">CATHEDIS LOGISTICS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Mode de fonctionnement</label>
                <select 
                  name="courierMode" 
                  defaultValue={settings.courierMode || 'simulation'} 
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}
                >
                  <option value="simulation">Mode Simulation (Sans requêtes réelles)</option>
                  <option value="production">Mode Production (Enregistrement réel des colis)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Yalidine API ID</label>
                <input 
                  type="text" 
                  name="yalidineApiId" 
                  defaultValue={settings.yalidineApiId} 
                  placeholder="Ex: 50123"
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Yalidine API Key</label>
                <input 
                  type="password" 
                  name="yalidineApiKey" 
                  defaultValue={settings.yalidineApiKey} 
                  placeholder="••••••••••••••••••••••••"
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Cathedis API Key</label>
                <input 
                  type="password" 
                  name="cathedisApiKey" 
                  defaultValue={settings.cathedisApiKey} 
                  placeholder="••••••••••••••••••••••••"
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-[11px] leading-relaxed transition ${
              adminTheme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-slate-950 border-slate-900 text-slate-400'
            }`}>
              <strong className={`block mb-0.5 font-bold ${
                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'
              }`}>Note Logistique:</strong>
              Toute commande expédiée génère automatiquement un bon de transport simulé dans la console avec collecte du COD correspondant. Les étiquettes générées sont calibrées pour impression sur imprimante thermique A6 standard.
            </div>

            <div className={`pt-4 border-t flex justify-end ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
              >
                Enregistrer Configuration
              </button>
            </div>
          </form>

          {/* Custom Shipping Rules table */}
          <div className={`mt-6 border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 flex justify-between items-center ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Frais d&apos;expédition par ville (Maroc)
                </h3>
                <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Configurez des frais spécifiques et seuils de livraison gratuite pour chaque ville marocaine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const city = prompt("Saisir le nom de la ville (Ex: Casablanca) :");
                  if (!city) return;
                  const fee = prompt("Frais de livraison (DH) :", "20");
                  if (fee === null) return;
                  const threshold = prompt("Seuil de livraison gratuite (DH, optionnel) :", "300");
                  if (threshold === null) return;
                  
                  const newRules = [
                    ...(settings.shippingRules || []),
                    { city: city.trim(), fee: Number(fee), freeThreshold: threshold ? Number(threshold) : undefined }
                  ];
                  saveSettings({ ...settings, shippingRules: newRules });
                }}
                className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer"
              >
                + Ajouter Ville
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b ${adminTheme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'} text-[10px] uppercase font-bold`}>
                    <th className="py-2.5 px-3">Ville</th>
                    <th className="py-2.5 px-3 text-right">Frais Standards</th>
                    <th className="py-2.5 px-3 text-right">Livraison Gratuite Dès</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-900'}`}>
                  {(settings.shippingRules || []).map((rule, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition`}>
                      <td className="py-2.5 px-3 font-semibold">{rule.city}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{rule.fee} DH</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{rule.freeThreshold ? `${rule.freeThreshold} DH` : '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newRules = (settings.shippingRules || []).filter((_, i) => i !== idx);
                            saveSettings({ ...settings, shippingRules: newRules });
                          }}
                          className="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md text-[9px] font-bold uppercase transition cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(settings.shippingRules || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500 text-[10px]">
                        Aucune règle spécifique configurée. Les frais par défaut de {settings.shippingFee} DH s&apos;appliquent.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}

        {activeSettingsSubTab === 'payment' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const success = await handleSavePaymentSettings(paymentForm);
            if (success) {
              showToast("Paramètres de paiement sauvegardés avec succès !", 'success');
            } else {
              showToast("Échec de la sauvegarde.", 'error');
            }
          }} className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                Configuration des Modes de Paiement
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Activer et configurer les passerelles de paiement en ligne Stripe et CMI Maroc.
              </p>
            </div>

            {/* Master Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">Activer le paiement en ligne</h4>
                  <p className="text-[10px] text-slate-500">Afficher les options de paiement par carte bancaire au checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={paymentForm.onlinePaymentEnabled}
                    onChange={(e) => setPaymentForm({ ...paymentForm, onlinePaymentEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">Mode Test (Simulation)</h4>
                  <p className="text-[10px] text-slate-500">Activer le mode test pour simuler des paiements sans débit réel.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={paymentForm.testMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, testMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                </label>
              </div>
            </div>

            {paymentForm.onlinePaymentEnabled && (
              <div className="space-y-6 animate-fade-in">
                {/* STRIPE SECTION */}
                <div className={`p-5 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950 border-slate-900'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                        💳 Configuration Stripe (Visa/Mastercard)
                      </h4>
                      <p className="text-[10px] text-slate-500">Paiements par carte bancaire internationaux et nationaux.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={paymentForm.stripeEnabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, stripeEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  {paymentForm.stripeEnabled && (
                    <div className="space-y-4 animate-slide-down">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Clé Publique Stripe (Publishable Key)</label>
                          <input
                            type="text"
                            value={paymentForm.stripePublishableKey}
                            onChange={(e) => setPaymentForm({ ...paymentForm, stripePublishableKey: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="pk_test_..."
                            required={paymentForm.stripeEnabled}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Clé Secrète Stripe (Secret Key)</label>
                          <input
                            type="password"
                            value={paymentForm.stripeSecretKey}
                            onChange={(e) => setPaymentForm({ ...paymentForm, stripeSecretKey: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="sk_test_..."
                            required={paymentForm.stripeEnabled}
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Stripe Webhook Signing Secret (whsec_...)</label>
                          <input
                            type="password"
                            value={paymentForm.stripeWebhookSecret}
                            onChange={(e) => setPaymentForm({ ...paymentForm, stripeWebhookSecret: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="whsec_..."
                          />
                          <p className="text-[9px] text-slate-400">Requis pour valider la signature des webhooks entrants Stripe. Obtenez-le depuis votre dashboard Stripe → Développeurs → Webhooks.</p>
                        </div>

                        <div className={`md:col-span-2 p-3 rounded-xl border flex items-start gap-3 ${
                          adminTheme === 'light' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div className="space-y-1 w-full">
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${adminTheme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>URL du Webhook Stripe à configurer</p>
                            <p className="text-[9px] text-slate-400 mb-1.5">Copiez cette URL dans Stripe Dashboard → Développeurs → Webhooks → Ajouter un endpoint.</p>
                            <code className={`text-[9px] font-mono block break-all px-2 py-1.5 rounded-lg ${
                              adminTheme === 'light' ? 'bg-blue-500/10 text-blue-700' : 'bg-slate-950 text-blue-400'
                            }`}>
                              {typeof window !== 'undefined' ? window.location.origin : 'https://votre-boutique.com'}/api/payment/webhook
                            </code>
                            <p className={`text-[9px] mt-1.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Évènements à écouter : <code className="font-mono">payment_intent.succeeded</code>, <code className="font-mono">payment_intent.payment_failed</code></p>
                          </div>
                        </div>
                      </div>


                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!paymentForm.stripePublishableKey || !paymentForm.stripeSecretKey) {
                              alert("Veuillez renseigner les clés Stripe.");
                              return;
                            }
                            alert("Connexion Stripe validée ! (Simulation d'appel API réussie)");
                          }}
                          className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase cursor-pointer transition ${
                            adminTheme === 'light' ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          Tester la connexion Stripe
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* CMI SECTION */}
                <div className={`p-5 rounded-2xl border ${adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950 border-slate-900'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                        🇲🇦 Configuration CMI (Centre Monétaire Interbancaire)
                      </h4>
                      <p className="text-[10px] text-slate-500">Paiements nationaux via cartes bancaires marocaines (CMI, CIB).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={paymentForm.cmiEnabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cmiEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  {paymentForm.cmiEnabled && (
                    <div className="space-y-4 animate-slide-down">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Identifiant Marchand (Merchant ID)</label>
                          <input
                            type="text"
                            value={paymentForm.cmiMerchantId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cmiMerchantId: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="Ex: 600000000"
                            required={paymentForm.cmiEnabled}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Clé de Magasin (Store Key)</label>
                          <input
                            type="password"
                            value={paymentForm.cmiStoreKey}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cmiStoreKey: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="Clé secrète CMI..."
                            required={paymentForm.cmiEnabled}
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">URL API Passerelle CMI</label>
                          <input
                            type="text"
                            value={paymentForm.cmiApiUrl}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cmiApiUrl: e.target.value })}
                            className={`w-full text-xs outline-none rounded-xl px-3 py-2 border font-mono ${
                              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                            placeholder="https://testpayment.cmi.co.ma/fim/est3Dgate"
                            required={paymentForm.cmiEnabled}
                          />
                        </div>
                      </div>

                        <div className={`p-3 rounded-xl border flex items-start gap-3 mt-3 ${
                          adminTheme === 'light' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                          <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1 w-full">
                            <p className={`text-[10px] font-bold uppercase tracking-wide ${adminTheme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>URL de Callback CMI (Server-to-Server)</p>
                            <p className="text-[9px] text-slate-400 mb-1.5">Enregistrez cette URL dans votre espace marchand CMI pour les confirmations de paiement S2S.</p>
                            <code className={`text-[9px] font-mono block break-all px-2 py-1.5 rounded-lg ${
                              adminTheme === 'light' ? 'bg-amber-500/10 text-amber-700' : 'bg-slate-950 text-amber-400'
                            }`}>
                              {typeof window !== 'undefined' ? window.location.origin : 'https://votre-boutique.com'}/api/payment/cmi/callback
                            </code>
                          </div>
                        </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!paymentForm.cmiMerchantId || !paymentForm.cmiStoreKey || !paymentForm.cmiApiUrl) {
                              alert("Veuillez renseigner tous les champs CMI.");
                              return;
                            }
                            alert("Connexion CMI validée ! (Simulation d'appel API réussie)");
                          }}
                          className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase cursor-pointer transition ${
                            adminTheme === 'light' ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          Tester la connexion CMI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={`pt-4 border-t flex justify-end ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <button
                type="submit"
                disabled={currentUser?.role !== 'owner'}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50"
              >
                Enregistrer la configuration de paiement
              </button>
            </div>
          </form>
        )}

        {/* E. LOYALTY PROGRAM RULES */}
        {activeSettingsSubTab === 'loyalty' && (
          <form onSubmit={onSaveLoyaltySettings} className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                Règles du Programme Fidélité Beauty Wallet
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Configurer les taux d&apos;acquisition de points fidélité par palier client.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Points acquis par Dirham dépensé (DH)', name: 'loyaltyPointsPerDh', defaultValue: settings.loyaltyPointsPerDh || 1.0 },
                { label: 'Multiplicateur Palier BRONZE (Palier 0 - 299 DH)', name: 'loyaltyBronzeMultiplier', defaultValue: settings.loyaltyBronzeMultiplier || 1.0 },
                { label: 'Multiplicateur Palier SILVER (Palier 300 - 699 DH)', name: 'loyaltySilverMultiplier', defaultValue: settings.loyaltySilverMultiplier || 1.2 },
                { label: 'Multiplicateur Palier GOLD (Palier 700 - 1499 DH)', name: 'loyaltyGoldMultiplier', defaultValue: settings.loyaltyGoldMultiplier || 1.5 },
              ].map((inp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>{inp.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    name={inp.name}
                    defaultValue={inp.defaultValue}
                    className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right font-mono ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                    }`}
                    required
                  />
                </div>
              ))}

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Multiplicateur Palier PLATINUM (Palier 1500+ DH)</label>
                <input
                  type="number"
                  step="0.1"
                  name="loyaltyPlatinumMultiplier"
                  defaultValue={settings.loyaltyPlatinumMultiplier || 2.0}
                  className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right font-mono ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                      : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                  }`}
                  required
                />
              </div>
            </div>

            <div className={`pt-4 border-t flex justify-end ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
              >
                Enregistrer les règles fidélité
              </button>
            </div>
          </form>
        )}

        {/* F. FAQ ITEMS MANAGER */}
        {activeSettingsSubTab === 'faq' && (
          <div className="space-y-6">
            
            <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-slate-900/30 border-slate-900'
            }`}>
              <span className={`text-xs font-semibold font-mono ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {(settings.faq || []).length} questions enregistrées
              </span>
              <button
                onClick={() => setIsAddingFaq(!isAddingFaq)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
              >
                {isAddingFaq ? 'Fermer le formulaire' : 'Créer une entrée FAQ'}
              </button>
            </div>

            {/* Add FAQ form */}
            {isAddingFaq && (
              <form onSubmit={onAddFaqSubmit} className={`border rounded-3xl p-6 transition-all duration-200 space-y-6 ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                  : 'bg-slate-900/30 border-emerald-500/20 shadow-xl'
              }`}>
                <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Nouvelle question de FAQ
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>Question (Français)</label>
                      <input
                        type="text"
                        value={faqForm.q_fr}
                        onChange={(e) => setFaqForm({...faqForm, q_fr: e.target.value})}
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>Question (Arabe)</label>
                      <input
                        type="text"
                        value={faqForm.q_ar}
                        onChange={(e) => setFaqForm({...faqForm, q_ar: e.target.value})}
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border text-right ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>Réponse (Français)</label>
                      <textarea
                        value={faqForm.a_fr}
                        onChange={(e) => setFaqForm({...faqForm, a_fr: e.target.value})}
                        className={`w-full text-xs transition outline-none rounded-xl p-3 border ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>Réponse (Arabe)</label>
                      <textarea
                        value={faqForm.a_ar}
                        onChange={(e) => setFaqForm({...faqForm, a_ar: e.target.value})}
                        className={`w-full text-xs transition outline-none rounded-xl p-3 border text-right ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                        rows={3}
                        dir="rtl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={`pt-4 border-t flex justify-end gap-2 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <button
                    type="button"
                    onClick={() => setIsAddingFaq(false)}
                    className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
                  >
                    Ajouter la Question
                  </button>
                </div>
              </form>
            )}

            {/* Render FAQ Items */}
            <div className="space-y-4">
              {(settings.faq || []).map((faqItem, index) => (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-5 hover:scale-[1.005] transition-all duration-300 flex justify-between gap-6 items-start ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                      : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono block">FRANÇAIS</span>
                        <strong className={`text-xs block font-extrabold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{faqItem.q_fr}</strong>
                        <p className={`text-[11px] leading-relaxed font-normal ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{faqItem.a_fr}</p>
                      </div>

                      <div className="space-y-1 text-right" dir="rtl">
                        <span className="text-[9px] text-slate-500 font-mono block">العربية</span>
                        <strong className={`text-xs block font-extrabold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{faqItem.q_ar}</strong>
                        <p className={`text-[11px] leading-relaxed font-normal ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{faqItem.a_ar}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteFaqClick(index)}
                    className={`p-2 rounded-xl transition border cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 shadow-sm'
                        : 'bg-slate-950 border-slate-900 hover:border-rose-900 hover:text-rose-400 text-slate-500'
                    }`}
                    title="Supprimer la question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* G. FULL VIEW AUDIT LOGS */}
        {activeSettingsSubTab === 'logs' && (
          <div className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 flex justify-between items-center ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'
            }`}>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Journal global des Actions Administratives
                </h3>
                <p className={`text-[11px] ${
                  adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  Traçabilité complète des événements de sécurité et de logistique.
                </p>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                adminTheme === 'light'
                  ? 'text-slate-600 bg-slate-50 border-slate-200 shadow-sm'
                  : 'text-slate-400 bg-slate-950 border-slate-900'
              }`}>
                {auditLogs.length} logs enregistrés
              </span>
            </div>

            <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {auditLogs.map((log) => {
                let badgeColor = 'bg-blue-500 ring-blue-500/20';
                const actionLower = (log.action || '').toLowerCase();
                if (actionLower.includes('créer') || actionLower.includes('ajout') || actionLower.includes('save') || actionLower.includes('enregistrer')) {
                  badgeColor = 'bg-emerald-500 ring-emerald-500/20';
                } else if (actionLower.includes('suppr') || actionLower.includes('cancel') || actionLower.includes('supprimé') || actionLower.includes('annulation')) {
                  badgeColor = 'bg-rose-500 ring-rose-500/20';
                } else if (actionLower.includes('connex') || actionLower.includes('authentif')) {
                  badgeColor = 'bg-amber-500 ring-amber-500/20';
                }

                return (
                  <div key={log.id} className="relative flex flex-col md:flex-row md:justify-between md:items-start gap-2 group">
                    {/* Timeline node dot */}
                    <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ${badgeColor} transition duration-300 group-hover:scale-125`} />
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold block uppercase tracking-wider text-[10px] ${
                          adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                        }`}>
                          {log.action}
                        </span>
                        <span className={`shrink-0 font-mono text-[9px] ${
                          adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {new Date(log.date).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className={`leading-relaxed font-light text-[11px] ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {log.details}
                      </p>
                    </div>
                  </div>
                );
              })}
              {auditLogs.length === 0 && (
                <p className={`text-xs italic text-center py-12 ${
                  adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Aucun log d&apos;activité disponible.
                </p>
              )}
            </div>
          </div>
        )}

        {/* H. WHATSAPP NOTIFICATION TEMPLATES */}
        {activeSettingsSubTab === 'notifications' && (
          <>
          <form 
            onSubmit={onSaveNotificationTemplates} 
            className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                : 'bg-slate-900/30 border-slate-900 shadow-xl'
            }`}
          >
            <div className={`border-b pb-3 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'
            }`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${
                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Modèles de Notifications WhatsApp
              </h3>
              <p className={`text-[11px] ${
                adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Personnalisez les messages pré-remplis envoyés à vos clients lors du changement de statut de commande ou pour la relance de panier.
              </p>
            </div>

            {/* WhatsApp Provider Credentials Section */}
            <div className={`p-5 rounded-2xl border space-y-4 transition ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200/85' : 'bg-slate-950/20 border-slate-900 shadow-sm'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${
                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Configuration de l&apos;API WhatsApp
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className={`text-[10px] font-semibold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Fournisseur d&apos;envoi</label>
                  <select 
                    name="whatsappProvider" 
                    defaultValue={settings.whatsappProvider || 'direct_link'} 
                    className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                        : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                    }`}
                  >
                    <option value="direct_link">Lien WhatsApp direct (wa.me - manuel gratuit)</option>
                    <option value="twilio">Twilio WhatsApp API (payant)</option>
                    <option value="cloud_api">Meta WhatsApp Cloud API (officiel payant)</option>
                  </select>
                </div>

                {/* Twilio configurations */}
                <div className="space-y-4 md:col-span-2 border-t pt-4 border-slate-800/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Identifiants Twilio (Si Twilio sélectionné)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Account SID</label>
                      <input 
                        type="text" 
                        name="twilioAccountSid" 
                        defaultValue={settings.twilioAccountSid} 
                        placeholder="AC..."
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Auth Token</label>
                      <input 
                        type="password" 
                        name="twilioAuthToken" 
                        defaultValue={settings.twilioAuthToken} 
                        placeholder="Token"
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Numéro Twilio (whatsapp:+...)</label>
                      <input 
                        type="text" 
                        name="twilioFromNumber" 
                        defaultValue={settings.twilioFromNumber} 
                        placeholder="+14155238886"
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Cloud API configurations */}
                <div className="space-y-4 md:col-span-2 border-t pt-4 border-slate-800/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Identifiants WhatsApp Cloud API (Si Cloud API sélectionné)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Phone Number ID</label>
                      <input 
                        type="text" 
                        name="whatsappCloudPhoneNumberId" 
                        defaultValue={settings.whatsappCloudPhoneNumberId} 
                        placeholder="Ex: 1065478..."
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Access Token</label>
                      <input 
                        type="password" 
                        name="whatsappCloudAccessToken" 
                        defaultValue={settings.whatsappCloudAccessToken} 
                        placeholder="EAAG..."
                        className={`w-full text-xs transition outline-none rounded-xl px-3 py-2 border font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 transition ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200/85' : 'bg-slate-950/40 border-slate-900'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                Variables disponibles (Jetons) :
              </span>
              <div className={`flex flex-wrap gap-2 text-[10px] font-mono ${
                adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {[
                  { token: '{customer_name}', desc: 'Nom du client' },
                  { token: '{order_id}', desc: 'ID de la commande' },
                  { token: '{tracking_link}', desc: 'Lien/Numéro de suivi' },
                  { token: '{cart_items}', desc: 'Articles du panier (Relance)' },
                  { token: '{cart_total}', desc: 'Total du panier (Relance)' },
                  { token: '{discount_code}', desc: 'Code promo (Relance)' }
                ].map((tk, index) => (
                  <span 
                    key={index} 
                    className={`px-2.5 py-1 rounded-xl border transition ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {tk.token} : {tk.desc}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Statut: En attente confirmation (Pending) */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider border-b pb-1 flex items-center gap-1.5 font-mono ${
                  adminTheme === 'light' ? 'text-slate-700 border-slate-100' : 'text-slate-400 border-slate-900'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  1. Commande reçue (En attente confirmation)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Français</label>
                    <textarea
                      value={notifTemplates.pendingFr !== undefined ? notifTemplates.pendingFr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, pendingFr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider text-right block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Arabe</label>
                    <textarea
                      value={notifTemplates.pendingAr !== undefined ? notifTemplates.pendingAr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, pendingAr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none text-right font-sans border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Statut: Expédié (Shipped) */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider border-b pb-1 flex items-center gap-1.5 font-mono ${
                  adminTheme === 'light' ? 'text-slate-700 border-slate-100' : 'text-slate-400 border-slate-900'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  2. Commande Expédiée
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Français</label>
                    <textarea
                      value={notifTemplates.shippedFr !== undefined ? notifTemplates.shippedFr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, shippedFr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider text-right block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Arabe</label>
                    <textarea
                      value={notifTemplates.shippedAr !== undefined ? notifTemplates.shippedAr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, shippedAr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none text-right font-sans border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Statut: Livré (Delivered) */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider border-b pb-1 flex items-center gap-1.5 font-mono ${
                  adminTheme === 'light' ? 'text-slate-700 border-slate-100' : 'text-slate-400 border-slate-900'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  3. Commande Livrée
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Français</label>
                    <textarea
                      value={notifTemplates.deliveredFr !== undefined ? notifTemplates.deliveredFr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, deliveredFr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider text-right block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Arabe</label>
                    <textarea
                      value={notifTemplates.deliveredAr !== undefined ? notifTemplates.deliveredAr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, deliveredAr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none text-right font-sans border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Relance Panier Abandonné */}
              <div className="space-y-3">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider border-b pb-1 flex items-center gap-1.5 font-mono ${
                  adminTheme === 'light' ? 'text-slate-700 border-slate-100' : 'text-slate-400 border-slate-900'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  4. Relance Panier Abandonné
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Français</label>
                    <textarea
                      value={notifTemplates.recoveryFr !== undefined ? notifTemplates.recoveryFr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, recoveryFr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[9px] font-semibold uppercase tracking-wider text-right block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>Message Arabe</label>
                    <textarea
                      value={notifTemplates.recoveryAr !== undefined ? notifTemplates.recoveryAr : ''}
                      onChange={(e) => setNotifTemplates(prev => ({ ...prev, recoveryAr: e.target.value }))}
                      rows={3}
                      className={`w-full transition rounded-xl p-3 text-xs outline-none text-right font-sans border ${
                        adminTheme === 'light'
                          ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-slate-950 border-slate-900 focus:border-emerald-500/50 text-slate-200'
                      }`}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t flex justify-end ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'
            }`}>
              <button
                type="submit"
                disabled={isSavingNotifTemplates}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSavingNotifTemplates ? 'Enregistrement...' : 'Enregistrer les modèles'}
              </button>
            </div>
          </form>

          {/* WHATSAPP AUTOMATION SCHEDULER & QUEUE */}
          <div className={`mt-6 border rounded-3xl p-6 space-y-6 transition duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-sm text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                Automations de Relance WhatsApp
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Planifiez des messages automatisés envoyés avec un délai prédéfini pour récupérer les ventes ou fidéliser vos clients.
              </p>
            </div>

            {/* Rules Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(settings.whatsappFollowUpRules || []).map((rule, idx) => {
                const labelMap: Record<string, string> = {
                  abandoned_cart: 'Relance Panier Abandonné',
                  order_shipped: 'Suivi Expédition Colis',
                  order_delivered: 'Demande d\'Avis après Livraison'
                };
                return (
                  <div key={idx} className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/20 border-slate-900'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {labelMap[rule.trigger] || rule.trigger}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => {
                            const updated = [...(settings.whatsappFollowUpRules || [])];
                            updated[idx] = { ...rule, enabled: e.target.checked };
                            saveSettings({ ...settings, whatsappFollowUpRules: updated });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Délai :</span>
                      <input
                        type="number"
                        value={rule.delayHours}
                        onChange={(e) => {
                          const updated = [...(settings.whatsappFollowUpRules || [])];
                          updated[idx] = { ...rule, delayHours: Number(e.target.value) };
                          saveSettings({ ...settings, whatsappFollowUpRules: updated });
                        }}
                        className={`w-16 border rounded-lg px-2 py-1 text-center font-mono text-xs outline-none ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                        }`}
                      />
                      <span className="text-[10px] text-slate-500">heures</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scheduled Timeline Queue */}
            <div className="space-y-3 pt-3 border-t border-slate-800/10">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  File d&apos;attente des Relances Planifiées (Simulation)
                </h4>
                <span className="text-[9px] font-mono text-slate-500">
                  {automationQueue.length} notification(s) en attente
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${adminTheme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-500'} text-[10px] uppercase font-bold`}>
                      <th className="py-2 px-3">Client</th>
                      <th className="py-2 px-3">Type Relance</th>
                      <th className="py-2 px-3">Planifié Pour</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-900'}`}>
                    {automationQueue.map((item) => {
                      const badgeColors: Record<string, string> = {
                        abandoned_cart: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        order_shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        order_delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      };
                      const triggerLabel: Record<string, string> = {
                        abandoned_cart: 'Panier Abandonné',
                        order_shipped: 'Suivi Expédition',
                        order_delivered: 'Avis Client'
                      };
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/10 transition">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold">{item.clientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.phone}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                              badgeColors[item.type] || 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {triggerLabel[item.type] || item.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                            {item.scheduledAt}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setAutomationQueue(prev => prev.filter(q => q.id !== item.id));
                                alert("Notification WhatsApp expédiée immédiatement via l'API !");
                              }}
                              className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md text-[9px] font-bold uppercase transition cursor-pointer"
                            >
                              Forcer l&apos;envoi
                            </button>
                            <button
                              onClick={() => {
                                setAutomationQueue(prev => prev.filter(q => q.id !== item.id));
                              }}
                              className="px-2 py-1 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-md text-[9px] font-bold uppercase transition cursor-pointer"
                            >
                              Annuler
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {automationQueue.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-500 text-[10px]">
                          Aucune relance planifiée en attente dans la file d&apos;attente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Live Delivery logs console */}
          <div className={`mt-6 border rounded-3xl p-6 transition duration-200 ${
            adminTheme === 'light'
              ? 'bg-slate-50/50 border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] text-slate-800'
              : 'bg-slate-950 border-slate-900 shadow-xl text-slate-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  Journal des Notifications en Direct
                </h4>
                <p className="text-[10px] text-slate-500 font-light">
                  Suivi des envois automatiques WhatsApp de la boutique.
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className={`font-mono text-[10px] p-4 rounded-2xl border space-y-2.5 max-h-[220px] overflow-y-auto ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-600'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              {[
                { time: 'Il y a 2 min', type: 'Panier Abandonné', num: '+212 661-XXXXXX', status: 'Envoyé', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { time: 'Il y a 15 min', type: 'Commande Confirmée', num: '+212 672-XXXXXX', status: 'Lu', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { time: 'Il y a 1h', type: 'Commande Expédiée', num: '+212 613-XXXXXX', status: 'Lu', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { time: 'Il y a 3h', type: 'Commande Créée', num: '+212 660-XXXXXX', status: 'Délivré', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { time: 'Il y a 5h', type: 'Panier Abandonné', num: '+212 654-XXXXXX', status: 'Echec', color: 'text-rose-600 bg-rose-50 border-rose-100' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                      item.color
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-semibold">{item.type}</span>
                    <span className="text-slate-400">({item.num})</span>
                  </div>
                  <span className="text-[9px] text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
          </>
        )}

        {/* I. OPERATORS MANAGEMENT */}
        {activeSettingsSubTab === 'operators' && currentUser?.role === 'owner' && (
          <div className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className={`border-b pb-3 flex justify-between items-center ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Gestion des Comptes Opérateurs
                </h3>
                <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Créer et gérer les accès pour les rôles Owner, Logistician et Support.
                </p>
              </div>
              <button
                onClick={() => setIsAddingOperator(!isAddingOperator)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 transition"
              >
                {isAddingOperator ? 'Fermer' : 'Ajouter un Opérateur'}
              </button>
            </div>

            {isAddingOperator && (
              <form onSubmit={onCreateOperatorSubmit} className={`p-4 rounded-2xl border space-y-4 ${
                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-900'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nom complet</label>
                    <input type="text" name="name" required placeholder="Ex: Youssef Mahir" className="w-full text-xs bg-slate-950 border border-slate-900 text-slate-200 rounded-xl px-3 py-2" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nom d&apos;utilisateur</label>
                    <input type="text" name="username" required placeholder="Ex: logistics2" className="w-full text-xs bg-slate-950 border border-slate-900 text-slate-200 rounded-xl px-3 py-2 font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Mot de passe</label>
                    <input type="password" name="password" required placeholder="••••••••" className="w-full text-xs bg-slate-950 border border-slate-900 text-slate-200 rounded-xl px-3 py-2" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Rôle</label>
                    <select name="role" required className="w-full text-xs bg-slate-950 border border-slate-900 text-slate-200 rounded-xl px-3 py-2">
                      <option value="logistician">Logistician (Expéditions & Commandes)</option>
                      <option value="support">Support (CRM & Avis)</option>
                      <option value="owner">Owner (Contrôle total)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400">
                    Créer le compte
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-slate-800/60 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-900 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3">Nom</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Date de création</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {operatorsList.map((op: any) => (
                    <tr key={op.id} className="hover:bg-slate-900/10">
                      <td className="p-3 font-semibold">{op.name}</td>
                      <td className="p-3 font-mono text-[11px]">{op.username}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${
                          op.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          op.role === 'logistician' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {op.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(op.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${op.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${op.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                          {op.isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {op.username !== 'admin' && (
                          <button
                            onClick={() => handleToggleOperatorStatus(op.id, op.isActive)}
                            className={`px-3 py-1.5 rounded-xl border text-[9px] font-extrabold uppercase tracking-wider transition ${
                              op.isActive
                                ? 'text-rose-400 border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/20'
                                : 'text-emerald-400 border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-900/20'
                            }`}
                          >
                            {op.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* J. SECURITY & 2FA */}
        {activeSettingsSubTab === 'security' && (
          <div className={`space-y-6`}>
            {/* MFA Section */}
            <div className={`border rounded-3xl p-6 space-y-5 transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                : 'bg-slate-900/30 border-slate-900 shadow-xl'
            }`}>
              <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Double Authentification (MFA / 2FA)
                </h3>
                <p className={`text-[11px] mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Sécurisez votre compte avec une application comme Google Authenticator ou Authy.
                </p>
              </div>

              {/* MFA status badge */}
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                isMfaEnabled
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}>
                <div className="flex items-center gap-3">
                  {isMfaEnabled ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-bold ${isMfaEnabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isMfaEnabled ? 'MFA Activé — Votre compte est sécurisé' : 'MFA Désactivé — Recommandé pour les comptes Admin'}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isMfaEnabled ? 'Une application d\'authentification est requise à chaque connexion.' : 'Activez le MFA pour protéger votre compte contre les intrusions.'}
                    </p>
                  </div>
                </div>
                {isMfaEnabled ? (
                  <button
                    onClick={async () => {
                      setMfaError(''); setMfaSuccess('');
                      const res = await fetch('/api/admin/auth/mfa/disable', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                      });
                      const data = await res.json();
                      if (data.success) { setIsMfaEnabled(false); setMfaSuccess('MFA désactivé avec succès.'); }
                      else { setMfaError(data.error || 'Erreur lors de la désactivation.'); }
                    }}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border border-rose-900/40 text-rose-400 rounded-xl hover:bg-rose-900/20 transition shrink-0"
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setMfaError(''); setMfaSuccess(''); setIsMfaSetupOpen(true);
                      const res = await fetch('/api/admin/auth/mfa/setup');
                      const data = await res.json();
                      if (data.success) { setMfaSecret(data.secret); setMfaQrCode(data.qrCodeUrl); }
                      else { setMfaError(data.error || 'Erreur lors de la génération.'); setIsMfaSetupOpen(false); }
                    }}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl hover:opacity-90 transition shrink-0"
                  >
                    Activer le MFA
                  </button>
                )}
              </div>

              {/* MFA setup flow */}
              {isMfaSetupOpen && !isMfaEnabled && (
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <p className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    1. Scannez ce QR Code avec Google Authenticator ou Authy.
                  </p>
                  {mfaQrCode && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mfaQrCode} alt="QR Code MFA" className="w-48 h-48 rounded-xl border border-slate-300" />
                    </div>
                  )}
                  {mfaSecret && (
                    <div className={`p-3 rounded-xl border font-mono text-center text-sm tracking-widest ${adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                      {mfaSecret}
                    </div>
                  )}
                  <p className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    2. Entrez le code à 6 chiffres généré par votre application pour confirmer.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className={`flex-grow font-mono text-center text-lg tracking-widest border rounded-xl px-3 py-2 text-sm transition outline-none ${adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-emerald-500'}`}
                    />
                    <button
                      disabled={mfaCode.length !== 6}
                      onClick={async () => {
                        setMfaError(''); setMfaSuccess('');
                        const res = await fetch('/api/admin/auth/mfa/enable', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ secret: mfaSecret, code: mfaCode })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setIsMfaEnabled(true); setIsMfaSetupOpen(false); setMfaCode('');
                          setMfaSuccess('MFA activé avec succès. Votre compte est maintenant protégé.');
                        } else { setMfaError(data.error || 'Code incorrect. Réessayez.'); }
                      }}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      Confirmer
                    </button>
                  </div>
                  {mfaError && <p className="text-xs text-rose-400 font-semibold">{mfaError}</p>}
                </div>
              )}

              {mfaSuccess && <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {mfaSuccess}</p>}
              {mfaError && !isMfaSetupOpen && <p className="text-xs text-rose-400 font-semibold">{mfaError}</p>}
            </div>

            {/* Password Change Section */}
            <div className={`border rounded-3xl p-6 space-y-5 transition-all duration-200 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                : 'bg-slate-900/30 border-slate-900 shadow-xl'
            }`}>
              <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Modifier Mon Mot de Passe
                </h3>
                <p className={`text-[11px] mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Changez votre mot de passe de connexion personnel.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Ancien Mot de Passe', val: oldPassword, setter: setOldPassword, type: 'password' },
                  { label: 'Nouveau Mot de Passe', val: newPassword, setter: setNewPassword, type: 'password' },
                  { label: 'Confirmer Nouveau', val: confirmPassword, setter: setConfirmPassword, type: 'password' },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{f.label}</label>
                    <input
                      type={f.type}
                      value={f.val}
                      onChange={(e) => f.setter(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs border rounded-xl px-3 py-2 transition outline-none ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-400' : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500'}`}
                    />
                  </div>
                ))}
              </div>
              {passwordError && <p className="text-xs text-rose-400 font-semibold">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-emerald-400 font-semibold"><ShieldCheck className="inline w-3.5 h-3.5 mr-1" />{passwordSuccess}</p>}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    setPasswordError(''); setPasswordSuccess('');
                    if (!oldPassword || !newPassword || !confirmPassword) { setPasswordError('Tous les champs sont requis.'); return; }
                    if (newPassword !== confirmPassword) { setPasswordError('Les nouveaux mots de passe ne correspondent pas.'); return; }
                    if (newPassword.length < 8) { setPasswordError('Le nouveau mot de passe doit comporter au moins 8 caractères.'); return; }
                    const res = await fetch('/api/admin/auth/password/change', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ oldPassword, newPassword })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setPasswordSuccess('Mot de passe modifié avec succès.');
                      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                    } else { setPasswordError(data.error || 'Erreur lors de la modification.'); }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition"
                >
                  Modifier le Mot de Passe
                </button>
              </div>
            </div>

            {/* Owner-only: Reset operator MFA/password */}
            {currentUser?.role === 'owner' && (
              <div className={`border rounded-3xl p-6 space-y-5 transition-all duration-200 ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-slate-800'
                  : 'bg-slate-900/30 border-slate-900 shadow-xl'
              }`}>
                <div className={`border-b pb-3 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                    Gestion de la Sécurité des Opérateurs
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                    En tant que propriétaire, vous pouvez réinitialiser le mot de passe ou désactiver le MFA d&apos;un opérateur.
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-800/60 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-900 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-3">Opérateur</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Actions de Sécurité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {operatorsList.filter((op: any) => op.username !== currentUser?.username).map((op: any) => (
                        <tr key={op.id} className="hover:bg-slate-900/10">
                          <td className="p-3 font-semibold">{op.name} <span className="font-mono text-slate-500 text-[10px]">({op.username})</span></td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${
                              op.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              op.role === 'logistician' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {op.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setResettingOperatorId(op.id);
                                  setResettingOperatorName(op.name);
                                  setOwnerResetPasswordVal('');
                                  setOwnerResetError('');
                                  setOwnerResetSuccess('');
                                }}
                                className="px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded-xl transition flex items-center gap-1"
                              >
                                <Key className="w-3 h-3" /> Réinitialiser MDP
                              </button>
                              <button
                                onClick={async () => {
                                  setOwnerResetError(''); setOwnerResetSuccess('');
                                  const res = await fetch('/api/admin/auth/mfa/disable', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: op.id })
                                  });
                                  const data = await res.json();
                                  if (data.success) setOwnerResetSuccess(`MFA désactivé pour ${op.name}.`);
                                  else setOwnerResetError(data.error || 'Erreur.');
                                }}
                                className="px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider border border-amber-900/40 text-amber-400 hover:bg-amber-900/20 rounded-xl transition flex items-center gap-1"
                              >
                                <ShieldAlert className="w-3 h-3" /> Désactiver MFA
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Password reset modal inline */}
                {resettingOperatorId && (
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <p className={`text-xs font-bold ${adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Réinitialiser le mot de passe de <span className="text-emerald-400">{resettingOperatorName}</span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe..."
                        value={ownerResetPasswordVal}
                        onChange={(e) => setOwnerResetPasswordVal(e.target.value)}
                        className={`flex-grow text-xs border rounded-xl px-3 py-2 transition outline-none ${adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-200 focus:border-emerald-500'}`}
                      />
                      <button
                        disabled={ownerResetPasswordVal.length < 6}
                        onClick={async () => {
                          setOwnerResetError(''); setOwnerResetSuccess('');
                          const res = await fetch('/api/admin/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'reset-password', userId: resettingOperatorId, password: ownerResetPasswordVal })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setOwnerResetSuccess(`Mot de passe de ${resettingOperatorName} réinitialisé.`);
                            setResettingOperatorId(null); setOwnerResetPasswordVal('');
                          } else { setOwnerResetError(data.error || 'Erreur.'); }
                        }}
                        className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => { setResettingOperatorId(null); setOwnerResetPasswordVal(''); }}
                        className="px-3 py-2 border border-slate-700 text-slate-400 text-xs rounded-xl hover:bg-slate-800 transition shrink-0"
                      >
                        Annuler
                      </button>
                    </div>
                    {ownerResetError && <p className="text-xs text-rose-400 font-semibold">{ownerResetError}</p>}
                  </div>
                )}

                {ownerResetSuccess && <p className="text-xs text-emerald-400 font-semibold"><ShieldCheck className="inline w-3.5 h-3.5 mr-1" />{ownerResetSuccess}</p>}
                {ownerResetError && !resettingOperatorId && <p className="text-xs text-rose-400 font-semibold">{ownerResetError}</p>}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
