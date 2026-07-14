'use client';

import React, { useState, useMemo } from 'react';
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
  Zap
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { StatusBadge, EmptyState } from '@/components/admin/ui';

export default function ReviewsTab() {
  const {
    reviews,
    products,
    adminTheme,
    handleUpdateReviewStatus,
    handleBulkUpdateReviewStatus,
    handleReplyReview,
    handleDeleteReview,
    handleUpdateReview,
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
  const [isSaving, setIsSaving] = useState(false);

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
      reply: editReply.trim()
    });
    setIsSaving(false);
    if (success) {
      setEditingReview(null);
    }
  };

  const handleToggleHide = async (rev: any) => {
    const newStatus = rev.status.toLowerCase() === 'hidden' ? 'Approved' : 'Hidden';
    await handleUpdateReview(rev.id, { status: newStatus });
  };

  return (
    <div className="space-y-6 admin-tab-enter">
      {/* 🚀 Premium Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Reviews */}
        <div className={`p-4 rounded-2xl border transition-all ${
          adminTheme === 'light'
            ? 'bg-white border-slate-200/80 shadow-[var(--admin-shadow-sm)]'
            : 'bg-slate-900/30 border-slate-900'
        }`}>
          <span
            className="block mb-1 font-semibold uppercase tracking-widest"
            style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
          >
            Total des Avis
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-bold"
              style={{ fontSize: 'var(--admin-text-2xl)', color: 'var(--admin-text-primary)' }}
            >
              {stats.total}
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-muted)' }}>Soumis</span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className={`p-4 rounded-2xl border transition-all ${
          stats.pending > 0
            ? (adminTheme === 'light' ? 'bg-amber-50/55 border-amber-200' : 'bg-amber-500/5 border-amber-500/20')
            : (adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/30 border-slate-900')
        }`}>
          <span
            className="block mb-1 font-semibold uppercase tracking-widest"
            style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
          >
            En attente
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-bold"
              style={{ fontSize: 'var(--admin-text-2xl)', color: stats.pending > 0 ? 'hsl(38 92% 50%)' : 'var(--admin-text-primary)' }}
            >
              {stats.pending}
            </span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse self-center" />
            )}
          </div>
        </div>

        {/* Approved Reviews */}
        <div className={`p-4 rounded-2xl border transition-all ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/30 border-slate-900'
        }`}>
          <span
            className="block mb-1 font-semibold uppercase tracking-widest"
            style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
          >
            Approuvés
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-emerald-500" style={{ fontSize: 'var(--admin-text-2xl)' }}>{stats.approved}</span>
            <span className="font-mono" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-muted)' }}>Visible</span>
          </div>
        </div>

        {/* Hidden Reviews */}
        <div className={`p-4 rounded-2xl border transition-all ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/30 border-slate-900'
        }`}>
          <span
            className="block mb-1 font-semibold uppercase tracking-widest"
            style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
          >
            Masqués
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-bold"
              style={{ fontSize: 'var(--admin-text-2xl)', color: 'var(--admin-text-secondary)' }}
            >
              {stats.hidden}
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-muted)' }}>Modéré</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className={`p-4 rounded-2xl border transition-all ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/30 border-slate-900'
        }`}>
          <span
            className="block mb-1 font-semibold uppercase tracking-widest"
            style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}
          >
            Note Moyenne
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-500" style={{ fontSize: 'var(--admin-text-2xl)' }}>{stats.avg}</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 fill-current ${
                    i < Math.round(stats.avg) ? 'text-amber-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 🆕 Smart Card: Products without any review + in stock */}
        <button
          onClick={() => {
            setShowNoReviewProducts(prev => !prev);
            setNoReviewProductSearch('');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
            showNoReviewProducts
              ? (adminTheme === 'light'
                  ? 'bg-violet-50 border-violet-300 shadow-md ring-2 ring-violet-300/40'
                  : 'bg-violet-500/10 border-violet-500/30 shadow-md ring-2 ring-violet-500/20')
              : productsWithoutReviews.length > 0
              ? (adminTheme === 'light'
                  ? 'bg-white border-violet-200 hover:border-violet-300 shadow-sm hover:shadow-md'
                  : 'bg-slate-900/30 border-violet-500/10 hover:border-violet-500/30 hover:shadow-md')
              : (adminTheme === 'light'
                  ? 'bg-white border-slate-200/80 shadow-sm'
                  : 'bg-slate-900/30 border-slate-900')
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">Sans avis<br/>(en stock)</span>
            <Package className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors ${
              showNoReviewProducts ? 'text-violet-500' : 'text-slate-500 group-hover:text-violet-400'
            }`} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black transition-colors ${
              showNoReviewProducts ? 'text-violet-500'
              : productsWithoutReviews.length > 0 ? 'text-violet-500'
              : (adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100')
            }`}>
              {productsWithoutReviews.length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Produits</span>
          </div>
          {showNoReviewProducts && (
            <span className="text-[8px] font-bold uppercase tracking-widest text-violet-500 block mt-1">Actif ↗</span>
          )}
        </button>
      </div>

      {/* 🔍 Search, Filters & View Toggle */}
      <div className={`p-4 rounded-2xl border transition-all ${
        adminTheme === 'light'
          ? 'bg-white border-slate-200/80 shadow-sm'
          : 'bg-slate-900/30 border-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar and rating/status filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
                type="text"
                placeholder="Rechercher par auteur, commentaire, produit..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="admin-input admin-focus-ring w-full pl-9"
              />
            </div>

            {/* Status Select Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Statut:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="admin-input"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="hidden">Masqués</option>
              </select>
            </div>

            {/* Rating Select Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Note:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="admin-input"
              >
                <option value="all">Toutes</option>
                <option value="5">5 Étoiles</option>
                <option value="4">4 Étoiles</option>
                <option value="3">3 Étoiles</option>
                <option value="2">2 Étoiles</option>
                <option value="1">1 Étoile</option>
              </select>
            </div>

            {/* Smart Filter Pill: Sans avis en stock */}
            <button
              onClick={() => {
                setShowNoReviewProducts(prev => !prev);
                setNoReviewProductSearch('');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                showNoReviewProducts
                  ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/20'
                  : (adminTheme === 'light'
                      ? 'bg-white hover:bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-300'
                      : 'bg-slate-950 hover:bg-violet-500/10 text-violet-400 border-violet-500/20 hover:border-violet-500/40')
              }`}
            >
              <Zap className="w-3 h-3" />
              Sans avis &middot; En stock
              <span className={`font-mono text-[9px] px-1 py-0.5 rounded ${
                showNoReviewProducts
                  ? 'bg-white/20 text-white'
                  : (adminTheme === 'light' ? 'bg-violet-100 text-violet-700' : 'bg-violet-500/10 text-violet-400')
              }`}>
                {productsWithoutReviews.length}
              </span>
            </button>

            {/* Clear Filters Button */}
            {(reviewSearchQuery || statusFilter !== 'all' || ratingFilter !== 'all' || showNoReviewProducts) && (
              <button
                onClick={() => {
                  setReviewSearchQuery('');
                  setStatusFilter('all');
                  setRatingFilter('all');
                  setShowNoReviewProducts(false);
                  setNoReviewProductSearch('');
                }}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition ${
                  adminTheme === 'light'
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Selection control & view toggles */}
          <div className="flex items-center gap-3">
            {filteredReviews.length > 0 && (
              <button
                onClick={() => {
                  if (selectedReviewIds.length === filteredReviews.length) {
                    setSelectedReviewIds([]);
                  } else {
                    setSelectedReviewIds(filteredReviews.map(r => r.id));
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  adminTheme === 'light'
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {selectedReviewIds.length === filteredReviews.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            )}

            {/* View Mode Toggle */}
            <div className={`p-0.5 rounded-xl border flex gap-0.5 ${
              adminTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  viewMode === 'list'
                    ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
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
      {!showNoReviewProducts && (viewMode === 'grid' ? (
        // Grid View Layout
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredReviews.map(rev => {
            const prod = products.find(p => p.id === rev.productId);
            const isPending = rev.status.toLowerCase() === 'pending';
            const isHidden = rev.status.toLowerCase() === 'hidden';
            const firstLetter = rev.author?.trim().charAt(0).toUpperCase() || '?';

            return (
              <div
                key={rev.id}
                className={`border rounded-2xl p-5 space-y-4 transition-all duration-300 relative group flex flex-col justify-between ${
                  isPending
                    ? (adminTheme === 'light' ? 'border-amber-200 bg-amber-50/15' : 'border-amber-500/10 bg-amber-500/5')
                    : isHidden
                    ? (adminTheme === 'light' ? 'border-purple-200 bg-purple-50/10' : 'border-purple-500/10 bg-purple-500/5')
                    : (adminTheme === 'light'
                        ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                        : 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800/80 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]')
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header: Author, Rating, Checkbox, Status */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        className={`rounded cursor-pointer w-4.5 h-4.5 shrink-0 ${
                          adminTheme === 'light'
                            ? 'border-slate-300 text-emerald-600 focus:ring-emerald-500/30'
                            : 'border-slate-700 bg-slate-950 text-emerald-600'
                        }`}
                        checked={selectedReviewIds.includes(rev.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviewIds(prev => [...prev, rev.id]);
                          } else {
                            setSelectedReviewIds(prev => prev.filter(id => id !== rev.id));
                          }
                        }}
                      />
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-sm uppercase shadow-md select-none">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-black text-xs ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                          {rev.author}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono block">
                          {new Date(rev.date).toLocaleDateString()} &agrave; {new Date(rev.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <StatusBadge
                        status={isPending ? 'warning' : isHidden ? 'inactive' : 'active'}
                        label={isPending ? 'En attente' : isHidden ? 'Masqué' : 'Approuvé'}
                        size="xs"
                        theme={adminTheme}
                      />

                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 fill-current ${i < rev.rating ? 'text-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Linked Product Preview Row */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/50 border-slate-200/80'
                      : 'bg-slate-950/40 border-slate-900/80'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prod?.image ? (
                        <img 
                          src={prod.image} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200/40 shadow-sm shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-800 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          PROD
                        </div>
                      )}
                      <div className="min-w-0 leading-tight">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Produit lié</span>
                        <h5 className={`font-bold text-[11px] truncate ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                          {prod?.nameFr || prod?.title || `Produit #${rev.productId}`}
                        </h5>
                        <span className="text-[9px] text-slate-500 font-mono">Stock: {prod?.stock ?? 'N/A'}</span>
                      </div>
                    </div>

                    <a
                      href={`/products/${rev.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded-lg border transition ${
                        adminTheme === 'light'
                          ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                      }`}
                      title="Ouvrir la page produit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Review Text comment */}
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed font-light ${
                    adminTheme === 'light'
                      ? 'bg-slate-50/20 border-slate-200/80 text-slate-700'
                      : 'bg-slate-950/30 border-slate-900/40 text-slate-300'
                  }`}>
                    &ldquo;{rev.comment}&rdquo;
                  </div>

                  {/* Reply text if exists */}
                  {rev.reply && (
                    <div className={`p-3 border rounded-xl text-[11px] font-light pl-4 border-l-2 flex gap-2 items-start ${
                      adminTheme === 'light'
                        ? 'bg-emerald-50/20 border-slate-200/80 text-slate-800 border-l-emerald-500 shadow-sm'
                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 border-l-emerald-500 shadow-sm'
                    }`}>
                      <CornerDownRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[8px] uppercase tracking-wider block mb-1">
                          Réponse Officielle :
                        </span>
                        <p className="italic">{rev.reply}</p>
                      </div>
                    </div>
                  )}

                  {/* Response input drawer */}
                  {replyingReviewId === rev.id && (
                    <form onSubmit={handleReplySubmit} className="space-y-2 pt-2 animate-scale-up">
                      <textarea
                        placeholder="Saisir la réponse publique au client..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        className={`w-full text-xs rounded-xl p-2.5 outline-none border transition ${
                          adminTheme === 'light'
                            ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-200'
                        }`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className={`px-2.5 py-1 border font-bold rounded-lg text-[10px] uppercase transition-all ${
                            adminTheme === 'light'
                              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                          }`}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] uppercase transition-all shadow-md cursor-pointer"
                        >
                          Enregistrer Réponse
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Action buttons footer */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/20 text-[10px] font-black uppercase tracking-wider mt-4">
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous vraiment supprimer définitivement cet avis ?")) {
                        handleDeleteReview(rev.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-400 flex items-center gap-1 font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>

                  <div className="flex gap-3">
                    {/* Reply Toggle */}
                    {!rev.reply && replyingReviewId !== rev.id && (
                      <button
                        onClick={() => { 
                          setReplyingReviewId(rev.id); 
                          setReplyText(rev.reply || ''); 
                        }}
                        className={`hover:text-slate-200 font-bold flex items-center gap-1 transition ${
                          adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Répondre
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => startEdit(rev)}
                      className={`hover:text-slate-200 font-bold flex items-center gap-1 transition ${
                        adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Modifier
                    </button>

                    {/* Toggle Hide/Show Button */}
                    <button
                      onClick={() => handleToggleHide(rev)}
                      className={`font-bold flex items-center gap-1 transition ${
                        isHidden 
                          ? 'text-emerald-500 hover:text-emerald-400' 
                          : 'text-purple-500 hover:text-purple-400'
                      }`}
                      title={isHidden ? "Afficher publiquement" : "Masquer aux clients"}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Afficher
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Masquer
                        </>
                      )}
                    </button>

                    {/* Quick Approve if Pending */}
                    {isPending && (
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approuver
                      </button>
                    )}
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
                {filteredReviews.map(rev => {
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

      {/* ⚠️ Empty State — only when NOT showing the smart filter panel */}
      {!showNoReviewProducts && filteredReviews.length === 0 && (
        <EmptyState
          icon={AlertCircle}
          title="Aucun avis trouvé"
          description="Essayez de modifier votre recherche ou vos filtres."
          theme={adminTheme}
        />
      )}

      {/* 📝 Premium Centered Editing Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
            adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 border-b flex justify-between items-center ${
              adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800/80'
            }`}>
              <div>
                <h3 className={`font-black text-sm uppercase tracking-wider ${
                  adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  Modifier l'Avis client
                </h3>
                <span className="text-[9px] text-slate-500 font-mono block">ID: {editingReview.id}</span>
              </div>
              <button 
                onClick={() => setEditingReview(null)}
                className={`p-1.5 rounded-lg border transition ${
                  adminTheme === 'light' 
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500' 
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Author name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Auteur</label>
                <input 
                  type="text" 
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 outline-none border transition ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800'
                      : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-200'
                  }`}
                  required
                />
              </div>

              {/* Rating Star selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Note</label>
                <div className="flex gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setEditRating(stars)}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        className={`w-7 h-7 transition-all ${
                          stars <= editRating 
                            ? 'text-amber-400 fill-current filter drop-shadow-sm' 
                            : 'text-slate-700 hover:text-slate-500'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Commentaire</label>
                <textarea 
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  className={`w-full text-xs rounded-xl p-2.5 outline-none border transition ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800'
                      : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-200'
                  }`}
                  required
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Statut de Mod&eacute;ration</label>
                <div className="flex gap-4">
                  {/* Approved Option */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input 
                      type="radio" 
                      name="editStatus" 
                      value="Approved"
                      checked={editStatus === 'Approved'}
                      onChange={() => setEditStatus('Approved')}
                      className="text-emerald-500 focus:ring-emerald-500/25 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">En Ligne (Approuvé)</span>
                  </label>

                  {/* Pending Option */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input 
                      type="radio" 
                      name="editStatus" 
                      value="Pending"
                      checked={editStatus === 'Pending'}
                      onChange={() => setEditStatus('Pending')}
                      className="text-amber-500 focus:ring-amber-500/25 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-amber-500 font-bold uppercase text-[10px] tracking-wider">En attente</span>
                  </label>

                  {/* Hidden Option */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input 
                      type="radio" 
                      name="editStatus" 
                      value="Hidden"
                      checked={editStatus === 'Hidden'}
                      onChange={() => setEditStatus('Hidden')}
                      className="text-purple-500 focus:ring-purple-500/25 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-purple-500 font-bold uppercase text-[10px] tracking-wider">Masqué</span>
                  </label>
                </div>
              </div>

              {/* Administrator Reply input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">R&eacute;ponse de l'administrateur</label>
                <textarea 
                  value={editReply}
                  onChange={(e) => setEditReply(e.target.value)}
                  placeholder="Laisser vide pour ne pas répondre..."
                  rows={2}
                  className={`w-full text-xs rounded-xl p-2.5 outline-none border transition ${
                    adminTheme === 'light'
                      ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800'
                      : 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-200'
                  }`}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-200/10">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className={`px-4 py-2 border font-bold rounded-xl text-[10px] uppercase transition-all ${
                    adminTheme === 'light'
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-slate-950 font-bold rounded-xl text-[10px] uppercase transition-all shadow-md cursor-pointer"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
