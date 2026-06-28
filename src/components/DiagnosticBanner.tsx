'use client';

import React from 'react';
import Image from 'next/image';
import { useUi } from '@/context/UiContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const DiagnosticBanner: React.FC = () => {
  const { setDiagnosticOpen } = useUi();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-slate-50 dark:bg-slate-950/20">
      {/* Background Subtle Mesh Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Double-Bezel Outer Shell */}
        <div className="p-2 md:p-3 rounded-[32px] bg-slate-200/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm">
          {/* Inner Content Core */}
          <div className="rounded-[calc(32px-8px)] bg-white dark:bg-slate-900 overflow-hidden shadow-inner p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            
            {/* Left Column: Copywriting & Action */}
            <div className="space-y-6 md:pr-4 flex flex-col justify-center items-start text-left">
              {/* Eyebrow Tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/15">
                <Sparkles className="w-3 h-3" /> Diagnostic Intelligent
              </span>

              {/* Headline */}
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
                Votre peau est <span className="bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">unique.</span>
              </h2>

              {/* Paragraph */}
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                Découvrez votre routine K-Beauty sur-mesure en 2 minutes grâce à notre Diagnostic de Peau IA de grade clinique.
              </p>

              {/* Premium Nested CTA Button with Button-in-Button architecture */}
              <button
                onClick={() => setDiagnosticOpen(true)}
                className="group relative inline-flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-indigo-650 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white shadow-lg shadow-slate-950/10 hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer border-0 outline-none"
              >
                <span className="text-xs font-black uppercase tracking-wider">
                  Démarrer le diagnostic
                </span>
                {/* Button-in-Button Trailing Icon */}
                <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white group-hover:text-indigo-600 dark:group-hover:bg-slate-950 dark:group-hover:text-white group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Right Column: Lab-Style Scanning Visual with Scanner animation */}
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-md group">
              {/* Texture Image */}
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800">
                <Image
                  src="/images/skin_diagnostic_scan.png"
                  alt="Diagnostic de Peau Clinique IA"
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Linear Scan Laser Effect Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 opacity-90 shadow-[0_0_15px_3px_rgba(99,102,241,0.8),0_0_4px_1px_rgba(99,102,241,0.5)] animate-scanner" />
              </div>

              {/* Lab Interface elements */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[7.5px] font-mono text-white bg-black/45 backdrop-blur-md px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Live Analysis
                    </span>
                  </div>
                  <span className="text-[7.5px] font-mono text-white bg-black/45 backdrop-blur-md px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Dermo-Scan v2.1
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[7.5px] font-mono text-white bg-black/45 backdrop-blur-md px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Spectroscopy: Active
                  </span>
                  <span className="text-[7.5px] font-mono text-white bg-black/45 backdrop-blur-md px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    89.4% Match
                  </span>
                </div>
              </div>

              {/* Lab Corner Crosshairs */}
              <div className="absolute inset-2 border border-white/5 pointer-events-none z-20">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/40" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/40" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/40" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/40" />
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Scanner Animation Style Tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanner-sweep {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
        .animate-scanner {
          animation: scanner-sweep 4s ease-in-out infinite;
        }
      `}} />
    </section>
  );
};
