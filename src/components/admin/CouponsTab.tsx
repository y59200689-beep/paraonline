'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdminUI } from '@/app/admin/AdminUIContext';
import {
  Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Tag,
  TrendingUp, ShoppingCart, Calendar, AlertCircle, Percent,
  DollarSign, CheckCircle, XCircle, Clock, Users
} from 'lucide-react';

export default function CouponsTab() {
  const { handleSaveCoupon, handleDeleteCoupon, handleToggleCouponActive, adminTheme, dashboardStats } = useAdmin();
  const { settings } = useSettings();
  const { showToast } = useUi();
  const { isAddingCoupon, setIsAddingCoupon } = useAdminUI();

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    minPurchase: 0,
    startDate: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 0,
    freeShipping: false,
    isActive: true
  });

  const resetForm = () => setCouponForm({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    minPurchase: 0,
    startDate: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 0,
    freeShipping: false,
    isActive: true
  });

  const onSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSaveCoupon(couponForm);
    if (success) {
      setIsAddingCoupon(false);
      resetForm();
      showToast('Coupon sauvegardé avec succès !', 'success');
    } else {
      showToast('Erreur lors de la sauvegarde du coupon.', 'error');
    }
  };

  const onDeleteCoupon = async (code: string) => {
    if (!confirm(`Voulez-vous supprimer le code promo ${code} ?`)) return;
    const success = await handleDeleteCoupon(code);
    if (success) {
      showToast('Coupon supprimé.', 'success');
    } else {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const onToggleCoupon = async (code: string) => {
    await handleToggleCouponActive(code);
  };

  const light = adminTheme === 'light';
  const coupons = settings.coupons || [];

  const inputCls = `w-full text-xs transition outline-none rounded-xl px-3 py-2.5 border font-mono ${
    light
      ? 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
      : 'bg-slate-950 border-slate-900 text-slate-200 focus:border-emerald-500/50'
  }`;

  const labelCls = `text-[10px] font-semibold uppercase tracking-wider ${light ? 'text-slate-600' : 'text-slate-400'}`;

  // Summary stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive !== false).length;
  type CouponStat = { count: number; totalDiscount: number; revenue: number };
  const couponStats = (dashboardStats?.couponUsageStats || {}) as Record<string, CouponStat>;
  const totalUses = Object.values(couponStats).reduce((s, v) => s + v.count, 0);
  const totalRevenue = Object.values(couponStats).reduce((s, v) => s + (v.revenue || 0), 0);

  return (
    <div className="space-y-6 p-1 admin-tab-enter">

      {/* ── Summary KPI Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Codes au total', value: totalCoupons, icon: Ticket, color: 'text-violet-500', bg: light ? 'bg-violet-50' : 'bg-violet-950/30', border: light ? 'border-violet-100' : 'border-violet-900/40' },
          { label: 'Codes actifs', value: activeCoupons, icon: CheckCircle, color: 'text-emerald-500', bg: light ? 'bg-emerald-50' : 'bg-emerald-950/30', border: light ? 'border-emerald-100' : 'border-emerald-900/40' },
          { label: 'Utilisations (total)', value: totalUses, icon: Users, color: 'text-blue-500', bg: light ? 'bg-blue-50' : 'bg-blue-950/30', border: light ? 'border-blue-100' : 'border-blue-900/40' },
          { label: 'Revenu généré', value: `${totalRevenue.toFixed(0)} DH`, icon: TrendingUp, color: 'text-amber-500', bg: light ? 'bg-amber-50' : 'bg-amber-950/30', border: light ? 'border-amber-100' : 'border-amber-900/40' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${kpi.border} ${light ? 'bg-white shadow-sm' : 'bg-slate-900/40'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div>
                <div className={`text-lg font-black font-mono ${light ? 'text-slate-800' : 'text-slate-100'}`}>{kpi.value}</div>
                <div className={`text-[10px] font-medium ${light ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Header Toolbar ── */}
      <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${light ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'}`}>
        <div>
          <span className={`text-xs font-bold ${light ? 'text-slate-700' : 'text-slate-200'}`}>
            Codes Promo & Promotions
          </span>
          <p className={`text-[10px] mt-0.5 font-mono ${light ? 'text-slate-500' : 'text-slate-500'}`}>
            {coupons.length} code{coupons.length !== 1 ? 's' : ''} enregistré{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsAddingCoupon(!isAddingCoupon)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAddingCoupon ? 'Fermer' : 'Nouveau Code Promo'}
        </button>
      </div>

      {/* ── Creation Form ── */}
      {isAddingCoupon && (
        <form onSubmit={onSaveCoupon} className={`border rounded-3xl p-6 space-y-6 transition-all duration-200 ${
          light
            ? 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-800'
            : 'bg-slate-900/30 border-emerald-500/20 shadow-xl'
        }`}>
          <div className={`border-b pb-3 ${light ? 'border-slate-100' : 'border-slate-900'}`}>
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${light ? 'text-emerald-700' : 'text-emerald-400'}`}>
              <Ticket className="w-3.5 h-3.5" />
              Nouveau Coupon de Réduction
            </h3>
            <p className={`text-[10px] mt-1 ${light ? 'text-slate-500' : 'text-slate-500'}`}>
              Configurez tous les paramètres du code promo ci-dessous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <label className={labelCls}>Code Promo (Majuscules)</label>
              <input
                type="text"
                placeholder="Ex: SPECIAL20"
                value={couponForm.code}
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className={`${inputCls} font-black`}
                required
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-1.5">
              <label className={labelCls}>Type de réduction</label>
              <select
                value={couponForm.discountType}
                onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                className={inputCls}
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (DH)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="space-y-1.5">
              <label className={labelCls}>Valeur de la réduction</label>
              <input
                type="number"
                min={0}
                value={couponForm.discountValue}
                onChange={e => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                className={`${inputCls} text-right`}
                required
              />
            </div>

            {/* Min Purchase */}
            <div className="space-y-1.5">
              <label className={labelCls}>Achat minimum requis (DH)</label>
              <input
                type="number"
                min={0}
                value={couponForm.minPurchase}
                onChange={e => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })}
                className={`${inputCls} text-right`}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className={labelCls}>Date de début (optionnelle)</label>
              <input
                type="date"
                value={couponForm.startDate}
                onChange={e => setCouponForm({ ...couponForm, startDate: e.target.value })}
                className={inputCls}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className={labelCls}>Date d&apos;expiration</label>
              <input
                type="date"
                value={couponForm.expiryDate}
                onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                className={inputCls}
                required
              />
            </div>

            {/* Usage Limit */}
            <div className="space-y-1.5">
              <label className={labelCls}>Limite d&apos;utilisation (0 = illimitée)</label>
              <input
                type="number"
                min={0}
                value={couponForm.usageLimit}
                onChange={e => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                className={`${inputCls} text-right`}
                placeholder="Ex: 100"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-6">
              <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${light ? 'text-slate-700' : 'text-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={couponForm.freeShipping}
                  onChange={e => setCouponForm({ ...couponForm, freeShipping: e.target.checked })}
                  className={`rounded text-emerald-500 focus:ring-emerald-500 ${light ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-900'}`}
                />
                Livraison Gratuite
              </label>
              <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${light ? 'text-slate-700' : 'text-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={couponForm.isActive}
                  onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className={`rounded text-emerald-500 focus:ring-emerald-500 ${light ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-900'}`}
                />
                Actif Immédiatement
              </label>
            </div>
          </div>

          <div className={`pt-4 border-t flex justify-end gap-2 ${light ? 'border-slate-100' : 'border-slate-900'}`}>
            <button
              type="button"
              onClick={() => setIsAddingCoupon(false)}
              className={`px-4 py-2 border font-bold rounded-xl text-xs uppercase transition-all ${
                light
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Sauvegarder le Coupon
            </button>
          </div>
        </form>
      )}

      {/* ── Coupons Grid ── */}
      {coupons.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${light ? 'bg-white border-slate-200/80' : 'bg-slate-900/30 border-slate-900'}`}>
          <Ticket className={`w-10 h-10 mx-auto mb-3 ${light ? 'text-slate-300' : 'text-slate-700'}`} />
          <p className={`text-sm font-bold ${light ? 'text-slate-500' : 'text-slate-500'}`}>Aucun code promo enregistré</p>
          <p className={`text-xs mt-1 ${light ? 'text-slate-400' : 'text-slate-600'}`}>Créez votre premier coupon avec le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {coupons.map(coupon => {
            const discountTypeStr = coupon.discountType || 'percent';
            const discountValueNum = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discountPercent;
            const hasExpired = coupon.expiryDate ? new Date(coupon.expiryDate).getTime() < new Date().setHours(0,0,0,0) : false;
            const todayStr = new Date().toISOString().split('T')[0];
            const notStarted = coupon.startDate ? coupon.startDate > todayStr : false;
            const usageStat = dashboardStats?.couponUsageStats?.[coupon.code.toUpperCase()] || { count: 0, totalDiscount: 0, revenue: 0 };
            const usagePercent = coupon.usageLimit && coupon.usageLimit > 0
              ? Math.min(100, Math.round((usageStat.count / coupon.usageLimit) * 100))
              : null;
            const isActive = coupon.isActive !== false && !hasExpired && !notStarted;

            return (
              <div
                key={coupon.code}
                className={`border rounded-2xl p-5 space-y-4 hover:scale-[1.005] transition-all duration-300 relative flex flex-col justify-between ${
                  !isActive
                    ? (light ? 'opacity-65 border-slate-200/50 bg-slate-50/50' : 'opacity-65 border-slate-800 bg-slate-900/20')
                    : (light
                        ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md text-slate-800'
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-700 text-slate-200')
                }`}
              >
                <div className="space-y-3">
                  {/* Code + Status badges */}
                  <div className="flex justify-between items-start gap-3">
                    <span className={`font-extrabold text-sm tracking-wider font-mono uppercase rounded-lg px-2.5 py-1 border ${
                      light ? 'text-emerald-700 bg-emerald-50 border-emerald-100/80' : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
                    }`}>
                      {coupon.code}
                    </span>
                    <div className="flex gap-1.5 items-center flex-wrap justify-end">
                      {hasExpired && (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Expiré</span>
                      )}
                      {notStarted && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">En attente</span>
                      )}
                      <button
                        onClick={() => onToggleCoupon(coupon.code)}
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          coupon.isActive !== false
                            ? (light
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/20')
                            : (light
                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                : 'bg-slate-950 text-slate-500 border-slate-900 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/20')
                        }`}
                      >
                        {coupon.isActive !== false ? 'Actif' : 'Inactif'}
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className={`space-y-1.5 font-mono text-[10px] ${light ? 'text-slate-600' : 'text-slate-400'}`}>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        {discountTypeStr === 'percent' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                        Réduction:
                      </span>
                      <span className={`font-bold ${light ? 'text-slate-800' : 'text-slate-200'}`}>
                        {discountValueNum} {discountTypeStr === 'percent' ? '%' : 'DH'}
                      </span>
                    </div>
                    {(coupon.minPurchase || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Min. achat:</span>
                        <span className={`font-bold ${light ? 'text-slate-800' : 'text-slate-200'}`}>{coupon.minPurchase} DH</span>
                      </div>
                    )}
                    {coupon.startDate && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Début:</span>
                        <span className={`font-bold ${light ? 'text-slate-800' : 'text-slate-200'}`}>{coupon.startDate}</span>
                      </div>
                    )}
                    {coupon.expiryDate && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expire:</span>
                        <span className={`font-bold ${hasExpired ? 'text-rose-500' : (light ? 'text-slate-800' : 'text-slate-200')}`}>{coupon.expiryDate}</span>
                      </div>
                    )}
                    {coupon.freeShipping && (
                      <div className="flex justify-between">
                        <span>Livraison:</span>
                        <span className="font-bold text-emerald-500">GRATUITE</span>
                      </div>
                    )}
                  </div>

                  {/* Usage limit bar */}
                  {coupon.usageLimit && coupon.usageLimit > 0 ? (
                    <div className="space-y-1.5">
                      <div className={`flex justify-between text-[9px] font-mono ${light ? 'text-slate-500' : 'text-slate-500'}`}>
                        <span>Utilisations</span>
                        <span className={light ? 'text-slate-700' : 'text-slate-300'}>{usageStat.count} / {coupon.usageLimit}</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${light ? 'bg-slate-100' : 'bg-slate-800'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (usagePercent || 0) >= 100 ? 'bg-rose-500' : (usagePercent || 0) >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercent || 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`text-[9px] font-mono ${light ? 'text-slate-400' : 'text-slate-600'}`}>
                      Utilisations: {usageStat.count}x · Illimité
                    </div>
                  )}
                </div>

                {/* Usage Metrics Footer */}
                <div className={`pt-3 border-t space-y-2 ${light ? 'border-slate-100' : 'border-slate-950/80'}`}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`rounded-xl p-2.5 ${light ? 'bg-slate-50 border border-slate-100' : 'bg-slate-950/50 border border-slate-900'}`}>
                      <div className={`text-[9px] font-semibold uppercase tracking-wider mb-0.5 ${light ? 'text-slate-400' : 'text-slate-600'}`}>Utilisations</div>
                      <div className={`text-sm font-black font-mono ${light ? 'text-slate-800' : 'text-slate-200'}`}>{usageStat.count}x</div>
                    </div>
                    <div className={`rounded-xl p-2.5 ${light ? 'bg-emerald-50 border border-emerald-100/60' : 'bg-emerald-950/20 border border-emerald-900/30'}`}>
                      <div className={`text-[9px] font-semibold uppercase tracking-wider mb-0.5 ${light ? 'text-emerald-600' : 'text-emerald-700'}`}>Revenu généré</div>
                      <div className={`text-sm font-black font-mono ${light ? 'text-emerald-700' : 'text-emerald-400'}`}>{(usageStat as any).revenue ? (usageStat as any).revenue.toFixed(0) : '0'} DH</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-mono ${light ? 'text-slate-400' : 'text-slate-600'}`}>
                      -{ usageStat.totalDiscount.toFixed(0)} DH de remise accordée
                    </span>
                    <button
                      onClick={() => onDeleteCoupon(coupon.code)}
                      className={`font-black uppercase tracking-wider text-[9px] flex items-center gap-0.5 cursor-pointer ${
                        light ? 'text-rose-500 hover:text-rose-700' : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
