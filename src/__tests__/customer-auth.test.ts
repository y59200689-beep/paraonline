import { describe, expect, it } from 'vitest';
import { customerAuthErrorMessage, resolveCustomerIdentity } from '@/lib/customer-auth';

describe('customerAuthErrorMessage', () => {
  it('turns the Supabase signup cooldown into useful French guidance', () => {
    expect(customerAuthErrorMessage('For security purposes, you can only request this after 55 seconds.'))
      .toBe('Un email de confirmation a déjà été demandé. Vérifiez votre boîte de réception et vos spams, ou réessayez dans 55 secondes.');
  });

  it('explains that an unconfirmed account already exists', () => {
    expect(customerAuthErrorMessage('Email not confirmed')).toContain('Votre compte existe');
  });

  it('preserves unknown provider errors', () => {
    expect(customerAuthErrorMessage('Unexpected provider error')).toBe('Unexpected provider error');
  });
});

describe('resolveCustomerIdentity', () => {
  it('uses auth metadata when an existing profile has no customer name', () => {
    expect(resolveCustomerIdentity(
      {
        id: 'customer-1',
        email: 'youssef@example.com',
        user_metadata: { name: '  Youssef Mahir  ' },
      },
      { name: null, phone: null },
    )).toMatchObject({ name: 'Youssef Mahir', email: 'youssef@example.com' });
  });

  it('supports full_name metadata used by external identity providers', () => {
    expect(resolveCustomerIdentity({
      id: 'customer-2',
      email: 'client@example.com',
      user_metadata: { full_name: 'Client Para' },
    }).name).toBe('Client Para');
  });

  it('keeps a non-empty profile name as the authoritative display name', () => {
    expect(resolveCustomerIdentity(
      {
        id: 'customer-3',
        email: 'client@example.com',
        user_metadata: { name: 'Metadata Name' },
      },
      { name: 'Profile Name' },
    ).name).toBe('Profile Name');
  });
});
