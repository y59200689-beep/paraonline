'use client';

import React from 'react';
import { useAdminUI } from './AdminUIContext';
import { DashboardTab } from '@/components/admin/DashboardTab';

export default function AdminDashboardPage() {
  const {
    setActiveTab,
    setCatalogStockFilter,
    setActiveSettingsSubTab,
    analyticsRange,
    setAnalyticsRange,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo
  } = useAdminUI();

  return (
    <DashboardTab 
      setActiveTab={setActiveTab}
      setCatalogStockFilter={setCatalogStockFilter}
      setActiveSettingsSubTab={setActiveSettingsSubTab}
      analyticsRange={analyticsRange}
      setAnalyticsRange={setAnalyticsRange}
      customDateFrom={customDateFrom}
      setCustomDateFrom={setCustomDateFrom}
      customDateTo={customDateTo}
      setCustomDateTo={setCustomDateTo}
    />
  );
}
