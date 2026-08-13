import type { Metadata } from 'next';
import { OrderCompletionClient } from '@/components/checkout/OrderCompletionClient';

export const metadata: Metadata = {
  title: 'Paiement interrompu | Para Officinal',
  robots: { index: false, follow: false },
};

export default async function FailurePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const orderId = String(query.orderId || query.order || '');
  const token = String(query.token || '');
  return <OrderCompletionClient mode="failure" orderId={orderId} initialToken={token} />;
}
