'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useLoyalty, LoyaltyTier } from '@/context/LoyaltyContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';
import { 
  Search, ShoppingBag, ArrowLeft, ArrowRight, Clock, MapPin, 
  Award, Coins, Ticket, Copy, Calendar, Plus,
  Smile, Meh, Frown, Sparkles, Camera, X,
  Image as ImageIcon, Heart, Trash2, Sun, Moon, ShieldCheck,
  User, Settings, FileText, Printer, Truck, MessageCircle,
  ExternalLink, Activity, RefreshCw, ChevronRight, Zap, Gift,
  Percent, Compass, Droplet, Star, CheckCircle2, AlertCircle,
  Box, CreditCard, ChevronDown, SlidersHorizontal, Edit3, Save, Layers, KeyRound
} from 'lucide-react';
import { Product, PRODUCTS_DB } from '@/lib/data';
import { useUi } from '@/context/UiContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { CustomerAuthPortal } from '@/components/CustomerAuthPortal';
import { ShopShell } from '@/components/ShopShell';
import { PoButton } from '@/components/ui/PoButton';
import { CustomerMetricCard, CustomerPanelCard, CustomerSectionHeader, CustomerStatusBadge } from '@/components/customer/CustomerPanelUi';
import { getCustomerAccessToken, getLocallyTrackedOrderClaims } from '@/lib/customer-session';
import { customerStatusLabel, skinTypeLabel } from '@/lib/customer-presenters';

interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

type CustomerProductImage = Pick<OrderItem, 'title' | 'image'> & { id?: number };

const CUSTOMER_PRODUCT_IMAGE_FALLBACK = '/images/categories/visage.webp';

function resolveCustomerProductImage(item: CustomerProductImage): string {
  const image = item.image?.trim();
  if (image) {
    // Product packshots were migrated to WebP. Preserve external image URLs while
    // keeping older order snapshots pointing at their current local asset.
    if (image.startsWith('/images/')) return image.replace(/\.png$/i, '.webp');
    return image;
  }

  const matchingProduct = PRODUCTS_DB.find((product) =>
    product.id === item.id || product.title.toLowerCase() === item.title?.toLowerCase()
  );

  return matchingProduct?.image || CUSTOMER_PRODUCT_IMAGE_FALLBACK;
}

function applyCustomerImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = CUSTOMER_PRODUCT_IMAGE_FALLBACK;
}

interface Order {
  order_id: string;
  customer_name?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  applied_coupon: string | null;
  gift_item: string | null;
  total: number;
  status: string;
  carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  date?: string;
  created_at?: string;
}

interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
}

type CustomerOrdersState = 'idle' | 'loading' | 'ready' | 'error';

const DIAGNOSTIC_ROUTINE_RECOMMENDATIONS = {
  routineAm: [
    { title: 'Gel Nettoyant Doux Purifiant', brand: 'La Roche-Posay', image: '/images/effaclar_hero_packshot.webp', price: 210 },
    { title: 'Sérum Éclat Vitamine C Pure', brand: 'Vichy', image: '/images/hero_serum_dropper.webp', price: 340 },
    { title: 'Fluide Solaire Invisible SPF50+', brand: 'La Roche-Posay', image: '/images/anthelios_hero_packshot.webp', price: 250 }
  ],
  routinePm: [
    { title: 'Huile Démaquillante Solide', brand: 'CeraVe', image: '/images/categories/visage.webp', price: 190 },
    { title: 'Sérum Concentré Niacinamide 10%', brand: 'La Roche-Posay', image: '/images/hero_serum_dropper.webp', price: 320 },
    { title: 'Baume Réparateur Intense Cicaplast B5+', brand: 'La Roche-Posay', image: '/images/cicaplast_hero_packshot.webp', price: 220 }
  ]
};

