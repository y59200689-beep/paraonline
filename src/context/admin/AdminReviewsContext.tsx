'use client';

import React, { createContext, useContext } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useUi } from '@/context/UiContext';

export interface AdminReviewsContextProps {
  handleUpdateReviewStatus: (id: string, newStatus: string) => Promise<void>;
  handleBulkUpdateReviewStatus: (status: string, selectedIds: string[]) => Promise<void>;
  handleReplyReview: (reviewId: string, text: string) => Promise<boolean>;
  handleDeleteReview: (id: string) => Promise<void>;
}

const AdminReviewsContext = createContext<AdminReviewsContextProps | undefined>(undefined);

export const AdminReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { loadReviews, logAdminAction, setIsDataLoading } = useAdminData();
  const { showToast } = useUi();

  const handleUpdateReviewStatus = async (id: string, newStatus: string) => {
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas modérer les avis clients.", 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        await loadReviews();
        logAdminAction("Modération Avis", `Avis ${id} est passé au statut ${newStatus}.`);
      }
    } catch (e) {}
  };

  const handleBulkUpdateReviewStatus = async (status: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas modérer les avis clients.", 'error');
      return;
    }
    setIsDataLoading(true);
    try {
      let successCount = 0;
      await Promise.all(selectedIds.map(async (id) => {
        const res = await fetch('/api/admin/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status })
        });
        const data = await res.json();
        if (data.success) successCount++;
      }));
      await loadReviews();
      logAdminAction("Bulk Modération Avis", `${successCount} avis passés au statut ${status}.`);
      showToast(`${successCount} avis mis à jour avec succès.`, 'success');
    } catch (e) {
      showToast("Erreur lors de la modération en lot.", 'error');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleReplyReview = async (reviewId: string, text: string): Promise<boolean> => {
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas répondre aux avis.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, reply: text })
      });
      const data = await res.json();
      if (data.success) {
        await loadReviews();
        logAdminAction("Réponse à un Avis", `Réponse ajoutée à l'avis ${reviewId}.`);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleDeleteReview = async (id: string) => {
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas supprimer des avis clients.", 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadReviews();
        logAdminAction("Suppression Avis", `Avis ${id} supprimé.`);
      }
    } catch (e) {}
  };

  return (
    <AdminReviewsContext.Provider value={{
      handleUpdateReviewStatus,
      handleBulkUpdateReviewStatus,
      handleReplyReview,
      handleDeleteReview
    }}>
      {children}
    </AdminReviewsContext.Provider>
  );
};

export const useAdminReviews = () => {
  const context = useContext(AdminReviewsContext);
  if (!context) {
    throw new Error('useAdminReviews must be used within an AdminReviewsProvider');
  }
  return context;
};
