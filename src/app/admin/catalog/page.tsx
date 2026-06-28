'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdminUI } from '../AdminUIContext';
import { useAdmin } from '@/context/AdminContext';
import CatalogTab from '@/components/admin/CatalogTab';
import RestockForecastingTab from '@/components/admin/RestockForecastingTab';
import { List, TrendingUp } from 'lucide-react';

const CATALOG_TABS = [
  { id: 'products', label: 'Liste des Produits',       icon: List },
  { id: 'restock',  label: 'Prévisions & Ravitaillement', icon: TrendingUp },
] as const;

type CatalogSubTab = typeof CATALOG_TABS[number]['id'];

export default function AdminCatalogPage() {
  const { catalogStockFilter, setCatalogStockFilter } = useAdminUI();
  const { adminTheme } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<CatalogSubTab>('products');

  // Sliding pill refs
  const barRef  = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const movePill = useCallback((idx: number, animate: boolean) => {
    const pill = pillRef.current;
    const btn  = btnRefs.current[idx];
    if (!pill || !btn) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform  = `translateX(${btn.offsetLeft}px)`;
      pill.style.width      = `${btn.offsetWidth}px`;
      // Force a reflow so the transition-less position takes effect instantly
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
      pill.style.width     = `${btn.offsetWidth}px`;
    }
  }, []);

  // Position pill on mount + on tab change
  useEffect(() => {
    const idx = CATALOG_TABS.findIndex(t => t.id === activeSubTab);
    movePill(idx, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reposition pill on window resize without animation
  useEffect(() => {
    const onResize = () => {
      const idx = CATALOG_TABS.findIndex(t => t.id === activeSubTab);
      movePill(idx, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeSubTab, movePill]);

  const handleTabClick = (id: CatalogSubTab, idx: number) => {
    setActiveSubTab(id);
    movePill(idx, true);
  };

  // Pill colour overrides per theme — we layer on top of the base .t-tabs-pill
  const pillStyle: React.CSSProperties = {
    background: adminTheme === 'light'
      ? 'rgba(255,255,255,1)'
      : 'hsl(224 18% 15%)',
    boxShadow: adminTheme === 'light'
      ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
      : '0 1px 6px rgba(0,0,0,0.3)',
    borderRadius: '10px',
    height: '100%',
    top: 0,
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs — sliding pill */}
      <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
        <div
          ref={barRef}
          className={`relative p-1 rounded-2xl border flex gap-1.5 shrink-0 ${
            adminTheme === 'light'
              ? 'bg-slate-100/80 border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
              : 'bg-slate-900/60 border-slate-900'
          }`}
          role="tablist"
        >
          {/* Animated pill */}
          <span
            ref={pillRef}
            aria-hidden="true"
            className="absolute left-0 pointer-events-none"
            style={pillStyle}
          />

          {CATALOG_TABS.map((tab, idx) => {
            const Icon     = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={el => { btnRefs.current[idx] = el; }}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab.id, idx)}
                className={`relative z-10 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? (adminTheme === 'light' ? 'text-slate-900 font-black' : 'text-emerald-400 font-black')
                    : (adminTheme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300')
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content — cross-fade panel transition */}
      <div key={activeSubTab} className="t-panel">
        {activeSubTab === 'products' ? (
          <CatalogTab
            catalogStockFilter={catalogStockFilter}
            setCatalogStockFilter={setCatalogStockFilter}
          />
        ) : (
          <RestockForecastingTab />
        )}
      </div>
    </div>
  );
}
