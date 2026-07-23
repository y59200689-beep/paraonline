'use client';

import React, { createContext, useContext } from 'react';
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

const CompareContext = createContext<CompareContextProps>({
  compareProducts: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  toggleCompare: () => {},
  isInCompare: () => false,
  clearCompare: () => {},
  isOpenModal: false,
  setIsOpenModal: () => {},
  alertMessage: null,
  setAlertMessage: () => {},
});

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CompareContext.Provider
      value={{
        compareProducts: [],
        addToCompare: () => {},
        removeFromCompare: () => {},
        toggleCompare: () => {},
        isInCompare: () => false,
        clearCompare: () => {},
        isOpenModal: false,
        setIsOpenModal: () => {},
        alertMessage: null,
        setAlertMessage: () => {},
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  return useContext(CompareContext);
};
