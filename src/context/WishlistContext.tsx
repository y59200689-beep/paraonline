'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/data';
import { LoyaltyContext } from './LoyaltyContext';
import { LanguageContext } from './LanguageContext';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, X, ArrowRight } from 'lucide-react';

interface WishlistContextProps {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
  isAuthPromptOpen: boolean;
  setIsAuthPromptOpen: (v: boolean) => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

const STORAGE_KEY = 'wishlistBM';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const loyaltyContext = useContext(LoyaltyContext);
  const clientUser = loyaltyContext?.clientUser ?? null;
  const langContext = useContext(LanguageContext);
  const language = langContext?.language ?? 'FR';
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error('WishlistContext: failed to load from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Listen to cross-tab BroadcastChannel
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_wishlist_channel');
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_WISHLIST') {
        const currentStr = localStorage.getItem(STORAGE_KEY) || '[]';
        const receivedStr = JSON.stringify(payload.wishlist);
        if (currentStr !== receivedStr) {
          setWishlist(payload.wishlist);
        }
      }
    };
    return () => {
      channel.close();
    };
  }, [isLoaded]);

  // Broadcast local changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const channel = new BroadcastChannel('ecom_wishlist_channel');
    channel.postMessage({
      type: 'SYNC_WISHLIST',
      payload: { wishlist }
    });
    return () => {
      channel.close();
    };
  }, [wishlist, isLoaded]);

  // Persist to localStorage whenever wishlist changes
  const persist = useCallback((newList: Product[]) => {
    setWishlist(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('WishlistContext: failed to save to localStorage', e);
    }
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    if (!clientUser) {
      setIsAuthPromptOpen(true);
      return;
    }
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      const next = [...prev, product];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [clientUser]);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist(prev => {
      const next = prev.filter(p => p.id !== productId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    if (!clientUser) {
      setIsAuthPromptOpen(true);
      return;
    }
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [clientUser]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.some(p => p.id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    persist([]);
  }, [persist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        clearWishlist,
        isAuthPromptOpen,
        setIsAuthPromptOpen,
      }}
    >
      {children}

      {/* ── Professional Auth Required Modal Popup for Favorites ── */}
      {isAuthPromptOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAuthPromptOpen(false); }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden text-center space-y-6">
            
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setIsAuthPromptOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700/50"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner relative">
              <Heart className="w-8 h-8 fill-rose-500/20 text-rose-500 animate-pulse" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
              </span>
            </div>

            {/* Text Copy */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                {language === 'AR' ? 'حفظ المنتجات المفضلة' : 'LISTE D\'ENVIES PRIVÉE'}
              </span>
              <h3 className="text-xl font-black text-white font-heading tracking-tight">
                {language === 'AR' ? 'حساب شخصي مطلوب' : 'Compte Client Requis'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
                {language === 'AR'
                  ? 'لتأكيد وحفظ منتجاتكِ وصيغ العناية المفضلة في مفكرتكِ الخاصة والرجوع إليها في أي وقت، يرجى تسجيل الدخول أو إنشاء حساب جديد.'
                  : 'Pour ajouter vos soins d\'exception à votre Liste d\'Envies et les retrouver synchronisés sur tous vos appareils, veuillez vous connecter à votre espace client.'}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setIsAuthPromptOpen(false);
                  router.push('/customer');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <span>{language === 'AR' ? 'تسجيل الدخول / إنشاء حساب' : 'Se Connecter / Créer un Compte'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => setIsAuthPromptOpen(false)}
                className="w-full py-2.5 px-4 text-[11px] font-bold text-slate-400 hover:text-white transition cursor-pointer bg-transparent border-0"
              >
                {language === 'AR' ? 'إلغاء' : 'Plus tard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
