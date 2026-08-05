'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { reportClientError } from '@/lib/client-telemetry';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Next.js Global Root Layout Error caught:', error);
    reportClientError(error, {
      messageFallback: 'Next.js Global Layout Root exception',
    });
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5DCC5] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100/80 animate-pulse">
            <AlertOctagon className="w-8 h-8 text-rose-500" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Erreur Système Critique
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Une exception fatale est survenue au niveau du layout racine de l'application. Nos services de surveillance ont enregistré l'incident.
            </p>
          </div>

          {error.message && (
            <div className="w-full text-left p-3.5 bg-slate-50 border border-slate-100 rounded-xl max-h-24 overflow-y-auto shrink-0 select-text">
              <span className="text-[10px] font-mono font-semibold text-slate-500 block leading-tight">
                {error.message}
              </span>
            </div>
          )}

          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-3.5 px-4 bg-[#B09B71] hover:bg-[#9B875D] text-white text-[11.5px] font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tenter de récupérer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
