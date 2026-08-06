'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SettingsTab from '@/components/admin/SettingsTab';
import { useAdminUI } from '@/app/admin/AdminUIContext';

// Map URL tab param values → AdminUIContext tab ids
const TAB_MAP: Record<string, string> = {
  general:      'general',
  shipping:     'shipping',
  payment:      'payment',
  gifts:        'gifts',
  loyalty:      'loyalty',
  faq:          'faq',
  notifications:'notifications',
  banners:      'banners',
  logs:         'logs',
  security:     'security',
  operators:    'operators',
  homepage:     'homepage',
};

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const { setActiveSettingsSubTab } = useAdminUI();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TAB_MAP[tabParam]) {
      setActiveSettingsSubTab(TAB_MAP[tabParam] as any);
    }
  }, [searchParams, setActiveSettingsSubTab]);

  return <SettingsTab />;
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<SettingsTab />}>
      <SettingsPageInner />
    </Suspense>
  );
}
