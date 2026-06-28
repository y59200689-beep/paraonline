'use client';

import React, { createContext, useContext } from 'react';
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
  handleImportProducts: (importedProducts: any[], updateExisting: boolean) => Promise<{ success: boolean; count: number; error?: string; message?: string }>;
}

const AdminCatalogContext = createContext<AdminCatalogContextProps | undefined>(undefined);

export const AdminCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { products, setProducts, loadProducts, logAdminAction } = useAdminData();
  const { settings, saveSettings } = useSettings();
  const { showToast } = useUi();

  const handleSaveCoupon = async (couponForm: any): Promise<boolean> => {
    if (!couponForm.code) return false;
    const normalizedCode = couponForm.code.trim().toUpperCase();
    const newCoupon = {
      code: normalizedCode,
      discountPercent: couponForm.discountType === 'percent' ? couponForm.discountValue : 0,
      freeShipping: couponForm.freeShipping,
      discountType: couponForm.discountType,
      discountValue: couponForm.discountValue,
      minPurchase: couponForm.minPurchase,
      startDate: couponForm.startDate || undefined,
      expiryDate: couponForm.expiryDate,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
      isActive: couponForm.isActive
    };

    type CouponEntry = NonNullable<typeof settings.coupons>[number];
    const updatedCoupons = [
      ...(settings.coupons || []).filter((c: CouponEntry) => c.code !== normalizedCode),
      newCoupon
    ];

    const success = await saveSettings({ ...settings, coupons: updatedCoupons });
    if (success) {
      logAdminAction("Création/Modification Code Promo", `Code ${normalizedCode} enregistré (Valeur: ${couponForm.discountValue} ${couponForm.discountType === 'percent' ? '%' : 'DH'}, Min: ${couponForm.minPurchase} DH).`);
      return true;
    }
    return false;
  };

  const handleDeleteCoupon = async (code: string): Promise<boolean> => {
    type CouponEntry = NonNullable<typeof settings.coupons>[number];
    const updatedCoupons = (settings.coupons || []).filter((c: CouponEntry) => c.code !== code);
    const success = await saveSettings({ ...settings, coupons: updatedCoupons });
    if (success) {
      logAdminAction("Suppression Code Promo", `Code ${code} supprimé.`);
      return true;
    }
    return false;
  };

  const handleToggleCouponActive = async (code: string): Promise<boolean> => {
    type CouponEntry = NonNullable<typeof settings.coupons>[number];
    const updatedCoupons = (settings.coupons || []).map((c: CouponEntry) => {
      if (c.code === code) return { ...c, isActive: !c.isActive };
      return c;
    });

    const couponState = updatedCoupons.find((c: CouponEntry) => c.code === code)?.isActive;
    const success = await saveSettings({ ...settings, coupons: updatedCoupons });
    if (success) {
      logAdminAction("Statut Code Promo Modifié", `Code ${code} ${couponState ? 'activé' : 'désactivé'}.`);
      return true;
    }
    return false;
  };

  const handleSaveBanner = async (index: number, bannerForm: HeroCardConfig): Promise<boolean> => {
    if (!settings.banners) return false;
    const updatedBanners = [...settings.banners];
    updatedBanners[index] = bannerForm;

    const success = await saveSettings({ ...settings, banners: updatedBanners });
    if (success) {
      logAdminAction("Mise à jour Diaporama Bannières", `Diapositive n°${index + 1} modifiée : "${bannerForm.titleFr}" / "${bannerForm.titleAr}".`);
      return true;
    }
    return false;
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down'): Promise<boolean> => {
    if (!settings.banners) return false;
    const newBanners = [...settings.banners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBanners.length) return false;
    
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;
    
    const success = await saveSettings({ ...settings, banners: newBanners });
    if (success) {
      logAdminAction("Réorganisation Diaporama", `Diapositive n°${index + 1} déplacée vers le ${direction === 'up' ? 'haut' : 'bas'} (échangée avec n°${targetIdx + 1}).`);
      return true;
    }
    return false;
  };

  const handleSaveBulkProducts = async (changedProducts: Product[]): Promise<boolean> => {
    if (currentUser?.role !== 'owner') {
      showToast("Permission refusée : Seuls les propriétaires (Owner) peuvent modifier le catalogue produits.", 'error');
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
        logAdminAction("Modification Catalogue en Masse", `${changedProducts.length} produits mis à jour via le tableur.`);
        await loadProducts();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleCreateProduct = async (productForm: Partial<Product>): Promise<boolean> => {
    if (currentUser?.role !== 'owner') {
      showToast("Permission refusée : Seuls les propriétaires (Owner) peuvent ajouter ou modifier des produits.", 'error');
      return false;
    }
    try {
      const isEdit = !!productForm.id;
      const res = await fetch('/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        logAdminAction(
          isEdit ? "Modification Produit" : "Création Produit",
          isEdit ? `Produit "${data.product.title}" mis à jour (ID: ${data.product.id}).` : `Produit "${data.product.title}" créé avec succès (ID: ${data.product.id}).`
        );
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleRestock = async (productId: number, newStock: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: [{ id: productId, stock: newStock }] })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        logAdminAction('Réapprovisionnement', `Produit #${productId} réapprovisionné à ${newStock} unités.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleAddFaq = async (faqForm: { q_fr: string; a_fr: string; q_ar: string; a_ar: string }): Promise<boolean> => {
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas modifier la FAQ.", 'error');
      return false;
    }
    const updatedFaq = [...(settings.faq || []), faqForm];
    const success = await saveSettings({ ...settings, faq: updatedFaq });
    if (success) {
      logAdminAction("Ajout FAQ", `Nouvelle question FAQ ajoutée : "${faqForm.q_fr}".`);
      return true;
    }
    return false;
  };

  const handleDeleteFaq = async (index: number): Promise<boolean> => {
    if (currentUser?.role === 'logistician') {
      showToast("Permission refusée : Les logisticiens ne peuvent pas modifier la FAQ.", 'error');
      return false;
    }
    type FaqEntry = NonNullable<typeof settings.faq>[number];
    const updatedFaq = (settings.faq || []).filter((_: FaqEntry, i: number) => i !== index);
    const success = await saveSettings({ ...settings, faq: updatedFaq });
    if (success) {
      logAdminAction("Suppression FAQ", `Entrée FAQ n°${index + 1} supprimée.`);
      return true;
    }
    return false;
  };

  const handleSaveGeneralSettings = async (formSettings: any): Promise<boolean> => {
    const updatedSettings = { ...settings, ...formSettings };
    const success = await saveSettings(updatedSettings);
    if (success) {
      logAdminAction("Mise à jour Paramètres Généraux", "Changement de la configuration globale du site.");
      return true;
    }
    return false;
  };

  const handleSaveCourierSettings = async (formSettings: any): Promise<boolean> => {
    const updatedSettings = { ...settings, ...formSettings };
    const success = await saveSettings(updatedSettings);
    if (success) {
      logAdminAction("Mise à jour Paramètres Messagerie", `Livreur configuré: ${updatedSettings.courierPartner?.toUpperCase()} (${updatedSettings.courierMode}).`);
      return true;
    }
    return false;
  };

  const handleSaveLoyaltySettings = async (formSettings: any): Promise<boolean> => {
    const updatedSettings = { ...settings, ...formSettings };
    const success = await saveSettings(updatedSettings);
    if (success) {
      logAdminAction("Mise à jour Règles Fidélité", "Modification des multiplicateurs de points par paliers.");
      return true;
    }
    return false;
  };

  const handleSavePaymentSettings = async (formSettings: any): Promise<boolean> => {
    const updatedSettings = {
      ...settings,
      paymentSettings: {
        ...(settings.paymentSettings || {}),
        ...formSettings
      }
    };
    const success = await saveSettings(updatedSettings);
    if (success) {
      logAdminAction("Mise à jour Paramètres Paiement", "Modification des clés et paramètres Stripe / CMI.");
      return true;
    }
    return false;
  };

  const handleSaveNotificationTemplates = async (formSettings: any, templatesInput: any): Promise<boolean> => {
    const updatedSettings = {
      ...settings,
      ...formSettings,
      notificationTemplates: { ...settings.notificationTemplates, ...templatesInput }
    };
    const success = await saveSettings(updatedSettings);
    if (success) {
      logAdminAction('Modèles Notifications', 'Configuration WhatsApp et templates mis à jour.');
      return true;
    }
    return false;
  };

  const handleImportProducts = async (importedProducts: any[], updateExisting: boolean): Promise<{ success: boolean; count: number; error?: string; message?: string }> => {
    if (currentUser?.role !== 'owner') {
      showToast("Permission refusée : Seuls les propriétaires (Owner) peuvent importer des produits.", 'error');
      return { success: false, count: 0, error: "Accès non autorisé" };
    }
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: importedProducts, updateExisting })
      });
      const data = await res.json();
      if (data.success) {
        logAdminAction("Importation Produits", `${data.count} produits importés/mis à jour.`);
        await loadProducts();
        return { success: true, count: data.count, message: data.message };
      }
      throw new Error(data.error || "API error");
    } catch (e: any) {
      console.warn("Database import failed, falling back to local state import:", e);
      
      let importCount = 0;
      const updatedProducts = [...products];

      importedProducts.forEach(newP => {
        const existingIdx = updatedProducts.findIndex(p => 
          (newP.id && p.id === Number(newP.id)) || 
          (newP.sku && p.sku === newP.sku)
        );

        if (updateExisting) {
          if (existingIdx > -1) {
            updatedProducts[existingIdx] = {
              ...updatedProducts[existingIdx],
              title: newP.title || updatedProducts[existingIdx].title,
              name: newP.name || newP.title || updatedProducts[existingIdx].name,
              nameFr: newP.nameFr || newP.title || updatedProducts[existingIdx].nameFr,
              vendor: newP.vendor || updatedProducts[existingIdx].vendor,
              price: newP.price !== undefined ? Number(newP.price) : updatedProducts[existingIdx].price,
              comparePrice: newP.comparePrice !== undefined ? Number(newP.comparePrice) : updatedProducts[existingIdx].comparePrice,
              category: newP.category || updatedProducts[existingIdx].category,
              stock: newP.stock !== undefined ? Number(newP.stock) : updatedProducts[existingIdx].stock,
              sku: newP.sku || updatedProducts[existingIdx].sku,
              buyingCost: newP.buyingCost !== undefined ? Number(newP.buyingCost) : updatedProducts[existingIdx].buyingCost,
              description: newP.description || updatedProducts[existingIdx].description,
              ingredients: newP.ingredients || updatedProducts[existingIdx].ingredients,
              usage: newP.usage || updatedProducts[existingIdx].usage,
              image: newP.image || updatedProducts[existingIdx].image
            };
            importCount++;
          }
        } else {
          const hasConflict = existingIdx > -1;
          const newId = hasConflict ? Math.max(0, ...updatedProducts.map(p => p.id)) + 1 : (newP.id ? Number(newP.id) : Math.max(0, ...updatedProducts.map(p => p.id)) + 1);

          const mappedProduct: Product = {
            id: newId,
            title: newP.title || "Sans titre",
            name: newP.name || newP.title || "Sans titre",
            nameFr: newP.nameFr || newP.title || "Sans titre",
            vendor: newP.vendor || "Inconnu",
            image: newP.image || '',
            images: newP.images || (newP.image ? [newP.image] : []),
            price: Number(newP.price) || 0,
            comparePrice: Number(newP.comparePrice || newP.price) || 0,
            category: newP.category || 'visage',
            tags: Array.isArray(newP.tags) ? newP.tags : [],
            rating: Number(newP.rating || 5),
            reviews: Number(newP.reviews || 0),
            description: newP.description || '',
            ingredients: newP.ingredients || '',
            usage: newP.usage || '',
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

  return (
    <AdminCatalogContext.Provider value={{
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
    }}>
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
