'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowDownToLine, Check, CheckCircle2, ChevronDown, Clock3, ExternalLink, Eye, FileText, Images, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import styles from './WooCommerceImages.module.css';

type Preview = { productsToUpdate: number; imagesToAdd: number; unmatched: number; ambiguous: number;
  rejectedImages: number; truncated: boolean; entries: { sku: string; sources: string[] }[] };
type Run = { id: string; status: string; started_at: string; completed_at?: string | null;
  result: { updated?: number; imagesAdded?: number; unchanged?: number; unmatched?: number;
    ambiguous?: number; rejectedImages?: number; error?: string; entries?: { sku: string; images: number; error?: string }[] } };

const number = (value: number | undefined) => (value || 0).toLocaleString('fr-FR');
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Casablanca', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const date = (value: string) => Number.isFinite(Date.parse(value)) ? dateFormatter.format(new Date(value)) : 'Date indisponible';

function duration(run: Run, now: number) {
  if (!run.completed_at && run.status !== 'running') return 'Non enregistrée';
  const seconds = Math.max(0, Math.round(((run.completed_at ? Date.parse(run.completed_at) : now) - Date.parse(run.started_at)) / 1000));
  if (!Number.isFinite(seconds)) return 'Indisponible';
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}
function state(run: Run, now: number) {
  if (run.status === 'success') return { label: 'Réussie', tone: 'success', Icon: CheckCircle2 };
  if (run.status === 'partial') return { label: 'Partielle', tone: 'warning', Icon: AlertCircle };
  if (run.status === 'running' && now - Date.parse(run.started_at) < 15 * 60_000) return { label: 'En cours', tone: 'running', Icon: Loader2 };
  if (run.status === 'failed') return { label: 'Échouée', tone: 'error', Icon: AlertCircle };
  return { label: 'À vérifier', tone: 'warning', Icon: AlertCircle };
}

function RunLogs({ run, now }: { run: Run; now: number }) {
  const status = state(run, now);
  const result = run.result || {};
  return <div className={styles.logs} aria-label={`Journaux du ${date(run.started_at)}`}>
    <div className={styles.logHeading}><FileText size={15} aria-hidden="true" /><strong>Journal d’exécution</strong><span>Heure de Casablanca</span></div>
    <p className={styles.logMessage}>{status.tone === 'running' ? 'Synchronisation en cours. Les résultats apparaîtront automatiquement.'
      : result.error || (run.status === 'success' ? (result.updated ? 'Import terminé. Les images ont été enregistrées.' : 'Catalogue à jour. Aucun produit sans image à compléter.')
        : run.status === 'partial' ? 'Certains produits n’ont pas pu être importés. Consultez les détails ci-dessous.' : 'Aucun résultat final enregistré. Consultez cette exécution avant de relancer un import.')}</p>
    {status.tone !== 'running' && <div className={styles.logFacts}>
      <span><b>{number(result.unchanged)}</b> produits inchangés</span><span><b>{number(result.unmatched)}</b> sans correspondance</span>
      <span><b>{number(result.ambiguous)}</b> SKU ambigus</span><span><b>{number(result.rejectedImages)}</b> images ignorées</span>
    </div>}
    {!!result.entries?.length && <ul className={styles.logEntries}>{result.entries.map((entry, index) => <li key={`${entry.sku}-${index}`} data-error={Boolean(entry.error)}>
      {entry.error ? <AlertCircle size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}<code>SKU {entry.sku}</code>
      <span>{entry.error || `${number(entry.images)} image${entry.images > 1 ? 's' : ''} ajoutée${entry.images > 1 ? 's' : ''}`}</span>
    </li>)}</ul>}
  </div>;
}

