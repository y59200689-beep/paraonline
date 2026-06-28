'use client';

import React, { createContext, useContext } from 'react';
import { useAdminData } from './AdminDataContext';

export interface AdminLoyaltyContextProps {
  handleAdjustPoints: (phone: string, name: string, currentPoints: number, adjustment: number, reason: string) => Promise<number | null>;
  handleSaveProductPoints: (productId: number, newPoints: number) => Promise<boolean>;
  handleBulkSavePoints: (points: number, productIds: number[]) => Promise<boolean>;
}

const AdminLoyaltyContext = createContext<AdminLoyaltyContextProps | undefined>(undefined);

export const AdminLoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products, setProducts, loadLoyaltyOverrides, logAdminAction } = useAdminData();

  const handleAdjustPoints = async (phone: string, name: string, currentPoints: number, adjustment: number, reasonInput: string): Promise<number | null> => {
    const newPoints = currentPoints + adjustment;
    const reason = reasonInput.trim() || 'Ajustement administratif';

    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, points: newPoints, reason })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('loyalty_points', String(newPoints));
        await loadLoyaltyOverrides();
        logAdminAction("Ajustement Points Fidélité", `Solde client (${name} - ${phone}) ajusté de ${adjustment > 0 ? '+' : ''}${adjustment} points. Nouveau Solde: ${newPoints} pts. Raison: ${reason}`);
        return newPoints;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleSaveProductPoints = async (productId: number, newPoints: number): Promise<boolean> => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return false;
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, points: newPoints })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, points: newPoints } : p));
        logAdminAction('Modification Points Produit', `Produit ID ${productId} (${product.name || product.title}) → ${newPoints} pts`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleBulkSavePoints = async (points: number, productIds: number[]): Promise<boolean> => {
    if (productIds.length === 0) return false;
    try {
      const payload = productIds.map(id => ({ id, points }));
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: payload })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => productIds.includes(p.id) ? { ...p, points } : p));
        logAdminAction('Modification Groupée Points', `${payload.length} produit(s) mis à jour → ${points} pts`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <AdminLoyaltyContext.Provider value={{
      handleAdjustPoints,
      handleSaveProductPoints,
      handleBulkSavePoints
    }}>
      {children}
    </AdminLoyaltyContext.Provider>
  );
};

export const useAdminLoyalty = () => {
  const context = useContext(AdminLoyaltyContext);
  if (!context) {
    throw new Error('useAdminLoyalty must be used within an AdminLoyaltyProvider');
  }
  return context;
};
