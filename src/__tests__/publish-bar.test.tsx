// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const admin = vi.hoisted(() => ({ role: 'owner', theme: 'light' }));
vi.mock('@/context/AdminContext', () => ({ useAdmin: () => ({ currentUser: { role: admin.role }, adminTheme: admin.theme }) }));
import { StickyPublishBar } from '@/components/admin/ui/StickyPublishBar';
const props = () => ({ status: 'published' as const, isDirty: true, isSaving: false, onSaveDraft: vi.fn(), onPreview: vi.fn(), onPublish: vi.fn() });
beforeEach(() => { admin.role = 'owner'; admin.theme = 'light'; });
afterEach(cleanup);
it('keeps draft, preview and update callbacks separate', () => {
  const callbacks = props();
  render(<StickyPublishBar {...callbacks} />);
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le brouillon' }));
  fireEvent.click(screen.getByRole('button', { name: 'Prévisualiser' }));
  fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));
  expect(callbacks.onSaveDraft).toHaveBeenCalledTimes(1);
  expect(callbacks.onPreview).toHaveBeenCalledTimes(1);
  expect(callbacks.onPublish).toHaveBeenCalledTimes(1);
});
it('disables the three main actions during saving', () => {
  const callbacks = props();
  render(<StickyPublishBar {...callbacks} isSaving />);
  for (const button of screen.getAllByRole('button')) {
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
  }
  expect(callbacks.onPublish).not.toHaveBeenCalled();
  expect(callbacks.onSaveDraft).not.toHaveBeenCalled();
  expect(callbacks.onPreview).not.toHaveBeenCalled();
});
it('retains editor approval and viewer restrictions', () => {
  admin.role = 'editor';
  const { rerender } = render(<StickyPublishBar {...props()} onSchedule={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Soumettre pour validation' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Planifier' })).toBeNull();
  admin.role = 'viewer';
  rerender(<StickyPublishBar {...props()} />);
  expect(screen.queryByRole('button', { name: 'Soumettre pour validation' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Mettre à jour' })).toBeNull();
});
it('preserves scheduling and makes the datetime field labelled', () => {
  const onSchedule = vi.fn();
  render(<StickyPublishBar {...props()} onSchedule={onSchedule} />);
  fireEvent.click(screen.getByRole('button', { name: 'Planifier' }));
  expect((screen.getByRole('button', { name: 'Planifier la publication' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Date et heure de publication'), { target: { value: '2026-09-10T14:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Planifier la publication' }));
  expect(onSchedule).toHaveBeenCalledWith('2026-09-10T14:00');
  expect(screen.queryByLabelText('Date et heure de publication')).toBeNull();
});
it('announces unsaved and saved state in both themes', () => {
  admin.theme = 'dark';
  const { rerender } = render(<StickyPublishBar {...props()} />);
  expect(screen.getByRole('status').textContent).toContain('Modifications non enregistrées');
  rerender(<StickyPublishBar {...props()} isDirty={false} lastSavedAt={new Date('2026-09-08T12:00:00')} />);
  expect(screen.getByRole('status').textContent).toContain('Enregistré à');
});
