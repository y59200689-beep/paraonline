'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { reportClientError } from '@/lib/client-telemetry';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
    reportClientError(error, {
      messageFallback: 'React component tree exception',
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 select-none font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5DCC5] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100/80 animate-pulse">
              <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Oups! Quelque chose a mal tourné.
              </h1>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                Une exception inattendue est survenue dans l'interface de l'application. L'équipe technique a été notifiée automatiquement.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="w-full text-left p-3.5 bg-slate-50 border border-slate-100 rounded-xl max-h-24 overflow-y-auto shrink-0 select-text">
                <span className="text-[10px] font-mono font-semibold text-slate-500 block leading-tight">
                  {this.state.error.message}
                </span>
              </div>
            )}

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-[#B09B71] hover:bg-[#9B875D] text-white text-[11.5px] font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Actualiser
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

    return this.props.children;
  }
}
export default ErrorBoundary;
