'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicInteractiveFaq = dynamic(
  () => import('./InteractiveFaq').then(mod => mod.InteractiveFaq),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 text-center animate-pulse text-slate-500 bg-slate-50/50 rounded-[28px] my-10 max-w-[1400px] mx-auto min-h-[500px] border border-slate-200/50" />
    ),
  }
);

export const InteractiveFaqWrapper: React.FC = () => {
  return <DynamicInteractiveFaq />;
};
