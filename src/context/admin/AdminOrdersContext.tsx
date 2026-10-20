'use client';

import { useCallback } from 'react';
import { useUi } from '@/context/UiContext';
import { canChangeOrderStatus } from '@/lib/order-status-options';
import { canDeleteOrders, type AdminRole } from '@/lib/permissions';
import React, { createContext, useContext, useMemo } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { useAdminData } from './AdminDataContext';
import { useSettings } from '@/context/SettingsContext';

export interface AdminOrdersContextProps {
  handleUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<boolean>;
  handleBulkUpdateOrderStatus: (status: string, selectedIds: string[]) => Promise<string[]>;
  handleDeleteOrder: (orderId: string) => Promise<boolean>;
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
  const { showToast } = useUi();

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: string): Promise<boolean> => {
    const order = orders.find(order => order.order_id === orderId);
    if (order && !canChangeOrderStatus(order.status, newStatus)) {
      showToast('Ce changement ne correspond pas à l’étape actuelle de la commande. Actualisez la liste.', 'error');
      return false;
    }
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Le statut n’a pas pu être modifié.', 'error');
        return false;
      }
      await loadOrders();
      logAdminAction('Statut Commande Modifié', `Commande ${orderId} passée au statut ${newStatus}.`);
      showToast('Statut de la commande mis à jour.', 'success');
      return true;
    } catch {
      showToast('Impossible de confirmer la mise à jour. Actualisez les commandes avant de réessayer.', 'error');
      return false;
    }
  }, [orders, loadOrders, logAdminAction, showToast]);

  const handleBulkUpdateOrderStatus = useCallback(async (status: string, selectedIds: string[]): Promise<string[]> => {
    if (!selectedIds.length) return [];
    setIsDataLoading(true);
    const updatedIds: string[] = [];
    try {
      for (const orderId of selectedIds) {
        const order = orders.find(order => order.order_id === orderId);
        if (!order || !canChangeOrderStatus(order.status, status)) continue;
        try {
          const res = await fetch('/api/admin/orders', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status }),
          });
          const data = await res.json();
          if (res.ok && data.success) updatedIds.push(orderId);
        } catch { /* Keep failed orders selected; continue the remaining requests. */ }
      }
      await loadOrders();
      if (updatedIds.length) logAdminAction('Bulk Statut Commande Modifié', `${updatedIds.length} commandes passées au statut ${status}.`);
      showToast(`${updatedIds.length} commande(s) mise(s) à jour. ${selectedIds.length - updatedIds.length} non modifiée(s).`, updatedIds.length === selectedIds.length ? 'success' : 'warning');
    } catch {
      showToast('Les commandes n’ont pas pu être actualisées. Rechargez la liste avant de réessayer.', 'error');
    } finally {
      setIsDataLoading(false);
    }
    return updatedIds;
  }, [orders, loadOrders, logAdminAction, setIsDataLoading, showToast]);

  const handleDeleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    if (!currentUser?.role || !canDeleteOrders(currentUser.role as AdminRole)) {
      alert("Permission refusée : suppression réservée au propriétaire et aux administrateurs.");
      return false;
    }
    try {
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Erreur : " + (data.error || "Impossible de supprimer cette commande."));
        return false;
      }
      setOrders(previous => previous.filter(order => order.order_id !== orderId));
      logAdminAction(data.archived ? "Archivage Commande" : "Suppression Commande", `Commande ${orderId} ${data.archived ? "archivée" : "supprimée"}.`);
      return true;
    } catch {
      alert("Erreur réseau : la suppression n’a pas pu être confirmée. Actualisez les commandes avant de réessayer.");
      return false;
    }
  }, [currentUser?.role, setOrders, logAdminAction]);

  const handleRegisterShipping = useCallback(async (shippingData: {
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
    } catch {
      alert("Erreur de communication.");
      return null;
    }
  }, [currentUser?.role, loadOrders, logAdminAction]);

  const handleSyncCourierStatuses = useCallback(async () => {
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
  }, [logAdminAction, orders, setIsDataLoading, setOrders, settings.cathedisApiKey, settings.courierMode, settings.yalidineApiId, settings.yalidineApiKey]);

  const handleReconcileOrders = useCallback(async (reconciliations: any[]): Promise<boolean> => {
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
  }, [loadOrders, logAdminAction, setIsDataLoading]);

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

  const contextValue = useMemo(() => ({
    handleUpdateOrderStatus,
    handleBulkUpdateOrderStatus,
    handleDeleteOrder,
    handleRegisterShipping,
    handleSyncCourierStatuses,
    handleReconcileOrders,
    shippingStats
  }), [
    handleUpdateOrderStatus,
    handleBulkUpdateOrderStatus,
    handleDeleteOrder,
    handleRegisterShipping,
    handleSyncCourierStatuses,
    handleReconcileOrders,
    shippingStats
  ]);

  return (
    <AdminOrdersContext.Provider value={contextValue}>
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
