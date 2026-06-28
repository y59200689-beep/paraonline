'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useSettings } from '@/context/SettingsContext';

export interface AdminOrdersContextProps {
  handleUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  handleBulkUpdateOrderStatus: (status: string, selectedIds: string[]) => Promise<void>;
  handleDeleteOrder: (orderId: string) => Promise<void>;
  handleRegisterShipping: (shippingData: {
    orderId: string;
    courierName: 'yalidine' | 'cathedis';
    codAmount: number;
    customerName: string;
    phone: string;
    city: string;
    address: string;
  }) => Promise<any>;
  handleSyncCourierStatuses: () => Promise<void>;
  handleReconcileOrders: (reconciliations: any[]) => Promise<boolean>;
  shippingStats: {
    total: number;
    delivered: number;
    returned: number;
    enTransit: number;
    codRecouvre: number;
    codEnTransit: number;
    returnRate: number;
    successRate: number;
  };
}

const AdminOrdersContext = createContext<AdminOrdersContextProps | undefined>(undefined);

export const AdminOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAdminAuth();
  const { orders, setOrders, loadOrders, logAdminAction, setIsDataLoading } = useAdminData();
  const { settings } = useSettings();

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        if (data.note) {
          const localOrders = JSON.parse(localStorage.getItem('ordersBM') || '[]') as any[];
          const updated = localOrders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o);
          localStorage.setItem('ordersBM', JSON.stringify(updated));
        }
        await loadOrders();
        logAdminAction("Statut Commande Modifié", `Commande ${orderId} passée au statut ${newStatus}.`);
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  };

  const handleBulkUpdateOrderStatus = async (status: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    setIsDataLoading(true);
    try {
      let successCount = 0;
      await Promise.all(selectedIds.map(async (orderId) => {
        const res = await fetch('/api/admin/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status })
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
          if (data.note) {
            const localOrders = JSON.parse(localStorage.getItem('ordersBM') || '[]') as any[];
            const updated = localOrders.map(o => o.order_id === orderId ? { ...o, status } : o);
            localStorage.setItem('ordersBM', JSON.stringify(updated));
          }
        }
      }));
      await loadOrders();
      logAdminAction("Bulk Statut Commande Modifié", `${successCount} commandes passées au statut ${status}.`);
      alert(`${successCount} commandes mises à jour avec succès.`);
    } catch (e) {
      alert("Erreur lors de la mise à jour en lot.");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (currentUser?.role !== 'owner') {
      alert("Permission refusée : Seul le propriétaire de la boutique (Owner) peut supprimer des commandes.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (data.note) {
          const localOrders = JSON.parse(localStorage.getItem('ordersBM') || '[]') as any[];
          const updated = localOrders.filter(o => o.order_id !== orderId);
          localStorage.setItem('ordersBM', JSON.stringify(updated));
        }
        await loadOrders();
        logAdminAction("Suppression Commande", `Commande ${orderId} supprimée.`);
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (e) {
      alert("Erreur réseau");
    }
  };

  const handleRegisterShipping = async (shippingData: {
    orderId: string;
    courierName: 'yalidine' | 'cathedis';
    codAmount: number;
    customerName: string;
    phone: string;
    city: string;
    address: string;
  }): Promise<any> => {
    if (currentUser?.role === 'support') {
      alert("Permission refusée : Le rôle Support n'a pas l'autorisation d'enregistrer des expéditions.");
      return null;
    }
    try {
      const res = await fetch('/api/admin/courier/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingData)
      });
      const data = await res.json();
      if (data.success) {
        const local = localStorage.getItem('ordersBM');
        if (local) {
          const parsed = JSON.parse(local);
          const updated = parsed.map((o: any) => 
            o.order_id === shippingData.orderId 
              ? { 
                  ...o, 
                  status: 'Shipped',
                  trackingNumber: data.trackingNumber,
                  trackingLink: data.trackingLink,
                  courier: data.courier
                } 
              : o
          );
          localStorage.setItem('ordersBM', JSON.stringify(updated));
        }

        await loadOrders();
        logAdminAction("Expédition Enregistrée", `Commande ${shippingData.orderId} expédiée via ${shippingData.courierName.toUpperCase()}. N° Suivi: ${data.trackingNumber}`);
        return data;
      } else {
        alert("Erreur lors de l'enregistrement de l'expédition : " + data.error);
        return null;
      }
    } catch (err) {
      alert("Erreur de communication.");
      return null;
    }
  };

  const handleSyncCourierStatuses = async () => {
    const activeShippedOrders = orders.filter(
      (o) => o.status === 'Shipped' && o.tracking_number && o.courier
    );

    if (activeShippedOrders.length === 0) {
      alert("Aucune expédition en cours (statut 'Expédié' avec numéro de suivi) à synchroniser.");
      return;
    }

    setIsDataLoading(true);
    try {
      const payload = {
        orders: activeShippedOrders.map((o) => ({
          order_id: o.order_id,
          courier: o.courier,
          track_num: o.tracking_number,
        })),
        credentials: {
          mode: settings.courierMode || 'simulation',
          yalidineApiId: settings.yalidineApiId,
          yalidineApiKey: settings.yalidineApiKey,
          cathedisApiKey: settings.cathedisApiKey,
        },
      };

      const res = await fetch('/api/admin/courier/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue lors de la synchronisation.');
      }

      const updates = data.updates || [];
      let deliveredCount = 0;
      let returnedCount = 0;
      let unchangedCount = 0;

      const updatedOrders = orders.map((o) => {
        const update = updates.find((u: any) => u.order_id === o.order_id);
        if (update && update.status !== o.status) {
          if (update.status === 'Delivered') deliveredCount++;
          if (update.status === 'Returned') returnedCount++;
          
          fetch('/api/admin/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: o.order_id, status: update.status })
          }).catch(err => console.error("Failed to update status in db:", err));

          setTimeout(() => {
            logAdminAction("Sync Statut Colis", `Commande ${o.order_id} mise à jour: ${update.status} via API ${o.courier?.toUpperCase()}.`);
          }, 100);

          return { ...o, status: update.status };
        } else {
          if (update) unchangedCount++;
          return o;
        }
      });

      localStorage.setItem('ordersBM', JSON.stringify(updatedOrders.map(o => ({
        ...o,
        name: o.customer_name,
        phone: o.phone_number,
        discountAmount: o.discount_amount,
        appliedCoupon: o.applied_coupon ? { code: o.applied_coupon } : null,
      }))));

      setOrders(updatedOrders);
      alert(`Synchronisation terminée !\n\n- ${deliveredCount} colis livrés\n- ${returnedCount} retours enregistrés\n- ${unchangedCount} colis en cours`);
    } catch (err: any) {
      alert("Erreur lors de la synchronisation : " + err.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleReconcileOrders = async (reconciliations: any[]): Promise<boolean> => {
    setIsDataLoading(true);
    try {
      const res = await fetch('/api/admin/orders/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reconciliations })
      });
      const data = await res.json();
      if (data.success) {
        const local = localStorage.getItem('ordersBM');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const updated = parsed.map((o: any) => {
              const match = reconciliations.find(r => r.orderId === o.order_id);
              if (match) {
                return {
                  ...o,
                  reconciled: true,
                  reconciled_at: new Date().toISOString(),
                  settled_amount: match.settledAmount,
                  courier_fee: match.courierFee,
                  reconciliation_notes: match.reconciliationNotes,
                  payment_status: 'paid',
                  status: match.status || o.status
                };
              }
              return o;
            });
            localStorage.setItem('ordersBM', JSON.stringify(updated));
          } catch (e) {
            console.error("Local storage sync error:", e);
          }
        }
        await loadOrders();
        logAdminAction("Rapprochement Financier", `${reconciliations.length} commandes réconciliées.`);
        return true;
      } else {
        alert("Erreur lors de la réconciliation : " + data.error);
        return false;
      }
    } catch (err: any) {
      alert("Erreur de communication : " + err.message);
      return false;
    } finally {
      setIsDataLoading(false);
    }
  };

  const shippingStats = useMemo(() => {
    const shippedOrders = orders.filter(o => o.courier);
    const total = shippedOrders.length;
    const delivered = shippedOrders.filter(o => o.status === 'Delivered').length;
    const returned = shippedOrders.filter(o => o.status === 'Returned').length;
    const enTransit = shippedOrders.filter(o => o.status === 'Shipped').length;

    const codRecouvre = shippedOrders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const codEnTransit = shippedOrders
      .filter(o => o.status === 'Shipped')
      .reduce((sum, o) => sum + o.total, 0);

    const returnRate = total ? Math.round((returned / total) * 100) : 0;
    const successRate = total ? Math.round((delivered / total) * 100) : 0;

    return {
      total, delivered, returned, enTransit,
      codRecouvre, codEnTransit, returnRate, successRate
    };
  }, [orders]);

  return (
    <AdminOrdersContext.Provider value={{
      handleUpdateOrderStatus,
      handleBulkUpdateOrderStatus,
      handleDeleteOrder,
      handleRegisterShipping,
      handleSyncCourierStatuses,
      handleReconcileOrders,
      shippingStats
    }}>
      {children}
    </AdminOrdersContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error('useAdminOrders must be used within an AdminOrdersProvider');
  }
  return context;
};
