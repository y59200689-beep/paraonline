// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import { useAdmin } from '../context/AdminContext';

// Mock the useAdmin hook
vi.mock('../context/AdminContext', () => ({
  useAdmin: vi.fn()
}));

describe('Admin Security Audit logs and Exporter tests', () => {
  const mockLoadAuditLogs = vi.fn();
  const mockLoadOperatorsList = vi.fn();

  const mockAuditLogs = [
    { id: 1, date: '2026-07-13T10:00:00Z', action: 'Connexion Réussie', details: 'Opérateur admin connecté.' },
    { id: 2, date: '2026-07-13T11:30:00Z', action: 'Créer Produit', details: 'Produit #123 a été créé.' },
    { id: 3, date: '2026-07-13T12:00:00Z', action: 'Suppression Avis', details: 'Avis #456 supprimé.' }
  ];

  const mockOperatorsList = [
    { id: 1, name: 'Youssef', username: 'youssef', role: 'owner' },
    { id: 2, name: 'Support Staff', username: 'support_user', role: 'support' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should restrict access and show RBAC Guard Panel if user is not owner', () => {
    vi.mocked(useAdmin).mockReturnValue({
      adminTheme: 'dark',
      currentUser: { username: 'support_user', role: 'support', name: 'Support Staff' },
      auditLogs: mockAuditLogs,
      operatorsList: mockOperatorsList,
      loadAuditLogs: mockLoadAuditLogs,
      loadOperatorsList: mockLoadOperatorsList
    } as any);

    render(<AuditLogsTab />);
    expect(screen.getByText('Accès Restreint')).toBeDefined();
    expect(screen.getByText(/Seuls les administrateurs avec le rôle/)).toBeDefined();
  });

  it('should render table view, stats cards, and action details if user is owner', () => {
    vi.mocked(useAdmin).mockReturnValue({
      adminTheme: 'dark',
      currentUser: { username: 'youssef', role: 'owner', name: 'Youssef' },
      auditLogs: mockAuditLogs,
      operatorsList: mockOperatorsList,
      loadAuditLogs: mockLoadAuditLogs,
      loadOperatorsList: mockLoadOperatorsList
    } as any);

    render(<AuditLogsTab />);

    // Check stats cards are rendered
    expect(screen.getByText('Total Événements')).toBeDefined();
    expect(screen.getByText('Accès & Sécurité')).toBeDefined();
    expect(screen.getByText('Modifs Catalogue')).toBeDefined();
    expect(screen.getByText('Actions Critiques')).toBeDefined();

    // Check table rows are rendered
    expect(screen.getByText('Connexions, MFA & privilèges staff')).toBeDefined();
    expect(screen.getByText('Opérateur admin connecté.')).toBeDefined();
    expect(screen.getByText('Produit #123 a été créé.')).toBeDefined();
    expect(screen.getByText('Avis #456 supprimé.')).toBeDefined();
  });

  it('should allow toggling between table and timeline layouts', () => {
    vi.mocked(useAdmin).mockReturnValue({
      adminTheme: 'dark',
      currentUser: { username: 'youssef', role: 'owner', name: 'Youssef' },
      auditLogs: mockAuditLogs,
      operatorsList: mockOperatorsList,
      loadAuditLogs: mockLoadAuditLogs,
      loadOperatorsList: mockLoadOperatorsList
    } as any);

    render(<AuditLogsTab />);

    // Click Chronologie
    const timelineBtn = screen.getByRole('button', { name: /Chronologie/i });
    fireEvent.click(timelineBtn);

    // Timeline view elements should be present
    expect(screen.getAllByText('Inspecter').length).toBeGreaterThan(0);
  });

  it('should open compliance export hub modal, allow changing title and trigger export', () => {
    vi.mocked(useAdmin).mockReturnValue({
      adminTheme: 'light',
      currentUser: { username: 'youssef', role: 'owner', name: 'Youssef' },
      auditLogs: mockAuditLogs,
      operatorsList: mockOperatorsList,
      loadAuditLogs: mockLoadAuditLogs,
      loadOperatorsList: mockLoadOperatorsList
    } as any);

    // Mock window.open for PDF export
    const mockOpen = vi.fn().mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn()
      }
    });
    vi.stubGlobal('open', mockOpen);

    render(<AuditLogsTab />);

    // Click on Exporter les logs
    const exportBtn = screen.getByRole('button', { name: /Exporter les logs/i });
    fireEvent.click(exportBtn);

    // Modal should be visible
    expect(screen.getByText('Exportateur de Conformité')).toBeDefined();
    expect(screen.getByText('PDF Rapport (.pdf)')).toBeDefined();

    // Change title
    const titleInput = screen.getByPlaceholderText(/Ex: RAPPORT DE CONFORMITÉ TRIMESTRIEL/i);
    fireEvent.change(titleInput, { target: { value: 'RAPPORT TRIMESTRIEL COMPLIANCE Q2' } });

    // Click on download
    const downloadBtn = screen.getByRole('button', { name: /Télécharger le document/i });
    fireEvent.click(downloadBtn);

    // Verify print window is opened
    expect(mockOpen).toHaveBeenCalled();
  });
});
