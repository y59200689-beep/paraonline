'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/data';

interface WishlistContextProps {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

const STORAGE_KEY = 'wishlistBM';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      const next = [...prev, product];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist(prev => {
      const next = prev.filter(p => p.id !== productId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

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
      }}
    >
      {children}
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
