'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  X,
  Play,
  Terminal,
  CheckCircle2,
  XCircle,
  FileText,
  ToggleLeft,
  ToggleRight,
  Code
} from 'lucide-react';

interface Snippet {
  id: string;
  name: string;
  code: string;
  location: string;
  active: boolean;
  trigger_type: 'client' | 'cron';
  cron_expression: string | null;
  last_run: string | null;
  last_run_status: 'success' | 'error' | null;
  last_run_logs: string | null;
  created_at: string;
  updated_at: string;
}

export default function CronTab() {
  const { adminTheme, currentUser } = useAdmin();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCronExpression, setFormCronExpression] = useState('*/5 * * * *');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Manual execution states
  const [runningId, setRunningId] = useState<string | null>(null);
  
  // Log viewer modal
  const [viewingLogsSnippet, setViewingLogsSnippet] = useState<Snippet | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/snippets');
      const data = await res.json();
      if (data.success) {
        // Filter cron snippets
        const cronItems = (data.snippets || []).filter(
          (s: any) => s.trigger_type === 'cron'
        );
        setSnippets(cronItems);
      } else {
        setError(data.error || 'Erreur lors du chargement des tâches.');
      }
    } catch (err: any) {
      setError('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSnippet(null);
    setFormName('');
    setFormCode('// Code Javascript exécuté sur le serveur\nconsole.log("Exécution de la tâche planifiée...");\n\n// Vous pouvez utiliser "supabase" pour interagir avec la base de données\n// const { data: products } = await supabase.from("products").select("id");\n// console.log("Total produits: " + products.length);\n');
    setFormCronExpression('*/5 * * * *');
    setFormActive(true);
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setFormName(snippet.name);
    setFormCode(snippet.code);
    setFormCronExpression(snippet.cron_expression || '*/5 * * * *');
    setFormActive(snippet.active);
    setFormError(null);
    setShowModal(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/snippets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSnippets(prev => 
          prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s)
        );
      } else {
        alert(data.error || 'Impossible de mettre à jour le statut.');
      }
    } catch (err) {
      alert('Erreur réseau.');
    }
  };

  const handleManualRun = async (id: string) => {
    setRunningId(id);
    try {
      const res = await fetch(`/api/admin/snippets/${id}/run`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        // Refresh snippets list to update last run status/logs
        const updateRes = await fetch('/api/admin/snippets');
        const updateData = await updateRes.json();
        if (updateData.success) {
          const cronItems = (updateData.snippets || []).filter((s: any) => s.trigger_type === 'cron');
          setSnippets(cronItems);
          
          // Open logs viewer automatically to see execution outputs
          const justExecuted = cronItems.find((s: any) => s.id === id);
          if (justExecuted) {
            setViewingLogsSnippet(justExecuted);
          }
        }
      } else {
        alert(data.error || 'Échec de l\'exécution.');
      }
    } catch (err) {
      alert('Erreur réseau lors de l\'exécution.');
    } finally {
      setRunningId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Le nom de la tâche est obligatoire.');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Le code est obligatoire.');
      return;
    }

    setSaving(true);
    try {
      const url = editingSnippet 
        ? `/api/admin/snippets/${editingSnippet.id}`
        : '/api/admin/snippets';
      
      const method = editingSnippet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          code: formCode,
          location: 'head', // Default location placeholder
          active: formActive,
          trigger_type: 'cron',
          cron_expression: formCronExpression
        })
      });

      const data = await res.json();
      if (data.success) {
        if (editingSnippet) {
          setSnippets(prev => 
            prev.map(s => s.id === editingSnippet.id ? data.snippet : s)
          );
        } else {
          setSnippets(prev => [data.snippet, ...prev]);
        }
        setShowModal(false);
      } else {
        setFormError(data.error || 'Erreur lors de la sauvegarde.');
      }
    } catch (err) {
      setFormError('Erreur de connexion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/snippets/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSnippets(prev => prev.filter(s => s.id !== id));
        setDeletingId(null);
      } else {
        alert(data.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      alert('Erreur réseau.');
    }
  };

  const getCronIntervalLabel = (expr: string | null) => {
    switch (expr) {
      case '*/5 * * * *': return 'Toutes les 5 minutes';
      case '*/10 * * * *': return 'Toutes les 10 minutes';
      case '*/30 * * * *': return 'Toutes les 30 minutes';
      case '0 * * * *': return 'Toutes les heures';
      case '0 0 * * *': return 'Tous les jours';
      default: return expr || 'Non spécifié';
    }
  };

  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* Description Header */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
        adminTheme === 'light' 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-slate-200 shadow-sm text-slate-800' 
          : 'bg-gradient-to-r from-slate-900/60 to-emerald-950/20 border-slate-900 text-slate-300'
      }`}>
        <div className="space-y-1.5 max-w-3xl">
          <h4 className="font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
            <Clock className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            Tâches Planifiées (Server-side Crons)
          </h4>
          <p className="text-[11.5px] font-medium leading-relaxed opacity-90">
            Gérez les scripts d&apos;automatisation server-side. Ces scripts s&apos;exécutent en arrière-plan à intervalles réguliers pour effectuer de la maintenance (nettoyage de logs, alertes de stock, rapports de ventes) et capturent les logs d&apos;exécution pour analyse.
          </p>
        </div>
        
        {isOwner && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Tâche Cron
          </button>
        )}
      </div>

      {!isOwner && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-950 text-amber-300'
        }`}>
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Lecture seule : Seuls les administrateurs avec le rôle <strong>Propriétaire</strong> (owner) peuvent configurer ou lancer des tâches planifiées.
          </p>
        </div>
      )}

      {/* Cron List Grid/Table */}
      <div className={`border rounded-3xl overflow-hidden transition-colors duration-300 ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Chargement des tâches planifiées...</span>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <span className="text-sm font-semibold text-rose-500">{error}</span>
            <button 
              onClick={fetchSnippets} 
              className="mt-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 underline cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : snippets.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm">Aucune tâche planifiée</h5>
              <p className="text-xs text-slate-500 max-w-xs">
                Ajoutez un script automatique pour s&apos;exécuter périodiquement sur le serveur.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Créer une tâche cron
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200 text-slate-400' : 'bg-slate-900/60 border-slate-900 text-slate-500'
                }`}>
                  <th className="py-3.5 px-5">Tâche</th>
                  <th className="py-3.5 px-5">Intervalle</th>
                  <th className="py-3.5 px-5">Dernière Exécution</th>
                  <th className="py-3.5 px-5">Statut</th>
                  <th className="py-3.5 px-5">Activation</th>
                  {isOwner && <th className="py-3.5 px-5 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-900">
                {snippets.map(snippet => (
                  <tr 
                    key={snippet.id} 
                    className={`text-xs transition-colors duration-150 ${
                      adminTheme === 'light' ? 'hover:bg-slate-50/30' : 'hover:bg-white/[0.01]'
                    }`}
                  >
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          snippet.active 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[13px] block leading-tight">{snippet.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{snippet.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Interval */}
                    <td className="py-4 px-5 font-semibold text-slate-500 dark:text-slate-400">
                      {getCronIntervalLabel(snippet.cron_expression)}
                    </td>

                    {/* Last Run Date */}
                    <td className="py-4 px-5 font-mono text-[10.5px] text-slate-400">
                      {snippet.last_run ? (
                        new Date(snippet.last_run).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      ) : (
                        <span className="italic text-slate-500">Jamais exécuté</span>
                      )}
                    </td>

                    {/* Last Run Status */}
                    <td className="py-4 px-5">
                      {snippet.last_run_status ? (
                        <button
                          onClick={() => setViewingLogsSnippet(snippet)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition hover:scale-105 cursor-pointer ${
                            snippet.last_run_status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {snippet.last_run_status === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          )}
                          {snippet.last_run_status === 'success' ? 'Succès' : 'Erreur'}
                          <FileText className="w-3 h-3 ml-0.5 opacity-60" />
                        </button>
                      ) : (
                        <span className="text-slate-500 font-medium">-</span>
                      )}
                    </td>

                    {/* Active Switch */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() => isOwner && handleToggleActive(snippet.id, snippet.active)}
                        disabled={!isOwner}
                        className={`flex items-center gap-2 cursor-pointer transition disabled:cursor-not-allowed ${
                          snippet.active 
                            ? 'text-emerald-500 hover:text-emerald-600' 
                            : 'text-slate-400 hover:text-slate-500'
                        }`}
                        title={isOwner ? (snippet.active ? "Désactiver la tâche" : "Activer la tâche") : undefined}
                      >
                        {snippet.active ? (
                          <ToggleRight className="w-8 h-8 stroke-[1.5]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 stroke-[1.5] text-slate-500" />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    {isOwner && (
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          {/* Execute Trigger Button */}
                          <button
                            onClick={() => handleManualRun(snippet.id)}
                            disabled={runningId !== null}
                            title="Lancer l'exécution maintenant"
                            className={`p-1.5 rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              adminTheme === 'light'
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-700'
                                : 'bg-emerald-950/20 border-emerald-950/50 text-emerald-400 hover:bg-emerald-950/40'
                            }`}
                          >
                            {runningId === snippet.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                          
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(snippet)}
                            title="Modifier"
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              adminTheme === 'light'
                                ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingId(snippet.id)}
                            title="Supprimer"
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              adminTheme === 'light'
                                ? 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100'
                                : 'bg-slate-900 border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Viewer Modal */}
      {viewingLogsSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-2xl rounded-[32px] border p-1 shadow-2xl animate-in zoom-in-95 duration-200 ${
            adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className={`rounded-[calc(32px-4px)] p-6 md:p-8 space-y-5 ${
              adminTheme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
            }`}>
              <div className="flex justify-between items-center border-b pb-3 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${
                    viewingLogsSnippet.last_run_status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wider">
                      Logs d&apos;exécution : {viewingLogsSnippet.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">
                      ID: {viewingLogsSnippet.id} • Exécuté le {viewingLogsSnippet.last_run ? new Date(viewingLogsSnippet.last_run).toLocaleString('fr-FR') : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingLogsSnippet(null)}
                  className={`p-1.5 rounded-full border transition cursor-pointer ${
                    adminTheme === 'light' ? 'hover:bg-slate-50 border-slate-200 text-slate-400' : 'hover:bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Monospace Code Editor styled Logs Block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Console Output</span>
                <pre className={`p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text border ${
                  adminTheme === 'light'
                    ? 'bg-slate-950 text-slate-100 border-slate-900'
                    : 'bg-black text-slate-200 border-slate-900'
                }`}>
                  {viewingLogsSnippet.last_run_logs || '// Aucun log capturé.'}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingLogsSnippet(null)}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-[24px] border p-6 shadow-2xl animate-in scale-in duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-extrabold text-[15px] uppercase tracking-wider">Supprimer la tâche ?</h4>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-400 font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement cette tâche planifiée ? Elle cessera immédiatement de s&apos;exécuter sur le serveur.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                  adminTheme === 'light' 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-600' 
                    : 'border-slate-800 hover:bg-slate-900 text-slate-400'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/10 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-[32px] border p-1 shadow-2xl animate-in zoom-in-95 duration-200 my-8 ${
            adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <form 
              onSubmit={handleSubmit} 
              className={`rounded-[calc(32px-4px)] p-6 md:p-8 space-y-6 ${
                adminTheme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-4 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold uppercase tracking-wider">
                      {editingSnippet ? 'Modifier la Tâche Cron' : 'Créer une Tâche Cron'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Configurez un script d&apos;automatisation server-side
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`p-1.5 rounded-full border transition cursor-pointer ${
                    adminTheme === 'light' ? 'hover:bg-slate-50 border-slate-200 text-slate-400' : 'hover:bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-950/40 dark:text-rose-300`}>
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <p className="text-xs font-semibold leading-relaxed">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Script Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Nom de la Tâche Planifiée
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Archivage Automatique, Nettoyage BDD, Rapport quotidien..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition focus:border-emerald-500/50 ${
                      adminTheme === 'light' 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-200 focus:bg-slate-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cron Expression Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Planification (Intervalle)
                    </label>
                    <select
                      value={formCronExpression}
                      onChange={(e) => setFormCronExpression(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition focus:border-emerald-500/50 cursor-pointer ${
                        adminTheme === 'light' 
                          ? 'bg-slate-50 border-slate-200 text-slate-800' 
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <option value="*/5 * * * *">Toutes les 5 minutes (*/5 * * * *)</option>
                      <option value="*/10 * * * *">Toutes les 10 minutes (*/10 * * * *)</option>
                      <option value="*/30 * * * *">Toutes les 30 minutes (*/30 * * * *)</option>
                      <option value="0 * * * *">Toutes les heures (0 * * * *)</option>
                      <option value="0 0 * * *">Tous les jours à minuit (0 0 * * *)</option>
                    </select>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Statut Initial
                    </label>
                    <div className={`border rounded-xl px-4 py-2 flex items-center justify-between h-[42px] ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <span className="text-xs font-semibold">Tâche active</span>
                      <button
                        type="button"
                        onClick={() => setFormActive(!formActive)}
                        className={`flex items-center cursor-pointer transition ${
                          formActive ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                      >
                        {formActive ? (
                          <ToggleRight className="w-8 h-8 stroke-[1.5]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 stroke-[1.5] text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Monospace Code Textarea Editor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Script Node / JS (Server-side)
                    </label>
                    <span className="text-[10px] text-slate-550 font-medium flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-emerald-500" />
                      Utilise l&apos;environnement async JS, avec logs capturés
                    </span>
                  </div>
                  
                  <textarea
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    placeholder="// Écrivez votre code Node.js ici...&#10;console.log('Traitement...');&#10;const { data } = await supabase.from('products').select('*');"
                    rows={12}
                    className={`w-full font-mono text-[11px] leading-relaxed p-4 border rounded-xl outline-none focus:border-emerald-500/50 resize-y whitespace-pre tab-size-2 ${
                      adminTheme === 'light' 
                        ? 'bg-slate-950 text-slate-100 focus:bg-black selection:bg-emerald-500/30' 
                        : 'bg-slate-950 text-slate-205 focus:bg-black selection:bg-emerald-500/30'
                    }`}
                    style={{ tabSize: 2 }}
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t pt-4 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                    adminTheme === 'light' 
                      ? 'border-slate-200 hover:bg-slate-50 text-slate-600' 
                      : 'border-slate-800 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-xl transition duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Enregistrer la Tâche'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
