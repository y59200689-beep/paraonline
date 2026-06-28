// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RestockForecastingTab from '../components/admin/RestockForecastingTab';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/admin/catalog'
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
import { AdminUIProvider } from '../app/admin/AdminUIContext';

// Mock window.print
window.print = vi.fn();

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

describe('Smart Restock Forecasting & Supplier POs tests', () => {
  const mockProducts = [
    {
      id: 15,
      title: "Anua Heartleaf Pore Control Cleansing Oil 200ml",
      vendor: "Anua",
      price: 260.00,
      comparePrice: 360.00,
      category: "kbeauty",
      tags: ["visage"],
      rating: 4.9,
      reviews: 98,
      description: "Huile démaquillante",
      ingredients: "Heartleaf",
      usage: "Masser",
      stock: 10,
      sku: "SKU-ANUA-015",
      buyingCost: 156
    },
    {
      id: 13,
      title: "Beauty of Joseon Relief Sun Rice Probiotics SPF 50+",
      vendor: "Beauty of Joseon",
      price: 229.00,
      comparePrice: 320.00,
      category: "kbeauty",
      tags: ["visage"],
      rating: 4.9,
      reviews: 142,
      description: "Soin photoprotecteur",
      ingredients: "Riz",
      usage: "Appliquer",
      stock: 50,
      sku: "SKU-BEAUTYOFJOSEON-013",
      buyingCost: 137
    },
    {
      id: 14,
      title: "Anua Niacinamide 10% + TXA 4% Dark Spot Correcting Serum 30ml",
      vendor: "Anua",
      price: 289.00,
      comparePrice: 320.00,
      category: "kbeauty",
      tags: ["visage"],
      rating: 4.8,
      reviews: 79,
      description: "Sérum",
      ingredients: "Niacinamide",
      usage: "Appliquer",
      stock: 2,
      sku: "SKU-ANUA-014",
      buyingCost: 173
    }
  ];

  const nowIso = new Date().toISOString();
  // Build recent orders within 30 days
  const mockOrders = [
    {
      order_id: 'PO-1001',
      customer_name: 'Client 1',
      phone_number: '0661223344',
      address: 'Route A',
      city: 'Casablanca',
      items: [
        { id: 15, title: "Anua Heartleaf Pore Control Cleansing Oil 200ml", quantity: 5, price: 260.00 },
        { id: 14, title: "Anua Niacinamide 10% + TXA 4% Dark Spot Correcting Serum 30ml", quantity: 1, price: 289.00 }
      ],
      subtotal: 1589,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 1589,
      status: 'Delivered',
      created_at: nowIso,
      date: nowIso
    },
    {
      order_id: 'PO-1002',
      customer_name: 'Client 2',
      phone_number: '0661556677',
      address: 'Route B',
      city: 'Rabat',
      items: [
        { id: 15, title: "Anua Heartleaf Pore Control Cleansing Oil 200ml", quantity: 10, price: 260.00 },
        { id: 14, title: "Anua Niacinamide 10% + TXA 4% Dark Spot Correcting Serum 30ml", quantity: 2, price: 289.00 }
      ],
      subtotal: 3178,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 3178,
      status: 'Shipped',
      created_at: nowIso,
      date: nowIso
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch calls for auth, orders and products API
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
      
      if (urlStr.includes('/api/admin/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            user: { id: 'admin-1', name: 'Logistician Bob', username: 'bob', role: 'logistician' } 
          }),
        } as Response);
      }
      if (urlStr.includes('/api/admin/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, orders: mockOrders }),
        } as Response);
      }
      if (urlStr.includes('/api/admin/products') || urlStr.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, products: mockProducts }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });
  });

  it('renders the Forecasting view with computed sales velocity, coverage days, and status colors', async () => {
    await act(async () => {
      render(<RestockForecastingTab />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check header texts
    expect(screen.getByText(/Ravitaillement & Vélocité de Vente/i)).toBeDefined();
    expect(screen.getByText(/Moteur de Prévision/i)).toBeDefined();

    // Velocity checks:
    // Anua Cleansing Oil (id: 15) has 15 units sold over 30 days -> 15/30 = 0.5 units/day = 3.5 units/week.
    // Beauty of Joseon (id: 13) has 0 units sold.
    // Anua Dark Spot (id: 14) has 3 units sold over 30 days -> 3/30 = 0.1 units/day = 0.7 units/week.
    
    // Check that velocities are rendered
    expect(screen.getByText('3.5 u')).toBeDefined();
    expect(screen.getByText('0.7 u')).toBeDefined();

    // Stock checks:
    // Anua Cleansing Oil stock is 10. Velocity is 0.5/day. Coverage = 10 / 0.5 = 20 days.
    // Lead time is 30 days. Coverage (20) <= Lead Time (30) -> CRITIQUE badge.
    // Suggested restock (target 90 days) = Math.ceil(0.5 * 90) - 10 = 45 - 10 = 35.
    expect(screen.getAllByText('20 jours').length).toBe(2);
    expect(screen.getByText('+35')).toBeDefined();

    // Anua Dark Spot stock is 2. Velocity is 0.1/day. Coverage = 2 / 0.1 = 20 days.
    // Suggested restock (target 90) = Math.ceil(0.1 * 90) - 2 = 9 - 2 = 7.
    expect(screen.getByText('+7')).toBeDefined();
    
    // Check for Critical count (both Anua items have coverage <= 30 days)
    const alertCriticalCards = screen.queryAllByText('CRITIQUE');
    expect(alertCriticalCards.length).toBeGreaterThan(0);
  });

  it('filters products by vendor and allows selecting products to open the PO creation wizard', async () => {
    await act(async () => {
      render(<RestockForecastingTab />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Select Vendor Anua
    const selects = screen.getAllByRole('combobox');
    const vendorSelect = selects.find(select => 
      Array.from((select as HTMLSelectElement).options).some(opt => opt.value === 'Anua')
    );
    expect(vendorSelect).toBeDefined();

    await act(async () => {
      fireEvent.change(vendorSelect!, { target: { value: 'Anua' } });
    });

    // Find and check the "Select All" checkbox or individual checkboxes
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(0);

    // Check the first product checkbox (Anua Cleansing Oil)
    await act(async () => {
      fireEvent.click(checkboxes[1]); // checkboxes[0] is the header bulk check
    });

    // Generate PO button should now be active
    const poBtn = screen.getByText(/Générer un PO/i);
    expect(poBtn.removeAttribute).toBeDefined();

    await act(async () => {
      fireEvent.click(poBtn);
    });

    // Wizard modal should be open now
    expect(screen.getByText(/Créateur de Bon de Commande/i)).toBeDefined();
    expect(screen.getByText(/Nom du Fournisseur/i)).toBeDefined();

    // Verify pre-populated values
    expect(screen.getByDisplayValue('Anua Distributor')).toBeDefined();
    expect(screen.getByDisplayValue('orders@anua.com')).toBeDefined();

    // Total calculations: 1 item selected with suggested restock qty 35 and unit buying cost 156.
    // Subtotal = 35 * 156 = 5460 DH.
    // VAT = 20% of 5460 = 1092 DH.
    // Grand Total = 5460 + 1092 = 6552 DH.
    expect(screen.getAllByText('5460.00 DH').length).toBe(2);
    expect(screen.getByText('1092.00 DH')).toBeDefined();
    expect(screen.getByText('6552.00 DH')).toBeDefined();
  });
});
