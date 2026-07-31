export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-12 pt-20 sm:px-10 md:px-16 lg:px-20 xl:px-24 lg:py-12" aria-busy="true" aria-label="Chargement du catalogue">
      <div className="mb-12 min-h-[200px] animate-pulse rounded-[2rem] border border-slate-200/60 bg-slate-100" />
      <div className="flex gap-10">
        <aside className="hidden w-[300px] shrink-0 space-y-4 lg:block">
          <div className="h-9 w-40 animate-pulse rounded bg-slate-100" />
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-8 animate-pulse rounded bg-slate-100" />)}
        </aside>
        <section className="min-w-0 flex-1">
          <div className="mb-8 h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4">
                <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
                <div className="mt-4 h-4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
