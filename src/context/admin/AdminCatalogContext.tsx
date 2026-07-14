'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Product } from '@/lib/data';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useSettings, HeroCardConfig } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';

export interface AdminCatalogContextProps {
  handleSaveCoupon: (couponForm: any) => Promise<boolean>;
  handleDeleteCoupon: (code: string) => Promise<boolean>;
  handleToggleCouponActive: (code: string) => Promise<boolean>;
  handleSaveBanner: (index: number, bannerForm: HeroCardConfig) => Promise<boolean>;
  handleMoveBanner: (index: number, direction: 'up' | 'down') => Promise<boolean>;
  handleSaveBulkProducts: (changedProducts: Product[]) => Promise<boolean>;
  handleCreateProduct: (productForm: Partial<Product>) => Promise<boolean>;
  handleRestock: (productId: number, newStock: number) => Promise<boolean>;
  handleAddFaq: (faqForm: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }) => Promise<boolean>;
  handleDeleteFaq: (index: number) => Promise<boolean>;
  handleSaveGeneralSettings: (formSettings: any) => Promise<boolean>;
  handleSaveCourierSettings: (formSettings: any) => Promise<boolean>;
  handleSaveLoyaltySettings: (formSettings: any) => Promise<boolean>;
  handleSavePaymentSettings: (formSettings: any) => Promise<boolean>;
  handleSaveNotificationTemplates: (formSettings: any, notifTemplates: any) => Promise<boolean>;
  handleImportProducts: (rawProducts: any[]) => Promise<{ success: boolean; count: number }>;
}

const AdminCatalogContext = createContext<AdminCatalogContextProps | undefined>(undefined);

