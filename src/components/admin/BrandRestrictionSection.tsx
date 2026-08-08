'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Check, Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, CheckCircle2, X
} from 'lucide-react';

interface BrandItem {
  name: string;
  count: number;
}

interface BrandRestrictionSectionProps {
  isDark?: boolean;
  onSaveSuccess?: () => void;
}

const TOP_DERMO_BRANDS = [
  'LA ROCHE POSAY',
  'VICHY',
  'EUCERIN',
  'BIODERMA',
  'AVENE',
  'SVR',
  'URIAGE',
  'ISDIN',
  'CERA VE',
  'MUSTELA',
  'NOREVA',
  'ACM',
  'A-DERMA'
];

export const BrandRestrictionSection: React.FC<BrandRestrictionSectionProps> = ({
  isDark = false,
  onSaveSuccess
}) => {
  const [allBrands, setAllBrands] = useState<BrandItem[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Fetch brand list and current config
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [brandsRes, configRes] = await Promise.all([
          fetch('/api/cms/brands'),
          fetch('/api/cms/chat')
        ]);

        const brandsData = await brandsRes.json();
        const configData = await configRes.json();

        if (isMounted) {
          if (brandsData.brands) {
            setAllBrands(brandsData.brands);
          }
          if (configData.config) {
            setSelectedBrands(configData.config.allowed_brands || []);
            setIsEnabled(Boolean(configData.config.allowed_brands_enabled));
          }
        }
      } catch (err) {
        console.error('Failed to load brand configuration:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Filtered brands list by search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands;
    const q = searchQuery.toLowerCase().trim();
    return allBrands.filter(b => b.name.toLowerCase().includes(q));
  }, [allBrands, searchQuery]);

  // Compute total eligible products count
  const eligibleProductsCount = useMemo(() => {
    if (!isEnabled || selectedBrands.length === 0) {
      return allBrands.reduce((acc, b) => acc + b.count, 0);
    }
    const set = new Set(selectedBrands.map(b => b.toLowerCase().trim()));
    return allBrands
      .filter(b => set.has(b.name.toLowerCase().trim()))
      .reduce((acc, b) => acc + b.count, 0);
  }, [allBrands, selectedBrands, isEnabled]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev => {
      const exists = prev.some(b => b.toLowerCase() === brandName.toLowerCase());
      const next = exists
        ? prev.filter(b => b.toLowerCase() !== brandName.toLowerCase())
        : [...prev, brandName];
      return next;
    });
    setIsDirty(true);
  };

  const selectTopDermo = () => {
    const matched = allBrands
      .filter(b => TOP_DERMO_BRANDS.some(top => b.name.toUpperCase().includes(top)))
      .map(b => b.name);
    setSelectedBrands(matched.length > 0 ? matched : TOP_DERMO_BRANDS);
    setIsEnabled(true);
    setIsDirty(true);
  };

  const selectAll = () => {
    setSelectedBrands(allBrands.map(b => b.name));
    setIsDirty(true);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/cms/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowed_brands: selectedBrands,
          allowed_brands_enabled: isEnabled
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');

      setSaveMessage({ type: 'success', text: 'Marques autorisées enregistrées avec succès !' });
      setIsDirty(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Impossible de sauvegarder' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-sm ${
      isDark
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* ── Header ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            isDark
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-extrabold text-base tracking-tight m-0 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Restriction des Marques autorisées (IA & Diagnostic)
              </h3>

            </div>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed m-0 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Choisissez précisément les marques que l&apos;Assistant IA et le Diagnostic IA doivent proposer. 
              Par exemple: <strong>La Roche-Posay, Vichy, Eucerin</strong>.
            </p>
          </div>
        </div>

        {/* Primary Save Action */}
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              saveMessage.type === 'success'
                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                : 'text-rose-600'
            }`}>
              {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {saveMessage.text}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 border-0 cursor-pointer shadow-sm ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Enregistrement...' : isDirty ? 'Enregistrer les modifications' : 'Enregistré'}</span>
          </button>
        </div>
      </div>

      {/* ── Mode Selection Segment ── */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          onClick={() => { setIsEnabled(false); setIsDirty(true); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
            !isEnabled
              ? isDark
                ? 'border-indigo-500 bg-indigo-950/40 text-white'
                : 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
              : isDark
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              !isEnabled
                ? 'bg-indigo-600 text-white'
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              🌐
            </div>
            <div>
              <p className="font-bold text-xs m-0">Toutes les marques (Catalogue complet)</p>
              <p className={`text-[11px] mt-0.5 m-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                L&apos;IA recommande parmi tous les produits disponibles en boutique.
              </p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            !isEnabled
              ? 'border-indigo-600 bg-indigo-600'
              : isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
          }`}>
            {!isEnabled && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </label>

        <label
          onClick={() => { setIsEnabled(true); setIsDirty(true); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
            isEnabled
              ? isDark
                ? 'border-emerald-500 bg-emerald-950/40 text-white'
                : 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
              : isDark
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isEnabled
                ? 'bg-emerald-600 text-white'
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>
              🎯
            </div>
            <div>
              <p className="font-bold text-xs m-0">Restreindre aux marques sélectionnées</p>
              <p className={`text-[11px] mt-0.5 m-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                L&apos;IA recommandera exclusivement les marques cochées ci-dessous.
              </p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            isEnabled
              ? 'border-emerald-600 bg-emerald-600'
              : isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
          }`}>
            {isEnabled && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </label>
      </div>

      {/* ── Brand Selection Panel ── */}
      {isEnabled && (
        <div className={`mt-5 space-y-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Quick Presets & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une marque (ex: Vichy, Eucerin, La Roche Posay...)"
                className={`w-full pl-10 pr-9 py-2 rounded-xl text-xs font-medium border outline-none transition ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 shadow-xs'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Presets */}
            <div className="flex items-center gap-2 flex-wrap">

              <button
                type="button"
                onClick={selectAll}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Sélectionner tout ({allBrands.length})
              </button>
              <button
                type="button"
                onClick={clearAll}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  isDark
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                Effacer
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-200'
              : 'bg-slate-100/90 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>
                <strong className={isDark ? 'text-slate-100' : 'text-slate-900'}>{selectedBrands.length}</strong> marques sélectionnées sur {allBrands.length}
              </span>
            </div>
            <span className={`font-mono font-bold ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              ~{eligibleProductsCount} produits éligibles
            </span>
          </div>

          {/* Removable Selected Badges Pills */}
          {selectedBrands.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 p-3 rounded-xl border max-h-28 overflow-y-auto no-scrollbar ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {selectedBrands.map(b => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow-xs"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => toggleBrand(b)}
                    className="hover:opacity-75 cursor-pointer border-0 bg-transparent text-white p-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Brands Selection Grid */}
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Chargement des marques du catalogue...</span>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              Aucune marque ne correspond à &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto p-1 no-scrollbar">
              {filteredBrands.map(brand => {
                const isSelected = selectedBrands.some(b => b.toLowerCase() === brand.name.toLowerCase());
                return (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => toggleBrand(brand.name)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer outline-none ${
                      isSelected
                        ? isDark
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-100 ring-1 ring-emerald-500/30'
                          : 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500/30 shadow-xs'
                        : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[11.5px] truncate m-0 leading-tight">
                        {brand.name}
                      </p>
                      <p className={`text-[9.5px] font-medium m-0 mt-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {brand.count} {brand.count > 1 ? 'produits' : 'produit'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isDark
                          ? 'border-slate-700 bg-slate-800'
                          : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
