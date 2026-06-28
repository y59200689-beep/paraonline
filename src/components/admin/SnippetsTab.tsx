'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Code, 
  AlertCircle, 
  Loader2, 
  Check, 
  X,
  HelpCircle,
  Eye,
  FileCode2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Snippet {
  id: string;
  name: string;
  code: string;
  location: 'head' | 'body_start' | 'body_end';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  adminTheme: 'light' | 'dark';
}

function CodeEditor({ value, onChange, adminTheme }: CodeEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlightCode = (rawCode: string) => {
    if (!rawCode) return '&nbsp;';
    
    let html = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const placeholders: string[] = [];
    const pushPlaceholder = (val: string, cls: string) => {
      const id = `___PLACEHOLDER_${placeholders.length}___`;
      placeholders.push(`<span class="${cls}">${val}</span>`);
      return id;
    };

    html = html.replace(/&lt;\!\-\-[\s\S]*?\-\-&gt;/g, (m) => pushPlaceholder(m, 'text-slate-500 font-normal italic'));
    html = html.replace(/\/\*[\s\S]*?\*\//g, (m) => pushPlaceholder(m, 'text-slate-500 font-normal italic'));
    html = html.replace(/\/\/.*$/gm, (m) => pushPlaceholder(m, 'text-slate-500 font-normal italic'));

    html = html.replace(/"(?:\\.|[^"\\])*"/g, (m) => pushPlaceholder(m, 'text-emerald-400 font-medium'));
    html = html.replace(/'(?:\\.|[^'\\])*'/g, (m) => pushPlaceholder(m, 'text-emerald-400 font-medium'));
    html = html.replace(/`(?:\\.|[^`\\])*`/g, (m) => pushPlaceholder(m, 'text-emerald-400 font-medium'));

    html = html.replace(/(&lt;\/?[a-zA-Z0-9:-]+)(\s.*?&gt;|\s*&gt;)/g, (match, p1, p2) => {
      const tagColor = 'text-blue-400 font-semibold';
      const attrColor = 'text-pink-400';
      const bracketColor = 'text-blue-400';
      const p2Highlight = p2.replace(/([a-zA-Z0-9:-]+)=/g, `<span class="${attrColor}">$1</span>=`);
      return `<span class="${bracketColor}">&lt;</span><span class="${tagColor}">${p1.substring(4)}</span>${p2Highlight}`;
    });

    const jsKeywords = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'switch', 'case', 'break', 'class', 'export', 'import', 'from', 'new',
      'this', 'true', 'false', 'null', 'undefined', 'try', 'catch', 'finally',
      'async', 'await'
    ];
    const jsKeywordRegex = new RegExp(`\\b(${jsKeywords.join('|')})\\b`, 'g');
    html = html.replace(jsKeywordRegex, '<span class="text-purple-400 font-bold">$1</span>');

    const jsGlobals = ['window', 'document', 'console', 'log', 'fetch', 'JSON', 'stringify', 'parse', 'localStorage', 'sessionStorage', 'alert'];
    const jsGlobalsRegex = new RegExp(`\\b(${jsGlobals.join('|')})\\b`, 'g');
    html = html.replace(jsGlobalsRegex, '<span class="text-sky-400 font-semibold">$1</span>');

    for (let i = placeholders.length - 1; i >= 0; i--) {
      html = html.replace(`___PLACEHOLDER_${i}___`, placeholders[i]);
    }

    return html;
  };

  const highlightedHtml = React.useMemo(() => highlightCode(value), [value]);

  return (
    <div className={`relative w-full h-64 border rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed select-text bg-slate-950 ${
      adminTheme === 'light' ? 'border-slate-200' : 'border-slate-800'
    }`}>
      <pre 
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 m-0 p-4 w-full h-full overflow-hidden whitespace-pre pointer-events-none select-none border-0 text-slate-300 bg-slate-950 font-mono text-[11px] leading-relaxed"
        style={{
          boxSizing: 'border-box',
          tabSize: 2
        }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        required
        placeholder="<!-- Exemples -->&#10;<script>&#10;  console.log('Hello');&#10;</script>"
        className="absolute inset-0 w-full h-full p-4 font-mono text-[11px] leading-relaxed bg-transparent text-transparent caret-slate-100 focus:caret-emerald-400 outline-none border-0 resize-none whitespace-pre overflow-auto"
        style={{
          boxSizing: 'border-box',
          tabSize: 2
        }}
      />
    </div>
  );
}

export default function SnippetsTab() {
  const { adminTheme, currentUser } = useAdmin();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState<'head' | 'body_start' | 'body_end'>('head');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        const clientItems = (data.snippets || []).filter(
          (s: any) => s.trigger_type === 'client' || !s.trigger_type
        );
        setSnippets(clientItems);
      } else {
        setError(data.error || 'Erreur lors du chargement des snippets.');
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
    setFormCode('<!-- Saisir votre code HTML/JS/CSS ici -->\n<script>\n  console.log("Snippet initialisé");\n</script>');
    setFormLocation('head');
    setFormActive(true);
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setFormName(snippet.name);
    setFormCode(snippet.code);
    setFormLocation(snippet.location);
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
      alert('Erreur réseau lors de la mise à jour.');
    }
  };

  const validateCode = (code: string): boolean => {
    // Simple verification check to warn if tags are opened but not closed
    const openScripts = (code.match(/<script/gi) || []).length;
    const closeScripts = (code.match(/<\/script>/gi) || []).length;
    if (openScripts !== closeScripts) {
      setFormError('Attention : Le nombre de balises <script> ouvertes et fermées ne correspond pas.');
      return false;
    }
    const openStyles = (code.match(/<style/gi) || []).length;
    const closeStyles = (code.match(/<\/style>/gi) || []).length;
    if (openStyles !== closeStyles) {
      setFormError('Attention : Le nombre de balises <style> ouvertes et fermées ne correspond pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Le nom du snippet est obligatoire.');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Le code du snippet est obligatoire.');
      return;
    }

    validateCode(formCode); // Show warning but let them save if they want to override, except for empty code
    
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
          location: formLocation,
          active: formActive,
          trigger_type: 'client',
          cron_expression: null
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
        setFormError(data.error || 'Une erreur est survenue lors de la sauvegarde.');
      }
    } catch (err) {
      setFormError('Erreur de connexion réseau.');
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
      alert('Erreur réseau lors de la suppression.');
    }
  };

  const getLocationLabel = (loc: string) => {
    switch (loc) {
      case 'head': return 'En-tête (<head>)';
      case 'body_start': return 'Début du corps (<body>)';
      case 'body_end': return 'Pied de page (</body>)';
      default: return loc;
    }
  };

  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* Description Panel */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
        adminTheme === 'light' 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-slate-200 shadow-sm text-slate-800' 
          : 'bg-gradient-to-r from-slate-900/60 to-emerald-950/20 border-slate-900 text-slate-300'
      }`}>
        <div className="space-y-1.5 max-w-3xl">
          <h4 className="font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
            <FileCode2 className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            Gestionnaire de Code & Scripts
          </h4>
          <p className="text-[11.5px] font-medium leading-relaxed opacity-90">
            Injectez facilement des scripts de suivi (Google Analytics, Facebook Pixel, Pinterest), du CSS personnalisé ou des balises HTML personnalisées. Le code sera exécuté de manière sécurisée uniquement sur le storefront public, évitant ainsi d&apos;interférer avec le panneau d&apos;administration.
          </p>
        </div>
        
        {isOwner && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouveau Script
          </button>
        )}
      </div>

      {!isOwner && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-950 text-amber-300'
        }`}>
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Lecture seule : Seuls les administrateurs avec le rôle <strong>Propriétaire</strong> (owner) peuvent créer, modifier ou supprimer des snippets de code pour des raisons de sécurité.
          </p>
        </div>
      )}

      {/* Main List Table */}
      <div className={`border rounded-3xl overflow-hidden transition-colors duration-300 ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Chargement des snippets...</span>
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
              <Code className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm">Aucun script enregistré</h5>
              <p className="text-xs text-slate-500 max-w-xs">
                Commencez par ajouter votre premier snippet de code (ex. script de chat en direct ou analytics).
              </p>
            </div>
            {isOwner && (
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Créer un snippet
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
                  <th className="py-3.5 px-5">Nom</th>
                  <th className="py-3.5 px-5">Emplacement</th>
                  <th className="py-3.5 px-5">Statut</th>
                  <th className="py-3.5 px-5">Modifié le</th>
                  {isOwner && <th className="py-3.5 px-5 text-right">Actions</th>}
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
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          snippet.active 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          <Code className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[13px] block leading-tight">{snippet.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{snippet.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        snippet.location === 'head' 
                          ? (adminTheme === 'light' ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950/30 text-indigo-400')
                          : snippet.location === 'body_start'
                          ? (adminTheme === 'light' ? 'bg-teal-50 text-teal-700' : 'bg-teal-950/30 text-teal-400')
                          : (adminTheme === 'light' ? 'bg-amber-50 text-amber-700' : 'bg-amber-950/30 text-amber-400')
                      }`}>
                        {getLocationLabel(snippet.location)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => isOwner && handleToggleActive(snippet.id, snippet.active)}
                        disabled={!isOwner}
                        className={`flex items-center gap-2 cursor-pointer transition disabled:cursor-not-allowed ${
                          snippet.active 
                            ? 'text-emerald-500 hover:text-emerald-600' 
                            : 'text-slate-400 hover:text-slate-500'
                        }`}
                        title={isOwner ? (snippet.active ? "Désactiver le snippet" : "Activer le snippet") : undefined}
                      >
                        {snippet.active ? (
                          <ToggleRight className="w-8 h-8 stroke-[1.5]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 stroke-[1.5] text-slate-500" />
                        )}
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {snippet.active ? 'Actif' : 'Inactif'}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-5 font-mono text-[10.5px] text-slate-400">
                      {new Date(snippet.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    {isOwner && (
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-[24px] border p-6 shadow-2xl animate-in scale-in duration-200 ${
            adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-extrabold text-[15px] uppercase tracking-wider">Confirmer la suppression</h4>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-400 font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement ce snippet de code ? Cette action est irréversible et retirera immédiatement le script du storefront.
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
            adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200 shadow-premium' : 'bg-slate-900/80 border-slate-800 shadow-premium'
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
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold uppercase tracking-wider">
                      {editingSnippet ? 'Modifier le Snippet' : 'Ajouter un Snippet'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Configurez l&apos;intégration du code personnalisé
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
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  formError.startsWith('Attention')
                    ? (adminTheme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-950/40 text-amber-300')
                    : (adminTheme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/20 border-rose-950/40 text-rose-300')
                }`}>
                  <AlertCircle className={`w-5 h-5 shrink-0 ${formError.startsWith('Attention') ? 'text-amber-500' : 'text-rose-500'}`} />
                  <p className="text-xs font-semibold leading-relaxed">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Script Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Nom du Script
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Google Tag Manager Global, Pixel Facebook, Styles Custom..."
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
                  {/* Location Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Emplacement d&apos;Injection
                    </label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value as any)}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition focus:border-emerald-500/50 cursor-pointer ${
                        adminTheme === 'light' 
                          ? 'bg-slate-50 border-slate-200 text-slate-800' 
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <option value="head">Dans l&apos;en-tête (HTML &lt;head&gt;)</option>
                      <option value="body_start">Au début du corps (juste après &lt;body&gt;)</option>
                      <option value="body_end">Dans le pied de page (avant &lt;/body&gt;)</option>
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
                      <span className="text-xs font-semibold">Exécuter ce script</span>
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
                      Code HTML / JS / CSS
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Balise &lt;script&gt; ou &lt;style&gt; requise pour du JS/CSS
                    </span>
                  </div>
                  
                  <div className="relative">
                    <CodeEditor
                      value={formCode}
                      onChange={setFormCode}
                      adminTheme={adminTheme}
                    />
                  </div>
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
                      Sauvegarde...
                    </>
                  ) : (
                    'Enregistrer le Script'
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
