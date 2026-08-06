'use client';

import React from 'react';
import { redirect } from 'next/navigation';

// Redirect /admin/gifts → /admin/loyalty (Cadeaux section)
// This page exists solely to give Cadeaux its own URL so it
// doesn't conflict with the Fidélité nav item active state.
export default function AdminGiftsPage() {
  redirect('/admin/loyalty');
}
