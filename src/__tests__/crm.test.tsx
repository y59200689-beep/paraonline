// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CRMTab from '../components/admin/CRMTab';
import { useAdmin } from '../context/AdminContext';

// Mock the useAdmin hook
vi.mock('../context/AdminContext', () => ({
  useAdmin: vi.fn()
}));

// Mock the useAdminUI hook
vi.mock('../app/admin/AdminUIContext', () => ({
  useAdminUI: () => ({
    crmSubTab: 'diagnostics',
    setCrmSubTab: vi.fn()
  })
}));

// Mock Settings Context
vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { loyaltyPointsPerDh: 1 },
    saveSettings: vi.fn()
  })
}));

// Mock UI Context
vi.mock('../context/UiContext', () => ({
  useUi: () => ({
    showToast: vi.fn()
  })
}));

describe('CRM Skin Diagnostics Hotspots Visualizer tests', () => {
  const mockDiagnostics = [
    {
      id: 1,
      date: '2026-07-13T10:00:00Z',
      skinType: 'Gras',
      concern: 'Acné',
      sunExposure: 'Forte',
      phone: '0661112233'
    },
    {
      id: 2,
      date: '2026-07-13T12:00:00Z',
      skinType: 'Sec',
      concern: 'Sécheresse',
      sunExposure: 'Faible',
      phone: '0661998877'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the diagnostics lists and open visual concern hotspots modal on click', () => {
    vi.mocked(useAdmin).mockReturnValue({
      adminTheme: 'dark',
      crmCustomers: [],
      diagnosticsList: mockDiagnostics,
      leadsList: [],
      diagnosticsStats: {
        skinTypes: { Gras: 1, Sec: 1 },
        concerns: { Acné: 1, Sécheresse: 1 },
        sunExposures: { Forte: 1, Faible: 1 }
      },
      products: []
    } as any);

    render(<CRMTab />);

    // Table headers should load
    expect(screen.getByText('Type de Peau')).toBeDefined();
    expect(screen.getByText('Préoccupation principale')).toBeDefined();

    // Check rows loaded
    expect(screen.getAllByText('Gras')[0]).toBeDefined();
    expect(screen.getAllByText('Sec')[0]).toBeDefined();

    // Diagnostics specific concerns rendered
    expect(screen.getAllByText('Acné')[0]).toBeDefined();
    expect(screen.getAllByText('Sécheresse')[0]).toBeDefined();

    // Find and click the first row's "Voir" button
    const voirButtons = screen.getAllByRole('button', { name: /Voir/i });
    expect(voirButtons.length).toBe(2);
    fireEvent.click(voirButtons[0]);

    // Modal should be open
    expect(screen.getByText('Profil Cutané & Diagnostic de Peau')).toBeDefined();
    expect(screen.getByText('Date du diagnostic')).toBeDefined();
    
    // Check face hotspots label is displayed in modal
    expect(screen.getByText('Hotspots Acné / Éruption active')).toBeDefined();
    expect(screen.getByText('T-Zone Grasse')).toBeDefined();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Fermer/i });
    fireEvent.click(closeBtn);

    // Modal should be closed (visualizer title should be gone)
    expect(screen.queryByText('Profil Cutané & Diagnostic de Peau')).toBeNull();
  });
});
