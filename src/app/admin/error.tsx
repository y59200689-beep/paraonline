'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Admin route error', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[60vh] grid place-items-center p-6" role="alert">
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Cette section n’a pas pu s’ouvrir</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Aucune modification n’a été appliquée. Réessayez ou revenez à cette section dans quelques instants.
        </p>
        <button type="button" onClick={reset} className="admin-btn admin-btn-primary mt-6 min-h-11">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
      </div>
    </div>
  );
}
