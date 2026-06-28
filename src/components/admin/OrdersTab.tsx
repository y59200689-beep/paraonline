'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Truck, 
  TrendingUp, 
  BarChart2, 
  ClipboardList, 
  Search, 
  FileText, 
  MessageSquare, 
  RefreshCw, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Printer, 
  X, 
  Command, 
  Trash2 
} from 'lucide-react';
import { useAdmin, Order, AbandonedCart } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';

export default function OrdersTab() {
  const {
    orders,
    setOrders,
    abandonedCarts,
    cartRecoveryStats,
    cartRecoveryStatus,
    shippingStats,
    adminTheme,
    currentUser,
    handleUpdateOrderStatus,
    handleBulkUpdateOrderStatus,
    handleDeleteOrder,
    handleRegisterShipping,
    handleSyncCourierStatuses,
    handleReconcileOrders,
    handleUpdateCartRecovery,
    logAdminAction
  } = useAdmin();

  const { settings } = useSettings();
  const { showToast } = useUi();

  // Reconciliation subtab states
  const [reconciliationFile, setReconciliationFile] = useState<File | null>(null);
  const [reconciliationRows, setReconciliationRows] = useState<any[]>([]);
  const [reconciliationFilter, setReconciliationFilter] = useState<'ALL' | 'PERFECT' | 'DISCREPANCY' | 'NOT_FOUND'>('ALL');
  const [isDragOver, setIsDragOver] = useState(false);
  const [reconciliationNotes, setReconciliationNotes] = useState<Record<string, string>>({});

  // Sub-tabs: 'list' | 'abandoned' | 'shipping' | 'reconciliation'
  const { ordersSubTab, setOrdersSubTab } = useAdminUI();

  // ── Sliding pill refs — Orders sub-tab bar ─────────────────────────────────
  const ordersPillRef = useRef<HTMLSpanElement>(null);
  const ordersBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ORDERS_TABS = ['list', 'abandoned', 'shipping', 'reconciliation'] as const;

  const moveOrdersPill = useCallback((idx: number, animate: boolean) => {
    const pill = ordersPillRef.current;
    const btn  = ordersBtnRefs.current[idx];
    if (!pill || !btn) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform  = `translateX(${btn.offsetLeft}px)`;
      pill.style.width      = `${btn.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width     = `${btn.offsetWidth}px`;
    }
  }, []);

  useEffect(() => {
    moveOrdersPill(0, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const idx = (ORDERS_TABS as readonly string[]).indexOf(ordersSubTab);
    if (idx !== -1) moveOrdersPill(idx, true);
  }, [ordersSubTab, moveOrdersPill]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onResize = () => {
      const idx = (ORDERS_TABS as readonly string[]).indexOf(ordersSubTab);
      if (idx !== -1) moveOrdersPill(idx, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ordersSubTab, moveOrdersPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search & Filters for list subtab
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Search & Filters for abandoned subtab
  const [abandonedSearchQuery, setAbandonedSearchQuery] = useState('');

  // Shipping subtab state
  const [shippingSearchQuery, setShippingSearchQuery] = useState('');
  const [shippingCourierFilter, setShippingCourierFilter] = useState('ALL');
  const [shippingStatusFilter, setShippingStatusFilter] = useState('ALL');
  const [reconciledOrders, setReconciledOrders] = useState<Record<string, boolean>>({});

  // Shipping integration panel state
  const [isShippingPanelOpen, setIsShippingPanelOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState('');
  const [shippingCodAmount, setShippingCodAmount] = useState(0);
  const [shippingCustomerName, setShippingCustomerName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<'yalidine' | 'cathedis'>('yalidine');
  const [isRegisteringShipping, setIsRegisteringShipping] = useState(false);
  const [isSyncingCouriers, setIsSyncingCouriers] = useState(false);

  // Print view A6 shipping label overlay state
  const [isPrintLabelOpen, setIsPrintLabelOpen] = useState(false);
  const [activeLabelData, setActiveLabelData] = useState<{
    orderId: string;
    courier: string;
    trackingNumber: string;
    pdfLabelUrl?: string;
    codAmount: number;
    customerName: string;
    phone: string;
    city: string;
    address: string;
    shippingDate: string;
  } | null>(null);

  // Filtered list memos
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.order_id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.phone_number.includes(orderSearchQuery) ||
        o.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
      
      if (orderStatusFilter === 'ALL') return matchesSearch;
      return matchesSearch && o.status.toUpperCase() === orderStatusFilter.toUpperCase();
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const filteredAbandonedCarts = useMemo(() => {
    return abandonedCarts.filter(c => {
      const q = abandonedSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    });
  }, [abandonedCarts, abandonedSearchQuery]);

  // CSV exports helpers
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val).replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  };

  const handleExportOrdersToCsv = (ordersToExport: Order[]) => {
    if (ordersToExport.length === 0) {
      showToast("Aucune commande à exporter.", 'warning');
      return;
    }
    const headers = ["Commande ID", "Date", "Statut", "Client", "Email", "Téléphone", "Ville", "Adresse", "Sous-Total", "Réduction", "Frais Port", "Total", "Articles"];
    const rows = ordersToExport.map(o => {
      const dateStr = new Date(o.created_at || o.date || Date.now()).toLocaleString('fr-FR');
      const itemsStr = o.items?.map(i => `${i.title} (x${i.quantity})`).join('; ') || '';
      const shippingCost = o.total - o.subtotal + o.discount_amount;
      return [
        o.order_id,
        dateStr,
        o.status,
        o.customer_name,
        '',
        o.phone_number,
        o.city,
        o.address,
        o.subtotal,
        o.discount_amount,
        shippingCost > 0 ? shippingCost : 0,
        o.total,
        itemsStr
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commandes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportShippingToCsv = (shippedOrders: Order[]) => {
    if (shippedOrders.length === 0) {
      showToast("Aucune expédition à exporter.", 'warning');
      return;
    }
    const headers = ["Commande ID", "Date", "Client", "Téléphone", "Ville", "Adresse", "Livreur", "N° Suivi", "Montant COD (DH)", "Statut Livraison", "Paiement Réconcilié"];
    const rows = shippedOrders.map(o => [
      o.order_id,
      new Date(o.created_at || o.date || Date.now()).toLocaleDateString('fr-FR'),
      o.customer_name,
      o.phone_number,
      o.city,
      o.address,
      o.courier || '',
      o.tracking_number || '',
      o.total,
      o.status,
      reconciledOrders[o.order_id] ? 'Oui' : 'Non'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expeditions_morocco_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportYalidineManifest = (ordersToExport: Order[]) => {
    if (ordersToExport.length === 0) {
      showToast("Aucune commande à exporter.", 'warning');
      return;
    }
    const headers = [
      "num_commande", "nom", "prenom", "telephone", "adresse", 
      "wilaya", "commune", "stop_desk", "cod", "remise_main", 
      "partage_gratuit", "produit"
    ];
    const rows = ordersToExport.map(o => {
      const parts = o.customer_name.split(' ');
      const firstname = parts[0] || o.customer_name;
      const familyname = parts.slice(1).join(' ') || 'Client';
      const itemsStr = o.items?.map(i => `${i.title} (x${i.quantity})`).join(', ') || '';
      
      return [
        o.order_id,
        familyname,
        firstname,
        o.phone_number,
        o.address,
        o.city,
        o.city, // commune defaulted to city
        0, // stop_desk
        o.total,
        1, // hand_delivery
        0, // free_sharing
        itemsStr
      ];
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manifeste_yalidine_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCathedisManifest = (ordersToExport: Order[]) => {
    if (ordersToExport.length === 0) {
      showToast("Aucune commande à exporter.", 'warning');
      return;
    }
    const headers = [
      "ref_client", "destinataire", "telephone", "adresse", 
      "ville", "cod", "poids", "dimensions", "type_envoi", "commune"
    ];
    const rows = ordersToExport.map(o => [
      o.order_id,
      o.customer_name,
      o.phone_number,
      o.address,
      o.city,
      o.total,
      0.5, // default weight 0.5kg
      "Standard", // dimensions
      "normal", // shipping type
      o.city // commune defaulted to city
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manifeste_cathedis_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp helper builders
  const buildWhatsAppLink = (order: Order, templateKey: 'pending' | 'shipped' | 'delivered', lang: 'Fr' | 'Ar' = 'Fr') => {
    const templates = settings?.notificationTemplates;
    if (!templates) return '#';
    const key = `${templateKey}${lang}` as keyof typeof templates;
    let msg = (templates[key] || '') as string;
    msg = msg
      .replace(/{customer_name}/g, order.customer_name)
      .replace(/{order_id}/g, order.order_id)
      .replace(/{tracking_link}/g, order.tracking_link || order.tracking_number || 'N/A');
    const phone = order.phone_number.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleNotifyWhatsApp = (order: Order, templateKey: 'pending' | 'shipped' | 'delivered', lang: 'Fr' | 'Ar' = 'Fr') => {
    const url = buildWhatsAppLink(order, templateKey, lang);
    window.open(url, '_blank');

    const nowStr = new Date().toISOString();
    logAdminAction('Notification WhatsApp', `Notification ${templateKey} (${lang}) envoyée au client de la commande ${order.order_id}`);

    // Update localStorage
    const local = localStorage.getItem('ordersBM');
    if (local) {
      const localOrders = JSON.parse(local) as any[];
      const updated = localOrders.map(o => o.order_id === order.order_id ? { ...o, notified_at: nowStr } : o);
      localStorage.setItem('ordersBM', JSON.stringify(updated));
    }

    // Update state in context
    setOrders(prev => prev.map(o => o.order_id === order.order_id ? { ...o, notified_at: nowStr } : o));
    if (selectedOrder && selectedOrder.order_id === order.order_id) {
      setSelectedOrder(prev => prev ? { ...prev, notified_at: nowStr } : null);
    }
  };

  const buildCartRecoveryLink = (cart: AbandonedCart, lang: 'Fr' | 'Ar' = 'Fr') => {
    const templates = settings?.notificationTemplates;
    if (!templates) return '#';
    const key = lang === 'Ar' ? 'recoveryAr' : 'recoveryFr';
    let msg = (templates[key] || '') as string;
    
    // Support both raw serializations: direct title or product.title
    const itemsStr = cart.items?.map((i: any) => i.title || i.product?.title || 'Produit').join(', ') || 'vos produits';
    const discountCode = (settings?.coupons?.[0]?.code) || 'BEAUTY10';
    
    // Construct dynamic recovery URL pointing to storefront checkout
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const recoverParams = cart.items?.map((i: any) => `${i.id || i.product?.id || ''}:${i.quantity || 1}`).filter(Boolean).join(',') || '';
    const recoveryUrl = recoverParams ? `${origin}/checkout?recover=${encodeURIComponent(recoverParams)}` : '';
    
    msg = msg
      .replace(/{customer_name}/g, cart.name || 'Cher(e) client(e)')
      .replace(/{cart_items}/g, itemsStr)
      .replace(/{cart_total}/g, String(cart.total || 0))
      .replace(/{discount_code}/g, discountCode)
      .replace(/{recovery_link}/g, recoveryUrl);
      
    const phone = (cart.phone || '').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Courier panels and action triggers
  const handleOpenShippingPanel = (order: Order) => {
    setShippingOrderId(order.order_id);
    setShippingCodAmount(order.total);
    setShippingCustomerName(order.customer_name);
    setShippingPhone(order.phone_number);
    setShippingCity(order.city);
    setShippingAddress(order.address);
    setSelectedCourier((settings.courierPartner as any) || 'yalidine');
    setIsShippingPanelOpen(true);
  };

  const handleRegisterShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'support') {
      showToast("Permission refusée : Le rôle Support n'a pas l'autorisation d'enregistrer des expéditions.", 'error');
      return;
    }
    setIsRegisteringShipping(true);
    try {
      const data = await handleRegisterShipping({
        orderId: shippingOrderId,
        courierName: selectedCourier,
        codAmount: shippingCodAmount,
        customerName: shippingCustomerName,
        phone: shippingPhone,
        city: shippingCity,
        address: shippingAddress
      });
      if (data) {
        setActiveLabelData(data.labelData || {
          orderId: shippingOrderId,
          courier: data.courier.toUpperCase(),
          trackingNumber: data.trackingNumber,
          pdfLabelUrl: data.pdfLabelUrl,
          codAmount: shippingCodAmount,
          customerName: shippingCustomerName,
          phone: shippingPhone,
          city: shippingCity,
          address: shippingAddress,
          shippingDate: new Date().toLocaleDateString('fr-FR')
        });
        setIsShippingPanelOpen(false);
        setIsPrintLabelOpen(true);

        if (selectedOrder && selectedOrder.order_id === shippingOrderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            status: 'Shipped',
            tracking_number: data.trackingNumber,
            tracking_link: data.trackingLink,
            courier: data.courier
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegisteringShipping(false);
    }
  };

  const handleSyncCourierStatusesSubmit = async () => {
    setIsSyncingCouriers(true);
    try {
      await handleSyncCourierStatuses();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingCouriers(false);
    }
  };

  const handleBulkUpdate = async (status: string) => {
    await handleBulkUpdateOrderStatus(status, selectedOrderIds);
    setSelectedOrderIds([]);
  };

  const handleCsvFileUpload = (file: File) => {
    setReconciliationFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        showToast("Le fichier CSV est vide ou invalide.", 'error');
        return;
      }

      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let curVal = '';
        let inQuotes = false;
        const separator = line.includes(';') ? ';' : ',';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            result.push(curVal.trim().replace(/^"|"$/g, ''));
            curVal = '';
          } else {
            curVal += char;
          }
        }
        result.push(curVal.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const headers = parseCsvLine(lines[0]).map(h => 
        h.toLowerCase()
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
         .replace(/[^a-z0-9_]/g, '_')
      );

      const idxOrder = headers.findIndex(h => h.includes('ref') || h.includes('cmd') || h.includes('commande') || h.includes('order') || h.includes('id_c') || h.includes('reference'));
      const idxTracking = headers.findIndex(h => h.includes('track') || h.includes('suivi') || h.includes('envoi') || h.includes('bar') || h.includes('colis'));
      const idxCod = headers.findIndex(h => h.includes('cod') || h.includes('amount') || h.includes('prix') || h.includes('paye') || h.includes('montant') || h.includes('valeur'));
      const idxFee = headers.findIndex(h => h.includes('fee') || h.includes('frais') || h.includes('tarif') || h.includes('charge') || h.includes('shipping') || h.includes('cout'));
      const idxStatus = headers.findIndex(h => h.includes('status') || h.includes('etat') || h.includes('statut'));

      if (idxOrder === -1 && idxTracking === -1) {
        showToast("Impossible de trouver la colonne Référence Commande ou Numéro de Suivi dans les en-têtes.", 'error');
        return;
      }

      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCsvLine(line);
        if (cells.length < Math.max(idxOrder, idxTracking) + 1) continue;

        const fileOrderId = idxOrder !== -1 ? cells[idxOrder] : '';
        const fileTracking = idxTracking !== -1 ? cells[idxTracking] : '';
        const fileCod = idxCod !== -1 ? parseFloat(cells[idxCod].replace(/[^0-9.]/g, '')) || 0 : 0;
        const fileFee = idxFee !== -1 ? parseFloat(cells[idxFee].replace(/[^0-9.]/g, '')) || 0 : 0;
        const fileStatusRaw = idxStatus !== -1 ? cells[idxStatus].toLowerCase() : '';

        let matchedOrder = orders.find(o => 
          (fileOrderId && o.order_id.toLowerCase() === fileOrderId.toLowerCase()) ||
          (fileOrderId && o.order_id.toLowerCase().replace('po-', '') === fileOrderId.toLowerCase()) ||
          (fileTracking && o.tracking_number && o.tracking_number.toLowerCase() === fileTracking.toLowerCase())
        );

        let matchType: 'PERFECT' | 'AMOUNT_MISMATCH' | 'STATUS_MISMATCH' | 'NOT_FOUND' | 'ALREADY_RECONCILED' = 'NOT_FOUND';
        let discrepancyMessage = '';

        if (matchedOrder) {
          if (matchedOrder.reconciled) {
            matchType = 'ALREADY_RECONCILED';
            discrepancyMessage = 'Déjà réconciliée';
          } else {
            let fileStatus: 'Delivered' | 'Returned' | 'Shipped' = matchedOrder.status as any;
            if (fileStatusRaw.includes('livr') || fileStatusRaw.includes('deliv') || fileStatusRaw.includes('recu') || fileStatusRaw.includes('success')) {
              fileStatus = 'Delivered';
            } else if (fileStatusRaw.includes('ret') || fileStatusRaw.includes('refus') || fileStatusRaw.includes('echec') || fileStatusRaw.includes('fail') || fileStatusRaw.includes('annul')) {
              fileStatus = 'Returned';
            }

            const isSystemReturned = matchedOrder.status === 'Returned';
            const isFileReturned = fileStatus === 'Returned';
            const isSystemDelivered = matchedOrder.status === 'Delivered';
            const isFileDelivered = fileStatus === 'Delivered';

            const statusMismatch = (isSystemReturned && isFileDelivered) || (isSystemDelivered && isFileReturned);

            const expectedCod = fileStatus === 'Returned' ? 0 : matchedOrder.total;
            const amountDiff = Math.abs(fileCod - expectedCod);
            const amountMismatch = amountDiff > 1;

            if (statusMismatch) {
              matchType = 'STATUS_MISMATCH';
              discrepancyMessage = `Statut différent: Système (${matchedOrder.status}) vs Fichier (${fileStatus})`;
            } else if (amountMismatch) {
              matchType = 'AMOUNT_MISMATCH';
              discrepancyMessage = `Écart montant: Commande (${expectedCod} DH) vs Reçu (${fileCod} DH)`;
            } else {
              matchType = 'PERFECT';
            }
          }
        }

        rows.push({
          id: `row_${i}`,
          fileOrderId,
          fileTracking,
          fileCod,
          fileFee,
          fileStatusRaw,
          matchedOrder,
          matchType,
          discrepancyMessage,
          resolvedStatus: matchedOrder ? (fileStatusRaw.includes('ret') || fileStatusRaw.includes('refus') ? 'Returned' : 'Delivered') : 'Delivered'
        });
      }

      setReconciliationRows(rows);
      showToast(`${rows.length} lignes analysées avec succès.`, 'success');
    };
    reader.readAsText(file);
  };

  const handleApproveReconciliation = async (orderId: string, row: any) => {
    const note = reconciliationNotes[orderId] || '';
    const success = await handleReconcileOrders([{
      orderId,
      settledAmount: row.fileCod,
      courierFee: row.fileFee,
      status: row.resolvedStatus,
      reconciliationNotes: note
    }]);

    if (success) {
      setReconciliationRows(prev => prev.map(r => 
        r.matchedOrder?.order_id === orderId 
          ? { ...r, matchType: 'ALREADY_RECONCILED', discrepancyMessage: 'Déjà réconciliée' } 
          : r
      ));
      showToast(`Commande ${orderId} réconciliée.`, 'success');
    }
  };

  const handleApproveAllPerfect = async () => {
    const perfectRows = reconciliationRows.filter(r => r.matchType === 'PERFECT' && r.matchedOrder);
    if (perfectRows.length === 0) {
      showToast("Aucune ligne parfaite à réconcilier.", 'warning');
      return;
    }

    if (confirm(`Voulez-vous réconcilier les ${perfectRows.length} commandes parfaites ?`)) {
      const payload = perfectRows.map(r => ({
        orderId: r.matchedOrder.order_id,
        settledAmount: r.fileCod,
        courierFee: r.fileFee,
        status: r.resolvedStatus,
        reconciliationNotes: reconciliationNotes[r.matchedOrder.order_id] || 'Rapprochement automatique (Perfect Match).'
      }));

      const success = await handleReconcileOrders(payload);
      if (success) {
        setReconciliationRows(prev => prev.map(r => {
          if (r.matchType === 'PERFECT') {
            return { ...r, matchType: 'ALREADY_RECONCILED', discrepancyMessage: 'Déjà réconciliée' };
          }
          return r;
        }));
        showToast(`${perfectRows.length} commandes réconciliées en lot avec succès.`, 'success');
      }
    }
  };

  const handleExportDiscrepancies = () => {
    const mismatchRows = reconciliationRows.filter(r => r.matchType === 'AMOUNT_MISMATCH' || r.matchType === 'STATUS_MISMATCH' || r.matchType === 'NOT_FOUND');
    if (mismatchRows.length === 0) {
      showToast("Aucun écart à exporter.", 'warning');
      return;
    }

    const headers = ["Commande ID", "N Suivi Colis", "Montant Regle Courier", "Frais Expedition Courier", "Type Ecart", "Explication", "Note Admin"];
    const rows = mismatchRows.map(r => [
      r.matchedOrder?.order_id || r.fileOrderId || 'Inconnu',
      r.matchedOrder?.tracking_number || r.fileTracking || 'Inconnu',
      r.fileCod,
      r.fileFee,
      r.matchType,
      r.discrepancyMessage || 'Non trouvé dans le système',
      reconciliationNotes[r.matchedOrder?.order_id] || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecarts_cod_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 admin-tab-enter">

      {/* Sub-tab navigation — sliding pill */}
      <div
        className={`relative flex flex-wrap items-center gap-0 border rounded-xl p-1 w-fit transition-all duration-200 ${
          adminTheme === 'light'
            ? 'bg-slate-100/80 border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
            : 'bg-slate-900/60 border-slate-900'
        }`}
        role="tablist"
      >
        {/* Animated sliding pill */}
        <span
          ref={ordersPillRef}
          aria-hidden="true"
          className="absolute left-1 top-1 pointer-events-none rounded-lg"
          style={{
            height: 'calc(100% - 8px)',
            background: adminTheme === 'light' ? '#ffffff' : 'hsl(224 18% 15%)',
            boxShadow: adminTheme === 'light'
              ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
              : '0 1px 6px rgba(0,0,0,0.3)',
            transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)',
            willChange: 'transform, width',
            zIndex: 0,
          }}
        />
        {([
          { id: 'list',           label: 'Commandes',          icon: ShoppingBag,  count: orders.length },
          { id: 'abandoned',      label: 'Paniers Abandonnés', icon: ShoppingCart, count: abandonedCarts.length },
          { id: 'shipping',       label: 'Expéditions & COD',  icon: Truck,        count: orders.filter(o => o.courier).length },
          { id: 'reconciliation', label: 'Rapprochement COD',  icon: DollarSign,   count: orders.filter(o => o.courier && !o.reconciled).length }
        ] as const).map((tab, idx) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              ref={el => { ordersBtnRefs.current[idx] = el; }}
              role="tab"
              aria-selected={ordersSubTab === tab.id}
              onClick={() => setOrdersSubTab(tab.id)}
              className={`relative z-10 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                ordersSubTab === tab.id
                  ? (adminTheme === 'light' ? 'text-slate-800 font-black' : 'text-emerald-400 font-black')
                  : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" /> {tab.label}
              <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full transition-colors ${
                adminTheme === 'light'
                  ? (ordersSubTab === tab.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85' : 'bg-slate-200/60 text-slate-500 border border-slate-300/30')
                  : 'bg-slate-700 text-slate-300'
              }`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* ---- ABANDONED CARTS FULL VIEW ---- */}
      {ordersSubTab === 'abandoned' && (
        <div className="space-y-5 t-panel">
          {/* Recovery KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CA Abandonné', value: `${cartRecoveryStats.totalAbandonedRevenue.toFixed(0)} DH`, color: 'text-rose-400', bg: 'from-rose-500/10 to-pink-500/10 border-rose-900/40', icon: ShoppingCart, lightColor: 'text-rose-600', lightBg: 'bg-rose-50' },
              { label: 'CA Récupéré', value: `${cartRecoveryStats.recoveredRevenue.toFixed(0)} DH`, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-900/40', icon: TrendingUp, lightColor: 'text-emerald-600', lightBg: 'bg-emerald-50' },
              { label: 'Taux de Récupération', value: `${cartRecoveryStats.rate}%`, color: 'text-amber-400', bg: 'from-amber-500/10 to-yellow-500/10 border-amber-900/40', icon: BarChart2, lightColor: 'text-amber-700', lightBg: 'bg-amber-50' },
              { label: 'Total Abandons', value: cartRecoveryStats.total, color: 'text-blue-400', bg: 'from-blue-500/10 to-indigo-500/10 border-blue-900/40', icon: ClipboardList, lightColor: 'text-blue-600', lightBg: 'bg-blue-50' },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className={`border rounded-2xl p-4 flex items-center gap-3 transition ${
                  adminTheme === 'light'
                    ? 'bg-white border-slate-200/80 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.03)]'
                    : `bg-gradient-to-br ${kpi.bg} border-slate-900`
                }`}>
                  <div className={`p-2.5 rounded-xl shrink-0 border transition ${
                    adminTheme === 'light'
                      ? `${kpi.lightBg} ${kpi.lightColor} border-transparent`
                      : `bg-slate-950 border border-slate-800/80 ${kpi.color}`
                  }`}><Icon className="w-4 h-4" /></div>
                  <div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</span>
                    <span className={`text-lg font-extrabold font-mono ${adminTheme === 'light' ? 'text-slate-900' : kpi.color}`}>{kpi.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status breakdown row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Non contactés', value: cartRecoveryStats.total - cartRecoveryStats.contacted - cartRecoveryStats.recovered, color: adminTheme === 'light' ? 'text-slate-600 font-bold' : 'text-slate-400', border: adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800' },
              { label: 'Contactés', value: cartRecoveryStats.contacted, color: adminTheme === 'light' ? 'text-amber-700' : 'text-amber-400', border: adminTheme === 'light' ? 'border-amber-200/60' : 'border-amber-900/40' },
              { label: 'Récupérés', value: cartRecoveryStats.recovered, color: adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400', border: adminTheme === 'light' ? 'border-emerald-200/60' : 'border-emerald-900/40' },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl p-3 text-center transition ${
                adminTheme === 'light'
                  ? 'bg-white shadow-sm'
                  : `bg-slate-900/40 ${s.border}`
              } ${adminTheme === 'light' ? s.border : ''}`}>
                <span className={`text-2xl font-extrabold font-mono block ${s.color}`}>{s.value}</span>
                <span className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search + table */}
          <div className={`border rounded-2xl overflow-hidden ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
            <div className={`flex items-center gap-3 p-4 border-b ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou téléphone..."
                  value={abandonedSearchQuery}
                  onChange={e => setAbandonedSearchQuery(e.target.value)}
                  className={`w-full text-xs outline-none focus:border-emerald-500/50 transition rounded-xl pl-9 pr-4 py-2 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
              <span className={`text-[10px] font-mono shrink-0 ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{filteredAbandonedCarts.length} résultats</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <th className="p-4">Client</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Articles</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                  {filteredAbandonedCarts.map((cart, idx) => {
                    const status = cartRecoveryStatus[cart.phone] || 'not_contacted';
                    const statusConfig = {
                      not_contacted: { label: 'Non contacté', cls: adminTheme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/60 text-slate-400 border-slate-700' },
                      contacted: { label: 'Contacté', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                      recovered: { label: 'Récupéré', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    };
                    const sc = statusConfig[status];
                    const detailsStr = cart.items?.map((item: any) => {
                      const title = item.title || item.product?.title || 'Produit';
                      const qty = item.quantity || 1;
                      const price = item.price || item.product?.price;
                      const priceStr = price ? ` (${price} DH)` : '';
                      return `${qty}x ${title}${priceStr}`;
                    }).join(', ') || '—';
                    const dateStr = cart.date ? new Date(cart.date).toLocaleDateString('fr-FR') : '—';
                    return (
                      <tr key={idx} className={`transition-colors ${adminTheme === 'light' ? 'hover:bg-slate-50/40' : 'hover:bg-slate-900/10'}`}>
                        <td className="p-4 font-bold">
                          <div className="flex flex-col gap-0.5">
                            <span>{cart.name || 'Anonyme'}</span>
                            <span className="text-[9.5px] text-slate-500 font-semibold select-none leading-none normal-case">
                              Compte : <span className={cart.clientProfileName ? 'text-indigo-500 font-bold' : 'text-rose-500 italic font-bold'}>{cart.clientProfileName || 'unavailable'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10px]">{cart.phone}</td>
                        <td className="p-4 italic text-[10px] max-w-[200px] truncate" title={detailsStr}>{detailsStr}</td>
                        <td className="p-4 font-extrabold font-mono">{cart.total} DH</td>
                        <td className="p-4 font-mono text-[10px]">{dateStr}</td>
                        <td className="p-4">
                          <select
                            value={status}
                            onChange={e => handleUpdateCartRecovery(cart.phone, e.target.value as any)}
                            onClick={e => e.stopPropagation()}
                            className={`text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-1 bg-transparent outline-none cursor-pointer transition ${sc.cls}`}
                          >
                            <option value="not_contacted">Non contacté</option>
                            <option value="contacted">Contacté</option>
                            <option value="recovered">Récupéré</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <a
                              href={buildCartRecoveryLink(cart, 'Fr')}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleUpdateCartRecovery(cart.phone, 'contacted')}
                              title="Envoyer rappel WhatsApp (FR)"
                              className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-1.5 rounded-lg hover:bg-emerald-900/30 transition"
                            >
                              <MessageSquare className="w-3 h-3" /> FR
                            </a>
                            <a
                              href={buildCartRecoveryLink(cart, 'Ar')}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleUpdateCartRecovery(cart.phone, 'contacted')}
                              title="Envoyer rappel WhatsApp (AR)"
                              className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2 py-1.5 rounded-lg hover:bg-blue-900/30 transition"
                            >
                              <MessageSquare className="w-3 h-3" /> AR
                            </a>
                            {status !== 'recovered' && (
                              <button
                                onClick={() => handleUpdateCartRecovery(cart.phone, 'recovered')}
                                title="Marquer comme récupéré"
                                className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-violet-950/40 text-violet-400 border border-violet-900/40 px-2 py-1.5 rounded-lg hover:bg-violet-900/30 transition cursor-pointer"
                              >
                                Récupéré
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAbandonedCarts.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 italic">Aucun panier abandonné trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- ORDERS LIST VIEW ---- */}
      {ordersSubTab === 'list' && (
        <div className="t-panel space-y-0">
          {/* Search and status controls */}
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200/80 shadow-sm'
              : 'bg-slate-900/30 border-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, client, téléphone, ville..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
              <button
                onClick={() => handleExportOrdersToCsv(filteredOrders)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <FileText className={`w-4 h-4 transition-colors ${
                  adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                }`} /> Exporter en CSV
              </button>
            </div>

            {/* Status filtering tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900/80">
              {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    orderStatusFilter === status
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700/50 shadow-sm'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'Tous' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders list table */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer w-4 h-4"
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(filteredOrders.map(o => o.order_id));
                          } else {
                            setSelectedOrderIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-4">ID Commande</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Dest./Ville</th>
                    <th className="p-4">Articles</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                  {filteredOrders.map((order, idx) => {
                    const dateObj = new Date(order.created_at || order.date || Date.now());
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                      delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    };
                    const sClean = order.status.toLowerCase();
                    const itemsText = order.items?.map(i => `${i.title} (x${i.quantity})`).join(', ');

                    return (
                      <tr 
                        key={order.order_id} 
                        className={`group border-l-2 border-l-transparent hover:border-l-emerald-500/60 hover:bg-slate-800/20 transition-all duration-150 cursor-pointer admin-row-enter`} 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-slate-700 bg-slate-950 focus:ring-0 cursor-pointer w-4 h-4"
                            checked={selectedOrderIds.includes(order.order_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                  setSelectedOrderIds(prev => [...prev, order.order_id]);
                              } else {
                                  setSelectedOrderIds(prev => prev.filter(id => id !== order.order_id));
                              }
                            }}
                          />
                        </td>
                        <td className="p-4 font-mono font-bold">
                          <div className="flex flex-col gap-1">
                            <span>{order.order_id}</span>
                            {order.notes?.includes('Ai Chat') && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 max-w-fit select-none">
                                Ai Chat
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10px]">{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="p-4">
                          <span className="font-bold block">{order.customer_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{order.phone_number}</span>
                        </td>
                        <td className="p-4 font-medium">{order.city}</td>
                        <td className="p-4 max-w-[180px] truncate text-slate-400 italic text-[11px]" title={itemsText}>
                          {itemsText || 'Aucun produit'}
                        </td>
                        <td className="p-4 font-extrabold font-mono">{order.total.toFixed(2)} DH</td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] uppercase font-black tracking-wider ${statusColors[sClean] || 'bg-slate-800 text-slate-400'}`}>
                              {order.status}
                            </span>
                            {sClean === 'confirmed' && (
                              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase text-emerald-500 tracking-wider">
                                ✓ Vérifié WA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end items-center">
                            {['pending', 'confirmed', 'shipped', 'delivered'].includes(sClean) && (
                              <button
                                onClick={() => handleNotifyWhatsApp(order, (sClean === 'confirmed' ? 'pending' : sClean) as any, 'Fr')}
                                title="Envoyer notification WhatsApp FR"
                                className="p-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900/30 rounded-lg transition cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="px-2 py-1 bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                            >
                              Ouvrir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <div className="flex flex-col items-center justify-center py-20 gap-3 max-w-[280px] mx-auto text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            adminTheme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900/60 text-slate-500'
                          }`}>
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold">
                            Aucune commande trouvée
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Ajustez vos filtres de recherche ou attendez les commandes de vos clients pour commencer à les traiter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB 3: MOROCCAN COD SHIPPING & RECONCILIATION HUB ---- */}
      {ordersSubTab === 'shipping' && (
        <div className="space-y-6 t-panel">
          
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                Suivi et Rapprochement Yalidine & Cathedis
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Mettez à jour les statuts de livraison et le rapprochement des paiements (COD).
              </p>
            </div>
            <button
              onClick={handleSyncCourierStatusesSubmit}
              disabled={isSyncingCouriers}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingCouriers ? 'animate-spin' : ''}`} />
              <span>{isSyncingCouriers ? 'Synchronisation...' : 'Synchroniser les Statuts'}</span>
            </button>
          </div>
          
          {/* Shipping KPI Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'COD Recouvré', 
                value: `${shippingStats.codRecouvre.toFixed(2)} DH`, 
                sub: `${shippingStats.delivered} colis livrés`,
                color: 'text-emerald-500', 
                bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-900/40', 
                icon: DollarSign, 
                lightColor: 'text-emerald-600 border-emerald-100', 
                lightBg: 'bg-emerald-50' 
              },
              { 
                label: 'COD En Transit', 
                value: `${shippingStats.codEnTransit.toFixed(2)} DH`, 
                sub: `${shippingStats.enTransit} colis expédiés`,
                color: 'text-blue-400', 
                bg: 'from-blue-500/10 to-indigo-500/10 border-blue-900/40', 
                icon: Truck, 
                lightColor: 'text-blue-600 border-blue-100', 
                lightBg: 'bg-blue-50' 
              },
              { 
                label: 'Taux de Retour', 
                value: `${shippingStats.returnRate}%`, 
                sub: `${shippingStats.returned} retours colis`,
                color: 'text-rose-500', 
                bg: 'from-rose-500/10 to-pink-500/10 border-rose-900/40', 
                icon: AlertTriangle, 
                lightColor: 'text-rose-600 border-rose-100', 
                lightBg: 'bg-rose-50' 
              },
              { 
                label: 'Taux de Succès', 
                value: `${shippingStats.successRate}%`, 
                sub: `Sur {shippingStats.total} expéditions`,
                color: 'text-amber-400', 
                bg: 'from-amber-500/10 to-yellow-500/10 border-amber-900/40', 
                icon: CheckCircle, 
                lightColor: 'text-amber-600 border-amber-100', 
                lightBg: 'bg-amber-50' 
              },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={i} 
                  className={`border rounded-2xl p-4 flex gap-3.5 items-center transition duration-200 anim-card-lift shadow-sm ${
                    adminTheme === 'light'
                      ? `bg-white border-slate-200/80`
                      : `bg-gradient-to-br ${kpi.bg} border-slate-900`
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 border transition ${
                    adminTheme === 'light'
                      ? `${kpi.lightBg} ${kpi.lightColor} border-transparent`
                      : `bg-slate-950 border border-slate-800/80 ${kpi.color}`
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>{kpi.label}</span>
                    <h3 className={`text-lg font-extrabold tracking-tight mt-0.5 font-mono tabular-nums ${
                      adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {kpi.value}
                    </h3>
                    <span className={`text-[9px] font-mono mt-0.5 block ${
                      adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                    }`}>{kpi.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters and search panel */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
          }`}>
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher ID, client, ville..."
                  value={shippingSearchQuery}
                  onChange={(e) => setShippingSearchQuery(e.target.value)}
                  className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-1.5 border ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              {/* Courier Filter */}
              <select
                value={shippingCourierFilter}
                onChange={(e) => setShippingCourierFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-1.5 border outline-none font-bold ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <option value="ALL">Toutes les messageries</option>
                <option value="yalidine">Yalidine</option>
                <option value="cathedis">Cathedis</option>
              </select>

              {/* Status Filter */}
              <select
                value={shippingStatusFilter}
                onChange={(e) => setShippingStatusFilter(e.target.value)}
                className={`text-xs rounded-xl px-3 py-1.5 border outline-none font-bold ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="Shipped">En Transit (Expédié)</option>
                <option value="Delivered">Livré</option>
                <option value="Returned">Retourné</option>
              </select>
            </div>

            {/* Export buttons group */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportShippingToCsv(
                  orders.filter(o => {
                    const isShipped = !!o.courier;
                    const matchCourier = shippingCourierFilter === 'ALL' || o.courier?.toLowerCase() === shippingCourierFilter;
                    const matchStatus = shippingStatusFilter === 'ALL' || o.status === shippingStatusFilter;
                    const matchText = shippingSearchQuery === '' || 
                      o.order_id.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.customer_name.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      (o.city || '').toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.phone_number.toLowerCase().includes(shippingSearchQuery.toLowerCase());
                    return isShipped && matchCourier && matchStatus && matchText;
                  })
                )}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> Exporter
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => {
                    const isShipped = !!o.courier;
                    const matchCourier = shippingCourierFilter === 'ALL' || o.courier?.toLowerCase() === shippingCourierFilter;
                    const matchStatus = shippingStatusFilter === 'ALL' || o.status === shippingStatusFilter;
                    const matchText = shippingSearchQuery === '' || 
                      o.order_id.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.customer_name.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      (o.city || '').toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.phone_number.toLowerCase().includes(shippingSearchQuery.toLowerCase());
                    return isShipped && matchCourier && matchStatus && matchText;
                  });
                  handleExportYalidineManifest(toExport);
                }}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                }`}
              >
                Manifeste Yalidine
              </button>

              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => {
                    const isShipped = !!o.courier;
                    const matchCourier = shippingCourierFilter === 'ALL' || o.courier?.toLowerCase() === shippingCourierFilter;
                    const matchStatus = shippingStatusFilter === 'ALL' || o.status === shippingStatusFilter;
                    const matchText = shippingSearchQuery === '' || 
                      o.order_id.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.customer_name.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      (o.city || '').toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                      o.phone_number.toLowerCase().includes(shippingSearchQuery.toLowerCase());
                    return isShipped && matchCourier && matchStatus && matchText;
                  });
                  handleExportCathedisManifest(toExport);
                }}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                  adminTheme === 'light'
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                Manifeste Cathedis
              </button>
            </div>
          </div>

          {/* Shipping reconciliation table */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
            adminTheme === 'light'
              ? 'bg-white border-slate-200 shadow-[0_4px_12px_-2px_rgba(15,30,54,0.03)]'
              : 'bg-slate-900/30 border-slate-900 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b transition-colors ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-4">Commande ID</th>
                    <th className="p-4">Client / Destination</th>
                    <th className="p-4">Messagerie</th>
                    <th className="p-4">N° de Suivi</th>
                    <th className="p-4">Montant COD</th>
                    <th className="p-4">Statut Colis</th>
                    <th className="p-4 text-center">Réconcilié</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${
                  adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'
                }`}>
                  {orders
                    .filter(o => {
                      const isShipped = !!o.courier;
                      const matchCourier = shippingCourierFilter === 'ALL' || o.courier?.toLowerCase() === shippingCourierFilter;
                      const matchStatus = shippingStatusFilter === 'ALL' || o.status === shippingStatusFilter;
                      const matchText = shippingSearchQuery === '' || 
                        o.order_id.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                        o.customer_name.toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                        (o.city || '').toLowerCase().includes(shippingSearchQuery.toLowerCase()) ||
                        o.phone_number.toLowerCase().includes(shippingSearchQuery.toLowerCase());
                      return isShipped && matchCourier && matchStatus && matchText;
                    })
                    .map((o) => {
                      const isReconciled = !!reconciledOrders[o.order_id];
                      
                      let statusBadge = (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-blue-50 border-blue-100 text-blue-700">
                          En Transit
                        </span>
                      );
                      if (o.status === 'Delivered') {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-emerald-50 border-emerald-100 text-emerald-700">
                            Livré
                          </span>
                        );
                      } else if (o.status === 'Returned') {
                        statusBadge = (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-rose-50 border-rose-100 text-rose-700">
                            Retourné
                          </span>
                        );
                      }

                      return (
                        <tr key={o.order_id} className={`transition-colors ${
                          adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                        }`}>
                          <td className="p-4">
                            <span className="font-mono font-extrabold cursor-pointer hover:underline text-emerald-600" onClick={() => setSelectedOrder(o)}>
                              #{o.order_id}
                            </span>
                            <span className={`text-[10px] block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                              {o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-extrabold block">{o.customer_name}</span>
                            <span className={`text-[10px] font-mono block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                              {o.phone_number} • {o.city}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] uppercase font-bold ${
                              o.courier?.toLowerCase() === 'yalidine'
                                ? (adminTheme === 'light' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-950/20 border-amber-900/30 text-amber-400')
                                : (adminTheme === 'light' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')
                            }`}>
                              {o.courier}
                            </span>
                          </td>
                          <td className="p-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span>{o.tracking_number || '—'}</span>
                              {o.tracking_link && (
                                <a 
                                  href={o.tracking_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`p-1 border rounded hover:scale-105 transition ${
                                    adminTheme === 'light' ? 'border-slate-200 text-slate-500 hover:bg-slate-100' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                                  }`}
                                  title="Suivre le colis"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-extrabold font-mono">
                            {o.total.toFixed(2)} DH
                          </td>
                          <td className="p-4">
                            {statusBadge}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setReconciledOrders(prev => ({ ...prev, [o.order_id]: !isReconciled }))}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isReconciled
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : (adminTheme === 'light' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-slate-950 text-slate-600 border-slate-800')
                              }`}
                              title={isReconciled ? "Paiement réconcilié avec le livreur" : "Marquer comme réconcilié"}
                            >
                              <CheckCircle className="w-4.5 h-4.5 fill-current" />
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {o.status === 'Shipped' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.order_id, 'Delivered')}
                                    className={`px-2 py-1 text-[9px] uppercase font-bold rounded-lg border cursor-pointer ${
                                      adminTheme === 'light'
                                        ? 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200/80 shadow-sm'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700'
                                    }`}
                                  >
                                    Livré
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.order_id, 'Returned')}
                                    className={`px-2 py-1 text-[9px] uppercase font-bold rounded-lg border cursor-pointer ${
                                      adminTheme === 'light'
                                        ? 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200/80 shadow-sm'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700'
                                    }`}
                                  >
                                    Retour
                                  </button>
                                </>
                              )}
                              {o.status !== 'Shipped' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.order_id, 'Shipped')}
                                  className={`px-2 py-1 text-[9px] uppercase font-bold rounded-lg border cursor-pointer ${
                                    adminTheme === 'light'
                                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
                                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                >
                                  En Transit
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenShippingPanel(o)}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                }`}
                                title="Imprimer étiquette"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {orders.filter(o => o.courier).length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                        Aucune expédition enregistrée pour le moment. Allez sur l'onglet Commandes pour expédier via Yalidine/Cathedis.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB 4: MOROCCAN COD FINANCIAL RECONCILIATION LEDGER ---- */}
      {ordersSubTab === 'reconciliation' && (
        <div className="space-y-6 t-panel">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                Rapprochement Financier des Settlements COD
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Téléversez les fichiers de virement Yalidine ou Cathedis pour auditer les paiements reçus et identifier les écarts.
              </p>
            </div>
            {reconciliationRows.length > 0 && (
              <button
                onClick={() => {
                  setReconciliationFile(null);
                  setReconciliationRows([]);
                  setReconciliationNotes({});
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition border ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-950 border-slate-850 hover:bg-slate-905 text-slate-300'
                }`}
              >
                Réinitialiser
              </button>
            )}
          </div>

          {reconciliationRows.length === 0 ? (
            /* Dropzone / Upload area */
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.name.endsWith('.csv')) {
                  handleCsvFileUpload(file);
                } else {
                  showToast("Veuillez déposer un fichier CSV valide.", 'error');
                }
              }}
              className={`p-12 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                isDragOver 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : (adminTheme === 'light' ? 'border-slate-200 hover:border-slate-350 bg-white' : 'border-slate-800 hover:border-slate-750 bg-slate-900/10')
              }`}
            >
              <div className={`p-4 rounded-full border transition ${
                adminTheme === 'light' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-slate-950 border-slate-850 text-slate-500'
              }`}>
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider">Fichier de règlement (Settlement)</h4>
                <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
                  Glissez-déposez le fichier CSV fourni par Yalidine ou Cathedis, ou cliquez sur le bouton ci-dessous pour le sélectionner.
                </p>
              </div>
              <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-[0.97]">
                <Search className="w-3.5 h-3.5" />
                Choisir un fichier CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCsvFileUpload(file);
                  }}
                />
              </label>
            </div>
          ) : (
            /* Ledger view */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Paiement Total Reçu',
                    value: `${reconciliationRows.filter(r => r.matchType === 'PERFECT').reduce((sum, r) => sum + r.fileCod, 0).toFixed(2)} DH`,
                    sub: `${reconciliationRows.filter(r => r.matchType === 'PERFECT').length} colis matchés`,
                    color: 'text-emerald-500',
                    bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-900/40',
                    icon: CheckCircle
                  },
                  {
                    label: 'Frais de Livraison Retenus',
                    value: `${reconciliationRows.reduce((sum, r) => sum + r.fileFee, 0).toFixed(2)} DH`,
                    sub: 'Payé au transporteur',
                    color: 'text-blue-400',
                    bg: 'from-blue-500/10 to-indigo-500/10 border-blue-900/40',
                    icon: Truck
                  },
                  {
                    label: 'Écarts & Discrepances',
                    value: `${reconciliationRows.filter(r => r.matchType === 'AMOUNT_MISMATCH' || r.matchType === 'STATUS_MISMATCH').length}`,
                    sub: `${reconciliationRows.filter(r => r.matchType === 'NOT_FOUND').length} non trouvés`,
                    color: 'text-rose-500',
                    bg: 'from-rose-500/10 to-pink-500/10 border-rose-900/40',
                    icon: AlertTriangle
                  },
                  {
                    label: 'Taux d\'Accord',
                    value: `${reconciliationRows.filter(r => r.matchType === 'PERFECT' || r.matchType === 'ALREADY_RECONCILED').length > 0 ? Math.round((reconciliationRows.filter(r => r.matchType === 'PERFECT' || r.matchType === 'ALREADY_RECONCILED').length / reconciliationRows.length) * 100) : 0}%`,
                    sub: 'Correspondance parfaite',
                    color: 'text-amber-400',
                    bg: 'from-amber-500/10 to-yellow-500/10 border-amber-900/40',
                    icon: TrendingUp
                  }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={i} 
                      className={`border rounded-2xl p-4 flex gap-3.5 items-center shadow-sm ${
                        adminTheme === 'light' ? 'bg-white border-slate-200/80' : `bg-gradient-to-br ${card.bg} border-slate-900`
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 border transition ${
                        adminTheme === 'light' ? 'bg-slate-50 text-slate-400 border-slate-200' : `bg-slate-950 border border-slate-800/80 ${card.color}`
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{card.label}</span>
                        <h3 className={`text-lg font-extrabold tracking-tight mt-0.5 font-mono tabular-nums ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{card.value}</h3>
                        <span className={`text-[9px] font-mono mt-0.5 block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{card.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 rounded-2xl border ${
                adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/30 border-slate-900'
              }`}>
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: 'Tous', count: reconciliationRows.length },
                    { id: 'PERFECT', label: 'Parfaits', count: reconciliationRows.filter(r => r.matchType === 'PERFECT').length },
                    { id: 'DISCREPANCY', label: 'Écarts', count: reconciliationRows.filter(r => r.matchType === 'AMOUNT_MISMATCH' || r.matchType === 'STATUS_MISMATCH').length },
                    { id: 'NOT_FOUND', label: 'Non Trouvés', count: reconciliationRows.filter(r => r.matchType === 'NOT_FOUND').length }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setReconciliationFilter(t.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition ${
                        reconciliationFilter === t.id
                          ? (adminTheme === 'light' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white')
                          : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-250 hover:bg-slate-800')
                      }`}
                    >
                      {t.label} ({t.count})
                    </button>
                  ))}
                </div>

                {/* Bulk and Export */}
                <div className="flex gap-2">
                  {reconciliationRows.some(r => r.matchType === 'PERFECT') && (
                    <button
                      onClick={handleApproveAllPerfect}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Tout Valider les Matchs Parfaits
                    </button>
                  )}
                  {reconciliationRows.some(r => r.matchType === 'AMOUNT_MISMATCH' || r.matchType === 'STATUS_MISMATCH') && (
                    <button
                      onClick={handleExportDiscrepancies}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        adminTheme === 'light' ? 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> Exporter les Écarts
                    </button>
                  )}
                </div>
              </div>

              {/* Ledger Table */}
              <div className={`border rounded-3xl overflow-hidden ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${
                        adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}>
                        <th className="p-4">Commande ID</th>
                        <th className="p-4">Messagerie</th>
                        <th className="p-4">N° de Suivi</th>
                        <th className="p-4">Montant Règl. (CSV)</th>
                        <th className="p-4">Montant Attendu (System)</th>
                        <th className="p-4">Frais (CSV)</th>
                        <th className="p-4">Statut (CSV vs System)</th>
                        <th className="p-4">Rapprochement</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${adminTheme === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-900 text-slate-300'}`}>
                      {reconciliationRows
                        .filter(r => {
                          if (reconciliationFilter === 'ALL') return true;
                          if (reconciliationFilter === 'PERFECT') return r.matchType === 'PERFECT';
                          if (reconciliationFilter === 'DISCREPANCY') return r.matchType === 'AMOUNT_MISMATCH' || r.matchType === 'STATUS_MISMATCH';
                          if (reconciliationFilter === 'NOT_FOUND') return r.matchType === 'NOT_FOUND';
                          return true;
                        })
                        .map((row) => {
                          const o = row.matchedOrder;
                          const isReconciled = row.matchType === 'ALREADY_RECONCILED';
                          const isPerfect = row.matchType === 'PERFECT';
                          
                          let statusBadge = (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-rose-50 border-rose-100 text-rose-700">
                              Non Trouvé
                            </span>
                          );
                          
                          if (isReconciled) {
                            statusBadge = (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-slate-50 border-slate-200 text-slate-450">
                                Réconcilié
                              </span>
                            );
                          } else if (isPerfect) {
                            statusBadge = (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-emerald-50 border-emerald-100 text-emerald-700">
                                Parfait
                              </span>
                            );
                          } else if (row.matchType === 'AMOUNT_MISMATCH') {
                            statusBadge = (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-amber-50 border-amber-250 text-amber-805">
                                Écart Montant
                              </span>
                            );
                          } else if (row.matchType === 'STATUS_MISMATCH') {
                            statusBadge = (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-purple-50 border-purple-200 text-purple-800">
                                Écart Statut
                              </span>
                            );
                          }

                          return (
                            <tr key={row.id} className={`transition-colors ${
                              adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                            }`}>
                              <td className="p-4 font-mono font-extrabold">
                                {o ? (
                                  <span className="cursor-pointer hover:underline text-emerald-600" onClick={() => setSelectedOrder(o)}>
                                    #{o.order_id}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">{row.fileOrderId || '—'}</span>
                                )}
                                {o && (
                                  <span className={`text-[10px] block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-550'}`}>
                                    {o.customer_name}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-[10px] uppercase">{o?.courier || '—'}</span>
                              </td>
                              <td className="p-4 font-mono">
                                {o?.tracking_number || row.fileTracking || '—'}
                              </td>
                              <td className="p-4 font-bold font-mono">
                                {row.fileCod.toFixed(2)} DH
                              </td>
                              <td className="p-4 font-mono">
                                {o ? `${o.total.toFixed(2)} DH` : '—'}
                              </td>
                              <td className="p-4 font-mono text-slate-500">
                                {row.fileFee.toFixed(2)} DH
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9.5px] uppercase font-semibold text-slate-500">Fichier:</span>
                                    <strong className="text-[10px]">{row.fileStatusRaw || 'LIVRE'}</strong>
                                  </div>
                                  {o && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9.5px] uppercase font-semibold text-slate-500">Système:</span>
                                      <strong className="text-[10px]">{o.status}</strong>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1.5">
                                  {statusBadge}
                                  {row.discrepancyMessage && (
                                    <span className="block text-[9.5px] font-mono text-rose-500 font-semibold leading-relaxed max-w-[200px]">
                                      {row.discrepancyMessage}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {o && !isReconciled && (
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        placeholder="Note..." 
                                        value={reconciliationNotes[o.order_id] || ''}
                                        onChange={(e) => setReconciliationNotes(prev => ({ ...prev, [o.order_id]: e.target.value }))}
                                        className={`px-2 py-1 text-[10px] rounded-lg border outline-none max-w-[120px] ${
                                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                                        }`}
                                      />
                                      <button
                                        onClick={() => handleApproveReconciliation(o.order_id, row)}
                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                                      >
                                        Réconcilier
                                      </button>
                                    </div>
                                  )}
                                  {isReconciled && (
                                    <span className="text-[10.5px] text-slate-405 font-bold flex items-center gap-1 justify-end">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Fait
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- DETAILS MODAL: SINGLE ORDER -------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-end z-45 select-none animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-screen p-6 space-y-6 relative overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close bar */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-black block tracking-wider bg-emerald-950/40 border border-emerald-900/30 rounded px-1.5 py-0.5 w-fit mb-1.5">Commande active</span>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5 font-mono">
                  {selectedOrder.order_id} 
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Shipping Timeline */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                <h4 className="text-[10px] font-bold text-slate-405 uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  Timeline d&apos;Expédition & Suivi COD
                </h4>
                <span className="text-[9px] font-mono text-slate-500">
                  Statut actuel: <span className="font-extrabold text-slate-300">{selectedOrder.status}</span>
                </span>
              </div>

              {(() => {
                const status = selectedOrder.status.toLowerCase();
                const creationDateStr = new Date(selectedOrder.created_at || selectedOrder.date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                
                let steps: { id: string; label: string; desc: string; active: boolean; done: boolean; isRed?: boolean; isOrange?: boolean; }[] = [
                  { id: 'pending', label: 'Enregistrée', desc: creationDateStr, active: true, done: ['pending', 'confirmed', 'shipped', 'delivered'].includes(status) },
                  { id: 'confirmed', label: 'Confirmée', desc: 'Validée par appel', active: ['confirmed', 'shipped', 'delivered'].includes(status), done: ['confirmed', 'shipped', 'delivered'].includes(status) },
                  { id: 'shipped', label: 'Expédiée', desc: selectedOrder.courier ? `${selectedOrder.courier.toUpperCase()}` : 'En transit', active: ['shipped', 'delivered'].includes(status), done: ['shipped', 'delivered'].includes(status) },
                  { id: 'delivered', label: 'Livrée', desc: 'Encaissée', active: status === 'delivered', done: status === 'delivered' }
                ];

                if (status === 'cancelled') {
                  steps = [
                    { id: 'pending', label: 'Enregistrée', desc: creationDateStr, active: true, done: true },
                    { id: 'cancelled', label: 'Annulée', desc: 'Par le staff', active: true, done: true, isRed: true }
                  ];
                } else if (status === 'returned') {
                  steps = [
                    { id: 'pending', label: 'Enregistrée', desc: creationDateStr, active: true, done: true },
                    { id: 'confirmed', label: 'Confirmée', desc: 'Validée par appel', active: true, done: true },
                    { id: 'shipped', label: 'Expédiée', desc: selectedOrder.courier ? `${selectedOrder.courier.toUpperCase()}` : 'En transit', active: true, done: true },
                    { id: 'returned', label: 'Retournée', desc: 'Retour dépôt', active: true, done: true, isOrange: true }
                  ];
                }

                return (
                  <div className="relative flex justify-between items-start pt-2 px-2">
                    {/* Connecting line */}
                    <div className="absolute top-[14px] left-[35px] right-[35px] h-0.5 bg-slate-900 z-0">
                      {/* Progress highlight line */}
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" 
                        style={{ 
                          width: `${
                            steps.filter(s => s.done).length === steps.length 
                              ? 100 
                              : ((steps.filter(s => s.done).length - 1) / Math.max(1, steps.length - 1)) * 100
                          }%` 
                        }}
                      />
                    </div>

                    {/* Timeline items */}
                    {steps.map((step, idx) => {
                      const isDone = step.done;
                      const isActive = step.active;
                      
                      let circleColor = 'border-slate-800 bg-slate-950 text-slate-650';
                      if (isDone) {
                        if (step.isRed) {
                          circleColor = 'border-rose-500 bg-rose-950 text-rose-400 ring-4 ring-rose-500/10';
                        } else if (step.isOrange) {
                          circleColor = 'border-amber-500 bg-amber-950 text-amber-400 ring-4 ring-amber-500/10';
                        } else {
                          circleColor = 'border-emerald-500 bg-emerald-950 text-emerald-400 ring-4 ring-emerald-500/10';
                        }
                      } else if (isActive) {
                        circleColor = 'border-blue-500 bg-blue-950 text-blue-400 ring-4 ring-blue-500/10';
                      }

                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center text-center max-w-[90px] group">
                          {/* Dot */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all duration-300 ${circleColor}`}>
                            {isDone ? (
                              step.isRed ? '✕' : step.isOrange ? '↩' : '✓'
                            ) : (
                              idx + 1
                            )}
                          </div>
                          
                          {/* Labels */}
                          <span className={`text-[10px] font-bold mt-2 leading-tight transition-colors duration-300 ${
                            isDone 
                              ? (step.isRed ? 'text-rose-400' : step.isOrange ? 'text-amber-400' : 'text-emerald-400') 
                              : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-[8.5px] text-slate-500 leading-snug font-mono mt-0.5 whitespace-pre-wrap max-w-[80px]">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Split layout: customer info & order details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Column */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-900/60 pb-1.5">Coordonnées Client</h4>
                  
                  <div className="text-xs space-y-1 font-light">
                    <strong className="text-slate-200 block font-semibold text-sm">{selectedOrder.customer_name}</strong>
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-400 font-mono">{selectedOrder.phone_number}</span>
                      <a 
                        href={`https://wa.me/${selectedOrder.phone_number.trim()}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 text-[10px] font-extrabold uppercase"
                      >
                        WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{selectedOrder.address}, <strong className="font-bold">{selectedOrder.city}</strong></p>
                  </div>
                </div>

                {/* Order notes / Special instructions */}
                {selectedOrder.notes && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2.5">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block border-b border-slate-900/60 pb-1.5 flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-amber-500" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Instructions Spéciales / Note
                    </h4>
                    <p className="text-xs text-slate-300 font-light whitespace-pre-wrap italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/50">
                      "{selectedOrder.notes}"
                    </p>
                  </div>
                )}

                {/* Skin diagnostic metadata info if exists */}
                {selectedOrder.skin_diagnostic ? (
                  <div className="bg-gradient-to-tr from-violet-950/20 to-indigo-950/20 p-4 rounded-2xl border border-indigo-900/40 space-y-2">
                    <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block border-b border-indigo-900/60 pb-1">Bilan Routine Diagnostic IA</h4>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center text-slate-300">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 block">Peau</span>
                        <strong className="font-extrabold text-indigo-400 uppercase">{selectedOrder.skin_diagnostic.skinType}</strong>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 block">Problème</span>
                        <strong className="font-extrabold text-indigo-400 uppercase">{selectedOrder.skin_diagnostic.concern}</strong>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-900">
                        <span className="text-slate-500 block">Soleil</span>
                        <strong className="font-extrabold text-indigo-400 uppercase">{selectedOrder.skin_diagnostic.sunExposure}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 italic text-center">
                    Aucun historique de diagnostic lié à cette commande.
                  </div>
                )}

                {/* Courier / Shipping Tracking Details */}
                {selectedOrder.tracking_number ? (
                  <div className="bg-indigo-950/15 border border-indigo-900/40 rounded-2xl p-4 space-y-2 text-xs">
                    <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block border-b border-indigo-900/60 pb-1">Logistique Messagerie</h4>
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Livreur:</span>
                        <strong className="text-slate-200 uppercase">{selectedOrder.courier}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Code Suivi:</span>
                        <strong className="text-slate-200">{selectedOrder.tracking_number}</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <a 
                          href={selectedOrder.tracking_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 font-bold"
                        >
                          Suivre sur la plateforme <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveLabelData({
                            orderId: selectedOrder.order_id,
                            courier: selectedOrder.courier?.toUpperCase() || '',
                            trackingNumber: selectedOrder.tracking_number || '',
                            codAmount: selectedOrder.total,
                            customerName: selectedOrder.customer_name,
                            phone: selectedOrder.phone_number,
                            city: selectedOrder.city,
                            address: selectedOrder.address,
                            shippingDate: new Date().toLocaleDateString('fr-FR')
                          });
                          setIsPrintLabelOpen(true);
                        }}
                        className="w-full py-1.5 bg-indigo-950/50 border border-indigo-900 text-indigo-300 hover:text-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Réimprimer l&apos;étiquette A6
                      </button>
                    </div>
                  </div>
                ) : (
                  selectedOrder.status.toLowerCase() === 'confirmed' && (
                    <button
                      onClick={() => handleOpenShippingPanel(selectedOrder)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-slate-950" /> Enregistrer l&apos;expédition Maroc
                    </button>
                  )
                )}
              </div>

              {/* Items / Prices Column */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-900/60 pb-1.5">Articles Commandés</h4>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs gap-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200 block truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Qte: {item.quantity} • {item.price} DH / u</span>
                        </div>
                        <span className="font-bold text-slate-300 shrink-0 font-mono">{(item.price * item.quantity).toFixed(0)} DH</span>
                      </div>
                    ))}
                    {selectedOrder.gift_item && (
                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-900 text-emerald-400 font-light italic">
                        <span>Cadeau: {selectedOrder.gift_item}</span>
                        <span className="font-mono">OFFERT</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-3 space-y-1 font-mono text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Sous-Total:</span>
                      <span className="text-slate-300">{selectedOrder.subtotal.toFixed(2)} DH</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-rose-400">
                        <span>Réduction ({selectedOrder.applied_coupon || 'Quiz'}):</span>
                        <span>-{selectedOrder.discount_amount.toFixed(2)} DH</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Frais d&apos;expédition:</span>
                      <span className="text-slate-300">{(selectedOrder.total - selectedOrder.subtotal + selectedOrder.discount_amount > 0 ? (selectedOrder.total - selectedOrder.subtotal + selectedOrder.discount_amount) : 0).toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-200 border-t border-slate-900/60 pt-2">
                      <span>TOTAL COMMANDE:</span>
                      <span className="text-emerald-400 font-extrabold">{selectedOrder.total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>

                {/* Status selector */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Modifier le Statut Commande</label>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.order_id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="Pending">Pending (En attente confirmation)</option>
                    <option value="Confirmed">Confirmed (Confirmé par téléphone)</option>
                    <option value="Shipped">Shipped (Expédié / Colis en transit)</option>
                    <option value="Delivered">Delivered (Livré & Encaissé)</option>
                    <option value="Cancelled">Cancelled (Annulé)</option>
                  </select>
                </div>

                {/* WhatsApp Notification Center */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Notification Client (WhatsApp)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Confirmation */}
                    <div className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-900 bg-slate-900/40 gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-300">Confirmation</span>
                      <div className="flex gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'pending', 'Fr')}
                          className="flex-1 py-1 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/30 border border-emerald-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          FR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'pending', 'Ar')}
                          className="flex-1 py-1 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/30 border border-emerald-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          AR
                        </button>
                      </div>
                    </div>

                    {/* Expédition */}
                    <div className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-900 bg-slate-900/40 gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-300">Expédition</span>
                      <div className="flex gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'shipped', 'Fr')}
                          className="flex-1 py-1 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900/30 border border-indigo-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          FR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'shipped', 'Ar')}
                          className="flex-1 py-1 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900/30 border border-indigo-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          AR
                        </button>
                      </div>
                    </div>

                    {/* Livraison */}
                    <div className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-900 bg-slate-900/40 gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-300">Livraison</span>
                      <div className="flex gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'delivered', 'Fr')}
                          className="flex-1 py-1 bg-teal-950/40 text-teal-400 hover:bg-teal-900/30 border border-teal-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          FR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNotifyWhatsApp(selectedOrder, 'delivered', 'Ar')}
                          className="flex-1 py-1 bg-teal-950/40 text-teal-400 hover:bg-teal-900/30 border border-teal-900/30 rounded-lg text-[9px] font-bold transition text-center cursor-pointer"
                        >
                          AR
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.notified_at && (
                    <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-900/50 pt-1.5">
                      <span>Dernière notification :</span>
                      <span>{new Date(selectedOrder.notified_at).toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <button 
                onClick={() => handleDeleteOrder(selectedOrder.order_id)}
                className="text-rose-400 hover:text-rose-300 font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer la commande
              </button>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold uppercase rounded-xl border border-slate-700 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SHIPPING INTEGRATION REGISTRATION SIDEBAR/MODAL -------------------- */}
      {isShippingPanelOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-end z-45 select-none animate-in fade-in duration-200"
          onClick={() => setIsShippingPanelOpen(false)}
        >
          <form 
            onSubmit={handleRegisterShippingSubmit} 
            className={`border-l w-full max-w-md h-screen p-6 space-y-6 relative shadow-2xl overflow-y-auto transition-all duration-200 animate-in slide-in-from-right duration-300 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center border-b pb-3 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>Enregistrer l&apos;Expédition (Maroc)</h3>
                <span className={`text-[10px] font-light block ${
                  adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Commande {shippingOrderId}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsShippingPanelOpen(false)} 
                className={`transition-colors cursor-pointer ${
                  adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Sélectionner le Livreur Marocain</label>
                <select 
                  value={selectedCourier} 
                  onChange={(e) => setSelectedCourier(e.target.value as any)}
                  className={`w-full rounded-xl px-3 py-2.5 border transition outline-none cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                  }`}
                >
                  <option value="yalidine">YALIDINE EXPRESS</option>
                  <option value="cathedis">CATHEDIS LOGISTICS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Montant COD à Collecter (DH)</label>
                <input 
                  type="number" 
                  value={shippingCodAmount} 
                  onChange={(e) => setShippingCodAmount(Number(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2.5 font-mono text-right font-bold border transition outline-none ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                  }`} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Destinataire Nom</label>
                <input 
                  type="text" 
                  value={shippingCustomerName} 
                  onChange={(e) => setShippingCustomerName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 border transition outline-none ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                  }`} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Téléphone WhatsApp</label>
                <input 
                  type="text" 
                  value={shippingPhone} 
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 font-mono border transition outline-none ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                  }`} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Ville de Livraison</label>
                  <input 
                    type="text" 
                    value={shippingCity} 
                    onChange={(e) => setShippingCity(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 border transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                    }`} 
                    required 
                  />
                  {(() => {
                    const rule = (settings.shippingRules || []).find(
                      (r) => r.city.toLowerCase() === shippingCity.toLowerCase().trim()
                    );
                    if (rule) {
                      return (
                        <p className="text-[9px] text-emerald-500 font-semibold mt-1">
                          Zone: {rule.fee} DH (Gratuit dès {rule.freeThreshold ? `${rule.freeThreshold} DH` : 'N/A'}).
                        </p>
                      );
                    }
                    return (
                      <p className="text-[9px] text-slate-500 mt-1">
                        Tarif général: {settings.shippingFee} DH.
                      </p>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Adresse Complète</label>
                  <input 
                    type="text" 
                    value={shippingAddress} 
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 border transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500/50'
                    }`} 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t flex justify-end gap-2 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <button 
                type="button" 
                onClick={() => setIsShippingPanelOpen(false)} 
                className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isRegisteringShipping}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
              >
                {isRegisteringShipping ? 'Enregistrement...' : 'Générer Bordereau & Colis'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- PRINT VIEW OVERLAY: A6 SHIPPING LABEL -------------------- */}
      {isPrintLabelOpen && activeLabelData && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none print:bg-white print:p-0 print:inset-auto print:absolute">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl print:bg-white print:border-0 print:p-0 print:shadow-none print-label-container">
            
            {/* Header: Courier info */}
            <div className="border border-slate-700 p-4 rounded-2xl bg-white text-slate-950 space-y-4 print:border-slate-950">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 print:border-slate-400">
                <span className="font-black text-sm tracking-tight">{settings?.storeName || 'PARA OFFICINAL S.A'}</span>
                <span className="bg-slate-950 text-white font-mono text-[9px] px-2 py-0.5 rounded font-black tracking-widest uppercase print:bg-black print:text-white">
                  {activeLabelData.courier}
                </span>
              </div>

              {/* Barcode simulation */}
              <div className="space-y-1 text-center font-mono">
                <div className="flex justify-center gap-0.5 overflow-hidden py-1">
                  {[...Array(32)].map((_, idx) => {
                    const width = (idx % 3 === 0) ? 'w-1' : (idx % 5 === 0 ? 'w-2' : 'w-0.5');
                    const color = (idx % 7 === 0) ? 'bg-transparent' : 'bg-slate-950';
                    return <div key={idx} className={`h-12 ${width} ${color}`} />;
                  })}
                </div>
                <span className="text-[10px] block font-bold text-slate-700 tracking-widest">{activeLabelData.trackingNumber}</span>
              </div>

              {/* Address details */}
              <div className="space-y-2 text-[10px] leading-relaxed border-t border-b border-slate-200 py-3 print:border-slate-300">
                <div>
                  <span className="text-slate-500 block uppercase font-extrabold text-[8px]">Destinataire:</span>
                  <strong className="text-xs font-black block">{activeLabelData.customerName}</strong>
                  <span className="font-mono block font-bold">{activeLabelData.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-extrabold text-[8px]">Adresse de livraison:</span>
                  <p className="font-medium text-slate-800">{activeLabelData.address}, <strong className="font-extrabold uppercase text-slate-950">{activeLabelData.city}</strong></p>
                </div>
              </div>

              {/* Footer: COD amount block */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-extrabold text-[8px] block">Date d&apos;expédition:</span>
                  <span className="font-mono font-bold text-slate-700">{activeLabelData.shippingDate}</span>
                </div>
                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 text-center shrink-0 min-w-[120px] print:border-slate-400">
                  <span className="text-slate-500 uppercase font-extrabold text-[8px] block">Collecte Cash COD:</span>
                  <strong className="text-sm font-black text-slate-950 font-mono">{activeLabelData.codAmount.toFixed(2)} DH</strong>
                </div>
              </div>
            </div>

            {/* Print trigger block */}
            <div className="flex gap-2 justify-end print:hidden">
              <button 
                type="button" 
                onClick={() => { setIsPrintLabelOpen(false); setActiveLabelData(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Fermer
              </button>
              {activeLabelData.pdfLabelUrl && (
                <a 
                  href={activeLabelData.pdfLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" /> PDF Officiel
                </a>
              )}
              <button 
                type="button" 
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 transition flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-950" /> Imprimer l&apos;étiquette A6
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar for Orders */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-scale-up">
          <div className={`backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-200 ${
            adminTheme === 'light'
              ? 'bg-white/90 border-slate-200 text-slate-800'
              : 'bg-slate-950/90 border-emerald-500/30 text-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-mono font-bold ${
                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {selectedOrderIds.length} commande(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleBulkUpdate('Confirmed')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Confirmer
              </button>
              <button
                onClick={() => handleBulkUpdate('Shipped')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Expédier
              </button>
              <button
                onClick={() => handleBulkUpdate('Cancelled')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => selectedOrderIds.includes(o.order_id));
                  handleExportOrdersToCsv(toExport);
                }}
                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Exporter (CSV)
              </button>
              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => selectedOrderIds.includes(o.order_id));
                  handleExportYalidineManifest(toExport);
                }}
                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer border ${
                  adminTheme === 'light'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shadow-sm'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                }`}
              >
                Yalidine CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => selectedOrderIds.includes(o.order_id));
                  handleExportCathedisManifest(toExport);
                }}
                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer border ${
                  adminTheme === 'light'
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                Cathedis CSV
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className={`px-2.5 py-1.5 bg-transparent font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer ${
                  adminTheme === 'light'
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                Désélectionner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
