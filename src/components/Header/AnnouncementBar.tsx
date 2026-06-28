'use client';

import React from 'react';

interface AnnouncementBarProps {
  message: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ message }) => (
  <div className="bg-primary text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden relative">
    <div className="inline-block animate-marquee-slow whitespace-nowrap">
      <span>{message}</span>
      <span className="mx-10 opacity-30">•</span>
      <span>{message}</span>
      <span className="mx-10 opacity-30">•</span>
      <span>{message}</span>
      <span className="mx-10 opacity-30">•</span>
    </div>
  </div>
);
