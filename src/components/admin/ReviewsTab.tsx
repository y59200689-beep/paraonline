'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Star, 
  Search, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  X, 
  Filter, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  CornerDownRight, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Package,
  ShoppingBag,
  Zap,
  PlusCircle,
  ArrowLeftRight,
  ChevronDown,
  Clock,
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { StatusBadge, EmptyState } from '@/components/admin/ui';

export default function ReviewsTab() {
  const {
    reviews,
    products,
    adminTheme,
    handleCreateReview,
    handleUpdateReviewStatus,
    handleBulkUpdateReviewStatus,
    handleReplyReview,
    handleDeleteReview,
    handleUpdateReview,
    isReviewsLoading,
  } = useAdmin();

  // Local UI state
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  
  // Quick reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Editing dialog state
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editStatus, setEditStatus] = useState('Approved');
  const [editReply, setEditReply] = useState('');
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [showEditProductPicker, setShowEditProductPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create Review modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createProductId, setCreateProductId] = useState<number | null>(null);
  const [createAuthor, setCreateAuthor] = useState('');
  const [createRating, setCreateRating] = useState(5);
  const [createComment, setCreateComment] = useState('');
  const [createStatus, setCreateStatus] = useState('Approved');
  const [createReply, setCreateReply] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Hydration & Body scroll lock
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingReview || showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingReview, showCreateModal]);

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Smart filter: show products without any review + positive stock
  const [showNoReviewProducts, setShowNoReviewProducts] = useState(false);
  const [noReviewProductSearch, setNoReviewProductSearch] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status.toLowerCase() === 'pending').length;
    const approved = reviews.filter(r => r.status.toLowerCase() === 'approved').length;
    const hidden = reviews.filter(r => r.status.toLowerCase() === 'hidden').length;
    
    // Average rating of Approved reviews
    const approvedReviews = reviews.filter(r => r.status.toLowerCase() === 'approved');
    const avg = approvedReviews.length > 0
      ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1))
      : 5.0;

    return { total, pending, approved, hidden, avg };
  }, [reviews]);

  // Products with NO reviews and positive stock (smart filter list)
  const productsWithoutReviews = useMemo(() => {
    const reviewedProductIds = new Set(reviews.map(r => r.productId));
    return products.filter(p => !reviewedProductIds.has(p.id) && (p.stock ?? 0) > 0);
  }, [products, reviews]);

  // Filtered version when search is active inside the smart panel
  const filteredNoReviewProducts = useMemo(() => {
    if (!noReviewProductSearch.trim()) return productsWithoutReviews;
    const q = noReviewProductSearch.toLowerCase();
    return productsWithoutReviews.filter(p =>
      (p.nameFr || p.title || '').toLowerCase().includes(q) ||
      String(p.id).includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.vendor || '').toLowerCase().includes(q)
    );
  }, [productsWithoutReviews, noReviewProductSearch]);

  // Filtering
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // 1. Search Query
      if (reviewSearchQuery) {
        const q = reviewSearchQuery.toLowerCase();
        const prod = products.find(p => p.id === r.productId);
        const matchesAuthor = r.author?.toLowerCase().includes(q);
        const matchesComment = r.comment?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q);
        const matchesProductTitle = prod ? (prod.nameFr || prod.title || '').toLowerCase().includes(q) : false;
        const matchesProductId = String(r.productId).includes(q);
        if (!matchesAuthor && !matchesComment && !matchesId && !matchesProductTitle && !matchesProductId) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        if (r.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Rating Filter
      if (ratingFilter !== 'all') {
        if (r.rating !== Number(ratingFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, products, reviewSearchQuery, statusFilter, ratingFilter]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Recompute total pages
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;

  // Paginated reviews
  const paginatedReviews = useMemo(() => {
    return filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reviewSearchQuery, statusFilter, ratingFilter, showNoReviewProducts, itemsPerPage]);

  const handleBulkUpdate = (status: string) => {
    handleBulkUpdateReviewStatus(status, selectedReviewIds);
    setSelectedReviewIds([]);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReviewId || !replyText.trim()) return;
    const success = await handleReplyReview(replyingReviewId, replyText.trim());
    if (success) {
      setReplyingReviewId(null);
      setReplyText('');
    }
  };

  const startEdit = (rev: any) => {
    setEditingReview(rev);
    setEditAuthor(rev.author || '');
    setEditRating(rev.rating || 5);
    setEditComment(rev.comment || '');
    setEditStatus(rev.status || 'Approved');
    setEditReply(rev.reply || '');
    setEditProductId(rev.productId || null);
    setShowEditProductPicker(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setIsSaving(true);
    const success = await handleUpdateReview(editingReview.id, {
      author: editAuthor.trim(),
      rating: editRating,
      comment: editComment.trim(),
      status: editStatus,
      reply: editReply.trim(),
      ...(editProductId !== null && editProductId !== editingReview.productId
        ? { productId: editProductId }
        : {}),
    });
    setIsSaving(false);
    if (success) {
      setEditingReview(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createProductId || !createAuthor.trim() || !createComment.trim()) return;
    setIsCreating(true);
    const success = await handleCreateReview({
      productId: createProductId,
      author: createAuthor.trim(),
      rating: createRating,
      comment: createComment.trim(),
      status: createStatus,
      reply: createReply.trim(),
    });
    setIsCreating(false);
    if (success) {
      setShowCreateModal(false);
      setCreateProductId(null);
      setCreateAuthor('');
      setCreateRating(5);
      setCreateComment('');
      setCreateStatus('Approved');
      setCreateReply('');
    }
  };

  const handleToggleHide = async (rev: any) => {
    const newStatus = rev.status.toLowerCase() === 'hidden' ? 'Approved' : 'Hidden';
    await handleUpdateReview(rev.id, { status: newStatus });
  };


  const isDark = adminTheme === 'dark';

  // ── Inline ProductPicker ────────────────────────────────────────────────
  const ProductPicker = ({
    value,
    onChange,
    placeholder = 'Rechercher un produit...',
  }: {
    value: number | null;
    onChange: (id: number) => void;
    placeholder?: string;
  }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = value ? products.find((p: any) => p.id === value) : null;

    const filtered = useMemo(() => {
      if (!query.trim()) return products.slice(0, 40);
      const q = query.toLowerCase();
      return products
        .filter((p: any) =>
          (p.nameFr || p.title || '').toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          (p.vendor || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
        )
        .slice(0, 40);
    }, [query]);

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
      <div ref={ref} className="relative">
        {/* Selected product preview */}
        {selected ? (
          <div
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer group transition ${
              isDark
                ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400/60'
                : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400'
            }`}
            onClick={() => { setOpen(o => !o); setQuery(''); }}
          >
            {selected.image ? (
              <img src={selected.image} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200/20" />
            ) : (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-black text-xs truncate ${ isDark ? 'text-slate-100' : 'text-slate-800' }`}>
                {selected.nameFr || selected.title}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {selected.vendor} · {selected.price?.toLocaleString('fr-MA')} MAD
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(0); setQuery(''); }}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setOpen(true); }}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
              isDark
                ? 'bg-slate-950 border-slate-700 hover:border-slate-600 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span className="text-xs">{placeholder}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-50" />
          </button>
        )}

        {/* Dropdown */}
        {open && (
          <div
            className={`absolute z-50 mt-1.5 w-full rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            {/* Search */}
            <div className={`p-2 border-b ${ isDark ? 'border-slate-800' : 'border-slate-100' }`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Nom, marque, catégorie..."
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none border transition ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 focus:border-emerald-500 text-slate-200'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-400 text-slate-800'
                  }`}
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">Aucun produit trouvé</p>
              ) : (
                filtered.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { onChange(p.id); setOpen(false); setQuery(''); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition ${
                      value === p.id
                        ? (isDark ? 'bg-emerald-500/15' : 'bg-emerald-50')
                        : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                    }`}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-200/20" />
                    ) : (
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ isDark ? 'bg-slate-800' : 'bg-slate-100' }`}>
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-[11px] truncate ${ isDark ? 'text-slate-200' : 'text-slate-800' }`}>
                        {p.nameFr || p.title}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {p.vendor && <span className="mr-1">{p.vendor}</span>}
                        {p.price?.toLocaleString('fr-MA')} MAD · Stock: {p.stock}
                      </p>
                    </div>
                    {value === p.id && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 admin-tab-enter pb-12">
      {/* 🚀 Top Bar: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={`font-black text-xl tracking-tight ${ isDark ? 'text-slate-100' : 'text-slate-900' }`}>
              Avis Clients
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
              isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {stats.total.toLocaleString('fr-FR')} au total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Modérez les retours clients, répondez aux avis et réaffectez les produits
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un avis
        </button>
      </div>

      {/* 📊 Shopify-Grade KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Reviews */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            : 'bg-white border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${ isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-600' }`}>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black tracking-tight block ${ isDark ? 'text-slate-100' : 'text-slate-900' }`}>
              {stats.total.toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Avis soumis</span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          stats.pending > 0
            ? (isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200 shadow-sm')
            : (isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]')
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${ stats.pending > 0 ? 'text-amber-500' : 'text-slate-500' }`}>En attente</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${ stats.pending > 0 ? 'bg-amber-500/20 text-amber-500' : (isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500') }`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className={`text-2xl font-black tracking-tight block ${ stats.pending > 0 ? 'text-amber-500' : (isDark ? 'text-slate-100' : 'text-slate-900') }`}>
                {stats.pending}
              </span>
              <span className="text-[10px] font-medium text-slate-500 block mt-0.5">À modérer</span>
            </div>
            {stats.pending > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
        </div>

        {/* Approved Reviews */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            : 'bg-white border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Approuvés</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black tracking-tight text-emerald-500 block">
              {stats.approved.toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Visibles boutique</span>
          </div>
        </div>

        {/* Hidden Reviews */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            : 'bg-white border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Masqués</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${ isDark ? 'bg-slate-800/80 text-purple-400' : 'bg-purple-50 text-purple-600' }`}>
              <EyeOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black tracking-tight block ${ isDark ? 'text-slate-200' : 'text-slate-800' }`}>
              {stats.hidden}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Masqués/Refusés</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
            : 'bg-white border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Note Moyenne</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight text-amber-500">
                {stats.avg}
              </span>
              <span className="text-[11px] font-bold text-slate-400">/ 5</span>
            </div>
            <div className="flex gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 fill-current ${
                    i < Math.round(stats.avg) ? 'text-amber-400' : (isDark ? 'text-slate-800' : 'text-slate-200')
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Smart Card: Products without reviews */}
        <button
          onClick={() => {
            setShowNoReviewProducts(prev => !prev);
            setNoReviewProductSearch('');
          }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
            showNoReviewProducts
              ? (isDark
                  ? 'bg-violet-500/15 border-violet-500/40 ring-2 ring-violet-500/30'
                  : 'bg-violet-50 border-violet-300 ring-2 ring-violet-400/30 shadow-md')
              : productsWithoutReviews.length > 0
              ? (isDark
                  ? 'bg-slate-900/40 border-violet-500/20 hover:border-violet-500/40'
                  : 'bg-white border-violet-200/80 hover:border-violet-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]')
              : (isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200/80')
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Sans avis</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              showNoReviewProducts ? 'bg-violet-500 text-white' : 'bg-violet-500/10 text-violet-500'
            }`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black tracking-tight text-violet-500 block">
              {productsWithoutReviews.length}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Produits en stock</span>
          </div>
        </button>
      </div>

      {/* 🔍 Shopify Toolbar: Integrated Search + Filter Pills + View Switcher */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-900/50 border-slate-800/90 shadow-lg'
          : 'bg-white border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left Controls: Search Bar + Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            
            {/* Search Input Box */}
            <div className="relative flex-1 min-w-[260px] max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher auteur, commentaire, produit..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className={`w-full text-xs font-medium pl-10 pr-8 py-2.5 rounded-xl border outline-none transition ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100 placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400'
                }`}
              />
              {reviewSearchQuery && (
                <button
                  onClick={() => setReviewSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Select Filter Dropdown */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider font-mono text-slate-400">Statut</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>Tous ({stats.total})</option>
                <option value="pending" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>En attente ({stats.pending})</option>
                <option value="approved" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>Approuvés ({stats.approved})</option>
                <option value="hidden" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>Masqués ({stats.hidden})</option>
              </select>
            </div>

            {/* Rating Select Filter Dropdown */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider font-mono text-slate-400">Note</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <option value="all" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>Toutes notes</option>
                <option value="5" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>5 Étoiles ★★★★★</option>
                <option value="4" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>4 Étoiles ★★★★☆</option>
                <option value="3" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>3 Étoiles ★★★☆☆</option>
                <option value="2" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>2 Étoiles ★★☆☆☆</option>
                <option value="1" className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>1 Étoile ★☆☆☆☆</option>
              </select>
            </div>

            {/* Smart Filter Pill Toggle */}
            <button
              onClick={() => {
                setShowNoReviewProducts(prev => !prev);
                setNoReviewProductSearch('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                showNoReviewProducts
                  ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/25'
                  : (isDark
                      ? 'bg-slate-950 hover:bg-violet-500/10 text-violet-400 border-violet-500/20 hover:border-violet-500/40'
                      : 'bg-slate-50 hover:bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-300')
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Sans avis
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-md ${
                showNoReviewProducts
                  ? 'bg-white/20 text-white'
                  : (isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700')
              }`}>
                {productsWithoutReviews.length}
              </span>
            </button>

            {/* Reset Filters Pill */}
            {(reviewSearchQuery || statusFilter !== 'all' || ratingFilter !== 'all' || showNoReviewProducts) && (
              <button
                onClick={() => {
                  setReviewSearchQuery('');
                  setStatusFilter('all');
                  setRatingFilter('all');
                  setShowNoReviewProducts(false);
                  setNoReviewProductSearch('');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition ${
                  isDark
                    ? 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Right Controls: Bulk Select & View Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 justify-end">
            {filteredReviews.length > 0 && !showNoReviewProducts && (
              <button
                onClick={() => {
                  if (selectedReviewIds.length === filteredReviews.length) {
                    setSelectedReviewIds([]);
                  } else {
                    setSelectedReviewIds(filteredReviews.map(r => r.id));
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition border cursor-pointer ${
                  selectedReviewIds.length === filteredReviews.length
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                    : (isDark
                        ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm')
                }`}
              >
                {selectedReviewIds.length === filteredReviews.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            )}

            {/* View Mode Segment Switcher */}
            <div className={`p-1 rounded-xl border flex gap-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Vue en grille"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Vue en tableau"
              >
                <List className="w-3.5 h-3.5" />
                Tableau
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🟣 Smart Filter Panel: Products without reviews and in stock */}
      {showNoReviewProducts && (
        <div className="space-y-4 admin-tab-enter">
          {/* Panel header */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            adminTheme === 'light'
              ? 'bg-violet-50/60 border-violet-200'
              : 'bg-violet-500/5 border-violet-500/15'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Package className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h3 className={`font-black text-sm ${
                  adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  Produits sans aucun avis client
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  {filteredNoReviewProducts.length} / {productsWithoutReviews.length} produit(s) en stock · Sans aucun avis
                </p>
              </div>
            </div>

            {/* Search inside panel */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={noReviewProductSearch}
                onChange={(e) => setNoReviewProductSearch(e.target.value)}
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border outline-none transition ${
                  adminTheme === 'light'
                    ? 'bg-white border-violet-200 focus:border-violet-400 text-slate-800'
                    : 'bg-slate-950 border-violet-500/20 focus:border-violet-500/50 text-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Product grid */}
          {filteredNoReviewProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNoReviewProducts.map(prod => (
                <div
                  key={prod.id}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col ${
                    adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-sm hover:border-violet-300 hover:shadow-md'
                      : 'bg-slate-900/30 border-slate-900 hover:border-violet-500/25 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Product image */}
                  <div className="relative overflow-hidden aspect-square bg-slate-100 dark:bg-slate-900">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.nameFr || prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {/* Stock badge */}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      (prod.stock ?? 0) <= 5
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      Stock: {prod.stock}
                    </span>
                  </div>

                  {/* Product info */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="min-w-0">
                      <h4 className={`font-black text-[11px] leading-tight line-clamp-2 ${
                        adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {prod.nameFr || prod.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {prod.vendor && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            adminTheme === 'light'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {prod.vendor}
                          </span>
                        )}
                        {prod.category && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            adminTheme === 'light'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {prod.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/20">
                      <span className={`font-black text-sm ${
                        adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'
                      }`}>
                        {prod.price?.toLocaleString('fr-MA')} MAD
                      </span>
                      <a
                        href={`/products/${prod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1.5 rounded-lg border transition ${
                          adminTheme === 'light'
                            ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                        }`}
                        title="Voir la fiche produit"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* No-review indicator */}
                    <div className="flex items-center gap-1.5 text-[9px] text-violet-500 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      Aucun avis client
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-black text-slate-400">Aucun produit trouvé</p>
              <p className="text-[11px] text-slate-600">Modifiez votre recherche ou tous les produits ont déjà des avis !</p>
            </div>
          )}
        </div>
      )}

      {/* 📑 Reviews Grid + List (hidden while smart filter is active) */}
      {!showNoReviewProducts && (isReviewsLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium animate-pulse">Chargement des avis clients...</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View Layout
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {paginatedReviews.map(rev => {
            const prod = products.find(p => p.id === rev.productId);
            const isPending = rev.status.toLowerCase() === 'pending';
            const isHidden = rev.status.toLowerCase() === 'hidden';
            const firstLetter = rev.author?.trim().charAt(0).toUpperCase() || '?';

            return (
              <div
                key={rev.id}
                className={`group rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isPending
                    ? (isDark ? 'bg-amber-500/5 border-amber-500/30' : 'bg-amber-50/40 border-amber-200 shadow-sm')
                    : isHidden
                    ? (isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50/30 border-purple-200 shadow-sm')
                    : (isDark
                        ? 'bg-slate-900/40 border-slate-800/90 shadow-lg hover:border-slate-700'
                        : 'bg-white border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-slate-300')
                }`}
              >
                {/* Main Card Body */}
                <div className="p-5 space-y-4">
                  {/* 1. Header: Avatar + Author (Left) | Rating + Status (Right) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        className="rounded-lg cursor-pointer w-4 h-4 text-emerald-600 focus:ring-emerald-500/20 shrink-0"
                        checked={selectedReviewIds.includes(rev.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviewIds(prev => [...prev, rev.id]);
                          } else {
                            setSelectedReviewIds(prev => prev.filter(id => id !== rev.id));
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-sm uppercase shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-black text-xs truncate ${ isDark ? 'text-slate-100' : 'text-slate-900' }`}>
                          {rev.author}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {new Date(rev.date).toLocaleDateString('fr-FR')} &middot; {new Date(rev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Rating Pill + Status Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-xs">
                        <span>{rev.rating}.0</span>
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <StatusBadge
                        status={isPending ? 'warning' : isHidden ? 'inactive' : 'active'}
                        label={isPending ? 'En attente' : isHidden ? 'Masqué' : 'Approuvé'}
                        size="xs"
                        theme={adminTheme}
                      />
                    </div>
                  </div>

                  {/* 2. Linked Product Row */}
                  <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/70'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {prod?.image ? (
                        <img
                          src={prod.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xl shrink-0 border border-slate-200/30"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ isDark ? 'bg-slate-800' : 'bg-slate-200' }`}>
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0 leading-tight">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">Produit lié</span>
                        <p className={`font-extrabold text-xs truncate ${ isDark ? 'text-slate-200' : 'text-slate-800' }`}>
                          {prod?.nameFr || prod?.title || `Produit #${rev.productId}`}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prod?.price ? `${prod.price.toLocaleString('fr-MA')} MAD · ` : ''}Stock: {prod?.stock ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/products/${rev.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-xl border transition ${
                        isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
                      }`}
                      title="Voir la fiche produit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* 3. Review Quote Box */}
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition ${
                    isDark ? 'bg-slate-950/40 border-slate-800/60 text-slate-200' : 'bg-slate-50/50 border-slate-200/60 text-slate-700'
                  }`}>
                    <span className="text-slate-400 font-serif text-base leading-none mr-1 font-bold">&ldquo;</span>
                    {rev.comment}
                    <span className="text-slate-400 font-serif text-base leading-none ml-1 font-bold">&rdquo;</span>
                  </div>

                  {/* 4. Official Reply Box (if present) */}
                  {rev.reply && (
                    <div className={`p-3.5 rounded-2xl border border-l-4 border-l-emerald-500 text-xs space-y-1 ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-slate-800 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-black text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Réponse officielle
                        </span>
                      </div>
                      <p className="pl-5 text-xs italic font-medium">{rev.reply}</p>
                    </div>
                  )}

                  {/* Inline Reply Form Drawer */}
                  {replyingReviewId === rev.id && (
                    <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 animate-scale-up">
                      <textarea
                        placeholder="Saisir la réponse publique au client..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        className={`w-full text-xs font-medium rounded-2xl p-3 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 text-slate-800'
                        }`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className={`px-3 py-1.5 border font-bold rounded-xl text-[10px] uppercase transition ${
                            isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="po-ui-button po-ui-button--primary po-ui-button--md px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md transition"
                        >
                          Enregistrer la réponse
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 5. Footer Action Bar */}
                <div className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-2 shrink-0 ${
                  isDark ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous vraiment supprimer définitivement cet avis ?")) {
                        handleDeleteReview(rev.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Quick Approve if Pending */}
                    {isPending && (
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                        className="po-ui-button po-ui-button--primary po-ui-button--md inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md transition cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approuver
                      </button>
                    )}

                    {/* Reply Button */}
                    {!rev.reply && replyingReviewId !== rev.id && (
                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Répondre
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => startEdit(rev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modifier
                    </button>

                    {/* Hide / Show Button */}
                    <button
                      onClick={() => handleToggleHide(rev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isHidden
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20'
                      }`}
                    >
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {isHidden ? 'Afficher' : 'Masquer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List/Table View Layout (High Density)
        <div className={`border rounded-2xl overflow-hidden transition-all ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200/80 shadow-sm'
            : 'bg-slate-900/30 border-slate-900 shadow-md'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)' }}
                >
                  {['', 'Auteur & Date', 'Produit lié', 'Note & Statut', 'Commentaire', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 font-bold uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}
                      style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {paginatedReviews.map(rev => {
                  const prod = products.find(p => p.id === rev.productId);
                  const isPending = rev.status.toLowerCase() === 'pending';
                  const isHidden = rev.status.toLowerCase() === 'hidden';

                  return (
                    <tr 
                      key={rev.id} 
                      className={`group hover:bg-slate-500/5 transition-colors ${
                        isPending 
                          ? (adminTheme === 'light' ? 'bg-amber-50/10' : 'bg-amber-500/5') 
                          : isHidden 
                          ? (adminTheme === 'light' ? 'bg-purple-50/10' : 'bg-purple-500/5')
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 align-top">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer w-4 h-4"
                          checked={selectedReviewIds.includes(rev.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReviewIds(prev => [...prev, rev.id]);
                            } else {
                              setSelectedReviewIds(prev => prev.filter(id => id !== rev.id));
                            }
                          }}
                        />
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 truncate" title={rev.author}>
                          {rev.author}
                        </div>
                        <span className="text-[9px] text-slate-500 block font-mono">
                          {new Date(rev.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {prod?.image && (
                            <img src={prod.image} alt="" className="w-6 h-6 object-cover rounded shadow-sm shrink-0 border border-slate-200/20" />
                          )}
                          <div className="min-w-0 leading-tight">
                            <span className="font-bold text-[11px] truncate block text-slate-700 dark:text-slate-300" title={prod?.nameFr || prod?.title}>
                              {prod?.nameFr || prod?.title || `ID #${rev.productId}`}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">ID: {rev.productId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 fill-current ${i < rev.rating ? 'text-amber-500' : 'text-slate-700'}`} />
                          ))}
                        </div>
                        <StatusBadge
                          status={isPending ? 'warning' : isHidden ? 'inactive' : 'active'}
                          label={isPending ? 'En attente' : isHidden ? 'Masqué' : 'Approuvé'}
                          size="xs"
                          theme={adminTheme}
                        />
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <p className={`line-clamp-2 leading-relaxed text-[11px] ${
                          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                        }`} title={rev.comment}>
                          {rev.comment}
                        </p>
                        {rev.reply && (
                          <div className="text-[9px] italic text-emerald-500 flex items-center gap-1 mt-1 truncate">
                            <CornerDownRight className="w-3 h-3 text-emerald-500" />
                            Réponse: {rev.reply}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-top text-right space-x-2">
                        {/* Quick Action links */}
                        <button
                          onClick={() => startEdit(rev)}
                          className="text-slate-500 hover:text-slate-200 font-bold hover:underline"
                        >
                          Modifier
                        </button>
                        <span>&middot;</span>
                        <button
                          onClick={() => handleToggleHide(rev)}
                          className="text-purple-500 hover:text-purple-400 font-bold hover:underline"
                        >
                          {isHidden ? 'Afficher' : 'Masquer'}
                        </button>
                        <span>&middot;</span>
                        <button
                          onClick={() => {
                            if (confirm("Supprimer définitivement cet avis ?")) {
                              handleDeleteReview(rev.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-400 font-bold hover:underline"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* 📑 Pagination Controls */}
      {!showNoReviewProducts && filteredReviews.length > 0 && !isReviewsLoading && (
        <div className={`mt-6 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl border transition-all duration-200 ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200/80 shadow-sm text-slate-700'
            : 'bg-slate-900/30 border-slate-900 text-slate-300'
        }`}>
          <div className="text-xs text-slate-500 font-medium">
            <span>Affichage de <b>{(currentPage - 1) * itemsPerPage + 1}</b> à <b>{Math.min(currentPage * itemsPerPage, filteredReviews.length)}</b> sur <b>{filteredReviews.length}</b> avis</span>
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
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
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
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
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
                  adminTheme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Empty State — only when NOT      {/* ── Portalled Centered Modals (Shopify Level UX) ───────────────────── */}
      {mounted && createPortal(
        <>
          {/* 📝 Centered Edit Review Modal */}
          {editingReview && (
            <div
              className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget) setEditingReview(null);
              }}
            >
              <div
                className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
              >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
                  isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
                    >
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider">
                        Modifier l&apos;Avis
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {editingReview.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingReview(null)}
                    className={`p-2 rounded-full transition ${
                      isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-6 space-y-5 overflow-y-auto">

                    {/* Produit lié */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Produit lié</label>
                        <button
                          type="button"
                          onClick={() => setShowEditProductPicker(p => !p)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          {showEditProductPicker ? 'Fermer le sélecteur' : 'Changer le produit'}
                        </button>
                      </div>

                      {showEditProductPicker ? (
                        <ProductPicker
                          value={editProductId}
                          onChange={(id) => setEditProductId(id === 0 ? editingReview.productId : id)}
                          placeholder="Rechercher et choisir un produit..."
                        />
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          {(() => {
                            const prod = products.find((p: any) => p.id === (editProductId ?? editingReview.productId));
                            return prod ? (
                              <>
                                {prod.image ? (
                                  <img src={prod.image} alt="" className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-200/20" />
                                ) : (
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ isDark ? 'bg-slate-800' : 'bg-slate-200' }`}>
                                    <ShoppingBag className="w-5 h-5 text-slate-400" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-black text-xs truncate">{prod.nameFr || prod.title}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {prod.vendor} · {prod.price?.toLocaleString('fr-MA')} MAD · Stock: {prod.stock}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-slate-500">Produit #{editingReview.productId}</p>
                            );
                          })()}
                          {editProductId !== null && editProductId !== editingReview.productId && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full shrink-0">
                              Modifié
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Author */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Nom de l&apos;Auteur</label>
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className={`w-full text-xs font-bold rounded-2xl px-4 py-3 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                        required
                      />
                    </div>

                    {/* Rating */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Note</label>
                      <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)', borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => setEditRating(stars)}
                              className="cursor-pointer transition-transform hover:scale-125 active:scale-95"
                            >
                              <Star
                                className={`w-7 h-7 transition-all ${
                                  stars <= editRating
                                    ? 'text-amber-400 fill-current drop-shadow-sm'
                                    : (isDark ? 'text-slate-700 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400')
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-500 font-mono ml-auto">
                          {editRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Avis Client</label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        className={`w-full text-xs font-medium rounded-2xl p-4 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Statut de Modération</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'Approved', label: 'Approuvé', color: '#10b981' },
                          { val: 'Pending', label: 'En attente', color: '#f59e0b' },
                          { val: 'Hidden', label: 'Masqué', color: '#a855f7' },
                        ].map((item) => {
                          const active = editStatus === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => setEditStatus(item.val)}
                              className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                                active
                                  ? 'text-white shadow-md scale-[1.02]'
                                  : (isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300')
                              }`}
                              style={active ? { background: item.color, borderColor: item.color } : {}}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Réponse Administrateur</label>
                      <textarea
                        value={editReply}
                        onChange={(e) => setEditReply(e.target.value)}
                        placeholder="Optionnel : saisissez une réponse officielle..."
                        rows={2}
                        className={`w-full text-xs font-medium rounded-2xl p-4 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                      />
                    </div>

                  </div>

                  {/* Sticky Footer */}
                  <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${
                    isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition ${
                        isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✨ Centered Create Review Modal */}
          {showCreateModal && (
            <div
              className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCreateModal(false);
              }}
            >
              <div
                className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
              >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
                  isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
                    >
                      <PlusCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider">
                        Nouvel Avis Manuel
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">Créer et lier un avis client à un produit</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className={`p-2 rounded-full transition ${
                      isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-6 space-y-5 overflow-y-auto">

                    {/* Product Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest font-mono" style={{ color: createProductId ? '#10b981' : '#64748b' }}>
                        {createProductId ? '✓ Produit Sélectionné' : '* Produit (Requis)'}
                      </label>
                      <ProductPicker
                        value={createProductId}
                        onChange={(id) => setCreateProductId(id === 0 ? null : id)}
                        placeholder="Rechercher et choisir un produit..."
                      />
                    </div>

                    {/* Author */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Nom de l&apos;Auteur *</label>
                      <input
                        type="text"
                        value={createAuthor}
                        onChange={(e) => setCreateAuthor(e.target.value)}
                        placeholder="Ex: Sarah M."
                        className={`w-full text-xs font-bold rounded-2xl px-4 py-3 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                        required
                      />
                    </div>

                    {/* Rating */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Note *</label>
                      <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)', borderColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => setCreateRating(stars)}
                              className="cursor-pointer transition-transform hover:scale-125 active:scale-95"
                            >
                              <Star
                                className={`w-7 h-7 transition-all ${
                                  stars <= createRating
                                    ? 'text-amber-400 fill-current drop-shadow-sm'
                                    : (isDark ? 'text-slate-700 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400')
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-500 font-mono ml-auto">
                          {createRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Avis Client *</label>
                      <textarea
                        value={createComment}
                        onChange={(e) => setCreateComment(e.target.value)}
                        rows={3}
                        placeholder="Contenu de l'avis client..."
                        className={`w-full text-xs font-medium rounded-2xl p-4 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Statut de Publication</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'Approved', label: 'En ligne', color: '#10b981' },
                          { val: 'Pending', label: 'En attente', color: '#f59e0b' },
                          { val: 'Hidden', label: 'Masqué', color: '#a855f7' },
                        ].map((item) => {
                          const active = createStatus === item.val;
                          return (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => setCreateStatus(item.val)}
                              className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                                active
                                  ? 'text-white shadow-md scale-[1.02]'
                                  : (isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300')
                              }`}
                              style={active ? { background: item.color, borderColor: item.color } : {}}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Réponse Admin (Optionnel)</label>
                      <textarea
                        value={createReply}
                        onChange={(e) => setCreateReply(e.target.value)}
                        placeholder="Optionnel : réponse officielle de l'équipe..."
                        rows={2}
                        className={`w-full text-xs font-medium rounded-2xl p-4 outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100'
                            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800'
                        }`}
                      />
                    </div>

                  </div>

                  {/* Sticky Footer */}
                  <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${
                    isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition ${
                        isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
                      }`}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || !createProductId || !createAuthor.trim() || !createComment.trim()}
                      className="px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-950 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
                    >
                      {isCreating ? 'Création...' : 'Créer l\'avis'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}



      {/* 🎛️ Floating Bulk Action Bar */}
      {selectedReviewIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-scale-up">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {selectedReviewIds.length} avis sélectionné(s)
              </span>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => handleBulkUpdate('Approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Approuver
              </button>
              <button
                onClick={() => handleBulkUpdate('Hidden')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Masquer
              </button>
              <button
                onClick={() => handleBulkUpdate('Rejected')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Rejeter (Masquer)
              </button>
              <button
                onClick={() => setSelectedReviewIds([])}
                className="px-3 py-2 bg-transparent hover:bg-slate-900 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
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
