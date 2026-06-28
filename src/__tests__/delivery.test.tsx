// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartFooter } from '../components/cart/CartFooter';
import type { DeliverySettings } from '../context/SettingsContext';

const mockT = (key: string) => key;

describe('CartFooter Estimated Delivery', () => {
  it('should render estimated delivery header when no city rule matches', () => {
    const deliverySettings: DeliverySettings = {
      cutoffHour: 14,
      defaultDaysMin: 2,
      defaultDaysMax: 3,
      cityRules: [],
    };

    render(
      <CartFooter
        subtotal={200}
        discountAmount={0}
        dailyGiftName={null}
        shippingFee={20}
        total={220}
        language="FR"
        isRTL={false}
        step="checkout"
        onCheckout={() => {}}
        t={mockT}
        shippingCity="Oujda"
        deliverySettings={deliverySettings}
      />
    );

    // Should display delivery header label
    const el = screen.queryByText(/Livraison estimée/i);
    expect(el).not.toBeNull();
  });

  it('should display city zone label when city matches a configured rule', () => {
    const deliverySettings: DeliverySettings = {
      cutoffHour: 14,
      defaultDaysMin: 2,
      defaultDaysMax: 4,
      cityRules: [
        { city: 'Casablanca', daysMin: 1, daysMax: 1 },
        { city: 'Marrakech', daysMin: 3, daysMax: 5 },
      ],
    };

    render(
      <CartFooter
        subtotal={200}
        discountAmount={0}
        dailyGiftName={null}
        shippingFee={20}
        total={220}
        language="FR"
        isRTL={false}
        step="checkout"
        onCheckout={() => {}}
        t={mockT}
        shippingCity="Casablanca"
        deliverySettings={deliverySettings}
      />
    );

    // City indicator badge/label should be visible
    const cityLabel = screen.queryByText(/Zone : Casablanca/i);
    expect(cityLabel).not.toBeNull();
  });

  it('should use default days when no city rule matches', () => {
    const deliverySettings: DeliverySettings = {
      cutoffHour: 14,
      defaultDaysMin: 2,
      defaultDaysMax: 4,
      cityRules: [
        { city: 'Casablanca', daysMin: 1, daysMax: 1 },
      ],
    };

    const { container } = render(
      <CartFooter
        subtotal={200}
        discountAmount={0}
        dailyGiftName={null}
        shippingFee={20}
        total={220}
        language="FR"
        isRTL={false}
        step="checkout"
        onCheckout={() => {}}
        t={mockT}
        shippingCity="Meknes"
        deliverySettings={deliverySettings}
      />
    );

    // No city zone label should be rendered since Meknes has no specific rule
    const cityLabel = screen.queryByText(/Zone : Casablanca/i);
    expect(cityLabel).toBeNull();
    // Delivery section should still be present
    expect(container.querySelector('span[class*="text-primary"]')).not.toBeNull();
  });
});
