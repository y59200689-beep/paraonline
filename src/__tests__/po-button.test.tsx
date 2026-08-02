// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Plus } from 'lucide-react';
import { PoButton } from '@/components/ui/PoButton';

describe('PoButton', () => {
  it('renders the selected variant and size with an accessible label', () => {
    render(
      <PoButton variant="secondary" size="lg" leftIcon={<Plus />}>
        Ajouter un produit
      </PoButton>
    );

    const button = screen.getByRole('button', { name: 'Ajouter un produit' });
    expect(button.className).toContain('po-ui-button--secondary');
    expect(button.className).toContain('po-ui-button--lg');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('disables repeated interaction and exposes busy state while loading', () => {
    const onClick = vi.fn();
    render(
      <PoButton loading loadingText="Enregistrement..." onClick={onClick}>
        Enregistrer
      </PoButton>
    );

    const button = screen.getByRole('button', { name: /Enregistrement/ });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('makes disabled links unfocusable and removes their destination', () => {
    render(
      <PoButton href="/admin/orders" disabled variant="text">
        Voir la commande
      </PoButton>
    );

    const link = screen.getByText('Voir la commande').closest('a');
    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
    expect(link?.hasAttribute('href')).toBe(false);
  });

  it('uses the accessible name as the tooltip for icon-only actions', () => {
    render(
      <PoButton iconOnly leftIcon={<Plus />} aria-label="Ajouter une adresse" />
    );

    const button = screen.getByRole('button', { name: 'Ajouter une adresse' });
    expect(button.getAttribute('title')).toBe('Ajouter une adresse');
  });
});
