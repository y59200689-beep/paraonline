'use client';

import React, { useState, useMemo } from 'react';
import { Star, Search, CheckCircle, Trash2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function ReviewsTab() {
  const {
    reviews,
    products,
    adminTheme,
    handleUpdateReviewStatus,
    handleDeleteReview,
    handleReplyReview,
    handleBulkUpdateReviewStatus,
  } = useAdmin();

  // Local UI state
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = useMemo(() => {
    if (!reviewSearchQuery) return reviews;
    const q = reviewSearchQuery.toLowerCase();
    return reviews.filter(r =>
      r.author?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  }, [reviews, reviewSearchQuery]);

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

  return (
    <div className="space-y-6 admin-tab-enter">

      {/* Search and Moderation Tools */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 ${
        adminTheme === 'light'
          ? 'bg-white border-slate-200/80 shadow-sm'
          : 'bg-slate-900/30 border-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par auteur, commentaire, ID..."
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
              className={`w-full text-xs transition outline-none focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 border ${
                adminTheme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                  : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            />
          </div>
          {filteredReviews.length > 0 && (
            <button
              onClick={() => {
                if (selectedReviewIds.length === filteredReviews.length) {
                  setSelectedReviewIds([]);
                } else {
                  setSelectedReviewIds(filteredReviews.map(r => r.id));
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                adminTheme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {selectedReviewIds.length === filteredReviews.length ? 'Désélectionner tout' : 'Sélectionner tous les résultats'}
            </button>
          )}
        </div>

        <div className={`text-[10px] font-mono flex items-center gap-1.5 shrink-0 transition ${
          adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <Star className="w-3.5 h-3.5 text-yellow-500 animate-spin-slow" />
          <span>Modération active : {reviews.filter(r => r.status === 'pending').length} avis en attente</span>
        </div>
      </div>

      {/* Reviews list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map(rev => {
          const prod = products.find(p => p.id === rev.productId);
          const isPending = rev.status === 'pending';
          const firstLetter = rev.author?.trim().charAt(0).toUpperCase() || '?';

          return (
            <div
              key={rev.id}
              className={`border rounded-2xl p-5 space-y-4 transition ${
                isPending
                  ? (adminTheme === 'light'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-amber-500/20 bg-amber-950/5')
                  : (adminTheme === 'light'
                      ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                      : 'bg-slate-900/40 border-slate-900 hover:border-slate-800')
              }`}
            >
              {/* Header: Author & Product details */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    className={`rounded focus:ring-0 cursor-pointer w-4 h-4 shrink-0 ${
                      adminTheme === 'light' ? 'border-slate-300 bg-slate-50 text-emerald-500' : 'border-slate-700 bg-slate-950'
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
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs uppercase shadow-sm select-none">
                    {firstLetter}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-extrabold text-xs ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{rev.author}</h4>
                    <span className="text-[9px] text-slate-500 font-mono block">{new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold border ${
                    isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {rev.status}
                  </span>

                  <div className="flex gap-0.5 mt-1.5 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? 'text-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review text comment */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed font-light ${
                adminTheme === 'light'
                  ? 'bg-slate-50/60 border-slate-200/80 text-slate-700'
                  : 'bg-slate-950/80 border-slate-900/80 text-slate-300'
              }`}>
                <span className="block text-[9px] text-slate-500 font-mono mb-1">Cible: {prod?.nameFr || prod?.title || `Produit #${rev.productId}`}</span>
                &ldquo;{rev.comment}&rdquo;
              </div>

              {/* Reply box if exists */}
              {rev.reply && (
                <div className={`p-3 border rounded-xl text-[11px] font-light italic pl-4 border-l-2 ${
                  adminTheme === 'light'
                    ? 'bg-emerald-50/40 border-slate-200/80 text-emerald-800 border-l-emerald-500'
                    : 'bg-slate-900 border-slate-800 text-emerald-400 border-l-emerald-500'
                }`}>
                  <span className={`font-bold uppercase tracking-wider text-[8px] block font-sans mb-1 not-italic ${
                    adminTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>Réponse Administrateur:</span>
                  {rev.reply}
                </div>
              )}

              {/* Response input drawer */}
              {replyingReviewId === rev.id && (
                <form onSubmit={handleReplySubmit} className="space-y-2 pt-2">
                  <textarea
                    placeholder="Saisir la réponse au client..."
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
                      className={`px-3 py-1 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer ${
                        adminTheme === 'light'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      Envoyer Réponse
                    </button>
                  </div>
                </form>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-950/80 text-[10px] font-black uppercase tracking-wider">
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>

                <div className="flex gap-2">
                  {!rev.reply && replyingReviewId !== rev.id && (
                    <button
                      onClick={() => { setReplyingReviewId(rev.id); setReplyText(rev.reply || ''); }}
                      className="text-slate-400 hover:text-slate-200 font-bold"
                    >
                      Répondre
                    </button>
                  )}
                  {isPending && (
                    <button
                      onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approuver
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
        {filteredReviews.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 gap-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 6l4.5 9.1 10.1 1.5-7.3 7.1 1.7 10.1L24 29l-9 4.8 1.7-10.1L9.4 16.6l10.1-1.5L24 6z" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-400">Aucun avis client</p>
              <p className="text-[11px] text-slate-600 mt-1">Les avis apparaîtront ici une fois soumis par vos clients</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedReviewIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-scale-up">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {selectedReviewIds.length} avis sélectionné(s)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkUpdate('approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Approuver
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Rejeter
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
