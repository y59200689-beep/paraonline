'use client';

import React, { createContext, useContext } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useUi } from '@/context/UiContext';
import { canManageAdvice } from '@/lib/permissions';

export interface AdminAdviceContextProps {
  handleCreateAdviceArticle: (articleForm: any) => Promise<boolean>;
  handleUpdateAdviceArticle: (id: string, articleForm: any) => Promise<boolean>;
  handleDeleteAdviceArticle: (id: string) => Promise<boolean>;
}

const AdminAdviceContext = createContext<AdminAdviceContextProps | undefined>(undefined);

export const AdminAdviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { loadAdviceArticles, logAdminAction } = useAdminData();
  const { showToast } = useUi();

  const handleCreateAdviceArticle = async (articleForm: any): Promise<boolean> => {
    if (!currentUser || !canManageAdvice(currentUser.role)) {
      showToast("Erreur: Accès refusé. Droits insuffisants.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/advice', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadAdviceArticles();
        showToast("Article créé avec succès !", 'success');
        return true;
      } else {
        showToast("Erreur: " + data.error, 'error');
      }
    } catch (e) {
      showToast("Erreur de communication.", 'error');
    }
    return false;
  };

  const handleUpdateAdviceArticle = async (id: string, articleForm: any): Promise<boolean> => {
    if (!currentUser || !canManageAdvice(currentUser.role)) {
      showToast("Erreur: Accès refusé. Droits insuffisants.", 'error');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/advice/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadAdviceArticles();
        showToast("Article mis à jour avec succès !", 'success');
        return true;
      } else {
        showToast("Erreur: " + data.error, 'error');
      }
    } catch (e) {
      showToast("Erreur de communication.", 'error');
    }
    return false;
  };

  const handleDeleteAdviceArticle = async (id: string): Promise<boolean> => {
    if (!currentUser || !canManageAdvice(currentUser.role)) {
      showToast("Erreur: Accès refusé. Droits insuffisants.", 'error');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/advice/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await loadAdviceArticles();
        logAdminAction("Suppression d'Article", `L'article #${id} a été supprimé.`);
        showToast("Article supprimé avec succès.", 'success');
        return true;
      } else {
        showToast("Erreur: " + data.error, 'error');
      }
    } catch (e) {
      showToast("Erreur de communication.", 'error');
    }
    return false;
  };

  return (
    <AdminAdviceContext.Provider value={{
      handleCreateAdviceArticle,
      handleUpdateAdviceArticle,
      handleDeleteAdviceArticle
    }}>
      {children}
    </AdminAdviceContext.Provider>
  );
};

export const useAdminAdvice = () => {
  const context = useContext(AdminAdviceContext);
  if (!context) {
    throw new Error('useAdminAdvice must be used within an AdminAdviceProvider');
  }
  return context;
};
