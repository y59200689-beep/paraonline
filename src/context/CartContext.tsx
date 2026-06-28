/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { useSettings } from './SettingsContext';
import { useTranslation } from './LanguageContext';
import { useUi } from './UiContext';
import { useProducts } from './ProductsContext';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShippingFee,
  calculateAmountNeededForFreeShipping,
  calculateTotal
} from '@/lib/pricing';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  freeShipping: boolean;
  giftItem?: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minPurchase?: number;
  expiryDate?: string;
  isActive?: boolean;
  startDate?: string;
  usageLimit?: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, specialDiscount?: boolean) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  discountAmount: number;
  isFreeShipping: boolean;
  shippingFee: number;
  amountNeededForFreeShipping: boolean | number;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  dailyGiftCode: string | null;
  applyDailyGift: (code: string, giftName: string) => void;
  dailyGiftName: string | null;
  /** The currently matched tiered gift range (if any) based on cart subtotal */
  activeGiftRange: { minAmount: number; maxAmount: number; productId: number; productName: string } | null;
  submitOrder: (orderData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  }) => Promise<{ success: boolean; orderId?: string; whatsappUrl: string }>;
  isSubmitting: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  shippingCity: string;
  setShippingCity: (city: string) => void;
  paymentMethod: 'cod' | 'stripe' | 'cmi';
  setPaymentMethod: (method: 'cod' | 'stripe' | 'cmi') => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Available mock coupons for fallback validation
