'use client';

import { useState } from 'react';

type Preview = { productsToUpdate: number; imagesToAdd: number; unmatched: number; ambiguous: number;
  rejectedImages: number; truncated: boolean; entries: { sku: string; sources: string[] }[] };
type Run = { id: string; status: string; started_at: string; result: { updated?: number; imagesAdded?: number;
  error?: string; entries?: { sku: string; images: number; error?: string }[] } };

export default function WooCommerceImages() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [runs, setRuns] = useState<Run[]>([]);

  async function history() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/woocommerce-images');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setRuns(data.runs);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Historique indisponible.'); }
    finally { setBusy(false); }
  }

  async function run(action: 'preview' | 'import') {
    setBusy(true);
    setMessage('');
    setPreview(null);
    try {
      const response = await fetch('/api/admin/woocommerce-images', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (action === 'import') setPreview(null);
      if (!data.success) throw new Error(data.error || 'Import partiel. Consultez l’historique et relancez pour continuer.');
      if (action === 'preview') setPreview(data.preview);
      else setMessage(`${data.updated} produits mis à jour, ${data.imagesAdded} images ajoutées.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connexion interrompue. Consultez l’historique avant de relancer.');
    } finally { setBusy(false); }
  }

  return (
    <section className="mb-6 rounded-xl border border-gray-300 bg-white p-5 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <h2 className="text-lg font-bold">Images WooCommerce</h2>
      <p className="mt-2 text-sm">Source : paraofficinal.store · Correspondance par SKU. Seuls les produits sans aucune image sont importés. Tout produit ayant déjà une image principale ou une image de galerie est ignoré.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button disabled={busy} onClick={() => void run('preview')} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Chargement…' : 'Prévisualiser les images'}</button>
        <button disabled={busy} onClick={() => void history()} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Afficher l’historique</button>
      </div>
      {message && <p role="status" className="mt-3 text-sm">{message}</p>}
      {preview && <div className="mt-4">
        <p className="font-semibold">{preview.productsToUpdate} produits · {preview.imagesToAdd} images à ajouter</p>
        <p className="mt-1 text-sm">Sans correspondance : {preview.unmatched} · SKU ambigus ignorés : {preview.ambiguous} · Images externes ignorées : {preview.rejectedImages}</p>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left text-sm"><caption className="sr-only">Images à importer par SKU</caption><thead><tr><th className="p-2">SKU</th><th className="p-2">Images à ajouter</th></tr></thead>
            <tbody>{preview.entries.map(entry => <tr key={entry.sku}><td className="p-2">{entry.sku}</td><td className="p-2">{entry.sources.map(source => <a key={source} href={source} target="_blank" rel="noreferrer" className="mr-3 underline">Voir l’image</a>)}</td></tr>)}</tbody>
          </table>
        </div>
        {preview.truncated && <p className="text-sm">Les 200 premiers produits sont affichés. L’import traite tous les produits correspondants.</p>}
        <button disabled={busy || !preview.productsToUpdate} onClick={() => void run('import')} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900">Importer les nouvelles images</button>
      </div>}
      {runs.length > 0 && <div className="mt-4 space-y-2">{runs.map(item => <details key={item.id} className="rounded-lg border p-3 text-sm">
        <summary>{new Date(item.started_at).toLocaleString('fr-FR')} · {item.status} · {item.result.updated || 0} produits</summary>
        {item.result.error && <p>{item.result.error}</p>}
        <ul className="mt-2 max-h-60 overflow-auto">{item.result.entries?.map((entry, index) => <li key={index}>SKU {entry.sku} : {entry.error || `${entry.images} images ajoutées`}</li>)}</ul>
      </details>)}</div>}
    </section>
  );
}
