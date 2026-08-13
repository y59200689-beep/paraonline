export default function AdminLoading() {
  return (
    <div className="admin-state-panel" role="status" aria-live="polite">
      <div className="admin-state-skeleton-header">
        <span className="admin-state-skeleton admin-state-skeleton-title" />
        <span className="admin-state-skeleton admin-state-skeleton-action" />
      </div>
      <div className="admin-state-skeleton-list">
        {Array.from({ length: 5 }).map((_, index) => <span key={index} className="admin-state-skeleton admin-state-skeleton-row" />)}
      </div>
      <span className="sr-only">Chargement de la section…</span>
    </div>
  );
}
