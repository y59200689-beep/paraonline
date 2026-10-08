'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  buildCatalogPageHref,
  type CatalogRouteState,
} from '@/lib/catalog-pagination';

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function CatalogPagination({
  pagination,
  routeState,
  language,
}: {
  pagination: Pagination;
  routeState: CatalogRouteState;
  language: string;
}) {
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const currentPage = Math.min(pagination.page, totalPages);
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);
  const isFrench = language === 'FR';
  const buttonClass = 'h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 transition hover:border-primary/30 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300';
  const pageClass = 'h-9 min-w-9 rounded-xl border px-3 text-xs font-black transition';

  return (
    <nav
      aria-label={isFrench ? 'Pagination du catalogue' : 'ترقيم صفحات المنتجات'}
      className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-900 dark:bg-slate-950 sm:p-4"
      data-testid="catalog-pagination"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {isFrench
            ? `Page ${currentPage} / ${totalPages} - ${pagination.limit} produits par page`
            : `الصفحة ${currentPage} / ${totalPages}`}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {currentPage > 1 ? (
            <Link
              href={buildCatalogPageHref(currentPage - 1, routeState)}
              prefetch={false}
              aria-label={isFrench ? 'Page précédente' : 'الصفحة السابقة'}
              className={buttonClass}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-disabled="true" className={`${buttonClass} cursor-not-allowed opacity-40`}>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {visiblePages.map(page => page === currentPage ? (
            <span
              key={page}
              aria-current="page"
              className={`${pageClass} border-primary bg-primary text-white shadow-md shadow-primary/15`}
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={buildCatalogPageHref(page, routeState)}
              prefetch={false}
              aria-label={isFrench ? `Page ${page}` : `الصفحة ${page}`}
              className={`${pageClass} border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages ? (
            <Link
              href={buildCatalogPageHref(currentPage + 1, routeState)}
              prefetch={false}
              aria-label={isFrench ? 'Page suivante' : 'الصفحة التالية'}
              className={buttonClass}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-disabled="true" className={`${buttonClass} cursor-not-allowed opacity-40`}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
