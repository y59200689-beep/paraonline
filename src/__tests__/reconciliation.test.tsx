// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OrdersTab from '../components/admin/OrdersTab';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/admin/orders'
}));
import { SettingsProvider } from '../context/SettingsContext';
import { UiProvider } from '../context/UiContext';
import { LanguageProvider } from '../context/LanguageContext';
import { LoyaltyProvider } from '../context/LoyaltyContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { ProductsProvider } from '../context/ProductsContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AmPmProvider } from '../context/AmPmContext';
import { CompareProvider } from '../context/CompareContext';
import { WishlistProvider } from '../context/WishlistContext';
import { AdminProvider } from '../context/AdminContext';
import { AdminUIProvider, useAdminUI } from '../app/admin/AdminUIContext';

// Wrap all contexts
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <UiProvider>
        <LanguageProvider>
          <LoyaltyProvider>
            <ThemeProvider>
              <ProductsProvider>
                <CartProvider>
                  <CurrencyProvider>
                    <AmPmProvider>
                      <CompareProvider>
                        <WishlistProvider>
                          <AdminProvider>
                            <AdminUIProvider>
                              {children}
                            </AdminUIProvider>
                          </AdminProvider>
                        </WishlistProvider>
                      </CompareProvider>
                    </AmPmProvider>
                  </CurrencyProvider>
                </CartProvider>
              </ProductsProvider>
            </ThemeProvider>
          </LoyaltyProvider>
        </LanguageProvider>
      </UiProvider>
    </SettingsProvider>
  );
};

// Component that forces activeTab to orders and ordersSubTab to reconciliation
const ReconciliationTestComponent: React.FC = () => {
  const { setOrdersSubTab } = useAdminUI();
  React.useEffect(() => {
    setOrdersSubTab('reconciliation');
  }, [setOrdersSubTab]);

  return <OrdersTab />;
};

describe('Moroccan COD Financial Reconciliation Ledger tests', () => {
  const mockOrders = [
    {
      order_id: 'PO-1001',
      customer_name: 'Ahmed Bennani',
      phone_number: '0661223344',
      address: 'Route de la Plage, Villa 12',
      city: 'Tanger',
      items: [],
      subtotal: 350,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 350,
      status: 'Shipped',
      tracking_number: 'YAL123456',
      courier: 'Yalidine',
      reconciled: false
    },
    {
      order_id: 'PO-1002',
      customer_name: 'Fatima Zahra',
      phone_number: '0661556677',
      address: 'Rue de Fez, Apt 3',
      city: 'Rabat',
      items: [],
      subtotal: 500,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 500,
      status: 'Shipped',
      tracking_number: 'YAL789012',
      courier: 'Yalidine',
      reconciled: false
    },
    {
      order_id: 'PO-1003',
      customer_name: 'Youssef El Amrani',
      phone_number: '0661889900',
      address: 'Boulevard Zerktouni, No 45',
      city: 'Casablanca',
      items: [],
      subtotal: 120,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 120,
      status: 'Delivered',
      tracking_number: 'YAL345678',
      courier: 'Yalidine',
      reconciled: true
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch calls to return orders list and settings
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
      
      if (urlStr.includes('/api/admin/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, user: { id: 'admin-1', name: 'Admin', username: 'admin', role: 'owner' } }),
        } as Response);
      }
      if (urlStr.includes('/api/admin/orders') && !urlStr.includes('/reconcile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, orders: mockOrders }),
        } as Response);
      }
      if (urlStr.includes('/api/admin/orders/reconcile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });
  });

  it('should render the reconciliation upload view initially', async () => {
    await act(async () => {
      render(<ReconciliationTestComponent />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(screen.getByText(/Rapprochement Financier des Settlements COD/i)).toBeDefined();
    expect(screen.getByText(/Fichier de règlement \(Settlement\)/i)).toBeDefined();
    expect(screen.getByText(/Choisir un fichier CSV/i)).toBeDefined();
  });

  it('should parse simulated CSV settlement content and identify matching classifications', async () => {
    await act(async () => {
      render(<ReconciliationTestComponent />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Simulating file drag and drop/upload
    const file = new File([
      `Tracking,Commande,Amount COD,Frais,Status\n` +
      `YAL123456,PO-1001,350,35,Livré\n` +  // Perfect Match
      `YAL789012,PO-1002,400,35,Livré\n` +  // Amount Mismatch (Expect 500 vs CSV 400)
      `YAL345678,PO-1003,120,35,Livré\n` +  // Already Reconciled
      `YAL999999,PO-9999,200,35,Livré\n`     // Not Found
    ], 'settlement.csv', { type: 'text/csv' });

    const input = screen.getByLabelText(/Choisir un fichier CSV/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      // wait for FileReader onLoad
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Verify stats updates
    expect(screen.getByText(/Paiement Total Reçu/i)).toBeDefined();
    expect(screen.getByText(/Frais de Livraison Retenus/i)).toBeDefined();
    
    // Verify row classifications
    expect(screen.getAllByText('Parfait')).toBeDefined();
    expect(screen.getByText('Écart Montant')).toBeDefined();
    expect(screen.getByText('Réconcilié')).toBeDefined();
    expect(screen.getByText('Non Trouvé')).toBeDefined();
    
    // Check discrepancy messages
    expect(screen.getByText(/Écart montant: Commande \(500 DH\) vs Reçu \(400 DH\)/i)).toBeDefined();
    expect(screen.getByText(/Déjà réconciliée/i)).toBeDefined();
  });
});
