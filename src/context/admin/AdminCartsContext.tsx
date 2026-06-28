'use client';

import React, { createContext, useContext } from 'react';
import { useAdminData } from './AdminDataContext';

export interface AdminCartsContextProps {
  handleUpdateCartRecovery: (phone: string, status: 'not_contacted' | 'contacted' | 'recovered') => Promise<void>;
}

const AdminCartsContext = createContext<AdminCartsContextProps | undefined>(undefined);

export const AdminCartsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCartRecoveryStatus, logAdminAction } = useAdminData();

  const handleUpdateCartRecovery = async (phone: string, status: 'not_contacted' | 'contacted' | 'recovered') => {
    setCartRecoveryStatus(prev => ({ ...prev, [phone]: status }));
    try {
      await fetch('/api/admin/abandoned-carts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, recoveryStatus: status })
      });
      logAdminAction('Relance Panier', `Statut de relance mis à jour: ${phone} → ${status}`);
    } catch (e) {}
  };

  return (
    <AdminCartsContext.Provider value={{ handleUpdateCartRecovery }}>
      {children}
    </AdminCartsContext.Provider>
  );
};

export const useAdminCarts = () => {
  const context = useContext(AdminCartsContext);
  if (!context) {
    throw new Error('useAdminCarts must be used within an AdminCartsProvider');
  }
  return context;
};
