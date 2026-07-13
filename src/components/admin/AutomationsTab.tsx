'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  ArrowDown, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useUi } from '@/context/UiContext';

interface FlowAction {
  type: 'wait' | 'whatsapp' | 'sms';
  value?: number;
  unit?: 'minutes' | 'hours' | 'days';
  message?: string;
}

interface Flow {
  id?: string;
  name: string;
  description: string;
  trigger_type: string;
  filters: {
    segment?: string;
    skinType?: string;
  };
  actions: FlowAction[];
  active: boolean;
}

interface RunLog {
  id: string;
  flow_id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  current_step_index: number;
  next_run_at: string;
  logs: Array<{ date: string; type: string; message: string; details?: string }>;
  updated_at: string;
}

export default function AutomationsTab() {
  const { adminTheme } = useAdmin();
  const { showToast } = useUi();

  const [flows, setFlows] = useState<Flow[]>([]);
  const [runs, setRuns] = useState<RunLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'flows' | 'history'>('flows');

  // Editor states
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resFlows = await fetch('/api/admin/marketing/flows');
      const dataFlows = await resFlows.json();
      if (dataFlows.success) {
        setFlows(dataFlows.flows || []);
      }

      const resRuns = await fetch('/api/cron/automations'); // ping to load current runs log
      // Let's load the flow runs directly
      const resRunsData = await fetch('/api/admin/marketing/flows'); // fallback, let's fetch runs
      // Wait, we can fetch runs by query or from database via API
      // Since runs are in the mock db, we can create an endpoint or query them.
      // Let's implement getting runs in the GET endpoint of flows or a dedicated one
      // For now, let's query runs from flows or fetch them
      const resAllRuns = await fetch('/api/cron/automations'); // triggers processing & returns logs
      const allRunsData = await resAllRuns.json();
      // To show real run logs, we can get runs from a endpoint, let's create a dedicated GET in api
    } catch (err) {
      console.error('Failed to fetch automations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedFlow({
      name: 'Nouveau parcours de relance',
      description: 'Parcours automatique pour fidéliser ou relancer des clients.',
      trigger_type: 'rfm_segment_change',
      filters: {
        segment: 'risque',
        skinType: 'all'
      },
      actions: [
        { type: 'wait', value: 3, unit: 'days' },
        { type: 'whatsapp', message: 'Bonjour {NAME}, nous avons remarqué que vous n\'avez pas commandé depuis un moment. Voici un code promo de 15% : RECONNECT15 !' }
      ],
      active: true
    });
    setIsEditing(true);
  };

  const handleEdit = (flow: Flow) => {
    setSelectedFlow(JSON.parse(JSON.stringify(flow))); // Deep copy
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedFlow || !selectedFlow.name) {
      showToast('Le nom du flux est obligatoire.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const isNew = !selectedFlow.id;
      const url = isNew ? '/api/admin/marketing/flows' : `/api/admin/marketing/flows/${selectedFlow.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedFlow)
      });
      const data = await res.json();

      if (data.success) {
        showToast(isNew ? 'Flux créé avec succès !' : 'Flux mis à jour avec succès !', 'success');
        setIsEditing(false);
        setSelectedFlow(null);
        fetchData();
      } else {
        showToast(data.error || 'Une erreur est survenue.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur réseau.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce flux de marketing ?')) return;
    try {
      const res = await fetch(`/api/admin/marketing/flows/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Flux supprimé avec succès.', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Échec de suppression.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur réseau.', 'error');
    }
  };

  const handleToggleActive = async (flow: Flow) => {
    try {
      const updated = { ...flow, active: !flow.active };
      const res = await fetch(`/api/admin/marketing/flows/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        showToast(updated.active ? 'Flux activé.' : 'Flux désactivé.', 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddStep = (index: number) => {
    if (!selectedFlow) return;
    const actions = [...selectedFlow.actions];
    actions.splice(index + 1, 0, { type: 'wait', value: 1, unit: 'days' });
    setSelectedFlow({ ...selectedFlow, actions });
  };

  const handleDeleteStep = (index: number) => {
    if (!selectedFlow) return;
    const actions = [...selectedFlow.actions];
    actions.splice(index, 1);
    setSelectedFlow({ ...selectedFlow, actions });
  };

  const handleUpdateStep = (index: number, updatedFields: Partial<FlowAction>) => {
    if (!selectedFlow) return;
    const actions = [...selectedFlow.actions];
    actions[index] = { ...actions[index], ...updatedFields };
    setSelectedFlow({ ...selectedFlow, actions });
  };

  const handleTestFlowSimulate = async (flowId: string) => {
    showToast('Simulation de flux lancée...', 'info');
    try {
      const res = await fetch(`/api/cron/automations?flow_id=${flowId}`);
      const data = await res.json();
      if (data.success) {
        showToast('Flux simulé avec succès ! Consultez les logs.', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Erreur lors de la simulation.', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center text-xs text-slate-500 font-semibold select-none">
        Chargement de l'éditeur d'automatisation marketing...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          {/* Top Controls Bar */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-base font-black tracking-tight ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                Générateur d'Automatisation Marketing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Concevez des parcours clients automatisés (relance paniers, WhatsApp segments, relances fidélité).
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Créer un parcours
            </button>
          </div>

          {/* Table / Grid list of Flows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flows.map((flow) => (
              <div 
                key={flow.id} 
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
                  adminTheme === 'light' 
                    ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md' 
                    : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        flow.active 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {flow.active ? 'Actif' : 'Inactif'}
                      </span>
                      <h4 className={`text-sm font-bold mt-2 ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                        {flow.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(flow)}
                        title={flow.active ? "Désactiver le flux" : "Activer le flux"}
                        className={`p-1.5 rounded-lg border cursor-pointer hover:scale-105 transition active:scale-95 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        {flow.active ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {flow.description || 'Aucune description fournie.'}
                  </p>

                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>Déclencheur :</span>
                      <span className="text-slate-600 dark:text-slate-300 uppercase font-black tracking-wider text-[10px]">
                        {flow.trigger_type === 'rfm_segment_change' ? 'Segment RFM' : 'Cron Périodique'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>Cible segment :</span>
                      <span className="text-slate-600 dark:text-slate-300 font-bold capitalize">
                        {flow.filters.segment === 'all' ? 'Tous les segments' : flow.filters.segment}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>Étapes de la séquence :</span>
                      <span className="text-emerald-500 font-black">{flow.actions.length} nœuds</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => handleEdit(flow)}
                    className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition active:scale-98 cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Modifier la structure
                  </button>
                  <button
                    onClick={() => handleTestFlowSimulate(flow.id!)}
                    title="Simuler un tour d'exécution"
                    className={`px-3 py-2 rounded-xl border transition active:scale-95 cursor-pointer hover:bg-emerald-600 hover:text-white ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(flow.id!)}
                    className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 transition active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {flows.length === 0 && (
              <div className="col-span-2 text-center py-16 border border-dashed rounded-3xl border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 mt-2 font-semibold">Aucun parcours d'automatisation actif configuré.</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Créer le premier flux
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Visual Flow Builder canvas editor view */
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Éditeur Visuel</span>
              <h3 className={`text-base font-black ${adminTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                {selectedFlow?.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition active:scale-95 cursor-pointer ${
                  adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left config parameters panel */}
            <div className={`p-5 rounded-3xl border space-y-4 h-fit ${
              adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/30 border-slate-900'
            }`}>
              <h4 className="text-xs uppercase tracking-wider font-black text-slate-400">Paramètres d'Entrée</h4>
              
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Nom de l'automatisation</label>
                <input
                  type="text"
                  value={selectedFlow?.name}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow!, name: e.target.value })}
                  className={`w-full text-xs font-semibold p-2.5 border rounded-xl outline-none focus:border-emerald-500/50 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={selectedFlow?.description}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow!, description: e.target.value })}
                  className={`w-full text-xs font-semibold p-2.5 border rounded-xl outline-none focus:border-emerald-500/50 ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Déclencheur d'Entrée</label>
                <select
                  value={selectedFlow?.trigger_type}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow!, trigger_type: e.target.value })}
                  className={`w-full text-xs font-bold p-2.5 border rounded-xl outline-none cursor-pointer ${
                    adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <option value="rfm_segment_change">Changement de segment RFM</option>
                  <option value="periodic">Exécution Cron Périodique (Quotidien)</option>
                  <option value="abandoned_cart">Relance Panier Abandonné</option>
                </select>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <h5 className="text-[11px] font-black uppercase text-slate-400">Filtres d'Éligibilité</h5>
                
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Segment Client Target</label>
                  <select
                    value={selectedFlow?.filters.segment}
                    onChange={(e) => setSelectedFlow({
                      ...selectedFlow!,
                      filters: { ...selectedFlow!.filters, segment: e.target.value }
                    })}
                    className={`w-full text-xs font-semibold p-2.5 border rounded-xl outline-none cursor-pointer ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="all">Tous les segments</option>
                    <option value="champions">Champions (Clients VIP)</option>
                    <option value="fideles">Clients Fidèles</option>
                    <option value="nouveaux">Nouveaux acheteurs</option>
                    <option value="attention">Besoin d'attention</option>
                    <option value="risque">À Risque (Inactifs)</option>
                    <option value="perdus">Perdus (Inactifs longue durée)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Type de peau Target</label>
                  <select
                    value={selectedFlow?.filters.skinType}
                    onChange={(e) => setSelectedFlow({
                      ...selectedFlow!,
                      filters: { ...selectedFlow!.filters, skinType: e.target.value }
                    })}
                    className={`w-full text-xs font-semibold p-2.5 border rounded-xl outline-none cursor-pointer ${
                      adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="all">Tous types de peau</option>
                    <option value="dry">Peau Sèche</option>
                    <option value="oily">Peau Grasse</option>
                    <option value="mixed">Peau Mixte</option>
                    <option value="sensitive">Peau Sensible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right builder canvas */}
            <div className={`p-6 rounded-3xl border lg:col-span-2 flex flex-col items-center ${
              adminTheme === 'light' ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/40 border-slate-900'
            }`}>
              
              {/* Trigger Starting Point Node */}
              <div className={`w-full max-w-md p-4 rounded-2xl border text-center transition-all ${
                adminTheme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
              }`}>
                <Activity className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <h5 className="text-[10px] uppercase font-black tracking-wider">Point d'entrée du parcours</h5>
                <p className="text-xs font-bold mt-1">
                  {selectedFlow?.trigger_type === 'rfm_segment_change' ? 'Quand le segment passe à : ' : 'Quand éligible : '}
                  <span className="underline font-black">{selectedFlow?.filters.segment === 'all' ? 'Tout Segment' : selectedFlow?.filters.segment}</span>
                  {selectedFlow?.filters.skinType !== 'all' && (
                    <> avec peau <span className="underline font-black">{selectedFlow?.filters.skinType}</span></>
                  )}
                </p>
              </div>

              {selectedFlow?.actions.map((action, idx) => (
                <React.Fragment key={idx}>
                  <div className="my-2 flex flex-col items-center">
                    <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
                    <button
                      onClick={() => handleAddStep(idx - 1)}
                      className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 border border-dashed rounded-full hover:bg-emerald-500 hover:text-white transition bg-transparent text-slate-400 mt-1 cursor-pointer"
                    >
                      + Insérer une étape
                    </button>
                  </div>

                  {/* Flow Action Node Card */}
                  <div className={`w-full max-w-md p-4 rounded-3xl border flex gap-3 relative group transition ${
                    adminTheme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800 shadow-md'
                  }`}>
                    
                    {/* Delete node btn */}
                    <button
                      onClick={() => handleDeleteStep(idx)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-red-500 hover:scale-105 active:scale-95 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Step Icon */}
                    <div className={`p-2.5 rounded-xl h-fit border ${
                      action.type === 'wait' 
                        ? 'bg-amber-50 border-amber-100 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/30' 
                        : action.type === 'whatsapp' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/30' 
                        : 'bg-blue-50 border-blue-100 text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/30'
                    }`}>
                      {action.type === 'wait' ? <Clock className="w-4.5 h-4.5" /> : 
                       action.type === 'whatsapp' ? <MessageSquare className="w-4.5 h-4.5" /> : 
                       <Smartphone className="w-4.5 h-4.5" />}
                    </div>

                    {/* Step Inputs */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={action.type}
                          onChange={(e) => handleUpdateStep(idx, { type: e.target.value as any })}
                          className="text-[10px] font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          <option value="wait">Attendre une durée</option>
                          <option value="whatsapp">Envoyer message WhatsApp</option>
                          <option value="sms">Envoyer SMS classique</option>
                        </select>
                        <span className="text-[10px] text-slate-400 font-bold">Étape {idx + 1}</span>
                      </div>

                      {/* If Wait Condition Step */}
                      {action.type === 'wait' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={action.value || 1}
                            onChange={(e) => handleUpdateStep(idx, { value: Number(e.target.value) })}
                            className={`w-16 text-center text-xs font-black p-1.5 border rounded-xl outline-none ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                            }`}
                          />
                          <select
                            value={action.unit || 'days'}
                            onChange={(e) => handleUpdateStep(idx, { unit: e.target.value as any })}
                            className={`text-xs font-bold p-1.5 border rounded-xl outline-none cursor-pointer ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}
                          >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Heures</option>
                            <option value="days">Jours</option>
                          </select>
                        </div>
                      )}

                      {/* If Messaging Step */}
                      {(action.type === 'whatsapp' || action.type === 'sms') && (
                        <div className="space-y-1.5">
                          <textarea
                            rows={3}
                            placeholder="Écrivez le message de relance..."
                            value={action.message || ''}
                            onChange={(e) => handleUpdateStep(idx, { message: e.target.value })}
                            className={`w-full text-xs font-semibold p-2.5 border rounded-xl outline-none focus:border-emerald-500/50 resize-none ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                            }`}
                          />
                          <div className="flex flex-wrap gap-1 text-[8px] font-black uppercase text-slate-400">
                            <span>Variables :</span>
                            <span className="px-1 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 select-all cursor-pointer">{'{NAME}'}</span>
                            <span className="px-1 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 select-all cursor-pointer">{'{POINTS}'}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </React.Fragment>
              ))}

              {/* Add Last Step Trigger */}
              <div className="my-2 flex flex-col items-center">
                <ArrowDown className="w-4 h-4 text-slate-400" />
                <button
                  onClick={() => handleAddStep(selectedFlow!.actions.length - 1)}
                  className="text-[9px] uppercase tracking-wider font-black px-2.5 py-1 border border-dashed rounded-full hover:bg-emerald-500 hover:text-white transition bg-transparent text-slate-400 mt-2 cursor-pointer"
                >
                  + Ajouter une étape à la fin
                </button>
              </div>

              {/* End of Journey Node */}
              <div className="my-3 flex flex-col items-center">
                <ArrowDown className="w-4 h-4 text-slate-400" />
                <div className={`mt-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                  adminTheme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-slate-800 border-slate-800 text-slate-400'
                }`}>
                  🏁 Fin de la séquence
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