const MOCK_COUPONS: Record<string, Coupon> = {
  'BEAUTY10': { code: 'BEAUTY10', discountPercent: 10, freeShipping: false },
  'CLINICAL15': { code: 'CLINICAL15', discountPercent: 15, freeShipping: false },
  'FREESHIP': { code: 'FREESHIP', discountPercent: 0, freeShipping: true },
  'GIFTGLOW': { code: 'GIFTGLOW', discountPercent: 0, freeShipping: false, giftItem: 'Masque Hydra-Glow Offert' }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const { language } = useTranslation();
  const { showToast } = useUi();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [dailyGiftCode, setDailyGiftCode] = useState<string | null>(null);
  const [dailyGiftName, setDailyGiftName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingCity, setShippingCity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'cmi'>('cod');

  const [isLoaded, setIsLoaded] = useState(false);
  const { products, isLoading: productsLoading } = useProducts();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartBM');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from storage', e);
      }
    }
    const savedCoupon = localStorage.getItem('couponBM');
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch {}
    }
    const savedGiftCode = localStorage.getItem('giftCodeBM');
    const savedGiftName = localStorage.getItem('giftNameBM');
    if (savedGiftCode && savedGiftName) {
      setDailyGiftCode(savedGiftCode);
      setDailyGiftName(savedGiftName);
    }
    setIsLoaded(true);
  }, []);

  // Load recovery cart from URL if present
  useEffect(() => {
    if (!isLoaded || productsLoading || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const recover = params.get('recover');
    if (recover) {
      try {
        const items = recover.split(',').map(item => {
          const [idStr, qtyStr] = item.split(':');
          return { id: parseInt(idStr), quantity: parseInt(qtyStr) || 1 };
        });
        
        const restoredCart: CartItem[] = [];
        items.forEach(item => {
          const prod = products.find(p => p.id === item.id);
          if (prod) {
            restoredCart.push({ product: prod, quantity: item.quantity });
          }
        });
        
        if (restoredCart.length > 0) {
          saveCartToStorage(restoredCart);
          showToast(
            language === 'AR' ? 'تم استرجاع السلة بنجاح!' : 'Panier récupéré avec succès !',
            'success'
          );
        }
        
        // Clean URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.error('Error recovering cart from URL', e);
      }
    }
  }, [isLoaded, productsLoading, products, language]);

  // Listen to cross-tab BroadcastChannel
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_cart_channel');
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_CART') {
        const currentCartStr = localStorage.getItem('cartBM') || '[]';
        const receivedCartStr = JSON.stringify(payload.cart);
        if (currentCartStr !== receivedCartStr) {
          setCart(payload.cart);
        }
        
        const currentCouponStr = localStorage.getItem('couponBM') || 'null';
        const receivedCouponStr = JSON.stringify(payload.appliedCoupon);
        if (currentCouponStr !== receivedCouponStr) {
          setAppliedCoupon(payload.appliedCoupon);
        }

        setDailyGiftCode(payload.dailyGiftCode);
        setDailyGiftName(payload.dailyGiftName);
        setShippingCity(payload.shippingCity);
      }
    };
    return () => {
      channel.close();
    };
  }, [isLoaded]);

  // Broadcast local changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_cart_channel');
    channel.postMessage({
      type: 'SYNC_CART',
      payload: { cart, appliedCoupon, dailyGiftCode, dailyGiftName, shippingCity }
    });
    return () => {
      channel.close();
    };
  }, [cart, appliedCoupon, dailyGiftCode, dailyGiftName, shippingCity, isLoaded]);

  // Save cart to localStorage
  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cartBM', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, quantity: number = 1, specialDiscount: boolean = false) => {
    const maxStock = product.stock !== undefined ? product.stock : 100;
    let capped = false;
    let finalAddedQty = quantity;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      const newCart = [...prevCart];

      if (existingIndex > -1) {
        const currentQty = newCart[existingIndex].quantity;
        if (currentQty + quantity > maxStock) {
          newCart[existingIndex].quantity = maxStock;
          capped = true;
          finalAddedQty = maxStock - currentQty;
        } else {
          newCart[existingIndex].quantity += quantity;
        }
      } else {
        if (quantity > maxStock) {
          finalAddedQty = maxStock;
          capped = true;
        }
        // Create a shallow copy of product to apply a 15% discount if specialDiscount is true
        const finalProduct = specialDiscount 
          ? { ...product, price: Math.round(product.price * 0.85) } 
          : product;
        newCart.push({ product: finalProduct, quantity: finalAddedQty });
      }

      if (capped || finalAddedQty <= 0) {
        setTimeout(() => {
          const msg = language === 'AR'
            ? `⚠️ لا يمكن إضافة المزيد من هذا المنتج. الكمية المتوفرة في المخزن هي ${maxStock} فقط.`
            : `⚠️ Impossible d'ajouter plus d'exemplaires. Stock maximal disponible : ${maxStock}.`;
          showToast(msg, 'warning');
        }, 50);
        if (finalAddedQty <= 0) {
          return prevCart;
        }
      }

      localStorage.setItem('cartBM', JSON.stringify(newCart));
      return newCart;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product.id !== productId);
      localStorage.setItem('cartBM', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === productId);
      if (!existingItem) return prevCart;

      const maxStock = existingItem.product.stock !== undefined ? existingItem.product.stock : 100;
      let finalQty = quantity;
      let capped = false;

      if (quantity > maxStock) {
        finalQty = maxStock;
        capped = true;
      }

      if (capped) {
        setTimeout(() => {
          const msg = language === 'AR'
            ? `⚠️ تم تحديد الكمية بـ ${maxStock} (الحد الأقصى للمخزن).`
            : `⚠️ Quantité limitée à ${maxStock} (stock maximum).`;
          showToast(msg, 'warning');
        }, 50);
      }

      const newCart = prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: finalQty } : item
      );
      localStorage.setItem('cartBM', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cartBM');
    setAppliedCoupon(null);
    localStorage.removeItem('couponBM');
  };

  const applyCouponCode = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: normalizedCode,
          subtotal,
          language
        })
      });
      const data = await res.json();
      
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        localStorage.setItem('couponBM', JSON.stringify(data.coupon));
        return { 
          success: true, 
          message: language === 'AR' 
            ? `تم تطبيق الكود ${normalizedCode}!` 
            : `Code ${normalizedCode} appliqué avec succès !` 
        };
      } else {
        return { 
          success: false, 
          message: data.error || (language === 'AR' ? 'كود الخصم غير صحيح.' : 'Code promo invalide.') 
        };
      }
    } catch (err) {
      console.error('Coupon validation API error:', err);
      return { 
        success: false, 
        message: language === 'AR' ? 'حدث خطأ في الاتصال بالخادم.' : 'Une erreur de communication est survenue.' 
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('couponBM');
  };

  const applyDailyGift = (code: string, giftName: string) => {
    setDailyGiftCode(code);
    setDailyGiftName(giftName);
    localStorage.setItem('giftCodeBM', code);
    localStorage.setItem('giftNameBM', giftName);
  };

  // Math calculations
  const subtotal = calculateSubtotal(cart);
  const discountAmount = calculateDiscount(subtotal, appliedCoupon);
  const shippingThreshold = settings.freeShippingThreshold || 600;
  const isFreeShipping = !!(appliedCoupon?.freeShipping || subtotal >= shippingThreshold || subtotal === 0);
  const shippingFee = calculateShippingFee(subtotal, shippingCity, settings, !!appliedCoupon?.freeShipping);
  const amountNeededForFreeShipping = calculateAmountNeededForFreeShipping(subtotal, shippingThreshold);
  const total = calculateTotal(subtotal, discountAmount, shippingFee);

  // Dynamically resolve tiered free gifts based on subtotal (order value) range
  const activeGiftRange = settings.giftRanges?.find(
    r => subtotal >= r.minAmount && subtotal <= r.maxAmount
  );
  const resolvedGiftName = activeGiftRange 
    ? activeGiftRange.productName 
    : (dailyGiftCode ? dailyGiftName : null);

  // Submit Order logic (Saves to database via server API, fallbacks on server, then builds WhatsApp query)
  const submitOrder = async (orderData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  }) => {
    setIsSubmitting(true);
    
    // Fetch user diagnostic & loyalty data to attach as metadata to order
    let skinDiagnostic = null;
    try {
      const diagStr = localStorage.getItem('skin_diagnostic_results');
      if (diagStr) {
        const parsed = JSON.parse(diagStr);
        skinDiagnostic = {
          skinType: parsed.skinType || '',
          concern: parsed.concern || '',
          sunExposure: parsed.sunExposure || ''
        };
      }
    } catch (e) {}

    let loyaltyPoints = 0;
    let loyaltyTier = 'Bronze';
    try {
      const pointsStr = localStorage.getItem('loyalty_points');
      if (pointsStr) loyaltyPoints = Number(pointsStr);
      const totalStr = localStorage.getItem('loyalty_total_earned');
      if (totalStr) {
        const totalEarned = Number(totalStr);
        if (totalEarned >= 1500) loyaltyTier = 'Platinum';
        else if (totalEarned >= 700) loyaltyTier = 'Gold';
        else if (totalEarned >= 300) loyaltyTier = 'Silver';
      }
    } catch (e) {}

    const payload = {
      orderData,
      items: cart.map(item => ({
        id: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal,
      discountAmount,
      appliedCoupon: appliedCoupon?.code || null,
      giftItem: resolvedGiftName || null,
      total,
      skinDiagnostic,
      loyaltyPoints,
      loyaltyTier,
      paymentMethod,
      paymentStatus: 'unpaid'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success && data.orderId) {
        // Clear abandoned cart since the user checked out successfully
        try {
          await fetch(`/api/admin/abandoned-carts?phone=${encodeURIComponent(orderData.phone)}`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.error("Failed to clear abandoned cart:", err);
        }

        if (paymentMethod === 'cod') {
          // Compile WhatsApp Message payload
          const storeWhatsApp = settings.storeWhatsApp || '212660808080';
          const itemsSummary = cart.map(item => `${item.product.title} (x${item.quantity}) - ${item.product.price * item.quantity} DH`).join('\n');
          const msg = `*PARA OFFICINAL S.A - NOUVELLE COMMANDE ${data.orderId}*
----------------------------------
*Client :* ${orderData.name}
*Tél :* ${orderData.phone}
*Ville :* ${orderData.city}
*Adresse :* ${orderData.address}
${orderData.note ? `*Instructions :* ${orderData.note}\n` : ''}
*Produits commandés :*
${itemsSummary}

----------------------------------
*Sous-Total :* ${subtotal} DH
${discountAmount > 0 ? `*Remise :* -${discountAmount} DH (Code: ${appliedCoupon?.code})\n` : ''}${resolvedGiftName ? `*Cadeau Gratuit :* ${resolvedGiftName}\n` : ''}*Livraison :* ${shippingFee === 0 ? 'GRATUITE' : `${shippingFee} DH`}
*TOTAL À PAYER (COD) : ${total} DH*
----------------------------------
Merci pour votre confiance ! Nous confirmons votre livraison le jour même`;

          const encodedMsg = encodeURIComponent(msg);
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodedMsg}`;

          // Reset states after submission
          clearCart();
          setShippingCity('');
          setIsSubmitting(false);
          
          return {
            success: true,
            orderId: data.orderId,
            whatsappUrl
          };
        } else {
          // For online payments, we don't clear the cart or generate WhatsApp yet.
          // The frontend (Stripe Element / CMI redirect) will handle payment and call clearCart.
          setIsSubmitting(false);
          return {
            success: true,
            orderId: data.orderId,
            whatsappUrl: ''
          };
        }
      } else {
        showToast(data.error || "Une erreur est survenue lors de l'enregistrement de la commande.", 'error');
      }
    } catch (err) {
      console.error('Checkout API error:', err);
      showToast("Une erreur de communication est survenue.", 'error');
    }

    setIsSubmitting(false);
    return {
      success: false,
      whatsappUrl: ''
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        total,
        discountAmount,
        isFreeShipping,
        shippingFee,
        amountNeededForFreeShipping,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        dailyGiftCode,
        applyDailyGift,
        dailyGiftName: resolvedGiftName,
        activeGiftRange: activeGiftRange || null,
        submitOrder,
        isSubmitting,
        isCartOpen,
        setIsCartOpen,
        shippingCity,
        setShippingCity,
        paymentMethod,
        setPaymentMethod
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
