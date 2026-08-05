'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { reportClientError } from '@/lib/client-telemetry';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Next.js Page Error caught:', error);
    reportClientError(error, {
      messageFallback: 'Next.js App Router exception',
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-800 p-6 select-none font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5DCC5] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100/80 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Une erreur est survenue !
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
            Une exception s'est produite lors du chargement de cette page. Notre équipe technique a été avertie et travaille à sa résolution.
          </p>
        </div>

        {error.message && (
          <div className="w-full text-left p-3.5 bg-slate-50 border border-slate-100 rounded-xl max-h-24 overflow-y-auto shrink-0 select-text">
            <span className="text-[10px] font-mono font-semibold text-slate-500 block leading-tight">
              {error.message}
            </span>
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-[#B09B71] hover:bg-[#9B875D] text-white text-[11.5px] font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11.5px] font-black uppercase tracking-widest rounded-xl border border-slate-200/60 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
