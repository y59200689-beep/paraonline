'use client';

import React from 'react';
import { useAdminUI } from '../AdminUIContext';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';

export default function AdminAnalyticsPage() {
  const {
    analyticsRange,
    setAnalyticsRange,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    analyticsSortCol,
    setAnalyticsSortCol,
    analyticsSortDir,
    setAnalyticsSortDir,
    analyticsChartHoverIdx,
    setAnalyticsChartHoverIdx
  } = useAdminUI();

  return (
    <AnalyticsTab 
      analyticsRange={analyticsRange}
      setAnalyticsRange={setAnalyticsRange}
      customDateFrom={customDateFrom}
      setCustomDateFrom={setCustomDateFrom}
      customDateTo={customDateTo}
      setCustomDateTo={setCustomDateTo}
      analyticsSortCol={analyticsSortCol}
      setAnalyticsSortCol={setAnalyticsSortCol}
      analyticsSortDir={analyticsSortDir}
      setAnalyticsSortDir={setAnalyticsSortDir}
      analyticsChartHoverIdx={analyticsChartHoverIdx}
      setAnalyticsChartHoverIdx={setAnalyticsChartHoverIdx}
    />
  );
}
