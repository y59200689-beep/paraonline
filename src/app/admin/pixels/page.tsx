'use client';

import { useEffect, useState } from 'react';
import { PIXEL_PROVIDERS, type PixelConfig, type PixelProvider } from '@/lib/pixels';

export default function AdminPixelsPage() {
  const [pixels, setPixels] = useState<PixelConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/admin/pixels', { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPixels(result.pixels);
    }).catch(() => {
      if (!controller.signal.aborted) setError('Impossible de charger les pixels.');
    });
    return () => controller.abort();
  }, []);

  async function save(config: PixelConfig) {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/pixels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(Object.keys(PIXEL_PROVIDERS).map(key => [key, config[key as PixelProvider] ?? '']))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPixels(result.pixels);
      setMessage('Pixels enregistrés.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible d’enregistrer les pixels.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-surface-1 admin-text-primary max-w-3xl rounded-2xl p-6 sm:p-8">
      <h1 className="text-xl font-bold">Pixels de suivi</h1>
      <p className="admin-text-secondary mt-2 text-sm">
        Collez le code d’installation ou l’identifiant de chaque plateforme. Effacez un champ puis enregistrez pour désactiver ce pixel.
      </p>
      {pixels ? (
        <form className="mt-6 space-y-4" onSubmit={event => { event.preventDefault(); if (!saving) void save(pixels); }}>
          {(Object.entries(PIXEL_PROVIDERS) as [PixelProvider, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold" htmlFor={`pixel-${key}`}>{label}</label>
              <textarea id={`pixel-${key}`} rows={2} maxLength={30000} disabled={saving}
                className="admin-input mt-1 font-mono" value={pixels[key] ?? ''}
                onChange={event => setPixels({ ...pixels, [key]: event.target.value })} />
              {key === 'ads' && <p className="admin-text-secondary mt-1 text-xs">Pour les achats, incluez le libellé de conversion (AW-123456789/Libellé).</p>}
            </div>
          ))}
          <button type="submit" disabled={saving} className="admin-focus-ring rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Enregistrement…' : 'Enregistrer les pixels'}
          </button>
        </form>
      ) : !error && <p role="status" className="mt-4 text-sm">Chargement…</p>}
      {error && <p role="alert" className="mt-4 text-sm">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm">{message}</p>}
    </section>
  );
}
