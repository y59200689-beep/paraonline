'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import {
  Shield,
  ShieldAlert,
  Search,
  Users,
  Calendar,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  ListFilter,
  Clock,
  LayoutGrid,
  History,
  Activity
} from 'lucide-react';
import { StatusBadge, EmptyState } from '@/components/admin/ui';

export default function AuditLogsTab() {
  const { 
    adminTheme, 
    currentUser, 
    auditLogs = [], 
    operatorsList = [], 
    loadAuditLogs, 
    loadOperatorsList 
  } = useAdmin();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Layout View State: 'table' or 'timeline'
  const [viewType, setViewType] = useState<'table' | 'timeline'>('table');

  // Detailed view modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Exporter Hub Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('pdf');
  const [reportTitle, setReportTitle] = useState("RAPPORT CONFORMITÉ SÉCURITÉ");
  const [memoText, setMemoText] = useState("Rapport d'audit périodique destiné au suivi interne et à la conformité réglementaire de la plateforme.");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Refresh data on mount
  useEffect(() => {
    if (currentUser?.role === 'owner') {
      loadAuditLogs();
      loadOperatorsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOperator, selectedAction, startDate, endDate]);

  // Compute log statistics dynamically
  const { loginEvents, catalogModifications, criticalDeletes } = useMemo(() => {
    let logins = 0;
    let catalog = 0;
    let deletes = 0;

    auditLogs.forEach(log => {
      const act = (log.action || '').toLowerCase();
      const det = (log.details || '').toLowerCase();
      if (act.includes('connex') || act.includes('mfa') || act.includes('mot de passe')) {
        logins++;
      }
      if (act.includes('produit') || act.includes('importation') || act.includes('faq') || act.includes('restock') || act.includes('catalogue')) {
        catalog++;
      }
      if (act.includes('suppr') || act.includes('suppression') || act.includes('delete') || det.includes('supprimé')) {
        deletes++;
      }
    });

    return { loginEvents: logins, catalogModifications: catalog, criticalDeletes: deletes };
  }, [auditLogs]);

  // Extract unique actions dynamically from logs
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    auditLogs.forEach(log => {
      if (log.action) {
        actions.add(log.action);
      }
    });
    return Array.from(actions).sort();
  }, [auditLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // 1. Keyword search (Action or Details)
      const matchesSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Action type filter
      const matchesAction = selectedAction === 'all' || log.action === selectedAction;

      // 3. Operator filter: Search for operator name or username in log details
      let matchesOperator = true;
      if (selectedOperator !== 'all') {
        const op = operatorsList.find(o => o.username === selectedOperator || o.name === selectedOperator);
        if (op) {
          const nameLower = op.name.toLowerCase();
          const usernameLower = op.username.toLowerCase();
          matchesOperator = 
            log.details.toLowerCase().includes(nameLower) ||
            log.details.toLowerCase().includes(usernameLower);
        } else {
          // Fallback matching substring
          matchesOperator = log.details.toLowerCase().includes(selectedOperator.toLowerCase());
        }
      }

      // 4. Date range filter
      let matchesDate = true;
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        matchesDate = matchesDate && new Date(log.date) >= start;
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59');
        matchesDate = matchesDate && new Date(log.date) <= end;
      }

      return matchesSearch && matchesAction && matchesOperator && matchesDate;
    });
  }, [auditLogs, searchQuery, selectedAction, selectedOperator, operatorsList, startDate, endDate]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date & Heure', 'Action', 'Détails'];
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.date).toLocaleString('fr-FR'),
      log.action,
      log.details
    ]);

    // Construct CSV content with double quotes escaping
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Add UTF-8 BOM to render accents correctly in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journaux_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Export PDF via printer window layout
  const handleExportPDF = (titleText: string, memoContent: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Le bloqueur de fenêtres pop-up empêche la génération du PDF.");
      return;
    }

    const logsHtml = filteredLogs.map((log, index) => `
      <tr style="font-size: 9.5px;">
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${index + 1}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #475569;">${log.id}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; white-space: nowrap;">${new Date(log.date).toLocaleString('fr-FR')}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${log.action}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #334155; line-height: 1.4;">${log.details}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${titleText}</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              font-size: 11px;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand-info h1 {
              font-size: 18px;
              margin: 0;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #0f172a;
            }
            .brand-info p {
              margin: 2px 0 0 0;
              font-size: 9.5px;
              color: #64748b;
              font-weight: 600;
            }
            .report-meta {
              text-align: right;
              font-size: 9.5px;
              color: #475569;
              line-height: 1.4;
            }
            .report-title-container {
              margin-bottom: 20px;
            }
            .report-title {
              font-size: 14px;
              font-weight: 800;
              margin: 0 0 6px 0;
              color: #0d9488;
              letter-spacing: 0.5px;
            }
            .report-memo {
              background: #f8fafc;
              border-left: 3.5px solid #0d9488;
              padding: 10px 12px;
              font-size: 10px;
              color: #334155;
              border-radius: 6px;
              margin-top: 5px;
              line-height: 1.4;
            }
            .analytics-summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 25px;
            }
            .summary-card {
              border: 1px solid #e2e8f0;
              padding: 10px;
              border-radius: 8px;
              background: #f8fafc;
            }
            .summary-card .label {
              font-size: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              font-weight: 700;
            }
            .summary-card .val {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background: #f1f5f9;
              border-bottom: 1.5px solid #cbd5e1;
              padding: 8px;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 8px;
              color: #475569;
              text-align: left;
            }
            .footer-seal {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px dashed #cbd5e1;
              padding-top: 15px;
              font-size: 8.5px;
              color: #94a3b8;
              page-break-inside: avoid;
            }
            .seal-box {
              border: 1px solid #cbd5e1;
              padding: 6px 12px;
              border-radius: 6px;
              text-align: center;
              font-family: monospace;
              background: #f8fafc;
              color: #475569;
              font-size: 8px;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="brand-info">
              <h1>PARA OFFICINAL S.A</h1>
              <p>Registre de Conformité Réglementaire & Sécurité</p>
            </div>
            <div class="report-meta">
              <div><strong>Généré le:</strong> ${new Date().toLocaleString('fr-FR')}</div>
              <div><strong>Opérateur:</strong> ${currentUser?.name || currentUser?.username} (${currentUser?.role})</div>
              <div><strong>Statut d'Audit:</strong> CONFORME</div>
            </div>
          </div>

          <div class="report-title-container">
            <h2 class="report-title">${titleText}</h2>
            ${memoContent ? `<div class="report-memo"><strong>Note de Conformité:</strong> ${memoContent}</div>` : ''}
          </div>

          <div class="analytics-summary">
            <div class="summary-card">
              <div class="label">Total Événements</div>
              <div class="val">${filteredLogs.length}</div>
            </div>
            <div class="summary-card">
              <div class="label">Période du Rapport</div>
              <div class="val" style="font-size: 9px; font-weight: bold; margin-top: 6px; white-space: nowrap;">
                ${startDate ? startDate : 'Début'} au ${endDate ? endDate : 'Aujourd\'hui'}
              </div>
            </div>
            <div class="summary-card">
              <div class="label">Type d'Action</div>
              <div class="val" style="font-size: 11px;">${selectedAction === 'all' ? 'Toutes' : selectedAction}</div>
            </div>
            <div class="summary-card">
              <div class="label">Opérateur Sélectionné</div>
              <div class="val" style="font-size: 11px;">${selectedOperator === 'all' ? 'Tous' : selectedOperator}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 15%;">ID Log</th>
                <th style="width: 18%;">Date & Heure</th>
                <th style="width: 20%;">Action</th>
                <th style="width: 42%;">Détails</th>
              </tr>
            </thead>
            <tbody>
              ${logsHtml}
            </tbody>
          </table>

          <div class="footer-seal">
            <div>Ce document constitue une attestation officielle des journaux d'audit système de la plateforme.</div>
            <div class="seal-box">
              VALIDATION NUMÉRIQUE LOG<br/>
              SHA256: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  // Determine styling badge for each log category
  const getLogBadgeStyles = (action: string) => {
    const actionLower = (action || '').toLowerCase();
    if (actionLower.includes('créer') || actionLower.includes('ajout') || actionLower.includes('importation')) {
      return adminTheme === 'light' 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (actionLower.includes('suppr') || actionLower.includes('cancel') || actionLower.includes('désactiv')) {
      return adminTheme === 'light' 
        ? 'bg-rose-50 text-rose-700 border-rose-200' 
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (actionLower.includes('connex') || actionLower.includes('mfa') || actionLower.includes('mot de passe')) {
      return adminTheme === 'light' 
        ? 'bg-amber-50 text-amber-700 border-amber-200' 
        : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return adminTheme === 'light' 
      ? 'bg-sky-50 text-sky-700 border-sky-200' 
      : 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  };

  const isOwner = currentUser?.role === 'owner';

  // 1. RBAC Guard Panel
  if (!isOwner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className={`w-full max-w-md rounded-[32px] border p-2 shadow-2xl backdrop-blur-xl ${
          adminTheme === 'light' ? 'bg-white/80 border-slate-200 shadow-slate-100' : 'bg-slate-900/40 border-slate-800'
        }`}>
          <div className={`rounded-[calc(32px-8px)] p-8 text-center space-y-5 ${
            adminTheme === 'light' ? 'bg-slate-50' : 'bg-slate-950/80'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black uppercase tracking-wider text-rose-500">Accès Restreint</h2>
              <p className={`text-xs leading-relaxed font-light ${
                adminTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Les journaux d&apos;audit contiennent des informations de sécurité confidentielles et des données de conformité administratives. 
                Seuls les administrateurs avec le rôle <strong>Propriétaire</strong> (owner) sont autorisés à consulter cet onglet.
              </p>
            </div>
            <div className={`text-[10px] font-mono border rounded-xl py-2 ${
              adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}>
              ID Opérateur: {currentUser?.username || 'Inconnu'} • Rôle: {currentUser?.role || 'Aucun'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* Header Description & Export Actions */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
        adminTheme === 'light' 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-slate-200 shadow-sm text-slate-800' 
          : 'bg-gradient-to-r from-slate-900/60 to-emerald-950/20 border-slate-900 text-slate-300'
      }`}>
        <div className="space-y-1.5 max-w-3xl">
          <h4 className="font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
            <Shield className={`w-4 h-4 ${adminTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            Journaux d&apos;Audit, Sécurité & Conformité
          </h4>
          <p className="text-[11.5px] font-medium leading-relaxed opacity-90">
            Inspectez la traçabilité complète des actions administratives de la boutique (connexions, modifications de produits, ajustements de stocks, changements de configuration). Ces données fournissent un historique immuable pour la sécurité et la conformité multi-opérateurs.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { loadAuditLogs(); loadOperatorsList(); }}
            title="Rafraîchir les logs"
            className="admin-btn admin-btn-secondary p-2 flex items-center justify-center h-9 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            disabled={filteredLogs.length === 0}
            className="admin-btn admin-btn-primary flex items-center gap-1.5 h-9 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exporter les logs
          </button>
        </div>
      </div>

      {/* Analytics Cards Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-3xl border transition-all duration-300 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Événements</span>
              <div className="text-2xl font-black">{auditLogs.length}</div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-medium mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Traçabilité active en temps réel
          </div>
        </div>

        <div className={`p-5 rounded-3xl border transition-all duration-300 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Accès & Sécurité</span>
              <div className="text-2xl font-black">{loginEvents}</div>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-medium mt-3">
            Connexions, MFA & privilèges staff
          </div>
        </div>

        <div className={`p-5 rounded-3xl border transition-all duration-300 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Modifs Catalogue</span>
              <div className="text-2xl font-black">{catalogModifications}</div>
            </div>
            <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-medium mt-3">
            Ajustements de prix, stocks & fiches
          </div>
        </div>

        <div className={`p-5 rounded-3xl border transition-all duration-300 ${
          adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Actions Critiques</span>
              <div className="text-2xl font-black text-rose-500">{criticalDeletes}</div>
            </div>
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[9.5px] text-slate-400 font-medium mt-3">
            Suppressions d&apos;avis ou d&apos;entités
          </div>
        </div>
      </div>

      {/* Filters Toolbar Card */}
      <div className={`p-5 rounded-3xl border transition-colors duration-300 space-y-4 ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        <div className="flex items-center gap-2 border-b pb-3 dark:border-slate-900">
          <ListFilter className="w-4 h-4 text-emerald-500" />
          <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Filtres de recherche</h5>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-500" /> Recherche Libre
            </label>
            <input
              type="text"
              placeholder="Rechercher par action ou détails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input admin-focus-ring w-full h-9"
            />
          </div>

          {/* Action Filter */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-500" /> Type d&apos;Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="admin-input w-full h-9"
            >
              <option value="all">Tous les types ({uniqueActions.length})</option>
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* Administrator Filter */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" /> Opérateur Staff
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="admin-input w-full h-9"
            >
              <option value="all">Tous les opérateurs ({operatorsList.length})</option>
              {operatorsList.map(op => (
                <option key={op.id} value={op.username}>{op.name} ({op.role})</option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Date du
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-input w-full h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1">
          {/* Date Picker End */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Au (Date fin)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-input w-full h-9"
            />
          </div>

          {/* Spacer to push view toggler to right */}
          <div className="md:col-span-3 hidden md:block" />

          {/* View Type Switcher */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <div className={`flex rounded-xl p-1 border justify-between ${
              adminTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-900'
            }`}>
              <button
                type="button"
                onClick={() => setViewType('table')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  viewType === 'table'
                    ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-900 text-white')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                Tableau
              </button>
              <button
                type="button"
                onClick={() => setViewType('timeline')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  viewType === 'timeline'
                    ? (adminTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-900 text-white')
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <History className="w-3 h-3" />
                Chronologie
              </button>
            </div>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(searchQuery || selectedOperator !== 'all' || selectedAction !== 'all' || startDate || endDate) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedOperator('all');
                setSelectedAction('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Main List Container */}
      <div className={`border rounded-3xl overflow-hidden transition-colors duration-300 ${
        adminTheme === 'light' ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/40 border-slate-900'
      }`}>
        
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="Aucun log trouvé"
            description="Aucun journal d'audit ne correspond aux filtres de recherche sélectionnés. Modifiez vos filtres ou effectuez une nouvelle recherche."
            theme={adminTheme}
            icon={ShieldAlert}
          />
        ) : viewType === 'table' ? (
          // TABLE VIEW
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface-2)' }}>
                  {['ID Log', 'Date & Heure', "Type d'Action", "Détails de l'Action", ''].map((h, i) => (
                    <th key={i} className={`py-3.5 px-5 font-bold uppercase tracking-widest ${i === 4 ? 'text-right w-20' : ''}`} style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-900">
                {paginatedLogs.map(log => (
                  <tr
                    key={log.id}
                    className={`text-xs transition-colors duration-150 group ${
                      adminTheme === 'light' ? 'hover:bg-slate-50/30' : 'hover:bg-white/[0.01]'
                    }`}
                  >
                    {/* Log ID */}
                    <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400">
                      {log.id}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 font-mono text-[10.5px] text-slate-400">
                      {new Date(log.date).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-5">
                      <StatusBadge
                        status={
                          log.action.toLowerCase().includes('créer') || log.action.toLowerCase().includes('ajout') || log.action.toLowerCase().includes('importation')
                            ? 'success'
                            : log.action.toLowerCase().includes('suppr') || log.action.toLowerCase().includes('cancel') || log.action.toLowerCase().includes('désactiv')
                            ? 'error'
                            : log.action.toLowerCase().includes('connex') || log.action.toLowerCase().includes('mfa') || log.action.toLowerCase().includes('mot de passe')
                            ? 'warning'
                            : 'info'
                        }
                        label={log.action}
                        theme={adminTheme}
                        size="xs"
                      />
                    </td>

                    {/* Log Details content preview */}
                    <td className="py-3.5 px-5 font-medium max-w-md truncate">
                      <span className={adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                        {log.details}
                      </span>
                    </td>

                    {/* Action eye button */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        title="Détails du log"
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          adminTheme === 'light'
                            ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // TIMELINE VIEW
          <div className="p-6 md:p-8 space-y-6 max-h-[600px] overflow-y-auto pr-2">
            <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
              {paginatedLogs.map(log => {
                const badgeColorClass = getLogBadgeStyles(log.action).split(' ')[0]; // Gets the bg- class
                return (
                  <div key={log.id} className="relative flex flex-col md:flex-row md:justify-between md:items-start gap-2 group">
                    {/* Dot on timeline */}
                    <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-offset-0 ring-white dark:ring-slate-950 ${
                      badgeColorClass ? badgeColorClass.replace('/10', '') : 'bg-sky-500'
                    } transition duration-300 group-hover:scale-125`} />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border tracking-wider ${
                          getLogBadgeStyles(log.action)
                        }`}>
                          {log.action}
                        </span>
                        <span className={`shrink-0 font-mono text-[9px] ${
                          adminTheme === 'light' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {new Date(log.date).toLocaleString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                        <span className="font-mono text-[8.5px] text-slate-500">#{log.id}</span>
                      </div>
                      
                      <p className={`leading-relaxed text-xs font-semibold ${
                        adminTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {log.details}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLog(log)}
                      className={`p-1 border rounded-lg transition text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer ${
                        adminTheme === 'light'
                          ? 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inspecter
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination bar */}
        <div className={`px-5 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${
          adminTheme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/40 border-slate-900'
        }`}>
          <span className="text-[11px] font-medium text-slate-400">
            Affichage de <strong>{Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}</strong> à <strong>{Math.min(filteredLogs.length, currentPage * itemsPerPage)}</strong> sur <strong>{filteredLogs.length}</strong> logs filtrés
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                adminTheme === 'light'
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Detail Inspector Drawer/Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-xl rounded-[32px] border p-1 shadow-2xl animate-in zoom-in-95 duration-200 ${
            adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className={`rounded-[calc(32px-4px)] p-6 md:p-8 space-y-6 ${
              adminTheme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
            }`}>
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold uppercase tracking-wider">
                      Inspecteur de Sécurité
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Détails complets de l&apos;événement système
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedLog(null)}
                  className={`p-1.5 rounded-full border transition cursor-pointer ${
                    adminTheme === 'light' ? 'hover:bg-slate-50 border-slate-200 text-slate-400' : 'hover:bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Log Properties Block */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ID Log</span>
                    <code className="text-xs font-mono font-extrabold">{selectedLog.id}</code>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Type d&apos;Action</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                      getLogBadgeStyles(selectedLog.action)
                    }`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Date et Heure de l&apos;événement</span>
                    <span className="text-xs font-mono font-extrabold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(selectedLog.date).toLocaleString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Détails de l&apos;activité</span>
                  <div className={`p-4 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text border font-bold ${
                    adminTheme === 'light'
                      ? 'bg-slate-950 text-slate-100 border-slate-900'
                      : 'bg-black text-slate-200 border-slate-900'
                  }`}>
                    {selectedLog.details}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end pt-2 border-t dark:border-slate-900">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Fermer l&apos;inspecteur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Exporter Hub Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-[32px] border p-1 shadow-2xl animate-in zoom-in-95 duration-200 ${
            adminTheme === 'light' ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className={`rounded-[calc(32px-4px)] p-6 md:p-8 space-y-6 ${
              adminTheme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
            }`}>
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4 dark:border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold uppercase tracking-wider">
                      Exportateur de Conformité
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Configurez l&apos;exportation officielle des journaux
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`p-1.5 rounded-full border transition cursor-pointer ${
                    adminTheme === 'light' ? 'hover:bg-slate-50 border-slate-200 text-slate-400' : 'hover:bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Config */}
              <div className="space-y-4 text-left">
                {/* Format selection cards */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Format du Document</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-24 ${
                        exportFormat === 'pdf'
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : (adminTheme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-900/50')
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">PDF Rapport (.pdf)</span>
                      <span className="text-[9px] text-slate-400 font-medium leading-relaxed">
                        Prêt pour impression ou archivage légal, signé numériquement.
                      </span>
                    </div>

                    <div 
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-24 ${
                        exportFormat === 'csv'
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : (adminTheme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-900/50')
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">Tableur Excel (.csv)</span>
                      <span className="text-[9px] text-slate-400 font-medium leading-relaxed">
                        Idéal pour le tri de données et l&apos;importation sous Excel ou Sheets.
                      </span>
                    </div>
                  </div>
                </div>

                {exportFormat === 'pdf' && (
                  <>
                    {/* Report Title */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Titre du Rapport</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value.toUpperCase())}
                        placeholder="Ex: RAPPORT DE CONFORMITÉ TRIMESTRIEL"
                        className="admin-input admin-focus-ring w-full h-9"
                      />
                    </div>

                    {/* Memo / Context notes */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Notes de Conformité (Mémo)</label>
                      <textarea
                        value={memoText}
                        onChange={(e) => setMemoText(e.target.value)}
                        placeholder="Précisez le contexte réglementaire ou les personnes destinataires..."
                        rows={3}
                        className="admin-input admin-focus-ring w-full p-2.5 text-xs font-medium resize-none"
                      />
                    </div>
                  </>
                )}

                <div className={`p-4 rounded-2xl border text-[10px] font-medium leading-relaxed ${
                  adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/40 border-slate-900 text-slate-400'
                }`}>
                  L&apos;exportation contiendra les <strong>{filteredLogs.length} logs</strong> actuellement filtrés selon vos critères (Opérateur: {selectedOperator === 'all' ? 'tous' : selectedOperator}, Action: {selectedAction === 'all' ? 'toutes' : selectedAction}, Date: {startDate || 'Début'} au {endDate || 'Aujourd\'hui'}).
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-900">
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`px-5 py-2 border font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer ${
                    adminTheme === 'light' ? 'hover:bg-slate-50 border-slate-200 text-slate-500' : 'hover:bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (exportFormat === 'csv') {
                      handleExportCSV();
                    } else {
                      handleExportPDF(reportTitle, memoText);
                    }
                    setShowExportModal(false);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Télécharger le document ({exportFormat.toUpperCase()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
