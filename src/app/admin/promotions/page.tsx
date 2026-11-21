'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManagePromotions } from '@/lib/permissions';
import { formatPriceDH } from '@/lib/format-price';
import { isPromotionPercent, promotionalPrice } from '@/lib/storewide-promotion';

export default function AdminPromotionsPage() {
  const { currentUser } = useAdmin();
  const canManage = Boolean(currentUser && canManagePromotions(currentUser.role));
  const [currentPercent, setCurrentPercent] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!canManage) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/admin/promotions', { signal: controller.signal, cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCurrentPercent(data.percent);
        setDraft(data.percent ? String(data.percent) : '');
      } catch {
        if (!controller.signal.aborted) setError('Impossible de charger la promotion. Rechargez la page pour réessayer.');
      }
    }
    void load();
    return () => controller.abort();
  }, [canManage]);

  async function save(percent: number) {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCurrentPercent(data.percent);
      setDraft(data.percent ? String(data.percent) : '');
      setMessage(percent ? 'Promotion enregistrée.' : 'Promotion arrêtée.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible d’enregistrer la promotion.');
    } finally {
      setSaving(false);
    }
  }

  const percent = Number(draft);
  const validDraft = isPromotionPercent(percent) && percent > 0;
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validDraft && currentPercent !== null && !saving) void save(percent);
  }

  if (!canManage) return <p>Accès réservé aux responsables de la boutique.</p>;

  return (
    <section className="admin-surface-1 admin-text-primary max-w-2xl rounded-2xl p-6 sm:p-8">
      <h1 className="text-xl font-bold">Remise sur toute la boutique</h1>
      <p className="mt-2 admin-text-secondary text-sm">
        La remise s’applique automatiquement au prix actuel de chaque produit, même s’il est déjà en promotion.
      </p>
      {currentPercent !== null && (
        <p className="mt-5 text-sm font-semibold">
          {currentPercent ? `Promotion active · −${currentPercent} %` : 'Aucune promotion boutique active'}
        </p>
      )}
      {currentPercent === null && !error && <p className="mt-5 text-sm" role="status">Chargement…</p>}
      {currentPercent !== null && (
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="promotion-percent" className="block text-sm font-semibold">Remise supplémentaire (%)</label>
            <input
              id="promotion-percent"
              type="number"
              min={1}
              max={99}
              step={1}
              required
              value={draft}
              placeholder="15"
              disabled={saving}
              onChange={event => { setDraft(event.target.value); setMessage(''); }}
              className="admin-input mt-2 max-w-32"
            />
          </div>
          {validDraft && (
            <p className="admin-text-secondary text-sm">
              Un produit à {formatPriceDH(200)} passe à <strong>{formatPriceDH(promotionalPrice(200, percent))}</strong>.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !validDraft || percent === currentPercent}
              className="admin-focus-ring rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {currentPercent ? 'Enregistrer la remise' : 'Activer la promotion'}
            </button>
            {currentPercent > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void save(0)}
                className="admin-surface-1 admin-focus-ring rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Arrêter la promotion
              </button>
            )}
          </div>
        </form>
      )}
      {error && <p className="mt-4 text-sm text-red-600 [.admin-dark_&]:text-red-300" role="alert">{error}</p>}
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </section>
  );
}
