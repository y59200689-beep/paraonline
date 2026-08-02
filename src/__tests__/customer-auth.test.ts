import { describe, expect, it } from 'vitest';
import { customerAuthErrorMessage } from '@/lib/customer-auth';

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
