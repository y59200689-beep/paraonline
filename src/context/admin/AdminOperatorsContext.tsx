'use client';

import React, { createContext, useContext } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useUi } from '@/context/UiContext';

export interface AdminOperatorsContextProps {
  handleCreateOperator: (operatorForm: any) => Promise<boolean>;
  handleToggleOperatorStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

const AdminOperatorsContext = createContext<AdminOperatorsContextProps | undefined>(undefined);

export const AdminOperatorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { loadOperatorsList, logAdminAction } = useAdminData();
  const { showToast } = useUi();

  const handleCreateOperator = async (operatorForm: any): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'owner') return false;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operatorForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadOperatorsList();
        logAdminAction("Création Opérateur", `Nouveau compte opérateur créé: ${operatorForm.username} (${operatorForm.role}).`);
        return true;
      } else {
        showToast("Erreur: " + data.error, 'error');
      }
    } catch (e) {
      showToast("Erreur de communication.", 'error');
    }
    return false;
  };

  const handleToggleOperatorStatus = async (userId: string, currentStatus: boolean) => {
    if (!currentUser || currentUser.role !== 'owner') return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'toggle-active', userId, isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        await loadOperatorsList();
        logAdminAction("Statut Opérateur Modifié", `Compte opérateur #${userId} ${!currentStatus ? 'activé' : 'désactivé'}.`);
      } else {
        showToast("Erreur: " + data.error, 'error');
      }
    } catch (e) {
      showToast("Erreur de communication.", 'error');
    }
  };

  return (
    <AdminOperatorsContext.Provider value={{
      handleCreateOperator,
      handleToggleOperatorStatus
    }}>
      {children}
    </AdminOperatorsContext.Provider>
  );
};

export const useAdminOperators = () => {
  const context = useContext(AdminOperatorsContext);
  if (!context) {
    throw new Error('useAdminOperators must be used within an AdminOperatorsProvider');
  }
  return context;
};