export default function CustomerDashboard() {
  const { language } = useTranslation();
  const { settings } = useSettings();
  const isRTL = language === 'AR';

  // The customer portal has one canonical visual theme. Saving this choice in
  // localStorage made the same signed-in customer see a different palette in
  // Safari, Chrome, or a fresh browser profile.
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      localStorage.removeItem('customer_portal_theme');
    } catch (e) {}
  }, []);

  const toggleThemeMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  // Loyalty states
  const {
    points,
    totalEarned,
    tier,
    pointsHistory,
    redeemReward,
    tierMultiplier,
    pointsToNextTier,
    clientUser,
    isLoadingAuth,
    loginClient,
    signUpClient,
    requestPasswordReset,
    updateClientPassword,
    updateClientProfile,
    logoutClient,
  } = useLoyalty();
  const { showToast, setDiagnosticOpen, diagnostic } = useUi();

  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Customer portal sections
  type TabType = 'overview' | 'commandes' | 'diagnostic' | 'cagnotte' | 'favoris' | 'profil';
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const selectCustomerTab = useCallback((tab: TabType, mode: 'push' | 'replace' = 'push') => {
    setActiveTab(tab);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (tab === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    window.history[mode === 'replace' ? 'replaceState' : 'pushState']({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      if (tabParam === 'favoris') selectCustomerTab('favoris', 'replace');
      else if (tabParam === 'commandes' || tabParam === 'suivi') selectCustomerTab('commandes', 'replace');
      else if (tabParam === 'diagnostic') selectCustomerTab('diagnostic', 'replace');
      else if (tabParam === 'cagnotte' || tabParam === 'club') selectCustomerTab('cagnotte', 'replace');
      else if (tabParam === 'profil') selectCustomerTab('profil', 'replace');
      else if (tabParam === 'overview' || tabParam === 'vue') selectCustomerTab('overview', 'replace');
    }
    const handlePopState = () => {
      const tab = new URLSearchParams(window.location.search).get('tab') as TabType | null;
      setActiveTab(tab && ['commandes', 'diagnostic', 'cagnotte', 'favoris', 'profil'].includes(tab) ? tab : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectCustomerTab]);

  const tabsRef = useRef<HTMLDivElement>(null);

  // Auth form states
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const authSubmissionInFlight = useRef(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirmation, setRecoveryConfirmation] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setRecoveryMode(new URLSearchParams(window.location.search).get('recovery') === '1');
  }, []);

  const closeRecovery = () => {
    setRecoveryMode(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('recovery');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const handleRecoverySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecoveryError(null);
    if (recoveryPassword !== recoveryConfirmation) {
      setRecoveryError(isRTL ? 'كلمتا المرور غير متطابقتين.' : 'Les mots de passe ne correspondent pas.');
      return;
    }
    setRecoveryLoading(true);
    const result = await updateClientPassword(recoveryPassword);
    setRecoveryLoading(false);
    if (!result.success) {
      setRecoveryError(result.error || (isRTL ? 'تعذر تحديث كلمة المرور.' : 'Impossible de modifier le mot de passe.'));
      return;
    }
    setRecoverySuccess(true);
    setRecoveryPassword('');
    setRecoveryConfirmation('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmissionInFlight.current) return;
    authSubmissionInFlight.current = true;
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const res = await loginClient(authEmail, authPassword);
      if (!res.success) setAuthError(res.error || 'Erreur de connexion.');
    } finally {
      authSubmissionInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmissionInFlight.current) return;
    authSubmissionInFlight.current = true;
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      const res = await signUpClient(authEmail, authPassword, authName, authPhone);
      if (!res.success) {
        setAuthError(res.error || 'Erreur de création de compte.');
        return;
      }

      if (res.emailConfirmationRequired) {
        setAuthPassword('');
        setAuthNotice(isRTL
          ? 'تم إنشاء حسابك وإرسال رسالة تأكيد إلى بريدك الإلكتروني. افتحي الرسالة واضغطي على الرابط، ثم سجّلي الدخول.'
          : 'Votre compte a été créé. Un email de confirmation vient de vous être envoyé : ouvrez-le, cliquez sur le lien, puis connectez-vous.');
        setAuthView('login');
      }
    } finally {
      authSubmissionInFlight.current = false;
      setAuthLoading(false);
    }
  };

  // Orders State & Search
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersState, setOrdersState] = useState<CustomerOrdersState>('idle');
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<'all' | 'in_transit' | 'delivered'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const ordersRequestRef = useRef(0);

  const loadCustomerOrders = async () => {
    if (!clientUser) return;
    const requestId = ordersRequestRef.current + 1;
    ordersRequestRef.current = requestId;
    const cacheKey = `paraonline:customer-orders:${clientUser.id}`;
    let hasCachedOrders = false;

    try {
      const cachedOrders = window.sessionStorage.getItem(cacheKey);
      if (cachedOrders) {
        const parsedOrders = JSON.parse(cachedOrders);
        if (Array.isArray(parsedOrders)) {
          hasCachedOrders = true;
          setOrders(parsedOrders);
          setOrdersState('ready');
        }
      }
    } catch {
      // Storage is an optional speed-up only; a fresh database read still works.
    }

    if (!hasCachedOrders) setOrdersState('loading');
    setOrdersError(null);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const accessToken = await getCustomerAccessToken();
      if (!accessToken) throw new Error('Votre session a expiré. Connectez-vous de nouveau.');

      // Orders placed earlier in this browser have a signed tracking proof.
      // Claim them into the authenticated account before loading its history.
      const claims = getLocallyTrackedOrderClaims(window.sessionStorage, window.localStorage);
      if (claims.length > 0) {
        const claimResponse = await fetch('/api/customer/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ claims }),
          cache: 'no-store',
          signal: controller.signal,
        });
        if (claimResponse.status === 401) throw new Error('Votre session a expiré. Connectez-vous de nouveau.');
      }

      const response = await fetch('/api/customer/orders', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Impossible de charger vos commandes.');
      if (ordersRequestRef.current !== requestId) return;

      const nextOrders = Array.isArray(result.orders) ? result.orders as Order[] : [];
      setOrders(nextOrders);
      setOrdersState('ready');
      // A locally tracked order may have just been linked to this account.
      // Refresh the address book so its delivery address appears immediately.
      void loadSavedAddresses();
      try {
        window.sessionStorage.setItem(cacheKey, JSON.stringify(nextOrders));
      } catch {
        // A blocked or full session store should never prevent showing orders.
      }
    } catch (error) {
      if (ordersRequestRef.current !== requestId) return;
      if (!hasCachedOrders) {
        setOrders([]);
        setOrdersState('error');
        setOrdersError(error instanceof DOMException && error.name === 'AbortError'
          ? 'Le chargement de vos commandes a pris trop de temps.'
          : error instanceof Error ? error.message : 'Impossible de charger vos commandes.');
      }
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    void loadCustomerOrders();
    return () => { ordersRequestRef.current += 1; };
  // The identity is the stable dependency; the loader intentionally uses current session state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUser?.id]);

  const copyCouponToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(isRTL ? `تم نسخ الكود: ${code}` : `Code promo ${code} copié !`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const findCatalogProduct = (item: Pick<OrderItem, 'id' | 'title'>) => PRODUCTS_DB.find((product) => {
    const title = item.title?.trim().toLocaleLowerCase();
    const productTitle = product.title.toLocaleLowerCase();
    return product.id === item.id || Boolean(title && (productTitle.includes(title) || title.includes(productTitle)));
  });

  // Reorder only products that still exist in the live catalog. This avoids
  // placing legacy or discontinued item snapshots in a customer's basket.
  const handleReorder = (order: Order) => {
    let unavailableCount = 0;
    order.items.forEach((item) => {
      const foundInDb = findCatalogProduct(item);
      if (foundInDb) {
        addToCart(foundInDb, item.quantity);
      } else {
        unavailableCount += 1;
      }
    });
    if (unavailableCount === order.items.length) {
      showToast(isRTL ? 'هذه المنتجات لم تعد متاحة.' : 'Ces produits ne sont plus disponibles dans le catalogue.', 'warning');
      return;
    }
    showToast(unavailableCount
      ? (isRTL ? 'تمت إضافة المنتجات المتاحة فقط إلى السلة.' : 'Les produits encore disponibles ont été ajoutés au panier.')
      : (isRTL ? 'تمت إضافة جميع منتجات الطلبية إلى السلة!' : 'Tous les soins de la commande ont été ajoutés à votre panier!'));
  };

  const addRoutineProductToCart = (item: { title: string }) => {
    const product = findCatalogProduct({ id: 0, title: item.title });
    if (!product) {
      showToast(isRTL ? 'هذا المنتج غير متاح حاليًا.' : 'Ce produit n’est plus disponible actuellement.', 'warning');
      return false;
    }
    addToCart(product, 1);
    return true;
  };

  // Add only live catalog products from the displayed routine.
  const handleAddFullRoutineToCart = () => {
    const routine = [...DIAGNOSTIC_ROUTINE_RECOMMENDATIONS.routineAm, ...DIAGNOSTIC_ROUTINE_RECOMMENDATIONS.routinePm];
    const addedCount = routine.filter(addRoutineProductToCart).length;
    if (addedCount) {
      showToast(addedCount === routine.length
        ? (isRTL ? 'تمت إضافة الروتين الكامل إلى السلة!' : 'La routine complète a été ajoutée à votre panier!')
        : (isRTL ? 'تمت إضافة المنتجات المتاحة إلى السلة.' : 'Les produits disponibles ont été ajoutés au panier.'));
    }
  };

  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = !orderSearchQuery || 
        o.order_id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.items.some((i) => i.title.toLowerCase().includes(orderSearchQuery.toLowerCase()));
      
      const matchesStatus = 
        orderFilterStatus === 'all' ? true :
        orderFilterStatus === 'in_transit' ? (o.status.toLowerCase().includes('transit') || o.status.toLowerCase().includes('shipped') || o.status.toLowerCase().includes('expédié')) :
        (o.status.toLowerCase().includes('deliver') || o.status.toLowerCase().includes('livré'));

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderFilterStatus]);

  // Profile & Address States
  const [profileName, setProfileName] = useState(clientUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(clientUser?.phone || '');
  const [profileEmail, setProfileEmail] = useState(clientUser?.email || '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Casablanca');
  const [newAddrStreet, setNewAddrStreet] = useState('');

  const persistAddresses = async (nextAddresses: UserAddress[]) => {
    if (!clientUser) return false;
    try {
      const accessToken = await getCustomerAccessToken();
      if (!accessToken) {
        showToast('Votre session a expiré. Connectez-vous de nouveau pour enregistrer cette adresse.', 'error');
        return false;
      }
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: nextAddresses }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Impossible d’enregistrer vos adresses.');
      setSavedAddresses(Array.isArray(result.addresses) ? result.addresses as UserAddress[] : nextAddresses);
      setAddressesError(null);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible d’enregistrer vos adresses.', 'error');
      return false;
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;
    const newAddr: UserAddress = {
      id: 'addr_' + Date.now(),
      label: newAddrLabel || 'Adresse Secondaire',
      fullName: profileName,
      phone: profilePhone,
      city: newAddrCity,
      address: newAddrStreet,
      isDefault: false
    };
    const saved = await persistAddresses([...savedAddresses, newAddr]);
    if (!saved) return;
    setShowAddAddressModal(false);
    setNewAddrLabel('');
    setNewAddrStreet('');
    showToast(isRTL ? 'تمت إضافة العنوان الجديد بنجاح' : 'Nouvelle adresse de livraison enregistrée !');
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const nextAddresses = savedAddresses.map((address) => ({ ...address, isDefault: address.id === addressId }));
    if (await persistAddresses(nextAddresses)) {
      showToast(isRTL ? 'تم تحديث عنوان التسليم الرئيسي.' : 'Adresse principale mise à jour.');
    }
  };

  useEffect(() => {
    if (!clientUser) return;
    setProfileName(clientUser.name || '');
    setProfilePhone(clientUser.phone || '');
    setProfileEmail(clientUser.email || '');
  }, [clientUser]);

  const loadSavedAddresses = async () => {
    if (!clientUser) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);
    setIsAddressesLoading(true);
    setAddressesError(null);

    try {
      const accessToken = await getCustomerAccessToken();
      if (!accessToken) throw new Error('Votre session a expiré. Connectez-vous de nouveau.');

      const response = await fetch('/api/customer/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Impossible de charger vos adresses.');
      setSavedAddresses(Array.isArray(result.addresses) ? result.addresses as UserAddress[] : []);
    } catch (error) {
      setSavedAddresses([]);
      setAddressesError(error instanceof DOMException && error.name === 'AbortError'
        ? 'Le chargement de vos adresses a pris trop de temps.'
        : error instanceof Error ? error.message : 'Impossible de charger vos adresses.');
    } finally {
      window.clearTimeout(timeoutId);
      setIsAddressesLoading(false);
    }
  };

  useEffect(() => {
    void loadSavedAddresses();
  // The stable account ID defines which secure profile is loaded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUser?.id]);

  useEffect(() => {
    if (!showAddAddressModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAddAddressModal(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showAddAddressModal]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    const result = await updateClientProfile({ name: profileName, phone: profilePhone });
    setIsProfileSaving(false);
    if (!result.success) {
      showToast(result.error || (isRTL ? 'تعذر تحديث الملف الشخصي.' : 'Impossible de mettre à jour votre profil.'));
      return;
    }
    if (profileEmail !== clientUser?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: profileEmail.trim() });
      if (emailError) {
        showToast(emailError.message || 'Les coordonnées ont été enregistrées, mais l’email n’a pas été modifié.', 'warning');
        return;
      }
      await supabase.from('customer_profiles').update({ email: profileEmail.trim(), updated_at: new Date().toISOString() }).eq('id', clientUser?.id || '');
      showToast('Vos coordonnées ont été enregistrées. Confirmez votre nouvel email depuis votre boîte de réception.');
      return;
    }
    showToast(isRTL ? 'تم تحديث معلومات الحساب بنجاح' : 'Vos informations personnelles ont été mises à jour.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'Utilisez au moins 8 caractères pour votre nouveau mot de passe.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setIsPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsPasswordSaving(false);
    if (error) {
      setPasswordFeedback({ type: 'error', message: error.message || 'Impossible de modifier votre mot de passe.' });
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({ type: 'success', message: 'Votre mot de passe a bien été mis à jour.' });
  };

  const handleDownloadPersonalData = () => {
    if (!clientUser) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        loyaltyTier: tier,
        loyaltyPoints: points,
      },
      deliveryAddresses: savedAddresses,
      orders,
      favorites: wishlist.map(({ id, title, price, image }) => ({ id, title, price, image })),
    };
    const file = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `para-officinal-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Votre fichier de données a été téléchargé.');
  };

  // Convert points to MAD value
  const walletMadValue = useMemo(() => {
    return Math.floor(points / 10);
  }, [points]);

  const latestOrder = orders[0];
  const activeOrderCount = orders.filter((order) => /transit|shipped|expédié|confirm/i.test(order.status)).length;
  const diagnosticDate = diagnostic ? new Intl.DateTimeFormat(language === 'AR' ? 'ar-MA' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()) : null;
  const activeCoupons = useMemo(() => {
    const now = new Date();
    return (settings.coupons || []).filter((coupon) => {
      if (!coupon.code || coupon.isActive === false) return false;
      const startsAt = coupon.startDate ? new Date(coupon.startDate) : null;
      const expiresAt = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
      return (!startsAt || Number.isNaN(startsAt.getTime()) || startsAt <= now)
        && (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt >= now);
    });
  }, [settings.coupons]);

  return (
    <ShopShell hideHeader hideFooter hideMobileNav>
      <div
        data-app-area={clientUser ? 'client' : undefined}
        className={`min-h-screen relative overflow-hidden transition-colors ${
          themeMode === 'dark' 
            ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950' 
            : 'bg-[#FAF9F6] text-slate-900 selection:bg-emerald-500 selection:text-white'
        } ${
          !clientUser ? 'flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10' : 'py-10 px-4 sm:px-6 lg:px-8'
        }`}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {/* Subtle Ambient Glow Background Orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/3 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[140px]" />

        {recoveryMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-recovery-title"
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl sm:p-8 ${
                themeMode === 'dark' ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-950'
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500">
                    <KeyRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="password-recovery-title" className="text-lg font-bold">
                      {isRTL ? 'اختيار كلمة مرور جديدة' : 'Choisir un nouveau mot de passe'}
                    </h2>
                    <p className={`mt-1 text-sm ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {isRTL ? 'استخدمي 8 أحرف على الأقل لحماية حسابك.' : 'Utilisez au moins 8 caractères pour sécuriser votre compte.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeRecovery}
                  aria-label={isRTL ? 'إغلاق' : 'Fermer'}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    themeMode === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {recoverySuccess ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600" role="status">
                    {isRTL ? 'تم تحديث كلمة المرور بنجاح.' : 'Votre mot de passe a été mis à jour.'}
                  </div>
                  <PoButton onClick={closeRecovery} variant="primary" size="lg" className="w-full">
                    {isRTL ? 'متابعة إلى حسابي' : 'Continuer vers mon compte'}
                  </PoButton>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleRecoverySubmit}>
                  <label className="block space-y-2 text-sm font-semibold">
                    <span>{isRTL ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</span>
                    <input
                      autoFocus
                      type="password"
                      value={recoveryPassword}
                      onChange={(event) => setRecoveryPassword(event.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      required
                      className={`h-12 w-full rounded-xl border px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                        themeMode === 'dark' ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-950'
                      }`}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold">
                    <span>{isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</span>
                    <input
                      type="password"
                      value={recoveryConfirmation}
                      onChange={(event) => setRecoveryConfirmation(event.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      required
                      className={`h-12 w-full rounded-xl border px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                        themeMode === 'dark' ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-950'
                      }`}
                    />
                  </label>
                  {recoveryError && (
                    <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm font-semibold text-rose-500" role="alert">
                      {recoveryError}
                    </div>
                  )}
                  <PoButton type="submit" variant="primary" size="lg" loading={recoveryLoading} className="w-full">
                    {isRTL ? 'حفظ كلمة المرور' : 'Enregistrer le mot de passe'}
                  </PoButton>
                </form>
              )}
            </section>
          </div>
        )}

        <div className={`w-full relative z-10 ${!clientUser ? 'max-w-6xl' : 'max-w-6xl mx-auto space-y-8'}`}>
          
          {/* ── NOT LOGGED IN: RENDERS AUTH PORTAL ── */}
          {!clientUser ? (
            <CustomerAuthPortal
              authView={authView}
              setAuthView={setAuthView}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authName={authName}
              setAuthName={setAuthName}
              authPhone={authPhone}
              setAuthPhone={setAuthPhone}
              authError={authError}
              authNotice={authNotice}
              authLoading={authLoading}
              handleLogin={handleLogin}
              handleSignup={handleSignup}
              handlePasswordReset={requestPasswordReset}
              themeMode={themeMode}
              onToggleTheme={toggleThemeMode}
            />
          ) : (
            /* ── LOGGED IN: FLAGSHIP SHOPIFY-PLUS DASHBOARD ── */
            <>
              {/* ──────────────── 1. ACCOUNT WORKSPACE HEADER ──────────────── */}
              <section className={`rounded-2xl border p-5 sm:p-6 transition-colors duration-200 ${
                themeMode === 'dark'
                  ? 'border-slate-800 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-slate-50/70 text-slate-900'
              }`}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
                      {(clientUser.name || clientUser.email || 'C').charAt(0).toUpperCase()}
                      <span className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} flex h-5 w-5 items-center justify-center rounded-full border-2 ${themeMode === 'dark' ? 'border-slate-900 bg-emerald-400 text-slate-950' : 'border-slate-50 bg-emerald-500 text-white'}`}>
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <div className="mb-1 flex flex-wrap items-center gap-2" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {isRTL ? 'مساحتي الشخصية' : 'Espace personnel'}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          themeMode === 'dark'
                            ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                            : 'border-amber-600/25 bg-amber-50 text-amber-800'
                        }`}>
                          <Award className="h-3 w-3" aria-hidden="true" />
                          {isRTL ? `${tier} عضو` : `Membre ${tier}`}
                        </span>
                      </div>
                      <h2 className={`truncate text-xl font-bold tracking-tight sm:text-2xl ${themeMode === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                        {clientUser.name?.trim() || clientUser.email.split('@')[0]}
                      </h2>
                      <div className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span className="truncate">{clientUser.email}</span>
                        <span aria-hidden="true" className="hidden sm:inline">•</span>
                        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${themeMode === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {isRTL ? 'حساب نشط وآمن' : 'Compte actif et sécurisé'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
                    <PoButton
                      onClick={() => setDiagnosticOpen(true)}
                      variant="primary"
                      size="md"
                      leftIcon={<Sparkles />}
                    >
                      {isRTL ? 'بدء تشخيص البشرة' : 'Diagnostic peau'}
                    </PoButton>

                    <PoButton
                      href="https://wa.me/212660808080"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      size="md"
                      leftIcon={<MessageCircle />}
                    >
                      {isRTL ? 'الدعم' : 'Support'}
                    </PoButton>

                    <PoButton
                      onClick={toggleThemeMode}
                      aria-label={themeMode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                      variant="neutral"
                      size="md"
                      iconOnly
                      leftIcon={themeMode === 'dark' ? <Sun /> : <Moon />}
                    />

                    <PoButton
                      onClick={logoutClient}
                      variant="dangerSoft"
                      size="md"
                    >
                      {isRTL ? 'خروج' : 'Déconnexion'}
                    </PoButton>
                  </div>
                </div>
              </section>


              {/* ──────────────── CUSTOMER PORTAL NAVIGATION ──────────────── */}
              <nav
                aria-label={isRTL ? 'أقسام حساب العميل' : 'Sections de votre espace client'}
                className={`w-full rounded-[1.35rem] border p-1.5 shadow-[0_16px_40px_-30px_oklch(0.22_0.03_180/0.45)] ${
                  themeMode === 'dark'
                    ? 'border-slate-800 bg-slate-900/95'
                    : 'border-[oklch(0.91_0.012_175)] bg-[oklch(0.985_0.006_175)]'
                }`}
              >
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div
                    ref={tabsRef}
                    role="tablist"
                    aria-orientation="horizontal"
                    className="grid min-w-max grid-flow-col auto-cols-[minmax(9.5rem,1fr)] gap-1 lg:min-w-0 lg:grid-flow-row lg:grid-cols-6 lg:auto-cols-auto"
                  >
                    {[
                      { id: 'overview', labelFr: 'Vue d\'ensemble', labelAr: 'ملخص الحساب', icon: LayoutGridIcon },
                      { id: 'commandes', labelFr: 'Mes commandes', labelAr: 'طلباتي والشحن', icon: Box },
                      { id: 'diagnostic', labelFr: 'Diagnostic IA', labelAr: 'تشخيص البشرة', icon: Sparkles },
                      { id: 'cagnotte', labelFr: 'Cagnotte & VIP', labelAr: 'المحفظة والكوبونات', icon: Ticket },
                      { id: 'favoris', labelFr: 'Mes favoris', labelAr: 'المفضلة', icon: Heart },
                      { id: 'profil', labelFr: 'Profil & adresses', labelAr: 'الملف والعناوين', icon: User }
                    ].map((tab, index, allTabs) => {
                      const isActive = activeTab === tab.id;
                      const TabIcon = tab.icon;

                      const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
                        const direction = isRTL ? -1 : 1;
                        let nextIndex: number | null = null;

                        if (event.key === 'ArrowRight') nextIndex = (index + direction + allTabs.length) % allTabs.length;
                        if (event.key === 'ArrowLeft') nextIndex = (index - direction + allTabs.length) % allTabs.length;
                        if (event.key === 'Home') nextIndex = 0;
                        if (event.key === 'End') nextIndex = allTabs.length - 1;
                        if (nextIndex === null) return;

                        event.preventDefault();
                        selectCustomerTab(allTabs[nextIndex].id as TabType);
                        const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                        buttons?.[nextIndex]?.focus();
                      };

                      return (
                        <button
                          key={tab.id}
                          id={`customer-tab-${tab.id}`}
                          aria-controls={`customer-panel-${tab.id}`}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          tabIndex={isActive ? 0 : -1}
                          onKeyDown={handleKeyDown}
                          onClick={() => selectCustomerTab(tab.id as TabType)}
                          className={`group relative min-h-14 rounded-[1rem] px-3.5 py-3 text-[0.78rem] font-semibold tracking-[-0.01em] outline-none transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none flex items-center justify-center gap-2.5 cursor-pointer border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:translate-y-px ${
                            isActive
                              ? themeMode === 'dark'
                                ? 'bg-slate-800 text-slate-50 shadow-[0_8px_20px_-14px_oklch(0.2_0.02_175/0.8)]'
                                : 'bg-[oklch(0.955_0.022_175)] text-[oklch(0.28_0.055_175)] shadow-[0_8px_22px_-16px_oklch(0.42_0.07_175/0.45)]'
                              : themeMode === 'dark'
                                ? 'bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                                : 'bg-transparent text-slate-600 hover:bg-[oklch(0.965_0.008_175)] hover:text-slate-900'
                          }`}
                        >
                          <TabIcon
                            aria-hidden="true"
                            strokeWidth={isActive ? 2.25 : 1.8}
                            className={`h-[1.05rem] w-[1.05rem] shrink-0 transition-colors duration-200 motion-reduce:transition-none ${
                              isActive
                                ? 'text-emerald-600'
                                : themeMode === 'dark'
                                  ? 'text-slate-500 group-hover:text-slate-300'
                                  : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span className="whitespace-nowrap">{language === 'AR' ? tab.labelAr : tab.labelFr}</span>
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-emerald-500 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                              isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>


              {/* ──────────────── TAB 1: VUE D'ENSEMBLE (OVERVIEW BENTO GRID) ──────────────── */}
              {activeTab === 'overview' && (
                <div id="customer-panel-overview" role="tabpanel" aria-labelledby="customer-tab-overview" className="space-y-8 animate-in fade-in duration-300">
                  
                  <CustomerSectionHeader
                    eyebrow={isRTL ? 'نظرة عامة' : 'Vue d’ensemble'}
                    title={isRTL ? `مرحباً ${clientUser.name?.trim() || ''}` : `Bonjour ${clientUser.name?.trim() || ''}`}
                    description={isRTL ? 'تابعي طلباتك ومكافآتك وروتين العناية من مكان واحد.' : 'Retrouvez vos commandes, vos avantages et votre routine depuis un espace unique.'}
                    theme={themeMode}
                  />

                  {/* Executive Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CustomerMetricCard
                      label={isRTL ? 'رصيد المكافآت' : 'Solde cagnotte'}
                      value={points}
                      unit={isRTL ? 'نقطة' : 'pts'}
                      description={isRTL ? <>القيمة التقديرية: <strong className="text-emerald-400">{walletMadValue} MAD</strong></> : <>Valeur estimée : <strong className="text-emerald-400">{walletMadValue} MAD</strong></>}
                      icon={Coins}
                      tone="emerald"
                      theme={themeMode}
                      action={<PoButton onClick={() => selectCustomerTab('cagnotte')} variant="accentSoft" size="md" fullWidth rightIcon={<ChevronRight className={isRTL ? 'rotate-180' : ''} />}>{isRTL ? 'عرض المكافآت' : 'Voir mes avantages'}</PoButton>}
                    />
                    <CustomerMetricCard
                      label={isRTL ? 'الطلبات الجارية' : 'Commandes en cours'}
                      value={activeOrderCount}
                      unit={isRTL ? 'طلب' : activeOrderCount > 1 ? 'colis' : 'colis'}
                      description={latestOrder ? (isRTL ? <>آخر طلب: <strong className="text-sky-400">{latestOrder.order_id}</strong></> : <>Dernière commande : <strong className="text-sky-400">{latestOrder.order_id}</strong></>) : (isRTL ? 'لا توجد طلبات جارية' : 'Aucune commande en cours')}
                      icon={Truck}
                      tone="blue"
                      theme={themeMode}
                      action={<PoButton onClick={() => selectCustomerTab('commandes')} variant="secondary" size="md" fullWidth rightIcon={<ChevronRight className={isRTL ? 'rotate-180' : ''} />}>{isRTL ? 'تتبع طلباتي' : 'Suivre mes commandes'}</PoButton>}
                    />
                    <CustomerMetricCard
                      label={isRTL ? 'تشخيص البشرة' : 'Diagnostic cutané'}
                      value={diagnostic ? (isRTL ? 'متاح' : 'Disponible') : (isRTL ? 'غير مكتمل' : 'À faire')}
                      description={diagnostic ? (isRTL ? <>الملف: <strong className="text-amber-400">{skinTypeLabel(diagnostic.skinType, language)}</strong></> : <>Profil : <strong className="text-amber-400">{skinTypeLabel(diagnostic.skinType, language)}</strong></>) : (isRTL ? 'احصلي على روتين يناسب بشرتك.' : 'Obtenez une routine adaptée à votre peau.')}
                      icon={Sparkles}
                      tone="amber"
                      theme={themeMode}
                      action={<PoButton onClick={() => selectCustomerTab('diagnostic')} variant="neutral" size="md" fullWidth rightIcon={<ChevronRight className={isRTL ? 'rotate-180' : ''} />}>{diagnostic ? (isRTL ? 'عرض روتيني' : 'Voir ma routine') : (isRTL ? 'بدء التشخيص' : 'Faire le diagnostic')}</PoButton>}
                    />
                    <CustomerMetricCard
                      label={isRTL ? 'العروض المتاحة' : 'Offres disponibles'}
                      value={activeCoupons.length}
                      unit={isRTL ? 'عرض' : activeCoupons.length > 1 ? 'codes' : 'code'}
                      description={activeCoupons[0] ? (isRTL ? <>الرمز: <strong className="text-violet-400">{activeCoupons[0].code}</strong></> : <>Code actif : <strong className="text-violet-400">{activeCoupons[0].code}</strong></>) : (isRTL ? 'لا توجد عروض نشطة حالياً.' : 'Aucune offre active pour le moment.')}
                      icon={Ticket}
                      tone="violet"
                      theme={themeMode}
                      action={<PoButton onClick={() => activeCoupons[0] ? copyCouponToClipboard(activeCoupons[0].code) : selectCustomerTab('cagnotte')} variant="neutral" size="md" fullWidth leftIcon={activeCoupons[0] ? <Copy /> : <Ticket />}>{activeCoupons[0] ? (isRTL ? 'نسخ الرمز' : 'Copier le code') : (isRTL ? 'عرض العروض' : 'Voir les offres')}</PoButton>}
                    />
                  </div>


                  {/* Recent Order Live Card */}
                  {latestOrder ? <CustomerPanelCard theme={themeMode} className="relative overflow-hidden p-5 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            {isRTL ? 'آخر شحنة' : 'DERNIÈRE EXPÉDITION'}
                          </span>
                          <CustomerStatusBadge label={customerStatusLabel(latestOrder.status, language)} status={latestOrder.status} />
                        </div>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {isRTL ? 'الطلب رقم' : 'Commande N°'} {latestOrder.order_id}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                      <PoButton
                        onClick={() => handleReorder(latestOrder)}
                        variant="primary"
                        size="md"
                        leftIcon={<RefreshCw />}
                        rightIcon={<ArrowRight />}
                      >
                        {isRTL ? 'إعادة الطلب' : 'Re-commander en 1 clic'}
                      </PoButton>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 items-center">
                      <div className="space-y-3 lg:col-span-2">
                        <p className={`text-xs font-semibold ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {isRTL ? 'المنتجات الموجودة في هذه الشحنة:' : 'Articles inclus dans cette expédition :'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {latestOrder.items.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl border flex items-center gap-3 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                                <img src={resolveCustomerProductImage(item)} onError={applyCustomerImageFallback} alt={item.title} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0 flex-1 text-start">
                                <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-[11px] font-mono text-slate-400">
                                  {item.quantity}x • {item.price} MAD
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`p-5 rounded-2xl border space-y-3 text-start ${
                        themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                      }`}>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isRTL ? 'التسليم المتوقع' : 'Livraison estimée'}</span>
                          <p className="text-sm font-bold text-cyan-400">{latestOrder.estimated_delivery || (isRTL ? 'يحدده الناقل' : 'Délai communiqué par le transporteur')}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isRTL ? 'شركة التوصيل' : 'Transporteur'}</span>
                          <p className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{latestOrder.carrier || (isRTL ? 'سيتم التأكيد' : 'Transporteur à confirmer')}{latestOrder.tracking_number ? ` (${latestOrder.tracking_number})` : ''}</p>
                        </div>
                      </div>
                    </div>
                  </CustomerPanelCard> : <CustomerPanelCard theme={themeMode} className="p-8 text-center sm:p-10">
                    <Box className="w-8 h-8 mx-auto mb-4 text-emerald-500" aria-hidden="true" />
                    <h3 className={`text-lg font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{isRTL ? 'سيظهر سجل طلباتك هنا' : 'Votre historique de commandes apparaîtra ici'}</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{isRTL ? 'تظهر الطلبات المرتبطة بهذا الحساب بشكل خاص وآمن.' : 'Vos commandes liées à ce compte sont affichées de façon privée et sécurisée.'}</p>
                  </CustomerPanelCard>}

                </div>
              )}


              {/* ──────────────── TAB 2: MES COMMANDES & SUIVI ──────────────── */}
              {activeTab === 'commandes' && (
                <div id="customer-panel-commandes" role="tabpanel" aria-labelledby="customer-tab-commandes" className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Filter & Search Bar */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="Rechercher par N° de commande ou nom de produit..."
                        className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-xs font-mono transition border ${
                          themeMode === 'dark'
                            ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 select-none">
                      <button
                        onClick={() => setOrderFilterStatus('all')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'all'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Toutes ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderFilterStatus('in_transit')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'in_transit'
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        En Transit
                      </button>
                      <button
                        onClick={() => setOrderFilterStatus('delivered')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                          orderFilterStatus === 'delivered'
                            ? 'bg-purple-500 text-slate-950 shadow-sm'
                            : themeMode === 'dark' ? 'bg-slate-950 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Livrées
                      </button>
                    </div>
                  </div>

                  {/* Orders Deck */}
                  <div className="space-y-6">
                    {ordersState === 'loading' && (
                      <div className={`rounded-3xl border p-10 text-center ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} role="status">
                        <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-emerald-500" aria-hidden="true" />
                        <p className="text-sm font-semibold">Chargement sécurisé de vos commandes...</p>
                      </div>
                    )}
                    {ordersState === 'error' && (
                      <div className={`rounded-3xl border p-8 text-center ${themeMode === 'dark' ? 'bg-slate-900 border-rose-900/50' : 'bg-white border-rose-200'}`} role="alert">
                        <AlertCircle className="mx-auto mb-3 h-6 w-6 text-rose-500" aria-hidden="true" />
                        <p className="text-sm font-semibold">{ordersError}</p>
                        <PoButton onClick={() => void loadCustomerOrders()} variant="secondary" size="md" className="mt-4" leftIcon={<RefreshCw />}>Réessayer</PoButton>
                      </div>
                    )}
                    {ordersState === 'ready' && filteredOrders.length === 0 && (
                      <div className={`rounded-3xl border p-10 text-center ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <Box className="mx-auto mb-3 h-7 w-7 text-emerald-500" aria-hidden="true" />
                        <h3 className="text-base font-bold">{orderSearchQuery || orderFilterStatus !== 'all' ? 'Aucune commande ne correspond à ce filtre.' : 'Vous n’avez encore aucune commande.'}</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Vos prochaines commandes passées avec ce compte apparaîtront ici automatiquement.</p>
                      </div>
                    )}
                    {ordersState === 'ready' && filteredOrders.map((order) => (
                      <div
                        key={order.order_id}
                        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 relative overflow-hidden transition ${
                          themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-xl font-black font-mono tracking-tight ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {order.order_id}
                              </h3>
                              <CustomerStatusBadge label={customerStatusLabel(order.status, language)} status={order.status} />
                            </div>
                            <p className="text-xs text-slate-400">
                              Commandé le {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <PoButton
                              onClick={() => handleReorder(order)}
                              variant="primary"
                              size="md"
                              leftIcon={<RefreshCw />}
                              rightIcon={<ArrowRight />}
                            >
                              Re-commander
                            </PoButton>

                            <PoButton
                              href={`/suivi-commande?order=${order.order_id}`}
                              variant="secondary"
                              size="md"
                              leftIcon={<Truck />}
                            >
                              Suivre la livraison
                            </PoButton>

                            <PoButton
                              href={`https://wa.me/212660808080?text=Bonjour,%20question%20sur%20ma%20commande%20N%C2%B0%20${order.order_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="accentSoft"
                              size="md"
                              iconOnly
                              leftIcon={<MessageCircle />}
                              aria-label="Assistance WhatsApp"
                            />
                          </div>
                        </div>

                        {/* Order Items Table/Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items.map((item, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                                <img src={resolveCustomerProductImage(item)} onError={applyCustomerImageFallback} alt={item.title} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className={`text-xs font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-xs font-mono font-bold text-emerald-500 mt-1">
                                  {item.quantity}x • {item.price} MAD
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Carrier Specs */}
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
                          themeMode === 'dark' ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-100/70 border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-4">
                            <span>Transporteur: <strong>{order.carrier || (language === 'AR' ? 'سيتم تأكيده عند الشحن' : 'Confirmé lors de l’expédition')}</strong></span>
                            <span>Destination: <strong>{order.city}</strong></span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">Total payé (COD):</span>
                            <span className={`text-base font-black font-mono ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {order.total} MAD
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 3: DIAGNOSTIC IA & ROUTINE ──────────────── */}
              {activeTab === 'diagnostic' && (
                <div id="customer-panel-diagnostic" role="tabpanel" aria-labelledby="customer-tab-diagnostic" className="space-y-8 animate-in fade-in duration-300">
                  {!diagnostic ? (
                    <section className={`rounded-3xl border p-8 sm:p-12 text-center ${themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'}`}>
                      <Sparkles className="mx-auto mb-4 h-9 w-9 text-emerald-500" aria-hidden="true" />
                      <h2 className={`text-2xl font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Votre diagnostic commence ici</h2>
                      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">Répondez à quelques questions pour enregistrer votre profil de peau et découvrir une sélection de soins adaptée.</p>
                      <PoButton onClick={() => setDiagnosticOpen(true)} variant="primary" size="lg" className="mt-6" leftIcon={<Sparkles />}>Lancer le diagnostic</PoButton>
                    </section>
                  ) : <>
                  {/* Diagnostic Summary */}
                  <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl relative overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-4 text-center space-y-4">
                        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-8 border-slate-800 border-t-emerald-500 border-r-teal-500 animate-spin-slow" style={{ animationDuration: '15s' }} />
                          <div className="text-center space-y-0.5">
                            <span className="text-4xl font-black font-heading text-emerald-500">
                              Profil
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400 block">enregistré</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            DIAGNOSTIC DU {diagnosticDate}
                          </span>
                          <h3 className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {diagnostic.skinType}
                          </h3>
                        </div>
                      </div>

                      {/* Detailed Metric Gauges */}
                      <div className="lg:col-span-8 space-y-4">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-widest ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Préférences enregistrées
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Préoccupation principale', value: diagnostic.concern, color: 'border-emerald-500/25' },
                            { label: 'Exposition au soleil', value: diagnostic.sunExposure, color: 'border-cyan-500/25' }
                          ].map((m, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border ${m.color} space-y-2 ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <span className="block text-[11px] font-semibold text-slate-500">{m.label}</span>
                              <span className={themeMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}>{m.value || 'Non renseignée'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>


                  {/* Prescribed AM & PM Routine Products Deck */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            ROUTINE DE SOINS PERSONNALISÉE
                          </span>
                        </div>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Sélection de soins à explorer
                        </h3>
                      </div>

                      <PoButton
                        onClick={handleAddFullRoutineToCart}
                        variant="primary"
                        size="lg"
                        leftIcon={<ShoppingBag />}
                      >
                        Ajouter toute la routine au panier
                      </PoButton>
                    </div>

                    <div className="space-y-6">
                      {/* AM Routine */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>RITUEL DU MATIN (AM)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {DIAGNOSTIC_ROUTINE_RECOMMENDATIONS.routineAm.map((prod, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="space-y-3">
                                <div className="w-full h-32 rounded-xl bg-white p-2 border border-slate-200 relative overflow-hidden">
                                  <img src={resolveCustomerProductImage(prod)} onError={applyCustomerImageFallback} alt={prod.title} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">{prod.brand}</span>
                                  <h5 className={`text-xs font-bold line-clamp-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {prod.title}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{prod.price} MAD</span>
                                <PoButton
                                  onClick={() => {
                                    if (addRoutineProductToCart(prod)) showToast(`${prod.title} ajouté au panier!`);
                                  }}
                                  variant="primary"
                                  size="sm"
                                  leftIcon={<Plus />}
                                >
                                  Ajouter
                                </PoButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PM Routine */}
                      <div className="space-y-3 pt-4 border-t border-slate-800/80">
                        <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>RITUEL DU SOIR (PM)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {DIAGNOSTIC_ROUTINE_RECOMMENDATIONS.routinePm.map((prod, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                              themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                            }`}>
                              <div className="space-y-3">
                                <div className="w-full h-32 rounded-xl bg-white p-2 border border-slate-200 relative overflow-hidden">
                                  <img src={resolveCustomerProductImage(prod)} onError={applyCustomerImageFallback} alt={prod.title} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">{prod.brand}</span>
                                  <h5 className={`text-xs font-bold line-clamp-2 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                    {prod.title}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{prod.price} MAD</span>
                                <PoButton
                                  onClick={() => {
                                    if (addRoutineProductToCart(prod)) showToast(`${prod.title} ajouté au panier!`);
                                  }}
                                  variant="primary"
                                  size="sm"
                                  leftIcon={<Plus />}
                                >
                                  Ajouter
                                </PoButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  </>}

                </div>
              )}


              {/* ──────────────── TAB 4: CAGNOTTE VIP & COUPONS ──────────────── */}
              {activeTab === 'cagnotte' && (
                <div id="customer-panel-cagnotte" role="tabpanel" aria-labelledby="customer-tab-cagnotte" className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* VIP Tier Progress Card */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                          PROGRESSION DU STATUT VIP
                        </span>
                        <h3 className={`text-2xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Statut Actuel: <span className="text-amber-400">{tier} VIP</span>
                        </h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-slate-400 block">MULTIPLICATEUR DE POINTS</span>
                        <span className="text-xl font-black font-mono text-emerald-400">{tierMultiplier}x Points</span>
                      </div>
                    </div>

                    <div className="pt-6 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Progression vers le statut Gold:</span>
                        <span className="text-amber-400 font-mono font-bold">{points} / 500 PTS</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                        <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (points / 500) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-slate-400">
                        Encore <strong>{pointsToNextTier || 150} points</strong> pour débloquer la livraison gratuite permanente et −15% sur tous vos rituels.
                      </p>
                    </div>
                  </div>

                  {/* Active Coupons Hub */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="space-y-1 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                          BONS DE RÉDUCTION & CODES EXCLUSIFS
                        </span>
                      </div>
                      <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Bons Privilège Prêts à être Utilisés
                      </h3>
                    </div>

                    {activeCoupons.length === 0 ? (
                      <div className={`rounded-2xl border border-dashed p-8 text-center ${themeMode === 'dark' ? 'border-slate-700 bg-slate-950/50' : 'border-slate-300 bg-slate-50'}`}>
                        <Ticket className="mx-auto mb-3 h-7 w-7 text-slate-400" aria-hidden="true" />
                        <p className={`font-semibold ${themeMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Aucun code promotionnel disponible</p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Les offres actives de la boutique apparaîtront ici. Les conditions et les dates de validité sont vérifiées avant l’affichage.</p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeCoupons.map((coupon) => {
                        const discount = coupon.freeShipping
                          ? 'Livraison offerte'
                          : coupon.discountType === 'fixed'
                            ? `-${coupon.discountValue ?? coupon.discountPercent} MAD`
                            : `-${coupon.discountValue ?? coupon.discountPercent}%`;
                        const minimum = coupon.minPurchase ? `Dès ${coupon.minPurchase} MAD` : 'Sans minimum d’achat';
                        const expiry = coupon.expiryDate
                          ? `Valable jusqu’au ${new Intl.DateTimeFormat('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(coupon.expiryDate))}`
                          : 'Valable dans la limite des conditions de l’offre';
                        return (
                        <div key={coupon.code} className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between relative overflow-hidden ${
                          themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {coupon.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{minimum}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {discount}
                            </h4>
                            <p className="text-[11px] text-slate-400">{expiry}</p>
                          </div>

                          <PoButton
                            onClick={() => copyCouponToClipboard(coupon.code)}
                            variant="secondary"
                            size="md"
                            fullWidth
                            leftIcon={<Copy />}
                          >
                            {copiedCode === coupon.code ? 'Code Copié !' : 'Copier le code'}
                          </PoButton>
                        </div>
                        );
                      })}
                    </div>
                    )}
                  </div>

                </div>
              )}


              {/* ──────────────── TAB 5: MES FAVORIS ──────────────── */}
              {activeTab === 'favoris' && (
                <div id="customer-panel-favoris" role="tabpanel" aria-labelledby="customer-tab-favoris" className="space-y-6 animate-in fade-in duration-300">
                  <CustomerSectionHeader
                    eyebrow={language === 'FR' ? 'Sélection personnelle' : 'اختياراتي'}
                    title={language === 'FR' ? 'Mes favoris' : 'منتجاتي المفضلة'}
                    description={language === 'FR' ? `${wishlist.length} soin${wishlist.length > 1 ? 's' : ''} sauvegardé${wishlist.length > 1 ? 's' : ''} dans votre espace.` : `${wishlist.length} منتجات محفوظة في حسابك.`}
                    theme={themeMode}
                  />

                  {wishlist.length === 0 ? (
                    <CustomerPanelCard theme={themeMode} className="relative space-y-4 overflow-hidden py-16 text-center">
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                        <Heart className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-black font-heading uppercase tracking-wide ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {language === 'FR' ? 'Votre Liste d\'Envies est vide' : 'قائمتكِ المفضلة فارغة حالياً'}
                        </h4>
                        <p className={`text-xs max-w-xs mx-auto leading-relaxed font-semibold ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {language === 'FR'
                            ? 'Parcourez notre catalogue et cliquez sur l\'icône de cœur sur n\'importe quel produit pour le sauvegarder ici.'
                            : 'تصفحي منتجاتنا واضغطي على رمز القلب في أي منتج لحفظه هنا.'}
                        </p>
                      </div>
                      <PoButton
                        href="/products"
                        variant="primary"
                        size="lg"
                        rightIcon={<ArrowRight className={isRTL ? 'rotate-180' : ''} />}
                      >
                        {language === 'FR' ? 'Découvrir nos soins' : 'استكشاف المنتجات'}
                      </PoButton>
                    </CustomerPanelCard>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((product) => (
                        <CustomerPanelCard key={product.id} theme={themeMode} as="article" className="group relative flex flex-col justify-between space-y-4 p-4 transition-colors hover:border-emerald-500/35">
                          <PoButton
                            onClick={() => removeFromWishlist(product.id)}
                            className="absolute top-3 right-3 z-10"
                            variant="dangerSoft"
                            size="sm"
                            iconOnly
                            leftIcon={<Trash2 />}
                            aria-label={language === 'FR' ? 'Retirer des favoris' : 'حذف من المفضلة'}
                          />

                          <div className="space-y-3">
                            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-white p-2 border border-slate-200">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                              <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest block font-bold">
                                {product.category}
                              </span>
                              <h4 className={`text-xs font-bold leading-snug line-clamp-2 mt-0.5 ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {product.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                            <span className={`text-sm font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {product.price} MAD
                            </span>
                            <PoButton
                              onClick={() => {
                                addToCart(product, 1);
                                showToast(`${product.name} ajouté au panier !`);
                              }}
                              variant="primary"
                              size="sm"
                              leftIcon={<ShoppingBag />}
                            >
                              {language === 'FR' ? 'Ajouter' : 'إضافة'}
                            </PoButton>
                          </div>
                        </CustomerPanelCard>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── TAB 6: PROFIL & ADRESSES ──────────────── */}
              {activeTab === 'profil' && (
                <div id="customer-panel-profil" role="tabpanel" aria-labelledby="customer-tab-profil" className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Personal Information Form */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                          INFORMATIONS PERSONNELLES
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Mes coordonnées
                        </h3>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="customer-profile-name" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Nom Complet
                          </label>
                          <input
                            id="customer-profile-name"
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                              themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="customer-profile-phone" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Téléphone
                          </label>
                          <input
                            id="customer-profile-phone"
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            required
                            className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                              themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="customer-profile-email" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Adresse Email
                        </label>
                        <input
                          id="customer-profile-email"
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                          className={`w-full px-4 py-3 rounded-xl text-xs font-sans border transition ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                        <p className="text-xs leading-5 text-slate-500">Toute modification de l’adresse email doit être confirmée depuis votre boîte de réception.</p>
                      </div>

                      <PoButton
                        type="submit"
                        loading={isProfileSaving}
                        loadingText="Enregistrement..."
                        variant="primary"
                        size="lg"
                        leftIcon={<Save />}
                      >
                        Enregistrer les modifications
                      </PoButton>
                    </form>
                  </div>

                  {/* Password & Account Security */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-start gap-4 border-b border-slate-800/80 pb-5">
                      <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                          SÉCURITÉ DU COMPTE
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Mettre à jour mon mot de passe
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-400">Choisissez un mot de passe d'au moins 8 caractères, unique à votre compte.</p>
                      </div>
                      <PoButton
                        onClick={handleDownloadPersonalData}
                        variant="neutral"
                        size="sm"
                        leftIcon={<FileText />}
                        className="ml-auto shrink-0"
                      >
                        Mes données
                      </PoButton>
                    </div>

                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                      <div className="space-y-1.5">
                        <label htmlFor="new-password" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          autoComplete="new-password"
                          required
                          className={`w-full px-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="confirm-password" className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Confirmer le mot de passe</label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          autoComplete="new-password"
                          required
                          className={`w-full px-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                            themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <PoButton
                        type="submit"
                        loading={isPasswordSaving}
                        loadingText="Mise à jour..."
                        variant="secondary"
                        size="lg"
                        leftIcon={<KeyRound />}
                      >
                        Modifier le mot de passe
                      </PoButton>
                    </form>

                    {passwordFeedback && (
                      <p className={`rounded-xl px-4 py-3 text-xs font-semibold border ${
                        passwordFeedback.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                      }`} role="status">
                        {passwordFeedback.message}
                      </p>
                    )}
                  </div>

                  {/* Saved Delivery Addresses Deck */}
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                    themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-widest">
                          CARNET D'ADRESSES DE LIVRAISON
                        </span>
                        <h3 className={`text-xl font-black font-heading ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Adresses Enregistrées
                        </h3>
                      </div>

                      <PoButton
                        onClick={() => setShowAddAddressModal(true)}
                        variant="secondary"
                        size="md"
                        leftIcon={<Plus />}
                      >
                        Nouvelle adresse
                      </PoButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isAddressesLoading && <p className="text-sm text-slate-500">Chargement de vos adresses...</p>}
                      {!isAddressesLoading && addressesError && (
                        <div className="md:col-span-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4" role="alert">
                          <p className="text-sm font-semibold text-rose-500">{addressesError}</p>
                          <PoButton onClick={() => void loadSavedAddresses()} variant="secondary" size="sm" className="mt-3" leftIcon={<RefreshCw />}>Réessayer</PoButton>
                        </div>
                      )}
                      {!isAddressesLoading && !addressesError && savedAddresses.length === 0 && (
                        <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300/80 p-5 text-sm text-slate-500 dark:border-slate-700">
                          Aucune adresse enregistrée pour le moment. Ajoutez-en une pour accélérer votre prochaine commande.
                        </div>
                      )}
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className={`p-5 rounded-2xl border space-y-3 relative ${
                          themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-500">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                PRINCIPALE
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {addr.fullName} ({addr.phone})
                          </p>
                          <p className="text-xs text-slate-400">
                            {addr.address}, {addr.city}
                          </p>
                          {!addr.isDefault && <PoButton onClick={() => void handleSetDefaultAddress(addr.id)} variant="neutral" size="sm">Définir comme principale</PoButton>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* Add New Address Modal */}
      {showAddAddressModal && (
        <div data-app-area="client" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddAddressModal(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="new-address-title" className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
            themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-800">
              <h3 id="new-address-title" className="text-base font-bold font-heading">Ajouter une Adresse de Livraison</h3>
              <PoButton
                onClick={() => setShowAddAddressModal(false)}
                variant="neutral"
                size="sm"
                iconOnly
                leftIcon={<X />}
                aria-label="Fermer"
              />
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-address-label" className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Nom de l'adresse (ex: Domicile, Bureau)</label>
                <input
                  id="new-address-label"
                  type="text"
                  required
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  placeholder="ex: Maison Casablanca"
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-address-city" className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Ville</label>
                <select
                  id="new-address-city"
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Oujda', 'Tétouan', 'Meknès', 'Autre ville'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="new-address-street" className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Adresse Complète</label>
                <textarea
                  id="new-address-street"
                  required
                  rows={3}
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  placeholder="Rue, N° d'appartement, quartier..."
                  className={`w-full px-4 py-3 rounded-xl text-xs font-sans border ${
                    themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <PoButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Save />}
              >
                Enregistrer l'adresse
              </PoButton>
            </form>
          </div>
        </div>
      )}

    </ShopShell>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
