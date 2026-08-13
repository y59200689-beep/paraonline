'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageOperators } from '@/lib/permissions';
import { UserCog, Plus, Shield, User, Mail, Trash2, Loader2, Check } from 'lucide-react';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { AsyncState } from '@/components/admin/ui/AsyncState';
import { requestJson } from '@/lib/request-json';

interface Operator {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

const ROLES_INFO: Record<string, { label: string; desc: string; color: string }> = {
  owner: { label: 'Propriétaire', desc: 'Accès total à la boutique, sécurité, intégrations et équipe.', color: '#8b5cf6' },
  manager: { label: 'Manager', desc: 'Gestion complète du catalogue, du contenu, des promotions et de la publication.', color: '#3b82f6' },
  content_editor: { label: 'Éditeur de contenu', desc: 'Gestion des pages, des bannières et des traductions. Soumet avant publication.', color: '#10b981' },
  catalogue_editor: { label: 'Éditeur catalogue', desc: 'Gestion des fiches produits, du stock et des catégories.', color: '#06b6d4' },
  logistician: { label: 'Logistique (Legacy)', desc: 'Gestion du traitement des commandes et expéditions.', color: '#f59e0b' },
  fulfilment: { label: 'Logistique / Expéditions', desc: 'Suivi et expédition des commandes uniquement.', color: '#f59e0b' },
  support: { label: 'Support Client', desc: 'Gestion des avis et de la relation client.', color: '#ec4899' },
  viewer: { label: 'Observateur', desc: 'Consultation en lecture seule du catalogue et des rapports.', color: '#64748b' },
};

export default function SettingsTeamPage() {
  const { currentUser, adminTheme } = useAdmin();
  const isDark = adminTheme === 'dark';
  const role = currentUser?.role ?? 'viewer';

  const canManage = canManageOperators(role as any);

  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('content_editor');
  const [adding, setAdding] = useState(false);

  const loadOperators = React.useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await requestJson<{ operators?: Operator[] }>('/api/admin/operators');
      setOperators(data.operators ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger l’équipe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (canManage) void loadOperators(); }, [canManage, loadOperators]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch('/api/admin/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole }),
      });
      if (res.ok) {
        const { operator } = await res.json();
        setOperators(prev => [...prev, operator]);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (op: Operator) => {
    const res = await fetch('/api/admin/operators', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: op.id, active: !op.active }),
    });
    if (res.ok) {
      setOperators(prev => prev.map(o => o.id === op.id ? { ...o, active: !op.active } : o));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '13px', padding: '8px 12px',
    borderRadius: 'var(--admin-radius)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: isDark ? '#475569' : '#94a3b8', display: 'block', marginBottom: '4px',
  };

  if (!canManage) {
    return <AsyncState kind="forbidden" description="Seul le propriétaire peut gérer les membres de l’équipe." />;
  }

  if (loading) {
    return <AsyncState kind="loading" />;
  }

  if (loadError) return <AsyncState kind="error" description={loadError} onRetry={loadOperators} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--admin-text-xl)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>Équipe & Rôles</h1>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
            Gérez les accès à l&apos;interface d&apos;administration et définissez les rôles de chaque collaborateur.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            fontSize: '12px', fontWeight: 700, borderRadius: 'var(--admin-radius)', border: 'none',
            cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
          }}
        >
          <Plus className="w-4 h-4" /> Ajouter un membre
        </button>
      </div>

      {/* Operators list */}
      <div style={{ borderRadius: 'var(--admin-radius-lg)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)', background: isDark ? 'rgba(255,255,255,0.01)' : '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px 100px', padding: '10px 16px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
          <span style={labelStyle}>Membre</span>
          <span style={labelStyle}>Rôle</span>
          <span style={labelStyle}>Statut</span>
          <span style={{ ...labelStyle, textAlign: 'right' }}>Actions</span>
        </div>

        {operators.map((op, idx) => {
          const roleCfg = ROLES_INFO[op.role] ?? ROLES_INFO.viewer;
          return (
            <div key={op.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px 100px', alignItems: 'center', padding: '12px 16px', borderBottom: idx < operators.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)') : 'none' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', margin: 0 }}>{op.name}</p>
                <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', margin: '2px 0 0' }}>{op.email}</p>
              </div>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', background: `${roleCfg.color}15`, color: roleCfg.color, border: `1px solid ${roleCfg.color}30` }}>
                  {roleCfg.label}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: op.active ? '#10b981' : '#f43f5e' }}>
                  {op.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                {op.role !== 'owner' && (
                  <button
                    onClick={() => handleToggleActive(op)}
                    style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {op.active ? 'Désactiver' : 'Activer'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role details reference */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#475569' : '#94a3b8', marginBottom: '12px' }}>Description des privilèges par rôle</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {Object.entries(ROLES_INFO).map(([rKey, info]) => (
            <div key={rKey} style={{ padding: '12px 14px', borderRadius: 'var(--admin-radius)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.01)' : '#f8fafc' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: info.color }}>{info.label}</span>
              <p style={{ fontSize: '11px', color: isDark ? '#475569' : '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>{info.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: 'var(--admin-radius-lg)', background: isDark ? 'hsl(224,28%,9%)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', margin: '0 0 16px' }}>Ajouter un membre d&apos;équipe</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Adresse Email</label>
                <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rôle attribué</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={inputStyle}>
                  {Object.entries(ROLES_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 600, border: 'none', background: 'none', color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={adding} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, borderRadius: 'var(--admin-radius)', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', cursor: adding ? 'default' : 'pointer' }}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
