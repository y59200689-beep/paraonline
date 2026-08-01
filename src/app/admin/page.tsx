'use client';

import React from 'react';
import { useAdminUI } from './AdminUIContext';
import { DashboardTab } from '@/components/admin/DashboardTab';

export default function AdminDashboardPage() {
  const {
    setActiveTab,
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
