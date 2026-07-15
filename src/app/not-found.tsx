import React from 'react';
import { SearchX, Home, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Introuvable — 404',
  description: 'La page que vous recherchez est introuvable. Revenez à la boutique Para Officinal S.A.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-800 px-6 py-16 select-none font-sans">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Card */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-[#E5DCC5]/60 p-8 md:p-10 shadow-[0_24px_80px_rgba(27,20,16,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] text-center flex flex-col items-center gap-6">

        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/15 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
            <SearchX className="w-9 h-9 text-primary" strokeWidth={1.5} />
          </div>
          <span className="absolute -top-2 -right-2 text-2xl font-black text-slate-200/60 select-none font-mono">404</span>
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
            Page introuvable
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            La page que vous cherchez a peut-être été déplacée, supprimée, ou n&rsquo;existe pas. Notre boutique vous attend avec tous vos produits préférés.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <a
            href="/"
            className="group w-full py-3.5 px-5 bg-primary hover:bg-accent text-white text-[11.5px] font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(236,72,153,0.25)] hover:shadow-[0_8px_28px_rgba(236,72,153,0.35)]"
          >
            <Home className="w-3.5 h-3.5" />
            Retour à la boutique
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            href="/products"
            className="w-full py-3 px-5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11.5px] font-black uppercase tracking-widest rounded-xl border border-slate-200/60 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            Explorer nos produits
          </a>
        </div>

        {/* Brand footer */}
        <p className="text-[10px] text-slate-300 font-semibold tracking-widest uppercase mt-2">
          Para Officinal S.A · Maroc
        </p>
      </div>
    </div>
  );
}