export const AdminCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { loadProducts, logAdminAction, setProducts, products } = useAdminData();
  const { loadSettings } = useSettings();
  const { showToast } = useUi();

  const handleSaveCoupon = async (couponForm: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Configuration Coupon", `Coupon "${couponForm.code}" configuré.`);
        showToast("Coupon configuré avec succès !", 'success');
        return true;
      } else {
        showToast(data.error || "Erreur lors de la configuration.", 'error');
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleDeleteCoupon = async (code: string): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch(`/api/admin/coupons?code=${code}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Suppression Coupon", `Coupon "${code}" supprimé.`);
        showToast("Coupon supprimé !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleToggleCouponActive = async (code: string): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/coupons/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Statut Coupon", `Statut du coupon "${code}" basculé.`);
        showToast("Statut du coupon mis à jour !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSaveBanner = async (index: number, bannerForm: HeroCardConfig): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'banner',
          index,
          banner: bannerForm
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Banner", `Bannière #${index + 1} mise à jour.`);
        showToast("Bannière enregistrée avec succès !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down'): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'banner_move',
          index,
          direction
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Mouvement Banner", `Bannière déplacée.`);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleSaveBulkProducts = async (changedProducts: Product[]): Promise<boolean> => {
    if (currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: changedProducts })
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Modification Catalogue (Lot)", `${changedProducts.length} produits mis à jour.`);
        showToast(`${changedProducts.length} produits enregistrés !`, 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleCreateProduct = async (productForm: Partial<Product>): Promise<boolean> => {
    if (currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Création Produit", `Produit "${productForm.title}" créé.`);
        showToast("Produit créé avec succès !", 'success');
        return true;
      } else {
        showToast(data.error || "Erreur de création.", 'error');
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleRestock = async (productId: number, newStock: number): Promise<boolean> => {
    if (currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/products/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock: newStock })
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction("Réapprovisionnement", `Produit #${productId} réapprovisionné à ${newStock} unités.`);
        showToast("Stock mis à jour avec succès !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleAddFaq = async (faqForm: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'faq_add',
          faq: faqForm
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration FAQ", `Nouvelle question FAQ ajoutée.`);
        showToast("Question FAQ ajoutée !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleDeleteFaq = async (index: number): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'faq_delete',
          index
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration FAQ", `Question FAQ #${index + 1} supprimée.`);
        showToast("Question FAQ supprimée !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSaveGeneralSettings = async (formSettings: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'general',
          settings: formSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Générale", "Paramètres généraux de la boutique mis à jour.");
        showToast("Paramètres généraux enregistrés !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSaveCourierSettings = async (formSettings: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'couriers',
          settings: formSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Livreurs", "Paramètres des transporteurs mis à jour.");
        showToast("Paramètres transporteurs enregistrés !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSaveLoyaltySettings = async (formSettings: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'loyalty',
          settings: formSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Fidélité", "Règles du programme de fidélité mises à jour.");
        showToast("Paramètres fidélité enregistrés !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSavePaymentSettings = async (formSettings: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment',
          settings: formSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Paiement", "Méthodes et clés de paiement mises à jour.");
        showToast("Paramètres de paiement enregistrés !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleSaveNotificationTemplates = async (formSettings: any, notifTemplates: any): Promise<boolean> => {
    if (currentUser?.role === 'logistician' || currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notifications',
          settings: formSettings,
          templates: notifTemplates
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadSettings();
        logAdminAction("Configuration Notifications", "Modèles de messages SMS/WhatsApp mis à jour.");
        showToast("Modèles de notifications enregistrés !", 'success');
        return true;
      }
    } catch (e) {
      showToast("Erreur de connexion.", 'error');
    }
    return false;
  };

  const handleImportProducts = async (rawProducts: any[]): Promise<{ success: boolean; count: number }> => {
    if (currentUser?.role === 'support') {
      showToast("Permission refusée.", 'error');
      return { success: false, count: 0 };
    }
    const isSupabaseLive = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54321';
    if (isSupabaseLive) {
      try {
        const res = await fetch('/api/admin/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: rawProducts })
        });
        const data = await res.json();
        if (data.success) {
          await loadProducts();
          logAdminAction("Importation Produits (Live)", `${data.count} produits importés/mis à jour.`);
          return { success: true, count: data.count };
        }
      } catch (e) {
        showToast("Erreur de connexion lors de l'importation.", 'error');
      }
      return { success: false, count: 0 };
    } else {
      const updatedProducts = [...products];
      let importCount = 0;
      rawProducts.forEach(newP => {
        const existingIdx = updatedProducts.findIndex(p => p.id === newP.id || p.sku === newP.sku);
        if (existingIdx !== -1) {
          updatedProducts[existingIdx] = {
            ...updatedProducts[existingIdx],
            ...newP,
            price: newP.price !== undefined ? Number(newP.price) : updatedProducts[existingIdx].price,
            comparePrice: newP.comparePrice !== undefined ? Number(newP.comparePrice) : updatedProducts[existingIdx].comparePrice,
            stock: newP.stock !== undefined ? Number(newP.stock) : updatedProducts[existingIdx].stock,
            buyingCost: newP.buyingCost ? Number(newP.buyingCost) : updatedProducts[existingIdx].buyingCost
          };
          importCount++;
        } else {
          const mappedProduct: Product = {
            id: newP.id || Math.floor(Math.random() * 100000) + 10000,
            title: newP.title || '',
            nameFr: newP.nameFr || newP.title || '',
            description: newP.description || '',
            ingredients: newP.ingredients || '',
            usage: newP.usage || '',
            image: newP.image || '',
            images: newP.images || [],
            category: newP.category || 'visage',
            tags: newP.tags || [],
            price: newP.price !== undefined ? Number(newP.price) : 100,
            comparePrice: newP.comparePrice !== undefined ? Number(newP.comparePrice) : (newP.price !== undefined ? Number(newP.price) : 100),
            rating: newP.rating !== undefined ? Number(newP.rating) : 5,
            reviews: newP.reviews !== undefined ? Number(newP.reviews) : 0,
            vendor: newP.vendor || '',
            stock: newP.stock !== undefined ? Number(newP.stock) : 100,
            sku: newP.sku || '',
            buyingCost: newP.buyingCost ? Number(newP.buyingCost) : undefined
          };
          updatedProducts.push(mappedProduct);
          importCount++;
        }
      });
      setProducts(updatedProducts);
      logAdminAction("Importation Produits (Mémoire)", `${importCount} produits importés/mis à jour en local.`);
      return { success: true, count: importCount };
    }
  };

  const contextValue = useMemo(() => ({
    handleSaveCoupon,
    handleDeleteCoupon,
    handleToggleCouponActive,
    handleSaveBanner,
    handleMoveBanner,
    handleSaveBulkProducts,
    handleCreateProduct,
    handleRestock,
    handleAddFaq,
    handleDeleteFaq,
    handleSaveGeneralSettings,
    handleSaveCourierSettings,
    handleSaveLoyaltySettings,
    handleSavePaymentSettings,
    handleSaveNotificationTemplates,
    handleImportProducts
  }), [
    products,
    setProducts,
    currentUser,
    loadProducts,
    logAdminAction,
    loadSettings
  ]);

  return (
    <AdminCatalogContext.Provider value={contextValue}>
      {children}
    </AdminCatalogContext.Provider>
  );
};

export const useAdminCatalog = () => {
  const context = useContext(AdminCatalogContext);
  if (!context) {
    throw new Error('useAdminCatalog must be used within an AdminCatalogProvider');
  }
  return context;
};
