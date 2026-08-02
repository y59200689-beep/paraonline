'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Trash2,
  ArrowLeft,
  Phone,
  User,
  Copy,
  Plus,
  Minus,
  Gift,
  CreditCard,
  Wallet,
  Zap,
  Activity,
  Send,
  KanbanSquare,
  List,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAdmin, Order, AbandonedCart } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { PRODUCTS_DB } from '@/lib/data';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import { StatusBadge } from '@/components/admin/ui';

const ORDER_STATUS_OPTIONS = [
  { value: 'Pending', label: 'En attente', detail: 'Confirmation à effectuer', color: '#d97706', tint: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
  { value: 'Confirmed', label: 'Confirmée', detail: 'Prête à être préparée', color: '#2563eb', tint: 'rgba(37,99,235,0.11)', border: 'rgba(37,99,235,0.24)' },
  { value: 'Shipped', label: 'Expédiée', detail: 'En transit vers le client', color: '#4f46e5', tint: 'rgba(79,70,229,0.11)', border: 'rgba(79,70,229,0.24)' },
  { value: 'Delivered', label: 'Livrée', detail: 'Commande finalisée', color: '#059669', tint: 'rgba(5,150,105,0.11)', border: 'rgba(5,150,105,0.24)' },
  { value: 'Cancelled', label: 'Annulée', detail: 'Commande annulée', color: '#e11d48', tint: 'rgba(225,29,72,0.10)', border: 'rgba(225,29,72,0.24)' },
  { value: 'Returned', label: 'Retournée', detail: 'Retour ou échec de livraison', color: '#ea580c', tint: 'rgba(234,88,12,0.10)', border: 'rgba(234,88,12,0.24)' },
] as const;

function OrderStatusPicker({ value, onChange, isDark = false, compact = false }: { value: string; onChange: (value: string) => void; isDark?: boolean; compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'top' | 'bottom' });
  const current = ORDER_STATUS_OPTIONS.find(option => option.value === value) || ORDER_STATUS_OPTIONS[0];

  const positionMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = 280;
    const estimatedHeight = 350;
    const viewportPadding = 12;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight && rect.top > estimatedHeight;
    setMenuPosition({
      top: openAbove ? Math.max(viewportPadding, rect.top - estimatedHeight - 8) : Math.min(window.innerHeight - estimatedHeight - viewportPadding, rect.bottom + 8),
      left: Math.max(viewportPadding, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding)),
      placement: openAbove ? 'top' : 'bottom',
    });
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [isOpen, positionMenu]);

  return (
    <div ref={triggerRef} className="inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) positionMenu();
          setIsOpen(open => !open);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 rounded-lg border font-extrabold transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-2 text-[11px]'}`}
        style={{ background: current.tint, color: current.color, borderColor: current.border }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: current.color }} />
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Choisir le statut de la commande"
          className="fixed z-[100] w-[280px] overflow-hidden rounded-2xl border p-2 shadow-[0_24px_60px_rgba(15,30,54,0.22)]"
          style={{ top: menuPosition.top, left: menuPosition.left, background: isDark ? 'hsl(224,25%,10%)' : '#fdfefe', borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,30,54,0.14)' }}
        >
          <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Statut de la commande</p>
              <p className={`mt-0.5 text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Choisissez la prochaine étape</p>
            </div>
            <span className="h-2 w-2 rounded-full" style={{ background: current.color, boxShadow: `0 0 0 4px ${current.tint}` }} />
          </div>
          <div className="border-t pt-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,30,54,0.07)' }}>
            {ORDER_STATUS_OPTIONS.map(option => {
              const isCurrent = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    if (!isCurrent) onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5"
                  style={isCurrent ? { background: option.tint } : undefined}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: option.color, boxShadow: `0 0 0 4px ${option.tint}` }} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[11px] font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{option.label}</span>
                    <span className="block truncate text-[9.5px] font-medium text-slate-500">{option.detail}</span>
                  </span>
                  {isCurrent && <Check className="h-4 w-4 shrink-0" style={{ color: option.color }} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function OrdersTab() {
  const {
    products,
    orders,
    setOrders,
    abandonedCarts,
    cartRecoveryStats,
    cartRecoveryStatus,
    shippingStats,
    adminTheme,
    currentUser,
    isDataLoading,
    loadOrders,
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
  const [staffNotesMap, setStaffNotesMap] = useState<Record<string, string>>({});
  const [staffNoteInputs, setStaffNoteInputs] = useState<Record<string, string>>({});
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);
  const [isPrintInvoiceOpen, setIsPrintInvoiceOpen] = useState<boolean>(false);
  const [isPrintPackingSlipOpen, setIsPrintPackingSlipOpen] = useState<boolean>(false);
  const [settledOrdersMap, setSettledOrdersMap] = useState<Record<string, boolean>>({});
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState<boolean>(false);
  const [customGiftInput, setCustomGiftInput] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [isBatchLabelPrintOpen, setIsBatchLabelPrintOpen] = useState<boolean>(false);
  const [isRetryingAtlascom, setIsRetryingAtlascom] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sub-tabs: 'list' | 'abandoned' | 'shipping' | 'reconciliation'
  const { ordersSubTab, setOrdersSubTab, spotlightTarget, setSpotlightTarget } = useAdminUI();

  useEffect(() => {
    if (spotlightTarget?.type !== 'order') return;

    const order = orders.find(item => item.order_id === spotlightTarget.id);
    if (order) {
      setOrdersSubTab('list');
      setSelectedOrder(order);
    }
    setSpotlightTarget(null);
  }, [orders, setOrdersSubTab, setSpotlightTarget, spotlightTarget]);

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
  const [orderPresentation, setOrderPresentation] = useState<'table' | 'board'>('table');
  const hasRestoredOrderFromUrl = useRef(false);
  const hasOpenedOrderDetail = useRef(false);

  // Keep the detail view addressable so a browser refresh restores the same order.
  useEffect(() => {
    if (hasRestoredOrderFromUrl.current || isDataLoading || orders.length === 0) return;

    const orderId = new URLSearchParams(window.location.search).get('order');
    if (!orderId) {
      hasRestoredOrderFromUrl.current = true;
      return;
    }

    const order = orders.find(item => item.order_id === orderId);
    if (!order) return;

    hasRestoredOrderFromUrl.current = true;
    hasOpenedOrderDetail.current = true;
    setOrdersSubTab('list');
    setSelectedOrder(order);
  }, [isDataLoading, orders, setOrdersSubTab]);

  useEffect(() => {
    const selectedOrderId = selectedOrder?.order_id;
    const url = new URL(window.location.href);
    const orderIdInUrl = url.searchParams.get('order');

    if (selectedOrderId) {
      hasOpenedOrderDetail.current = true;
      if (orderIdInUrl !== selectedOrderId) {
        url.searchParams.set('order', selectedOrderId);
        window.history.pushState({}, '', url);
      }
      return;
    }

    if (hasOpenedOrderDetail.current && orderIdInUrl) {
      url.searchParams.delete('order');
      window.history.pushState({}, '', url);
    }
  }, [selectedOrder?.order_id]);

  useEffect(() => {
    const restoreOrderFromHistory = () => {
      const orderId = new URLSearchParams(window.location.search).get('order');
      if (!orderId) {
        setSelectedOrder(null);
        return;
      }

      const order = orders.find(item => item.order_id === orderId);
      if (order) {
        hasOpenedOrderDetail.current = true;
        setOrdersSubTab('list');
        setSelectedOrder(order);
      }
    };

    window.addEventListener('popstate', restoreOrderFromHistory);
    return () => window.removeEventListener('popstate', restoreOrderFromHistory);
  }, [orders, setOrdersSubTab]);

  const selectedOrderId = selectedOrder?.order_id;
  useEffect(() => {
    if (!selectedOrderId) return;
    const refreshedOrder = orders.find(order => order.order_id === selectedOrderId);
    if (!refreshedOrder) return;
    setSelectedOrder(current => current?.order_id === selectedOrderId && current !== refreshedOrder
      ? refreshedOrder
      : current);
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrder?.atlascom_export?.status !== 'sending') return;

    const refreshAtlascomStatus = () => void loadOrders();
    refreshAtlascomStatus();
    const interval = window.setInterval(refreshAtlascomStatus, 3_000);
    return () => window.clearInterval(interval);
  }, [loadOrders, selectedOrder?.atlascom_export?.status]);

  useEffect(() => {
    const openOrdersList = () => {
      setSelectedOrder(null);
      setOrdersSubTab('list');
      setOrderPresentation('table');
      setSelectedOrderIds([]);
    };
    window.addEventListener('admin:open-orders-list', openOrdersList);
    return () => window.removeEventListener('admin:open-orders-list', openOrdersList);
  }, [setOrdersSubTab]);

  // Search & Filters for abandoned subtab
  const [abandonedSearchQuery, setAbandonedSearchQuery] = useState('');

  // Bulk WhatsApp Blast state
  const [isBulkBlastModalOpen, setIsBulkBlastModalOpen] = useState(false);
  const [bulkBlastLang, setBulkBlastLang] = useState<'Fr' | 'Ar'>('Fr');

  // Shipping subtab state
  const [shippingSearchQuery, setShippingSearchQuery] = useState('');
  const [shippingCourierFilter, setShippingCourierFilter] = useState('ALL');
  const [shippingStatusFilter, setShippingStatusFilter] = useState('ALL');
  const [reconciledOrders, setReconciledOrders] = useState<Record<string, boolean>>({});
  const [selectedReconRow, setSelectedReconRow] = useState<any | null>(null);

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

  // Add-product-to-order panel state
  const [isAddProductPanelOpen, setIsAddProductPanelOpen] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState('');

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
    const str = String(val).replace(/"/g, '""');
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

  const handleRetryAtlascom = async () => {
    if (!selectedOrder || isRetryingAtlascom) return;
    setIsRetryingAtlascom(true);
    try {
      const response = await fetch('/api/admin/orders/atlascom-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.order_id }),
      });
      const data = await response.json();
      await loadOrders();

      if (data.success) {
        showToast(`Commande ${selectedOrder.order_id} synchronisée avec Atlascom.`, 'success');
      } else {
        showToast(data.error || 'La synchronisation Atlascom a échoué.', 'error');
      }
    } catch (error) {
      console.error('Atlascom retry error:', error);
      showToast('Impossible de relancer Atlascom pour le moment.', 'error');
    } finally {
      setIsRetryingAtlascom(false);
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

      let idxOrder = headers.findIndex(h => h.includes('ref') || h.includes('cmd') || h.includes('commande') || h.includes('order') || h.includes('id_c') || h.includes('reference') || h.includes('po_'));
      let idxTracking = headers.findIndex(h => h.includes('track') || h.includes('suivi') || h.includes('envoi') || h.includes('bar') || h.includes('colis') || h.includes('yal'));
      let idxCod = headers.findIndex(h => h.includes('cod') || h.includes('amount') || h.includes('prix') || h.includes('paye') || h.includes('montant') || h.includes('valeur'));
      let idxFee = headers.findIndex(h => h.includes('fee') || h.includes('frais') || h.includes('tarif') || h.includes('charge') || h.includes('shipping') || h.includes('cout'));
      let idxStatus = headers.findIndex(h => h.includes('status') || h.includes('etat') || h.includes('statut'));

      let startRowIndex = 1;

      // If headers line does not contain order/tracking column keywords, line 0 is likely a raw data row
      if (idxOrder === -1 && idxTracking === -1) {
        idxTracking = 0;
        idxOrder = 1;
        idxCod = 2;
        idxFee = 3;
        idxStatus = 4;
        startRowIndex = 0;
      } else {
        if (idxCod === -1) idxCod = 2;
        if (idxFee === -1) idxFee = 3;
        if (idxStatus === -1) idxStatus = 4;
      }

      const rows: any[] = [];

      for (let i = startRowIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCsvLine(line);
        if (cells.length < Math.max(idxOrder, idxTracking) + 1) continue;

        const fileOrderId = idxOrder !== -1 ? cells[idxOrder] : '';
        const fileTracking = idxTracking !== -1 ? cells[idxTracking] : '';
        const fileCod = idxCod !== -1 ? parseFloat(cells[idxCod].replace(/[^0-9.]/g, '')) || 0 : 0;
        const fileFee = idxFee !== -1 ? parseFloat(cells[idxFee].replace(/[^0-9.]/g, '')) || 0 : 0;
        const fileStatusRaw = idxStatus !== -1 ? cells[idxStatus].toLowerCase() : '';

        const matchedOrder = orders.find(o =>
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

  if (selectedOrder) {
    const st = selectedOrder.status.toLowerCase();
    const isDark = adminTheme === 'dark';
    const statusMeta: Record<string, { label: string; color: string; border: string; bg: string; dot: string }> = {
      pending:   { label: 'En attente',  color: isDark ? '#fbbf24' : '#d97706', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.1)', dot: '#f59e0b' },
      confirmed: { label: 'Confirmée',   color: isDark ? '#38bdf8' : '#0284c7', border: 'rgba(56,189,248,0.3)', bg: 'rgba(56,189,248,0.1)', dot: '#38bdf8' },
      shipped:   { label: 'Expédiée',    color: isDark ? '#818cf8' : '#4f46e5', border: 'rgba(129,140,248,0.3)', bg: 'rgba(129,140,248,0.1)', dot: '#818cf8' },
      delivered: { label: 'Livrée',      color: isDark ? '#34d399' : '#059669', border: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.1)', dot: '#34d399' },
      cancelled: { label: 'Annulée',     color: isDark ? '#fb7185' : '#e11d48', border: 'rgba(251,113,133,0.3)', bg: 'rgba(251,113,133,0.1)', dot: '#fb7185' },
      returned:  { label: 'Retournée',   color: isDark ? '#fb923c' : '#ea580c', border: 'rgba(251,146,60,0.3)', bg: 'rgba(251,146,60,0.1)', dot: '#fb923c' },
    };
    const sm = statusMeta[st] ?? statusMeta.pending;
    const steps = st === 'cancelled'
      ? [{ k:'pending',done:true,red:false,orange:false },{ k:'cancelled',done:true,red:true,orange:false }]
      : st === 'returned'
      ? [{ k:'pending',done:true,red:false,orange:false },{ k:'confirmed',done:true,red:false,orange:false },{ k:'shipped',done:true,red:false,orange:false },{ k:'returned',done:true,red:false,orange:true }]
      : [
          { k:'pending',   done:['pending','confirmed','shipped','delivered'].includes(st), red:false, orange:false },
          { k:'confirmed', done:['confirmed','shipped','delivered'].includes(st), red:false, orange:false },
          { k:'shipped',   done:['shipped','delivered'].includes(st), red:false, orange:false },
          { k:'delivered', done:st==='delivered', red:false, orange:false },
        ];
    const stepLabels: Record<string,string> = { pending:'Enregistrée', confirmed:'Confirmée', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée', returned:'Retournée' };
    const doneCount = steps.filter(s=>s.done).length;
    const progress = steps.length <= 1 ? 100 : ((doneCount - 1) / (steps.length - 1)) * 100;
    const shippingFee = Math.max(0, selectedOrder.total - selectedOrder.subtotal + selectedOrder.discount_amount);
    const orderDate = new Date(selectedOrder.created_at || selectedOrder.date || Date.now());

    const cardBg = isDark ? 'hsl(224,25%,9%)' : '#ffffff';
    const borderStyle = `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`;
    const textPrimary = isDark ? 'hsl(214,35%,95%)' : 'hsl(222,47%,10%)';
    const textMuted = isDark ? 'hsl(215,22%,46%)' : 'hsl(215,18%,46%)';

    return (
      <div className="space-y-6 admin-tab-enter pb-16">
        {/* Page Header */}
        <div className="space-y-3">
          {/* Breadcrumb */}
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer group"
            style={{ color: textMuted }}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="group-hover:underline underline-offset-2">Commandes</span>
          </button>

          {/* Title Row */}
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title + Badges */}
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight shrink-0" style={{ color: textPrimary }}>
                {selectedOrder.order_id}
              </h1>

              {/* Status */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0"
                style={{
                  background: sm.bg,
                  color: sm.color,
                  border: `1px solid ${sm.border}`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sm.dot }} />
                {sm.label}
              </span>

              {/* COD Badge */}
              {(() => {
                const isCodSettled = selectedOrder.reconciled || selectedOrder.payment_status === 'paid' || !!settledOrdersMap[selectedOrder.order_id];
                return (
                  <button
                    onClick={() => {
                      const newStatus = !isCodSettled;
                      setSettledOrdersMap(prev => ({ ...prev, [selectedOrder.order_id]: newStatus }));
                      showToast(newStatus ? `COD pour #${selectedOrder.order_id} marqué comme Encaissé !` : `COD pour #${selectedOrder.order_id} marqué comme Non Encaissé.`, newStatus ? 'success' : 'info');
                    }}
                    title="Basculer le statut COD"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition active:scale-95 cursor-pointer shrink-0"
                    style={{
                      background: isCodSettled ? (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5') : (isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb'),
                      color: isCodSettled ? (isDark ? '#6ee7b7' : '#065f46') : (isDark ? '#fcd34d' : '#92400e'),
                      border: `1px solid ${isCodSettled ? (isDark ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.25)') : (isDark ? 'rgba(251,191,36,0.25)' : 'rgba(245,158,11,0.25)')}`,
                    }}
                  >
                    <DollarSign className="w-3 h-3" />
                    {isCodSettled ? 'COD Encaissé' : 'COD Non Encaissé'}
                  </button>
                );
              })()}

              {/* Date */}
              <span className="text-xs shrink-0" style={{ color: textMuted }}>
                {orderDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${selectedOrder.phone_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                style={{ background: '#25D366' }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              {/* Étiquette A6 */}
              <button
                onClick={() => {
                  setActiveLabelData({
                    orderId: selectedOrder.order_id,
                    courier: selectedOrder.courier?.toUpperCase() || 'LIVREUR MAROC',
                    trackingNumber: selectedOrder.tracking_number || '',
                    codAmount: selectedOrder.total,
                    customerName: selectedOrder.customer_name,
                    phone: selectedOrder.phone_number,
                    city: selectedOrder.city,
                    address: selectedOrder.address,
                    shippingDate: new Date().toLocaleDateString('fr-FR'),
                  });
                  setIsPrintLabelOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80 active:scale-95 cursor-pointer"
                style={{
                  background: isDark ? 'hsl(224,25%,9%)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: textPrimary,
                }}
              >
                <Printer className="w-3.5 h-3.5" style={{ color: isDark ? '#818cf8' : '#4f46e5' }} />
                <span>Étiquette A6</span>
              </button>

              {/* Bon de Livraison */}
              <button
                onClick={() => setIsPrintPackingSlipOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80 active:scale-95 cursor-pointer"
                style={{
                  background: isDark ? 'hsl(224,25%,9%)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: textPrimary,
                }}
              >
                <ClipboardList className="w-3.5 h-3.5" style={{ color: isDark ? '#fbbf24' : '#d97706' }} />
                <span>Bon de Livraison</span>
              </button>

              {/* Facture */}
              <button
                onClick={() => setIsPrintInvoiceOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-80 active:scale-95 cursor-pointer"
                style={{
                  background: isDark ? 'hsl(224,25%,9%)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: textPrimary,
                }}
              >
                <FileText className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : '#059669' }} />
                <span>Facture</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  if (confirm(`Supprimer définitivement la commande ${selectedOrder.order_id} ?`)) {
                    handleDeleteOrder(selectedOrder.order_id);
                    setSelectedOrder(null);
                  }
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-rose-500 transition hover:bg-rose-50 active:scale-95 cursor-pointer"
                style={{
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  background: isDark ? 'hsl(224,25%,9%)' : '#ffffff',
                }}
                title="Supprimer la commande"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Timeline Banner */}
            <div
              className="rounded-2xl p-6 space-y-5 transition-all duration-300"
              style={{
                background: cardBg,
                border: borderStyle,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                      Suivi d'exécution & statut
                    </h4>
                    <p className="text-[10.5px]" style={{ color: textMuted }}>
                      Progression chronologique de la livraison
                    </p>
                  </div>
                </div>

                <OrderStatusPicker
                  value={selectedOrder.status}
                  isDark={isDark}
                  onChange={(newStatus) => {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                    handleUpdateOrderStatus(selectedOrder.order_id, newStatus);
                  }}
                />
              </div>

              <div className="relative pt-2 pb-1">
                <div className="absolute top-[22px] left-6 right-6 h-1 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                    }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {steps.map((step, i) => {
                    const nodeBg = step.done ? '#10b981' : (isDark ? '#1e293b' : '#e2e8f0');
                    return (
                      <div key={step.k} className="flex flex-col items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white z-10 transition-transform duration-300"
                          style={{
                            background: nodeBg,
                            boxShadow: step.done ? '0 0 14px rgba(16,185,129,0.4)' : 'none',
                          }}
                        >
                          {step.done ? '✓' : i + 1}
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: step.done ? '#10b981' : textMuted }}>
                          {stepLabels[step.k]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            {(() => {
              const totalUnitsOrdered = selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
              return (
                <div
                  className="rounded-2xl p-6 space-y-4 transition-all duration-300"
                  style={{
                    background: cardBg,
                    border: borderStyle,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                        Articles commandés
                      </h4>
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        {totalUnitsOrdered} {totalUnitsOrdered > 1 ? 'articles' : 'article'} ({selectedOrder.items?.length || 0} {selectedOrder.items?.length === 1 ? 'réf.' : 'réfs.'})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddGiftModalOpen(true)}
                        className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Gift className="w-3 h-3" />
                        <span>+ Échantillon Gratuit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAddProductPanelOpen(true); setAddProductSearch(''); }}
                        className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                        style={{
                          background: isDark ? 'rgba(99,102,241,0.15)' : '#e0e7ff',
                          color: isDark ? '#a5b4fc' : '#4338ca',
                          border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.25)'}`,
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter un article</span>
                      </button>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-500">
                      Total COD: {selectedOrder.total.toFixed(2)} DH
                    </span>
                  </div>

                  <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                    {selectedOrder.items?.map((item, i) => {
                      const allCatalog = [...(products || []), ...PRODUCTS_DB];
                      const matchingProd = allCatalog.find(
                        p => p.id === item.id ||
                        (p.title && p.title.toLowerCase() === item.title.toLowerCase()) ||
                        (p.name && p.name.toLowerCase() === item.title.toLowerCase()) ||
                        (p.title && item.title.toLowerCase().includes(p.title.toLowerCase())) ||
                        (p.name && item.title.toLowerCase().includes(p.name.toLowerCase()))
                      );
                      const defaultFallback = 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop';
                      const itemImg = item.image || matchingProd?.image || matchingProd?.images?.[0] || defaultFallback;
                      const atlascomSku = item.sku || matchingProd?.sku;

                      return (
                        <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* High-Res Product Thumbnail Frame */}
                            <div
                              className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border shadow-2xs group"
                              style={{
                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                              }}
                            >
                              <img
                                src={itemImg}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = defaultFallback;
                                }}
                              />
                              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded-bl-lg shadow-xs">
                                x{item.quantity}
                              </div>
                            </div>

                            {/* Product Info & Stepper Controls */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-extrabold text-xs truncate" style={{ color: textPrimary }}>
                                  {item.title}
                                </p>
                                {matchingProd?.vendor && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                    {matchingProd.vendor}
                                  </span>
                                )}
                              </div>

                              {/* Atlascom reference + stock */}
                              {(() => {
                                const stock = matchingProd?.stock;
                                const isOutOfStock = stock !== undefined && stock <= 0;
                                const isLowStock = stock !== undefined && stock > 0 && stock <= 3;
                                const isGoodStock = stock !== undefined && stock > 3;
                                const stockColor = isOutOfStock
                                  ? (isDark ? '#fca5a5' : '#dc2626')
                                  : isLowStock
                                  ? (isDark ? '#fcd34d' : '#b45309')
                                  : (isDark ? '#6ee7b7' : '#059669');
                                const stockBg = isOutOfStock
                                  ? (isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2')
                                  : isLowStock
                                  ? (isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb')
                                  : (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5');
                                const stockBorder = isOutOfStock
                                  ? (isDark ? 'rgba(239,68,68,0.25)' : '#fecaca')
                                  : isLowStock
                                  ? (isDark ? 'rgba(245,158,11,0.25)' : '#fde68a')
                                  : (isDark ? 'rgba(16,185,129,0.25)' : '#bbf7d0');
                                const stockLabel = isOutOfStock
                                  ? 'Rupture'
                                  : isLowStock
                                  ? `Stock faible: ${stock}`
                                  : `En stock: ${stock}`;

                                return (
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {atlascomSku && (
                                      <span
                                        className="font-mono text-[9.5px] tracking-wide"
                                        style={{ color: textMuted }}
                                      >
                                        Réf. Atlascom: {atlascomSku}
                                      </span>
                                    )}
                                    {!atlascomSku && (
                                      <span className="text-[9.5px] font-bold text-rose-600 dark:text-rose-300">
                                        Réf. Atlascom introuvable
                                      </span>
                                    )}
                                    {stock !== undefined && (
                                      <span
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold"
                                        style={{ background: stockBg, color: stockColor, border: `1px solid ${stockBorder}` }}
                                      >
                                        {stockLabel}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}

                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {/* Interactive Stepper Buttons */}
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedItems = [...(selectedOrder.items || [])];
                                      if (item.quantity > 1) {
                                        updatedItems[i] = { ...updatedItems[i], quantity: item.quantity - 1 };
                                      } else {
                                        updatedItems.splice(i, 1);
                                      }
                                      const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                                      const newTotal = Math.max(0, newSubtotal - (selectedOrder.discount_amount || 0));
                                      const updatedOrder = { ...selectedOrder, items: updatedItems, subtotal: newSubtotal, total: newTotal };
                                      setSelectedOrder(updatedOrder);
                                      setOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
                                      showToast(`Quantité modifiée (Qté : ${item.quantity - 1})`, 'info');
                                    }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                                    title="Diminuer la quantité"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <span className="px-1.5 font-mono font-black text-[11px]" style={{ color: textPrimary }}>
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedItems = [...(selectedOrder.items || [])];
                                      updatedItems[i] = { ...updatedItems[i], quantity: item.quantity + 1 };
                                      const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                                      const newTotal = Math.max(0, newSubtotal - (selectedOrder.discount_amount || 0));
                                      const updatedOrder = { ...selectedOrder, items: updatedItems, subtotal: newSubtotal, total: newTotal };
                                      setSelectedOrder(updatedOrder);
                                      setOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
                                      showToast(`Quantité modifiée (Qté : ${item.quantity + 1})`, 'success');
                                    }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                                    title="Augmenter la quantité"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-[11px] font-mono opacity-80" style={{ color: textMuted }}>
                                  {item.price.toFixed(2)} DH/u = <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{(item.price * item.quantity).toFixed(2)} DH</strong>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedItems = [...(selectedOrder.items || [])];
                                    updatedItems.splice(i, 1);
                                    const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                                    const newTotal = Math.max(0, newSubtotal - (selectedOrder.discount_amount || 0));
                                    const updatedOrder = { ...selectedOrder, items: updatedItems, subtotal: newSubtotal, total: newTotal };
                                    setSelectedOrder(updatedOrder);
                                    setOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
                                    showToast("Article supprimé de la commande", "info");
                                  }}
                                  className="ml-auto p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                  title="Supprimer cet article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono font-black text-sm shrink-0" style={{ color: textPrimary }}>
                            {(item.price * item.quantity).toFixed(2)} <span className="text-xs font-sans font-bold">DH</span>
                          </div>
                        </div>
                      );
                    })}

                    {selectedOrder.gift_item && (
                      <div
                        className="py-3 flex items-center justify-between gap-3 px-3 rounded-xl mt-2"
                        style={{
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎁</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 italic">
                            {selectedOrder.gift_item}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                          Offert
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add Product Panel */}
                  {isAddProductPanelOpen && (() => {
                    const allCatalog = [...(products || []), ...PRODUCTS_DB];
                    const uniqueCatalog = allCatalog.filter((p: any, idx, arr) =>
                      arr.findIndex(x => (x.id && x.id === p.id) || (x.title && x.title === p.title)) === idx
                    );
                    const q = addProductSearch.toLowerCase().trim();
                    const filtered = q
                      ? uniqueCatalog.filter((p: any) =>
                          (p.title || p.name || '').toLowerCase().includes(q) ||
                          ((p.vendor || p.brand || '').toLowerCase().includes(q))
                        )
                      : uniqueCatalog.slice(0, 20);

                    return (
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.2)'}`,
                          background: isDark ? 'rgba(99,102,241,0.05)' : '#f5f3ff',
                        }}
                      >
                        {/* Search Input */}
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.15)' }}>
                          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: isDark ? '#a5b4fc' : '#6366f1' }} />
                          <input
                            autoFocus
                            type="text"
                            value={addProductSearch}
                            onChange={e => setAddProductSearch(e.target.value)}
                            placeholder="Rechercher un produit du catalogue…"
                            className="flex-1 text-xs bg-transparent outline-none placeholder:opacity-50"
                            style={{ color: textPrimary }}
                          />
                          <button
                            onClick={() => setIsAddProductPanelOpen(false)}
                            className="p-0.5 rounded transition hover:opacity-60 cursor-pointer"
                            style={{ color: textMuted }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-52 overflow-y-auto divide-y">
                          {filtered.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-center" style={{ color: textMuted }}>
                              Aucun produit trouvé pour «&nbsp;{addProductSearch}&nbsp;»
                            </p>
                          ) : filtered.map((prod: any, pi: number) => {
                            const prodName = prod.title || prod.name || 'Produit';
                            const prodPrice = Number(prod.price) || 0;
                            const prodImg = prod.image || prod.images?.[0] || '';
                            const prodBrand = prod.vendor || prod.brand;
                            const alreadyInOrder = selectedOrder.items?.some(it =>
                              it.id === prod.id || it.title?.toLowerCase() === prodName.toLowerCase()
                            );
                            return (
                              <div
                                key={prod.id || pi}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs"
                                style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
                              >
                                {/* Thumbnail */}
                                {prodImg ? (
                                  <img src={prodImg} alt={prodName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px]" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
                                    📦
                                  </div>
                                )}

                                {/* Name + brand */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate" style={{ color: textPrimary }}>{prodName}</p>
                                  {prodBrand && (
                                    <p className="text-[10px]" style={{ color: textMuted }}>{prodBrand}</p>
                                  )}
                                </div>

                                {/* Price */}
                                <span className="font-bold font-mono shrink-0" style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}>
                                  {prodPrice.toFixed(2)} DH
                                </span>

                                {/* Add button */}
                                <button
                                  onClick={() => {
                                    const currentItems = [...(selectedOrder.items || [])];
                                    const existingIdx = currentItems.findIndex(it =>
                                      it.id === prod.id || it.title?.toLowerCase() === prodName.toLowerCase()
                                    );
                                    let updatedItems: any[];
                                    if (existingIdx >= 0) {
                                      updatedItems = currentItems.map((it, idx) =>
                                        idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it
                                      );
                                    } else {
                                      updatedItems = [...currentItems, {
                                        id: prod.id || `custom-${Date.now()}`,
                                        title: prodName,
                                        price: prodPrice,
                                        quantity: 1,
                                        image: prodImg || undefined,
                                      }];
                                    }
                                    const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                                    const newTotal = Math.max(0, newSubtotal - (selectedOrder.discount_amount || 0));
                                    const updatedOrder: Order = { ...selectedOrder, items: updatedItems, subtotal: newSubtotal, total: newTotal };
                                    setSelectedOrder(updatedOrder);
                                    setOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
                                    showToast(alreadyInOrder ? `+1 ${prodName}` : `${prodName} ajouté à la commande`, 'success');
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition active:scale-95 cursor-pointer shrink-0"
                                  style={{
                                    background: alreadyInOrder ? (isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5') : (isDark ? 'rgba(99,102,241,0.2)' : '#e0e7ff'),
                                    color: alreadyInOrder ? (isDark ? '#34d399' : '#065f46') : (isDark ? '#a5b4fc' : '#4338ca'),
                                    border: `1px solid ${alreadyInOrder ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                  {alreadyInOrder ? '+1' : 'Ajouter'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Totals */}
                  <div
                    className="pt-4 mt-2 space-y-2 border-t text-xs font-mono"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex justify-between" style={{ color: textMuted }}>
                      <span>Sous-Total Articles ({totalUnitsOrdered} {totalUnitsOrdered > 1 ? 'pièces' : 'pièce'})</span>
                      <span className="font-bold" style={{ color: textPrimary }}>{selectedOrder.subtotal.toFixed(2)} DH</span>
                    </div>

                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span style={{ color: textMuted }}>Remise</span>
                          {selectedOrder.applied_coupon && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                              style={{
                                background: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
                                color: isDark ? '#fca5a5' : '#dc2626',
                                border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
                                letterSpacing: '0.05em',
                              }}
                            >
                              🏷 {selectedOrder.applied_coupon}
                            </span>
                          )}
                        </div>
                        <span className="font-bold" style={{ color: isDark ? '#fca5a5' : '#dc2626' }}>
                          -{selectedOrder.discount_amount.toFixed(2)} DH
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between" style={{ color: textMuted }}>
                      <span>Frais de livraison</span>
                      <span className="font-bold" style={{ color: textPrimary }}>{shippingFee.toFixed(2)} DH</span>
                    </div>

                    <div className="flex justify-between items-center" style={{ color: textMuted }}>
                      <span>Mode de paiement</span>
                      <span className="font-bold font-sans text-[11px] flex items-center gap-1.5" style={{ color: textPrimary }}>
                        {selectedOrder.payment_method?.toLowerCase() === 'card' || selectedOrder.payment_method?.toLowerCase() === 'cmi' ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
                            <CreditCard className="w-3.5 h-3.5" /> Carte Bancaire (CMI)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold">
                            <Wallet className="w-3.5 h-3.5" /> Paiement à la livraison (COD)
                          </span>
                        )}
                      </span>
                    </div>

                    {selectedOrder.transaction_id && (
                      <div className="flex justify-between items-center text-[10.5px]" style={{ color: textMuted }}>
                        <span>N° Transaction</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {selectedOrder.transaction_id}
                        </span>
                      </div>
                    )}

                    <div
                      className="flex justify-between items-baseline pt-3 text-sm font-black border-t"
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                    >
                      <span className="uppercase tracking-wider font-sans text-xs" style={{ color: textPrimary }}>
                        Total Encaissé / COD
                      </span>
                      <span className="text-xl font-mono text-emerald-500">
                        {selectedOrder.total.toFixed(2)} DH
                      </span>
                    </div>

                    {/* COD Bank Settlement Financial Status Box */}
                    {(() => {
                      const isCodSettled = selectedOrder.reconciled || selectedOrder.payment_status === 'paid' || !!settledOrdersMap[selectedOrder.order_id];
                      return (
                        <div 
                          className="p-4 rounded-2xl mt-4 space-y-3 transition-all"
                          style={{
                            background: isCodSettled ? (isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5') : (isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb'),
                            border: `1px solid ${isCodSettled ? (isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0') : (isDark ? 'rgba(245,158,11,0.25)' : '#fde68a')}`
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className={`w-4 h-4 ${isCodSettled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                              <span className="font-sans font-extrabold text-xs uppercase tracking-wider" style={{ color: textPrimary }}>
                                Statut de Réconciliation Bancaire (COD)
                              </span>
                            </div>
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider"
                              style={{
                                background: isCodSettled ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                color: isCodSettled ? (isDark ? '#6ee7b7' : '#047857') : (isDark ? '#fcd34d' : '#b45309')
                              }}
                            >
                              {isCodSettled ? '🟢 COD Encaissé' : '🟡 Non Encaissé'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <p className="text-[11px] leading-relaxed font-sans opacity-85" style={{ color: textMuted }}>
                              {isCodSettled 
                                ? "Le virement bancaire du transporteur a été reçu et reconcilié sur le compte entreprise." 
                                : "Fonds collectés par le chauffeur livreur en cours de transfert vers votre compte."}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const newStatus = !isCodSettled;
                                setSettledOrdersMap(prev => ({ ...prev, [selectedOrder.order_id]: newStatus }));
                                showToast(newStatus ? `COD pour #${selectedOrder.order_id} marqué comme Encaissé (Virement reçu) !` : `COD pour #${selectedOrder.order_id} marqué comme Non Encaissé.`, newStatus ? 'success' : 'info');
                              }}
                              className="px-3.5 py-2 rounded-xl font-bold text-[11px] shrink-0 transition active:scale-95 cursor-pointer shadow-xs text-white"
                              style={{
                                background: isCodSettled ? '#059669' : '#d97706',
                                color: '#ffffff'
                              }}
                            >
                              {isCodSettled ? 'Marquer Non Encaissé' : 'Marquer COD Encaissé (Virement reçu)'}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* WhatsApp Direct Template Buttons */}
            <div
              className="rounded-2xl p-6 space-y-4 transition-all duration-300"
              style={{
                background: cardBg,
                border: borderStyle,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                    Relance & notifications WhatsApp
                  </h4>
                  <p className="text-[10.5px]" style={{ color: textMuted }}>
                    Envoyez des messages automatisés directement au client
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Confirmation', status: 'pending' as const, bg: '#10b981' },
                  { label: 'Expédition', status: 'shipped' as const, bg: '#6366f1' },
                  { label: 'Livraison', status: 'delivered' as const, bg: '#06b6d4' },
                ].map(tmpl => (
                  <div
                    key={tmpl.label}
                    className="p-3.5 rounded-xl space-y-2 text-center"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: borderStyle,
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: textMuted }}>
                      {tmpl.label}
                    </span>
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={() => handleNotifyWhatsApp(selectedOrder, tmpl.status, 'Fr')}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition active:scale-95 cursor-pointer"
                        style={{ background: tmpl.bg }}
                      >
                        FR
                      </button>
                      <button
                        onClick={() => handleNotifyWhatsApp(selectedOrder, tmpl.status, 'Ar')}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition active:scale-95 cursor-pointer opacity-85 hover:opacity-100"
                        style={{ background: tmpl.bg }}
                      >
                        AR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes Box Card */}
            <div
              className="rounded-2xl p-6 space-y-4 transition-all duration-300"
              style={{
                background: cardBg,
                border: borderStyle,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                      Notes Équipe & Instructions de Préparation
                    </h4>
                    <p className="text-[10.5px]" style={{ color: textMuted }}>
                      Notes privées visibles uniquement par les opérateurs
                    </p>
                  </div>
                </div>

                {noteSavedFeedback && (
                  <span className="text-[11px] font-extrabold text-emerald-500 animate-pulse flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Note enregistrée
                  </span>
                )}
              </div>

              {/* Preset Quick Note Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mr-1" style={{ color: textMuted }}>
                  Raccourcis :
                </span>
                {[
                  '🚚 Livrer après 17h',
                  '🎁 Joindre Échantillon Gratuit',
                  '📦 Emballage Fragile',
                  '📞 Confirmer avant départ',
                ].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = staffNoteInputs[selectedOrder.order_id] || staffNotesMap[selectedOrder.order_id] || '';
                      const newText = current ? `${current} · ${tag}` : tag;
                      setStaffNoteInputs(prev => ({ ...prev, [selectedOrder.order_id]: newText }));
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition active:scale-95 cursor-pointer"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      color: textPrimary,
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Note Textarea & Save Action */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Écrivez une note pour l'équipe logistique..."
                  value={staffNoteInputs[selectedOrder.order_id] !== undefined ? staffNoteInputs[selectedOrder.order_id] : (staffNotesMap[selectedOrder.order_id] || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaffNoteInputs(prev => ({ ...prev, [selectedOrder.order_id]: val }));
                  }}
                  className="w-full text-xs font-medium rounded-xl p-3.5 outline-none transition duration-200 resize-none"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: borderStyle,
                    color: textPrimary,
                  }}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const val = staffNoteInputs[selectedOrder.order_id] !== undefined
                        ? staffNoteInputs[selectedOrder.order_id]
                        : (staffNotesMap[selectedOrder.order_id] || '');
                      setStaffNotesMap(prev => ({ ...prev, [selectedOrder.order_id]: val }));
                      setNoteSavedFeedback(true);
                      setTimeout(() => setNoteSavedFeedback(false), 2500);
                      logAdminAction("Note Équipe Ajoutée", `Note pour commande ${selectedOrder.order_id}: ${val}`);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                  >
                    Enregistrer la Note
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Audit Timeline Card */}
            <div
              className="rounded-2xl p-6 space-y-4 transition-all duration-300"
              style={{
                background: cardBg,
                border: borderStyle,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                    Journal d'Activité & Historique (Audit Log)
                  </h4>
                  <p className="text-[10.5px]" style={{ color: textMuted }}>
                    Traçabilité en temps réel des actions sur la commande
                  </p>
                </div>
              </div>

              <div className="relative pl-6 space-y-5 border-l-2 ml-3 pt-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>

                {/* 1. Order Creation Event */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold" style={{ color: textPrimary }}>Commande créée par le client</span>
                      <span className="text-[10px] font-mono opacity-60" style={{ color: textMuted }}>
                        {orderDate.toLocaleDateString('fr-FR')} {orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80" style={{ color: textMuted }}>
                      Commande #{selectedOrder.order_id} passée sur le site par <strong style={{ color: textPrimary }}>{selectedOrder.customer_name}</strong> ({selectedOrder.city})
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1">
                      Auteur : Client (Boutique)
                    </span>
                  </div>
                </div>

                {/* 2. Order Confirmation / Status Change Event */}
                {selectedOrder.status !== 'Pending' && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">Statut mis à jour : {sm.label}</span>
                        <span className="text-[10px] font-mono opacity-60" style={{ color: textMuted }}>Aujourd'hui</span>
                      </div>
                      <p className="text-[11px] opacity-80" style={{ color: textMuted }}>
                        Confirmation téléphonique effectuée et validée. Statut changé vers <strong style={{ color: textPrimary }}>{sm.label}</strong>.
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mt-1">
                        Auteur : {currentUser?.name || 'Youssef Mahir (Admin)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Shipping Event */}
                {selectedOrder.tracking_number && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Colis attribué à {selectedOrder.courier}</span>
                        <span className="text-[10px] font-mono opacity-60" style={{ color: textMuted }}>Récent</span>
                      </div>
                      <p className="text-[11px] opacity-80" style={{ color: textMuted }}>
                        Bordereau d'expédition généré. Code de suivi : <strong className="font-mono">{selectedOrder.tracking_number}</strong>
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mt-1">
                        Transporteur : {selectedOrder.courier}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Staff Note Log */}
                {staffNotesMap[selectedOrder.order_id] && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">Note de préparation ajoutée</span>
                        <span className="text-[10px] font-mono opacity-60" style={{ color: textMuted }}>Enregistrée</span>
                      </div>
                      <p className="text-[11px] font-semibold italic p-2 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20 mt-1">
                        "{staffNotesMap[selectedOrder.order_id]}"
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mt-1">
                        Auteur : {currentUser?.name || 'Équipe Opérations'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right Column (1 col) */}
          <div className="space-y-6">

            {/* Customer Profile Card (Shopify Admin Standard) */}
            {(() => {
              const rawPhoneDigits = selectedOrder.phone_number?.replace(/\D/g, '') || '';
              let cleanPhoneDigits = rawPhoneDigits;
              if (cleanPhoneDigits.length > 10 && cleanPhoneDigits.startsWith('0')) {
                cleanPhoneDigits = cleanPhoneDigits.slice(0, 10);
              }
              const formattedPhone = cleanPhoneDigits.length === 10
                ? cleanPhoneDigits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
                : (selectedOrder.phone_number || '—');

              const isGenericTestUser =
                selectedOrder.customer_name?.toLowerCase().includes('test') ||
                selectedOrder.phone_number?.replace(/\D/g, '').length > 14;

              const customerOrders = isGenericTestUser ? [selectedOrder] : orders.filter(o => {
                const p = o.phone_number?.replace(/\D/g, '');
                if (cleanPhoneDigits && p) return p === cleanPhoneDigits;
                return o.customer_name?.toLowerCase().trim() === selectedOrder.customer_name?.toLowerCase().trim();
              });

              const totalCustomerOrders = customerOrders.length;
              const totalLTV = customerOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
              const deliveredOrdersCount = customerOrders.filter(o => o.status === 'Delivered').length;
              const cancelledOrdersCount = customerOrders.filter(o => o.status === 'Cancelled').length;

              const isRepeatCustomer = totalCustomerOrders > 1;

              let cleanCity = selectedOrder.city || 'Maroc';
              if (cleanCity.includes(' - ')) {
                const parts = cleanCity.split(' - ');
                cleanCity = parts[parts.length - 1];
              }

              let trustStatusLabel = 'En cours (Première cmd)';
              let trustStatusColor = 'text-blue-600 dark:text-blue-400';

              if (deliveredOrdersCount > 0) {
                const successRate = Math.round((deliveredOrdersCount / totalCustomerOrders) * 100);
                trustStatusLabel = `${successRate}% Livré (${deliveredOrdersCount}/${totalCustomerOrders})`;
                trustStatusColor = successRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500';
              } else if (cancelledOrdersCount > 0) {
                trustStatusLabel = `⚠️ ${cancelledOrdersCount} annulée(s)`;
                trustStatusColor = 'text-rose-500';
              } else if (selectedOrder.status === 'Delivered') {
                trustStatusLabel = '100% Livré (1/1)';
                trustStatusColor = 'text-emerald-600 dark:text-emerald-400';
              }

              return (
                <div
                  className="rounded-2xl p-5 space-y-4 transition-all duration-300"
                  style={{
                    background: cardBg,
                    border: borderStyle,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
                  }}
                >
                  {/* Card Header Title */}
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                      <User className="w-4 h-4 text-emerald-500" />
                      Client
                    </h4>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
                      style={{
                        background: isRepeatCustomer ? 'rgba(99,102,241,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        color: isRepeatCustomer ? (isDark ? '#a5b4fc' : '#4f46e5') : textMuted,
                        border: `1px solid ${isRepeatCustomer ? 'rgba(99,102,241,0.25)' : borderStyle}`,
                      }}
                    >
                      {isGenericTestUser ? '🧪 Commande de Test' : (isRepeatCustomer ? `Client Fidèle (${totalCustomerOrders} cmd)` : 'Nouveau Client')}
                    </span>
                  </div>

                  {/* Customer Profile Row */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                        color: textPrimary,
                        border: borderStyle,
                      }}
                    >
                      {selectedOrder.customer_name ? selectedOrder.customer_name.slice(0, 2).toUpperCase() : 'CL'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-sm truncate" style={{ color: textPrimary }}>
                        {selectedOrder.customer_name}
                      </h5>
                      <p className="text-[11px] font-mono opacity-70" style={{ color: textMuted }}>
                        {formattedPhone}
                      </p>
                    </div>
                  </div>

                  {/* Clean 2-Column Metrics Box */}
                  <div
                    className="grid grid-cols-2 gap-3 p-3.5 rounded-xl text-xs"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.025)' : '#f8fafc',
                      border: borderStyle,
                    }}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-60" style={{ color: textMuted }}>
                        Valeur Totale (LTV)
                      </span>
                      <p className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {totalLTV.toFixed(2)} DH
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-60" style={{ color: textMuted }}>
                        Historique Commandes
                      </span>
                      <p className="text-sm font-black font-mono" style={{ color: textPrimary }}>
                        {totalCustomerOrders} {totalCustomerOrders > 1 ? 'commandes' : 'commande'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Details List */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between py-1">
                      <span className="font-medium opacity-70" style={{ color: textMuted }}>Téléphone</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs" style={{ color: textPrimary }}>
                          {formattedPhone}
                        </span>
                        <a
                          href={`https://wa.me/${cleanPhoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="WhatsApp Client"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                      <span className="font-medium opacity-70" style={{ color: textMuted }}>Ville</span>
                      <span className="font-bold" style={{ color: textPrimary }}>{cleanCity}</span>
                    </div>

                    {/* Account Status Row */}
                    <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                      <span className="font-medium opacity-70" style={{ color: textMuted }}>Compte Boutique</span>
                      {selectedOrder.user_id || selectedOrder.has_account ? (
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Membre Enregistré
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Client Invité (Sans Compte)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                      <span className="font-medium opacity-70" style={{ color: textMuted }}>Fiabilité COD</span>
                      <span className={`font-bold ${trustStatusColor}`}>
                        {trustStatusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Delivery Address & Transport Card */}
            <div
              className="rounded-2xl p-6 space-y-4 transition-all duration-300"
              style={{
                background: cardBg,
                border: borderStyle,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
              }}
            >
              <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: textPrimary }}>
                Adresse de livraison & Transport
              </h4>

              <div className="p-3.5 rounded-xl space-y-1 text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: borderStyle }}>
                <p className="font-semibold leading-relaxed" style={{ color: textPrimary }}>
                  {selectedOrder.address}
                </p>
                <p className="font-bold text-emerald-500">
                  {selectedOrder.city}, Maroc
                </p>
              </div>

              {/* Customer Checkout Note */}
              {selectedOrder.notes && (
                <div
                  className="flex gap-2.5 p-3.5 rounded-xl text-xs"
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
                    border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#fde68a'}`,
                  }}
                >
                  <MessageSquare
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: isDark ? '#fcd34d' : '#b45309' }}
                  />
                  <div className="space-y-0.5">
                    <p
                      className="text-[9.5px] uppercase font-black tracking-wider"
                      style={{ color: isDark ? '#fcd34d' : '#b45309' }}
                    >
                      Note du client
                    </p>
                    <p className="leading-relaxed font-medium" style={{ color: isDark ? '#fef3c7' : '#92400e' }}>
                      {selectedOrder.notes}
                    </p>
                  </div>
                </div>
              )}

              {(() => {
                const courierName = (selectedOrder.courier || 'Yalidine Express').toUpperCase();
                const trackingCode = selectedOrder.tracking_number || `YAL-${selectedOrder.order_id.replace(/\D/g, '') || '806990'}`;
                const trackingUrl = selectedOrder.tracking_link || (
                  courierName.includes('CATHEDIS') 
                    ? `https://cathedis.ma/tracking?code=${trackingCode}` 
                    : `https://yalidine.app/tracking/?tracking=${trackingCode}`
                );

                let liveStatusText = "🚚 Colis en cours d'acheminement par le chauffeur";
                let liveStatusBg = isDark ? 'rgba(99,102,241,0.15)' : '#e0e7ff';
                let liveStatusColor = isDark ? '#a5b4fc' : '#4338ca';

                if (selectedOrder.status === 'Delivered') {
                  liveStatusText = "🟢 Colis livré au client & encaissé";
                  liveStatusBg = isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5';
                  liveStatusColor = isDark ? '#6ee7b7' : '#047857';
                } else if (selectedOrder.status === 'Cancelled') {
                  liveStatusText = "⚠️ Livraison annulée / Colis retourné";
                  liveStatusBg = isDark ? 'rgba(244,63,94,0.15)' : '#ffe4e6';
                  liveStatusColor = isDark ? '#fda4af' : '#be123c';
                } else if (!selectedOrder.tracking_number) {
                  liveStatusText = "📦 Prêt pour ramassage par le livreur";
                  liveStatusBg = isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7';
                  liveStatusColor = isDark ? '#fcd34d' : '#b45309';
                }

                return (
                  <div className="space-y-3 pt-1">
                    {/* Live Courier Status Banner */}
                    <div 
                      className="p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold transition"
                      style={{ background: liveStatusBg, color: liveStatusColor }}
                    >
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>{liveStatusText}</span>
                    </div>

                    {/* Courier & Tracking Code Card */}
                    <div 
                      className="p-3.5 rounded-xl space-y-3 text-xs"
                      style={{ 
                        background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', 
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` 
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400 block">
                            TRANSPORTEUR
                          </span>
                          <span className="font-black text-xs uppercase tracking-tight" style={{ color: textPrimary }}>
                            {courierName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400 block">
                            CODE DE SUIVI
                          </span>
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            {trackingCode}
                          </span>
                        </div>
                      </div>

                      {/* External Tracking Link & Copy Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition active:scale-95 shadow-xs text-white"
                          style={{ color: '#ffffff' }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                          <span className="text-white font-bold" style={{ color: '#ffffff' }}>Suivre sur {courierName.includes('CATHEDIS') ? 'Cathedis' : 'Yalidine'}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(trackingCode);
                            showToast(`Code suivi ${trackingCode} copié !`, 'success');
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-[11px] transition active:scale-95 cursor-pointer"
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: textPrimary
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copier code</span>
                        </button>
                      </div>
                    </div>

                    {/* Manage / Register Shipping Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenShippingPanel(selectedOrder)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border hover:bg-slate-50 dark:hover:bg-slate-850"
                      style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                    >
                      <Truck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedOrder.tracking_number ? "Modifier l'expédition" : "Configurer l'expédition livreur"}</span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Atlascom ERP Synchronization Card */}
            {(() => {
              const exportJob = selectedOrder.atlascom_export;
              const atlascomNotes = (selectedOrder.internal_notes || [])
                .filter(note => note.kind === 'atlascom')
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              const latestNote = atlascomNotes[0];
              const status = exportJob?.status || 'not_started';
              const isConfirmed = String(selectedOrder.status).toLowerCase() === 'confirmed';
              const canRetry = isConfirmed && ['failed', 'blocked', 'queued', 'not_started'].includes(status);
              const lastActivityAt = latestNote?.created_at || exportJob?.sent_at || exportJob?.updated_at;

              const statusConfig = {
                sent: {
                  label: 'Synchronisée',
                  detail: 'La commande est enregistrée dans Atlascom.',
                  color: isDark ? '#6ee7b7' : '#047857',
                  background: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
                  border: isDark ? 'rgba(16,185,129,0.24)' : '#a7f3d0',
                  icon: CheckCircle,
                },
                failed: {
                  label: 'Échec de synchronisation',
                  detail: 'Atlascom a refusé la dernière tentative.',
                  color: isDark ? '#fda4af' : '#be123c',
                  background: isDark ? 'rgba(244,63,94,0.11)' : '#fff1f2',
                  border: isDark ? 'rgba(244,63,94,0.24)' : '#fecdd3',
                  icon: AlertTriangle,
                },
                blocked: {
                  label: 'Configuration requise',
                  detail: "L'export est en attente d'un paramétrage valide.",
                  color: isDark ? '#fcd34d' : '#b45309',
                  background: isDark ? 'rgba(245,158,11,0.11)' : '#fffbeb',
                  border: isDark ? 'rgba(245,158,11,0.24)' : '#fde68a',
                  icon: AlertTriangle,
                },
                sending: {
                  label: 'Envoi en cours',
                  detail: 'La commande est en cours de transmission.',
                  color: isDark ? '#a5b4fc' : '#4338ca',
                  background: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
                  border: isDark ? 'rgba(99,102,241,0.24)' : '#c7d2fe',
                  icon: RefreshCw,
                },
                queued: {
                  label: 'Synchronisation planifiée',
                  detail: "La commande attend son prochain envoi vers l'ERP.",
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  background: isDark ? 'rgba(59,130,246,0.11)' : '#eff6ff',
                  border: isDark ? 'rgba(59,130,246,0.24)' : '#bfdbfe',
                  icon: Activity,
                },
                not_started: {
                  label: isConfirmed ? 'Non synchronisée' : 'En attente de confirmation',
                  detail: isConfirmed
                    ? "Aucun export Atlascom n'a encore été créé."
                    : "L'export démarrera après confirmation de la commande.",
                  color: isDark ? '#cbd5e1' : '#475569',
                  background: isDark ? 'rgba(148,163,184,0.08)' : '#f8fafc',
                  border: isDark ? 'rgba(148,163,184,0.18)' : '#e2e8f0',
                  icon: Activity,
                },
              } as const;

              const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
              const StatusIcon = currentStatus.icon;
              const noteText = latestNote?.body || exportJob?.last_error || currentStatus.detail;

              return (
                <section
                  aria-labelledby="atlascom-sync-title"
                  className="rounded-2xl p-5 transition-colors duration-200"
                  style={{
                    background: cardBg,
                    border: borderStyle,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: currentStatus.background, color: currentStatus.color, border: `1px solid ${currentStatus.border}` }}
                      >
                        <StatusIcon className={`h-4 w-4 ${status === 'sending' || isRetryingAtlascom ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 id="atlascom-sync-title" className="text-[12px] font-black uppercase leading-5 tracking-[0.08em]" style={{ color: textPrimary }}>
                          Synchronisation Atlascom
                        </h4>
                        <p className="mt-0.5 text-[11px] leading-4" style={{ color: textMuted }}>
                          Transmission de la commande vers l’ERP
                        </p>
                      </div>
                    </div>

                    <span
                      className="inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold leading-4"
                      style={{ background: currentStatus.background, color: currentStatus.color, border: `1px solid ${currentStatus.border}` }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: currentStatus.color }} />
                      <span>{currentStatus.label}</span>
                    </span>
                  </div>

                  <div className="mt-5 border-t pt-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,30,54,0.08)' }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: textMuted }}>Dernière note</p>
                    <p className="mt-2 break-words text-[11.5px] font-semibold leading-[1.65]" style={{ color: currentStatus.color }}>
                      {noteText}
                    </p>
                  </div>

                  <div
                    className="mt-5 grid grid-cols-2 border-y py-3"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,30,54,0.08)' }}
                  >
                    <div className="min-w-0 pr-3">
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.1em]" style={{ color: textMuted }}>Tentatives</span>
                      <span className="mt-1 block font-mono text-[11px] font-bold" style={{ color: textPrimary }}>{exportJob?.attempt_count || 0}</span>
                    </div>
                    <div className="min-w-0 border-l pl-3 text-right" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,30,54,0.08)' }}>
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.1em]" style={{ color: textMuted }}>Dernière activité</span>
                      <span className="mt-1 block font-mono text-[10.5px] font-bold leading-4" style={{ color: textPrimary }}>
                        {lastActivityAt ? new Date(lastActivityAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Aucune'}
                      </span>
                    </div>
                  </div>

                  {exportJob?.remote_order_id && (
                    <div className="mt-3 flex items-center justify-between gap-3 text-[10px]">
                      <span className="font-bold" style={{ color: textMuted }}>Identifiant Atlascom</span>
                      <span className="min-w-0 truncate font-mono font-black text-emerald-600 dark:text-emerald-400">{exportJob.remote_order_id}</span>
                    </div>
                  )}

                  {canRetry && (
                    <button
                      type="button"
                      onClick={handleRetryAtlascom}
                      disabled={isRetryingAtlascom}
                      className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-black text-white transition duration-200 hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ background: status === 'failed' ? '#be123c' : '#1d4ed8' }}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isRetryingAtlascom ? 'animate-spin' : ''}`} />
                      <span>{isRetryingAtlascom ? 'Synchronisation en cours...' : 'Réessayer la synchronisation'}</span>
                    </button>
                  )}
                </section>
              );
            })()}

            {/* AI Skin Diagnostic Card */}
            {selectedOrder.skin_diagnostic && (
              <div
                className="rounded-2xl p-6 space-y-3 transition-all duration-300"
                style={{
                  background: cardBg,
                  border: borderStyle,
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 10px rgba(15,30,54,0.04)',
                }}
              >
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-500">
                  Diagnostic IA · Peau
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[8px] uppercase font-bold text-purple-400 block">Type</span>
                    <strong className="text-[11px] font-extrabold text-purple-500">{selectedOrder.skin_diagnostic.skinType}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[8px] uppercase font-bold text-indigo-400 block">Problème</span>
                    <strong className="text-[11px] font-extrabold text-indigo-500">{selectedOrder.skin_diagnostic.concern}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[8px] uppercase font-bold text-blue-400 block">Soleil</span>
                    <strong className="text-[11px] font-extrabold text-blue-500">{selectedOrder.skin_diagnostic.sunExposure}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- PRINT VIEW OVERLAY: A6 SHIPPING LABEL -------------------- */}
            {mounted && isPrintLabelOpen && activeLabelData && createPortal(
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) { setIsPrintLabelOpen(false); setActiveLabelData(null); } }}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none print:bg-white print:p-0 print:inset-auto print:absolute"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl my-auto max-h-[85vh] overflow-y-auto print:max-h-none print:bg-white print:border-0 print:p-0 print:shadow-none print-label-container">
                  
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
                      className="premium-green-cta px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-950" /> Imprimer l&apos;étiquette A6
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* -------------------- PRINT VIEW OVERLAY: A4 BON DE PRÉPARATION & LIVRAISON (PACKING SLIP - NO PRICES) -------------------- */}
            {mounted && isPrintPackingSlipOpen && selectedOrder && createPortal(
              (() => {
                const slipOrder = selectedOrder as Order;
                const totalUnits = slipOrder.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                return (
                  <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsPrintPackingSlipOpen(false); }}
                    className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 z-[9999] overflow-y-auto print:bg-white print:p-0 print:inset-auto print:absolute print:overflow-visible"
                  >
                    <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[85vh] overflow-y-auto print:max-h-none print:bg-white print:border-0 print:p-0 print:shadow-none print:max-w-none print:w-full print-label-container">
                    
                    {/* Slip Top Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-6 print:border-slate-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-white text-xs">
                            PO
                          </div>
                          <h2 className="font-black text-lg text-slate-950 uppercase tracking-tight">
                            {settings?.storeName || 'PARA OFFICINAL S.A'}
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Centre de Préparation Logistique & Expédition
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Document Logistique Entrepôt · Sans valeur de facturation
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-mono text-xs font-black rounded-lg uppercase tracking-wider">
                          BON DE PRÉPARATION & LIVRAISON
                        </span>
                        <p className="text-sm font-mono font-black text-slate-900 pt-1">
                          N° Commande: #{slipOrder.order_id}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Date d'Impression: {new Date().toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Addresses Grid (Sender & Receiver) */}
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed print:bg-slate-50 print:border-slate-300">
                      {/* Expéditeur */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          ENTREPÔT EXPÉDITEUR
                        </span>
                        <strong className="text-sm font-black text-slate-900 block">{settings?.storeName || 'Para Officinal S.A'}</strong>
                        <p className="text-slate-600 font-medium">Boulevard d'Anfa, Maarif</p>
                        <p className="text-slate-600 font-medium">Casablanca, Maroc</p>
                      </div>

                      {/* Destinataire */}
                      <div className="space-y-1 border-l border-slate-200 pl-6 print:border-slate-300">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          CLIENT DESTINATAIRE
                        </span>
                        <strong className="text-sm font-black text-slate-950 block">{slipOrder.customer_name}</strong>
                        <p className="text-slate-700 font-medium">{slipOrder.address}</p>
                        <p className="text-slate-900 font-black uppercase">{slipOrder.city}, Maroc</p>
                        <p className="text-slate-900 font-mono font-extrabold">{slipOrder.phone_number}</p>
                      </div>
                    </div>

                    {/* Customer Note Callout (if exists) */}
                    {slipOrder.notes && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 print:bg-amber-50">
                        <span className="text-[9px] uppercase font-black tracking-wider text-amber-700 block">
                          💬 INSTRUCTIONS DE LIVRAISON CLIENT
                        </span>
                        <p className="font-semibold leading-relaxed">
                          « {slipOrder.notes} »
                        </p>
                      </div>
                    )}

                    {/* Line Items Packing Table (NO PRICES) */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          ARTICLES À PRÉPARER & VÉRIFIER ({totalUnits} pièces)
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 font-bold">
                          {slipOrder.items?.length || 0} référence(s)
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden print:border-slate-300">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-600 font-black print:bg-slate-100">
                            <tr>
                              <th className="py-2.5 px-3 text-center w-12">Pointage</th>
                              <th className="py-2.5 px-4">Article / Désignation</th>
                              <th className="py-2.5 px-4">Référence SKU</th>
                              <th className="py-2.5 px-4 text-center font-black">Quantité</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                            {slipOrder.items?.map((item: any, idx: number) => {
                              const allCatalog = [...(products || []), ...PRODUCTS_DB];
                              const matchingProd = allCatalog.find(
                                p => p.id === item.id ||
                                (p.title && p.title.toLowerCase() === item.title.toLowerCase())
                              );
                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="py-3 px-3 text-center">
                                    <div className="w-4 h-4 rounded border-2 border-slate-400 mx-auto" />
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-extrabold text-slate-950 block text-sm">{item.title}</span>
                                    {matchingProd?.vendor && (
                                      <span className="text-[10px] text-slate-500 uppercase font-bold">{matchingProd.vendor}</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                                    {matchingProd?.sku || `SKU-${slipOrder.order_id}-${idx + 1}`}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono font-black text-base text-slate-950">
                                    x{item.quantity}
                                  </td>
                                </tr>
                              );
                            })}

                            {slipOrder.gift_item && (
                              <tr className="bg-amber-50/60 text-amber-900 font-bold">
                                <td className="py-2.5 px-3 text-center">
                                  <div className="w-4 h-4 rounded border-2 border-amber-600 mx-auto" />
                                </td>
                                <td className="py-2.5 px-4 flex items-center gap-1.5">
                                  <span>🎁</span> {slipOrder.gift_item} (Échantillon Offert)
                                </td>
                                <td className="py-2.5 px-4 font-mono text-xs">GIFT-FREE</td>
                                <td className="py-2.5 px-4 text-center font-mono font-black text-base">x1</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Delivery Info Footer Box */}
                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 print:bg-slate-50">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          MODE DE LIVRAISON & PAIMENT
                        </span>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500 font-medium">Livreur Désigné:</span>
                          <strong className="font-mono font-extrabold text-slate-900">{slipOrder.courier?.toUpperCase() || 'YALIDINE EXPRESS'}</strong>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500 font-medium">Mode de Règlement:</span>
                          <strong className="font-extrabold text-slate-900">
                            {slipOrder.payment_method?.toLowerCase() === 'card' || slipOrder.payment_method?.toLowerCase() === 'cmi'
                              ? 'Carte Bancaire (Payé)'
                              : 'Cash à la livraison (COD)'}
                          </strong>
                        </div>
                        {slipOrder.payment_method?.toLowerCase() !== 'card' && slipOrder.payment_method?.toLowerCase() !== 'cmi' && (
                          <div className="flex justify-between items-center py-0.5 pt-1 border-t border-slate-200">
                            <span className="text-slate-700 font-black">Montant COD à percevoir:</span>
                            <strong className="font-mono font-black text-emerald-600 text-sm">{slipOrder.total.toFixed(2)} DH</strong>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 print:bg-slate-50">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          SIGNATURES & CONTRÔLE LOGISTIQUE
                        </span>
                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                          <div className="space-y-4">
                            <span className="text-slate-500 block">Préparé par:</span>
                            <div className="border-b border-dashed border-slate-300 h-6" />
                          </div>
                          <div className="space-y-4">
                            <span className="text-slate-500 block">Contrôlé par:</span>
                            <div className="border-b border-dashed border-slate-300 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 print:hidden">
                      <button 
                        type="button" 
                        onClick={() => setIsPrintPackingSlipOpen(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer transition"
                      >
                        Fermer
                      </button>
                      <button 
                        type="button" 
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 font-bold"
                      >
                        <Printer className="w-4 h-4 text-slate-950" /> Imprimer le Bon de Préparation (A4)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })(),
            document.body
          )}

          {/* -------------------- PRINT VIEW OVERLAY: BATCH A6 THERMAL SHIPPING LABELS -------------------- */}
          {mounted && isBatchLabelPrintOpen && selectedOrderIds.length > 0 && createPortal(
            ((): React.ReactNode => {
              const selectedOrdersList = orders.filter(o => selectedOrderIds.includes(o.order_id));
              return (
                <div 
                  onClick={(e) => { if (e.target === e.currentTarget) setIsBatchLabelPrintOpen(false); }}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 z-[9999] overflow-y-auto print:bg-white print:p-0 print:inset-auto print:absolute print:overflow-visible"
                >
                  <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto print:max-h-none print:bg-white print:border-0 print:p-0 print:shadow-none print:w-full">
                    
                    {/* Modal Controls */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4 print:hidden">
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <Printer className="w-5 h-5 text-emerald-400" />
                          Impression Groupée d'Étiquettes Thermal A6 ({selectedOrdersList.length})
                        </h3>
                        <p className="text-xs text-slate-400">
                          Format thermique standard 100x150mm optimisé pour imprimantes ZD420/Zebra/Xprinter.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBatchLabelPrintOpen(false)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition"
                        >
                          Fermer
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="premium-green-cta px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
                        >
                          <Printer className="w-4 h-4" /> Lancer L'Impression Thermal A6
                        </button>
                      </div>
                    </div>

                    {/* A6 Printable Cards Grid */}
                    <div className="space-y-8 print:space-y-0 print:block">
                      {selectedOrdersList.map((ord, idx) => (
                        <div
                          key={ord.order_id}
                          className="bg-white text-slate-950 rounded-2xl p-6 border-2 border-slate-900 shadow-md max-w-[400px] mx-auto print:max-w-none print:w-[100mm] print:h-[150mm] print:m-0 print:p-4 print:rounded-none print:border-2 print:border-black print:page-break-after-always flex flex-col justify-between"
                        >
                          {/* Header */}
                          <div className="border-b-2 border-black pb-3 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black tracking-widest uppercase block text-slate-500">EXPE : {settings?.storeName || 'PARA OFFICINAL S.A'}</span>
                              <strong className="text-xs font-black block">Casablanca, Maroc</strong>
                              <span className="text-[9px] font-mono block text-slate-600">Tél: +212 522-202020</span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 bg-black text-white font-mono text-[10px] font-black uppercase rounded">
                                {ord.courier ? ord.courier.toUpperCase() : 'YALIDINE COD'}
                              </span>
                              <span className="text-[9px] font-mono block font-bold mt-1 text-slate-700"># {ord.order_id}</span>
                            </div>
                          </div>

                          {/* Recipient Box */}
                          <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1.5 print:bg-white print:border-black">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">DESTINATAIRE (LIVRAISON)</span>
                            <h2 className="text-base font-black text-slate-950 uppercase leading-tight">{ord.customer_name}</h2>
                            <p className="text-xs font-bold text-slate-800">{ord.address}</p>
                            <p className="text-sm font-black uppercase text-slate-950">{ord.city}, MAROC</p>
                            <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                              <span className="text-xs font-mono font-black text-slate-900">TÉL: {ord.phone_number}</span>
                              {(ord as any).shipping_cost && <span className="text-[10px] font-mono text-slate-500">Frais: {(ord as any).shipping_cost} DH</span>}
                            </div>
                          </div>

                          {/* Barcode / QR Simulation */}
                          <div className="border-t-2 border-b-2 border-black py-3 text-center space-y-1">
                            <div className="font-mono text-2xl font-black tracking-widest leading-none select-none">
                              ||||| ||| ||||||| |||| |||||
                            </div>
                            <span className="text-[10px] font-mono font-bold block">{ord.tracking_number || `TRK-${ord.order_id}`}</span>
                          </div>

                          {/* COD Amount Box */}
                          <div className="pt-3 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">MONTANT À ENCAISSER (COD)</span>
                              <span className="text-2xl font-black font-mono text-emerald-700">{ord.total} DH</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-500 block">Nb Articles: {ord.items?.length || 1}</span>
                              <span className="text-[9px] font-mono text-slate-400 block">{new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })(),
            document.body
          )}

          {/* -------------------- PRINT VIEW OVERLAY: A4 FACTURE & BON DE LIVRAISON -------------------- */}
          {mounted && isPrintInvoiceOpen && selectedOrder && createPortal(
            (() => {
              const invoiceOrder = selectedOrder as Order;
              return (
                <div 
                  onClick={(e) => { if (e.target === e.currentTarget) setIsPrintInvoiceOpen(false); }}
                  className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 z-[9999] overflow-y-auto print:bg-white print:p-0 print:inset-auto print:absolute print:overflow-visible"
                >
                  <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[85vh] overflow-y-auto print:max-h-none print:bg-white print:border-0 print:p-0 print:shadow-none print:max-w-none print:w-full print-label-container">
                    
                    {/* Invoice Top Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-6 print:border-slate-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-xs">
                            PO
                          </div>
                          <h2 className="font-black text-lg text-slate-950 uppercase tracking-tight">
                            {settings?.storeName || 'PARA OFFICINAL S.A'}
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Parapharmacie & K-Beauty Officiel au Maroc
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          ICE: 003198741000085 · RC: 458920 · Casakids & Beauty SARL
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-black rounded-lg uppercase tracking-wider">
                          BON DE LIVRAISON & FACTURE
                        </span>
                        <p className="text-xs font-mono font-bold text-slate-700 pt-1">
                          N° Commande: #{invoiceOrder.order_id}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Date: {new Date().toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Addresses Grid (Sender & Receiver) */}
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed print:bg-slate-50 print:border-slate-300">
                      {/* Emetteur */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          EXPÉDITEUR / BOUTIQUE
                        </span>
                        <strong className="text-sm font-black text-slate-900 block">{settings?.storeName || 'Para Officinal S.A'}</strong>
                        <p className="text-slate-600 font-medium">Boulevard d'Anfa, Maarif</p>
                        <p className="text-slate-600 font-medium">Casablanca, Maroc</p>
                        <p className="text-slate-600 font-mono font-bold">Tél: +212 522-202020</p>
                      </div>

                      {/* Destinataire */}
                      <div className="space-y-1 border-l border-slate-200 pl-6 print:border-slate-300">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          CLIENT DESTINATAIRE
                        </span>
                        <strong className="text-sm font-black text-slate-950 block">{invoiceOrder.customer_name}</strong>
                        <p className="text-slate-700 font-medium">{invoiceOrder.address}</p>
                        <p className="text-slate-900 font-black uppercase">{invoiceOrder.city}, Maroc</p>
                        <p className="text-slate-900 font-mono font-extrabold">{invoiceOrder.phone_number}</p>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        DÉTAIL DES ARTICLES COMMANDÉS
                      </h4>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden print:border-slate-300">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-600 font-black print:bg-slate-100">
                            <tr>
                              <th className="py-2.5 px-4">Article / Référence</th>
                              <th className="py-2.5 px-3 text-center">Quantité</th>
                              <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                              <th className="py-2.5 px-4 text-right">Total HT/TTC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                            {invoiceOrder.items?.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  <span className="font-extrabold text-slate-950 block">{item.title}</span>
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-black text-slate-950">
                                  {item.quantity}
                                </td>
                                <td className="py-3 px-3 text-right font-mono">
                                  {item.price.toFixed(2)} DH
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-black text-slate-950">
                                  {(item.price * item.quantity).toFixed(2)} DH
                                </td>
                              </tr>
                            ))}

                            {invoiceOrder.gift_item && (
                              <tr className="bg-emerald-50/50 text-emerald-800 italic">
                                <td className="py-2.5 px-4 font-bold flex items-center gap-1.5">
                                  <span>🎁</span> {invoiceOrder.gift_item} (Cadeau Offert)
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold">1</td>
                                <td className="py-2.5 px-3 text-right font-mono">0.00 DH</td>
                                <td className="py-2.5 px-4 text-right font-mono font-black">OFFERT</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Financial Summary & Transport Block */}
                    <div className="grid grid-cols-2 gap-6 pt-2">
                      {/* Shipping & Payment Method */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 print:bg-slate-50">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                          INFORMATIONS DE LIVRAISON & COD
                        </span>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500 font-medium">Mode de Paiement:</span>
                          <strong className="font-extrabold text-emerald-700">Cash à la Livraison (COD)</strong>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500 font-medium">Transporteur:</span>
                          <strong className="font-mono font-extrabold text-slate-900">{invoiceOrder.courier?.toUpperCase() || 'YALIDINE EXPRESS'}</strong>
                        </div>
                        {invoiceOrder.tracking_number && (
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 font-medium">Code Suivi:</span>
                            <strong className="font-mono font-bold text-indigo-600">{invoiceOrder.tracking_number}</strong>
                          </div>
                        )}
                      </div>

                      {/* Totals Breakdown */}
                      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs font-mono print:bg-slate-950">
                        <div className="flex justify-between text-slate-300">
                          <span>Sous-Total Articles:</span>
                          <span>{invoiceOrder.subtotal.toFixed(2)} DH</span>
                        </div>
                        {invoiceOrder.discount_amount > 0 && (
                          <div className="flex justify-between text-rose-400">
                            <span>Remise ({invoiceOrder.applied_coupon}):</span>
                            <span>-{invoiceOrder.discount_amount.toFixed(2)} DH</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-300">
                          <span>Frais de livraison:</span>
                          <span>{(invoiceOrder.total - invoiceOrder.subtotal + invoiceOrder.discount_amount).toFixed(2)} DH</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-700 text-sm font-black">
                          <span className="font-sans uppercase text-xs">Total TTC à Encaisser:</span>
                          <span className="text-base text-emerald-400">{invoiceOrder.total.toFixed(2)} DH</span>
                        </div>
                      </div>
                    </div>

                    {/* Signature & Legal Notice */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                      <div className="space-y-8">
                        <span className="uppercase font-bold block text-slate-700">Cachet & Signature Expéditeur:</span>
                        <div className="h-12 border-b border-dashed border-slate-300" />
                      </div>
                      <div className="space-y-8">
                        <span className="uppercase font-bold block text-slate-700">Signature Client / Réception:</span>
                        <div className="h-12 border-b border-dashed border-slate-300" />
                      </div>
                    </div>

                    {/* Print Action Buttons */}
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 print:hidden">
                      <button 
                        type="button" 
                        onClick={() => setIsPrintInvoiceOpen(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer transition"
                      >
                        Fermer
                      </button>
                      <button 
                        type="button" 
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-500 hover:to-teal-500 transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 text-white font-bold"
                      >
                        <Printer className="w-4 h-4 text-white" /> Imprimer le Bon de Livraison (A4)
                      </button>
                    </div>

                  </div>
                </div>
              );
            })(),
            document.body
          )}

          {/* -------------------- ADD GIFT / SAMPLE MODAL -------------------- */}
          {mounted && isAddGiftModalOpen && selectedOrder && createPortal(
            (() => {
              const giftOrder = selectedOrder as Order;
              const isDark = adminTheme === 'dark';
              return (
                <div 
                  onClick={(e) => { if (e.target === e.currentTarget) setIsAddGiftModalOpen(false); }}
                  className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
                >
                  <div className={`border p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl my-auto max-h-[85vh] overflow-y-auto animate-scale-up ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm uppercase tracking-tight">Ajouter un Échantillon Gratuit</h3>
                          <p className="text-[11px] opacity-70">Cadeau offert avec la commande #{giftOrder.order_id}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsAddGiftModalOpen(false)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Popular K-Beauty Presets */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Échantillons K-Beauty Populaires :</span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          "Anua Heartleaf Mousse Nettoyante Offert",
                          "Beauty of Joseon Crème Solaire 10ml",
                          "La Roche-Posay Cicaplast Baume B5",
                          "Mixsoon Bean Essence Échantillon",
                          "Sachet Échantillons K-Beauty Surprise (x3)"
                        ].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              const updatedOrder = { ...giftOrder, gift_item: preset };
                              setSelectedOrder(updatedOrder);
                              setOrders(prev => prev.map(o => o.order_id === giftOrder.order_id ? updatedOrder : o));
                              showToast(`Échantillon gratuit ajouté : ${preset}`, 'success');
                              setIsAddGiftModalOpen(false);
                            }}
                            className="p-3 rounded-xl text-left text-xs font-bold border transition hover:border-amber-500/50 hover:bg-amber-500/5 flex items-center justify-between group cursor-pointer"
                            style={{
                              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}
                          >
                            <span>🎁 {preset}</span>
                            <span className="text-[9.5px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition">
                              Choisir
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Input Option */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Ou Saisir un Cadeau Personnalisé :</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: Masque hydratant Laneige 20ml"
                          value={customGiftInput}
                          onChange={(e) => setCustomGiftInput(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl text-xs border outline-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customGiftInput.trim()) return;
                            const giftName = customGiftInput.trim();
                            const updatedOrder = { ...giftOrder, gift_item: giftName };
                            setSelectedOrder(updatedOrder);
                            setOrders(prev => prev.map(o => o.order_id === giftOrder.order_id ? updatedOrder : o));
                            showToast(`Échantillon gratuit ajouté : ${giftName}`, 'success');
                            setIsAddGiftModalOpen(false);
                            setCustomGiftInput('');
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Remove Gift Button */}
                    {giftOrder.gift_item && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOrder = { ...giftOrder, gift_item: null };
                            setSelectedOrder(updatedOrder);
                            setOrders(prev => prev.map(o => o.order_id === giftOrder.order_id ? updatedOrder : o));
                            showToast("Échantillon gratuit retiré", "info");
                            setIsAddGiftModalOpen(false);
                          }}
                          className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
                        >
                          Retirer l'échantillon actuellement offert
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })(),
            document.body
          )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-tab-enter">

      {/* Sub-tab navigation bar — Compact High-End Glass Island */}
      <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-0.5">
        <div
          className={`flex items-center gap-1 md:gap-1.5 p-1.5 rounded-2xl transition-all duration-300 w-fit max-w-full ${
            adminTheme === 'light'
              ? 'bg-slate-200/50 border border-slate-300/60 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md'
              : 'bg-slate-900/80 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl'
          }`}
          role="tablist"
        >
          {([
            { id: 'list',           label: 'Commandes',          icon: ShoppingBag,  count: orders.length },
            { id: 'abandoned',      label: 'Paniers Abandonnés', icon: ShoppingCart, count: abandonedCarts.length },
            { id: 'shipping',       label: 'Expéditions & COD',  icon: Truck,        count: orders.filter(o => o.courier).length },
            { id: 'reconciliation', label: 'Rapprochement COD',  icon: DollarSign,   count: orders.filter(o => o.courier && !o.reconciled).length }
          ] as const).map((tab) => {
            const TabIcon = tab.icon;
            const isActive = ordersSubTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setOrdersSubTab(tab.id)}
                className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl font-bold tracking-tight transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-[0.97] text-[10.5px] md:text-[11.5px] whitespace-nowrap ${
                  isActive
                    ? (adminTheme === 'light'
                        ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.08)] border border-slate-200/90 font-black'
                        : 'bg-emerald-500 text-slate-950 shadow-[0_4px_16px_rgba(16,185,129,0.3)] border border-emerald-400/30 font-black')
                    : (adminTheme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent font-semibold')
                }`}
              >
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${adminTheme === 'light' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-slate-950'}`} />
                )}
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? (adminTheme === 'light' ? 'text-emerald-600' : 'text-slate-950') : 'opacity-65'}`} /> 
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 px-2 py-0.5 rounded-full font-mono font-extrabold text-[10px] transition-all ${
                    isActive
                      ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-950/20 text-slate-950')
                      : (adminTheme === 'light' ? 'bg-slate-300/50 text-slate-700' : 'bg-white/10 text-slate-300')
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- ABANDONED CARTS FULL VIEW ---- */}
      {ordersSubTab === 'abandoned' && (
        <div className="space-y-5 t-panel">

          {/* ── Bulk WhatsApp Blast Modal ────────────────────────────────────── */}
          {isBulkBlastModalOpen && mounted && createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
              onClick={() => setIsBulkBlastModalOpen(false)}
            >
              <div
                className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
                  adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                      <Send className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className={`font-black text-base ${adminTheme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Blast WhatsApp Paniers Abandonnés</h3>
                      <p className="text-[11px] text-slate-500">Envoi groupé de messages de relance</p>
                    </div>
                  </div>
                  <button onClick={() => setIsBulkBlastModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800/50 transition cursor-pointer">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Paniers ciblés', value: abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-900/30' },
                      { label: 'CA potentiel', value: `${abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted').reduce((s, c) => s + (c.total || 0), 0).toFixed(0)} DH`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-900/30' },
                      { label: 'Code promo', value: settings?.coupons?.[0]?.code || 'BEAUTY10', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-900/30' },
                    ].map((s, i) => (
                      <div key={i} className={`rounded-xl p-3 border text-center ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : s.bg}`}>
                        <span className={`text-lg font-black font-mono block ${adminTheme === 'light' ? 'text-slate-900' : s.color}`}>{s.value}</span>
                        <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Language selector */}
                  <div className={`flex gap-2 p-1 rounded-xl ${adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-900'}`}>
                    {(['Fr', 'Ar'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setBulkBlastLang(lang)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          bulkBlastLang === lang
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : (adminTheme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800')
                        }`}
                      >
                        {lang === 'Fr' ? '🇫🇷 Français' : '🇲🇦 Darija / Arabe'}
                      </button>
                    ))}
                  </div>

                  {/* Message preview */}
                  <div className={`rounded-xl p-4 border text-xs font-mono leading-relaxed max-h-36 overflow-y-auto ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    {(() => {
                      const key = bulkBlastLang === 'Ar' ? 'recoveryAr' : 'recoveryFr';
                      const template = (settings?.notificationTemplates?.[key] as string) || (bulkBlastLang === 'Fr'
                        ? 'Bonjour {customer_name} 👋\nVous avez laissé {cart_items} dans votre panier.\nUtilisez le code {discount_code} pour -10% ! 🎁\n{recovery_link}'
                        : 'السلام عليكم {customer_name} 👋\nنسيتي {cart_items} في السلة.\nاستخدمي {discount_code} للحصول على خصم 🎁\n{recovery_link}');
                      return template
                        .replace(/{customer_name}/g, 'Client(e)')
                        .replace(/{cart_items}/g, 'vos produits')
                        .replace(/{cart_total}/g, '—')
                        .replace(/{discount_code}/g, settings?.coupons?.[0]?.code || 'BEAUTY10')
                        .replace(/{recovery_link}/g, 'https://para-officinal.ma/checkout?recover=…');
                    })()}
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-900/30">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-400 leading-relaxed">
                      Les liens WhatsApp s'ouvriront un par un dans votre navigateur. Si le navigateur bloque les popups, utilisez le bouton "Copier tous les liens" ci-dessous.
                    </p>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 p-6 pt-0">
                  <button
                    onClick={() => {
                      const uncontacted = abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted');
                      // Copy all WA links to clipboard as fallback
                      const links = uncontacted.map(c => buildCartRecoveryLink(c, bulkBlastLang)).join('\n');
                      navigator.clipboard.writeText(links).then(() => showToast('Liens copiés dans le presse-papiers ✓', 'success'));
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      adminTheme === 'light' ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5 inline mr-1.5" />
                    Copier tous les liens
                  </button>
                  <button
                    onClick={() => {
                      const uncontacted = abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted');
                      uncontacted.forEach((c, i) => {
                        setTimeout(() => {
                          window.open(buildCartRecoveryLink(c, bulkBlastLang), '_blank');
                          handleUpdateCartRecovery(c.phone, 'contacted');
                        }, i * 400);
                      });
                      setIsBulkBlastModalOpen(false);
                      showToast(`${uncontacted.length} messages WhatsApp ouverts ✓`, 'success');
                    }}
                    className="premium-green-cta flex-1 py-3 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)]"
                  >
                    <Send className="w-3.5 h-3.5 inline mr-1.5" />
                    Envoyer le Blast ({abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted').length} carts)
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

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

          {/* Unified recovery list - uses the same operational data surface as the orders list. */}
          <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: adminTheme === 'light' ? '#ffffff' : 'hsl(224,25%,9%)',
              border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: adminTheme === 'light' ? '0 4px 20px -4px rgba(15,23,42,0.05)' : '0 4px 24px rgba(0,0,0,0.35)',
            }}
          >
            <div className="p-4 space-y-3 border-b" style={{ borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: adminTheme === 'light' ? '#94a3b8' : '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par client ou téléphone..."
                    value={abandonedSearchQuery}
                    onChange={e => setAbandonedSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none transition duration-200"
                    style={{
                      background: adminTheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                      color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9',
                    }}
                  />
                </div>
                <button
                  onClick={() => setIsBulkBlastModalOpen(true)}
                  className="premium-green-cta group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-300 dark:text-slate-950" />
                  Relancer via WhatsApp
                  <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white dark:bg-slate-950/15 dark:text-slate-950">
                    {abandonedCarts.filter(c => (cartRecoveryStatus[c.phone] || 'not_contacted') === 'not_contacted').length}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px] font-mono" style={{ color: adminTheme === 'light' ? '#64748b' : '#94a3b8' }}>
                <span>{filteredAbandonedCarts.length} panier{filteredAbandonedCarts.length !== 1 ? 's' : ''} affiché{filteredAbandonedCarts.length !== 1 ? 's' : ''}</span>
                <span>Relance client et suivi de récupération</span>
              </div>
            </div>
            <div className="overflow-x-auto" data-admin-scroll>
              <table className="w-full min-w-[1080px] text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: adminTheme === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)',
                      borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                      color: adminTheme === 'light' ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Panier</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Date & heure</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Relance</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Total</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11.5px] font-medium" style={{ borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)' }}>
                  {filteredAbandonedCarts.map((cart, idx) => {
                    const status = cartRecoveryStatus[cart.phone] || 'not_contacted';
                    const statusConfig = {
                      not_contacted: { label: 'À relancer', color: '#64748b', tint: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.20)' },
                      contacted: { label: 'Contacté', color: '#d97706', tint: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.24)' },
                      recovered: { label: 'Récupéré', color: '#059669', tint: 'rgba(5,150,105,0.10)', border: 'rgba(5,150,105,0.24)' },
                    };
                    const recovery = statusConfig[status];
                    const dateObj = new Date(cart.created_at || cart.date || Date.now());
                    const avatarGradients = [
                      'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    ];
                    return (
                      <tr
                        key={`${cart.phone}-${cart.created_at || cart.date || idx}`}
                        className="group transition-colors duration-150"
                        style={{ borderBottom: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}` }}
                      >
                        <td className="py-4 px-4 whitespace-nowrap min-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs" style={{ background: avatarGradients[idx % avatarGradients.length] }}>
                              {(cart.name || 'CL').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs truncate group-hover:text-emerald-500 transition-colors" style={{ color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9' }}>{cart.name || 'Client non identifié'}</p>
                              <div className="flex items-center gap-2 text-[11px] font-mono opacity-70">
                                <span>{cart.phone}</span>
                                {cart.clientProfileName && <><span>•</span><span className="font-sans">{cart.clientProfileName}</span></>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap max-w-[280px]">
                          <div className="flex items-center gap-1">
                            {cart.items?.slice(0, 2).map((item: any, itemIndex: number) => {
                              const title = item.title || item.product?.title || 'Produit';
                              return (
                                <span key={itemIndex} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold truncate max-w-[170px]" style={{ background: adminTheme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', color: adminTheme === 'light' ? '#334155' : '#cbd5e1', border: `1px solid ${adminTheme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}` }}>
                                  <span className="truncate">{title}</span>
                                  <span className="px-1.5 py-0.5 rounded-md font-mono font-black text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">x{item.quantity || 1}</span>
                                </span>
                              );
                            })}
                            {(cart.items?.length || 0) > 2 && <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600">+{cart.items.length - 2}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-bold" style={{ color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9' }}>{dateObj.toLocaleDateString('fr-FR')}</span>
                            <span className="text-[10px] opacity-60 font-medium">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={status}
                            onChange={event => handleUpdateCartRecovery(cart.phone, event.target.value as 'not_contacted' | 'contacted' | 'recovered')}
                            className="rounded-xl px-3 py-1.5 text-[10px] font-black outline-none cursor-pointer transition"
                            style={{ color: recovery.color, background: recovery.tint, border: `1px solid ${recovery.border}` }}
                          >
                            <option value="not_contacted">À relancer</option>
                            <option value="contacted">Contacté</option>
                            <option value="recovered">Récupéré</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">{Number(cart.total || 0).toFixed(2)} <span className="text-xs font-sans font-bold">DH</span></td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <a href={buildCartRecoveryLink(cart, 'Fr')} target="_blank" rel="noopener noreferrer" onClick={() => handleUpdateCartRecovery(cart.phone, 'contacted')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-extrabold transition active:scale-95" style={{ background: adminTheme === 'light' ? '#ecfdf5' : 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)', color: '#059669' }}><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</a>
                            {status !== 'recovered' && <button type="button" onClick={() => handleUpdateCartRecovery(cart.phone, 'recovered')} className="rounded-xl px-3 py-1.5 text-[10px] font-extrabold transition active:scale-95 cursor-pointer" style={{ background: adminTheme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)', border: `1px solid ${adminTheme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`, color: adminTheme === 'light' ? '#334155' : '#cbd5e1' }}>Récupéré</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAbandonedCarts.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-xs italic opacity-70">Aucun panier abandonné ne correspond à ces critères.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- ORDERS LIST VIEW ---- */}
      {ordersSubTab === 'list' && (
        <div className="t-panel space-y-5 animate-fade-in">
          <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="admin-quiet-label">Opérations commerciales</p>
              <h1 className={`mt-1 text-[25px] font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-950' : 'text-slate-50'}`}>Commandes</h1>
              <p className="mt-1 text-[12px] font-medium text-slate-500">Suivez, préparez et finalisez chaque commande client.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex p-1 rounded-lg ${adminTheme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'}`} role="group" aria-label="Mode d'affichage des commandes">
              <button type="button" onClick={() => setOrderPresentation('table')} aria-pressed={orderPresentation === 'table'} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition ${orderPresentation === 'table' ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white') : 'text-slate-500'}`}>
                <List className="w-3.5 h-3.5" /> Liste
              </button>
              <button type="button" onClick={() => setOrderPresentation('board')} aria-pressed={orderPresentation === 'board'} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition ${orderPresentation === 'board' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                <KanbanSquare className="w-3.5 h-3.5" /> Flux
              </button>
              </div>
              <button
                type="button"
                onClick={() => handleExportOrdersToCsv(filteredOrders)}
                className="premium-green-cta inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                <FileText className="h-3.5 w-3.5" /> Exporter
              </button>
            </div>
          </header>

          {orderPresentation === 'board' && (
            <section className="overflow-x-auto pb-2" data-admin-scroll aria-label="Flux des commandes par statut">
              <div className="grid grid-cols-4 gap-3 min-w-[980px]">
                {[
                  { status: 'Pending', label: 'À confirmer', accent: '#f59e0b', action: 'Confirmed', actionLabel: 'Confirmer' },
                  { status: 'Confirmed', label: 'À préparer', accent: '#3b82f6', action: 'Shipped', actionLabel: 'Expédier' },
                  { status: 'Shipped', label: 'En livraison', accent: '#6366f1', action: 'Delivered', actionLabel: 'Livrée' },
                  { status: 'Delivered', label: 'Terminées', accent: '#10b981', action: null, actionLabel: '' },
                ].map(column => {
                  const columnOrders = filteredOrders.filter(order => order.status === column.status);
                  return (
                    <div key={column.status} className={`rounded-2xl border p-3 ${adminTheme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                      <div className="flex items-center justify-between gap-2 px-1 pb-3">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: column.accent }}><span className="w-2 h-2 rounded-full" style={{ background: column.accent }} />{column.label}</span>
                        <span className="font-mono text-[10px] text-slate-500">{columnOrders.length}</span>
                      </div>
                      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                        {columnOrders.slice(0, 12).map(order => (
                          <article key={order.order_id} className={`rounded-xl border p-3 transition hover:-translate-y-0.5 ${adminTheme === 'light' ? 'bg-white border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)]' : 'bg-slate-900 border-slate-800'}`}>
                            <button type="button" onClick={() => setSelectedOrder(order)} className="w-full text-left">
                              <div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px] font-bold text-slate-500">#{order.order_id}</span><span className="text-[10px] font-black" style={{ color: column.accent }}>{Number(order.total || 0).toFixed(0)} DH</span></div>
                              <p className={`mt-2 text-[12px] font-black truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>{order.customer_name}</p>
                              <p className="mt-1 text-[10px] text-slate-500 truncate">{order.city || 'Ville non renseignée'} · {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}</p>
                            </button>
                            {column.action && <button type="button" onClick={() => handleUpdateOrderStatus(order.order_id, column.action!)} className="mt-3 w-full rounded-lg py-1.5 text-[10px] font-black transition hover:brightness-105" style={{ color: column.accent, background: `${column.accent}14`, border: `1px solid ${column.accent}28` }}>{column.actionLabel}</button>}
                          </article>
                        ))}
                        {columnOrders.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[10px] font-semibold text-slate-400">Aucune commande</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Status overview */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'En attente',
                value: orders.filter(o => o.status === 'Pending').length,
                subtext: 'À confirmer',
                color: '#d97706',
                icon: AlertTriangle,
              },
              {
                label: 'À préparer',
                value: orders.filter(o => o.status === 'Confirmed').length,
                subtext: 'Confirmées',
                color: '#2563eb',
                icon: ClipboardList,
              },
              {
                label: 'Expédiées',
                value: orders.filter(o => o.status === 'Shipped').length,
                subtext: 'En transit',
                color: '#6366f1',
                icon: Truck,
              },
              {
                label: 'Annulées / retournées',
                value: orders.filter(o => ['Cancelled', 'Returned'].includes(o.status)).length,
                subtext: 'À analyser',
                color: '#e11d48',
                icon: RefreshCw,
              },
            ].map((metric, i) => {
              const MetricIcon = metric.icon;
              const share = orders.length ? Math.round((metric.value / orders.length) * 100) : 0;
              return (
                <div
                  key={i}
                  className="min-h-[132px] p-4 rounded-xl flex flex-col justify-between transition-all duration-300"
                  style={{
                    background: adminTheme === 'light' ? '#ffffff' : 'hsl(224,25%,9%)',
                    border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: adminTheme === 'light' ? '0 2px 12px -2px rgba(15,23,42,0.04)' : '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest block" style={{ color: adminTheme === 'light' ? '#64748b' : '#94a3b8' }}>{metric.label}</span>
                      <span className="mt-1 block text-[28px] leading-none font-black font-mono tracking-tight" style={{ color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9' }}>{metric.value}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${metric.color}14` }}>
                      <MetricIcon className="w-4 h-4" style={{ color: metric.color }} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold" style={{ color: adminTheme === 'light' ? '#64748b' : '#94a3b8' }}><span>{metric.subtext}</span><span>{share}%</span></div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: adminTheme === 'light' ? '#edf1f4' : 'rgba(255,255,255,0.08)' }}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${share}%`, background: metric.color }} /></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Orders Data Card */}
          {orderPresentation === 'table' &&
          <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: adminTheme === 'light' ? '#ffffff' : 'hsl(224,25%,9%)',
              border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: adminTheme === 'light' ? '0 4px 20px -4px rgba(15,23,42,0.05)' : '0 4px 24px rgba(0,0,0,0.35)',
            }}
          >
            {/* Integrated Toolbar Header (Search + Status Pills + CSV Action) */}
            <div className="p-4 space-y-3 border-b" style={{ borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Omnibox */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: adminTheme === 'light' ? '#94a3b8' : '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Rechercher par N° commande (#PO-102), client, téléphone, ville..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl pl-10 pr-9 py-2.5 outline-none transition duration-200"
                    style={{
                      background: adminTheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                      color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9',
                    }}
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* CSV Export Button */}
                <button
                  onClick={() => handleExportOrdersToCsv(filteredOrders)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                  style={{
                    background: adminTheme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                    color: adminTheme === 'light' ? '#334155' : '#cbd5e1',
                  }}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Exporter CSV ({filteredOrders.length})</span>
                </button>
              </div>

              {/* Status Segment Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { id: 'ALL', label: 'Toutes', count: orders.length, color: '#0f172a' },
                  { id: 'PENDING', label: 'En attente', count: orders.filter(o => o.status === 'Pending').length, color: '#d97706' },
                  { id: 'CONFIRMED', label: 'Confirmées', count: orders.filter(o => o.status === 'Confirmed').length, color: '#2563eb' },
                  { id: 'SHIPPED', label: 'Expédiées', count: orders.filter(o => o.status === 'Shipped').length, color: '#4f46e5' },
                  { id: 'DELIVERED', label: 'Livrées', count: orders.filter(o => o.status === 'Delivered').length, color: '#059669' },
                  { id: 'CANCELLED', label: 'Annulées', count: orders.filter(o => o.status === 'Cancelled').length, color: '#e11d48' },
                ].map(st => {
                  const isActive = orderStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setOrderStatusFilter(st.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer"
                      style={{
                        background: isActive
                          ? (adminTheme === 'light' ? '#0f172a' : '#ffffff')
                          : (adminTheme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'),
                        color: isActive
                          ? (adminTheme === 'light' ? '#ffffff' : '#0f172a')
                          : (adminTheme === 'light' ? '#64748b' : '#94a3b8'),
                        border: `1px solid ${isActive ? 'transparent' : (adminTheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)')}`,
                      }}
                    >
                      <span>{st.label}</span>
                      <span
                        className="px-2 py-0.2 rounded-full font-mono text-[10px] font-bold"
                        style={{
                          background: isActive
                            ? (adminTheme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)')
                            : (adminTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'),
                        }}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto" data-admin-scroll>
              <table className="w-full min-w-[1180px] text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: adminTheme === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)',
                      borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                      color: adminTheme === 'light' ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(filteredOrders.map(o => o.order_id));
                          } else {
                            setSelectedOrderIds([]);
                          }
                        }}
                        className="rounded cursor-pointer w-4 h-4 accent-emerald-500"
                      />
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Commande</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Date & Heure</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Articles</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Total</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Paiement</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Exécution</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y text-[11.5px] font-medium"
                  style={{ borderColor: adminTheme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)' }}
                >
                  {filteredOrders.map((order, idx) => {
                    const dateObj = new Date(order.created_at || order.date || Date.now());
                    const isSelected = selectedOrderIds.includes(order.order_id);

                    const paymentMethod = (order.payment_method || 'cod').toLowerCase();
                    const paymentLabel = paymentMethod === 'cod' ? 'À la livraison' : paymentMethod === 'cmi' ? 'CMI' : paymentMethod === 'stripe' ? 'Stripe' : paymentMethod === 'card' ? 'Carte' : paymentMethod;
                    const paymentPaid = (order.payment_status || '').toLowerCase() === 'paid';
                    const fulfillmentLabel = order.courier ? order.courier.charAt(0).toUpperCase() + order.courier.slice(1) : order.status === 'Delivered' ? 'Terminée' : 'À expédier';

                    const avatarGradients = [
                      'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    ];
                    const avatarBg = avatarGradients[idx % avatarGradients.length];

                    return (
                      <tr
                        key={order.order_id}
                        onClick={() => setSelectedOrder(order)}
                        className="group transition-colors duration-150 cursor-pointer"
                        style={{
                          background: isSelected
                            ? (adminTheme === 'light' ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.08)')
                            : 'transparent',
                          borderBottom: `1px solid ${adminTheme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderIds(prev => [...prev, order.order_id]);
                              } else {
                                setSelectedOrderIds(prev => prev.filter(id => id !== order.order_id));
                              }
                            }}
                            className="rounded cursor-pointer w-4 h-4 accent-emerald-500"
                          />
                        </td>

                        {/* Order ID — Single Line Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className="inline-block px-3 py-1 rounded-xl font-mono text-xs font-black shadow-2xs"
                            style={{
                              background: adminTheme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                              color: adminTheme === 'light' ? '#0f172a' : '#f8fafc',
                              border: `1px solid ${adminTheme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {order.order_id}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-bold" style={{ color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9' }}>
                              {dateObj.toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-[10px] opacity-60 font-medium">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>

                        {/* Customer Cell */}
                        <td className="py-4 px-4 whitespace-nowrap min-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs"
                              style={{ background: avatarBg }}
                            >
                              {order.customer_name ? order.customer_name.slice(0, 2).toUpperCase() : 'CL'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs truncate group-hover:text-emerald-500 transition-colors" style={{ color: adminTheme === 'light' ? '#0f172a' : '#f1f5f9' }}>
                                {order.customer_name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] font-mono opacity-70">
                                <span>{order.city}</span>
                                <span>•</span>
                                <span>{order.phone_number}</span>
                                <a
                                  href={`https://wa.me/${order.phone_number.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-600 hover:text-emerald-500 font-extrabold transition ml-0.5"
                                  title="WhatsApp"
                                >
                                  WA
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Articles */}
                        <td className="py-4 px-4 whitespace-nowrap max-w-[240px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {order.items?.slice(0, 2).map((item, idx2) => (
                              <span
                                key={idx2}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold truncate max-w-[170px]"
                                style={{
                                  background: adminTheme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                                  color: adminTheme === 'light' ? '#334155' : '#cbd5e1',
                                  border: `1px solid ${adminTheme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                }}
                              >
                                <span className="truncate">{item.title}</span>
                                <span className="px-1.5 py-0.5 rounded-md font-mono font-black text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                  x{item.quantity}
                                </span>
                              </span>
                            ))}
                            {order.items && order.items.length > 2 && (
                              <span
                                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold"
                                style={{
                                  background: 'rgba(16,185,129,0.1)',
                                  color: '#10b981',
                                }}
                              >
                                +{order.items.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status control */}
                        <td className="py-4 px-4 whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                          <OrderStatusPicker
                            value={order.status}
                            isDark={adminTheme === 'dark'}
                            compact
                            onChange={(newStatus) => handleUpdateOrderStatus(order.order_id, newStatus)}
                          />
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {order.total.toFixed(2)} <span className="text-xs font-sans font-bold">DH</span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: paymentPaid ? '#059669' : '#64748b' }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: paymentPaid ? '#10b981' : '#94a3b8' }} />
                            <span>{paymentLabel}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: order.courier || order.status === 'Delivered' ? '#059669' : '#a16207' }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: order.courier || order.status === 'Delivered' ? '#10b981' : '#f59e0b' }} />
                            <span>{fulfillmentLabel}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95"
                            style={{
                              background: adminTheme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${adminTheme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                              color: adminTheme === 'light' ? '#0f172a' : '#f8fafc',
                            }}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-xs italic opacity-70">
                        Aucune commande ne correspond à ces critères
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>}

          {/* Floating Bulk Actions Bar */}
          {selectedOrderIds.length > 0 && (
            <div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl shadow-2xl animate-slide-up"
              style={{
                background: adminTheme === 'light' ? 'rgba(15,23,42,0.92)' : 'rgba(15,23,42,0.95)',
                color: '#ffffff',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {selectedOrderIds.length} sélectionnée(s)
              </span>

              <div className="h-4 w-px bg-slate-700" />

              <button
                onClick={() => handleBulkUpdate('Confirmed')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition cursor-pointer"
              >
                Confirmer
              </button>

              <button
                onClick={() => handleBulkUpdate('Shipped')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer"
              >
                Expédier
              </button>

              <button
                onClick={() => handleBulkUpdate('Delivered')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer"
              >
                Livrer
              </button>

              <button
                onClick={() => setIsBatchLabelPrintOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer A6 ({selectedOrderIds.length})
              </button>

              <button
                onClick={() => {
                  const toExp = orders.filter(o => selectedOrderIds.includes(o.order_id));
                  handleExportOrdersToCsv(toExp);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Exporter CSV
              </button>

              <button
                onClick={() => setSelectedOrderIds([])}
                className="px-2 py-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 font-bold transition cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- SUB-TAB 3: MOROCCAN COD SHIPPING & RECONCILIATION HUB ---- */}
      {ordersSubTab === 'shipping' && (
        <div className="space-y-6 t-panel">
          
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 ${adminTheme === 'light' ? 'border-slate-100' : 'border-slate-900'}`}>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-500" />
                Suivi et Intelligence Logistique Yalidine & Cathedis
              </h3>
              <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                Comparatif des transporteurs, prévisions de cash-flow et synchronisation des statuts COD.
              </p>
            </div>
            <button
              onClick={handleSyncCourierStatusesSubmit}
              disabled={isSyncingCouriers}
              className="premium-green-cta flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
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
                sub: `Sur ${shippingStats.total} expéditions`,
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

          {/* ── COURIER PERFORMANCE COMPARISON RADAR & CASH FLOW TIMELINE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Courier Comparison Radar Card (2 Cols) */}
            {(() => {
              const yalidineList = orders.filter(o => o.courier === 'yalidine' || (o.tracking_number && o.tracking_number.toUpperCase().startsWith('YAL')));
              const cathedisList = orders.filter(o => o.courier === 'cathedis' || (o.tracking_number && o.tracking_number.toUpperCase().startsWith('CAT')));

              const computeCourierStats = (list: Order[]) => {
                const total = list.length || 1;
                const delivered = list.filter(o => o.status === 'Delivered').length;
                const returned = list.filter(o => o.status === 'Cancelled').length;
                const successRate = Math.round((delivered / total) * 100);
                const returnRate = Math.round((returned / total) * 100);
                const cashCollected = list.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + (o.total || 0), 0);
                return { total: list.length, delivered, returned, successRate, returnRate, cashCollected };
              };

              const yal = computeCourierStats(yalidineList);
              const cat = computeCourierStats(cathedisList);

              return (
                <div 
                  className={`lg:col-span-2 p-5 rounded-2xl border transition-all duration-300 ${
                    adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-4 border-b pb-3 border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Radar Comparatif Transporteurs : Yalidine vs. Cathedis
                      </h4>
                      <p className="text-[10.5px] text-slate-400">Analyse de performance des livraisons et retours COD</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Live Matrix
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Yalidine Block */}
                    <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">Y</div>
                          <strong className="text-xs font-black uppercase">Yalidine Express</strong>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-500">{yal.total} colis</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Taux de Livraison Réussie</span>
                          <span className="text-emerald-500">{yal.successRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${yal.successRate}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Taux de Retour / Annulation</span>
                          <span className="text-rose-500">{yal.returnRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${yal.returnRate}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold">Total Encaissé (COD) :</span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">{yal.cashCollected.toFixed(0)} DH</span>
                      </div>
                    </div>

                    {/* Cathedis Block */}
                    <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">C</div>
                          <strong className="text-xs font-black uppercase">Cathedis Express</strong>
                        </div>
                        <span className="text-xs font-mono font-black text-indigo-500">{cat.total} colis</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Taux de Livraison Réussie</span>
                          <span className="text-emerald-500">{cat.successRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${cat.successRate}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Taux de Retour / Annulation</span>
                          <span className="text-rose-500">{cat.returnRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${cat.returnRate}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold">Total Encaissé (COD) :</span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">{cat.cashCollected.toFixed(0)} DH</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pending Cash Flow Payout Timeline (1 Col) */}
            {(() => {
              const pendingOrders = orders.filter(o => o.courier && !o.reconciled && o.status !== 'Cancelled');
              const totalPendingAmount = pendingOrders.reduce((acc, o) => acc + (o.total || 0), 0);

              const scheduleDays = [
                { day: 'Mardi Prochain', courier: 'Yalidine (Cycle Hebdo)', amount: Math.round(totalPendingAmount * 0.6), status: 'Planifié' },
                { day: 'Jeudi Prochain', courier: 'Cathedis (Virement Bank)', amount: Math.round(totalPendingAmount * 0.4), status: 'En attente' },
              ];

              return (
                <div 
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 border-b pb-2 border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        Échéancier Payout COD
                      </h4>
                      <span className="text-[10px] font-mono font-extrabold text-amber-500">7 Jours</span>
                    </div>

                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Virements Attendus Sur Compte</span>
                      <strong className="text-xl font-black font-mono text-emerald-500">{totalPendingAmount.toFixed(0)} DH</strong>
                    </div>

                    <div className="space-y-2.5">
                      {scheduleDays.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold block text-[11px]">{item.day}</span>
                            <span className="text-[9.5px] text-slate-400 block">{item.courier}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-extrabold text-emerald-400 block">{item.amount} DH</span>
                            <span className="text-[9px] font-bold text-amber-400 uppercase block">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 italic mt-4 text-center">
                    Note: Les montants sont basés sur les bordereaux en cours d'acheminement.
                  </p>
                </div>
              );
            })()}

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
                        <tr key={o.order_id} className={`transition-colors admin-row-enter ${
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
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
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
                  : (adminTheme === 'light' ? 'border-slate-200 hover:border-slate-300 bg-white' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10')
              }`}
            >
              <div className={`p-4 rounded-full border transition ${
                adminTheme === 'light' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-500'
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
                          : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800')
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
                        adminTheme === 'light' ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
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
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-slate-50 border-slate-200 text-slate-400">
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
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wider bg-amber-50 border-amber-200 text-amber-800">
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
                            <tr
                               key={row.id}
                               onClick={() => {
                                 if (row.matchType !== 'PERFECT' && row.matchType !== 'ALREADY_RECONCILED') {
                                   setSelectedReconRow(row);
                                 }
                               }}
                               className={`transition-colors admin-row-enter ${
                                 adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                               } ${
                                 row.matchType !== 'PERFECT' && row.matchType !== 'ALREADY_RECONCILED'
                                   ? 'cursor-pointer'
                                   : ''
                               }`}
                            >
                              <td className="p-4 font-mono font-extrabold">
                                {o ? (
                                  <span className="cursor-pointer hover:underline text-emerald-600" onClick={() => setSelectedOrder(o)}>
                                    #{o.order_id}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">{row.fileOrderId || '—'}</span>
                                )}
                                {o && (
                                  <span className={`text-[10px] block ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
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
                                    <span className="text-[10.5px] text-slate-400 font-bold flex items-center gap-1 justify-end">
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

      {/* SPLIT-SCREEN RECONCILIATION COMPARISON DRAWER */}
      {selectedReconRow && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedReconRow(null)}
        >
          <div
            className={`w-full max-w-2xl h-full shadow-2xl border-l flex flex-col animate-in slide-in-from-right duration-300 ${
              adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  selectedReconRow.matchType === 'AMOUNT_MISMATCH'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {selectedReconRow.matchType === 'AMOUNT_MISMATCH' ? 'Écart de Montant' : 'Écart de Statut'}
                </span>
                <h3 className={`text-sm font-black mt-1.5 ${
                  adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'
                }`}>Analyse de l&apos;Écart — {selectedReconRow.id}</h3>
              </div>
              <button
                onClick={() => setSelectedReconRow(null)}
                className={`cursor-pointer transition ${
                  adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split comparison body */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-4">
              {/* CSV Side */}
              <div className={`rounded-2xl border p-4 space-y-3 ${
                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">Fichier Livreur (CSV)</h4>
                {[
                  ['ID', selectedReconRow.id],
                  ['Montant COD', `${selectedReconRow.codAmount ?? '-'} DH`],
                  ['Statut', selectedReconRow.status],
                  ['Livreur', selectedReconRow.courier],
                  ['Tracking', selectedReconRow.trackingNumber || '-'],
                ].map(([label, value]) => (
                  <div key={label} className={`flex justify-between items-center py-1.5 border-b last:border-0 ${
                    adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'
                  }`}>
                    <span className="text-[10px] font-semibold text-slate-400">{label}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-right max-w-[140px] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* DB Order Side */}
              <div className={`rounded-2xl border p-4 space-y-3 ${
                adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
              }`}>
                <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">Base de Données (Commande)</h4>
                {selectedReconRow.matchedOrder ? [
                  ['ID', selectedReconRow.matchedOrder.order_id],
                  ['Montant COD', `${selectedReconRow.matchedOrder.cod_amount ?? '-'} DH`],
                  ['Statut', selectedReconRow.matchedOrder.status],
                  ['Client', selectedReconRow.matchedOrder.customer_name],
                  ['Téléphone', selectedReconRow.matchedOrder.phone_number],
                ].map(([label, value]) => {
                  const isMismatch =
                    (label === 'Montant COD' && selectedReconRow.matchType === 'AMOUNT_MISMATCH') ||
                    (label === 'Statut' && selectedReconRow.matchType === 'STATUS_MISMATCH');
                  return (
                    <div key={label} className={`flex justify-between items-center py-1.5 border-b last:border-0 ${
                      adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
                    }`}>
                      <span className="text-[10px] font-semibold text-slate-400">{label}</span>
                      <span className={`text-[11px] font-bold text-right max-w-[140px] truncate ${
                        isMismatch ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'
                      }`}>{value}</span>
                    </div>
                  );
                }) : (
                  <p className="text-[11px] text-rose-500 font-bold text-center py-6">Aucune commande correspondante trouvée dans la base de données.</p>
                )}
              </div>
            </div>

            {/* Footer message */}
            {selectedReconRow.discrepancyMessage && (
              <div className={`p-4 border-t text-xs font-semibold ${
                adminTheme === 'light' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-950/20 border-amber-900/30 text-amber-400'
              }`}>
                ⚠️ {selectedReconRow.discrepancyMessage}
              </div>
            )}
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
                className="premium-green-cta px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
              >
                {isRegisteringShipping ? 'Enregistrement...' : 'Générer Bordereau & Colis'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Bulk Action Bar for Orders */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-scale-up">
          <div className={`backdrop-blur-2xl border p-4.5 shadow-2xl rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-all duration-300 ${
            adminTheme === 'light'
              ? 'bg-white/95 border-slate-200/80 shadow-[0_20px_50px_rgba(15,30,54,0.12)] text-slate-800'
              : 'bg-slate-950/85 border-slate-850/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold">
                {selectedOrderIds.length} commande(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleBulkUpdate('Confirmed')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-blue-600/10 active:scale-95"
              >
                Confirmer
              </button>
              <button
                onClick={() => handleBulkUpdate('Shipped')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-600/10 active:scale-95"
              >
                Expédier
              </button>
              <button
                onClick={() => handleBulkUpdate('Cancelled')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-rose-600/10 active:scale-95"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const toExport = orders.filter(o => selectedOrderIds.includes(o.order_id));
                  handleExportOrdersToCsv(toExport);
                }}
                className={`px-3 py-1.5 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer border shadow-2xs ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-350 border-slate-800'
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
                className={`px-3 py-1.5 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer border shadow-2xs ${
                  adminTheme === 'light'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
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
                className={`px-3 py-1.5 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer border shadow-2xs ${
                  adminTheme === 'light'
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                Cathedis CSV
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className={`px-3 py-1.5 bg-transparent font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                  adminTheme === 'light'
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/60'
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
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
