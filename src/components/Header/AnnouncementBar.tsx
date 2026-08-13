'use client';

import React from 'react';

interface AnnouncementBarProps {
  message: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ message }) => {
  if (!message) return null;
  return (
  <div className="group relative overflow-hidden bg-primary px-3 py-1.5 text-left text-[9px] font-black uppercase tracking-[0.16em] text-white sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]">
    <p className="sr-only">{message}</p>
    <div aria-hidden="true" className="inline-block animate-marquee-slow whitespace-nowrap motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
      {[0, 1, 2].map((copy) => (
        <React.Fragment key={copy}>
          <span>{message}</span>
          <span className="mx-10 opacity-30">•</span>
        </React.Fragment>
      ))}
    </div>
  </div>
  );
};
