'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  Search, 
  AlertTriangle, 
  Table, 
  Plus, 
  AlertCircle, 
  Edit3, 
  Layers, 
  Globe, 
  Upload, 
  X,
  Check,
  TrendingUp,
  Loader2,
  Download,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  Filter,
  ImageOff,
  TrendingDown,
  CalendarClock,
  Percent,
  Coins,
  FileText,
  CheckSquare
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/lib/data';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';

interface CatalogTabProps {
  catalogStockFilter?: boolean;
  setCatalogStockFilter?: (filter: boolean) => void;
}

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  emptyMessage: string;
  adminTheme: 'light' | 'dark';
}

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  emptyMessage,
  adminTheme
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedDisplay = useMemo(() => {
    if (value === 'all') return label;
    return value.toUpperCase();
  }, [value, label]);

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-[140px]">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className={`w-full text-left text-xs h-9 rounded-xl px-3 border cursor-pointer transition flex items-center justify-between gap-1.5 select-none ${
          adminTheme === 'light'
            ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 shadow-sm font-medium'
            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
        }`}
      >
        <span className="truncate">{selectedDisplay}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1 z-50 rounded-xl border p-1.5 shadow-lg space-y-1.5 animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-950 border-slate-850'
        }`}>
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-[10px] rounded-lg pl-7 pr-2 py-1 outline-none border transition ${
                adminTheme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:bg-slate-850'
              }`}
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange('all');
                setIsOpen(false);
              }}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${
                value === 'all'
                  ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                  : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
              }`}
            >
              {label}
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors duration-150 truncate ${
                    value === opt
                      ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                      : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                  }`}
                >
                  {opt.toUpperCase()}
                </button>
              ))
            ) : (
              <div className="text-center text-[10px] py-3 text-slate-400 font-medium">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogTab({
  catalogStockFilter: propCatalogStockFilter,
  setCatalogStockFilter: propSetCatalogStockFilter
}: CatalogTabProps = {}) {
  const {
    products,
    adminTheme,
    handleSaveBulkProducts,
    handleCreateProduct,
    handleImportProducts,
    loadProducts,
    orders,
    setIsDataLoading
  } = useAdmin();

  const { settings } = useSettings();
  const { showToast } = useUi();
  const lowStockThreshold = settings.lowStockThreshold || 5;

  // Search & Filters
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [localCatalogStockFilter, setLocalCatalogStockFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const catalogStockFilter = propCatalogStockFilter !== undefined ? propCatalogStockFilter : localCatalogStockFilter;
  const setCatalogStockFilter = propSetCatalogStockFilter !== undefined ? propSetCatalogStockFilter : setLocalCatalogStockFilter;

  // Dropdown filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'draft'>('all');

  // ── Sliding pill refs — Status filter bar ──────────────────────────────────
  const statusPillRef  = useRef<HTMLSpanElement>(null);
  const statusBtnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const STATUS_TABS = ['all', 'live', 'draft'] as const;

  const moveStatusPill = useCallback((idx: number, animate: boolean) => {
    const pill = statusPillRef.current;
    const btn  = statusBtnRefs.current[idx];
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
    const idx = STATUS_TABS.indexOf(filterStatus);
    if (idx !== -1) moveStatusPill(idx, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const idx = STATUS_TABS.indexOf(filterStatus);
    if (idx !== -1) moveStatusPill(idx, true);
  }, [filterStatus, moveStatusPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sliding pill refs — View mode bar ──────────────────────────────────────
  const viewPillRef  = useRef<HTMLSpanElement>(null);
  const viewBtnRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const VIEW_TABS = ['list', 'grid'] as const;

  const moveViewPill = useCallback((idx: number, animate: boolean) => {
    const pill = viewPillRef.current;
    const btn  = viewBtnRefs.current[idx];
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
    moveViewPill(0, false); // 'list' is default
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const idx = VIEW_TABS.indexOf(viewMode);
    if (idx !== -1) moveViewPill(idx, true);
  }, [viewMode, moveViewPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reposition both pills on resize
  useEffect(() => {
    const onResize = () => {
      const sIdx = STATUS_TABS.indexOf(filterStatus);
      const vIdx = VIEW_TABS.indexOf(viewMode);
      if (sIdx !== -1) moveStatusPill(sIdx, false);
      if (vIdx !== -1) moveViewPill(vIdx, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [filterStatus, viewMode, moveStatusPill, moveViewPill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sorting states
  type SortField = 'id' | 'name' | 'sku' | 'stock' | 'price' | 'category' | 'vendor';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Local busy state for inline product actions (delete, duplicate, bulk) —
  // keeps a small per-card spinner without triggering the full-page skeleton.
  const [isCatalogBusy, setIsCatalogBusy] = useState(false);

  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Bulk actions selection states
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('');

  // Bulk quick edit mode states
  const [isCatalogBulkMode, setIsCatalogBulkMode] = useState(false);
  const [bulkProducts, setBulkProducts] = useState<Product[]>([]);
  const [changedProductIds, setChangedProductIds] = useState<Set<number>>(new Set());
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // New/Edit product modal/drawer state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(false);

  // CSV Importer States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<number>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importUpdateExisting, setImportUpdateExisting] = useState(false);
  const [importDelimiter, setImportDelimiter] = useState('auto');
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreviewRow, setCsvPreviewRow] = useState<string[]>([]);
  const [csvAllRows, setCsvAllRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');

  // Saved mapping profiles
  const [savedProfiles, setSavedProfiles] = useState<Record<string, Record<string, string>>>({});
  const [profileNameInput, setProfileNameInput] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Advanced Filters State
  const [filterSpecial, setFilterSpecial] = useState<string>('all');
  const [isSpecialOpen, setIsSpecialOpen] = useState(false);
  const specialDropdownRef = React.useRef<HTMLDivElement>(null);

  // Reusable confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmStyle: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
    openedAt?: number;
  } | null>(null);

  // Local state for paginated products and total count
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(productSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Fetch paginated products function
  const fetchPaginatedProducts = useCallback(async () => {
    setIsLocalLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterVendor !== 'all') {
        params.append('vendor', filterVendor);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterSpecial !== 'all') {
        params.append('special', filterSpecial);
      }
      if (sortField) {
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);
      }
      params.append('lowStockThreshold', String(lowStockThreshold));

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.products) {
        setPaginatedProducts(data.products);
        setTotalProducts(data.totalCount);
      } else {
        setPaginatedProducts([]);
        setTotalProducts(0);
        showToast(data.error || "Erreur lors du chargement des produits.", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Erreur lors de la récupération des produits.", "error");
    } finally {
      setIsLocalLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, filterCategory, filterVendor, filterStatus, filterSpecial, sortField, sortDirection, lowStockThreshold, showToast]);

  // Trigger paginated fetch when dependencies change
  useEffect(() => {
    fetchPaginatedProducts();
  }, [fetchPaginatedProducts]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterCategory, filterVendor, filterStatus, filterSpecial]);

  // Helper for toggling special filters and page resetting (supporting multiple filters)
  const handleFilterSpecialToggle = (val: string) => {
    if (val === 'all') {
      setFilterSpecial('all');
    } else {
      let currentFilters = filterSpecial === 'all' ? [] : filterSpecial.split(',');
      if (currentFilters.includes(val)) {
        currentFilters = currentFilters.filter(f => f !== val);
      } else {
        currentFilters.push(val);
      }
      
      // If no filters are selected, default back to 'all'
      if (currentFilters.length === 0) {
        setFilterSpecial('all');
      } else {
        setFilterSpecial(currentFilters.join(','));
      }
    }
    setCurrentPage(1);
  };

  // Click outside for special dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (specialDropdownRef.current && !specialDropdownRef.current.contains(event.target as Node)) {
        setIsSpecialOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key listener for confirmation modal
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && confirmDialog) {
        setConfirmDialog(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog]);

  // Compute Dead Product IDs (No sales in the last 30 days)
  const deadProductIds = useMemo(() => {
    const activeIds = new Set<number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersList = orders || [];
    ordersList.forEach((order: any) => {
      const status = (order.status || '').toLowerCase();
      // Skip cancelled or failed orders
      if (status.includes('annul') || status === 'cancelled' || status === 'failed') {
        return;
      }
      const orderDateStr = order.created_at || order.date;
      if (orderDateStr) {
        const orderDate = new Date(orderDateStr);
        if (orderDate >= thirtyDaysAgo) {
          (order.items || []).forEach((item: any) => {
            if (item && item.id) {
              const idNum = Number(item.id);
              if (!isNaN(idNum)) {
                activeIds.add(idNum);
              }
            }
          });
        }
      }
    });

    const deadSet = new Set<number>();
    products.forEach((p: any) => {
      if (!activeIds.has(p.id)) {
        deadSet.add(p.id);
      }
    });
    return deadSet;
  }, [orders, products]);

  // Compute Counts for Special Filters
  const specialFilterCounts = useMemo(() => {
    let noImage = 0;
    let negativeStock = 0;
    let deadProducts = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let lowMargin = 0;
    let noDesc = 0;
    let onSale = 0;
    let positiveStock = 0;

    products.forEach((p: any) => {
      if (!p.image || p.image === '' || p.image === '/placeholder.png') {
        noImage++;
      }
      if (p.stock !== undefined && p.stock !== null && p.stock < 0) {
        negativeStock++;
      }
      if (deadProductIds.has(p.id)) {
        deadProducts++;
      }
      if (p.stock === 0) {
        outOfStock++;
      }
      if (p.stock !== undefined && p.stock !== null && p.stock <= lowStockThreshold) {
        lowStock++;
      }
      if (p.buyingCost !== undefined && p.buyingCost !== null && p.buyingCost >= p.price) {
        lowMargin++;
      }
      if (!p.description || p.description.trim() === '') {
        noDesc++;
      }
      if (p.comparePrice && p.comparePrice > p.price) {
        onSale++;
      }
      if (p.stock !== undefined && p.stock !== null && p.stock > 0) {
        positiveStock++;
      }
    });

    return {
      noImage,
      negativeStock,
      deadProducts,
      outOfStock,
      lowStock,
      lowMargin,
      noDesc,
      onSale,
      positiveStock
    };
  }, [products, deadProductIds, lowStockThreshold]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadProducts();
      await fetchPaginatedProducts();
      showToast("Catalogue mis à jour.", "success");
    } catch (e) {
      showToast("Erreur lors de la mise à jour.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Validations
  const [rowValidations, setRowValidations] = useState<any[]>([]);
  const [ignoreRowsWithErrors, setIgnoreRowsWithErrors] = useState(false);
  const [validationFilter, setValidationFilter] = useState<'all' | 'errors' | 'warnings'>('all');

  // Load profiles and refresh products list on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('csv_mapping_profiles');
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    loadProducts();
  }, []);

  const handleSaveProfile = (name: string) => {
    if (!name.trim()) return;
    const updated = { ...savedProfiles, [name.trim()]: columnMappings };
    setSavedProfiles(updated);
    localStorage.setItem('csv_mapping_profiles', JSON.stringify(updated));
    setProfileNameInput('');
    showToast(`Profil "${name}" sauvegardé avec succès.`, 'success');
  };

  const handleDeleteProfile = (name: string) => {
    const updated = { ...savedProfiles };
    delete updated[name];
    setSavedProfiles(updated);
    localStorage.setItem('csv_mapping_profiles', JSON.stringify(updated));
  };

  const handleLoadProfile = (name: string) => {
    const profile = savedProfiles[name];
    if (profile) {
      setColumnMappings(profile);
    }
  };

  const runValidations = () => {
    const validations: any[] = [];
    const seenSkus = new Set<string>();
    const seenIds = new Set<number>();

    csvAllRows.forEach((row, rowIdx) => {
      const errors: Record<string, string> = {};
      const warnings: Record<string, string> = {};
      const mappedProduct: any = {};

      csvHeaders.forEach((header, colIdx) => {
        const targetField = columnMappings[header];
        if (targetField && targetField !== 'ignore') {
          const rawValue = row[colIdx] || '';
          mappedProduct[targetField] = rawValue;
        }
      });

      // 1. Validate ID
      if (mappedProduct.id !== undefined && String(mappedProduct.id).trim() !== '') {
        const idNum = Number(String(mappedProduct.id).replace(/[^0-9.-]/g, ''));
        if (isNaN(idNum)) {
          errors.id = "L'ID doit être un nombre.";
        } else {
          mappedProduct.id = idNum;
          if (seenIds.has(idNum)) {
            errors.id = "ID doublon dans le fichier CSV.";
          }
          seenIds.add(idNum);
        }
      }

      // 2. Validate SKU
      if (mappedProduct.sku && String(mappedProduct.sku).trim() !== '') {
        const skuStr = String(mappedProduct.sku).trim();
        if (seenSkus.has(skuStr)) {
          errors.sku = "SKU doublon dans le fichier CSV.";
        }
        seenSkus.add(skuStr);
        
        if (!importUpdateExisting) {
          const skuConflict = products.some(p => p.sku === skuStr);
          if (skuConflict) {
            warnings.sku = "Ce SKU existe déjà en base et sera ignoré.";
          }
        }
      }

      // 3. Validate Title
      if (!mappedProduct.title && !mappedProduct.id && !mappedProduct.sku) {
        errors.title = "Le produit doit avoir un Titre, un SKU ou un ID.";
      }

      // 4. Validate Price
      if (mappedProduct.price !== undefined && String(mappedProduct.price).trim() !== '') {
        const priceNum = Number(String(mappedProduct.price).replace(/[^0-9.-]/g, ''));
        if (isNaN(priceNum)) {
          errors.price = "Le prix doit être un nombre.";
        } else if (priceNum < 0) {
          errors.price = "Le prix ne peut pas être négatif.";
        } else {
          mappedProduct.price = priceNum;
        }
      }

      // 5. Validate ComparePrice
      if (mappedProduct.comparePrice !== undefined && String(mappedProduct.comparePrice).trim() !== '') {
        const comparePriceNum = Number(String(mappedProduct.comparePrice).replace(/[^0-9.-]/g, ''));
        if (isNaN(comparePriceNum)) {
          errors.comparePrice = "Le prix barré doit être un nombre.";
        } else if (comparePriceNum < 0) {
          errors.comparePrice = "Le prix barré ne peut pas être négatif.";
        } else {
          mappedProduct.comparePrice = comparePriceNum;
        }
      }

      // 6. Validate BuyingCost
      if (mappedProduct.buyingCost !== undefined && String(mappedProduct.buyingCost).trim() !== '') {
        const buyingCostNum = Number(String(mappedProduct.buyingCost).replace(/[^0-9.-]/g, ''));
        if (isNaN(buyingCostNum)) {
          errors.buyingCost = "Le coût d'achat doit être un nombre.";
        } else if (buyingCostNum < 0) {
          errors.buyingCost = "Le coût d'achat ne peut pas être négatif.";
        } else {
          mappedProduct.buyingCost = buyingCostNum;
        }
      }

      // 7. Validate Stock
      if (mappedProduct.stock !== undefined && String(mappedProduct.stock).trim() !== '') {
        const stockNum = Number(String(mappedProduct.stock).replace(/[^0-9.-]/g, ''));
        if (isNaN(stockNum) || !Number.isInteger(stockNum)) {
          errors.stock = "Le stock doit être un entier.";
        } else if (stockNum < 0) {
          errors.stock = "Le stock ne peut pas être négatif.";
        } else {
          mappedProduct.stock = stockNum;
        }
      }

      // 8. Validate Category
      if (mappedProduct.category && String(mappedProduct.category).trim() !== '') {
        const catStr = String(mappedProduct.category).trim().toLowerCase();
        const validCategories = ['bebe', 'solaire', 'visage', 'cheveux', 'kbeauty', 'offers', 'all'];
        if (!validCategories.includes(catStr)) {
          warnings.category = `Catégorie non reconnue ('${catStr}').`;
        }
      }

      // 9. Validate Image URL
      if (mappedProduct.image && String(mappedProduct.image).trim() !== '') {
        const imgStr = String(mappedProduct.image).trim();
        if (imgStr && !imgStr.startsWith('http://') && !imgStr.startsWith('https://')) {
          warnings.image = "L'URL de l'image ne commence pas par http:// ou https://.";
        }
      }

      validations.push({
        rowIdx,
        errors,
        warnings,
        mappedProduct
      });
    });

    setRowValidations(validations);
  };

  const handleExportCatalogToCsv = async () => {
    setIsLocalLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterVendor !== 'all') {
        params.append('vendor', filterVendor);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      if (filterSpecial !== 'all') {
        params.append('special', filterSpecial);
      }
      params.append('lowStockThreshold', String(lowStockThreshold));

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success || !data.products) {
        showToast("Erreur lors du chargement des produits pour exportation.", "error");
        return;
      }

      const itemsToExport = data.products;
      if (itemsToExport.length === 0) {
        showToast("Aucun produit à exporter.", "warning");
        return;
      }

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = [
        'ID', 'Titre', 'Marque', 'Prix (DH)', 'Prix Comparaison (DH)', 
        'Stock', 'SKU', 'Cout Achat (DH)', 'Categorie', 'Description', 
        'Ingredients', 'Conseils Utilisation', 'Image URL', 'Tags'
      ];

      const rows = itemsToExport.map((p: any) => [
        p.id,
        p.title || p.name || '',
        p.vendor || '',
        p.price || 0,
        p.comparePrice || '',
        p.stock || 0,
        p.sku || '',
        p.buyingCost || '',
        p.category || 'visage',
        p.description || '',
        p.ingredients || '',
        p.usage || '',
        p.image || '',
        Array.isArray(p.tags) ? p.tags.join(', ') : ''
      ]);

      const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `catalogue_produits_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`${itemsToExport.length} produits exportés avec succès.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("Erreur lors de l'exportation.", "error");
    } finally {
      setIsLocalLoading(false);
    }
  };

  const guessMapping = (header: string): string => {
    const h = header.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (h === 'id' || h === 'productid' || h === 'identifiant') return 'id';
    if (h === 'title' || h === 'titre' || h === 'name' || h === 'nom' || h === 'namefr' || h === 'nomfr' || h === 'titrefrançais') return 'title';
    if (h === 'vendor' || h === 'brand' || h === 'marque' || h === 'fournisseur') return 'vendor';
    if (h === 'price' || h === 'prix' || h === 'pricefr' || h === 'prixdh') return 'price';
    if (h === 'compareprice' || h === 'prixcompare' || h === 'comparepricefr' || h === 'prixbarre' || h === 'compare') return 'comparePrice';
    if (h === 'stock' || h === 'quantity' || h === 'quantite' || h === 'qty') return 'stock';
    if (h === 'sku' || h === 'codesku' || h === 'referencesku' || h === 'ref') return 'sku';
    if (h === 'buyingcost' || h === 'coutdachat' || h === 'buying' || h === 'cout') return 'buyingCost';
    if (h === 'category' || h === 'categorie' || h === 'cat') return 'category';
    if (h === 'description' || h === 'desc') return 'description';
    if (h === 'ingredients' || h === 'composition') return 'ingredients';
    if (h === 'usage' || h === 'utilisation' || h === 'conseilsdutilisation') return 'usage';
    if (h === 'image' || h === 'urlimage' || h === 'photo' || h === 'img') return 'image';
    if (h === 'tags' || h === 'motscles') return 'tags';
    return '';
  };

  const parseCSVData = (text: string, delimiter: string) => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    let separator = ',';
    if (delimiter === 'auto') {
      const firstLine = text.split('\n')[0] || '';
      const commas = (firstLine.match(/,/g) || []).length;
      const semicolons = (firstLine.match(/;/g) || []).length;
      const tabs = (firstLine.match(/\t/g) || []).length;
      if (semicolons > commas && semicolons > tabs) {
        separator = ';';
      } else if (tabs > commas && tabs > semicolons) {
        separator = '\t';
      }
    } else {
      separator = delimiter;
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentValue += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentValue += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === separator) {
          row.push(currentValue.trim());
          currentValue = '';
        } else if (char === '\r' || char === '\n') {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          row.push(currentValue.trim());
          if (row.length > 0 && row.some(cell => cell !== '')) {
            lines.push(row);
          }
          row = [];
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
    }
    if (row.length > 0 || currentValue !== '') {
      row.push(currentValue.trim());
      if (row.some(cell => cell !== '')) {
        lines.push(row);
      }
    }
    return lines;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError('');
    }
  };

  const handleContinueToMapping = () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setImportError("Le fichier est vide.");
        return;
      }
      
      const worker = new Worker('/workers/csv-worker.js');
      worker.postMessage({ text, delimiter: importDelimiter });

      worker.onmessage = (e) => {
        const { success, lines, error } = e.data;
        if (!success) {
          setImportError(error || "Erreur lors du traitement du fichier.");
          worker.terminate();
          return;
        }

        if (lines.length < 2) {
          setImportError("Le fichier doit contenir au moins une ligne d'en-tête et une ligne de données.");
          worker.terminate();
          return;
        }

        const headers = lines[0];
        const preview = lines[1];
        
        setCsvHeaders(headers);
        setCsvPreviewRow(preview);
        setCsvAllRows(lines.slice(1));

        const initialMappings: Record<string, string> = {};
        headers.forEach((header: string) => {
          initialMappings[header] = guessMapping(header);
        });
        setColumnMappings(initialMappings);
        setImportStep(2);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        console.error("Worker error:", err);
        setImportError("Erreur lors de l'exécution du parseur.");
        worker.terminate();
      };
    };
    reader.onerror = () => {
      setImportError("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(importFile);
  };

  const handleRunImporter = async () => {
    setImportStep(4);
    setImportProgress(15);

    const importedProducts: any[] = [];
    
    rowValidations.forEach(val => {
      if (ignoreRowsWithErrors && Object.keys(val.errors).length > 0) {
        return;
      }

      const product = { ...val.mappedProduct };
      
      if (product.tags && typeof product.tags === 'string') {
        product.tags = product.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
      }

      if (product.title || product.sku || product.id) {
        importedProducts.push(product);
      }
    });

    if (importedProducts.length === 0) {
      setImportStep(5);
      setImportedCount(0);
      setImportProgress(100);
      return;
    }

    setImportProgress(35);

    try {
      const result = await handleImportProducts(importedProducts, importUpdateExisting);
      setImportProgress(85);
      
      if (result.success) {
        setImportedCount(result.count);
        setImportMessage(result.message || '');
        setImportProgress(100);
        setImportStep(5);
        await fetchPaginatedProducts();
      } else {
        setImportError(result.error || "Erreur inconnue");
        setImportStep(1);
      }
    } catch (err: any) {
      setImportError(err.message || "Erreur de connexion");
      setImportStep(1);
    }
  };

  const handleValidateAndPreview = () => {
    runValidations();
    setImportStep(3);
  };

  // Sync bulkProducts when catalog quick edit is toggled or products update
  useEffect(() => {
    if (isCatalogBulkMode) {
      setBulkProducts(JSON.parse(JSON.stringify(products))); // deep clone
      setChangedProductIds(new Set());
    }
  }, [isCatalogBulkMode, products]);

  // Get unique categories and vendors for filtering select boxes
  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const uniqueVendors = useMemo(() => {
    const vends = new Set(products.map(p => p.vendor).filter(Boolean));
    return Array.from(vends);
  }, [products]);

  const counts = useMemo(() => {
    let all = products.length;
    let live = 0;
    let draft = 0;
    products.forEach((p: any) => {
      if (p.status === 'draft') draft++;
      else live++;
    });
    return { all, live, draft };
  }, [products]);

  // Pagination calculations
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalProducts, totalPages, currentPage]);

  const isAllOnPageSelected = useMemo(() => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every(p => selectedProductIds.has(p.id));
  }, [paginatedProducts, selectedProductIds]);

  // Handlers for sorting, bulk selection, and actions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleSelectProduct = (productId: number) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageIds = paginatedProducts.map(p => p.id);
    if (e.target.checked) {
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedProductIds.size === 0) return;
    
    if (bulkAction === 'delete') {
      setConfirmDialog({
        title: 'Supprimer la sélection ?',
        message: `Voulez-vous supprimer les ${selectedProductIds.size} produits sélectionnés ? Cette action est définitive.`,
        confirmText: 'Supprimer',
        confirmStyle: 'danger',
        openedAt: Date.now(),
        onConfirm: async () => {
          setIsDataLoading(true);
          try {
            let successCount = 0;
            for (const id of Array.from(selectedProductIds)) {
              const res = await fetch(`/api/admin/products?id=${id}`, {
                method: 'DELETE'
              });
              const data = await res.json();
              if (data.success) {
                successCount++;
              }
            }
            showToast(`${successCount} produit(s) supprimé(s) avec succès.`, 'success');
            setSelectedProductIds(new Set());
            setBulkAction('');
            await loadProducts();
            await fetchPaginatedProducts();
          } catch (err) {
            showToast("Erreur lors de la suppression des produits.", "error");
          } finally {
            setIsDataLoading(false);
          }
        }
      });
    } else if (bulkAction === 'categorize') {
      if (!bulkCategory) {
        showToast("Veuillez sélectionner une catégorie.", "error");
        return;
      }
      setConfirmDialog({
        title: 'Assigner la catégorie ?',
        message: `Voulez-vous assigner la catégorie "${bulkCategory}" aux ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Assigner',
        confirmStyle: 'primary',
        openedAt: Date.now(),
        onConfirm: async () => {
          setIsDataLoading(true);
          try {
            const changedProducts = products
              .filter(p => selectedProductIds.has(p.id))
              .map(p => ({ ...p, category: bulkCategory }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits mis à jour avec la catégorie "${bulkCategory}".`, 'success');
              setSelectedProductIds(new Set());
              setBulkAction('');
              setBulkCategory('');
              await fetchPaginatedProducts();
            } else {
              showToast("Erreur lors de la mise à jour des produits.", 'error');
            }
          } catch (err) {
            showToast("Erreur de connexion.", 'error');
          } finally {
            setIsDataLoading(false);
          }
        }
      });
    } else if (bulkAction === 'publish') {
      setConfirmDialog({
        title: 'Publier la sélection ?',
        message: `Voulez-vous publier les ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Publier',
        confirmStyle: 'primary',
        openedAt: Date.now(),
        onConfirm: async () => {
          setIsDataLoading(true);
          try {
            const changedProducts = products
              .filter(p => selectedProductIds.has(p.id))
              .map(p => ({ ...p, status: 'live' as const }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits publiés avec succès.`, 'success');
              setSelectedProductIds(new Set());
              setBulkAction('');
              await fetchPaginatedProducts();
            } else {
              showToast("Erreur lors de la publication des produits.", 'error');
            }
          } catch (err) {
            showToast("Erreur de connexion.", 'error');
          } finally {
            setIsDataLoading(false);
          }
        }
      });
    } else if (bulkAction === 'draft') {
      setConfirmDialog({
        title: 'Mettre en brouillon ?',
        message: `Voulez-vous remettre en brouillon les ${selectedProductIds.size} produits sélectionnés ?`,
        confirmText: 'Brouillon',
        confirmStyle: 'warning',
        openedAt: Date.now(),
        onConfirm: async () => {
          setIsDataLoading(true);
          try {
            const changedProducts = products
              .filter(p => selectedProductIds.has(p.id))
              .map(p => ({ ...p, status: 'draft' as const }));
            
            const success = await handleSaveBulkProducts(changedProducts);
            if (success) {
              showToast(`${changedProducts.length} produits remis en brouillon avec succès.`, 'success');
              setSelectedProductIds(new Set());
              setBulkAction('');
              await fetchPaginatedProducts();
            } else {
              showToast("Erreur lors du passage en brouillon des produits.", 'error');
            }
          } catch (err) {
            showToast("Erreur de connexion.", 'error');
          } finally {
            setIsDataLoading(false);
          }
        }
      });
    }
  };

  // Handlers
  const handleBulkCellChange = (productId: number, field: string, value: any) => {
    setBulkProducts(prev => 
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, [field]: value } as any;
        }
        return p;
      })
    );
    setChangedProductIds(prev => {
      const updated = new Set(prev);
      updated.add(productId);
      return updated;
    });
  };

  const handleSaveBulkChanges = async () => {
    if (changedProductIds.size === 0) return;
    setIsSavingBulk(true);
    const changedProducts = bulkProducts.filter(p => changedProductIds.has(p.id));

    try {
      const success = await handleSaveBulkProducts(changedProducts);
      if (success) {
        setIsCatalogBulkMode(false);
        setChangedProductIds(new Set());
        showToast(`${changedProducts.length} produits mis à jour avec succès !`, 'success');
      } else {
        showToast("Erreur lors de l'enregistrement.", 'error');
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur de connexion lors de la sauvegarde.", 'error');
    } finally {
      setIsSavingBulk(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, image: data.url }));
        showToast('Image téléversée avec succès !', 'success');
      } else {
        showToast('Échec du téléversement: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Erreur réseau lors du téléversement.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      const success = await handleCreateProduct(productForm);
      if (success) {
        setIsNewProductModalOpen(false);
        setProductForm({
          title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
        });
        await fetchPaginatedProducts();
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="space-y-4 admin-tab-enter">
      {/* Search/Filters & Operations Toolbar */}
      <div className={`flex flex-col gap-4 p-3 rounded-2xl border transition-all duration-200 ${
        adminTheme === 'light'
          ? 'bg-white border-slate-200/80 shadow-sm'
          : 'bg-slate-900/30 border-slate-900'
      }`}>
        {/* ROW 1: Filters & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${
                adminTheme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-100 focus:bg-slate-900'
              }`}
              disabled={isCatalogBulkMode}
            />
          </div>

          {/* Status Tabs (Tous, Publiés, Brouillons) — sliding pill */}
          {!isCatalogBulkMode && (
            <div
              className={`relative flex items-center p-0.5 rounded-xl border self-start md:self-auto ${
                adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200/60' : 'bg-slate-950/60 border-slate-800'
              }`}
              role="tablist"
            >
              {/* Sliding pill */}
              <span
                ref={statusPillRef}
                aria-hidden="true"
                className="absolute left-0 top-0.5 pointer-events-none rounded-lg"
                style={{
                  height: 'calc(100% - 4px)',
                  background: adminTheme === 'light' ? '#ffffff' : 'hsl(224 18% 15%)',
                  boxShadow: adminTheme === 'light'
                    ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
                    : '0 1px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)',
                  willChange: 'transform, width',
                  zIndex: 0,
                }}
              />
              <button
                ref={el => { statusBtnRefs.current[0] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'all'}
                onClick={() => {
                  setFilterStatus('all');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  filterStatus === 'all'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <span>Tous</span>
                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                  filterStatus === 'all'
                    ? (adminTheme === 'light' ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-slate-900 text-slate-300 font-bold')
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500' : 'bg-slate-950 text-slate-500')
                }`}>
                  {counts.all}
                </span>
              </button>
              <button
                ref={el => { statusBtnRefs.current[1] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'live'}
                onClick={() => {
                  setFilterStatus('live');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  filterStatus === 'live'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <span>Publiés</span>
                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                  filterStatus === 'live'
                    ? (adminTheme === 'light' ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-slate-900 text-slate-300 font-bold')
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500' : 'bg-slate-950 text-slate-500')
                }`}>
                  {counts.live}
                </span>
              </button>
              <button
                ref={el => { statusBtnRefs.current[2] = el; }}
                type="button"
                role="tab"
                aria-selected={filterStatus === 'draft'}
                onClick={() => {
                  setFilterStatus('draft');
                  setCurrentPage(1);
                }}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  filterStatus === 'draft'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-850' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <span>Brouillons</span>
                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono transition-colors ${
                  filterStatus === 'draft'
                    ? 'bg-rose-500/15 text-rose-500 font-bold'
                    : (adminTheme === 'light' ? 'bg-slate-200/50 text-slate-500 hover:text-rose-500/80' : 'bg-slate-950 text-slate-500 hover:text-rose-500/80')
                }`}>
                  {counts.draft}
                </span>
              </button>
            </div>
          )}

          {/* View Mode Segmented Control — sliding pill */}
          {!isCatalogBulkMode && (
            <div
              className={`relative flex items-center p-0.5 rounded-xl border self-start md:self-auto ${
                adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200/60' : 'bg-slate-950/60 border-slate-800'
              }`}
              role="tablist"
            >
              {/* Sliding pill */}
              <span
                ref={viewPillRef}
                aria-hidden="true"
                className="absolute left-0 top-0.5 pointer-events-none rounded-lg"
                style={{
                  height: 'calc(100% - 4px)',
                  background: adminTheme === 'light' ? '#ffffff' : 'hsl(224 18% 15%)',
                  boxShadow: adminTheme === 'light'
                    ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
                    : '0 1px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1), width 250ms cubic-bezier(0.22,1,0.36,1)',
                  willChange: 'transform, width',
                  zIndex: 0,
                }}
              />
              <button
                ref={el => { viewBtnRefs.current[0] = el; }}
                type="button"
                role="tab"
                aria-selected={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'list'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                ref={el => { viewBtnRefs.current[1] = el; }}
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`relative z-10 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  viewMode === 'grid'
                    ? (adminTheme === 'light' ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grille</span>
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: CTAs & Filters & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Left Side: Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Category Dropdown Filter */}
            {!isCatalogBulkMode && (
              <SearchableDropdown
                label="Toutes les catégories"
                value={filterCategory}
                onChange={(val) => {
                  setFilterCategory(val);
                  setCurrentPage(1);
                }}
                options={uniqueCategories}
                placeholder="Rechercher une catégorie..."
                emptyMessage="Aucune catégorie trouvée"
                adminTheme={adminTheme}
              />
            )}

            {/* Brand/Marque Dropdown Filter */}
            {!isCatalogBulkMode && (
              <SearchableDropdown
                label="Toutes les marques"
                value={filterVendor}
                onChange={(val) => {
                  setFilterVendor(val);
                  setCurrentPage(1);
                }}
                options={uniqueVendors}
                placeholder="Rechercher une marque..."
                emptyMessage="Aucune marque trouvée"
                adminTheme={adminTheme}
              />
            )}

            {/* Filtres Spéciaux */}
            <div ref={specialDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSpecialOpen(!isSpecialOpen)}
                className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer select-none ${
                  filterSpecial !== 'all'
                    ? (adminTheme === 'light'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm hover:bg-emerald-100/80 font-bold'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-bold')
                    : (adminTheme === 'light'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900')
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${filterSpecial !== 'all' ? 'text-emerald-500 font-bold' : 'text-slate-500'}`} />
                <span>
                  {filterSpecial === 'all' && 'Filtres Spéciaux'}
                  {filterSpecial === 'no_image' && 'Sans image'}
                  {filterSpecial === 'negative_stock' && 'Stock négatif'}
                  {filterSpecial === 'dead_products' && 'Produits morts (30j)'}
                  {filterSpecial === 'low_margin' && 'Marge faible/nég.'}
                  {filterSpecial === 'no_desc' && 'Sans description'}
                  {filterSpecial === 'out_of_stock' && 'En rupture'}
                  {filterSpecial === 'low_stock' && 'Stock critique'}
                  {filterSpecial === 'on_sale' && 'En promotion'}
                </span>
                {filterSpecial !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {isSpecialOpen && (
                <div className={`absolute left-0 mt-1 z-50 w-72 rounded-xl border p-2 shadow-lg space-y-1 animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
                  adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'bg-slate-950 border-slate-850'
                }`}>
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800/60 pb-1.5 mb-1 select-none">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Filtres Avancés
                    </span>
                    {filterSpecial !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          handleFilterSpecialToggle('all');
                        }}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-450 cursor-pointer transition"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                    {/* Option: All */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('all');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial === 'all'
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 opacity-70" />
                        <span>Tous les produits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{counts.all}</span>
                        {filterSpecial === 'all' && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Sans image */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('no_image');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('no_image')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ImageOff className="w-3.5 h-3.5 opacity-70" />
                        <span>Sans image</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.noImage}</span>
                        {filterSpecial.split(',').includes('no_image') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock positif */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('positive_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('positive_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 opacity-70 text-emerald-500" />
                        <span>Stock positif (&gt; 0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.positiveStock}</span>
                        {filterSpecial.split(',').includes('positive_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock négatif */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('negative_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('negative_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>Stock négatif</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.negativeStock}</span>
                        {filterSpecial.split(',').includes('negative_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Produits morts */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('dead_products');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('dead_products')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 opacity-70" />
                        <span>Produits morts (30j)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.deadProducts}</span>
                        {filterSpecial.split(',').includes('dead_products') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Rupture */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('out_of_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('out_of_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>En rupture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.outOfStock}</span>
                        {filterSpecial.split(',').includes('out_of_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Stock critique */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('low_stock');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('low_stock')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 opacity-70 text-amber-500" />
                        <span>Stock critique (≤ {lowStockThreshold})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.lowStock}</span>
                        {filterSpecial.split(',').includes('low_stock') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Low margin */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('low_margin');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('low_margin')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 opacity-70 text-amber-600" />
                        <span>Marge faible ou négative</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.lowMargin}</span>
                        {filterSpecial.split(',').includes('low_margin') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: Description manquante */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('no_desc');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('no_desc')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-70" />
                        <span>Description manquante</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.noDesc}</span>
                        {filterSpecial.split(',').includes('no_desc') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>

                    {/* Option: En promotion */}
                    <button
                      type="button"
                      onClick={() => {
                        handleFilterSpecialToggle('on_sale');
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        filterSpecial.split(',').includes('on_sale')
                          ? (adminTheme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-slate-800 text-slate-100 font-bold')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-650 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5 opacity-70 text-rose-500" />
                        <span>En promotion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60 font-medium">{specialFilterCounts.onSale}</span>
                        {filterSpecial.split(',').includes('on_sale') && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-855 pt-1.5 mt-1.5 select-none">
                    {/* Action: Lot rapide (Bulk Edit Mode) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatalogBulkMode(!isCatalogBulkMode);
                        setIsSpecialOpen(false);
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-bold cursor-pointer ${
                        isCatalogBulkMode
                          ? (adminTheme === 'light' ? 'bg-amber-100 text-amber-850' : 'bg-amber-500/20 text-amber-400')
                          : (adminTheme === 'light' ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200')
                      }`}
                    >
                      <Table className="w-3.5 h-3.5 text-amber-500" />
                      <span>Mode Édition en Lot (Lot rapide)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Bulk Actions when items are selected */}
            {selectedProductIds.size > 0 && !isCatalogBulkMode && (
              <div className={`flex items-center gap-2 p-1 h-9 rounded-xl border transition-all duration-200 ${
                adminTheme === 'light' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                  : 'bg-emerald-500/5 border-emerald-500/15'
              }`}>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1 whitespace-nowrap">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                  {selectedProductIds.size} sélect.
                </span>
                
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className={`text-[10px] h-7 outline-none rounded-lg px-2 border cursor-pointer font-bold uppercase tracking-wider transition-colors duration-150 ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-emerald-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-750 focus:border-emerald-500/50'
                  }`}
                >
                  <option value="">Actions groupées</option>
                  <option value="categorize">Catégorie</option>
                  <option value="publish">Publier (Live)</option>
                  <option value="draft">Mettre en brouillon</option>
                  <option value="delete">Supprimer</option>
                </select>

                {bulkAction === 'categorize' && (
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className={`text-[10px] h-7 outline-none rounded-lg px-2 border cursor-pointer font-bold uppercase tracking-wider transition-colors duration-150 ${
                      adminTheme === 'light'
                        ? 'bg-white border-slate-200 text-slate-750 hover:border-slate-300'
                        : 'bg-slate-900 border-slate-800 text-slate-350 hover:text-slate-750'
                    }`}
                  >
                    <option value="">Choisir...</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleApplyBulkAction}
                  disabled={!bulkAction}
                  className="px-3 h-7 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Appliquer
                </button>
              </div>
            )}

            {/* Importer */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Importer</span>
            </button>

            {/* Exporter */}
            <button
              type="button"
              onClick={handleExportCatalogToCsv}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-sky-50/50 hover:border-sky-200 hover:text-sky-750 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-550" />
              <span>Exporter</span>
            </button>

            {/* Rafraîchir */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 h-9 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm font-medium'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-500 font-bold' : ''}`} />
              <span>Rafraîchir</span>
            </button>

            {/* Nouveau Produit CTA */}
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-4 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:from-emerald-550 hover:to-teal-550 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPREADSHEET BULK EDITOR VIEW */}
      {isCatalogBulkMode ? (
        <div className={`border rounded-2xl overflow-hidden shadow-xl space-y-4 ${adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-900'}`}>
          <div className={`p-4 text-xs flex justify-between items-center border-b ${adminTheme === 'light' ? 'bg-amber-50/50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className={`flex items-center gap-2 font-bold ${adminTheme === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>
              <AlertCircle className="w-4 h-4" />
              <span>Mode Édition en Lot : Les modifications seront enregistrées après validation globale.</span>
            </div>
            <span className={`font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{changedProductIds.size} produit(s) modifié(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b ${adminTheme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3 w-[250px]">Titre Français</th>
                  <th className="p-3 w-40">SKU</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Prix (DH)</th>
                  <th className="p-3">Prix Comp. (DH)</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Coût d&apos;achat (DH)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-900'}`}>
                {bulkProducts.map(p => {
                  const isChanged = changedProductIds.has(p.id);
                  return (
                    <tr key={p.id} className={`transition-colors ${isChanged ? (adminTheme === 'light' ? 'bg-emerald-50/70 hover:bg-emerald-100/60' : 'bg-emerald-950/15 hover:bg-emerald-950/25') : (adminTheme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/10')}`}>
                      <td className={`p-3 font-bold ${adminTheme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>{p.id}</td>
                      <td className="p-3">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden">
                          <Image src={p.image || '/placeholder.png'} alt={p.title || ''} fill className={`object-cover border ${adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'}`} sizes="32px" />
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={p.nameFr || p.title}
                          onChange={(e) => handleBulkCellChange(p.id, 'nameFr', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none font-sans text-xs"
                        />
                      </td>
                      <td className="p-3 w-36">
                        <input
                          type="text"
                          value={p.sku || ''}
                          onChange={(e) => handleBulkCellChange(p.id, 'sku', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none font-mono text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={p.category}
                          onChange={(e) => handleBulkCellChange(p.id, 'category', e.target.value)}
                          className="bg-slate-950 border border-slate-900 rounded px-1.5 py-1 focus:border-accent text-slate-300 outline-none font-sans text-xs cursor-pointer"
                        >
                          {['visage', 'kbeauty', 'garnier', 'hadalabo', 'offers'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => handleBulkCellChange(p.id, 'price', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.comparePrice}
                          onChange={(e) => handleBulkCellChange(p.id, 'comparePrice', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-20">
                        <input
                          type="number"
                          value={p.stock !== undefined ? p.stock : 100}
                          onChange={(e) => handleBulkCellChange(p.id, 'stock', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          value={p.buyingCost || 0}
                          onChange={(e) => handleBulkCellChange(p.id, 'buyingCost', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1 focus:border-accent text-slate-200 outline-none text-right"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Floating bottom action bar */}
          {changedProductIds.size > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-900 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-bold">
                {changedProductIds.size} produit(s) en attente d&apos;enregistrement.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBulkProducts(JSON.parse(JSON.stringify(products)));
                    setChangedProductIds(new Set());
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-lg border border-slate-800 text-xs uppercase transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveBulkChanges}
                  disabled={isSavingBulk}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wide transition flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {isSavingBulk ? 'Enregistrement...' : 'Enregistrer tout'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative min-h-[350px]">
            {isLocalLoading && (
              <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/20 backdrop-blur-[0.5px] flex items-center justify-center z-30 transition-all duration-300">
                <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-lg select-none ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-850 text-slate-200'
                }`}>
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-xs font-semibold">Chargement des produits...</span>
                </div>
              </div>
            )}
            {viewMode === 'list' ? (
            /* MODERN TABLE LIST VIEW (DEFAULT) */
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition duration-300 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                : 'bg-slate-900/30 border-slate-900/80'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className={`text-[10px] uppercase tracking-wider font-extrabold border-b transition-colors ${
                      adminTheme === 'light' 
                        ? 'bg-slate-50/50 text-slate-600 border-slate-200/80' 
                        : 'bg-slate-950/40 text-slate-400 border-slate-855'
                    }`}>
                      {/* Checkbox Header */}
                      <th className="p-3 w-10 text-center select-none">
                        <input 
                          type="checkbox" 
                          checked={isAllOnPageSelected} 
                          onChange={handleSelectAllOnPage} 
                          className="rounded cursor-pointer accent-emerald-500" 
                        />
                      </th>
                      {/* Image */}
                      <th className="p-3 font-bold w-12 text-center select-none">Image</th>
                      {/* Nom */}
                      <th 
                        onClick={() => handleSort('name')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Nom</span>
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* SKU */}
                      <th 
                        onClick={() => handleSort('sku')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>SKU</span>
                          {sortField === 'sku' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Stock */}
                      <th 
                        onClick={() => handleSort('stock')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Stock</span>
                          {sortField === 'stock' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Prix */}
                      <th 
                        onClick={() => handleSort('price')} 
                        className="p-3 font-bold text-right cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Prix</span>
                          {sortField === 'price' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Catégorie */}
                      <th 
                        onClick={() => handleSort('category')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Catégorie</span>
                          {sortField === 'category' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                      {/* Marque */}
                      <th 
                        onClick={() => handleSort('vendor')} 
                        className="p-3 font-bold cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition"
                      >
                        <div className="flex items-center gap-1">
                          <span>Marque</span>
                          {sortField === 'vendor' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </div>
                      </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${adminTheme === 'light' ? 'divide-slate-100' : 'divide-slate-850'}`}>
                  {paginatedProducts.map(product => {
                    const stock = product.stock !== undefined ? product.stock : 100;
                    
                    // Stock status
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock <= lowStockThreshold && stock > 0;

                    return (
                      <tr key={product.id} className={`group transition-colors duration-150 ${
                        adminTheme === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-900/10'
                      }`}>
                        {/* Checkbox cell */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            checked={selectedProductIds.has(product.id)} 
                            onChange={() => handleToggleSelectProduct(product.id)}
                            className="rounded cursor-pointer accent-emerald-500" 
                          />
                        </td>

                        {/* Image */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className={`relative w-8 h-8 rounded-lg overflow-hidden border mx-auto shrink-0 transition-transform hover:scale-105 duration-200 ${
                            adminTheme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
                          }`}>
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.title || ''} 
                                fill 
                                className="object-cover" 
                                sizes="32px" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <Layers className="w-3.5 h-3.5 opacity-60" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Nom */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-xs truncate max-w-[280px] block ${
                                adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                              }`} title={product.nameFr || product.title}>
                                {product.nameFr || product.title}
                              </span>
                              {product.status === 'draft' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-extrabold text-[8px] uppercase tracking-wider">
                                  Brouillon
                                </span>
                              )}
                            </div>
                            
                            {/* WooCommerce style Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium select-none">
                              <span className="text-slate-450 dark:text-slate-500">ID: {product.id}</span>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm(product);
                                  setIsNewProductModalOpen(true);
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm(product);
                                  setIsNewProductModalOpen(true);
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Quick Edit
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDialog({
                                    title: 'Supprimer le produit ?',
                                    message: `Voulez-vous vraiment supprimer le produit "${product.nameFr || product.title}" ? Cette action est définitive.`,
                                    confirmText: 'Supprimer',
                                    confirmStyle: 'danger',
                                    openedAt: Date.now(),
                                    onConfirm: async () => {
                                      setIsDataLoading(true);
                                      try {
                                        const res = await fetch(`/api/admin/products?id=${product.id}`, {
                                          method: 'DELETE'
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          showToast('Produit supprimé.', 'success');
                                          await loadProducts();
                                          await fetchPaginatedProducts();
                                        } else {
                                          showToast(data.error || 'Erreur lors de la suppression.', 'error');
                                        }
                                      } catch (err) {
                                        showToast('Erreur de connexion.', 'error');
                                      } finally {
                                        setIsDataLoading(false);
                                      }
                                    }
                                  });
                                }}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 cursor-pointer"
                              >
                                Trash
                              </button>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <a 
                                href={`/product/${product.id}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300"
                              >
                                View
                              </a>
                              <span className="text-slate-300 dark:text-slate-800">|</span>
                              <button 
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setIsDataLoading(true);
                                  try {
                                    const { id, ...copyData } = product;
                                    copyData.title = `${copyData.title} (Copie)`;
                                    if (copyData.nameFr) copyData.nameFr = `${copyData.nameFr} (Copie)`;
                                    const success = await handleCreateProduct(copyData);
                                    if (success) {
                                      showToast('Produit dupliqué.', 'success');
                                      await loadProducts();
                                      await fetchPaginatedProducts();
                                    } else {
                                      showToast('Erreur lors de la duplication.', 'error');
                                    }
                                  } catch (err) {
                                    showToast('Erreur de connexion.', 'error');
                                  } finally {
                                    setIsDataLoading(false);
                                  }
                                }}
                                className="text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 cursor-pointer"
                              >
                                Duplicate
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="p-3 font-mono text-[11px] text-slate-650 dark:text-slate-400 whitespace-nowrap">
                          {product.sku || '-'}
                        </td>

                        {/* Stock */}
                        <td className="p-3 whitespace-nowrap">
                          {isOutOfStock ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold text-xs">
                              Rupture (0)
                            </span>
                          ) : isLowStock ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">
                              Stock bas ({stock})
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              En stock ({stock})
                            </span>
                          )}
                        </td>

                        {/* Prix Public */}
                        <td className="p-3 text-right font-mono text-xs whitespace-nowrap">
                          <span className={`font-bold ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                            {product.price.toFixed(2)} DH
                          </span>
                        </td>

                        {/* Catégorie */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                            adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {product.category}
                          </span>
                        </td>

                        {/* Marque */}
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                            adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {product.vendor || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                        Aucun produit ne correspond à votre recherche ou filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* STANDARD CATALOG GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map(product => {
              const stock = product.stock !== undefined ? product.stock : 100;
              return (
                <div key={product.id} className={`border rounded-2xl overflow-hidden transition duration-300 flex flex-col justify-between group ${adminTheme === 'light' ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'}`}>
                  <div className={`relative aspect-square w-full overflow-hidden border-b ${adminTheme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-900'} flex items-center justify-center`}>
                    {product.image ? (
                      <Image 
                        src={product.image} 
                        alt={product.title || ''} 
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
                        <Layers className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                    {product.status === 'draft' && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[8px] uppercase tracking-wider shadow-sm">
                        Brouillon
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold shadow-sm ${adminTheme === 'light' ? 'bg-white/95 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'}`}>
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                          ID: {product.id} {product.sku && `• SKU: ${product.sku}`} • {product.vendor}
                        </span>
                        {product.variants && product.variants.length > 0 && (
                          <span className="px-1 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[7px] uppercase font-extrabold rounded-md">
                            {product.variants.length} var
                          </span>
                        )}
                      </div>
                      <h4 className={`font-extrabold text-sm line-clamp-1 transition-colors ${adminTheme === 'light' ? 'text-slate-800 group-hover:text-slate-950' : 'text-slate-200 group-hover:text-slate-100'}`}>{product.nameFr || product.title}</h4>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block">Prix Public</span>
                        <span className={`font-extrabold font-mono text-sm ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{product.price} DH</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-550 uppercase font-semibold block">Stock</span>
                        <span className={`font-mono text-xs font-bold flex items-center gap-1 ${
                            stock <= lowStockThreshold
                              ? (adminTheme === 'light' ? 'text-rose-600 font-black' : 'text-rose-400 font-black')
                              : (adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300')
                          }`}>
                          {stock <= lowStockThreshold && <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />}
                          {stock} pièces
                        </span>
                      </div>
                    </div>

                    <div className={`pt-2 border-t flex gap-2 justify-end ${adminTheme === 'light' ? 'border-slate-105' : 'border-slate-950'}`}>
                      <button
                        onClick={() => {
                          setProductForm(product);
                          setIsNewProductModalOpen(true);
                        }}
                        className={`p-2 border rounded-lg transition cursor-pointer ${adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-555 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Panel */}
        <div className={`p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl border transition-all duration-200 ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200/80 shadow-sm text-slate-700'
            : 'bg-slate-900/30 border-slate-900 text-slate-300'
        }`}>
          <div className="text-xs text-slate-500 font-medium">
            {totalProducts > 0 ? (
              <span>Affichage de <b>{(currentPage - 1) * itemsPerPage + 1}</b> à <b>{Math.min(currentPage * itemsPerPage, totalProducts)}</b> sur <b>{totalProducts}</b> produits</span>
            ) : (
              <span>Aucun produit à afficher</span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Par page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-lg border outline-none text-xs cursor-pointer font-medium ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-305'
                }`}
              >
                {[10, 20, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition ${
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-355'
                }`}
              >
                Précédent
              </button>
              <span className="text-xs text-slate-500 px-2 font-medium">Page <b>{currentPage}</b> sur <b>{totalPages}</b></span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition ${
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-355'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* -------------------- MODAL: CREATE / EDIT SINGLE PRODUCT -------------------- */}
      {isNewProductModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-end z-45 select-none animate-in fade-in duration-200"
          onClick={() => {
            setIsNewProductModalOpen(false);
            setProductForm({
              title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
            });
          }}
        >
          <form 
            onSubmit={handleCreateProductSubmit} 
            className={`border-l w-full max-w-xl h-screen flex flex-col relative shadow-2xl transition-all duration-200 animate-in slide-in-from-right duration-300 ${
              adminTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center border-b p-6 flex-shrink-0 ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {productForm.id ? `Modifier le Produit #${productForm.id}` : 'Créer un Nouveau Produit'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setIsNewProductModalOpen(false);
                  setProductForm({
                    title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
                  });
                }} 
                className={`transition-colors cursor-pointer ${
                  adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Titre Français</label>
                  <input 
                    type="text" 
                    value={productForm.nameFr || productForm.title} 
                    onChange={(e) => setProductForm({...productForm, title: e.target.value, nameFr: e.target.value})} 
                    className={`w-full border rounded-xl px-3 py-2 transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Marque / Fournisseur</label>
                  <input 
                    type="text" 
                    value={productForm.vendor} 
                    onChange={(e) => setProductForm({...productForm, vendor: e.target.value})} 
                    className={`w-full border rounded-xl px-3 py-2 transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Catégorie</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className={`w-full border rounded-xl px-3 py-2 transition outline-none cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`}
                  >
                    {['visage', 'kbeauty', 'garnier', 'hadalabo', 'offers'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Statut du Produit</label>
                  <select 
                    value={productForm.status || 'live'} 
                    onChange={(e) => setProductForm({...productForm, status: e.target.value as any})}
                    className={`w-full border rounded-xl px-3 py-2 transition outline-none cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`}
                  >
                    <option value="live">Publié (Live)</option>
                    <option value="draft">Brouillon (Draft)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Quantité en Stock</label>
                  <input 
                    type="number" 
                    value={productForm.stock !== undefined ? productForm.stock : 100} 
                    onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})} 
                    className={`w-full border rounded-xl px-3 py-2 text-right font-mono transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Prix Public (DH)</label>
                  <input 
                    type="number" 
                    value={productForm.price || ''} 
                    onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})} 
                    className={`w-full border rounded-xl px-3 py-2 text-right font-mono transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Prix Comparatif (DH)</label>
                  <input 
                    type="number" 
                    value={productForm.comparePrice || ''} 
                    onChange={(e) => setProductForm({...productForm, comparePrice: Number(e.target.value)})} 
                    className={`w-full border rounded-xl px-3 py-2 text-right font-mono transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Code SKU</label>
                  <input 
                    type="text" 
                    value={productForm.sku || ''} 
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})} 
                    className={`w-full border rounded-xl px-3 py-2 transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    placeholder="e.g. SKU-BRAND-001"
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>Coût d&apos;achat (DH)</label>
                  <input 
                    type="number" 
                    value={productForm.buyingCost || ''} 
                    onChange={(e) => setProductForm({...productForm, buyingCost: Number(e.target.value)})} 
                    className={`w-full border rounded-xl px-3 py-2 text-right font-mono transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider block ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Image du produit URL</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="text" 
                    value={productForm.image} 
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})} 
                    className={`flex-1 font-mono border rounded-xl px-3 py-2 transition outline-none ${
                      adminTheme === 'light'
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                        : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                    }`} 
                    required 
                  />
                  <label 
                    htmlFor="product-file-input"
                    className={`px-3 py-2 border font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1 transition-all ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Upload className="w-4.5 h-4.5" />
                    {isUploading ? 'Upload...' : 'File'}
                  </label>
                  <input 
                    id="product-file-input"
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Tags (Séparés par virgules)</label>
                <input 
                  type="text" 
                  value={Array.isArray(productForm.tags) ? productForm.tags.join(', ') : ''} 
                  onChange={(e) => setProductForm({...productForm, tags: e.target.value.split(',').map(t => t.trim())})} 
                  placeholder="visage, hydratant, solaire" 
                  className={`w-full border rounded-xl px-3 py-2 transition outline-none ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                  }`} 
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Description Produit</label>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  className={`w-full border rounded-xl p-3 transition outline-none ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-accent/50'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                  }`} 
                  rows={2} 
                />
              </div>

              {/* Collapsible Variants & Options Manager */}
              <div className={`space-y-2 border-t pt-3 ${
                adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsVariantsExpanded(!isVariantsExpanded)}
                  className={`flex items-center justify-between w-full py-1.5 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Variantes et Options (Tailles / Sizing / Stock)
                  </span>
                  <span className="text-slate-500 font-mono text-[9px]">
                    {isVariantsExpanded ? 'Masquer [-]' : 'Afficher [+]'}
                  </span>
                </button>

                {isVariantsExpanded && (
                  <div className={`space-y-4 p-4 rounded-2xl border animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
                    adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-slate-500">Configurez des variations pour ce produit avec des prix et stocks distincts.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const currentVariants = productForm.variants || [];
                          const nextId = `var_${Date.now()}`;
                          const updated = [...currentVariants, { id: nextId, title: 'Option Sizing', price: productForm.price || 0, comparePrice: productForm.comparePrice || productForm.price || 0, stock: 10 }];
                          
                          const sumStock = updated.reduce((sum, v) => sum + v.stock, 0);
                          setProductForm({
                            ...productForm,
                            variants: updated,
                            stock: sumStock
                          });
                        }}
                        className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        + Ajouter Variante
                      </button>
                    </div>

                    {productForm.variants && productForm.variants.length > 0 ? (
                      <div className="space-y-3">
                        {productForm.variants.map((v, idx) => (
                          <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-slate-800 pb-3 md:pb-1.5 last:border-b-0 last:pb-0">
                            <div className="md:col-span-4 space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Option (Ex: 30ml, 50ml)</label>
                              <input
                                type="text"
                                value={v.title}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, title: e.target.value };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                                className={`w-full border rounded-lg px-2 py-1.5 transition outline-none ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                                  }`}
                                required
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Prix (DH)</label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, price: Number(e.target.value) };
                                  const mainPrice = idx === 0 ? Number(e.target.value) : (productForm.price || 0);
                                  setProductForm({ ...productForm, price: mainPrice, variants: updated });
                                }}
                                className={`w-full border rounded-lg px-2 py-1.5 transition outline-none ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                                }`}
                                required
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Barré (DH)</label>
                              <input
                                type="number"
                                value={v.comparePrice || ''}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, comparePrice: Number(e.target.value) };
                                  const mainCompare = idx === 0 ? Number(e.target.value) : (productForm.comparePrice || 0);
                                  setProductForm({ ...productForm, comparePrice: mainCompare, variants: updated });
                                }}
                                className={`w-full border rounded-lg px-2 py-1.5 transition outline-none ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                                }`}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Stock</label>
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[idx] = { ...v, stock: Number(e.target.value) };
                                  const sumStock = updated.reduce((sum, item) => sum + item.stock, 0);
                                  setProductForm({ ...productForm, stock: sumStock, variants: updated });
                                }}
                                className={`w-full border rounded-lg px-2 py-1.5 transition outline-none ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                                    : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                                }`}
                                required
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (productForm.variants || []).filter((_, i) => i !== idx);
                                  const sumStock = updated.reduce((sum, item) => sum + item.stock, 0);
                                  setProductForm({ ...productForm, stock: sumStock, variants: updated.length > 0 ? updated : undefined });
                                }}
                                className="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 border border-rose-500/15 rounded-lg text-[9px] uppercase font-bold transition-all w-full md:w-auto cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[10px] text-slate-500">
                        Aucune variante active. Le produit utilise le prix et le stock globaux saisis ci-dessus.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible SEO & Meta Manager */}
              <div className={`space-y-2 border-t pt-3 ${
                adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                  className={`flex items-center justify-between w-full py-1.5 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Référencement (SEO) & Méta-données
                  </span>
                  <span className="text-slate-500 font-mono text-[9px]">
                    {isSeoExpanded ? 'Masquer [-]' : 'Afficher [+]'}
                  </span>
                </button>
                
                {isSeoExpanded && (
                  <div className={`space-y-3 p-3 rounded-2xl border animate-in fade-in-30 slide-in-from-top-1 duration-150 ${
                    adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>Slug URL personnalisé</label>
                        <span className={`text-[9px] font-mono ${
                          adminTheme === 'light' ? 'text-slate-500' : 'text-slate-500'
                        }`}>para-officinal.ma/produit/<b className="text-emerald-400">{productForm.slug || 'url-slug'}</b></span>
                      </div>
                      <input
                        type="text"
                        value={productForm.slug || ''}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
                          setProductForm({ ...productForm, slug: val });
                        }}
                        placeholder="exemple-slug-de-produit"
                        className={`w-full border rounded-xl px-3 py-1.5 transition outline-none font-mono ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>Méta-Titre (Balise Title)</label>
                        <span className={`text-[9px] font-mono ${(productForm.metaTitle?.length || 0) > 60 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                          {productForm.metaTitle?.length || 0}/60 caract.
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={productForm.metaTitle || ''}
                        onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                        placeholder={productForm.title || "Titre pour Google"}
                        className={`w-full border rounded-xl px-3 py-1.5 transition outline-none ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={`text-[9px] font-bold uppercase tracking-wider ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>Méta-Description</label>
                        <span className={`text-[9px] font-mono ${(productForm.metaDescription?.length || 0) > 160 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                          {productForm.metaDescription?.length || 0}/160 caract.
                        </span>
                      </div>
                      <textarea
                        maxLength={160}
                        value={productForm.metaDescription || ''}
                        onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                        placeholder={productForm.description || "Description courte résumant le produit pour les moteurs de recherche."}
                        className={`w-full border rounded-xl p-3 transition outline-none ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-accent/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 focus:border-accent/50'
                        }`}
                        rows={2}
                      />
                    </div>

                    {/* Google SERP Live Preview */}
                    <div className="space-y-1.5">
                      <label className={`text-[9px] font-bold uppercase tracking-wider block ${
                        adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>Aperçu du résultat Google (SERP)</label>
                      <div className={`p-3 rounded-xl border font-sans select-text ${
                        adminTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                          : 'bg-white text-slate-900 border-slate-300 shadow-inner'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mb-0.5 truncate">
                          <span className="font-semibold text-slate-800">para-officinal.ma</span>
                          <span>›</span>
                          <span>produit</span>
                          <span>›</span>
                          <span className="text-slate-500 font-mono text-[9px]">{productForm.slug || 'slug-produit'}</span>
                        </div>
                        <h4 className="text-[14px] text-[#1a0dab] hover:underline leading-tight font-medium truncate font-sans">
                          {productForm.metaTitle || productForm.title || 'Méta-Titre du Produit'}
                        </h4>
                        <p className="text-[11px] text-[#4d5156] leading-relaxed mt-0.5 font-light font-sans break-words">
                          {productForm.metaDescription || productForm.description || 'Veuillez saisir une méta-description pour avoir un aperçu réaliste de la façon dont ce produit apparaîtra dans les moteurs de recherche Google.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`p-6 border-t flex justify-end gap-3 text-xs flex-shrink-0 ${
            adminTheme === 'light'
              ? 'border-slate-100 bg-slate-50/50'
              : 'border-slate-800 bg-slate-950/20'
          }`}>
            <button 
              type="button" 
              onClick={() => {
                setIsNewProductModalOpen(false);
                setProductForm({
                  title: '', vendor: '', price: 0, comparePrice: 0, category: 'visage', tags: [], stock: 100, description: '', ingredients: '', usage: '', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop', sku: '', buyingCost: 0, status: 'live'
                });
              }} 
              className={`px-5 py-2.5 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                adminTheme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-350 hover:text-slate-200'
              }`}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSavingProduct}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold uppercase tracking-wider rounded-xl hover:from-emerald-450 hover:to-teal-450 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? 'Sauvegarde...' : (productForm.id ? 'Sauvegarder' : 'Créer le Produit')}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* -------------------- MODAL: CSV / EXCEL WIZARD IMPORTER -------------------- */}
    {isImportModalOpen && (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-45 animate-in fade-in duration-200 select-none">
        <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-250 ${
          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className={`flex justify-between items-center p-5 border-b ${
            adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${
              adminTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              Importer des Produits depuis un fichier CSV / TXT
            </h3>
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStep(1);
                setImportFile(null);
                setImportError('');
                setImportMessage('');
              }}
              className={`transition-colors cursor-pointer ${
                adminTheme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper indicator bar */}
          <div className={`p-4 border-b flex items-center justify-center gap-4 text-[10px] font-extrabold uppercase tracking-wider ${
            adminTheme === 'light' ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-950/20 border-slate-800/80'
          }`}>
            {[
              { step: 1, label: 'Téléverser' },
              { step: 2, label: 'Mappage' },
              { step: 3, label: 'Validation' },
              { step: 4, label: 'Importation' },
              { step: 5, label: 'Terminé !' }
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-mono text-[9px] border transition ${
                    importStep === s.step
                      ? (adminTheme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-600 font-black' : 'bg-emerald-500/10 text-emerald-400 border-emerald-400 font-black')
                      : importStep > s.step
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                        : (adminTheme === 'light' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-slate-950 text-slate-500 border-slate-800')
                  }`}>
                    {importStep > s.step ? '✓' : s.step}
                  </span>
                  <span className={importStep === s.step ? (adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200') : 'text-slate-500'}>
                    {s.label}
                  </span>
                </div>
                {idx < 4 && (
                  <span className={`h-[1px] w-6 transition ${
                    importStep > s.step ? 'bg-emerald-500' : (adminTheme === 'light' ? 'bg-slate-200' : 'bg-slate-800')
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Step 1: Upload */}
            {importStep === 1 && (
              <div className="space-y-5 text-xs">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-extrabold">Importer des produits à partir d&apos;un fichier CSV</h4>
                  <p className="text-slate-500 font-light leading-relaxed">Cet outil vous permet d&apos;importer ou fusionner les données produit de votre boutique à partir d&apos;un fichier CSV ou TXT.</p>
                </div>

                {importError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                    importFile
                      ? 'border-emerald-500/50 bg-emerald-500/[0.02]'
                      : (adminTheme === 'light' ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50' : 'border-slate-800 hover:border-slate-700 bg-slate-950/10')
                  }`}>
                    <input
                      type="file"
                      id="csv-file-upload"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="csv-file-upload" className="cursor-pointer space-y-3 block">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <div className="space-y-1">
                        <p className="font-bold">{importFile ? importFile.name : 'Choisir un fichier CSV depuis votre ordinateur'}</p>
                        <p className="text-slate-500 font-light text-[10px]">Taille maximale : 2 Go</p>
                      </div>
                      {importFile && (
                        <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold">
                          Fichier chargé
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5 p-1">
                    <input
                      type="checkbox"
                      id="import-update-existing"
                      checked={importUpdateExisting}
                      onChange={(e) => setImportUpdateExisting(e.target.checked)}
                      className="mt-1 cursor-pointer w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 accent-emerald-500"
                    />
                    <label htmlFor="import-update-existing" className="cursor-pointer font-medium leading-relaxed">
                      Mettre à jour les produits existants
                      <span className="block text-[10px] text-slate-500 font-light mt-0.5">
                        Les produits existants qui correspondent par ID ou SKU seront mis à jour. Les produits qui n&apos;existent pas seront ignorés.
                      </span>
                    </label>
                  </div>

                  <div className="border-t border-slate-800/40 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                      className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer uppercase tracking-wider"
                    >
                      {isAdvancedOptionsOpen ? 'Masquer les options avancées' : 'Afficher les options avancées'}
                    </button>

                    {isAdvancedOptionsOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Séparateur de colonnes</label>
                          <select
                            value={importDelimiter}
                            onChange={(e) => setImportDelimiter(e.target.value)}
                            className={`w-full border rounded-xl px-3 py-2 transition outline-none cursor-pointer ${
                              adminTheme === 'light'
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}
                          >
                            <option value="auto">Détection automatique</option>
                            <option value=",">Virgule (,)</option>
                            <option value=";">Point-virgule (;)</option>
                            <option value="&#9;">Tabulation</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Mapping */}
            {importStep === 2 && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-extrabold font-sans">Map CSV fields to products</h4>
                  <p className="text-slate-500 font-light">Select fields from your CSV file to map against products fields, or to ignore during import.</p>
                </div>

                {/* Profiles Bar */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 shadow-sm' : 'bg-slate-950/45 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Profils de Mappage :</span>
                    {Object.keys(savedProfiles).length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          onChange={(e) => handleLoadProfile(e.target.value)}
                          defaultValue=""
                          className={`text-xs border rounded-lg px-2.5 py-1 outline-none cursor-pointer ${
                            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="" disabled>Charger...</option>
                          {Object.keys(savedProfiles).map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const activeOpt = document.querySelector('select')?.value;
                            if (activeOpt) {
                              handleDeleteProfile(activeOpt);
                              showToast("Profil supprimé.", 'success');
                            }
                          }}
                          className={`text-[9px] font-bold uppercase transition hover:text-rose-500 ${
                            adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Aucun profil enregistré</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nom du profil (ex: Shopify)"
                      value={profileNameInput}
                      onChange={e => setProfileNameInput(e.target.value)}
                      className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none w-36 ${
                        adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveProfile(profileNameInput)}
                      className="px-3 py-1.5 bg-emerald-500 text-white font-black text-[9px] uppercase rounded-lg hover:bg-emerald-400 cursor-pointer transition shadow-sm"
                    >
                      Sauver
                    </button>
                  </div>
                </div>

                <div className={`border rounded-2xl overflow-hidden ${
                  adminTheme === 'light' ? 'border-slate-100 bg-white' : 'border-slate-800 bg-slate-950/10'
                }`}>
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className={`text-[9px] uppercase tracking-wider font-extrabold border-b ${
                        adminTheme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        <th className="p-3 w-1/2">Column name</th>
                        <th className="p-3 w-1/2">Map to field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                      {csvHeaders.map((header) => {
                        const previewVal = csvPreviewRow[csvHeaders.indexOf(header)] || '';
                        const mappedVal = columnMappings[header] || '';
                        return (
                          <tr key={header} className="hover:bg-slate-800/5 transition">
                            <td className="p-3 space-y-1">
                              <span className="font-bold block">{header}</span>
                              {previewVal && (
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Sample: {previewVal.length > 50 ? `${previewVal.slice(0, 50)}...` : previewVal}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={mappedVal || 'ignore'}
                                onChange={(e) => setColumnMappings(prev => ({ ...prev, [header]: e.target.value }))}
                                className={`w-full border rounded-xl px-3 py-1.5 transition outline-none cursor-pointer font-sans ${
                                  adminTheme === 'light'
                                    ? 'bg-white border-slate-200 text-slate-800'
                                    : 'bg-slate-950 border-slate-800 text-slate-200'
                                }`}
                              >
                                <option value="ignore">Ignore</option>
                                <option value="id">ID</option>
                                <option value="title">Titre Français</option>
                                <option value="vendor">Marque / Fournisseur</option>
                                <option value="price">Prix (DH)</option>
                                <option value="comparePrice">Prix Comp. (DH)</option>
                                <option value="stock">Stock</option>
                                <option value="sku">SKU</option>
                                <option value="buyingCost">Coût d&apos;achat (DH)</option>
                                <option value="category">Catégorie</option>
                                <option value="description">Description</option>
                                <option value="ingredients">Ingrédients</option>
                                <option value="usage">Conseils d&apos;utilisation</option>
                                <option value="image">Image URL</option>
                                <option value="tags">Tags</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 3: Validation & Preview */}
            {importStep === 3 && (() => {
              const filteredRows = rowValidations.filter(val => {
                if (validationFilter === 'errors') return Object.keys(val.errors).length > 0;
                if (validationFilter === 'warnings') return Object.keys(val.warnings).length > 0;
                return true;
              });
              
              const totalErrors = rowValidations.filter(v => Object.keys(v.errors).length > 0).length;
              const totalWarnings = rowValidations.filter(v => Object.keys(v.warnings).length > 0).length;
              const totalValids = rowValidations.length - totalErrors;
              
              return (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-extrabold font-sans">Validation & Aperçu des Produits</h4>
                    <p className="text-slate-500 font-light">Veuillez vérifier les anomalies avant d&apos;importer.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-2xl border text-center ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80 shadow-sm' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Valides / Total</span>
                      <strong className="text-sm font-mono text-emerald-500 font-black">{totalValids} / {rowValidations.length}</strong>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${
                      totalErrors > 0 
                        ? (adminTheme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/20 border-rose-900/40 text-rose-400 font-black')
                        : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Erreurs</span>
                      <strong className="text-sm font-mono font-black">{totalErrors}</strong>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${
                      totalWarnings > 0
                        ? (adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/20 border-amber-900/40 text-amber-400')
                        : (adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
                    }`}>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Avertissements</span>
                      <strong className="text-sm font-mono font-black">{totalWarnings}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[9px] uppercase text-slate-400 tracking-wider">Filtrer l&apos;aperçu :</span>
                      <select
                        value={validationFilter}
                        onChange={(e) => setValidationFilter(e.target.value as any)}
                        className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer ${
                          adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <option value="all">Toutes les lignes ({rowValidations.length})</option>
                        <option value="errors">Uniquement avec erreurs ({totalErrors})</option>
                        <option value="warnings">Uniquement avec avertissements ({totalWarnings})</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="ignore-errors-check"
                        checked={ignoreRowsWithErrors}
                        onChange={(e) => setIgnoreRowsWithErrors(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 accent-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="ignore-errors-check" className="cursor-pointer font-extrabold text-[11px]">
                        Ignorer les lignes erronées à l&apos;importation
                      </label>
                    </div>
                  </div>

                  <div className={`border rounded-2xl overflow-hidden max-h-[320px] overflow-y-auto ${
                    adminTheme === 'light' ? 'border-slate-100 bg-white' : 'border-slate-800 bg-slate-950/10'
                  }`}>
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className={`text-[9px] uppercase tracking-wider font-extrabold border-b ${
                          adminTheme === 'light' ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}>
                          <th className="p-2.5 w-12 text-center">Ligne</th>
                          <th className="p-2.5 w-12 text-center">Statut</th>
                          <th className="p-2.5">Titre</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Prix</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5">Catégorie</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/10 font-sans">
                        {filteredRows.slice(0, 100).map((val) => {
                          const hasErrors = Object.keys(val.errors).length > 0;
                          const hasWarnings = Object.keys(val.warnings).length > 0;
                          const rowNum = val.rowIdx + 2;
                          
                          return (
                            <tr key={val.rowIdx} className={`hover:bg-slate-800/5 transition ${hasErrors && !ignoreRowsWithErrors ? 'bg-rose-500/[0.02]' : ''}`}>
                              <td className="p-2.5 font-mono text-center text-slate-400">{rowNum}</td>
                              <td className="p-2.5 text-center">
                                {hasErrors ? (
                                  <span className="text-rose-500 font-extrabold block text-center">X</span>
                                ) : hasWarnings ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                                ) : (
                                  <span className="text-emerald-500 font-extrabold text-center block">✓</span>
                                )}
                              </td>
                              
                              <td className={`p-2.5 ${val.errors.title ? 'bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20 rounded-lg' : ''}`}>
                                <span className="font-semibold block truncate max-w-[150px]" title={val.mappedProduct.title}>{val.mappedProduct.title || '—'}</span>
                                {val.errors.title && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.title}</span>}
                              </td>
                              
                              <td className={`p-2.5 font-mono ${val.errors.sku ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : val.warnings.sku ? 'bg-amber-500/5 text-amber-600 border border-amber-500/15 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.sku || '—'}</span>
                                {val.errors.sku && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.sku}</span>}
                                {val.warnings.sku && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.warnings.sku}</span>}
                              </td>

                              <td className={`p-2.5 font-mono ${val.errors.price ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.price !== undefined ? `${val.mappedProduct.price} DH` : '—'}</span>
                                {val.errors.price && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.price}</span>}
                              </td>

                              <td className={`p-2.5 font-mono ${val.errors.stock ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.stock !== undefined ? val.mappedProduct.stock : '—'}</span>
                                {val.errors.stock && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.errors.stock}</span>}
                              </td>

                              <td className={`p-2.5 uppercase font-mono ${val.warnings.category ? 'bg-amber-500/5 text-amber-600 border border-amber-500/15 rounded-lg' : ''}`}>
                                <span>{val.mappedProduct.category || '—'}</span>
                                {val.warnings.category && <span className="text-[8.5px] block font-light leading-none mt-0.5">{val.warnings.category}</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredRows.length > 100 && (
                      <div className={`p-3 text-center border-t font-bold text-[10px] text-slate-500 ${
                        adminTheme === 'light' ? 'bg-slate-50' : 'bg-slate-900/55'
                      }`}>
                        Affichage des 100 premières lignes sur un total de {filteredRows.length} lignes.
                      </div>
                    )}
                    {filteredRows.length === 0 && (
                      <div className="p-8 text-center text-slate-500 italic">Aucune ligne ne correspond au filtre actif.</div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Step 4: Loading Progress */}
            {importStep === 4 && (
              <div className="space-y-6 py-8 text-center text-xs">
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <h4 className="text-sm font-extrabold">Importation des produits en cours...</h4>
                  <p className="text-slate-500 font-light">Veuillez patienter pendant que les produits sont importés.</p>
                </div>
                
                <div className="max-w-md mx-auto space-y-1.5">
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    adminTheme === 'light' ? 'bg-slate-100' : 'bg-slate-950'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">{importProgress}% complété</span>
                </div>
              </div>
            )}

            {/* Step 5: Done */}
            {importStep === 5 && (
              <div className="space-y-5 py-6 text-center text-xs animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <span className="text-lg">✓</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold">Importation terminée !</h4>
                  <p className="text-slate-400 font-light font-sans">Votre catalogue produits a été mis à jour avec succès.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`inline-block px-5 py-2.5 rounded-2xl border font-mono font-bold ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
                  }`}>
                    {importedCount} produit(s) importé(s) / mis à jour.
                  </div>
                  {importMessage && (
                    <p className="text-amber-500 font-bold text-[11px] mt-1 max-w-md mx-auto leading-relaxed">
                      ⚠️ {importMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer buttons */}
          <div className={`p-4 border-t flex justify-end gap-2 text-xs ${
            adminTheme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-slate-950/10'
          }`}>
            {importStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportError('');
                  }}
                  className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleContinueToMapping}
                  disabled={!importFile}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </>
            )}
            {importStep === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleValidateAndPreview}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer animate-none"
                >
                  Continuer
                </button>
              </>
            )}
            {importStep === 3 && (() => {
              const totalErrors = rowValidations.filter(v => Object.keys(v.errors).length > 0).length;
              const isDisableImport = totalErrors > 0 && !ignoreRowsWithErrors;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setImportStep(2)}
                    className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleRunImporter}
                    disabled={isDisableImport}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Lancer l&apos;importation
                  </button>
                </>
              );
            })()}
            {importStep === 5 && (
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStep(1);
                  setImportFile(null);
                  setImportedCount(0);
                  setImportError('');
                  setImportMessage('');
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    )}

      {/* Unified Custom Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              if (confirmDialog.openedAt && Date.now() - confirmDialog.openedAt < 100) return;
              setConfirmDialog(null);
            }}
          />
          <div className={`relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
            adminTheme === 'light' 
              ? 'bg-white border-slate-205 text-slate-800' 
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                confirmDialog.confirmStyle === 'danger'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : confirmDialog.confirmStyle === 'warning'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm truncate">{confirmDialog.title}</h4>
                <p className="text-[11px] text-slate-500 font-light mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 text-[11px] font-bold uppercase tracking-wider pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className={`px-4 py-2 border rounded-xl cursor-pointer transition ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 text-white font-black rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                  confirmDialog.confirmStyle === 'danger'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-450 hover:to-red-500 shadow-rose-500/10'
                    : confirmDialog.confirmStyle === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-450 hover:to-orange-500 shadow-amber-500/10'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 shadow-emerald-500/10'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
);
}
