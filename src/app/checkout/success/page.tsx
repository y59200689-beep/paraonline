import type { Metadata } from 'next';
import { OrderCompletionClient } from '@/components/checkout/OrderCompletionClient';

export const metadata: Metadata = {
  title: 'Commande confirmée | Para Officinal',
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const orderId = String(query.orderId || query.order || '');
  const token = String(query.token || '');
  return <OrderCompletionClient mode="success" orderId={orderId} initialToken={token} />;
}
