// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OrderStatusPicker } from '../components/admin/OrdersTab';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('OrderStatusPicker hook order and read-only permissions', () => {
  it('can transition between read-only and editable renders without changing hook order', () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const onChange = vi.fn();

    const { rerender } = render(
      <OrderStatusPicker value="Pending" onChange={onChange} readOnly />
    );

    expect(screen.getByText('En attente').tagName).toBe('SPAN');
    expect(addListener).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addListener).not.toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(<OrderStatusPicker value="Pending" onChange={onChange} readOnly={false} />);

    expect(screen.getByRole('button', { name: /En attente/ })).not.toBeNull();
    expect(addListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    rerender(<OrderStatusPicker value="Pending" onChange={onChange} readOnly />);

    expect(screen.getByText('En attente').tagName).toBe('SPAN');
    expect(removeListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('order lifecycle status choices', () => {
  it.each([
    ['Pending', 'En attente'],
    ['Cancelled', 'Annulée'],
    ['Confirmed', 'Confirmée'],
    ['Paid', 'Paid'],
    ['Shipped', 'Expédiée'],
    ['Delivered', 'Livrée'],
    ['Pending Payment', 'Pending Payment'],
    ['Returned', 'Retournée'],
  ])('allows every status from %s', (value, label) => {
    render(<OrderStatusPicker value={value} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    const options = screen.getAllByRole('option');
    expect(options.map(option => option.querySelector('span.block')?.textContent)).toEqual([
      'En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée', 'Retournée',
    ]);
    expect(options.every(option => !option.hasAttribute('disabled'))).toBe(true);
  });

  it('keeps the menu beside its status button when it opens above', () => {
    const onChange = vi.fn();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 700, bottom: 730, left: 500, right: 600, width: 100, height: 30,
      x: 500, y: 700, toJSON: () => ({}),
    });
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 1200);

    render(<OrderStatusPicker value="Shipped" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expédiée' }));

    const menu = screen.getByRole('listbox');
    expect(menu.style.top).toBe('692px');
    expect(menu.style.left).toBe('500px');
    expect(menu.style.transform).toBe('translateY(-100%)');
    fireEvent.click(screen.getByRole('option', { name: /Expédiée/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Expédiée' }));
    fireEvent.click(screen.getByRole('option', { name: /Livrée/ }));
    expect(onChange).toHaveBeenCalledWith('Delivered');
    vi.unstubAllGlobals();
  });
});