export default function WooCommerceImages() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [action, setAction] = useState<'preview' | 'import' | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [expanded, setExpanded] = useState<string | null | undefined>(undefined);
  const [showAll, setShowAll] = useState(false);
  const [now, setNow] = useState(0);
  const requestRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/woocommerce-images', { cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.runs)) throw new Error(data.error || 'Historique indisponible. Réessayez.');
      if (controller.signal.aborted) return;
      setRuns(data.runs); setNow(Date.now()); setHistoryError('');
    } catch (error) {
      if (!controller.signal.aborted) setHistoryError(error instanceof Error ? error.message : 'Historique indisponible. Réessayez.');
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    void loadHistory();
    const refresh = () => { if (document.visibilityState !== 'hidden') void loadHistory(); };
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); requestRef.current?.abort(); };
  }, [loadHistory]);

  async function run(nextAction: 'preview' | 'import') {
    setAction(nextAction); setMessage(null); setPreview(null);
    try {
      const response = await fetch('/api/admin/woocommerce-images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: nextAction }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Import partiel. Consultez les journaux avant de relancer.');
      if (nextAction === 'preview') setPreview(data.preview);
      else setMessage({ text: `${number(data.updated)} produits mis à jour, ${number(data.imagesAdded)} images ajoutées.`, error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Connexion interrompue. Consultez l’historique avant de relancer.', error: true });
    } finally { setAction(null); if (nextAction === 'import') { setExpanded(undefined); void loadHistory(); } }
  }

  const latest = runs[0];
  const latestState = latest ? state(latest, now) : null;
  const visibleRuns = showAll ? runs : runs.slice(0, 3);
  const expandedId = expanded === undefined ? latest?.id : expanded;

  return <section className={styles.card} aria-labelledby="woocommerce-images-title">
    <header className={styles.header}>
      <div className={styles.identity}><div className={styles.sourceIcon}><Images size={22} strokeWidth={1.7} aria-hidden="true" /></div>
        <div><span className={styles.eyebrow}>Synchronisation du catalogue</span><h2 id="woocommerce-images-title">Images WooCommerce</h2><p>paraofficinal.store <span aria-hidden="true">→</span> Para Divine</p></div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.iconButton}`} onClick={() => void loadHistory()} disabled={loading} aria-label="Actualiser l’historique" title="Actualiser l’historique"><RefreshCw size={16} className={loading ? styles.spin : ''} aria-hidden="true" /></button>
        <button type="button" className={`${styles.button} ${styles.primary}`} disabled={Boolean(action)} onClick={() => void run('preview')}>
          {action ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{action === 'preview' ? 'Prévisualisation…' : action === 'import' ? 'Import en cours…' : 'Prévisualiser les images'}
        </button>
      </div>
    </header>
    <div className={styles.policy}><ShieldCheck size={15} aria-hidden="true" /><p>Uniquement les produits sans image. Les images déjà présentes sont préservées.</p><span><Clock3 size={14} aria-hidden="true" />Cadence : 15 min</span></div>
    {historyError && <div role="alert" className={styles.notice} data-error="true"><AlertCircle size={16} aria-hidden="true" /><span>{historyError}</span><button type="button" onClick={() => void loadHistory()}>Réessayer</button></div>}
    {message && <div role={message.error ? 'alert' : 'status'} className={styles.notice} data-error={message.error}>
      {message.error ? <AlertCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}<span>{message.text}</span><button type="button" onClick={() => setMessage(null)} aria-label="Fermer le message"><X size={15} /></button>
    </div>}
    {loading && !latest && !historyError ? <div className={styles.skeleton} role="status" aria-label="Chargement de l’historique"><span /><span /><span /></div>
      : latest && latestState ? <div className={styles.overview}>
        <div className={styles.latest}><span className={styles.label}>Dernière exécution</span><time dateTime={latest.started_at}>{date(latest.started_at)}</time>
          <span className={styles.badge} data-tone={latestState.tone}><latestState.Icon size={13} aria-hidden="true" className={latestState.tone === 'running' ? styles.spin : ''} />{latestState.label}</span>
        </div>
        <dl className={styles.metrics}>
          <div><dt>Produits complétés</dt><dd>{number(latest.result?.updated)}</dd></div><div><dt>Images ajoutées</dt><dd>{number(latest.result?.imagesAdded)}</dd></div>
          <div><dt>Produits inchangés</dt><dd>{number(latest.result?.unchanged)}</dd></div><div><dt>Durée</dt><dd className={styles.duration}>{duration(latest, now)}</dd></div>
        </dl>
      </div> : !historyError && <div className={styles.empty}><Clock3 size={22} aria-hidden="true" /><div><strong>Aucune exécution pour le moment</strong><p>Les synchronisations automatiques et les imports manuels apparaîtront ici.</p></div></div>}
    {preview && <div className={styles.preview}>
      <div className={styles.previewHeading}><div><span className={styles.eyebrow}>Vérification avant import</span><h3>Aperçu des images</h3></div><button type="button" className={`${styles.button} ${styles.iconButton}`} onClick={() => setPreview(null)} aria-label="Fermer l’aperçu"><X size={16} /></button></div>
      <p><strong>{number(preview.productsToUpdate)} produits sans image</strong> · {number(preview.imagesToAdd)} images disponibles</p>
      {preview.entries.length > 0 ? <ul className={styles.previewList}>{preview.entries.map(entry => <li key={entry.sku}><code>SKU {entry.sku}</code><div>{entry.sources.map((source, index) => <a key={source} href={source} target="_blank" rel="noreferrer">Image {index + 1}<ExternalLink size={12} aria-hidden="true" /></a>)}</div></li>)}</ul>
        : <p className={styles.muted}>Aucune image à importer. Tous les produits correspondants sont déjà à jour.</p>}
      <p className={styles.previewMeta}>Sans correspondance : {number(preview.unmatched)} · SKU ambigus : {number(preview.ambiguous)} · Images ignorées : {number(preview.rejectedImages)}</p>
      {preview.truncated && <p className={styles.previewMeta}>Aperçu limité aux 200 premiers produits. L’import traite tous les produits éligibles.</p>}
      <button type="button" className={`${styles.button} ${styles.primary}`} disabled={Boolean(action) || !preview.productsToUpdate} onClick={() => void run('import')}><ArrowDownToLine size={15} aria-hidden="true" />Importer les nouvelles images</button>
    </div>}
    {runs.length > 0 && <div className={styles.history}>
      <div className={styles.historyHeading}><h3>Historique des exécutions <span>{runs.length}</span></h3><span>Heure de Casablanca</span></div>
      <div className={styles.tableScroll}><table className={styles.table}>
        <caption className={styles.srOnly}>Dernières synchronisations des images WooCommerce</caption>
        <thead><tr><th scope="col">Démarrage</th><th scope="col">Résultat</th><th scope="col">Produits</th><th scope="col">Images</th><th scope="col">Durée</th><th scope="col"><span className={styles.srOnly}>Journaux</span></th></tr></thead>
        <tbody>{visibleRuns.map(item => { const status = state(item, now); const open = expandedId === item.id;
          return <Fragment key={item.id}><tr data-expanded={open}>
            <td><time dateTime={item.started_at}>{date(item.started_at)}</time>{item.id === latest?.id && <span className={styles.latestMarker}>Dernière</span>}</td>
            <td><span className={styles.badge} data-tone={status.tone}><status.Icon size={12} aria-hidden="true" className={status.tone === 'running' ? styles.spin : ''} />{status.label}</span></td>
            <td className={styles.numeric}>{number(item.result?.updated)}</td><td className={styles.numeric}>{number(item.result?.imagesAdded)}</td><td className={styles.tableDuration}>{duration(item, now)}</td>
            <td><button type="button" className={styles.logButton} aria-expanded={open} aria-controls={`woo-log-${item.id}`} aria-label={`${open ? 'Masquer' : 'Voir'} les journaux du ${date(item.started_at)}`} onClick={() => setExpanded(open ? null : item.id)}>Journaux<ChevronDown size={14} aria-hidden="true" /></button></td>
          </tr>{open && <tr><td colSpan={6} className={styles.logCell}><div id={`woo-log-${item.id}`}><RunLogs run={item} now={now} /></div></td></tr>}</Fragment>;
        })}</tbody>
      </table></div>
      {runs.length > 3 && <button type="button" className={styles.moreButton} onClick={() => setShowAll(!showAll)}>{showAll ? 'Réduire l’historique' : `Voir les ${runs.length} dernières exécutions`}<ChevronDown size={14} className={showAll ? styles.rotated : ''} aria-hidden="true" /></button>}
    </div>}
    <footer className={styles.footer}><span><span className={styles.liveDot} aria-hidden="true" />Historique actualisé toutes les 30 s</span><span>Correspondance par SKU · Images uniquement</span></footer>
  </section>;
}
