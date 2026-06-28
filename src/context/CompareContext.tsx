'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/lib/data';

interface CompareContextProps {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
  isOpenModal: boolean;
  setIsOpenModal: (val: boolean) => void;
  alertMessage: string | null;
  setAlertMessage: (val: string | null) => void;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load from localStorage on mount to prevent hydration mismatch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('para_officinal_compare');
      if (stored) {
        setCompareProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('LocalStorage load failed:', e);
    }
    setIsLoaded(true);
  }, []);


  // Save to localStorage when compared products change
  const saveCompareList = (list: Product[]) => {
    setCompareProducts(list);
    try {
      localStorage.setItem('para_officinal_compare', JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  };

  const addToCompare = (product: Product) => {
    if (compareProducts.some(p => p.id === product.id)) return;

    if (compareProducts.length >= 2) {
      setAlertMessage(
        'Vous pouvez comparer un maximum de 2 produits à la fois. Veuillez en retirer un pour pouvoir en ajouter un autre.'
      );
      return;
    }

    const newList = [...compareProducts, product];
    saveCompareList(newList);
  };

  const removeFromCompare = (productId: number) => {
    const newList = compareProducts.filter(p => p.id !== productId);
    saveCompareList(newList);
  };

  const toggleCompare = (product: Product) => {
    if (compareProducts.some(p => p.id === product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const isInCompare = (productId: number) => {
    return compareProducts.some(p => p.id === productId);
  };

  const clearCompare = () => {
    saveCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        isOpenModal,
        setIsOpenModal,
        alertMessage,
        setAlertMessage,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
