// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RFMTab from '../components/admin/RFMTab';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/admin/crm'
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

describe('Dynamic Customer RFM Segmentation tests', () => {
  const now = new Date();
  
  // Calculate relative timestamps
  const dateToday = now.toISOString();
  
  const date45DaysAgo = new Date();
  date45DaysAgo.setDate(now.getDate() - 45);
  const date45DaysAgoIso = date45DaysAgo.toISOString();
  
  const date200DaysAgo = new Date();
  date200DaysAgo.setDate(now.getDate() - 200);
  const date200DaysAgoIso = date200DaysAgo.toISOString();

  const mockOrders = [
    // Alice: Champion (5 orders, 2500 DH total, last order today)
    {
      order_id: 'AL-1',
      customer_name: 'Alice Cooper',
      phone_number: '0661111111',
      address: 'Addr A',
      city: 'Casablanca',
      items: [],
      subtotal: 500,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 500,
      status: 'Delivered',
      created_at: dateToday,
      date: dateToday
    },
    { order_id: 'AL-2', customer_name: 'Alice Cooper', phone_number: '0661111111', address: 'A', city: 'C', items: [], subtotal: 500, discount_amount: 0, applied_coupon: null, gift_item: null, total: 500, status: 'Delivered', created_at: dateToday, date: dateToday },
    { order_id: 'AL-3', customer_name: 'Alice Cooper', phone_number: '0661111111', address: 'A', city: 'C', items: [], subtotal: 500, discount_amount: 0, applied_coupon: null, gift_item: null, total: 500, status: 'Delivered', created_at: dateToday, date: dateToday },
    { order_id: 'AL-4', customer_name: 'Alice Cooper', phone_number: '0661111111', address: 'A', city: 'C', items: [], subtotal: 500, discount_amount: 0, applied_coupon: null, gift_item: null, total: 500, status: 'Delivered', created_at: dateToday, date: dateToday },
    { order_id: 'AL-5', customer_name: 'Alice Cooper', phone_number: '0661111111', address: 'A', city: 'C', items: [], subtotal: 500, discount_amount: 0, applied_coupon: null, gift_item: null, total: 500, status: 'Delivered', created_at: dateToday, date: dateToday },

    // Bob: Besoin d'attention (3 orders, 600 DH, last order 45 days ago)
    {
      order_id: 'BO-1',
      customer_name: 'Bob Marley',
      phone_number: '0662222222',
      address: 'Addr B',
      city: 'Rabat',
      items: [],
      subtotal: 200,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 200,
      status: 'Delivered',
      created_at: date45DaysAgoIso,
      date: date45DaysAgoIso
    },
    { order_id: 'BO-2', customer_name: 'Bob Marley', phone_number: '0662222222', address: 'B', city: 'R', items: [], subtotal: 200, discount_amount: 0, applied_coupon: null, gift_item: null, total: 200, status: 'Delivered', created_at: date45DaysAgoIso, date: date45DaysAgoIso },
    { order_id: 'BO-3', customer_name: 'Bob Marley', phone_number: '0662222222', address: 'B', city: 'R', items: [], subtotal: 200, discount_amount: 0, applied_coupon: null, gift_item: null, total: 200, status: 'Delivered', created_at: date45DaysAgoIso, date: date45DaysAgoIso },

    // Charlie: À Risque (4 orders, 1200 DH, last order 200 days ago)
    {
      order_id: 'CH-1',
      customer_name: 'Charlie Chaplin',
      phone_number: '0663333333',
      address: 'Addr C',
      city: 'Fez',
      items: [],
      subtotal: 300,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 300,
      status: 'Delivered',
      created_at: date200DaysAgoIso,
      date: date200DaysAgoIso
    },
    { order_id: 'CH-2', customer_name: 'Charlie Chaplin', phone_number: '0663333333', address: 'C', city: 'F', items: [], subtotal: 300, discount_amount: 0, applied_coupon: null, gift_item: null, total: 300, status: 'Delivered', created_at: date200DaysAgoIso, date: date200DaysAgoIso },
    { order_id: 'CH-3', customer_name: 'Charlie Chaplin', phone_number: '0663333333', address: 'C', city: 'F', items: [], subtotal: 300, discount_amount: 0, applied_coupon: null, gift_item: null, total: 300, status: 'Delivered', created_at: date200DaysAgoIso, date: date200DaysAgoIso },
    { order_id: 'CH-4', customer_name: 'Charlie Chaplin', phone_number: '0663333333', address: 'C', city: 'F', items: [], subtotal: 300, discount_amount: 0, applied_coupon: null, gift_item: null, total: 300, status: 'Delivered', created_at: date200DaysAgoIso, date: date200DaysAgoIso },

    // Diana: Perdus / Endormis (1 order, 100 DH, last order 200 days ago)
    {
      order_id: 'DI-1',
      customer_name: 'Diana Prince',
      phone_number: '0664444444',
      address: 'Addr D',
      city: 'Tanger',
      items: [],
      subtotal: 100,
      discount_amount: 0,
      applied_coupon: null,
      gift_item: null,
      total: 100,
      status: 'Delivered',
      created_at: date200DaysAgoIso,
      date: date200DaysAgoIso
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch calls
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');
      
      if (urlStr.includes('/api/admin/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            user: { id: 'admin-1', name: 'Owner Alice', username: 'owner', role: 'owner' } 
          }),
        } as Response);
      }
      if (urlStr.includes('/api/admin/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, orders: mockOrders }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    // Mock clipboard writeText
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
  });

  it('renders the RFM metrics dashboard and client lists correctly classified', async () => {
    await act(async () => {
      render(<RFMTab />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Header validations
    expect(screen.getByText(/Analyse Comportementale RFM des Clients/i)).toBeDefined();
    
    // Customer lists checking
    expect(screen.getByText('Alice Cooper')).toBeDefined();
    expect(screen.getByText('Bob Marley')).toBeDefined();
    expect(screen.getByText('Charlie Chaplin')).toBeDefined();
    expect(screen.getByText('Diana Prince')).toBeDefined();

    // Segment class validations
    // Alice Cooper is classified as Champions
    expect(screen.getAllByText('Champions').length).toBeGreaterThan(0);
    // Diana Prince is classified as Perdus
    expect(screen.getAllByText('Perdus / Endormis').length).toBeGreaterThan(0);
    // Charlie Chaplin is classified as À Risque
    expect(screen.getAllByText('À Risque').length).toBeGreaterThan(0);
    // Bob Marley is classified as Besoin d'attention
    expect(screen.getAllByText("Besoin d'attention").length).toBeGreaterThan(0);
  });

  it('copies Moroccan formatted E.164 phone numbers to clipboard', async () => {
    await act(async () => {
      render(<RFMTab />, { wrapper: AllProvidersWrapper });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const copyBtn = screen.getByText(/Copier numéros WhatsApp/i);
    expect(copyBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // Expected comma separated E.164 (based on order of totalSpend descending)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '212661111111,212663333333,212662222222,212664444444'
    );
  });

  it('allows starting a promotional campaign simulation', async () => {
    // Enable fake timers
    vi.useFakeTimers();

    await act(async () => {
      render(<RFMTab />, { wrapper: AllProvidersWrapper });
    });

    // Resolve initial data load timeouts in component mounting
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Select Champions segment filter card (index 0 is Champions card)
    const segmentButtons = screen.getAllByRole('button');
    const championsBtn = segmentButtons.find(btn => btn.textContent?.includes('Champions'));
    expect(championsBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(championsBtn!);
    });

    // Only Alice is now in the filtered lists
    const diffBtn = screen.getByText(/Diffuser Campagne/i);
    expect(diffBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(diffBtn);
    });

    // Verify modal is open
    expect(screen.getByText(/Simulateur de Campagne WhatsApp RFM/i)).toBeDefined();

    const startBtn = screen.getByText(/Lancer la Diffusion/i);
    expect(startBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(startBtn);
    });

    // Advance fake timers to run through simulation intervals
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Campagne de diffusion complétée/i)).toBeDefined();

    vi.useRealTimers();
  });
});
