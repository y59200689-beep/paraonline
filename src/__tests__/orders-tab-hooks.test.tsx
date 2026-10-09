// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
